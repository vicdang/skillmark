from app.db.client import get_db
from datetime import date
import anthropic
from app.config import settings


def _skill_match_score(employee_skills: list[dict], required_skills: list[dict]) -> float:
    """0-100: % of required skills met at or above required level."""
    if not required_skills:
        return 100.0
    matched = 0
    for req in required_skills:
        skill_id = req.get("skill_id") or req.get("skill")
        req_level = req.get("level", 1)
        emp = next((e for e in employee_skills if e["skill_id"] == skill_id), None)
        if emp and emp["level"] >= req_level:
            matched += 1
    return round(matched / len(required_skills) * 100, 2)


def _seniority_score(employee_skills: list[dict], required_skills: list[dict]) -> float:
    """0-100: average level alignment."""
    if not required_skills:
        return 100.0
    deltas = []
    for req in required_skills:
        skill_id = req.get("skill_id") or req.get("skill")
        req_level = req.get("level", 3)
        emp = next((e for e in employee_skills if e["skill_id"] == skill_id), None)
        emp_level = emp["level"] if emp else 0
        delta = emp_level - req_level
        deltas.append(max(-4, min(4, delta)))
    avg_delta = sum(deltas) / len(deltas)
    return round(max(0, min(100, 50 + avg_delta * 12.5)), 2)


def _availability_score(allocations: list[dict], kick_off: str | None, end: str | None) -> float:
    """0-100: average available % during project timeline."""
    if not kick_off:
        return 100.0
    start_d = date.fromisoformat(kick_off)
    end_d = date.fromisoformat(end) if end else start_d
    months = []
    y, m = start_d.year, start_d.month
    while date(y, m, 1) <= end_d:
        months.append(f"{y:04d}-{m:02d}")
        m += 1
        if m > 12:
            m, y = 1, y + 1
    if not months:
        return 100.0

    by_month: dict[str, int] = {}
    for a in allocations:
        mo = a["month"][:7]
        by_month[mo] = by_month.get(mo, 0) + a["allocation_percentage"]

    avail = [(100 - by_month.get(mo, 0)) for mo in months]
    return round(sum(avail) / len(avail), 2)


def _domain_score(employee_id: str, domain: str | None) -> float:
    """0-100: 100 if employee has worked on a project in the same domain."""
    if not domain:
        return 50.0
    db = get_db()
    result = (
        db.table("allocations")
        .select("project_id, projects(domain)")
        .eq("user_id", employee_id)
        .eq("status", "confirmed")
        .execute()
    )
    for row in result.data:
        proj = row.get("projects") or {}
        if isinstance(proj, dict) and proj.get("domain") == domain:
            return 100.0
    return 0.0


def run_matching(project: dict, employees: list[dict]) -> list[dict]:
    """Score all employees against a project. Returns sorted list."""
    required_skills = project.get("required_skills") or []
    kick_off = project.get("kick_off_date")
    end = project.get("end_date")
    domain = project.get("domain")

    db = get_db()
    results = []

    for emp in employees:
        emp_id = str(emp["id"])
        emp_skills_r = db.table("employee_skills").select("skill_id, level").eq("user_id", emp_id).execute()
        emp_skills = emp_skills_r.data or []

        allocs_r = (
            db.table("allocations")
            .select("month, allocation_percentage")
            .eq("user_id", emp_id)
            .eq("status", "confirmed")
            .execute()
        )
        allocs = allocs_r.data or []

        skill = _skill_match_score(emp_skills, required_skills)
        seniority = _seniority_score(emp_skills, required_skills)
        availability = _availability_score(allocs, kick_off, end)
        dom = _domain_score(emp_id, domain)

        total = round(skill * 0.40 + seniority * 0.25 + availability * 0.20 + dom * 0.15, 1)

        results.append({
            "employee_id": emp_id,
            "employee": emp,
            "score": total,
            "breakdown": {
                "skill_match": skill,
                "seniority_fit": seniority,
                "availability": availability,
                "domain_experience": dom,
            },
            "skill_details": _skill_details(emp_skills, required_skills),
            "available_pct": _availability_score(allocs, kick_off, end),
        })

    results.sort(key=lambda r: r["score"], reverse=True)
    return results


def _skill_details(employee_skills: list[dict], required_skills: list[dict]) -> list[dict]:
    if not required_skills:
        return []
    out = []
    for req in required_skills:
        skill_id = req.get("skill_id") or req.get("skill")
        req_level = req.get("level", 1)
        emp = next((e for e in employee_skills if e["skill_id"] == skill_id), None)
        out.append({
            "skill_id": skill_id,
            "required_level": req_level,
            "employee_level": emp["level"] if emp else 0,
            "met": bool(emp and emp["level"] >= req_level),
        })
    return out


async def ai_explain_match(employee: dict, project: dict, breakdown: dict) -> str:
    """Generate a short AI explanation for the match."""
    if not settings.anthropic_api_key:
        return "AI explanation not available (API key not configured)"

    try:
        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        prompt = (
            f"Project: {project.get('title')} ({project.get('domain', 'N/A')})\n"
            f"Employee: {employee.get('full_name')} — {employee.get('job_title', 'N/A')}\n"
            f"Match score: {breakdown.get('score')}%\n"
            f"Breakdown: Skill match {breakdown['breakdown']['skill_match']}%, "
            f"Seniority {breakdown['breakdown']['seniority_fit']}%, "
            f"Availability {breakdown['breakdown']['availability']}%, "
            f"Domain {breakdown['breakdown']['domain_experience']}%\n\n"
            "In 2-3 sentences, explain why this employee is or isn't a good fit. "
            "Mention specific strengths and any gaps."
        )
        msg = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}],
        )
        return msg.content[0].text  # type: ignore[index]
    except Exception as e:
        return f"Error generating explanation: {str(e)}"
