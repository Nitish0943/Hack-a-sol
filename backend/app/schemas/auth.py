from pydantic import BaseModel, ConfigDict


class LoginRequest(BaseModel):
    phone: str
    otp: str = "123456"
    role: str = "farmer"  # farmer, officer, admin


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    phone: str
    name: str
    role: str
    preferred_language: str


class LoginResponse(BaseModel):
    user: UserResponse
    token: str = "mock-jwt-token"
    message: str = "Authentication successful"
