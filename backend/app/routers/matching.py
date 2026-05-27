from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from app.dependencies import get_current_user, require_manager_or_above
from app.models.user import UserOut
from app.db.client import get_db
from app.services.matching_engine import run_matching, ai_explain_match
from pydantic import BaseModel
import uuid

router = APIRouter(tags=["matching"])


# ──────────────────── matching ────────────────────

@router.post("/projects/{project_id}/match")
async def match_resources(
    project_id: uuid.UUID,
    _: UserOut = Depends(require_manager_or_above),
):
    db = get_db()
    proj_r = db.table("projects").select("*").eq("id", str(project_id)).single().execute()
    if not proj_r.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    project = proj_r.data

    emp_r = db.table("users").select("*").eq("is_active", True).execute()
    employees = emp_r.data or []

    results = run_matching(project, employees)
    return results[:50]


@router.get("/projects/{project_id}/match/{employee_id}/explain")
async def explain_match(
    project_id: uuid.UUID,
    employee_id: uuid.UUID,
    _: UserOut = Depends(require_manager_or_above),
):
    db = get_db()
    proj_r = db.table("projects").select("*").eq("id", str(project_id)).single().execute()
    emp_r = db.table("users").select("*").eq("id", str(employee_id)).single().execute()
    if not proj_r.data or not emp_r.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    results = run_matching(proj_r.data, [emp_r.data])
    breakdown = results[0] if results else {}
    explanation = await ai_explain_match(emp_r.data, proj_r.data, breakdown)
    return {"explanation": explanation}


# ──────────────────── wish list ────────────────────

class WishListAdd(BaseModel):
    employee_id: uuid.UUID
    score: float | None = None
    explanation: str | None = None
    notes: str | None = None


@router.get("/projects/{project_id}/wishlist")
async def get_wishlist(project_id: uuid.UUID, _: UserOut = Depends(require_manager_or_above)):
    db = get_db()
    result = (
        db.table("wish_list")
        .select("*, users!wish_list_user_id_fkey(*)")
        .eq("project_id", str(project_id))
        .execute()
    )
    return result.data or []


@router.post("/projects/{project_id}/wishlist", status_code=status.HTTP_201_CREATED)
async def add_to_wishlist(
    project_id: uuid.UUID,
    payload: WishListAdd,
    current_user: UserOut = Depends(require_manager_or_above),
):
    try:
        db = get_db()
        existing = (
            db.table("wish_list")
            .select("id")
            .eq("project_id", str(project_id))
            .eq("employee_id", str(payload.employee_id))
            .execute()
        )
        if existing.data:
            return {"status": "already_added"}

        db.table("wish_list").insert({
            "project_id": str(project_id),
            "employee_id": str(payload.employee_id),
            "added_by": str(current_user.id),
            "match_score": payload.score,
            "ai_explanation": payload.explanation,
            "notes": payload.notes,
        }).execute()

        proj_r = db.table("projects").select("title").eq("id", str(project_id)).single().execute()
        proj_title = proj_r.data["title"] if proj_r.data else "a project"
        db.table("notifications").insert({
            "user_id": str(payload.employee_id),
            "type": "added_to_wishlist",
            "title": "Added to wish list",
            "message": f"You've been shortlisted for '{proj_title}'.",
            "link": f"/projects/{project_id}",
        }).execute()

        return {"status": "added"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/projects/{project_id}/wishlist/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_wishlist(
    project_id: uuid.UUID,
    employee_id: uuid.UUID,
    _: UserOut = Depends(require_manager_or_above),
):
    db = get_db()
    db.table("wish_list").delete().eq("project_id", str(project_id)).eq("employee_id", str(employee_id)).execute()


# ──────────────────── allocations ────────────────────

class AllocationCreate(BaseModel):
    user_id: uuid.UUID
    project_id: uuid.UUID
    allocation_percentage: int
    month: str  # YYYY-MM


class AllocationUpdate(BaseModel):
    allocation_percentage: int | None = None


@router.post("/allocations", status_code=status.HTTP_201_CREATED)
async def create_allocation(
    payload: AllocationCreate,
    current_user: UserOut = Depends(require_manager_or_above),
):
    db = get_db()
    month_date = f"{payload.month}-01"

    # Check total won't exceed 100%
    existing = (
        db.table("allocations")
        .select("allocation_percentage")
        .eq("user_id", str(payload.user_id))
        .eq("month", month_date)
        .neq("status", "rejected")
        .execute()
    )
    current_total = sum(r["allocation_percentage"] for r in (existing.data or []))
    if current_total + payload.allocation_percentage > 100:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Allocation would exceed 100% for this month (currently at {current_total}%)",
        )

    result = db.table("allocations").insert({
        "user_id": str(payload.user_id),
        "project_id": str(payload.project_id),
        "allocation_percentage": payload.allocation_percentage,
        "month": month_date,
        "status": "pending",
        "allocated_by": str(current_user.id),
    }).execute()

    # notify employee
    proj_r = db.table("projects").select("title").eq("id", str(payload.project_id)).single().execute()
    proj_title = proj_r.data["title"] if proj_r.data else "a project"
    db.table("notifications").insert({
        "user_id": str(payload.user_id),
        "type": "allocation_request",
        "title": "Allocation request",
        "message": f"You've been allocated {payload.allocation_percentage}% to '{proj_title}' for {payload.month}.",
        "link": f"/projects/{payload.project_id}",
    }).execute()

    return result.data[0]


