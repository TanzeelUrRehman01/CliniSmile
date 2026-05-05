"""
Appointment Reminder Scheduler
================================
Sends 24h and 2h reminder emails automatically.
Run separately or integrate with APScheduler in main.py.

Usage (standalone):
    python scheduler.py

Or integrate in main.py lifespan with APScheduler.
"""
import asyncio
from datetime import datetime, timedelta, date, time
from sqlalchemy import select
from core.database import AsyncSessionLocal
from models.user import Appointment, User, Doctor
from services.email import send_appointment_reminder


async def send_reminders():
    now = datetime.utcnow()
    # Add 5 PKT hours offset
    pkt_now = now + timedelta(hours=5)
    today = pkt_now.date()

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Appointment).where(
                Appointment.status == "confirmed",
                Appointment.appointment_date >= today,
            )
        )
        appointments = result.scalars().all()

        for apt in appointments:
            apt_dt = datetime.combine(apt.appointment_date, apt.start_time)
            diff_hours = (apt_dt - pkt_now).total_seconds() / 3600

            # 24h reminder
            if 23 <= diff_hours <= 25 and not apt.reminder_24h_sent:
                patient = (await db.execute(select(User).where(User.id == apt.patient_id))).scalar_one_or_none()
                doctor  = (await db.execute(select(User).where(User.id == apt.doctor_id))).scalar_one_or_none()
                doc_profile = (await db.execute(
                    select(Doctor).where(Doctor.id == apt.doctor_id)
                )).scalar_one_or_none()

                if patient and doctor:
                    send_appointment_reminder(
                        to=patient.email,
                        name=patient.full_name,
                        doctor_name=doctor.full_name,
                        date=str(apt.appointment_date),
                        start_time=str(apt.start_time),
                        clinic_address=doc_profile.clinic_address if doc_profile else "",
                        hours_before=24,
                    )
                    apt.reminder_24h_sent = True
                    print(f"[REMINDER-24H] Sent to {patient.email}")

            # 2h reminder
            elif 1.5 <= diff_hours <= 2.5 and not apt.reminder_2h_sent:
                patient = (await db.execute(select(User).where(User.id == apt.patient_id))).scalar_one_or_none()
                doctor  = (await db.execute(select(User).where(User.id == apt.doctor_id))).scalar_one_or_none()
                doc_profile = (await db.execute(
                    select(Doctor).where(Doctor.id == apt.doctor_id)
                )).scalar_one_or_none()

                if patient and doctor:
                    send_appointment_reminder(
                        to=patient.email,
                        name=patient.full_name,
                        doctor_name=doctor.full_name,
                        date=str(apt.appointment_date),
                        start_time=str(apt.start_time),
                        clinic_address=doc_profile.clinic_address if doc_profile else "",
                        hours_before=2,
                    )
                    apt.reminder_2h_sent = True
                    print(f"[REMINDER-2H] Sent to {patient.email}")

        await db.commit()


async def run_loop():
    print("⏰ Reminder scheduler started. Checking every 30 minutes...")
    while True:
        try:
            await send_reminders()
        except Exception as e:
            print(f"[SCHEDULER ERROR] {e}")
        await asyncio.sleep(1800)  # every 30 minutes


if __name__ == "__main__":
    asyncio.run(run_loop())
