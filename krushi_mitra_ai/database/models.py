from dataclasses import dataclass


@dataclass
class UserModel:
    user_id: str
    full_name: str
    phone: str
    email: str
    password_hash: str
    language: str
    profile_photo_path: str | None
    created_at: str


@dataclass
class ReportModel:
    report_id: int
    user_id: str
    report_type: str
    created_at: str
    summary: str
    file_path: str
