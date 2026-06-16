import os
import logging
from typing import Optional, Any
from supabase import create_client, Client
from app.config import settings

logger = logging.getLogger(__name__)

_supabase_client: Optional[Client] = None

def get_supabase_client() -> Optional[Client]:
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client
    
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        logger.warning("Supabase URL or Key not configured. Using mock data.")
        return None
        
    try:
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        return _supabase_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        return None

# --- Research Queries ---

def insert_research_query(data: dict[str, Any]) -> dict[str, Any]:
    client = get_supabase_client()
    if not client:
        return {"id": "mock-id", **data}
    
    response = client.table("research_queries").insert(data).execute()
    return response.data[0] if response.data else {}

def update_research_query(query_id: str, data: dict[str, Any]) -> dict[str, Any]:
    client = get_supabase_client()
    if not client:
        return {"id": query_id, **data}
    
    response = client.table("research_queries").update(data).eq("id", query_id).execute()
    return response.data[0] if response.data else {}

def get_research_query(query_id: str) -> dict[str, Any]:
    client = get_supabase_client()
    if not client:
        return {"id": query_id, "status": "mock"}
    
    response = client.table("research_queries").select("*").eq("id", query_id).execute()
    return response.data[0] if response.data else {}

def list_research_queries(user_id: Optional[str] = None, limit: int = 50, offset: int = 0) -> list[dict[str, Any]]:
    client = get_supabase_client()
    if not client:
        return []
    
    query = client.table("research_queries").select("*").order("created_at", desc=True).limit(limit).offset(offset)
    if user_id:
        query = query.eq("user_id", user_id)
        
    response = query.execute()
    return response.data if response.data else []

# --- Research Results ---

def insert_research_result(data: dict[str, Any]) -> dict[str, Any]:
    client = get_supabase_client()
    if not client:
        return {"id": "mock-res-id", **data}
    
    response = client.table("research_results").insert(data).execute()
    return response.data[0] if response.data else {}

def update_research_result(result_id: str, data: dict[str, Any]) -> dict[str, Any]:
    client = get_supabase_client()
    if not client:
        return {"id": result_id, **data}
    
    response = client.table("research_results").update(data).eq("id", result_id).execute()
    return response.data[0] if response.data else {}

def get_research_result(query_id: str) -> dict[str, Any]:
    client = get_supabase_client()
    if not client:
        return {}
    
    response = client.table("research_results").select("*").eq("query_id", query_id).execute()
    return response.data[0] if response.data else {}

# --- Agent Logs ---

def insert_agent_log(data: dict[str, Any]) -> dict[str, Any]:
    client = get_supabase_client()
    if not client:
        return {"id": "mock-log-id", **data}
    
    response = client.table("agent_logs").insert(data).execute()
    return response.data[0] if response.data else {}

def get_agent_logs(result_id: str) -> list[dict[str, Any]]:
    client = get_supabase_client()
    if not client:
        return []
    
    response = client.table("agent_logs").select("*").eq("result_id", result_id).order("timestamp", desc=False).execute()
    return response.data if response.data else []

# --- Metrics (Aggregations) ---

def get_all_latencies() -> list[int]:
    client = get_supabase_client()
    if not client:
        return [1000, 2000, 3000]
    
    response = client.table("research_results").select("latency_ms").not_.is_("latency_ms", "null").execute()
    return [row["latency_ms"] for row in response.data] if response.data else []

def get_all_costs() -> list[float]:
    client = get_supabase_client()
    if not client:
        return [0.01, 0.02, 0.05]
    
    response = client.table("research_results").select("cost_usd").not_.is_("cost_usd", "null").execute()
    return [float(row["cost_usd"]) for row in response.data] if response.data else []

def get_query_count() -> int:
    client = get_supabase_client()
    if not client:
        return 0
    
    response = client.table("research_queries").select("id", count="exact").execute()
    return response.count if response.count else 0

def get_success_count() -> int:
    client = get_supabase_client()
    if not client:
        return 0
    
    response = client.table("research_queries").select("id", count="exact").in_("status", ["completed", "partial_success"]).execute()
    return response.count if response.count else 0
