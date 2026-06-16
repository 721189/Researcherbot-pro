import logging
import json
from typing import Any
from openai import AsyncOpenAI
from app.config import settings
from langsmith import traceable

logger = logging.getLogger(__name__)

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

EXTRACTOR_SYSTEM_PROMPT = """
You are a Senior Data Scientist. Your task is to extract highly structured data from a set of raw web search results.
You must return the data strictly in JSON format matching this schema:
{
  "key_facts": ["fact 1", "fact 2"],
  "statistics": ["stat 1", "stat 2"],
  "quotes": [{"text": "quote text", "source": "source url or title"}],
  "entities": ["entity 1", "entity 2"]
}
Ensure the data is concise, accurate, and relevant to the original topic. Do not include markdown formatting or extra text outside the JSON object.
"""

@traceable(name="extractor_agent", project_name=settings.LANGSMITH_PROJECT if settings.LANGSMITH_API_KEY else None)
async def run_extractor(search_results: list[dict[str, Any]], topic: str) -> dict[str, Any]:
    """
    Agent B: Extractor
    Role: Data Scientist
    Goal: Extract key data from search results
    """
    logger.info(f"Running extractor for topic: {topic}")
    
    # Prepare input text from search results
    context_text = ""
    for idx, res in enumerate(search_results):
        context_text += f"Source {idx+1} Title: {res.get('title')}\n"
        context_text += f"Source {idx+1} URL: {res.get('url')}\n"
        context_text += f"Source {idx+1} Snippet: {res.get('snippet')}\n\n"
        
    messages = [
        {"role": "system", "content": EXTRACTOR_SYSTEM_PROMPT},
        {"role": "user", "content": f"Topic: {topic}\n\nSearch Results:\n{context_text}"}
    ]
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.2,
            max_tokens=2000
        )
        
        content = response.choices[0].message.content
        if not content:
            raise ValueError("Empty response from LLM")
            
        extracted_data = json.loads(content)
        
        # Add metadata for observability/cost tracking later
        if hasattr(response, 'usage') and response.usage:
            extracted_data["_usage"] = {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            }
            
        return extracted_data
    except Exception as e:
        logger.error(f"Error during extraction: {e}")
        raise e

async def plain_text_fallback(search_results: list[dict[str, Any]], topic: str) -> dict[str, Any]:
    """Fallback if structured extraction fails completely"""
    logger.warning("Using plain text fallback for extractor")
    facts = []
    for res in search_results[:5]:
        if res.get('snippet'):
            facts.append(res['snippet'])
            
    return {
        "key_facts": facts,
        "statistics": [],
        "quotes": [],
        "entities": []
    }
