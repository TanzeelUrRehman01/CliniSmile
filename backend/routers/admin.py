from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from datetime import datetime
from core.database import get_db
from core.security import get_admin
from models.user import (
    User, Doctor, Certificate, Payment, Appointment,
    FeatureFlag, Notification, AvailabilitySlot, Symptom, Receipt, Media
)
from services.email import send_doctor_approved, send_doctor_rejected, send_payment_verified
from sqlalchemy import delete

router = APIRouter(prefix="/admin", tags=["Admin"])


# ── Dashboard KPIs ────────────────────────────────────────────────────────────
@router.get("/dashboard")
async def dashboard(
    current_user: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    total_users = (await db.execute(select(func.count(User.id)).where(User.is_active == True))).scalar()
    total_doctors = (await db.execute(select(func.count(Doctor.id)).join(User).where(User.is_active == True))).scalar()
    total_appointments = (await db.execute(select(func.count(Appointment.id)))).scalar()

    revenue_result = await db.execute(
        select(func.sum(Payment.commission_amount)).where(Payment.status == "verified")
    )
    total_revenue = float(revenue_result.scalar() or 0)

    pending_verifications = (
        await db.execute(
            select(func.count(Doctor.id)).where(Doctor.verification_status == "pending")
        )
    ).scalar()

    pending_payments = (
        await db.execute(
            select(func.count(Payment.id)).where(Payment.status == "pending")
        )
    ).scalar()

    return {
        "success": True,
        "data": {
            "total_users": total_users,
            "total_doctors": total_doctors,
            "total_appointments": total_appointments,
            "total_revenue_pkr": total_revenue,
            "pending_doctor_verifications": pending_verifications,
            "pending_payment_verifications": pending_payments,
        },
    }


# ── Doctor Verification Queue ─────────────────────────────────────────────────
@router.get("/doctors/pending")
async def pending_doctors(
    current_user: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Doctor, User)
        .join(User)
        .where(Doctor.verification_status.in_(["pending", "ai_flagged"]))
    )
    rows = result.all()

    doctors_data = []
    for doctor, user in rows:
        certs_result = await db.execute(
            select(Certificate).where(Certificate.doctor_id == doctor.id)
        )
        certs = certs_result.scalars().all()
        doctors_data.append({
            "id": doctor.id,
            "full_name": user.full_name,
            "email": user.email,
            "specialty": doctor.specialty,
            "clinic_name": doctor.clinic_name,
            "verification_status": doctor.verification_status,
            "certificates": [
                {
                    "id": c.id,
                    "file_url": c.file_url,
                    "ai_confidence_score": float(c.ai_confidence_score) if c.ai_confidence_score else None,
                    "ai_verdict": c.ai_verdict,
                    "ocr_text_preview": c.ocr_text[:500] if c.ocr_text else "",
                }
                for c in certs
            ],
        })

    return {"success": True, "data": doctors_data}


class VerifyDoctorRequest(BaseModel):
    approved: bool
    notes: str = ""


@router.patch("/doctors/{doctor_id}/verify")
async def verify_doctor(
    doctor_id: str,
    data: VerifyDoctorRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Doctor, User).join(User).where(Doctor.id == doctor_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Doctor not found")
    doctor, user = row

    if data.approved:
        doctor.verification_status = "approved"
        doctor.is_visible = True
        background_tasks.add_task(send_doctor_approved, user.email, user.full_name)
    else:
        doctor.verification_status = "rejected"
        doctor.is_visible = False
        background_tasks.add_task(send_doctor_rejected, user.email, user.full_name, data.notes)

    doctor.verification_notes = data.notes

    return {"success": True, "message": f"Doctor {'approved' if data.approved else 'rejected'}"}


# ── Payment Verification ──────────────────────────────────────────────────────
@router.get("/payments/pending")
async def pending_payments(
    current_user: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Payment).where(Payment.status == "pending")
    )
    payments = result.scalars().all()
    return {
        "success": True,
        "data": [
            {
                "id": p.id,
                "appointment_id": p.appointment_id,
                "amount": float(p.amount),
                "commission_rate": float(p.commission_rate),
                "commission_amount": float(p.commission_amount),
                "payment_method": p.payment_method,
                "proof_url": p.proof_url,
                "created_at": str(p.created_at),
            }
            for p in payments
        ],
    }


class VerifyPaymentRequest(BaseModel):
    approved: bool
    rejection_reason: str = ""


@router.patch("/payments/{payment_id}/verify")
async def verify_payment(
    payment_id: str,
    data: VerifyPaymentRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Payment).where(Payment.id == payment_id))
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    apt_result = await db.execute(
        select(Appointment).where(Appointment.id == payment.appointment_id)
    )
    appointment = apt_result.scalar_one_or_none()

    if data.approved:
        payment.status = "verified"
        payment.verified_by = current_user.id
        payment.verified_at = datetime.utcnow()
        if appointment:
            appointment.status = "confirmed"

        # Email patient
        patient_result = await db.execute(select(User).where(User.id == payment.patient_id))
        patient = patient_result.scalar_one_or_none()
        if patient:
            background_tasks.add_task(
                send_payment_verified,
                patient.email, patient.full_name,
                str(payment.amount),
                str(appointment.appointment_date) if appointment else "",
            )
    else:
        payment.status = "rejected"
        payment.rejection_reason = data.rejection_reason

    return {"success": True}


# ── Feature Flags ─────────────────────────────────────────────────────────────
@router.get("/feature-flags")
async def get_flags(
    current_user: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(FeatureFlag))
    flags = result.scalars().all()
    return {
        "success": True,
        "data": [{"name": f.flag_name, "enabled": f.is_enabled, "description": f.description} for f in flags],
    }


class FlagUpdate(BaseModel):
    is_enabled: bool


@router.patch("/feature-flags/{flag_name}")
async def toggle_flag(
    flag_name: str,
    data: FlagUpdate,
    current_user: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(FeatureFlag).where(FeatureFlag.flag_name == flag_name))
    flag = result.scalar_one_or_none()
    if not flag:
        flag = FeatureFlag(flag_name=flag_name, is_enabled=data.is_enabled, updated_by=current_user.id)
        db.add(flag)
    else:
        flag.is_enabled = data.is_enabled
        flag.updated_by = current_user.id

    return {"success": True, "flag": flag_name, "enabled": data.is_enabled}


# ── User Management ───────────────────────────────────────────────────────────
@router.get("/users")
async def list_users(
    current_user: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.is_active == True))
    users = result.scalars().all()
    return {
        "success": True,
        "data": [
            {"id": u.id, "full_name": u.full_name, "email": u.email, "role": u.role, "is_active": u.is_active}
            for u in users
        ],
    }


@router.patch("/users/{user_id}/toggle")
async def toggle_user(
    user_id: str,
    current_user: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    await db.commit()
    return {"success": True, "is_active": user.is_active}

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    """Soft delete: mark user as inactive instead of hard delete"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.email == "admin@clinismile.ai":
        raise HTTPException(status_code=403, detail="Owner admin cannot be deleted")

    # SOFT DELETE: just mark as inactive
    user.is_active = False
    await db.commit()
    return {"success": True, "message": f"User {user.full_name} deleted"}