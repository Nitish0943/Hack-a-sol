import logging

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.api.v1.voice import incoming_call
from app.core.config import get_settings
from app.schemas.status import HealthResponse, WelcomeResponse
from app.db.store import cleanup_voice_records, initialize_database, seed_demo_data

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="KrishiSetu agricultural policy, benefit and grievance API.",
)
cors_origins = list(dict.fromkeys([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    *settings.cors_origins,
]))

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
app.include_router(api_router)


@app.get("/ivr", include_in_schema=False)
@app.post("/ivr", include_in_schema=False)
async def legacy_ivr_incoming_call(request: Request) -> Response:
    return await incoming_call(request)


@app.on_event("startup")
async def startup() -> None:
    initialize_database()
    seed_demo_data()


@app.exception_handler(HTTPException)
async def handle_http_exception(request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": str(exc.detail), "detail": exc.detail, "data": None},
    )


@app.exception_handler(RequestValidationError)
async def handle_validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
    first_msg = exc.errors()[0]["msg"] if exc.errors() else "Validation failed"
    return JSONResponse(
        status_code=422,
        content={"success": False, "message": first_msg, "detail": exc.errors(), "data": None},
    )


@app.exception_handler(Exception)
async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error for %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "An unexpected server error occurred.", "detail": "An unexpected server error occurred."},
    )


@app.get("/", response_model=WelcomeResponse, tags=["system"])
async def root() -> WelcomeResponse:
    return WelcomeResponse(message="Welcome to the API.", application=settings.app_name)


@app.get("/health", response_model=HealthResponse, tags=["system"])
async def health() -> HealthResponse:
    return HealthResponse(status="ok")