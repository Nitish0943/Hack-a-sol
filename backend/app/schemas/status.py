from pydantic import BaseModel


class WelcomeResponse(BaseModel):
    message: str
    application: str


class HealthResponse(BaseModel):
    status: str


class StatusResponse(BaseModel):
    status: str
    application: str
    version: str
    environment: str