import hashlib
import hmac
import secrets
import base64
import os

from app.services.platform_service import get_user, get_user_by_email


def hash_password(password):
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 120000)
    return f"{salt.hex()}:{digest.hex()}"


def verify_password(password, stored):
    try:
        salt, digest = stored.split(":", 1)
        candidate = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), 120000)
        return hmac.compare_digest(candidate.hex(), digest)
    except (ValueError, TypeError):
        return False


def authenticate(email, password):
    user = get_user_by_email(email)
    if not user or not verify_password(password, user["password_hash"]):
        return None
    return get_user(user["id"])


def create_token(user_id):
    payload = str(user_id).encode()
    secret = os.getenv("FARMSENSE_SESSION_SECRET", "local-development-session-secret").encode()
    signature = hmac.new(secret, payload, hashlib.sha256).hexdigest().encode()
    return base64.urlsafe_b64encode(payload + b"." + signature).decode()


def user_id_from_token(token):
    try:
        decoded = base64.urlsafe_b64decode(token.encode())
        user_id, signature = decoded.split(b".", 1)
        secret = os.getenv("FARMSENSE_SESSION_SECRET", "local-development-session-secret").encode()
        expected = hmac.new(secret, user_id, hashlib.sha256).hexdigest().encode()
        if not hmac.compare_digest(signature, expected):
            return None
        return int(user_id)
    except (ValueError, TypeError, UnicodeError):
        return None
