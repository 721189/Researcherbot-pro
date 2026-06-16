import httpx
import json
import logging
from typing import Any
from app.config import settings

logger = logging.getLogger(__name__)

async def serper_search_tool(query: str, num_results: int = 10) -> list[dict[str, Any]]:
    """
    Makes a request to the Serper API to search the web.
    """
    if not settings.SERPER_API_KEY:
        logger.warning("SERPER_API_KEY is not configured. Falling back to mock search.")
        return await wikipedia_fallback_tool(query)
    
    url = "https://google.serper.dev/search"
    headers = {
        "X-API-KEY": settings.SERPER_API_KEY,
        "Content-Type": "application/json"
    }
    payload = json.dumps({"q": query, "num": num_results})
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, headers=headers, data=payload)
            response.raise_for_status()
            data = response.json()
            
            results = []
            if "organic" in data:
                for idx, item in enumerate(data["organic"]):
                    results.append({
                        "title": item.get("title", ""),
                        "url": item.get("link", ""),
                        "snippet": item.get("snippet", ""),
                        "position": idx + 1
                    })
            return results
    except Exception as e:
        logger.error(f"Serper API error: {e}")
        raise e

async def wikipedia_fallback_tool(query: str) -> list[dict[str, Any]]:
    """
    Fallback search tool using the Wikipedia API.
    """
    url = "https://en.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "list": "search",
        "srsearch": query,
        "format": "json"
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            results = []
            if "query" in data and "search" in data["query"]:
                for idx, item in enumerate(data["query"]["search"]):
                    results.append({
                        "title": item.get("title", ""),
                        "url": f"https://en.wikipedia.org/wiki/{item.get('title', '').replace(' ', '_')}",
                        "snippet": item.get("snippet", "").replace('<span class="searchmatch">', '').replace('</span>', ''),
                        "position": idx + 1
                    })
            return results
    except Exception as e:
        logger.error(f"Wikipedia fallback error: {e}")
        return []
