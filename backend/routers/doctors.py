from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from datetime import date, time, timedelta
from core.database import get_db
from core.security import get_current_user, get_doctor
from models.user import Doctor, User, AvailabilitySlot, Certificate, Media
from services.storage import upload_certificate, upload_media_image, upload_media_video
from services.ocr_verification import verify_certificate
from services.recommendation import rank_doctors, haversine_km
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/doctors", tags=["Doctors"])


# ── Public: Search / List Doctors ─────────────────────────────────────────────
@router.get("")
async def search_doctors(
    city: Optional[str] = None,
    specialty: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    min_fee: Optional[float] = None,
    max_fee: Optional[float] = None,
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Doctor, User)
        .join(User, Doctor.id == User.id)
        .where(Doctor.is_visible == True, User.is_active == True)
    )
    if city:
        query = query.where(func.lower(Doctor.city).contains(city.lower()))
    if specialty:
        query = query.where(func.lower(Doctor.specialty).contains(specialty.lower()))
    if min_fee:
        query = query.where(Doctor.consultation_fee >= min_fee)
    if max_fee:
        query = query.where(Doctor.consultation_fee <= max_fee)

    result = await db.execute(query)
    rows = result.all()

    doctors_data = []
    today = date.today()
    week_later = today + timedelta(days=7)

    for doctor, user in rows:
        # Count free slots in next 7 days
        slots_result = await db.execute(
            select(func.count(AvailabilitySlot.id))
            .where(
                AvailabilitySlot.doctor_id == doctor.id,
                AvailabilitySlot.is_booked == False,
                AvailabilitySlot.is_available == True,
                AvailabilitySlot.specific_date >= today,
                AvailabilitySlot.specific_date <= week_later,
            )
        )
        slots_next_7 = slots_result.scalar() or 0

        distance_km = None
        if lat and lng and doctor.latitude and doctor.longitude:
            distance_km = haversine_km(lat, lng, float(doctor.latitude), float(doctor.longitude))

        doctors_data.append({
            "doctor": {
                "id": doctor.id,
                "full_name": user.full_name,
                "specialty": doctor.specialty,
                "clinic_name": doctor.clinic_name,
                "clinic_address": doctor.clinic_address,
                "city": doctor.city,
                "consultation_fee": float(doctor.consultation_fee),
                "average_rating": float(doctor.average_rating),
                "total_reviews": doctor.total_reviews,
                "latitude": float(doctor.latitude) if doctor.latitude else None,
                "longitude": float(doctor.longitude) if doctor.longitude else None,
                "bio": doctor.bio,
            },
            "distance_km": distance_km,
            "slots_next_7": slots_next_7,
            "avg_rating": float(doctor.average_rating),
            "confirmed_appointments": 0,
            "total_appointments": 0,
        })

    ranked = rank_doctors(doctors_data)
    return {"success": True, "data": ranked}


# ── Public: Doctor Profile ────────────────────────────────────────────────────
@router.get("/{doctor_id}")
async def get_doctor_profile(doctor_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Doctor, User).join(User).where(Doctor.id == doctor_id, Doctor.is_visible == True)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Doctor not found")

    doctor, user = row
    media_result = await db.execute(
        select(Media).where(Media.doctor_id == doctor_id).order_by(Media.order_index)
    )
    media = media_result.scalars().all()

    return {
        "success": True,
        "data": {
            "id": doctor.id,
            "full_name": user.full_name,
            "specialty": doctor.specialty,
            "clinic_name": doctor.clinic_name,
            "clinic_address": doctor.clinic_address,
            "city": doctor.city,
            "consultation_fee": float(doctor.consultation_fee),
            "average_rating": float(doctor.average_rating),
            "total_reviews": doctor.total_reviews,
            "bio": doctor.bio,
            "latitude": float(doctor.latitude) if doctor.latitude else None,
            "longitude": float(doctor.longitude) if doctor.longitude else None,
            "easypaisa_account": doctor.easypaisa_account,
            "jazzcash_account": doctor.jazzcash_account,
            "media": [{"url": m.file_url, "type": m.media_type, "caption": m.caption} for m in media],
        },
    }


# ── Public: Available Slots ───────────────────────────────────────────────────
@router.get("/me/slots")
async def get_my_slots(
    date_from: date = Query(default=date.today()),
    date_to: date = Query(default=date.today() + timedelta(days=30)),
    current_user: User = Depends(get_doctor),
    db: AsyncSession = Depends(get_db),
):
    """Doctor can see ALL their slots (booked or not)"""
    result = await db.execute(
        select(AvailabilitySlot)
        .where(
            AvailabilitySlot.doctor_id == current_user.id,
            AvailabilitySlot.specific_date >= date_from,
            AvailabilitySlot.specific_date <= date_to,
        )
        .order_by(AvailabilitySlot.specific_date, AvailabilitySlot.start_time)
    )
    slots = result.scalars().all()

    return {
        "success": True,
        "data": [
            {
                "id": s.id,
                "date": str(s.specific_date),
                "start_time": str(s.start_time),
                "end_time": str(s.end_time),
                "is_booked": s.is_booked,
            }
            for s in slots
        ],
    }


@router.get("/{doctor_id}/slots")
async def get_available_slots(
    doctor_id: str,
    date_from: date = Query(default=date.today()),
    date_to: date = Query(default=date.today() + timedelta(days=7)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AvailabilitySlot)
        .where(
            AvailabilitySlot.doctor_id == doctor_id,
            AvailabilitySlot.is_booked == False,
            AvailabilitySlot.is_available == True,
            AvailabilitySlot.specific_date >= date_from,
            AvailabilitySlot.specific_date <= date_to,
        )
        .order_by(AvailabilitySlot.specific_date, AvailabilitySlot.start_time)
    )
    slots = result.scalars().all()

    return {
        "success": True,
        "data": [
            {
                "id": s.id,
                "date": str(s.specific_date),
                "start_time": str(s.start_time),
                "end_time": str(s.end_time),
            }
            for s in slots
        ],
    }


