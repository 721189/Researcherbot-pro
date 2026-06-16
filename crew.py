import time
import logging
from typing import Optional, Callable
from app.config import settings
from app.models.research import ResearchResult
from app.models.agents import AgentStep
from app.agents.searcher import run_searcher
from app.agents.extractor import run_extractor
from app.agents.synthesizer import run_synthesizer
from app.services.self_healing import execute_with_fallback
from app.agents.tools import wikipedia_fallback_tool
from app.agents.extractor import plain_text_fallback
from app.agents.synthesizer import template_report_fallback

logger = logging.getLogger(__name__)

class ResearchCrew:
    def __init__(self, settings, audit_logger=None, observability=None):
        self.settings = settings
        self.audit_logger = audit_logger
        self.observability = observability

    async def run(self, topic: str, query_id: str, result_id: str, on_progress: Optional[Callable] = None) -> ResearchResult:
        """
        Runs the sequential multi-agent workflow: Search -> Extract -> Synthesize
        """
        start_time = time.perf_counter()
        
        overall_status = "completed"
        search_results = []
        extracted_data = {}
        report_markdown = ""
        citations = []
        
        async def _emit(agent_name: str, status: str, message: str, progress: float):
            if on_progress:
                step = AgentStep(
                    agent_name=agent_name,
                    status=status,
                    message=message,
                    progress=progress
                )
                await on_progress(step)

        try:
            # ---------------------------------------------------------
            # Step 1: Agent A - Searcher
            # ---------------------------------------------------------
            await _emit("searcher", "running", f"Searching web for '{topic}'...", 0.1)
            
            search_results, sr_retries, sr_status = await execute_with_fallback(
                fn=run_searcher,
                fallback_fn=wikipedia_fallback_tool,
                agent_name="searcher",
                audit_logger=self.audit_logger,
                result_id=result_id,
                topic=topic
            )
            
            if sr_status == "failed":
                overall_status = "failed"
                await _emit("searcher", "failed", "Search completely failed.", 0.3)
                raise ValueError("Web search failed.")
            elif sr_status == "partial_success":
                overall_status = "partial_success"
                await _emit("searcher", "warning", "Search succeeded with fallback.", 0.3)
            else:
                await _emit("searcher", "success", f"Found {len(search_results)} sources.", 0.3)

            # ---------------------------------------------------------
            # Step 2: Agent B - Extractor
            # ---------------------------------------------------------
            await _emit("extractor", "running", "Extracting structured data from sources...", 0.4)
            
            extracted_data, ex_retries, ex_status = await execute_with_fallback(
                fn=run_extractor,
                fallback_fn=plain_text_fallback,
                agent_name="extractor",
                audit_logger=self.audit_logger,
                result_id=result_id,
                search_results=search_results,
                topic=topic
            )
            
            if ex_status == "failed":
                overall_status = "failed"
                await _emit("extractor", "failed", "Data extraction failed.", 0.6)
                raise ValueError("Data extraction failed.")
            elif ex_status == "partial_success":
                if overall_status != "failed":
                    overall_status = "partial_success"
                await _emit("extractor", "warning", "Extraction succeeded with fallback.", 0.6)
            else:
                await _emit("extractor", "success", "Data extraction complete.", 0.6)

            # ---------------------------------------------------------
            # Step 3: Agent C - Synthesizer
            # ---------------------------------------------------------
            await _emit("synthesizer", "running", "Synthesizing comprehensive report...", 0.7)
            
            (report_markdown, citations), sy_retries, sy_status = await execute_with_fallback(
                fn=run_synthesizer,
                fallback_fn=template_report_fallback,
                agent_name="synthesizer",
                audit_logger=self.audit_logger,
                result_id=result_id,
                extracted_data=extracted_data,
                search_results=search_results,
                topic=topic
            )
            
            if sy_status == "failed":
                overall_status = "failed"
                await _emit("synthesizer", "failed", "Report synthesis failed.", 0.9)
                raise ValueError("Report synthesis failed.")
            elif sy_status == "partial_success":
                if overall_status != "failed":
                    overall_status = "partial_success"
                await _emit("synthesizer", "warning", "Synthesis succeeded with fallback template.", 0.9)
            else:
                await _emit("synthesizer", "success", "Report synthesis complete.", 0.9)

            await _emit("system", "success", "Workflow completed successfully.", 1.0)

        except Exception as e:
            logger.error(f"Workflow aborted: {e}")
            overall_status = "failed"
            await _emit("system", "error", f"Workflow aborted: {str(e)}", 1.0)

        finally:
            end_time = time.perf_counter()
            latency_ms = int((end_time - start_time) * 1000)
            
            # Simple mock cost calculation (would normally use observability service to extract tokens)
            cost_usd = 0.05 if overall_status != "failed" else 0.01

            return ResearchResult(
                id=result_id,
                query_id=query_id,
                search_results=search_results,
                extracted_data=extracted_data,
                synthesized_report=report_markdown,
                citations=citations,
                status=overall_status,
                latency_ms=latency_ms,
                cost_usd=cost_usd,
                created_at=None # Usually set by DB
            )
