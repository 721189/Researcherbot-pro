import os
import numpy as np
import logging
from app.config import settings
from app.db import supabase
from app.models.logs import MetricsSnapshot

logger = logging.getLogger(__name__)

class ObservabilityService:
    def __init__(self):
        self._init_langsmith()
        
    def _init_langsmith(self):
        """Initializes LangSmith tracing if API key is present."""
        if settings.LANGSMITH_API_KEY:
            os.environ["LANGCHAIN_TRACING_V2"] = str(settings.LANGSMITH_TRACING_V2).lower()
            os.environ["LANGCHAIN_ENDPOINT"] = "https://api.smith.langchain.com"
            os.environ["LANGCHAIN_API_KEY"] = settings.LANGSMITH_API_KEY
            os.environ["LANGCHAIN_PROJECT"] = settings.LANGSMITH_PROJECT
            logger.info(f"LangSmith tracing enabled for project: {settings.LANGSMITH_PROJECT}")
        else:
            logger.info("LangSmith tracing is disabled (no API key).")
            
    def compute_percentiles(self, latencies: list[int]) -> tuple[float, float, float]:
        """Returns (p50, p95, p99) latencies in milliseconds."""
        if not latencies:
            return 0.0, 0.0, 0.0
            
        p50 = np.percentile(latencies, 50)
        p95 = np.percentile(latencies, 95)
        p99 = np.percentile(latencies, 99)
        return float(p50), float(p95), float(p99)
        
    def get_metrics_snapshot(self) -> MetricsSnapshot:
        """Retrieves global system metrics snapshot from the database."""
        try:
            latencies = supabase.get_all_latencies()
            costs = supabase.get_all_costs()
            total_queries = supabase.get_query_count()
            success_count = supabase.get_success_count()
            
            p50, p95, p99 = self.compute_percentiles(latencies)
            
            avg_cost = float(np.mean(costs)) if costs else 0.0
            success_rate = (success_count / total_queries) * 100 if total_queries > 0 else 0.0
            
            return MetricsSnapshot(
                p50_latency_ms=p50,
                p95_latency_ms=p95,
                p99_latency_ms=p99,
                avg_cost_usd=avg_cost,
                total_queries=total_queries,
                success_rate=success_rate
            )
        except Exception as e:
            logger.error(f"Failed to compute metrics snapshot: {e}")
            return MetricsSnapshot(
                p50_latency_ms=0.0,
                p95_latency_ms=0.0,
                p99_latency_ms=0.0,
                avg_cost_usd=0.0,
                total_queries=0,
                success_rate=0.0
            )
