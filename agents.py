"""
ResearchBot Pro - Agent Pydantic Models.

Models for tracking agent execution steps, configuration, and workflow status.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class AgentStep(BaseModel):
    """A single step in the agent pipeline, streamed via SSE."""

    agent_name: str
    status: str  # 'started' | 'running' | 'completed' | 'failed'
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    progress: float = Field(ge=0.0, le=1.0, description="Progress from 0.0 to 1.0")


class AgentConfig(BaseModel):
    """Configuration descriptor for an agent."""

    role: str
    goal: str
    backstory: str
    tools: list[str] = Field(default_factory=list)
    verbose: bool = True


class WorkflowStatus(BaseModel):
    """Current status of the entire research workflow."""

    query_id: str
    current_agent: str
    steps: list[AgentStep] = Field(default_factory=list)
    overall_status: str = "pending"  # 'pending' | 'running' | 'completed' | 'partial_success' | 'failed'
    progress: float = Field(0.0, ge=0.0, le=1.0)
