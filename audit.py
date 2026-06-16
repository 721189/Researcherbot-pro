import logging
import json
from typing import Any, Optional
from app.db import supabase

logger = logging.getLogger(__name__)

class AuditLogger:
    def __init__(self):
        self.logger = logging.getLogger("audit_trail")
        
    async def log(self, result_id: str, agent_name: str, action: str, input_data: Optional[dict] = None, output_data: Optional[dict] = None, error: Optional[str] = None, retry_count: int = 0):
        """
        Logs an agent action immutably to the database and standard logger.
        """
        log_entry = {
            "result_id": result_id,
            "agent_name": agent_name,
            "action": action,
            "input": input_data,
            "output": output_data,
            "error": error,
            "retry_count": retry_count
        }
        
        # 1. Log to console for dev
        log_msg = f"[AUDIT] {agent_name} | {action}"
        if error:
            log_msg += f" | ERROR: {error}"
        self.logger.info(log_msg)
        
        # 2. Append to database (immutable)
        try:
            supabase.insert_agent_log(log_entry)
        except Exception as e:
            logger.error(f"Failed to persist audit log to Supabase: {e}")

    async def get_logs(self, result_id: str) -> list[dict[str, Any]]:
        """
        Retrieves all logs for a specific research result.
        """
        try:
            return supabase.get_agent_logs(result_id)
        except Exception as e:
            logger.error(f"Failed to fetch audit logs: {e}")
            return []
            
    async def export_logs(self, result_id: str) -> str:
        """
        Exports logs as a formatted JSON string.
        """
        logs = await self.get_logs(result_id)
        # Ensure datetimes are serialized as strings
        for log in logs:
            if "timestamp" in log and not isinstance(log["timestamp"], str):
                log["timestamp"] = log["timestamp"].isoformat()
        return json.dumps(logs, indent=2)
