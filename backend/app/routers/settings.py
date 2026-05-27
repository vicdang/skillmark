from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import require_admin, get_current_user
from app.models.user import UserOut
from app.db.client import get_db
from app.services.license import get_license, validate_license
from app.services.storage_adapter import get_storage, reset_storage_backend
from app.config import settings as app_settings
from pydantic import BaseModel

router = APIRouter(prefix="/settings", tags=["settings"])

# ── system settings (admin only) ──────────────────────────────


@router.get("")
async def list_settings(_: UserOut = Depends(require_admin)):
    db = get_db()
    result = db.table("system_settings").select("key, value, updated_at").execute()
    return {row["key"]: row["value"] for row in (result.data or [])}


class SettingUpsert(BaseModel):
    value: str


@router.put("/{key}", status_code=status.HTTP_204_NO_CONTENT)
async def upsert_setting(
    key: str,
    payload: SettingUpsert,
    _: UserOut = Depends(require_admin),
):
    allowed_keys = {
        "ai_provider",
        "ai_model",
        "ai_api_key",
        "ai_fallback_provider",
        "ai_max_retries",
        "matching_weight_skill",
        "matching_weight_seniority",
        "matching_weight_availability",
        "matching_weight_domain",
        "notification_email_enabled",
        "notification_inapp_enabled",
        "email_from",
        "storage_provider",
        "google_drive_folder_id",
    }
    if key not in allowed_keys:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Unknown setting key: {key}")
    db = get_db()
    existing = db.table("system_settings").select("key").eq("key", key).execute()
    if existing.data:
        db.table("system_settings").update({"value": payload.value}).eq("key", key).execute()
    else:
        db.table("system_settings").insert({"key": key, "value": payload.value}).execute()


# ── notification preferences (per-user) ──────────────────────


class NotifPrefs(BaseModel):
    email_on_wishlist: bool = True
    email_on_allocation: bool = True
    email_on_allocation_response: bool = True
    email_on_rfp_complete: bool = True
    inapp_on_skill_update: bool = True


@router.get("/me/notification-prefs")
async def get_my_prefs(current_user: UserOut = Depends(get_current_user)):
    db = get_db()
    result = (
        db.table("user_notification_prefs")
        .select("*")
        .eq("user_id", str(current_user.id))
        .execute()
    )
    if result.data:
        return result.data[0]
    # return defaults
    return {"user_id": str(current_user.id), **NotifPrefs().model_dump()}


@router.put("/me/notification-prefs", status_code=status.HTTP_204_NO_CONTENT)
async def update_my_prefs(
    payload: NotifPrefs,
    current_user: UserOut = Depends(get_current_user),
):
    db = get_db()
    data = {"user_id": str(current_user.id), **payload.model_dump()}
    existing = (
        db.table("user_notification_prefs")
        .select("user_id")
        .eq("user_id", str(current_user.id))
        .execute()
    )
    if existing.data:
        db.table("user_notification_prefs").update(payload.model_dump()).eq("user_id", str(current_user.id)).execute()
    else:
        db.table("user_notification_prefs").insert(data).execute()


# ── license (read-only) ───────────────────────────────────────


@router.get("/license")
async def get_license_info(_: UserOut = Depends(require_admin)):
    return get_license()


class LicenseKeyPayload(BaseModel):
    key: str


@router.post("/license/validate")
async def validate_license_key(payload: LicenseKeyPayload, _: UserOut = Depends(require_admin)):
    return validate_license(payload.key)


# ── storage info (admin only) ─────────────────────────────────


@router.get("/storage")
async def get_storage_info(_: UserOut = Depends(require_admin)):
    provider = (app_settings.storage_provider or "supabase").lower()
    return {
        "provider": provider,
        "configured": provider == "supabase" or bool(app_settings.google_drive_credentials),
    }


class StorageProviderPayload(BaseModel):
    provider: str  # "supabase" | "google_drive"


@router.put("/storage", status_code=status.HTTP_204_NO_CONTENT)
async def set_storage_provider(payload: StorageProviderPayload, _: UserOut = Depends(require_admin)):
    if payload.provider not in ("supabase", "google_drive"):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="provider must be 'supabase' or 'google_drive'")
    db = get_db()
    existing = db.table("system_settings").select("key").eq("key", "storage_provider").execute()
    if existing.data:
        db.table("system_settings").update({"value": payload.provider}).eq("key", "storage_provider").execute()
    else:
        db.table("system_settings").insert({"key": "storage_provider", "value": payload.provider}).execute()
    reset_storage_backend()
