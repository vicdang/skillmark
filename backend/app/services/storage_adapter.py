"""
Storage adapter — abstracts Supabase Storage and Google Drive.

Select via STORAGE_PROVIDER env var: "supabase" (default) | "google_drive".
For Google Drive, set GOOGLE_DRIVE_CREDENTIALS to a path to a service account JSON file.

Interface:
    upload(path: str, content: bytes, content_type: str) -> str  # returns public/download URL
    delete(path: str) -> None
"""

import json
import io
import logging
from abc import ABC, abstractmethod

from app.config import settings

logger = logging.getLogger(__name__)


class StorageBackend(ABC):
    @abstractmethod
    def upload(self, path: str, content: bytes, content_type: str) -> str:
        """Upload file; return publicly accessible URL."""

    @abstractmethod
    def delete(self, path: str) -> None:
        """Delete a previously uploaded file by its path (as returned from upload)."""


# ── Supabase Storage ─────────────────────────────────────────────────────────

class SupabaseStorage(StorageBackend):
    BUCKET = "rfp-files"

    def upload(self, path: str, content: bytes, content_type: str) -> str:
        from app.db.client import get_db
        from fastapi import HTTPException
        db = get_db()
        file_options = {"content-type": content_type}
        try:
            db.storage.from_(self.BUCKET).upload(path, content, file_options)
        except Exception as e:
            err_str = str(e).lower()
            if "already exists" in err_str or "duplicate" in err_str or "23505" in err_str:
                try:
                    db.storage.from_(self.BUCKET).remove([path])
                except Exception:
                    pass
                db.storage.from_(self.BUCKET).upload(path, content, file_options)
            elif "not found" in err_str or "does not exist" in err_str or "bucket" in err_str:
                raise HTTPException(
                    status_code=500,
                    detail=f"Storage bucket '{self.BUCKET}' not found. Create it in Supabase Storage.",
                )
            else:
                logger.exception("Supabase storage upload failed: %s", e)
                raise
        return db.storage.from_(self.BUCKET).get_public_url(path)

    def delete(self, path: str) -> None:
        from app.db.client import get_db
        db = get_db()
        db.storage.from_(self.BUCKET).remove([path])


# ── Google Drive Storage ─────────────────────────────────────────────────────

class GoogleDriveStorage(StorageBackend):
    """
    Uses a service account to upload files to a shared Drive folder.
    Requires: google-auth, google-api-python-client packages.

    The folder ID is read from system_settings key 'google_drive_folder_id',
    falling back to the root of the service account's My Drive.
    """

    def _get_service(self):
        try:
            from googleapiclient.discovery import build
            from google.oauth2 import service_account
        except ImportError as exc:
            raise RuntimeError(
                "Google Drive storage requires google-api-python-client and google-auth. "
                "Run: pip install google-api-python-client google-auth"
            ) from exc

        creds_path = settings.google_drive_credentials
        if not creds_path:
            raise RuntimeError("GOOGLE_DRIVE_CREDENTIALS env var must point to a service account JSON file.")

        creds = service_account.Credentials.from_service_account_file(
            creds_path,
            scopes=["https://www.googleapis.com/auth/drive"],
        )
        return build("drive", "v3", credentials=creds, cache_discovery=False)

    def _get_folder_id(self) -> str | None:
        try:
            from app.db.client import get_db
            db = get_db()
            result = db.table("system_settings").select("value").eq("key", "google_drive_folder_id").execute()
            if result.data:
                return result.data[0]["value"]
        except Exception:
            pass
        return None

    def upload(self, path: str, content: bytes, content_type: str) -> str:
        from googleapiclient.http import MediaIoBaseUpload

        service = self._get_service()
        folder_id = self._get_folder_id()
        name = path.split("/")[-1]

        file_metadata = {"name": name}
        if folder_id:
            file_metadata["parents"] = [folder_id]

        media = MediaIoBaseUpload(io.BytesIO(content), mimetype=content_type, resumable=True)
        created = service.files().create(
            body=file_metadata,
            media_body=media,
            fields="id, webViewLink",
        ).execute()

        # Make readable by anyone with the link
        service.permissions().create(
            fileId=created["id"],
            body={"type": "anyone", "role": "reader"},
        ).execute()

        return created.get("webViewLink", f"https://drive.google.com/file/d/{created['id']}/view")

    def delete(self, path: str) -> None:
        # path stored as Drive file ID when using GDrive backend
        service = self._get_service()
        try:
            service.files().delete(fileId=path).execute()
        except Exception as exc:
            logger.warning("Google Drive delete failed for %s: %s", path, exc)


# ── Factory ──────────────────────────────────────────────────────────────────

_backend: StorageBackend | None = None


def get_storage() -> StorageBackend:
    global _backend
    if _backend is None:
        provider = (settings.storage_provider or "supabase").lower()
        if provider == "google_drive":
            _backend = GoogleDriveStorage()
            logger.info("Storage adapter: Google Drive")
        else:
            _backend = SupabaseStorage()
            logger.info("Storage adapter: Supabase Storage")
    return _backend


def reset_storage_backend() -> None:
    """Force re-initialization (useful after settings change at runtime)."""
    global _backend
    _backend = None
