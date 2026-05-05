from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from core.database import get_db
from core.security import get_doctor, get_current_user
from models.user import Receipt, Appointment, User

router = APIRouter(prefix="/receipts", tags=["Receipts"])


class MedicationItem(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration: str


class CreateReceiptRequest(BaseModel):
    appointment_id: str
    diagnosis: str
    procedures: List[str] = []
    medications: List[MedicationItem] = []
    next_appointment: Optional[date] = None
    checkup_schedule: str = "Every 6 months"
    doctor_notes: str = ""


@router.post("", status_code=201)
async def create_receipt(
    data: CreateReceiptRequest,
    current_user: User = Depends(get_doctor),
    db: AsyncSession = Depends(get_db),
):
    # Verify appointment belongs to this doctor
    apt_result = await db.execute(
        select(Appointment).where(
            Appointment.id == data.appointment_id,
            Appointment.doctor_id == current_user.id,
        )
    )
    appointment = apt_result.scalar_one_or_none()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Check for existing receipt
    existing = await db.execute(
        select(Receipt).where(Receipt.appointment_id == data.appointment_id)
    )
    receipt = existing.scalar_one_or_none()

    meds_json = [m.dict() for m in data.medications]

    if receipt:
        receipt.diagnosis = data.diagnosis
        receipt.procedures = data.procedures
        receipt.medications = meds_json
        receipt.next_appointment = data.next_appointment
        receipt.checkup_schedule = data.checkup_schedule
        receipt.doctor_notes = data.doctor_notes
    else:
        receipt = Receipt(
            appointment_id=data.appointment_id,
            diagnosis=data.diagnosis,
            procedures=data.procedures,
            medications=meds_json,
            next_appointment=data.next_appointment,
            checkup_schedule=data.checkup_schedule,
            doctor_notes=data.doctor_notes,
        )
        db.add(receipt)

    await db.flush()
    return {"success": True, "receipt_id": receipt.id, "message": "Receipt saved successfully"}


@router.get("/{appointment_id}")
async def get_receipt(
    appointment_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Receipt).where(Receipt.appointment_id == appointment_id)
    )
    receipt = result.scalar_one_or_none()
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")

    return {
        "success": True,
        "data": {
            "id": receipt.id,
            "appointment_id": receipt.appointment_id,
            "diagnosis": receipt.diagnosis,
            "procedures": receipt.procedures,
            "medications": receipt.medications,
            "next_appointment": str(receipt.next_appointment) if receipt.next_appointment else None,
            "checkup_schedule": receipt.checkup_schedule,
            "doctor_notes": receipt.doctor_notes,
            "pdf_url": receipt.pdf_url,
            "created_at": str(receipt.created_at),
        },
    }
