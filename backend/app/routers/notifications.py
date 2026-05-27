from fastapi import APIRouter, Depends, status
from app.dependencies import get_current_user
from app.models.user import UserOut
from app.db.client import get_db
import uuid

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
async def list_notifications(
    page: int = 1,
    page_size: int = 20,
    current_user: UserOut = Depends(get_current_user),
):
    db = get_db()
    offset = (page - 1) * page_size
    result = (
        db.table("notifications")
        .select("*")
        .eq("user_id", str(current_user.id))
        .order("created_at", desc=True)
        .range(offset, offset + page_size - 1)
        .execute()
    )
    return result.data


@router.put("/{notification_id}/read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_read(notification_id: uuid.UUID, current_user: UserOut = Depends(get_current_user)):
    db = get_db()
    db.table("notifications").update({"is_read": True}).eq("id", str(notification_id)).eq("user_id", str(current_user.id)).execute()


@router.put("/read-all", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_read(current_user: UserOut = Depends(get_current_user)):
    db = get_db()
    db.table("notifications").update({"is_read": True}).eq("user_id", str(current_user.id)).eq("is_read", False).execute()
