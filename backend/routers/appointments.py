from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel
from typing import List
from datetime import date as DateType
from core.database import get_db
from core.security import get_current_user, get_patient, get_doctor
from models.user import Appointment, AvailabilitySlot, Symptom, Doctor, User
from services.email import send_appointment_confirmation, send_appointment_cancelled

router = APIRouter(prefix="/appointments", tags=["Appointments"])


class SymptomData(BaseModel):
    pain_level: int
    symptom_types: List[str]
    duration: str
    notes: str = ""


class BookAppointmentRequest(BaseModel):
    slot_id: str
    symptoms: SymptomData


@router.post("", status_code=201)
async def book_appointment(
    data: BookAppointmentRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_patient),
    db: AsyncSession = Depends(get_db),
):
    # Lock and validate slot
    slot_result = await db.execute(
        select(AvailabilitySlot).where(
            AvailabilitySlot.id == data.slot_id,
            AvailabilitySlot.is_booked == False,
            AvailabilitySlot.is_available == True,
        ).with_for_update()
    )
    slot = slot_result.scalar_one_or_none()
    if not slot:
        raise HTTPException(status_code=409, detail="Slot not available")

    # Create appointment
    appointment = Appointment(
        patient_id=current_user.id,
        doctor_id=slot.doctor_id,
        slot_id=slot.id,
        appointment_date=slot.specific_date,
        start_time=slot.start_time,
        end_time=slot.end_time,
        status="pending",
    )
    db.add(appointment)
    slot.is_booked = True
    await db.flush()

    # Save symptoms
    symptom = Symptom(
        appointment_id=appointment.id,
        pain_level=data.symptoms.pain_level,
        symptom_types=data.symptoms.symptom_types,
        duration=data.symptoms.duration,
        notes=data.symptoms.notes,
    )
    db.add(symptom)
    await db.flush()

    return {
        "success": True,
        "appointment_id": appointment.id,
        "message": "Appointment created. Please upload payment proof.",
    }


@router.get("")
async def list_my_appointments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role == "patient":
        query = select(Appointment).where(Appointment.patient_id == current_user.id)
    elif current_user.role == "doctor":
        query = select(Appointment).where(Appointment.doctor_id == current_user.id)
    else:
        query = select(Appointment)

    result = await db.execute(query.order_by(Appointment.appointment_date.desc()))
    appointments = result.scalars().all()

    return {
        "success": True,
        "data": [
            {
                "id": a.id,
                "patient_id": a.patient_id,
                "doctor_id": a.doctor_id,
                "appointment_date": str(a.appointment_date),
                "start_time": str(a.start_time),
                "end_time": str(a.end_time),
                "status": a.status,
            }
            for a in appointments
        ],
    }


@router.get("/{appointment_id}")
async def get_appointment(
    appointment_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Appointment).where(Appointment.id == appointment_id)
    )
    appointment = result.scalar_one_or_none()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Access control
    if current_user.role not in ("admin",) and current_user.id not in (
        appointment.patient_id, appointment.doctor_id
    ):
        raise HTTPException(status_code=403, detail="Access denied")

    # Get symptoms
    sym_result = await db.execute(
        select(Symptom).where(Symptom.appointment_id == appointment_id)
    )
    symptoms = sym_result.scalar_one_or_none()

    return {
        "success": True,
        "data": {
            "id": appointment.id,
            "patient_id": appointment.patient_id,
            "doctor_id": appointment.doctor_id,
            "appointment_date": str(appointment.appointment_date),
            "start_time": str(appointment.start_time),
            "status": appointment.status,
            "symptoms": {
                "pain_level": symptoms.pain_level,
                "symptom_types": symptoms.symptom_types,
                "duration": symptoms.duration,
                "notes": symptoms.notes,
            } if symptoms else None,
        },
    }


@router.patch("/{appointment_id}/cancel")
async def cancel_appointment(
    appointment_id: str,
    background_tasks: BackgroundTasks,
    reason: str = "",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Appointment).where(Appointment.id == appointment_id)
    )
    appointment = result.scalar_one_or_none()
    if not appointment:
        raise HTTPException(status_code=404, detail="Not found")

    if appointment.status in ("completed", "cancelled"):
        raise HTTPException(status_code=400, detail="Cannot cancel this appointment")

    appointment.status = "cancelled"
    appointment.cancellation_reason = reason

    # Release slot
    if appointment.slot_id:
        slot_result = await db.execute(
            select(AvailabilitySlot).where(AvailabilitySlot.id == appointment.slot_id)
        )
        slot = slot_result.scalar_one_or_none()
        if slot:
            slot.is_booked = False

    # Notify patient
    patient_result = await db.execute(select(User).where(User.id == appointment.patient_id))
    patient = patient_result.scalar_one_or_none()
    if patient:
        background_tasks.add_task(
            send_appointment_cancelled,
            patient.email, patient.full_name,
            str(appointment.appointment_date), reason
        )

    return {"success": True, "message": "Appointment cancelled"}


@router.patch("/{appointment_id}/complete")
async def mark_complete(
    appointment_id: str,
    current_user: User = Depends(get_doctor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Appointment).where(
            Appointment.id == appointment_id,
            Appointment.doctor_id == current_user.id,
        )
    )
    appointment = result.scalar_one_or_none()
    if not appointment:
        raise HTTPException(status_code=404, detail="Not found")

    appointment.status = "completed"
    return {"success": True}
