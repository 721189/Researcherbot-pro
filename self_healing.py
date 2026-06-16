import asyncio
import logging
from typing import Callable, Any

logger = logging.getLogger(__name__)

async def retry_with_backoff(fn: Callable, *args, max_retries: int = 3, base_delay: float = 1.0, agent_name: str = "unknown", audit_logger=None, result_id: str = None, **kwargs) -> tuple[Any, int, str]:
    """
    Executes a function with exponential backoff retry logic.
    Returns (result, retry_count, status).
    Status can be 'success' or 'failed'.
    """
    attempt = 0
    while attempt <= max_retries:
        try:
            # Log attempt start
            if audit_logger and result_id:
                action = f"started_attempt_{attempt + 1}" if attempt > 0 else "started"
                await audit_logger.log(
                    result_id=result_id,
                    agent_name=agent_name,
                    action=action,
                    input_data=kwargs,
                    retry_count=attempt
                )
                
            result = await fn(*args, **kwargs)
            
            # Log success
            if audit_logger and result_id:
                await audit_logger.log(
                    result_id=result_id,
                    agent_name=agent_name,
                    action="completed_successfully",
                    output_data={"preview": str(result)[:500] + "..." if result else None},
                    retry_count=attempt
                )
                
            return result, attempt, "success"
            
        except Exception as e:
            logger.error(f"{agent_name} failed on attempt {attempt + 1}: {e}")
            
            if audit_logger and result_id:
                await audit_logger.log(
                    result_id=result_id,
                    agent_name=agent_name,
                    action="failed_attempt",
                    error=str(e),
                    retry_count=attempt
                )
                
            if attempt == max_retries:
                return None, attempt, "failed"
                
            attempt += 1
            delay = base_delay * (2 ** (attempt - 1))
            logger.info(f"{agent_name} waiting {delay}s before retry...")
            await asyncio.sleep(delay)
            
    return None, attempt, "failed"

async def execute_with_fallback(fn: Callable, fallback_fn: Callable, agent_name: str, audit_logger=None, result_id: str = None, **kwargs) -> tuple[Any, int, str]:
    """
    Tries the primary function with retries. If it completely fails, attempts the fallback function.
    Returns (result, retry_count, overall_status).
    """
    # 1. Try primary function
    result, retries, status = await retry_with_backoff(
        fn=fn,
        max_retries=3,
        base_delay=1.0,
        agent_name=agent_name,
        audit_logger=audit_logger,
        result_id=result_id,
        **kwargs
    )
    
    if status == "success":
        return result, retries, "success"
        
    # 2. Try fallback if primary failed
    logger.warning(f"{agent_name} exhausted retries. Engaging fallback mechanism.")
    
    if audit_logger and result_id:
        await audit_logger.log(
            result_id=result_id,
            agent_name=agent_name,
            action="engaging_fallback",
            retry_count=retries
        )
        
    try:
        fallback_result = await fallback_fn(**kwargs)
        
        if audit_logger and result_id:
            await audit_logger.log(
                result_id=result_id,
                agent_name=agent_name,
                action="fallback_completed_successfully",
                retry_count=retries
            )
            
        return fallback_result, retries, "partial_success"
        
    except Exception as fallback_e:
        logger.error(f"{agent_name} fallback completely failed: {fallback_e}")
        
        if audit_logger and result_id:
            await audit_logger.log(
                result_id=result_id,
                agent_name=agent_name,
                action="fallback_failed",
                error=str(fallback_e),
                retry_count=retries
            )
            
        return None, retries, "failed"
