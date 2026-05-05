import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, DateTime, ForeignKey,
    Numeric, SmallInteger, Text, Date, Time, ARRAY, JSON
)
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import relationship
from core.database import Base


def gen_uuid():
    return str(uuid.uuid4())


# ── User ──────────────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=False)
    role = Column(ENUM("patient", "doctor", "admin", name="user_role"), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20))
    is_active = Column(Boolean, default=True)
    email_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    doctor_profile = relationship("Doctor", back_populates="user", uselist=False)
    appointments_as_patient = relationship("Appointment", back_populates="patient", foreign_keys="Appointment.patient_id")
    notifications = relationship("Notification", back_populates="user")


# ── Doctor ────────────────────────────────────────────────────────────────────
class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(UUID(as_uuid=False), ForeignKey("users.id"), primary_key=True)
    specialty = Column(String(100), nullable=False)
    clinic_name = Column(String(255), nullable=False)
    clinic_address = Column(Text, nullable=False)
    city = Column(String(100))
    latitude = Column(Numeric(10, 7))
    longitude = Column(Numeric(10, 7))
    consultation_fee = Column(Numeric(10, 2), nullable=False)
    bio = Column(Text)
    verification_status = Column(
        ENUM("pending", "ai_flagged", "approved", "rejected", name="verification_status"),
        default="pending"
    )
    verification_notes = Column(Text)
    easypaisa_account = Column(String(20))
    jazzcash_account = Column(String(20))
    is_visible = Column(Boolean, default=False)
    average_rating = Column(Numeric(3, 2), default=0.00)
    total_reviews = Column(SmallInteger, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="doctor_profile")
    availability_slots = relationship("AvailabilitySlot", back_populates="doctor")
    appointments = relationship("Appointment", back_populates="doctor", foreign_keys="Appointment.doctor_id")
    certificates = relationship("Certificate", back_populates="doctor")
    media = relationship("Media", back_populates="doctor")
    reviews = relationship("Review", back_populates="doctor")


# ── Availability Slot ─────────────────────────────────────────────────────────
class AvailabilitySlot(Base):
    __tablename__ = "availability_slots"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    doctor_id = Column(UUID(as_uuid=False), ForeignKey("doctors.id"), nullable=False)
    day_of_week = Column(SmallInteger)  # 0=Sun, 6=Sat
    specific_date = Column(Date)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    is_booked = Column(Boolean, default=False)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    doctor = relationship("Doctor", back_populates="availability_slots")
    appointment = relationship("Appointment", back_populates="slot", uselist=False)


# ── Appointment ───────────────────────────────────────────────────────────────
class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    patient_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    doctor_id = Column(UUID(as_uuid=False), ForeignKey("doctors.id"), nullable=False)
    slot_id = Column(UUID(as_uuid=False), ForeignKey("availability_slots.id"))
    status = Column(
        ENUM("pending", "confirmed", "completed", "cancelled", "no_show", name="appointment_status"),
        default="pending"
    )
    appointment_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    cancellation_reason = Column(Text)
    reminder_24h_sent = Column(Boolean, default=False)
    reminder_2h_sent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = relationship("User", back_populates="appointments_as_patient", foreign_keys=[patient_id])
    doctor = relationship("Doctor", back_populates="appointments", foreign_keys=[doctor_id])
    slot = relationship("AvailabilitySlot", back_populates="appointment")
    symptoms = relationship("Symptom", back_populates="appointment", uselist=False)
    payment = relationship("Payment", back_populates="appointment", uselist=False)
    receipt = relationship("Receipt", back_populates="appointment", uselist=False)


# ── Symptom ───────────────────────────────────────────────────────────────────
class Symptom(Base):
    __tablename__ = "symptoms"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    appointment_id = Column(UUID(as_uuid=False), ForeignKey("appointments.id"), unique=True)
    pain_level = Column(SmallInteger, nullable=False)
    symptom_types = Column(ARRAY(String), nullable=False)
    duration = Column(String(100), nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    appointment = relationship("Appointment", back_populates="symptoms")


# ── Payment ───────────────────────────────────────────────────────────────────
class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    appointment_id = Column(UUID(as_uuid=False), ForeignKey("appointments.id"), unique=True)
    patient_id = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    doctor_id = Column(UUID(as_uuid=False), ForeignKey("doctors.id"))
    amount = Column(Numeric(10, 2), nullable=False)
    commission_rate = Column(Numeric(5, 2), nullable=False)
    commission_amount = Column(Numeric(10, 2), nullable=False)
    net_doctor_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(
        ENUM("pending", "verified", "rejected", name="payment_status"),
        default="pending"
    )
    payment_method = Column(ENUM("easypaisa", "jazzcash", name="payment_method"))
    proof_url = Column(Text)
    rejection_reason = Column(Text)
    verified_by = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    verified_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    appointment = relationship("Appointment", back_populates="payment")


# ── Certificate ───────────────────────────────────────────────────────────────
class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    doctor_id = Column(UUID(as_uuid=False), ForeignKey("doctors.id"))
    file_url = Column(Text, nullable=False)
    ocr_text = Column(Text)
    ai_confidence_score = Column(Numeric(5, 2))
    ai_verdict = Column(
        ENUM("likely_valid", "requires_review", "invalid", name="ai_verdict"),
        default="requires_review"
    )
    reviewed_by = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    reviewed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    doctor = relationship("Doctor", back_populates="certificates")


# ── Receipt ───────────────────────────────────────────────────────────────────
class Receipt(Base):
    __tablename__ = "receipts"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    appointment_id = Column(UUID(as_uuid=False), ForeignKey("appointments.id"), unique=True)
    diagnosis = Column(Text)
    procedures = Column(ARRAY(String))
    medications = Column(JSON)
    next_appointment = Column(Date)
    checkup_schedule = Column(String(100))
    doctor_notes = Column(Text)
    pdf_url = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    appointment = relationship("Appointment", back_populates="receipt")


# ── Media ─────────────────────────────────────────────────────────────────────
class Media(Base):
    __tablename__ = "media"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    doctor_id = Column(UUID(as_uuid=False), ForeignKey("doctors.id"))
    file_url = Column(Text, nullable=False)
    media_type = Column(ENUM("image", "video", name="media_type"))
    caption = Column(String(255))
    order_index = Column(SmallInteger, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    doctor = relationship("Doctor", back_populates="media")


# ── Notification ──────────────────────────────────────────────────────────────
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    type = Column(String(50))
    title = Column(String(255))
    body = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


# ── Feature Flag ──────────────────────────────────────────────────────────────
class FeatureFlag(Base):
    __tablename__ = "feature_flags"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    flag_name = Column(String(50), unique=True, nullable=False)
    is_enabled = Column(Boolean, default=True)
    description = Column(Text)
    updated_by = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ── Review ────────────────────────────────────────────────────────────────────
class Review(Base):
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    patient_id = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    doctor_id = Column(UUID(as_uuid=False), ForeignKey("doctors.id"))
    appointment_id = Column(UUID(as_uuid=False), ForeignKey("appointments.id"))
    rating = Column(SmallInteger, nullable=False)
    comment = Column(Text)
    is_visible = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    doctor = relationship("Doctor", back_populates="reviews")


# ── Chat Session & Messages ───────────────────────────────────────────────────
class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime)

    messages = relationship("ChatMessage", back_populates="session")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    session_id = Column(UUID(as_uuid=False), ForeignKey("chat_sessions.id"))
    role = Column(ENUM("user", "assistant", name="chat_role"))
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")
