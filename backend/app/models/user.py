from pydantic import BaseModel, EmailStr
from typing import Literal
from datetime import datetime
import uuid

Role = Literal["admin", "manager", "employee", "viewer"]


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    username: str | None = None
    role: Role = "employee"
    department: str | None = None
    job_title: str | None = None
    phone: str | None = None
    bio: str | None = None
    avatar_url: str | None = None


class UserCreate(UserBase):
    password: str | None = None


class UserUpdate(BaseModel):
    full_name: str | None = None
    department: str | None = None
    job_title: str | None = None
    phone: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    role: Role | None = None
    is_active: bool | None = None


class UserOut(UserBase):
    id: uuid.UUID
    supabase_auth_id: uuid.UUID | None = None
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