# ── Doctor: Upload Certificate ────────────────────────────────────────────────
@router.post("/certificates")
async def upload_doctor_certificate(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_doctor),
    db: AsyncSession = Depends(get_db),
):
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10 MB)")

    file_url = upload_certificate(content)

    cert = Certificate(doctor_id=current_user.id, file_url=file_url)
    db.add(cert)
    await db.flush()
    cert_id = cert.id

    file_type = "pdf" if file.content_type == "application/pdf" else "image"
    background_tasks.add_task(_run_ocr, cert_id, file_url, file_type)

    return {"success": True, "message": "Certificate uploaded. OCR verification in progress.", "certificate_id": cert_id}


async def _run_ocr(cert_id: str, file_url: str, file_type: str):
    from core.database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Certificate).where(Certificate.id == cert_id))
        cert = result.scalar_one_or_none()
        if not cert:
            return
        ocr_result = await verify_certificate(file_url, file_type)
        cert.ocr_text = ocr_result["ocr_text"]
        cert.ai_confidence_score = ocr_result["ai_confidence_score"]
        cert.ai_verdict = ocr_result["ai_verdict"]
        await db.commit()


# ── Doctor: Upload Media ──────────────────────────────────────────────────────
class MediaMeta(BaseModel):
    caption: str = ""
    order_index: int = 0


@router.post("/media/image")
async def upload_clinic_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_doctor),
    db: AsyncSession = Depends(get_db),
):
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10 MB)")
    url = upload_media_image(content)
    media = Media(doctor_id=current_user.id, file_url=url, media_type="image")
    db.add(media)
    return {"success": True, "url": url}


@router.post("/media/video")
async def upload_clinic_video(
    file: UploadFile = File(...),
    current_user: User = Depends(get_doctor),
    db: AsyncSession = Depends(get_db),
):
    content = await file.read()
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 50 MB)")
    url = upload_media_video(content)
    media = Media(doctor_id=current_user.id, file_url=url, media_type="video")
    db.add(media)
    return {"success": True, "url": url}


# ── Doctor: Manage Availability ───────────────────────────────────────────────
class SlotCreate(BaseModel):
    specific_date: date
    start_time: time
    end_time: time


@router.post("/availability")
async def create_slot(
    data: SlotCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    logger.info(f"[SLOT CREATE] Received request from user: {current_user.id}, role: {current_user.role}")
    logger.info(f"[SLOT CREATE] Data: date={data.specific_date}, start={data.start_time}, end={data.end_time}")
    
    # Allow any doctor role user (approved or not)
    if current_user.role != "doctor":
        logger.error(f"[SLOT CREATE] Access denied - user role is {current_user.role}, not doctor")
        raise HTTPException(status_code=403, detail="Doctors only")

    # Verify doctor profile exists
    result = await db.execute(
        select(Doctor).where(Doctor.id == current_user.id)
    )
    doctor = result.scalar_one_or_none()
    if not doctor:
        logger.error(f"[SLOT CREATE] Doctor profile not found for user {current_user.id}")
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    logger.info(f"[SLOT CREATE] Doctor profile found: {doctor.id}")

    # Check for duplicate slot
    existing = await db.execute(
        select(AvailabilitySlot).where(
            AvailabilitySlot.doctor_id == current_user.id,
            AvailabilitySlot.specific_date == data.specific_date,
            AvailabilitySlot.start_time == data.start_time,
        )
    )
    if existing.scalar_one_or_none():
        logger.warning(f"[SLOT CREATE] Duplicate slot detected")
        raise HTTPException(status_code=409, detail="A slot already exists at this time")

    try:
        slot = AvailabilitySlot(
            doctor_id=current_user.id,
            specific_date=data.specific_date,
            start_time=data.start_time,
            end_time=data.end_time,
        )
        db.add(slot)
        logger.info(f"[SLOT CREATE] Slot object created: {slot}")
        
        await db.flush()
        logger.info(f"[SLOT CREATE] Flushed to DB - slot ID: {slot.id}")
        
        await db.commit()
        logger.info(f"[SLOT CREATE] Successfully committed - returning slot_id: {slot.id}")
        
        return {"success": True, "slot_id": slot.id, "message": "Slot added successfully"}
    except Exception as e:
        logger.exception(f"[SLOT CREATE] Exception occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating slot: {str(e)}")


@router.delete("/availability/{slot_id}")
async def delete_slot(
    slot_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Doctors only")

    result = await db.execute(
        select(AvailabilitySlot).where(
            AvailabilitySlot.id == slot_id,
            AvailabilitySlot.doctor_id == current_user.id,
            AvailabilitySlot.is_booked == False,
        )
    )
    slot = result.scalar_one_or_none()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found or already booked")
    await db.delete(slot)
    return {"success": True}

@router.patch("/me")
async def update_doctor_profile(
    data: dict,
    current_user: User = Depends(get_doctor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Doctor).where(Doctor.id == current_user.id))
    doctor = result.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    fields = ["specialty", "clinic_name", "clinic_address", "city",
              "consultation_fee", "easypaisa_account", "jazzcash_account", "bio"]
    for field in fields:
        if field in data and data[field] is not None:
            setattr(doctor, field, data[field])

    await db.flush()
    return {"success": True, "message": "Doctor profile updated"}