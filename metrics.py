from fastapi import APIRouter, Depends, Request
from app.services.observability import ObservabilityService

router = APIRouter(prefix="/api/metrics", tags=["metrics"])

def get_observability(request: Request) -> ObservabilityService:
    return request.app.state.observability

@router.get("")
async def get_metrics(obs: ObservabilityService = Depends(get_observability)):
    snapshot = obs.get_metrics_snapshot()
    return snapshot

@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "researchbot-pro-api"}
