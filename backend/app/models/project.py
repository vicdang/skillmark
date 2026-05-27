from pydantic import BaseModel
from typing import Literal
from datetime import date, datetime
import uuid

ProjectStatus = Literal["draft", "review", "approved", "in_progress", "completed"]


class ProjectCreate(BaseModel):
    title: str
    description: str | None = None
    client_name: str | None = None
    client_country: str | None = None
    domain: str | None = None
    project_type: str | None = None
    kick_off_date: date | None = None
    end_date: date | None = None
    team_size_required: int | None = None
    budget_range: str | None = None
    tech_stack: list[str] | None = None
    compliance_requirements: str | None = None
    deliverables: str | None = None


class ProjectUpdate(ProjectCreate):
    title: str | None = None
    status: ProjectStatus | None = None
    is_archived: bool | None = None


class ProjectOut(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None = None
    client_name: str | None = None
    client_country: str | None = None
    client_region: str | None = None
    domain: str | None = None
    project_type: str | None = None
    status: ProjectStatus
    is_archived: bool
    kick_off_date: date | None = None
    end_date: date | None = None
    team_size_required: int | None = None
    budget_range: str | None = None
    tech_stack: list[str] | None = None
    rfp_file_url: str | None = None
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime
