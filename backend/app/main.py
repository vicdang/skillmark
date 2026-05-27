import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings as app_config
from app.routers import auth, users, skills, projects, notifications, dashboard, matching
from app.routers import settings as settings_router
from app.services.license import get_license

logger = logging.getLogger(__name__)

app = FastAPI(
    title="SkillMark API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=app_config.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(skills.router, prefix=API_PREFIX)
app.include_router(projects.router, prefix=API_PREFIX)
app.include_router(notifications.router, prefix=API_PREFIX)
app.include_router(dashboard.router, prefix=API_PREFIX)
app.include_router(matching.router, prefix=API_PREFIX)
app.include_router(settings_router.router, prefix=API_PREFIX)


@app.on_event("startup")
async def _log_license():
    lic = get_license()
    if lic["valid"]:
        logger.info("License: mode=%s tier=%s seats=%s", lic["mode"], lic["tier"], lic["seats"])
    else:
        logger.warning("License: %s", lic["message"])


@app.get("/health")
async def health():
    lic = get_license()
    return {"status": "ok", "version": "1.0.0", "license": lic["mode"], "license_valid": lic["valid"]}
