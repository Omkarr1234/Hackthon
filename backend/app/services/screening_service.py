import hashlib
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from fastapi import UploadFile

from app.services.data_service import get_conditions_by_crop

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "data" / "agri.db"
UPLOAD_DIR = BASE_DIR / "data" / "uploads"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024


def init_db():
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS screening_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                crop_id TEXT NOT NULL,
                predicted_condition TEXT NOT NULL,
                confidence REAL,
                mode TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        connection.commit()


def _validate_upload(file: UploadFile, file_bytes: bytes):
    file_name = file.filename or ""
    extension = Path(file_name).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError("Only .jpg, .jpeg, and .png files are allowed.")
    if len(file_bytes) > MAX_UPLOAD_BYTES:
        raise ValueError("Image must be smaller than 5 MB.")


def _pick_condition(crop_id: str, file_bytes: bytes):
    conditions = get_conditions_by_crop(crop_id)
    if not conditions:
        return None
    digest = hashlib.sha256(file_bytes).hexdigest()
    index = int(digest[:8], 16) % len(conditions)
    return conditions[index]


def _confidence_from_bytes(file_bytes: bytes):
    digest = hashlib.md5(file_bytes).hexdigest()
    value = int(digest[:2], 16)
    return round(0.55 + (value / 255) * 0.35, 2)


def _save_upload(file_name: str, file_bytes: bytes):
    safe_name = f"{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{file_name}"
    file_path = UPLOAD_DIR / safe_name
    with open(file_path, "wb") as output:
        output.write(file_bytes)
    return file_path


def _log_screening(crop_id: str, condition_id: str, confidence: float | None, mode: str):
    with sqlite3.connect(DB_PATH) as connection:
        connection.execute(
            """
            INSERT INTO screening_logs (crop_id, predicted_condition, confidence, mode, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                crop_id,
                condition_id,
                confidence,
                mode,
                datetime.now(timezone.utc).isoformat(),
            ),
        )
        connection.commit()


async def run_screening(crop_id: str, file: UploadFile):
    file_bytes = await file.read()
    _validate_upload(file, file_bytes)
    _save_upload(file.filename or "upload.jpg", file_bytes)

    condition = _pick_condition(crop_id, file_bytes)
    if condition is None:
        raise ValueError("No conditions found for the selected crop.")

    confidence = _confidence_from_bytes(file_bytes)
    _log_screening(crop_id, condition["id"], confidence, "demo")

    return {
        "mode": "demo",
        "possible_condition_id": condition["id"],
        "confidence": confidence,
        "disclaimer": "AI-assisted screening only. This is not a laboratory-confirmed diagnosis.",
        "escalation_note": "If symptoms are severe or spreading quickly, consult an agricultural expert.",
    }
