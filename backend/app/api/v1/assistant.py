from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.api.v1.auth import current_user, success
from app.services.assistant_service import VOICE_COMMAND_REGISTRY, process_voice_command

router = APIRouter(prefix="/assistant", tags=["voice command assistant"])


class VoiceCommandRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    sessionId: str | None = None
    currentRoute: str | None = None
    language: str = "hi"  # "hi" | "en" | "chg"


@router.post("/command")
async def execute_voice_command(
    payload: VoiceCommandRequest,
    user: dict[str, Any] = Depends(current_user),
) -> dict[str, Any]:
    """
    Process an authenticated voice or text command from the global floating assistant.
    - Classifies intent (navigation, personalized loans/schemes, application guidance, explanation).
    - Resolves conversational context across multi-turn queries.
    - Executes authorized domain services scoped strictly to the authenticated user.
    - Returns rich structured response with navigation target, audio script, verified URLs, and cards.
    """
    if not user.get("is_active"):
        raise HTTPException(status_code=403, detail="Account is deactivated")

    result = process_voice_command(
        message=payload.message,
        user=user,
        session_id=payload.sessionId,
        current_route=payload.currentRoute,
        language=payload.language,
    )
    return success(result, "Assistant command executed successfully")


@router.get("/registry")
async def get_command_registry(
    user: dict[str, Any] = Depends(current_user),
) -> dict[str, Any]:
    """Return the allowlist of registered voice commands and descriptions."""
    return success(
        {
            "registry": VOICE_COMMAND_REGISTRY,
            "totalCommands": len(VOICE_COMMAND_REGISTRY),
            "supportedLanguages": ["hi", "en", "hne"],
        },
        "Command registry retrieved",
    )
