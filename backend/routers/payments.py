from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from datetime import datetime
from core.database import get_db
from core.security import get_patient, get_admin, get_doctor
from core.config import settings
from models.user import Appointment, Payment, Doctor, User
from services.storage import upload_payment_proof
from services.email import send_payment_verified

router = APIRouter(prefix="/payments", tags=["Payments"])


class ProofUploadRequest(BaseModel):
    payment_method: str  # easypaisa | jazzcash


@router.post("/{appointment_id}/proof")
async def upload_proof(
    appointment_id: str,
    payment_method: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_patient),
    db: AsyncSession = Depends(get_db),
):
    # Check appointment belongs to this patient
    apt_result = await db.execute(
        select(Appointment).where(
            Appointment.id == appointment_id,
            Appointment.patient_id == current_user.id,
        )
    )
    appointment = apt_result.scalar_one_or_none()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appointment.status not in ("pending",):
        raise HTTPException(status_code=400, detail="Payment not expected for this appointment")

    # Upload screenshot
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5 MB)")

    proof_url = upload_payment_proof(content)

    # Get doctor's fee
    doc_result = await db.execute(select(Doctor).where(Doctor.id == appointment.doctor_id))
    doctor = doc_result.scalar_one()
    amount = float(doctor.consultation_fee)
    commission_rate = settings.COMMISSION_RATE
    commission_amount = round(amount * commission_rate / 100, 2)
    net_amount = round(amount - commission_amount, 2)

    # Check existing payment record
    existing_result = await db.execute(
        select(Payment).where(Payment.appointment_id == appointment_id)
    )
    payment = existing_result.scalar_one_or_none()

    if payment:
        payment.proof_url = proof_url
        payment.payment_method = payment_method
        payment.status = "pending"
    else:
        payment = Payment(
            appointment_id=appointment_id,
            patient_id=current_user.id,
            doctor_id=appointment.doctor_id,
            amount=amount,
            commission_rate=commission_rate,
            commission_amount=commission_amount,
            net_doctor_amount=net_amount,
            payment_method=payment_method,
            proof_url=proof_url,
            status="pending",
        )
        db.add(payment)

    return {"success": True, "message": "Payment proof uploaded. Admin will verify shortly."}


@router.get("/history")
async def payment_history(
    current_user: User = Depends(get_patient),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Payment).where(Payment.patient_id == current_user.id)
    )
    payments = result.scalars().all()
    return {
        "success": True,
        "data": [
            {
                "id": p.id,
                "appointment_id": p.appointment_id,
                "amount": float(p.amount),
                "status": p.status,
                "payment_method": p.payment_method,
                "created_at": str(p.created_at),
            }
            for p in payments
        ],
    }


@router.get("/doctor/earnings")
async def doctor_earnings(
    current_user: User = Depends(get_doctor),
    db: AsyncSession = Depends(get_db),
):
    """Get doctor's total earnings from verified payments"""
    
    # Total earnings (only verified payments)
    total_result = await db.execute(
        select(func.sum(Payment.net_doctor_amount)).where(
            Payment.doctor_id == current_user.id,
            Payment.status == "verified"
        )
    )
    total_earnings = float(total_result.scalar() or 0)

    # This month earnings
    from datetime import datetime
    current_date = datetime.utcnow()
    month_start = current_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    month_result = await db.execute(
        select(func.sum(Payment.net_doctor_amount)).where(
            Payment.doctor_id == current_user.id,
            Payment.status == "verified",
            Payment.verified_at >= month_start
        )
    )
    month_earnings = float(month_result.scalar() or 0)

    # Total commission paid
    commission_result = await db.execute(
        select(func.sum(Payment.commission_amount)).where(
            Payment.doctor_id == current_user.id,
            Payment.status == "verified"
        )
    )
    total_commission = float(commission_result.scalar() or 0)

    return {
        "success": True,
        "data": {
            "total_earned": total_earnings,
            "this_month": month_earnings,
            "total_commission": total_commission,
        },
    }
