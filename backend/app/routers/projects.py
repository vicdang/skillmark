import logging
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks

logger = logging.getLogger(__name__)
from app.dependencies import get_current_user, require_manager_or_above
from app.models.user import UserOut
from app.models.project import ProjectCreate, ProjectUpdate, ProjectOut
from app.db.client import get_db
from app.utils.country_map import get_region
from pydantic import BaseModel
from typing import Literal
import uuid

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectOut])
async def list_projects(
    status_filter: str | None = None,
    domain: str | None = None,
    _: UserOut = Depends(get_current_user),
):
    db = get_db()
    query = db.table("projects").select("*").eq("is_archived", False)
    if status_filter:
        query = query.eq("status", status_filter)
    if domain:
        query = query.eq("domain", domain)
    result = query.order("created_at", desc=True).execute()
    return [ProjectOut(**p) for p in result.data]


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: ProjectCreate,
    current_user: UserOut = Depends(require_manager_or_above),
):
    db = get_db()
    data = payload.model_dump(mode="json", exclude_none=True)
    if "client_country" in data:
        data["client_region"] = get_region(data["client_country"])
    data["created_by"] = str(current_user.id)
    result = db.table("projects").insert(data).execute()
    return ProjectOut(**result.data[0])


@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(project_id: uuid.UUID, _: UserOut = Depends(get_current_user)):
    db = get_db()
    result = db.table("projects").select("*").eq("id", str(project_id)).single().execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return ProjectOut(**result.data)


@router.put("/{project_id}", response_model=ProjectOut)
async def update_project(
    project_id: uuid.UUID,
    payload: ProjectUpdate,
    current_user: UserOut = Depends(require_manager_or_above),
):
    db = get_db()
    project = db.table("projects").select("created_by, status").eq("id", str(project_id)).single().execute()
    if not project.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if current_user.role != "admin" and str(project.data["created_by"]) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your project")

    updates = payload.model_dump(mode="json", exclude_none=True)
    if "client_country" in updates:
        updates["client_region"] = get_region(updates["client_country"])
    result = db.table("projects").update(updates).eq("id", str(project_id)).execute()
    return ProjectOut(**result.data[0])


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: uuid.UUID,
    current_user: UserOut = Depends(require_manager_or_above),
):
    db = get_db()
    project = db.table("projects").select("created_by").eq("id", str(project_id)).single().execute()
    if not project.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if current_user.role != "admin" and str(project.data["created_by"]) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your project")
    db.table("projects").update({"is_archived": True}).eq("id", str(project_id)).execute()


class BulkActionPayload(BaseModel):
    ids: list[uuid.UUID]
    action: Literal["archive", "delete", "status"]
    status: str | None = None


@router.post("/bulk-action", status_code=status.HTTP_204_NO_CONTENT)
async def bulk_action(
    payload: BulkActionPayload,
    current_user: UserOut = Depends(require_manager_or_above),
):
    db = get_db()
    ids = [str(i) for i in payload.ids]
    if not ids:
        return
    if payload.action == "archive":
        db.table("projects").update({"is_archived": True}).in_("id", ids).execute()
    elif payload.action == "delete":
        db.table("projects").update({"is_archived": True}).in_("id", ids).execute()
    elif payload.action == "status":
        if not payload.status:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="status required")
        db.table("projects").update({"status": payload.status}).in_("id", ids).execute()


@router.post("/{project_id}/upload-rfp")
async def upload_rfp(
    project_id: uuid.UUID,
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user: UserOut = Depends(require_manager_or_above),
):
    if file.content_type not in ("application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Only PDF and DOCX are supported")

    content = await file.read()
    db = get_db()
    path = f"rfp/{project_id}/{file.filename}"

    from app.services.storage_adapter import get_storage
    import traceback
    try:
        public_url = get_storage().upload(path, content, file.content_type or "application/octet-stream")
    except HTTPException:
        raise
    except Exception as e:
        tb = traceback.format_exc()
        logger.error("RFP upload failed for project %s:\n%s", project_id, tb)
        raise HTTPException(status_code=500, detail=f"Upload failed: {type(e).__name__}: {e}") from e

    db.table("projects").update({"rfp_file_url": public_url}).eq("id", str(project_id)).execute()

    from app.services.rfp_extractor import extract_rfp_background
    logger.info(f"[RFP] Queuing background extraction task for project {project_id}, file: {file.filename}")
    background_tasks.add_task(extract_rfp_background, str(project_id), content, file.filename or "", str(current_user.id))
    logger.info(f"[RFP] Background task queued successfully")

    return {"status": "uploaded", "url": public_url}
