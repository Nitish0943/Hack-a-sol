from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, LoginResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)) -> LoginResponse:
    # Query user by phone or role
    result = await db.execute(select(User).where(User.role == req.role))
    user = result.scalars().first()

    if not user:
        # Fallback to demo user
        user = User(
            phone=req.phone,
            name="Ramesh Kumar" if req.role == "farmer" else ("Anita Verma" if req.role == "officer" else "Admin User"),
            role=req.role,
            preferred_language="hi" if req.role == "farmer" else "en",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return LoginResponse(
        user=UserResponse(
            id=user.id,
            phone=user.phone,
            name=user.name,
            role=user.role,
            preferred_language=user.preferred_language,
        ),
        token=f"demo-token-{user.role}-{user.id}",
        message="Authentication successful",
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user(role: str = "farmer", db: AsyncSession = Depends(get_db)) -> UserResponse:
    result = await db.execute(select(User).where(User.role == role))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(
        id=user.id,
        phone=user.phone,
        name=user.name,
        role=user.role,
        preferred_language=user.preferred_language,
    )
