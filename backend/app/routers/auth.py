from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.dependencies import get_current_user
from app.models.user import UserOut
from app.db.client import get_db

router = APIRouter(prefix="/auth", tags=["auth"])
bearer = HTTPBearer()


@router.get("/me", response_model=UserOut)
async def me(current_user: UserOut = Depends(get_current_user)):
    if current_user.is_active is False:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact an administrator for more information."
        )
    return current_user


@router.post("/upsert-profile", response_model=UserOut)
async def upsert_profile(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
):
    """
    Called after OAuth sign-in to ensure a public.users row exists.
    The DB trigger handles it on first signup, but can lose the race
    on fast redirects — this is the fallback.
    """
    db = get_db()
    try:
        response = db.auth.get_user(credentials.credentials)
        auth_user = response.user
        if not auth_user:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    meta = auth_user.user_metadata or {}
    full_name = (
        meta.get("full_name")
        or meta.get("name")
        or (auth_user.email or "").split("@")[0]
    )
    avatar_url = meta.get("avatar_url") or meta.get("picture")

    result = db.table("users").upsert(
        {
            "supabase_auth_id": str(auth_user.id),
            "email": auth_user.email,
            "full_name": full_name,
            "avatar_url": avatar_url,
        },
        on_conflict="supabase_auth_id",
    ).execute()

    return UserOut(**result.data[0])


@router.post("/sync-profile")
async def sync_profile(current_user: UserOut = Depends(get_current_user)):
    return {"status": "ok", "user_id": str(current_user.id)}
