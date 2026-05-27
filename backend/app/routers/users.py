from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import get_current_user, require_admin
from app.models.user import UserOut, UserUpdate
from app.db.client import get_db
import uuid

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserOut])
async def list_users(_: UserOut = Depends(require_admin)):
    db = get_db()
    result = db.table("users").select("*").eq("is_active", True).execute()
    return [UserOut(**u) for u in result.data]


@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: uuid.UUID, current_user: UserOut = Depends(get_current_user)):
    db = get_db()
    result = db.table("users").select("*").eq("id", str(user_id)).single().execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserOut(**result.data)


@router.put("/{user_id}", response_model=UserOut)
async def update_user(
    user_id: uuid.UUID,
    payload: UserUpdate,
    current_user: UserOut = Depends(get_current_user),
):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot edit other users")
    if payload.role and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can change roles")

    db = get_db()
    updates = payload.model_dump(exclude_none=True)
    result = (
        db.table("users")
        .update(updates)
        .eq("id", str(user_id))
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserOut(**result.data[0])


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_user(user_id: uuid.UUID, _: UserOut = Depends(require_admin)):
    db = get_db()
    db.table("users").update({"is_active": False}).eq("id", str(user_id)).execute()


@router.get("/{user_id}/availability")
async def get_availability(
    user_id: uuid.UUID,
    from_month: str | None = None,
    to_month: str | None = None,
    current_user: UserOut = Depends(get_current_user),
):
    db = get_db()
    query = (
        db.table("allocations")
        .select("month, allocation_percentage")
        .eq("user_id", str(user_id))
        .eq("status", "confirmed")
    )
    if from_month:
        query = query.gte("month", f"{from_month}-01")
    if to_month:
        query = query.lte("month", f"{to_month}-01")

    result = query.execute()
    by_month: dict[str, int] = {}
    for row in result.data:
        m = row["month"][:7]
        by_month[m] = by_month.get(m, 0) + row["allocation_percentage"]

    return {
        "employee_id": str(user_id),
        "availability": [
            {"month": m, "allocated": pct, "available": 100 - pct}
            for m, pct in sorted(by_month.items())
        ],
    }
