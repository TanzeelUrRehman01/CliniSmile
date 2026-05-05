from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from core.database import get_db
from core.security import hash_password, verify_password, create_access_token
from models.user import User
from services.email import send_patient_welcome, send_doctor_registration_received
from core.security import get_current_user
from core.security import hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])


class RegisterPatientRequest(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    password: str


class RegisterDoctorRequest(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    password: str
    specialty: str
    clinic_name: str
    clinic_address: str
    city: str
    consultation_fee: float
    easypaisa_account: str = ""
    jazzcash_account: str = ""
    bio: str = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/register/patient", status_code=201)
async def register_patient(
    data: RegisterPatientRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        role="patient",
        full_name=data.full_name,
        phone=data.phone,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    background_tasks.add_task(send_patient_welcome, data.email, data.full_name)

    return {"success": True, "message": "Patient registered successfully", "user_id": user.id}


@router.post("/register/doctor", status_code=201)
async def register_doctor(
    data: RegisterDoctorRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    from models.user import Doctor

    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        role="doctor",
        full_name=data.full_name,
        phone=data.phone,
    )
    db.add(user)
    await db.flush()

    doctor = Doctor(
        id=user.id,
        specialty=data.specialty,
        clinic_name=data.clinic_name,
        clinic_address=data.clinic_address,
        city=data.city,
        consultation_fee=data.consultation_fee,
        easypaisa_account=data.easypaisa_account,
        jazzcash_account=data.jazzcash_account,
        bio=data.bio,
    )
    db.add(doctor)
    await db.refresh(user)

    background_tasks.add_task(send_doctor_registration_received, data.email, data.full_name)

    return {"success": True, "message": "Doctor registered. Awaiting verification.", "user_id": user.id}


@router.post("/login")
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    token = create_access_token({"sub": user.id, "role": user.role})

    return {
        "success": True,
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
        },
    }
@router.get("/users/me")
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
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


@router.patch("/users/me")
async def update_my_profile(
    data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if "full_name" in data:
        current_user.full_name = data["full_name"]
    if "phone" in data:
        current_user.phone = data["phone"]
    await db.flush()
    return {"success": True, "message": "Profile updated"}


@router.patch("/users/me/password")
async def change_password(
    data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(data.get("current_password", ""), current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.password_hash = hash_password(data["new_password"])
    await db.flush()
    return {"success": True, "message": "Password changed successfully"}

import random
import string
from datetime import datetime, timedelta

# Simple in-memory OTP store (use Redis in production)
_otp_store: dict = {}


@router.post("/users/me/request-email-change")
async def request_email_change(
    data: dict,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from services.email import send_email_verification_otp

    # Verify password
    if not verify_password(data.get("password", ""), current_user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect password")

    new_email = data.get("new_email", "").lower().strip()
    if not new_email:
        raise HTTPException(status_code=400, detail="New email is required")

    # Check email not already taken
    existing = await db.execute(select(User).where(User.email == new_email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="This email is already registered")

    # Generate 6-digit OTP
    otp = ''.join(random.choices(string.digits, k=6))
    _otp_store[current_user.id] = {
        "otp": otp,
        "new_email": new_email,
        "expires": datetime.utcnow() + timedelta(minutes=15),
    }

    background_tasks.add_task(send_email_verification_otp, new_email, current_user.full_name, otp)
    return {"success": True, "message": "Verification code sent"}


@router.post("/users/me/verify-email-change")
async def verify_email_change(
    data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    record = _otp_store.get(current_user.id)
    if not record:
        raise HTTPException(status_code=400, detail="No pending email change request")

    if datetime.utcnow() > record["expires"]:
        del _otp_store[current_user.id]
        raise HTTPException(status_code=400, detail="Verification code expired. Please request a new one.")

    if data.get("otp") != record["otp"]:
        raise HTTPException(status_code=400, detail="Invalid verification code")

    new_email = record["new_email"]
    if data.get("new_email", "").lower() != new_email:
        raise HTTPException(status_code=400, detail="Email mismatch")

    current_user.email = new_email
    del _otp_store[current_user.id]
    await db.flush()

    return {"success": True, "message": "Email updated successfully"}