@router.get("/allocations")
async def list_my_allocations(current_user: UserOut = Depends(get_current_user)):
    db = get_db()
    result = (
        db.table("allocations")
        .select("*, projects(title, status)")
        .eq("user_id", str(current_user.id))
        .order("month", desc=True)
        .execute()
    )
    return result.data or []


@router.get("/projects/{project_id}/allocations")
async def list_project_allocations(
    project_id: uuid.UUID,
    _: UserOut = Depends(require_manager_or_above),
):
    db = get_db()
    result = (
        db.table("allocations")
        .select("*, users!allocations_user_id_fkey(full_name, email, avatar_url, job_title, department)")
        .eq("project_id", str(project_id))
        .order("month")
        .execute()
    )
    return result.data or []


@router.put("/allocations/{allocation_id}/confirm", status_code=status.HTTP_204_NO_CONTENT)
async def confirm_allocation(allocation_id: uuid.UUID, current_user: UserOut = Depends(get_current_user)):
    db = get_db()
    alloc = db.table("allocations").select("user_id, allocated_by, project_id, allocation_percentage, month").eq("id", str(allocation_id)).single().execute()
    if not alloc.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Allocation not found")
    if str(alloc.data["user_id"]) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your allocation")

    db.table("allocations").update({"status": "confirmed"}).eq("id", str(allocation_id)).execute()

    # notify manager
    if alloc.data.get("allocated_by"):
        proj_r = db.table("projects").select("title").eq("id", str(alloc.data["project_id"])).single().execute()
        proj_title = proj_r.data["title"] if proj_r.data else "a project"
        db.table("notifications").insert({
            "user_id": str(alloc.data["allocated_by"]),
            "type": "allocation_confirmed",
            "title": "Allocation confirmed",
            "message": f"{current_user.full_name} confirmed {alloc.data['allocation_percentage']}% allocation for '{proj_title}'.",
            "link": f"/projects/{alloc.data['project_id']}",
        }).execute()


@router.put("/allocations/{allocation_id}/reject", status_code=status.HTTP_204_NO_CONTENT)
async def reject_allocation(allocation_id: uuid.UUID, current_user: UserOut = Depends(get_current_user)):
    db = get_db()
    alloc = db.table("allocations").select("user_id, allocated_by, project_id, allocation_percentage").eq("id", str(allocation_id)).single().execute()
    if not alloc.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Allocation not found")
    if str(alloc.data["user_id"]) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your allocation")

    db.table("allocations").update({"status": "rejected"}).eq("id", str(allocation_id)).execute()

    if alloc.data.get("allocated_by"):
        proj_r = db.table("projects").select("title").eq("id", str(alloc.data["project_id"])).single().execute()
        proj_title = proj_r.data["title"] if proj_r.data else "a project"
        db.table("notifications").insert({
            "user_id": str(alloc.data["allocated_by"]),
            "type": "allocation_confirmed",
            "title": "Allocation rejected",
            "message": f"{current_user.full_name} rejected allocation for '{proj_title}'.",
            "link": f"/projects/{alloc.data['project_id']}",
        }).execute()
