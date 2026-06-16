import uuid
import asyncio
import logging
from typing import Optional, Dict
from app.config import settings
from app.db import supabase
from app.services.audit import AuditLogger
from app.services.observability import ObservabilityService
from app.agents.crew import ResearchCrew
from app.models.agents import AgentStep

logger = logging.getLogger(__name__)

class ResearchService:
    def __init__(self, settings, audit_logger: AuditLogger, observability: ObservabilityService):
        self.settings = settings
        self.audit_logger = audit_logger
        self.observability = observability
        
        # In-memory dictionary to hold SSE queues for active workflows
        # query_id -> asyncio.Queue
        self.active_streams: Dict[str, asyncio.Queue] = {}

    async def start_research(self, topic: str, title: Optional[str], user_id: Optional[str] = None) -> str:
        """
        Initializes a new research query and kicks off the background workflow.
        Returns the new query_id immediately.
        """
        query_id = str(uuid.uuid4())
        result_id = str(uuid.uuid4())
        title = title or f"Research on: {topic[:30]}..."
        
        # 1. Create DB records
        query_data = {
            "id": query_id,
            "user_id": user_id,
            "title": title,
            "topic": topic,
            "status": "pending"
        }
        supabase.insert_research_query(query_data)
        
        result_data = {
            "id": result_id,
            "query_id": query_id,
            "status": "pending"
        }
        supabase.insert_research_result(result_data)
        
        # 2. Setup SSE Queue
        self.active_streams[query_id] = asyncio.Queue()
        
        # 3. Launch background task
        asyncio.create_task(self.run_workflow(query_id, result_id, topic))
        
        return query_id

    async def run_workflow(self, query_id: str, result_id: str, topic: str):
        """
        Executes the full research workflow asynchronously.
        """
        logger.info(f"Starting background workflow for query: {query_id}")
        
        # Update status to running
        supabase.update_research_query(query_id, {"status": "running"})
        supabase.update_research_result(result_id, {"status": "running"})
        
        queue = self.active_streams.get(query_id)
        
        async def progress_callback(step: AgentStep):
            if queue:
                await queue.put(step)
                
        crew = ResearchCrew(
            settings=self.settings,
            audit_logger=self.audit_logger,
            observability=self.observability
        )
        
        try:
            # Run the heavy lifting
            final_result = await crew.run(
                topic=topic,
                query_id=query_id,
                result_id=result_id,
                on_progress=progress_callback
            )
            
            # Update database with final results
            result_update = {
                "search_results": final_result.search_results,
                "extracted_data": final_result.extracted_data,
                "synthesized_report": final_result.synthesized_report,
                "citations": final_result.citations,
                "status": final_result.status,
                "latency_ms": final_result.latency_ms,
                "cost_usd": final_result.cost_usd
            }
            supabase.update_research_result(result_id, result_update)
            supabase.update_research_query(query_id, {"status": final_result.status})
            
            # Signal completion to stream
            if queue:
                await queue.put(AgentStep(agent_name="system", status="completed", message="Done", progress=1.0))
                
        except Exception as e:
            logger.error(f"Workflow failed critically for {query_id}: {e}")
            supabase.update_research_query(query_id, {"status": "failed"})
            supabase.update_research_result(result_id, {"status": "failed"})
            
            if queue:
                await queue.put(AgentStep(agent_name="system", status="failed", message=str(e), progress=1.0))
                
        finally:
            # We don't delete the queue immediately to allow clients to flush it
            # A robust system would clean this up after a timeout.
            pass

    async def get_query_status(self, query_id: str) -> dict:
        query = supabase.get_research_query(query_id)
        result = supabase.get_research_result(query_id)
        return {
            "query": query,
            "result": result
        }

    async def list_queries(self, user_id: Optional[str] = None, limit: int = 50, offset: int = 0) -> list:
        return supabase.list_research_queries(user_id=user_id, limit=limit, offset=offset)

    async def delete_query(self, query_id: str):
        client = supabase.get_supabase_client()
        if client:
            client.table("research_queries").delete().eq("id", query_id).execute()
