from typing import Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field

class AgentLogCreate(BaseModel):
    result_id: str
    agent_name: str
    action: str
    input: Optional[dict[str, Any]] = None
    output: Optional[dict[str, Any]] = None
    error: Optional[str] = None
    retry_count: int = 0

class AgentLog(AgentLogCreate):
    id: str
    timestamp: datetime

class MetricsSnapshot(BaseModel):
    p50_latency_ms: float
    p95_latency_ms: float
    p99_latency_ms: float
    avg_cost_usd: float
    total_queries: int
    success_rate: float
