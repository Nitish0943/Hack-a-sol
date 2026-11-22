from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.db import init_db
from app.schemas.status import HealthResponse, WelcomeResponse
from app.seed import seed_database

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing KrishiSetu database...")
    await init_db()
    logger.info("Seeding verified agricultural schemes and demonstration ledger...")
    await seed_database()
    logger.info("KrishiSetu platform ready.")
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="KrishiSetu — Agricultural Entitlement Intelligence & Benefit Transparency Platform API.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.exception_handler(Exception)
async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error for %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred.", "error": str(exc)},
    )


@app.get("/", response_model=WelcomeResponse, tags=["system"])
async def root() -> WelcomeResponse:
    return WelcomeResponse(
        message="Welcome to the API.",
        application=settings.app_name,
    )


@app.get("/health", response_model=HealthResponse, tags=["system"])
async def health() -> HealthResponse:
    return HealthResponse(status="ok")
