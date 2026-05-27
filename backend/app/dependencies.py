from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.db.client import get_db
from app.models.user import UserOut, Role
import uuid
import logging

logger = logging.getLogger(__name__)
bearer = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
) -> UserOut:
    token = credentials.credentials
    db = get_db()
    try:
        response = db.auth.get_user(token)
        auth_user = response.user
        if not auth_user:
            logger.warning("[get_current_user] Auth user not found from token")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except Exception as e:
        logger.error(f"[get_current_user] Auth verification failed: {str(e)}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    logger.info(f"[get_current_user] Looking up user profile for auth_user: {auth_user.id}")
    result = (
        db.table("users")
        .select("*")
        .eq("supabase_auth_id", str(auth_user.id))
        .single()
        .execute()
    )
    if not result.data:
        logger.error(f"[get_current_user] User profile not found for auth_user: {auth_user.id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")

    logger.info(f"[get_current_user] User found: {result.data['email']}")
    return UserOut(**result.data)


def require_roles(*roles: Role):
    def checker(current_user: UserOut = Depends(get_current_user)) -> UserOut:
        if current_user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return current_user
    return checker


require_admin = require_roles("admin")
require_manager_or_above = require_roles("admin", "manager")
require_employee_or_above = require_roles("admin", "manager", "employee")
