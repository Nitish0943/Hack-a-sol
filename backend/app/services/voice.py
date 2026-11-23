import hashlib
import hmac
import logging
import re
import secrets
from datetime import datetime, timedelta, timezone
from urllib.parse import parse_qsl, urlsplit

from fastapi import HTTPException, Request
from twilio.request_validator import RequestValidator
from twilio.rest import Client

from app.core.config import Settings
from app.db.store import execute, get_connection, one

logger = logging.getLogger(__name__)

MAX_WEBHOOK_BODY_BYTES = 64 * 1024
MAX_WEBHOOK_FIELDS = 100
OTP_LIFETIME_MINUTES = 5
OTP_MAX_ATTEMPTS = 3
OTP_MAX_SENDS_PER_WINDOW = 2
OTP_RATE_WINDOW_MINUTES = 10
MAX_POLICY_QUERIES_PER_CALL = 8
CALL_SID_PATTERN = re.compile(r"[A-Za-z0-9]{1,64}")


class TwilioParams(dict[str, str]):
    def __init__(self, pairs: list[tuple[str, str]]) -> None:
        self._values: dict[str, list[str]] = {}
        for key, value in pairs:
            self._values.setdefault(key, []).append(value)
        super().__init__((key, values[-1]) for key, values in self._values.items())

    def getall(self, key: str) -> list[str]:
        return self._values.get(key, [])


async def validate_twilio_request(request: Request, settings: Settings) -> TwilioParams:
    if not settings.twilio_auth_token or not settings.twilio_webhook_public_url:
        raise HTTPException(status_code=503, detail="Twilio voice webhooks are not configured")

    public_base = urlsplit(settings.twilio_webhook_public_url)
    if (
        public_base.scheme not in {"https", "http"}
        or not public_base.netloc
        or public_base.path not in {"", "/"}
        or public_base.query
        or public_base.fragment
    ):
        raise HTTPException(status_code=503, detail="Twilio public webhook URL is invalid")
    if settings.app_environment.lower() == "production" and public_base.scheme != "https":
        raise HTTPException(status_code=503, detail="Production Twilio webhooks require HTTPS")

    content_type = request.headers.get("content-type", "").split(";", 1)[0].strip().lower()
    if content_type != "application/x-www-form-urlencoded":
        raise HTTPException(status_code=415, detail="Twilio webhooks must use form-encoded requests")

    body = await request.body()
    if len(body) > MAX_WEBHOOK_BODY_BYTES:
        raise HTTPException(status_code=413, detail="Twilio webhook payload is too large")

    try:
        pairs = parse_qsl(
            body.decode("utf-8"),
            keep_blank_values=True,
            max_num_fields=MAX_WEBHOOK_FIELDS,
        )
    except (UnicodeDecodeError, ValueError):
        raise HTTPException(status_code=400, detail="Twilio webhook payload is invalid") from None

    params = TwilioParams(pairs)
    signature = request.headers.get("x-twilio-signature", "")
    if not signature:
        raise HTTPException(status_code=403, detail="Invalid Twilio signature")

    url = f"{settings.twilio_webhook_public_url.rstrip('/')}{request.url.path}"
    if request.url.query:
        url = f"{url}?{request.url.query}"
    signature_settings = request.headers.get("x-twilio-webhooks-signature-settings", "")
    algorithm = (
        "HMAC_SHA256"
        if "algorithm=HMAC_SHA256" in signature_settings
        else "HMAC_SHA1"
    )
    if not RequestValidator(settings.twilio_auth_token).validate(
        url,
        params,
        signature,
        algorithm=algorithm,
    ):
        raise HTTPException(status_code=403, detail="Invalid Twilio signature")
    return params


def valid_call_sid(value: str | None) -> str:
    if not value or not CALL_SID_PATTERN.fullmatch(value):
        raise HTTPException(status_code=400, detail="Call identifier is missing or invalid")
    return value


def create_call_session(call_sid: str, default_language: str) -> dict[str, object]:
    execute(
        "INSERT OR IGNORE INTO voice_call_sessions(call_sid,language,state) VALUES(?,?,?)",
        (call_sid, default_language, "language"),
    )
    session = one("SELECT * FROM voice_call_sessions WHERE call_sid=?", (call_sid,))
    if not session:
        raise RuntimeError("Voice call session could not be created")
    return session


def update_call_session(call_sid: str, **fields: object) -> None:
    allowed_fields = {
        "candidate_user_id",
        "verified_user_id",
        "language",
        "state",
        "current_intent",
        "pending_summary",
        "invalid_attempts",
        "call_status",
        "duration_seconds",
        "outcome",
        "ended_at",
    }
    if not fields or any(field not in allowed_fields for field in fields):
        raise ValueError("Unsupported voice session update")
    assignments = [f"{field}=?" for field in fields]
    values = list(fields.values())
    assignments.append("updated_at=CURRENT_TIMESTAMP")
    execute(
        f"UPDATE voice_call_sessions SET {','.join(assignments)} WHERE call_sid=?",
        (*values, call_sid),
    )


