from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.database import get_db
from core.security import get_current_user, verify_password, hash_password
from models.user import User
import random, string
from datetime import datetime, timedelta

router = APIRouter(prefix="/users", tags=["Users"])

# In-memory OTP store
_otp_store: dict = {}


@router.get("/me")
async def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    return {
        "success": True,
        "data": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "phone": current_user.phone,
            "role": current_user.role,
        }
    }


@router.patch("/me")
async def update_my_profile(
    data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if "full_name" in data and data["full_name"]:
        current_user.full_name = data["full_name"]
    if "phone" in data:
        current_user.phone = data["phone"]
    await db.flush()
    return {"success": True, "message": "Profile updated successfully"}


@router.patch("/me/password")
async def change_password(
    data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(
        data.get("current_password", ""),
        current_user.password_hash
    ):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    new_pwd = data.get("new_password", "")
    if len(new_pwd) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    current_user.password_hash = hash_password(new_pwd)
    await db.flush()
    return {"success": True, "message": "Password changed successfully"}


@router.post("/me/request-email-change")
async def request_email_change(
    data: dict,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from services.email import send_email_verification_otp

    if not verify_password(data.get("password", ""), current_user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect password")

    new_email = data.get("new_email", "").lower().strip()
    if not new_email:
        raise HTTPException(status_code=400, detail="New email is required")

    # Check not already taken
    existing = await db.execute(select(User).where(User.email == new_email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="This email is already registered")

    # Generate OTP
    otp = ''.join(random.choices(string.digits, k=6))
    _otp_store[current_user.id] = {
        "otp": otp,
        "new_email": new_email,
        "expires": datetime.utcnow() + timedelta(minutes=15),
    }

    background_tasks.add_task(
        send_email_verification_otp,
        new_email,
        current_user.full_name,
        otp
    )
    return {"success": True, "message": "Verification code sent to new email"}


@router.post("/me/verify-email-change")
async def verify_email_change(
    data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    record = _otp_store.get(current_user.id)
    if not record:
        raise HTTPException(status_code=400, detail="No pending email change request found")

    if datetime.utcnow() > record["expires"]:
        del _otp_store[current_user.id]
        raise HTTPException(status_code=400, detail="Code expired. Please request a new one.")

    if data.get("otp") != record["otp"]:
        raise HTTPException(status_code=400, detail="Invalid verification code")

    if data.get("new_email", "").lower() != record["new_email"]:
        raise HTTPException(status_code=400, detail="Email mismatch")

    current_user.email = record["new_email"]
    del _otp_store[current_user.id]
    await db.flush()
    return {"success": True, "message": "Email updated successfully"}