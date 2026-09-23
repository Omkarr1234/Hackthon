import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from krushi_mitra_ai.config import DB_PATH, PROFILE_DIR


@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
    with get_conn() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                full_name TEXT NOT NULL,
                phone TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                language TEXT NOT NULL,
                profile_photo_path TEXT,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS reports (
                report_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                report_type TEXT NOT NULL,
                created_at TEXT NOT NULL,
                summary TEXT NOT NULL,
                file_path TEXT NOT NULL,
                metadata_json TEXT,
                FOREIGN KEY (user_id) REFERENCES users (user_id)
            );

            CREATE TABLE IF NOT EXISTS npk_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                data_json TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS soil_scans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                data_json TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS crop_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                data_json TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS market_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                data_json TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS password_resets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                channel TEXT NOT NULL,
                otp_hash TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                created_at TEXT NOT NULL,
                attempts INTEGER NOT NULL DEFAULT 0,
                consumed INTEGER NOT NULL DEFAULT 0
            );
            """
        )


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_user(user: dict[str, Any]) -> None:
    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO users (user_id, full_name, phone, email, password_hash, language, profile_photo_path, created_at)
            VALUES (:user_id, :full_name, :phone, :email, :password_hash, :language, :profile_photo_path, :created_at)
            """,
            user,
        )


def get_user_by_user_id(user_id: str):
    with get_conn() as conn:
        return conn.execute("SELECT * FROM users WHERE user_id = ?", (user_id,)).fetchone()


def get_user_by_phone(phone: str):
    with get_conn() as conn:
        return conn.execute("SELECT * FROM users WHERE phone = ?", (phone,)).fetchone()


def get_user_by_email(email: str):
    with get_conn() as conn:
        return conn.execute("SELECT * FROM users WHERE lower(email) = lower(?)", (email,)).fetchone()


def update_user_password(user_id: str, password_hash: str) -> None:
    with get_conn() as conn:
        conn.execute("UPDATE users SET password_hash = ? WHERE user_id = ?", (password_hash, user_id))


def update_user_language(user_id: str, language: str) -> None:
    with get_conn() as conn:
        conn.execute("UPDATE users SET language = ? WHERE user_id = ?", (language, user_id))


def update_user_profile(user_id: str, full_name: str, phone: str, email: str, profile_photo_path: str | None) -> None:
    with get_conn() as conn:
        conn.execute(
            """
            UPDATE users
            SET full_name = ?, phone = ?, email = ?, profile_photo_path = COALESCE(?, profile_photo_path)
            WHERE user_id = ?
            """,
            (full_name, phone, email, profile_photo_path, user_id),
        )


def save_profile_photo(user_id: str, image_bytes: bytes, extension: str) -> str:
    profile_path = PROFILE_DIR / f"{user_id}{extension}"
    profile_path.write_bytes(image_bytes)
    return str(profile_path)


def insert_password_reset(user_id: str, channel: str, otp_hash: str, expiry_minutes: int = 5) -> None:
    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO password_resets (user_id, channel, otp_hash, expires_at, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                user_id,
                channel,
                otp_hash,
                (datetime.now(timezone.utc) + timedelta(minutes=expiry_minutes)).isoformat(),
                now_iso(),
            ),
        )


def can_request_otp(user_id: str, cooldown_seconds: int = 45) -> bool:
    with get_conn() as conn:
        row = conn.execute(
            """
            SELECT created_at FROM password_resets
            WHERE user_id = ?
            ORDER BY id DESC LIMIT 1
            """,
            (user_id,),
        ).fetchone()
    if not row:
        return True
    last = datetime.fromisoformat(row["created_at"])
    return datetime.now(timezone.utc) - last > timedelta(seconds=cooldown_seconds)


def consume_valid_otp(user_id: str, otp_hash: str) -> bool:
    with get_conn() as conn:
        row = conn.execute(
            """
            SELECT * FROM password_resets
            WHERE user_id = ? AND consumed = 0
            ORDER BY id DESC LIMIT 1
            """,
            (user_id,),
        ).fetchone()
        if not row:
            return False

        if datetime.now(timezone.utc) > datetime.fromisoformat(row["expires_at"]):
            return False
        if row["attempts"] >= 5:
            return False

        conn.execute("UPDATE password_resets SET attempts = attempts + 1 WHERE id = ?", (row["id"],))
        if row["otp_hash"] != otp_hash:
            return False

        conn.execute("UPDATE password_resets SET consumed = 1 WHERE id = ?", (row["id"],))
        return True


def save_report(user_id: str, report_type: str, summary: str, file_path: str, metadata: dict[str, Any] | None = None):
    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO reports (user_id, report_type, created_at, summary, file_path, metadata_json)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (user_id, report_type, now_iso(), summary, file_path, json.dumps(metadata or {})),
        )


def list_user_reports(user_id: str):
    with get_conn() as conn:
        return conn.execute(
            """
            SELECT report_id, report_type, created_at, summary, file_path, metadata_json
            FROM reports WHERE user_id = ? ORDER BY report_id DESC
            """,
            (user_id,),
        ).fetchall()


def save_module_record(table: str, user_id: str, data: dict[str, Any]) -> None:
    with get_conn() as conn:
        conn.execute(
            f"INSERT INTO {table} (user_id, created_at, data_json) VALUES (?, ?, ?)",
            (user_id, now_iso(), json.dumps(data)),
        )