def get_call_session(call_sid: str) -> dict[str, object] | None:
    return one("SELECT * FROM voice_call_sessions WHERE call_sid=?", (call_sid,))


def claim_policy_query(call_sid: str) -> bool:
    with get_connection() as connection:
        connection.execute("BEGIN IMMEDIATE")
        row = connection.execute(
            "SELECT policy_query_count FROM voice_call_sessions WHERE call_sid=?",
            (call_sid,),
        ).fetchone()
        if not row or int(row["policy_query_count"]) >= MAX_POLICY_QUERIES_PER_CALL:
            return False
        connection.execute(
            """
            UPDATE voice_call_sessions
            SET policy_query_count=policy_query_count+1,updated_at=CURRENT_TIMESTAMP
            WHERE call_sid=?
            """,
            (call_sid,),
        )
    return True


def normalize_indian_mobile(value: str | None) -> str | None:
    if not value:
        return None
    digits = re.sub(r"\D", "", value)
    if len(digits) == 10 and digits[0] in "6789":
        return digits
    if len(digits) == 12 and digits.startswith("91") and digits[2] in "6789":
        return digits[2:]
    return None


def indian_mobile_e164(value: str | None) -> str | None:
    normalized = normalize_indian_mobile(value)
    return f"+91{normalized}" if normalized else None


def find_caller_user(caller_number: str | None) -> dict[str, object] | None:
    mobile = normalize_indian_mobile(caller_number)
    if not mobile:
        return None
    return one(
        "SELECT id,mobile_number,preferred_language FROM users WHERE mobile_number IN (?,?,?) AND is_active=1",
        (mobile, f"+91{mobile}", f"91{mobile}"),
    )


def create_voice_otp(call_sid: str, user_id: str, settings: Settings) -> str | None:
    code = f"{secrets.randbelow(1_000_000):06d}"
    digest = hmac.new(
        settings.voice_otp_secret.encode("utf-8"),
        f"{call_sid}:{code}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    expires_at = (datetime.now(timezone.utc) + timedelta(minutes=OTP_LIFETIME_MINUTES)).isoformat()

    with get_connection() as connection:
        connection.execute("BEGIN IMMEDIATE")
        recent = connection.execute(
            """
            SELECT COUNT(*) AS count FROM voice_otp_challenges
            WHERE user_id=? AND created_at >= datetime('now', ?)
            """,
            (user_id, f"-{OTP_RATE_WINDOW_MINUTES} minutes"),
        ).fetchone()
        if recent and int(recent["count"]) >= OTP_MAX_SENDS_PER_WINDOW:
            return None
        connection.execute(
            """
            INSERT OR REPLACE INTO voice_otp_challenges
              (call_sid,user_id,code_hash,attempts,expires_at,created_at,verified_at)
            VALUES(?,?,?,0,?,CURRENT_TIMESTAMP,NULL)
            """,
            (call_sid, user_id, digest, expires_at),
        )
    return code


def verify_voice_otp(call_sid: str, user_id: str, code: str, settings: Settings) -> str:
    now = datetime.now(timezone.utc)
    with get_connection() as connection:
        connection.execute("BEGIN IMMEDIATE")
        row = connection.execute(
            "SELECT * FROM voice_otp_challenges WHERE call_sid=? AND user_id=?",
            (call_sid, user_id),
        ).fetchone()
        if not row:
            return "missing"
        if row["verified_at"]:
            return "used"
        if datetime.fromisoformat(row["expires_at"]) <= now:
            return "expired"
        if int(row["attempts"]) >= OTP_MAX_ATTEMPTS:
            return "locked"

        submitted = hmac.new(
            settings.voice_otp_secret.encode("utf-8"),
            f"{call_sid}:{code}".encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(row["code_hash"], submitted):
            connection.execute(
                "UPDATE voice_otp_challenges SET attempts=attempts+1 WHERE call_sid=?",
                (call_sid,),
            )
            return "locked" if int(row["attempts"]) + 1 >= OTP_MAX_ATTEMPTS else "invalid"
        connection.execute(
            "UPDATE voice_otp_challenges SET verified_at=? WHERE call_sid=?",
            (now.isoformat(), call_sid),
        )
        return "verified"


def send_voice_otp(settings: Settings, to_number: str, code: str, language: str) -> None:
    from_number = settings.twilio_phone_number
    if not settings.twilio_account_sid or not settings.twilio_auth_token or not from_number:
        raise RuntimeError("Twilio SMS is not configured")
    if language == "hi":
        body = f"कृषिसेतु सत्यापन कोड {code} है। यह 5 मिनट में समाप्त होगा। इसे किसी से साझा न करें।"
    else:
        body = f"Your KrishiSetu verification code is {code}. It expires in 5 minutes. Do not share it."
    client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
    client.messages.create(to=to_number, from_=from_number, body=body)
