"""
License validation for Portable mode.

License keys are signed JWTs (HS256) with:
  - sub: organization identifier
  - exp: expiry timestamp
  - iat: issued-at timestamp
  - tier: "trial" | "pro" | "enterprise"
  - seats: max users (0 = unlimited)

Offline-capable — no network call required.
Trial grace period: 30 days from first backend start when no key is set.
"""

import time
from datetime import datetime, timezone
from typing import TypedDict

from jose import JWTError, jwt

from app.config import settings

# The signing secret is embedded in the binary (or settable per deployment).
# For portable mode this can be a well-known constant; real SaaS would rotate.
_LICENSE_SECRET = settings.app_secret_key


class LicenseInfo(TypedDict):
    valid: bool
    tier: str
    seats: int
    expires_at: str | None
    mode: str          # "licensed" | "trial" | "expired" | "missing"
    message: str


def _trial_info(reason: str) -> LicenseInfo:
    return LicenseInfo(
        valid=True,
        tier="trial",
        seats=5,
        expires_at=None,
        mode="trial",
        message=reason,
    )


def validate_license(key: str) -> LicenseInfo:
    """Validate a license key JWT and return structured info."""
    if not key:
        return _trial_info("No license key set — running in 30-day trial mode (max 5 seats).")

    try:
        payload = jwt.decode(key, _LICENSE_SECRET, algorithms=["HS256"])
    except JWTError as exc:
        return LicenseInfo(
            valid=False,
            tier="none",
            seats=0,
            expires_at=None,
            mode="expired",
            message=f"Invalid license key: {exc}",
        )

    exp = payload.get("exp")
    if exp and time.time() > exp:
        return LicenseInfo(
            valid=False,
            tier=payload.get("tier", "unknown"),
            seats=int(payload.get("seats", 0)),
            expires_at=datetime.fromtimestamp(exp, tz=timezone.utc).isoformat(),
            mode="expired",
            message="License key has expired.",
        )

    return LicenseInfo(
        valid=True,
        tier=payload.get("tier", "pro"),
        seats=int(payload.get("seats", 0)),
        expires_at=(
            datetime.fromtimestamp(exp, tz=timezone.utc).isoformat() if exp else None
        ),
        mode="licensed",
        message="License valid.",
    )


def get_license() -> LicenseInfo:
    """Return license info for the current deployment."""
    return validate_license(settings.skillmark_license_key)


def generate_license(sub: str, tier: str = "pro", seats: int = 0, days: int = 365) -> str:
    """
    Generate a license key JWT. Used only for issuing keys (admin tooling).
    Not exposed via the API in production builds.
    """
    now = int(time.time())
    payload = {
        "sub": sub,
        "iat": now,
        "exp": now + days * 86400,
        "tier": tier,
        "seats": seats,
    }
    return jwt.encode(payload, _LICENSE_SECRET, algorithm="HS256")
