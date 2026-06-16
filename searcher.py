import logging
from typing import Any
from app.config import settings
from app.agents.tools import serper_search_tool
from langsmith import traceable

logger = logging.getLogger(__name__)

@traceable(name="searcher_agent", project_name=settings.LANGSMITH_PROJECT if settings.LANGSMITH_API_KEY else None)
async def run_searcher(topic: str) -> list[dict[str, Any]]:
    """
    Agent A: Searcher
    Role: Research Analyst
    Goal: Search web comprehensively for user topics
    """
    logger.info(f"Running searcher for topic: {topic}")
    
    # We will run two queries to ensure breadth:
    # 1. The exact topic
    # 2. Topic + "statistics data research"
    
    queries = [
        topic,
        f"{topic} statistics data research"
    ]
    
    all_results = []
    seen_urls = set()
    
    for q in queries:
        try:
            results = await serper_search_tool(q, num_results=5)
            for res in results:
                url = res.get("url")
                if url and url not in seen_urls:
                    seen_urls.add(url)
                    all_results.append(res)
        except Exception as e:
            logger.error(f"Error during search for '{q}': {e}")
            # Reraise so self-healing can handle it
            raise e
            
    return all_results
