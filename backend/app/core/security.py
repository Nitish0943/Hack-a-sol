import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta, timezone


def hash_password(password: str) -> str:
    """Hash a password using PBKDF2-HMAC-SHA256 with a unique 16-byte salt."""
    salt = secrets.token_bytes(16)
    iterations = 100_000
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return f"{salt.hex()}${iterations}${derived.hex()}"


def verify_password(password: str, hashed: str | None) -> bool:
    """Verify a plain password against the stored salt$iterations$derived string."""
    if not hashed or "$" not in hashed:
        return False
    try:
        parts = hashed.split("$")
        if len(parts) != 3:
            return False
        salt = bytes.fromhex(parts[0])
        iterations = int(parts[1])
        expected = bytes.fromhex(parts[2])
        derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
        return hmac.compare_digest(derived, expected)
    except Exception:
        return False


def generate_session_token() -> str:
    """Generate a secure cryptographically random URL-safe token."""
    return secrets.token_urlsafe(32)


def calculate_session_expiry(hours: int = 8) -> str:
    """Return ISO 8601 UTC timestamp for session expiry."""
    return (datetime.now(timezone.utc) + timedelta(hours=hours)).isoformat()
