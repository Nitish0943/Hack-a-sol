import hashlib
import logging
import re
import secrets
from datetime import datetime, timedelta, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import Response
from pydantic import BaseModel
from starlette.concurrency import run_in_threadpool
from twilio.twiml.voice_response import VoiceResponse

from app.api.v1.auth import require_role, success
from app.api.v1.officer_admin import audit
from app.core.config import get_settings
from app.db.store import execute, get_connection, many, one
from app.services.voice import (
    claim_policy_query,
    OTP_LIFETIME_MINUTES,
    create_call_session,
    create_voice_otp,
    find_caller_user,
    get_call_session,
    indian_mobile_e164,
    update_call_session,
    valid_call_sid,
    validate_twilio_request,
    verify_voice_otp,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/voice", tags=["Twilio Voice Agent"])

MAX_SPEECH_CHARS = 500
MIN_SPEECH_CONFIDENCE = 0.35


class EscalationStatusUpdate(BaseModel):
    status: Literal["pending", "assigned", "contacted", "closed"]


def _xml(response: VoiceResponse) -> Response:
    return Response(content=str(response), media_type="application/xml")


def _speech_language(language: str) -> str:
    return "en-IN" if language == "en" else "hi-IN"


def _action_url(endpoint: str) -> str:
    public_url = get_settings().twilio_webhook_public_url.rstrip("/")
    return f"{public_url}/api/v1/voice/{endpoint}"


def _say(response: VoiceResponse, text: str, language: str) -> None:
    response.say(text, language=_speech_language(language))


def _gather(
    response: VoiceResponse,
    prompt: str,
    language: str,
    action: str,
    *,
    input_type: str = "dtmf speech",
    num_digits: int = 1,
) -> None:
    gather = response.gather(
        input=input_type,
        action=_action_url(action),
        method="POST",
        timeout=7,
        speech_timeout="auto",
        num_digits=num_digits if "dtmf" in input_type else None,
        language=_speech_language(language),
        action_on_empty_result=True,
    )
    _say(gather, prompt, language)


def _language_prompt(language: str = "hi") -> str:
    if language == "en":
        return "Press 1 for Hindi. Press 2 for English. Regional-language speech is not available yet."
    return "हिंदी के लिए 1 दबाएँ। अंग्रेज़ी के लिए 2 दबाएँ। क्षेत्रीय भाषा में बोलकर सहायता अभी उपलब्ध नहीं है।"


def _menu_prompt(language: str) -> str:
    if language == "en":
        return (
            "Press 1 for government schemes. Press 2 for eligibility information. "
            "Press 3 for loan and subsidy information. Press 4 for application status. "
            "Press 5 for benefit and payment records. Press 6 to register a grievance. "
            "Press 7 to request an officer callback. Press 9 to repeat the menu. Press 0 to end the call."
        )
    return (
        "सरकारी योजनाओं के लिए 1 दबाएँ। पात्रता जानकारी के लिए 2 दबाएँ। "
        "ऋण और सब्सिडी जानकारी के लिए 3 दबाएँ। आवेदन की स्थिति के लिए 4 दबाएँ। "
        "लाभ और भुगतान रिकॉर्ड के लिए 5 दबाएँ। शिकायत दर्ज करने के लिए 6 दबाएँ। "
        "अधिकारी से कॉल का अनुरोध करने के लिए 7 दबाएँ। मेन्यू दोहराने के लिए 9 दबाएँ। "
        "कॉल समाप्त करने के लिए 0 दबाएँ।"
    )


def _menu(
    response: VoiceResponse,
    call_sid: str,
    language: str,
    *,
    reset_invalid: bool = True,
) -> None:
    fields: dict[str, object] = {
        "language": language,
        "state": "main_menu",
        "current_intent": None,
        "pending_summary": None,
    }
    if reset_invalid:
        fields["invalid_attempts"] = 0
    update_call_session(call_sid, **fields)
    _gather(response, _menu_prompt(language), language, "process")
    _say(
        response,
        "No selection was received. Goodbye." if language == "en" else "कोई विकल्प नहीं मिला। नमस्कार।",
        language,
    )
    response.hangup()


def _twilio_session(params: dict[str, str]) -> tuple[str, dict[str, object]]:
    call_sid = valid_call_sid(params.get("CallSid"))
    execute(
        """
        UPDATE voice_call_sessions SET pending_summary=NULL
        WHERE call_sid=? AND pending_summary IS NOT NULL
          AND updated_at < datetime('now','-5 minutes')
        """,
        (call_sid,),
    )
    session = get_call_session(call_sid)
    if not session:
        raise HTTPException(status_code=404, detail="Voice call session was not found")
    if session.get("call_status") in {"completed", "busy", "failed", "no-answer", "canceled"}:
        raise HTTPException(status_code=410, detail="Voice call session has ended")
    try:
        started_at = datetime.fromisoformat(str(session["started_at"]))
    except (KeyError, ValueError):
        raise HTTPException(status_code=500, detail="Voice call session timestamp is invalid") from None
    if started_at.tzinfo is None:
        started_at = started_at.replace(tzinfo=timezone.utc)
    if datetime.now(timezone.utc) - started_at > timedelta(
        seconds=max(60, get_settings().voice_session_ttl_seconds)
    ):
        update_call_session(
            call_sid,
            call_status="completed",
            outcome="session_expired",
            ended_at=datetime.now(timezone.utc).isoformat(),
            pending_summary=None,
        )
        raise HTTPException(status_code=410, detail="Voice call session has expired")
    return call_sid, session


def _confidence_is_low(params: dict[str, str]) -> bool:
    value = params.get("Confidence")
    if value is None or value == "":
        return False
    try:
        confidence = float(value)
    except ValueError:
        return True
    return confidence < MIN_SPEECH_CONFIDENCE


def _clean_speech(value: str) -> str:
    cleaned = " ".join("".join(character for character in value if character.isprintable()).split())
    cleaned = re.sub(
        r"(?i)(?:otp|one[- ]time code|code|pin|ओटीपी|कोड|पिन|पासवर्ड)\s*(?:is|:)?\s*\d{4,8}",
        "[verification code removed]",
        cleaned,
    )
    cleaned = re.sub(
        r"(?<!\d)(?:\+?91[\s-]?)?\d(?:[\s-]?\d){7,13}(?!\d)",
        "[private number removed]",
        cleaned,
    )
    return cleaned[:MAX_SPEECH_CHARS]


def _voice_query(question: str, language: str):
    from app.api.v1.rag import get_rag_service
    from app.rag import FarmerQueryRequest

    return get_rag_service().query(
        FarmerQueryRequest(
            question=question,
            language=language,
            response_style="ivr",
        )
    )


def _record_unanswered(call_sid: str, question: str, language: str, reason: str) -> None:
    digest = hashlib.sha256(question.casefold().encode("utf-8")).hexdigest()
    execute(
        """
        INSERT INTO voice_unanswered_questions
          (id,call_sid,query_digest,language,reason)
        VALUES(?,?,?,?,?)
        """,
        (f"voice-question-{secrets.token_hex(8)}", call_sid, digest, language, reason),
    )


def _spoken_answer(answer: str, language: str) -> str:
    normalized = " ".join(answer.split())
    words = normalized.split()
    if len(words) > 65:
        normalized = " ".join(words[:65])
        normalized += "।" if language == "hi" else "."
    return normalized


async def _answer_policy_question(
    response: VoiceResponse,
    call_sid: str,
    question: str,
    language: str,
) -> None:
    if not question or len(question) > MAX_SPEECH_CHARS:
        _say(
            response,
            "Please ask a short question about a government scheme." if language == "en"
            else "कृपया सरकारी योजना के बारे में छोटा प्रश्न पूछें।",
            language,
        )
        _menu(response, call_sid, language)
        return
    if not claim_policy_query(call_sid):
        _say(
            response,
            "This call has reached its policy-question limit. Please try again later."
            if language == "en"
            else "इस कॉल में नीति प्रश्नों की सीमा पूरी हो गई है। कृपया बाद में फिर प्रयास करें।",
            language,
        )
        _menu(response, call_sid, language)
        return

    try:
        result = await run_in_threadpool(_voice_query, question, language)
    except Exception as exc:
        logger.warning("Voice RAG failed for call %s (%s)", call_sid, type(exc).__name__)
        _say(
            response,
            "The policy assistant is temporarily unavailable. Please try again later."
            if language == "en"
            else "नीति जानकारी सेवा अभी उपलब्ध नहीं है। कृपया कुछ देर बाद फिर प्रयास करें।",
            language,
        )
        _menu(response, call_sid, language)
        return

    verified_citations = [
        citation
        for citation in result.citations
        if str(
            getattr(
                getattr(citation, "verification_status", ""),
                "value",
                getattr(citation, "verification_status", ""),
            )
        ).upper()
        == "VERIFIED"
    ]
    if result.answer_status != "answered" or not verified_citations:
        reason = result.answer_status if result.answer_status != "answered" else "unverified_source"
        _record_unanswered(call_sid, question, language, reason)
        message = (
            "I cannot find enough verified information to answer. Press 7 to request an officer callback."
            if language == "en"
            else "मुझे इस प्रश्न का सत्यापित उत्तर नहीं मिल रहा है। अधिकारी से कॉल का अनुरोध करने के लिए 7 दबाएँ।"
        )
        _say(response, message, language)
    else:
        answer = _spoken_answer(result.ivr_summary or result.answer, language)
        citation = verified_citations[0]
        source_text = (
            f"Source: {citation.document_title}."
            if language == "en"
            else f"स्रोत: {citation.document_title}।"
        )
        _say(response, f"{answer} {source_text}", language)

    update_call_session(
        call_sid,
        state="post_answer",
        current_intent="policy_question",
        pending_summary=None,
        invalid_attempts=0,
    )
    _gather(
        response,
        "Press 9 for the main menu or 0 to end the call."
        if language == "en"
        else "मुख्य मेन्यू के लिए 9 दबाएँ या कॉल समाप्त करने के लिए 0 दबाएँ।",
        language,
        "continue",
        input_type="dtmf",
    )
    _say(response, "Goodbye." if language == "en" else "नमस्कार।", language)
    response.hangup()


def _record_invalid(response: VoiceResponse, call_sid: str, session: dict[str, object]) -> None:
    attempts = int(session.get("invalid_attempts") or 0) + 1
    language = str(session.get("language") or "hi")
    if attempts >= 3:
        update_call_session(
            call_sid,
            invalid_attempts=attempts,
            call_status="completed",
            outcome="invalid_input",
            ended_at=datetime.now(timezone.utc).isoformat(),
            pending_summary=None,
        )
        _say(
            response,
            "There were too many invalid choices. Goodbye."
            if language == "en"
            else "कई बार गलत विकल्प चुना गया। नमस्कार।",
            language,
        )
        response.hangup()
        return
    update_call_session(call_sid, invalid_attempts=attempts)
    _say(
        response,
        "Sorry, I did not understand. Please choose an option."
        if language == "en"
        else "क्षमा करें, मैं समझ नहीं पाया। कृपया विकल्प चुनें।",
        language,
    )
    _menu(response, call_sid, language, reset_invalid=False)


def _private_data_enabled() -> bool:
    settings = get_settings()
    return (
        settings.voice_private_data_enabled
        and settings.app_environment.lower() != "production"
    )


def _verification_available() -> bool:
    settings = get_settings()
    return bool(
        _private_data_enabled()
        and settings.voice_otp_secret
        and settings.twilio_account_sid
        and settings.twilio_auth_token
        and settings.twilio_phone_number
    )


async def _request_verification(
    response: VoiceResponse,
    call_sid: str,
    session: dict[str, object],
    params: dict[str, str],
    intent: str,
) -> None:
    language = str(session.get("language") or "hi")
    if not _verification_available():
        _say(
            response,
            "Secure phone verification is not configured. Please use the KrishiSetu portal for private account information."
            if language == "en"
            else "सुरक्षित फ़ोन सत्यापन अभी उपलब्ध नहीं है। निजी खाते की जानकारी के लिए कृषिसेतु पोर्टल का उपयोग करें।",
            language,
        )
        _menu(response, call_sid, language)
        return

    user = find_caller_user(params.get("From"))
    if not user:
        _say(
            response,
            "We could not verify this call. Please use your registered number or the KrishiSetu portal."
            if language == "en"
            else "इस कॉल का सत्यापन नहीं हो सका। कृपया पंजीकृत नंबर या कृषिसेतु पोर्टल का उपयोग करें।",
            language,
        )
        _menu(response, call_sid, language)
        return

    registered_number = indian_mobile_e164(str(user["mobile_number"]))
    if not registered_number:
        _say(
            response,
            "Secure phone verification is unavailable for this account."
            if language == "en"
            else "इस खाते के लिए सुरक्षित फ़ोन सत्यापन उपलब्ध नहीं है।",
            language,
        )
        _menu(response, call_sid, language)
        return

    settings = get_settings()
    code = create_voice_otp(call_sid, str(user["id"]), settings)
    if not code:
        _say(
            response,
            "Too many verification requests. Please try again later."
            if language == "en"
            else "बहुत अधिक सत्यापन अनुरोध हुए हैं। कृपया बाद में पुनः प्रयास करें।",
            language,
        )
        _menu(response, call_sid, language)
        return
    try:
        from app.services.voice import send_voice_otp

        await run_in_threadpool(
            send_voice_otp,
            settings,
            registered_number,
            code,
            language,
        )
    except Exception as exc:
        execute("DELETE FROM voice_otp_challenges WHERE call_sid=?", (call_sid,))
        logger.warning("Voice OTP delivery failed for call %s (%s)", call_sid, type(exc).__name__)
        _say(
            response,
            "We could not send a verification code. Please use the KrishiSetu portal."
            if language == "en"
            else "सत्यापन कोड नहीं भेजा जा सका। कृपया कृषिसेतु पोर्टल का उपयोग करें।",
            language,
        )
        _menu(response, call_sid, language)
        return

    update_call_session(
        call_sid,
        candidate_user_id=str(user["id"]),
        current_intent=intent,
        state="verification",
        pending_summary=None,
    )
    prompt = (
        f"We sent a one-time code to your registered mobile. Enter its {OTP_LIFETIME_MINUTES}-minute code using the keypad. Do not speak the code."
        if language == "en"
        else f"आपके पंजीकृत मोबाइल पर एक बार उपयोग होने वाला कोड भेजा गया है। {OTP_LIFETIME_MINUTES} मिनट के भीतर उसे कीपैड से दर्ज करें। कोड बोलकर न बताएँ।"
    )
    _gather(response, prompt, language, "verify", input_type="dtmf", num_digits=6)


def _verified_user(session: dict[str, object]) -> str | None:
    user_id = session.get("verified_user_id")
    return str(user_id) if user_id else None


def _private_application_status(
    response: VoiceResponse,
    call_sid: str,
    user_id: str,
    language: str,
) -> None:
    rows = many(
        """
        SELECT application_number,status,is_demo FROM applications
        WHERE farmer_id=? ORDER BY updated_at DESC LIMIT 3
        """,
        (user_id,),
    )
    if not rows:
        message = (
            "There are no application records linked to your verified account."
            if language == "en"
            else "आपके सत्यापित खाते से कोई आवेदन रिकॉर्ड जुड़ा नहीं है।"
        )
    else:
        latest = rows[0]
        if bool(latest["is_demo"]):
            message = (
                f"This is demonstration data. Application {latest['application_number']} is marked {latest['status']}; it is not a live government status."
                if language == "en"
                else f"यह प्रदर्शन डेटा है। आवेदन {latest['application_number']} की स्थिति {latest['status']} दर्ज है; यह सरकारी लाइव स्थिति नहीं है।"
            )
        else:
            message = (
                f"Your latest application, {latest['application_number']}, is marked {latest['status']} in KrishiSetu. This is not an official approval decision."
                if language == "en"
                else f"कृषिसेतु में आपके नवीनतम आवेदन {latest['application_number']} की स्थिति {latest['status']} दर्ज है। यह सरकारी स्वीकृति का निर्णय नहीं है।"
            )
    _say(response, message, language)
    _finish_private_response(response, call_sid, language)


def _private_benefit_status(
    response: VoiceResponse,
    call_sid: str,
    user_id: str,
    language: str,
) -> None:
    rows = many(
        """
        SELECT sanctioned_amount,disbursed_amount,received_amount,
               verification_status,is_demo
        FROM benefits WHERE farmer_id=?
        """,
        (user_id,),
    )
    if not rows:
        message = (
            "There are no benefit records linked to your verified account."
            if language == "en"
            else "आपके सत्यापित खाते से कोई लाभ रिकॉर्ड जुड़ा नहीं है।"
        )
    else:
        demo = any(bool(row["is_demo"]) for row in rows)
        sanctioned = sum(float(row["sanctioned_amount"] or 0) for row in rows)
        disbursed = sum(float(row["disbursed_amount"] or 0) for row in rows)
        bank_verified = {"bank_verified", "transaction_verified"}
        received = sum(
            float(row["received_amount"] or 0)
            for row in rows
            if str(row["verification_status"] or "").lower() in bank_verified
            and not bool(row["is_demo"])
        )
        if demo:
            message = (
                f"This is demonstration data, not a live payment record. It lists {sanctioned:.0f} rupees sanctioned and {disbursed:.0f} rupees disbursed. No bank-verified received amount is available."
                if language == "en"
                else f"यह प्रदर्शन डेटा है, लाइव भुगतान रिकॉर्ड नहीं। इसमें {sanctioned:.0f} रुपये स्वीकृत और {disbursed:.0f} रुपये जारी दर्ज हैं। बैंक से सत्यापित प्राप्त राशि उपलब्ध नहीं है।"
            )
        else:
            message = (
                f"KrishiSetu records {sanctioned:.0f} rupees sanctioned and {disbursed:.0f} rupees disbursed. The bank-verified received amount is {received:.0f} rupees. These are recorded values, not a government decision."
                if language == "en"
                else f"कृषिसेतु रिकॉर्ड में {sanctioned:.0f} रुपये स्वीकृत और {disbursed:.0f} रुपये जारी हैं। बैंक से सत्यापित प्राप्त राशि {received:.0f} रुपये है। ये रिकॉर्ड की गई राशियाँ हैं, सरकारी निर्णय नहीं।"
            )
    _say(response, message, language)
    _finish_private_response(response, call_sid, language)


def _finish_private_response(response: VoiceResponse, call_sid: str, language: str) -> None:
    _gather(
        response,
        "Press 9 for the main menu or 0 to end the call."
        if language == "en"
        else "मुख्य मेन्यू के लिए 9 दबाएँ या कॉल समाप्त करने के लिए 0 दबाएँ।",
        language,
        "continue",
        input_type="dtmf",
    )
    update_call_session(call_sid, state="post_answer", current_intent=None, pending_summary=None)


def _begin_user_text_flow(
    response: VoiceResponse,
    call_sid: str,
    intent: str,
    language: str,
) -> None:
    state = "grievance_description" if intent == "grievance" else "callback_reason"
    update_call_session(
        call_sid,
        state=state,
        current_intent=intent,
        pending_summary=None,
        invalid_attempts=0,
    )
    prompt = (
        "Briefly describe the issue after the tone. Do not say your Aadhaar, bank account, password, or OTP."
        if language == "en"
        else "टोन के बाद समस्या संक्षेप में बताएँ। आधार, बैंक खाता, पासवर्ड या ओटीपी न बताएँ।"
    )
    _gather(response, prompt, language, "process", input_type="speech")


async def _verified_intent_response(
    response: VoiceResponse,
    call_sid: str,
    session: dict[str, object],
) -> None:
    user_id = _verified_user(session)
    language = str(session.get("language") or "hi")
    intent = str(session.get("current_intent") or "")
    if not user_id:
        _say(
            response,
            "Please complete account verification before continuing."
            if language == "en"
            else "आगे बढ़ने से पहले कृपया खाते का सत्यापन पूरा करें।",
            language,
        )
        _menu(response, call_sid, language)
        return
    if intent == "applications":
        _private_application_status(response, call_sid, user_id, language)
    elif intent == "benefits":
        _private_benefit_status(response, call_sid, user_id, language)
    elif intent in {"grievance", "callback"}:
        _begin_user_text_flow(response, call_sid, intent, language)
    else:
        _menu(response, call_sid, language)


async def _process_verification(
    response: VoiceResponse,
    call_sid: str,
    session: dict[str, object],
    params: dict[str, str],
) -> None:
    language = str(session.get("language") or "hi")
    candidate_user_id = str(session.get("candidate_user_id") or "")
    digits = params.get("Digits", "")
    if not candidate_user_id:
        result = "invalid"
    else:
        result = verify_voice_otp(
            call_sid,
            candidate_user_id,
            digits if len(digits) == 6 and digits.isdigit() else "",
            get_settings(),
        )
    if result != "verified":
        if result in {"expired", "locked", "missing", "used"}:
            update_call_session(
                call_sid,
                candidate_user_id=None,
                current_intent=None,
                state="main_menu",
            )
            _say(
                response,
                "The code is invalid, expired, or locked. Please try again later."
                if language == "en"
                else "कोड गलत, समाप्त या लॉक हो गया है। कृपया बाद में पुनः प्रयास करें।",
                language,
            )
            _menu(response, call_sid, language)
            return
        prompt = (
            "That code was not correct. Enter the six-digit code using the keypad."
            if language == "en"
            else "यह कोड सही नहीं है। छह अंकों का कोड कीपैड से दर्ज करें।"
        )
        _gather(response, prompt, language, "verify", input_type="dtmf", num_digits=6)
        return

    update_call_session(
        call_sid,
        candidate_user_id=None,
        verified_user_id=candidate_user_id,
        state="main_menu",
    )
    verified_session = get_call_session(call_sid)
    if not verified_session:
        raise RuntimeError("Verified voice call session could not be loaded")
    await _verified_intent_response(response, call_sid, verified_session)


def _confirm_user_request(
    response: VoiceResponse,
    call_sid: str,
    session: dict[str, object],
    params: dict[str, str],
) -> None:
    language = str(session.get("language") or "hi")
    action = str(session.get("current_intent") or "")
    if params.get("Digits") == "2":
        update_call_session(call_sid, pending_summary=None, state="main_menu", current_intent=None)
        _say(
            response,
            "The request was cancelled."
            if language == "en"
            else "अनुरोध रद्द कर दिया गया है।",
            language,
        )
        _menu(response, call_sid, language)
        return
    if params.get("Digits") != "1":
        _record_invalid(response, call_sid, session)
        return

    summary = str(session.get("pending_summary") or "").strip()
    user_id = _verified_user(session)
    if not summary or not user_id:
        update_call_session(call_sid, pending_summary=None, state="main_menu", current_intent=None)
        _say(
            response,
            "The request could not be saved. Please try again from the menu."
            if language == "en"
            else "अनुरोध दर्ज नहीं हो सका। कृपया मेन्यू से फिर प्रयास करें।",
            language,
        )
        _menu(response, call_sid, language)
        return

    if action == "grievance":
        grievance_id = f"grievance-{secrets.token_hex(8)}"
        grievance_number = f"GRV-CG-{secrets.token_hex(4).upper()}"
        with get_connection() as connection:
            connection.execute(
                """
                INSERT INTO grievances
                  (id,grievance_number,farmer_id,category,subject,description,priority,status,is_demo)
                VALUES(?,?,?,?,?,?,?,?,1)
                """,
                (
                    grievance_id,
                    grievance_number,
                    user_id,
                    "Voice assistance",
                    "Farmer phone assistance request",
                    summary,
                    "medium",
                    "submitted",
                ),
            )
            connection.execute(
                "INSERT INTO grievance_history(id,grievance_id,status,remark) VALUES(?,?,?,?)",
                (
                    f"history-{secrets.token_hex(8)}",
                    grievance_id,
                    "submitted",
                    "Farmer confirmed grievance by phone",
                ),
            )
            audit(
                user_id,
                "voice_grievance.created",
                "grievance",
                grievance_id,
                new_values={"status": "submitted", "source": "voice"},
                connection=connection,
            )
        update_call_session(
            call_sid,
            outcome="grievance_submitted",
            state="main_menu",
            current_intent=None,
            pending_summary=None,
        )
        _say(
            response,
            f"Your demonstration grievance reference is {grievance_number}. An officer must review it."
            if language == "en"
            else f"आपकी प्रदर्शन शिकायत का संदर्भ नंबर {grievance_number} है। अधिकारी इसकी समीक्षा करेंगे।",
            language,
        )
    elif action == "callback":
        escalation_id = f"voice-escalation-{secrets.token_hex(8)}"
        with get_connection() as connection:
            connection.execute(
                """
                INSERT INTO voice_escalations
                  (id,call_sid,farmer_id,reason,summary,preferred_language,status)
                VALUES(?,?,?,?,?,?,?)
                """,
                (
                    escalation_id,
                    call_sid,
                    user_id,
                    "farmer_requested_callback",
                    summary,
                    language,
                    "pending",
                ),
            )
            audit(
                user_id,
                "voice_escalation.created",
                "voice_escalation",
                escalation_id,
                new_values={"status": "pending", "reason": "farmer_requested_callback"},
                connection=connection,
            )
        update_call_session(
            call_sid,
            outcome="callback_requested",
            state="main_menu",
            current_intent=None,
            pending_summary=None,
        )
        _say(
            response,
            "Your callback request has been recorded. No callback time is guaranteed."
            if language == "en"
            else "आपका कॉल-बैक अनुरोध दर्ज है। कॉल का समय सुनिश्चित नहीं है।",
            language,
        )
    else:
        _record_invalid(response, call_sid, session)
        return
    _menu(response, call_sid, language)


async def _process(
    response: VoiceResponse,
    call_sid: str,
    session: dict[str, object],
    params: dict[str, str],
) -> None:
    state = str(session.get("state") or "main_menu")
    language = str(session.get("language") or "hi")
    if state == "verification":
        await _process_verification(response, call_sid, session, params)
        return
    if state in {"grievance_confirm", "callback_confirm"}:
        _confirm_user_request(response, call_sid, session, params)
        return
    if state in {"grievance_description", "callback_reason"}:
        speech = _clean_speech(params.get("SpeechResult", ""))
        if not speech or _confidence_is_low(params):
            _say(
                response,
                "I could not understand. Please repeat without sharing sensitive numbers."
                if language == "en"
                else "मैं समझ नहीं पाया। कृपया निजी नंबर बताए बिना फिर से कहें।",
                language,
            )
            _begin_user_text_flow(
                response,
                call_sid,
                "grievance" if state == "grievance_description" else "callback",
                language,
            )
            return
        intent = "grievance" if state == "grievance_description" else "callback"
        update_call_session(
            call_sid,
            pending_summary=speech,
            state=f"{intent}_confirm",
        )
        prompt = (
            f"You said: {speech}. Press 1 to confirm and submit this request, or 2 to cancel."
            if language == "en"
            else f"आपने कहा: {speech}। अनुरोध की पुष्टि के लिए 1 दबाएँ, रद्द करने के लिए 2 दबाएँ।"
        )
        _gather(
            response,
            prompt,
            language,
            "process",
            input_type="dtmf",
        )
        return

    if state == "post_answer":
        digit = params.get("Digits")
        if digit == "0":
            update_call_session(
                call_sid,
                call_status="completed",
                outcome="caller_hangup",
                ended_at=datetime.now(timezone.utc).isoformat(),
                pending_summary=None,
            )
            _say(response, "Goodbye." if language == "en" else "नमस्कार।", language)
            response.hangup()
        else:
            _menu(response, call_sid, language)
        return

    if state != "main_menu":
        _menu(response, call_sid, language)
        return

    if _confidence_is_low(params):
        _say(
            response,
            "I did not clearly understand. Please repeat or use the keypad."
            if language == "en"
            else "आपकी बात स्पष्ट नहीं सुनाई दी। कृपया दोहराएँ या कीपैड का उपयोग करें।",
            language,
        )
        _menu(response, call_sid, language)
        return

    speech = _clean_speech(params.get("SpeechResult", ""))
    if speech and not params.get("Digits"):
        await _answer_policy_question(response, call_sid, speech, language)
        return

    digit = params.get("Digits", "")
    if digit == "0":
        update_call_session(
            call_sid,
            call_status="completed",
            outcome="caller_hangup",
            ended_at=datetime.now(timezone.utc).isoformat(),
            pending_summary=None,
        )
        _say(response, "Goodbye." if language == "en" else "नमस्कार।", language)
        response.hangup()
    elif digit == "9":
        _menu(response, call_sid, language)
    elif digit == "1":
        question = (
            "What government schemes and benefits are available to farmers?"
            if language == "en"
            else "किसानों के लिए कौन सी सरकारी योजनाएँ और लाभ उपलब्ध हैं?"
        )
        await _answer_policy_question(response, call_sid, question, language)
    elif digit == "2":
        question = (
            "What are the eligibility conditions and exclusions for PM-KISAN?"
            if language == "en"
            else "पीएम-किसान योजना की पात्रता की शर्तें और अपात्रता क्या हैं?"
        )
        await _answer_policy_question(response, call_sid, question, language)
    elif digit == "3":
        question = (
            "What official loan and subsidy information is available for farmers?"
            if language == "en"
            else "किसानों के लिए ऋण और सब्सिडी की कौन सी आधिकारिक जानकारी उपलब्ध है?"
        )
        await _answer_policy_question(response, call_sid, question, language)
    elif digit in {"4", "5", "6", "7"}:
        intent = {
            "4": "applications",
            "5": "benefits",
            "6": "grievance",
            "7": "callback",
        }[digit]
        user_id = _verified_user(session)
        if user_id:
            update_call_session(call_sid, current_intent=intent)
            updated_session = get_call_session(call_sid)
            if not updated_session:
                raise RuntimeError("Voice call session could not be loaded")
            await _verified_intent_response(response, call_sid, updated_session)
        else:
            await _request_verification(response, call_sid, session, params, intent)
    else:
        _record_invalid(response, call_sid, session)


@router.get("/status")
async def voice_status() -> dict[str, object]:
    settings = get_settings()
    incoming_ready = bool(settings.twilio_auth_token and settings.twilio_webhook_public_url)
    otp_ready = bool(
        _verification_available()
    )
    return success({
        "status": "configured" if incoming_ready else "not_configured",
        "incoming_webhook_ready": incoming_ready,
        "private_verification_ready": otp_ready,
        "phone_number": settings.twilio_phone_number or None,
        "supported_languages": ["hi", "en"],
        "regional_speech_available": False,
        "is_demo": settings.app_environment.lower() != "production",
    }, "Voice service status retrieved")


@router.get("/calls")
async def voice_call_history(user: dict = Depends(require_role("farmer", "officer", "admin"))) -> dict:
    if user["role"] == "farmer":
        rows = many(
            """
            SELECT call_sid,language,call_status,outcome,started_at,ended_at,
                   duration_seconds
            FROM voice_call_sessions WHERE verified_user_id=?
            ORDER BY started_at DESC LIMIT 50
            """,
            (user["id"],),
        )
    else:
        rows = many(
            """
            SELECT call_sid,language,call_status,outcome,started_at,ended_at,
                   duration_seconds
            FROM voice_call_sessions ORDER BY started_at DESC LIMIT 50
            """
        )
    return success(rows, "Voice call history retrieved")


@router.get("/my-escalations")
async def farmer_voice_escalations(
    user: dict = Depends(require_role("farmer", "admin")),
) -> dict:
    rows = many(
        """
        SELECT id,reason,summary,preferred_language,status,created_at,updated_at
        FROM voice_escalations WHERE farmer_id=?
        ORDER BY created_at DESC LIMIT 50
        """,
        (user["id"],),
    )
    return success(rows, "Farmer voice escalations retrieved")


@router.get("/officer/escalations")
async def voice_escalations(user: dict = Depends(require_role("officer", "admin"))) -> dict:
    rows = many(
        """
        SELECT id,call_sid,farmer_id,reason,summary,preferred_language,
               status,assigned_officer,created_at,updated_at
        FROM voice_escalations ORDER BY created_at DESC LIMIT 200
        """
    )
    return success(rows, "Voice escalations retrieved")


@router.post("/officer/escalations/{escalation_id}/status")
async def update_voice_escalation(
    escalation_id: str,
    payload: EscalationStatusUpdate,
    user: dict = Depends(require_role("officer", "admin")),
) -> dict:
    allowed_transitions = {
        "pending": {"assigned"},
        "assigned": {"contacted"},
        "contacted": {"closed"},
        "closed": set(),
    }
    with get_connection() as connection:
        connection.execute("BEGIN IMMEDIATE")
        row = connection.execute(
            "SELECT id,status,assigned_officer FROM voice_escalations WHERE id=?",
            (escalation_id,),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Voice escalation not found")
        if row["status"] == payload.status:
            return success(
                {"id": escalation_id, "status": payload.status},
                "Voice escalation already has this status",
            )
        if payload.status not in allowed_transitions.get(row["status"], set()):
            raise HTTPException(status_code=409, detail="Invalid voice escalation status transition")

        assigned_officer = user["id"] if payload.status in {"assigned", "contacted"} else None
        connection.execute(
            """
            UPDATE voice_escalations SET status=?,assigned_officer=?,
              updated_at=CURRENT_TIMESTAMP WHERE id=?
            """,
            (payload.status, assigned_officer, escalation_id),
        )
        audit(
            str(user["id"]),
            "voice_escalation.status_updated",
            "voice_escalation",
            escalation_id,
            {"status": row["status"], "assigned_officer": row["assigned_officer"]},
            {"status": payload.status, "assigned_officer": assigned_officer},
            connection=connection,
        )
    return success(
        {"id": escalation_id, "status": payload.status},
        "Voice escalation updated",
    )


@router.post("/incoming")
async def incoming_call(request: Request) -> Response:
    settings = get_settings()
    params = await validate_twilio_request(request, settings)
    call_sid = valid_call_sid(params.get("CallSid"))
    session = create_call_session(
        call_sid,
        "en" if settings.default_language.lower().startswith("en") else "hi",
    )
    response = VoiceResponse()
    if session.get("call_status") != "in-progress":
        response.hangup()
        return _xml(response)
    if session.get("state") != "language":
        _menu(response, call_sid, str(session.get("language") or "hi"))
        return _xml(response)

    _say(
        response,
        "नमस्कार! कृषिसेतु में आपका स्वागत है। सरकारी योजना की जानकारी के लिए हिंदी या अंग्रेज़ी चुनें।"
        if str(session.get("language")) == "hi"
        else "Welcome to KrishiSetu. Choose Hindi or English for agricultural scheme information.",
        str(session.get("language") or "hi"),
    )
    _gather(response, _language_prompt(str(session.get("language") or "hi")), "hi", "language", input_type="dtmf")
    _say(response, "कॉल के लिए धन्यवाद। नमस्कार।", "hi")
    response.hangup()
    return _xml(response)


@router.post("/language")
async def choose_language(request: Request) -> Response:
    params = await validate_twilio_request(request, get_settings())
    call_sid, session = _twilio_session(params)
    digit = params.get("Digits", "")
    response = VoiceResponse()
    if digit == "1":
        _menu(response, call_sid, "hi")
    elif digit == "2":
        _menu(response, call_sid, "en")
    else:
        language = str(session.get("language") or "hi")
        _say(
            response,
            "Regional speech is not available by phone yet. Press 1 for Hindi or 2 for English."
            if language == "en"
            else "क्षेत्रीय भाषा में बोलकर सहायता अभी उपलब्ध नहीं है। हिंदी के लिए 1 या अंग्रेज़ी के लिए 2 दबाएँ।",
            language,
        )
        _gather(response, _language_prompt(language), language, "language", input_type="dtmf")
    return _xml(response)


@router.post("/menu")
async def main_menu(request: Request) -> Response:
    params = await validate_twilio_request(request, get_settings())
    call_sid, session = _twilio_session(params)
    response = VoiceResponse()
    _menu(response, call_sid, str(session.get("language") or "hi"))
    return _xml(response)


@router.post("/gather")
async def gather_input(request: Request) -> Response:
    params = await validate_twilio_request(request, get_settings())
    call_sid, session = _twilio_session(params)
    language = str(session.get("language") or "hi")
    state = str(session.get("state") or "main_menu")
    response = VoiceResponse()
    if state == "verification":
        _gather(
            response,
            "Enter the six-digit code using the keypad."
            if language == "en"
            else "छह अंकों का कोड कीपैड से दर्ज करें।",
            language,
            "verify",
            input_type="dtmf",
            num_digits=6,
        )
    elif state in {"grievance_description", "callback_reason"}:
        _gather(
            response,
            "Briefly describe the issue. Do not share sensitive numbers."
            if language == "en"
            else "समस्या संक्षेप में बताएँ। निजी नंबर साझा न करें।",
            language,
            "process",
            input_type="speech",
        )
    else:
        _gather(response, _menu_prompt(language), language, "process")
    return _xml(response)


@router.post("/process")
async def process_input(request: Request) -> Response:
    params = await validate_twilio_request(request, get_settings())
    call_sid, session = _twilio_session(params)
    response = VoiceResponse()
    await _process(response, call_sid, session, params)
    return _xml(response)


@router.post("/verify")
async def verify_caller(request: Request) -> Response:
    params = await validate_twilio_request(request, get_settings())
    call_sid, session = _twilio_session(params)
    response = VoiceResponse()
    await _process_verification(response, call_sid, session, params)
    return _xml(response)


@router.post("/continue")
async def continue_call(request: Request) -> Response:
    params = await validate_twilio_request(request, get_settings())
    call_sid, session = _twilio_session(params)
    response = VoiceResponse()
    digit = params.get("Digits")
    language = str(session.get("language") or "hi")
    if digit == "0":
        update_call_session(
            call_sid,
            call_status="completed",
            outcome="caller_hangup",
            ended_at=datetime.now(timezone.utc).isoformat(),
            pending_summary=None,
        )
        _say(response, "Goodbye." if language == "en" else "नमस्कार।", language)
        response.hangup()
    else:
        _menu(response, call_sid, language)
    return _xml(response)


@router.post("/status")
async def call_status(request: Request) -> Response:
    params = await validate_twilio_request(request, get_settings())
    call_sid = valid_call_sid(params.get("CallSid"))
    allowed_statuses = {
        "queued",
        "ringing",
        "in-progress",
        "completed",
        "busy",
        "failed",
        "no-answer",
        "canceled",
    }
    status = params.get("CallStatus", "")
    if status in allowed_statuses:
        fields: dict[str, object] = {"call_status": status}
        duration_value = params.get("CallDuration")
        if duration_value and duration_value.isdigit():
            duration_seconds = int(duration_value)
            if 0 <= duration_seconds <= 24 * 60 * 60:
                fields["duration_seconds"] = duration_seconds
        if status in {"completed", "busy", "failed", "no-answer", "canceled"}:
            fields["ended_at"] = datetime.now(timezone.utc).isoformat()
            fields["pending_summary"] = None
        update_call_session(call_sid, **fields)
    return Response(status_code=204)


@router.post("/recording")
async def recording_status(request: Request) -> Response:
    params = await validate_twilio_request(request, get_settings())
    call_sid = valid_call_sid(params.get("CallSid"))
    if not get_call_session(call_sid):
        raise HTTPException(status_code=404, detail="Voice call session was not found")
    return Response(status_code=204)


@router.post("/hangup")
async def hangup_call(request: Request) -> Response:
    params = await validate_twilio_request(request, get_settings())
    call_sid = valid_call_sid(params.get("CallSid"))
    session = get_call_session(call_sid)
    if session:
        update_call_session(
            call_sid,
            call_status="completed",
            outcome=str(session.get("outcome") or "call_ended"),
            ended_at=datetime.now(timezone.utc).isoformat(),
            pending_summary=None,
        )
    return Response(status_code=204)
