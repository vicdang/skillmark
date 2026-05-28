from pydantic import BaseModel
from typing import Annotated
from annotated_types import Ge, Le
import uuid
from datetime import datetime

Level = Annotated[int, Ge(1), Le(5)]


class SkillDomainOut(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None = None
    icon: str | None = None
    sort_order: int = 0
    is_active: bool = True


class SkillCategoryOut(BaseModel):
    id: uuid.UUID
    domain_id: uuid.UUID
    name: str
    description: str | None = None
    sort_order: int = 0
    is_active: bool = True


class SkillOut(BaseModel):
    id: uuid.UUID
    category_id: uuid.UUID
    name: str
    description: str | None = None
    sort_order: int = 0
    is_active: bool = True


class EmployeeSkillCreate(BaseModel):
    skill_id: uuid.UUID
    level: Level
    years_experience: float | None = None
    evidence_url: str | None = None
    evidence_note: str | None = None


class EmployeeSkillUpdate(BaseModel):
    level: Level | None = None
    years_experience: float | None = None
    evidence_url: str | None = None
    evidence_note: str | None = None


class EmployeeSkillOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    skill_id: uuid.UUID
    level: Level
    years_experience: float | None = None
    evidence_url: str | None = None
    evidence_note: str | None = None
    last_assessed_at: datetime
    created_at: datetime
    updated_at: datetime
    skill: SkillOut | None = None


class EmployeeSkillSummaryOut(BaseModel):
    user_id: uuid.UUID
    total_skills: int
    avg_level: float
    domains: list[str]
    strongest_domain: str | None = None
