import json
import anthropic
from app.config import settings
from app.db.client import get_db

EXTRACTION_PROMPT = """Extract the following structured information from this RFP document.
Return ONLY valid JSON matching this schema:
{
  "title": string,
  "client_name": string | null,
  "domain": string | null,
  "project_type": string | null,
  "required_skills": [{"skill": string, "level": "Beginner"|"Elementary"|"Intermediate"|"Advanced"|"Expert", "quantity": number}],
  "team_size": number | null,
  "timeline": {"start": "YYYY-MM-DD" | null, "end": "YYYY-MM-DD" | null},
  "budget_range": string | null,
  "tech_stack": [string],
  "deliverables": string | null,
  "compliance_requirements": string | null
}"""


def extract_rfp_background(project_id: str, content: bytes, filename: str, uploader_id: str):
    import logging
    logger = logging.getLogger(__name__)
    try:
        logger.info(f"[RFP] Starting extraction for project {project_id}")
        text = _parse_file(content, filename)
        logger.info(f"[RFP] Parsed file, text length: {len(text)}")
        extracted = _call_ai(text)
        logger.info(f"[RFP] AI extraction complete for project {project_id}")
        db = get_db()
        db.table("projects").update({"rfp_extracted_data": extracted}).eq("id", project_id).execute()
        logger.info(f"[RFP] Database updated for project {project_id}")
        db.table("notifications").insert({
            "user_id": uploader_id,
            "type": "rfp_extraction_complete",
            "title": "RFP extraction complete",
            "message": f"AI extracted data from your RFP for project {project_id}",
            "link": f"/projects/{project_id}",
        }).execute()
    except Exception as e:
        logger.error(f"[RFP] Extraction failed for project {project_id}: {e}", exc_info=True)
        db = get_db()
        db.table("notifications").insert({
            "user_id": uploader_id,
            "type": "rfp_extraction_complete",
            "title": "RFP extraction failed",
            "message": str(e),
        }).execute()


def _parse_file(content: bytes, filename: str) -> str:
    if filename.lower().endswith(".pdf"):
        import fitz  # type: ignore[import]
        doc = fitz.open(stream=content, filetype="pdf")
        return "\n".join(page.get_text() for page in doc)
    elif filename.lower().endswith(".docx"):
        import io
        from docx import Document  # type: ignore[import]
        doc = Document(io.BytesIO(content))
        return "\n".join(p.text for p in doc.paragraphs)
    return content.decode("utf-8", errors="ignore")


def _call_ai(text: str) -> dict:
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        messages=[
            {
                "role": "user",
                "content": f"{EXTRACTION_PROMPT}\n\nRFP DOCUMENT:\n{text[:20000]}",
            }
        ],
    )
    raw = message.content[0].text
    start = raw.find("{")
    end = raw.rfind("}") + 1
    return json.loads(raw[start:end])
