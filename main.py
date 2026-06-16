from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import settings
from app.db import supabase
from app.api import research, logs, metrics
from app.services.audit import AuditLogger
from app.services.observability import ObservabilityService
from app.services.research import ResearchService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app() -> FastAPI:
    app = FastAPI(
        title="ResearchBot Pro API",
        version="1.0.0",
        description="Multi-agent autonomous research system API"
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # State / Dependency Injection
    # We initialize services once and attach to app.state
    audit_logger = AuditLogger()
    observability = ObservabilityService()
    research_service = ResearchService(settings, audit_logger, observability)
    
    app.state.audit_logger = audit_logger
    app.state.observability = observability
    app.state.research_service = research_service

    # Routers
    app.include_router(research.router)
    app.include_router(logs.router)
    app.include_router(metrics.router)

    @app.on_event("startup")
    async def startup_event():
        logger.info("Initializing ResearchBot Pro API...")
        # Force early init of Supabase
        supabase.get_supabase_client()

    @app.get("/")
    async def root():
        return {
            "name": "ResearchBot Pro API",
            "version": "1.0.0",
            "status": "operational"
        }

    return app

app = create_app()
