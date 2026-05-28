from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import get_current_user, require_admin
from app.models.user import UserOut
from app.models.skill import EmployeeSkillCreate, EmployeeSkillUpdate, EmployeeSkillOut, EmployeeSkillSummaryOut
from app.db.client import get_db
import uuid
from datetime import datetime, timezone

router = APIRouter(tags=["skills"])


# ── Taxonomy Admin CRUD ──────────────────────────────────────────────────────

@router.post("/skills/domains", status_code=status.HTTP_201_CREATED)
async def create_domain(payload: dict, _: UserOut = Depends(require_admin)):
    db = get_db()
    result = db.table("skill_domains").insert(payload).execute()
    return result.data[0]


@router.put("/skills/domains/{domain_id}")
async def update_domain(domain_id: uuid.UUID, payload: dict, _: UserOut = Depends(require_admin)):
    db = get_db()
    result = db.table("skill_domains").update(payload).eq("id", str(domain_id)).execute()
    return result.data[0]


@router.delete("/skills/domains/{domain_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_domain(domain_id: uuid.UUID, _: UserOut = Depends(require_admin)):
    db = get_db()
    db.table("skill_domains").delete().eq("id", str(domain_id)).execute()


@router.post("/skills/categories", status_code=status.HTTP_201_CREATED)
async def create_category(payload: dict, _: UserOut = Depends(require_admin)):
    db = get_db()
    result = db.table("skill_categories").insert(payload).execute()
    return result.data[0]


@router.put("/skills/categories/{category_id}")
async def update_category(category_id: uuid.UUID, payload: dict, _: UserOut = Depends(require_admin)):
    db = get_db()
    result = db.table("skill_categories").update(payload).eq("id", str(category_id)).execute()
    return result.data[0]


@router.delete("/skills/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: uuid.UUID, _: UserOut = Depends(require_admin)):
    db = get_db()
    db.table("skill_categories").delete().eq("id", str(category_id)).execute()


@router.post("/skills/items", status_code=status.HTTP_201_CREATED)
async def create_skill_item(payload: dict, _: UserOut = Depends(require_admin)):
    db = get_db()
    result = db.table("skills").insert(payload).execute()
    return result.data[0]


@router.put("/skills/items/{skill_id}")
async def update_skill_item(skill_id: uuid.UUID, payload: dict, _: UserOut = Depends(require_admin)):
    db = get_db()
    result = db.table("skills").update(payload).eq("id", str(skill_id)).execute()
    return result.data[0]


@router.delete("/skills/items/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_skill_item(skill_id: uuid.UUID, _: UserOut = Depends(require_admin)):
    db = get_db()
    db.table("skills").delete().eq("id", str(skill_id)).execute()


# ── Public taxonomy read ─────────────────────────────────────────────────────

@router.get("/skills/taxonomy")
async def get_taxonomy(_: UserOut = Depends(get_current_user)):
    db = get_db()
    domains = db.table("skill_domains").select("*").eq("is_active", True).order("sort_order").execute()
    categories = db.table("skill_categories").select("*").eq("is_active", True).order("sort_order").execute()
    skills = db.table("skills").select("*").eq("is_active", True).order("sort_order").execute()
    return {
        "domains": domains.data,
        "categories": categories.data,
        "skills": skills.data,
    }


@router.get("/users/{user_id}/skills", response_model=list[EmployeeSkillOut])
async def get_employee_skills(user_id: uuid.UUID, _: UserOut = Depends(get_current_user)):
    db = get_db()
    result = (
        db.table("employee_skills")
        .select("*, skill:skills(*)")
        .eq("user_id", str(user_id))
        .execute()
    )
    return [EmployeeSkillOut(**r) for r in result.data]


@router.get("/employees/summaries", response_model=dict[str, EmployeeSkillSummaryOut])
async def get_all_employees_skill_summaries(_: UserOut = Depends(get_current_user)):
    db = get_db()

    employee_skills = (
        db.table("employee_skills")
        .select("user_id, level, skill_id")
        .execute()
    )

    skills_data = db.table("skills").select("id, category_id").execute()
    skill_map = {s["id"]: s["category_id"] for s in skills_data.data}

    categories_data = db.table("skill_categories").select("id, domain_id").execute()
    category_map = {c["id"]: c["domain_id"] for c in categories_data.data}

    domains_data = db.table("skill_domains").select("id, name").execute()
    domain_map = {d["id"]: d["name"] for d in domains_data.data}

    summaries: dict[str, dict] = {}
    for row in employee_skills.data:
        user_id = str(row["user_id"])
        level = row["level"]
        skill_id = row["skill_id"]

        if user_id not in summaries:
            summaries[user_id] = {
                "total_skills": 0,
                "levels": [],
                "domain_names": set(),
            }

        summaries[user_id]["total_skills"] += 1
        summaries[user_id]["levels"].append(level)

        category_id = skill_map.get(skill_id)
        if category_id:
            domain_id = category_map.get(category_id)
            if domain_id:
                domain_name = domain_map.get(domain_id)
                if domain_name:
                    summaries[user_id]["domain_names"].add(domain_name)

    result_map = {}
    for user_id, data in summaries.items():
        avg_level = sum(data["levels"]) / len(data["levels"]) if data["levels"] else 0
        domains = sorted(list(data["domain_names"]))

        strongest_domain = None
        if domains:
            domain_levels: dict[str, list[int]] = {}
            for row in employee_skills.data:
                if str(row["user_id"]) == user_id:
                    skill_id = row["skill_id"]
                    level = row["level"]
                    category_id = skill_map.get(skill_id)
                    if category_id:
                        domain_id = category_map.get(category_id)
                        if domain_id:
                            domain_name = domain_map.get(domain_id)
                            if domain_name:
                                if domain_name not in domain_levels:
                                    domain_levels[domain_name] = []
                                domain_levels[domain_name].append(level)

            if domain_levels:
                domain_avgs = {d: sum(levels) / len(levels) for d, levels in domain_levels.items()}
                strongest_domain = max(domain_avgs.items(), key=lambda x: x[1])[0]

        result_map[user_id] = EmployeeSkillSummaryOut(
            user_id=uuid.UUID(user_id),
            total_skills=data["total_skills"],
            avg_level=round(avg_level, 2),
            domains=domains,
            strongest_domain=strongest_domain,
        )

    return result_map


@router.post("/my/skills", response_model=EmployeeSkillOut, status_code=status.HTTP_201_CREATED)
async def add_skill(payload: EmployeeSkillCreate, current_user: UserOut = Depends(get_current_user)):
    db = get_db()
    existing = (
        db.table("employee_skills")
        .select("id")
        .eq("user_id", str(current_user.id))
        .eq("skill_id", str(payload.skill_id))
        .execute()
    )
    if existing.data:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Skill already added")

    data = {
        "user_id": str(current_user.id),
        "skill_id": str(payload.skill_id),
        "level": payload.level,
        "years_experience": payload.years_experience,
        "evidence_url": payload.evidence_url,
        "evidence_note": payload.evidence_note,
    }
    result = db.table("employee_skills").insert(data).execute()
    db.table("skill_audit_log").insert({
        "user_id": str(current_user.id),
        "skill_id": str(payload.skill_id),
        "action": "add",
        "new_level": payload.level,
        "changed_by": str(current_user.id),
    }).execute()
    return EmployeeSkillOut(**result.data[0])


@router.put("/my/skills/{skill_id}", response_model=EmployeeSkillOut)
async def update_skill(
    skill_id: uuid.UUID,
    payload: EmployeeSkillUpdate,
    current_user: UserOut = Depends(get_current_user),
):
    db = get_db()
    existing = (
        db.table("employee_skills")
        .select("*")
        .eq("id", str(skill_id))
        .eq("user_id", str(current_user.id))
        .single()
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")

    updates = payload.model_dump(exclude_none=True)
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = db.table("employee_skills").update(updates).eq("id", str(skill_id)).execute()

    if payload.level and payload.level != existing.data["level"]:
        db.table("skill_audit_log").insert({
            "user_id": str(current_user.id),
            "skill_id": existing.data["skill_id"],
            "action": "update",
            "old_level": existing.data["level"],
            "new_level": payload.level,
            "changed_by": str(current_user.id),
        }).execute()

    return EmployeeSkillOut(**result.data[0])


@router.delete("/my/skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_skill(skill_id: uuid.UUID, current_user: UserOut = Depends(get_current_user)):
    db = get_db()
    existing = (
        db.table("employee_skills")
        .select("*")
        .eq("id", str(skill_id))
        .eq("user_id", str(current_user.id))
        .single()
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")

    db.table("employee_skills").delete().eq("id", str(skill_id)).execute()
    db.table("skill_audit_log").insert({
        "user_id": str(current_user.id),
        "skill_id": existing.data["skill_id"],
        "action": "remove",
        "old_level": existing.data["level"],
        "changed_by": str(current_user.id),
    }).execute()
