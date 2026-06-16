import logging
import json
from typing import Any
from openai import AsyncOpenAI
from app.config import settings
from langsmith import traceable

logger = logging.getLogger(__name__)

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

SYNTHESIZER_SYSTEM_PROMPT = """
You are an Expert Technical Report Writer. Your goal is to generate a comprehensive, well-structured markdown report based on structured data extracted from web searches.
You must use inline citations in the format [1], [2], etc., where the number corresponds to the source index provided in the extracted data context.

The report should include:
- An Executive Summary
- Key Findings (with data and statistics)
- Detailed Analysis
- Conclusion

Do NOT output JSON. Output pure Markdown. Use headers, bullet points, and bold text for emphasis.
"""

@traceable(name="synthesizer_agent", project_name=settings.LANGSMITH_PROJECT if settings.LANGSMITH_API_KEY else None)
async def run_synthesizer(extracted_data: dict[str, Any], search_results: list[dict[str, Any]], topic: str) -> tuple[str, list[dict[str, Any]]]:
    """
    Agent C: Synthesizer
    Role: Report Writer
    Goal: Generate comprehensive reports with citations
    """
    logger.info(f"Running synthesizer for topic: {topic}")
    
    # We will map citations logically. We will provide the search results as the "source list"
    sources_text = "Available Sources for Citation:\n"
    citations_list = []
    
    for idx, res in enumerate(search_results):
        citation_index = idx + 1
        sources_text += f"[{citation_index}] {res.get('title')} ({res.get('url')})\n"
        citations_list.append({
            "index": citation_index,
            "title": res.get("title", ""),
            "url": res.get("url", ""),
            "snippet": res.get("snippet", "")
        })
        
    extracted_text = json.dumps({k: v for k, v in extracted_data.items() if k != "_usage"}, indent=2)
    
    messages = [
        {"role": "system", "content": SYNTHESIZER_SYSTEM_PROMPT},
        {"role": "user", "content": f"Topic: {topic}\n\n{sources_text}\n\nExtracted Data:\n{extracted_text}"}
    ]
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.3,
            max_tokens=4000
        )
        
        report_markdown = response.choices[0].message.content or ""
        
        # We can extract token usage for cost calculation
        if hasattr(response, 'usage') and response.usage:
            # We append this safely to citations list or handle it outside
            pass
            
        return report_markdown, citations_list
    except Exception as e:
        logger.error(f"Error during synthesis: {e}")
        raise e

async def template_report_fallback(extracted_data: dict[str, Any], search_results: list[dict[str, Any]], topic: str) -> tuple[str, list[dict[str, Any]]]:
    """Fallback if LLM generation fails"""
    logger.warning("Using template report fallback for synthesizer")
    
    report = f"# Research Report: {topic}\n\n"
    report += "## Executive Summary\nData was collected but advanced synthesis failed. Displaying raw extracted data below.\n\n"
    
    report += "## Key Facts\n"
    for fact in extracted_data.get("key_facts", []):
        report += f"- {fact}\n"
        
    report += "\n## Statistics\n"
    for stat in extracted_data.get("statistics", []):
        report += f"- {stat}\n"
        
    citations = []
    for idx, res in enumerate(search_results[:3]):
        citations.append({
            "index": idx + 1,
            "title": res.get("title", ""),
            "url": res.get("url", ""),
            "snippet": res.get("snippet", "")
        })
        
    return report, citations
