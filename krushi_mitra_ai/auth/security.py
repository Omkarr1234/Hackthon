import hashlib
import hmac
import re
import secrets
import string


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
    return f"{salt}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt, digest = stored.split("$", 1)
    except ValueError:
        return False
    compare = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000).hex()
    return hmac.compare_digest(compare, digest)


def hash_otp(otp: str) -> str:
    return hashlib.sha256(otp.encode("utf-8")).hexdigest()


def password_strength_error(password: str) -> str | None:
    if len(password) < 8:
        return "Password must be at least 8 characters."
    if not re.search(r"[A-Z]", password):
        return "Password must include at least one uppercase letter."
    if not re.search(r"[a-z]", password):
        return "Password must include at least one lowercase letter."
    if not re.search(r"\d", password):
        return "Password must include at least one number."
    return None


def generate_otp() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def generate_auto_user_id(full_name: str, exists_checker) -> str:
    cleaned = "".join(ch for ch in full_name.lower() if ch in string.ascii_lowercase) or "farmer"
    letters = (cleaned[:2]).ljust(2, "x")
    for _ in range(500):
        code = f"{secrets.randbelow(10_000):04d}AGI{letters}"
        if not exists_checker(code):
            return code
    raise ValueError("Unable to generate unique User ID right now. Please try again.")
