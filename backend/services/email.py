"""
Email Service — CliniSmile AI
All transactional emails with HTML templates.
"""

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from core.config import settings


def _send(to: str, subject: str, html: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{settings.MAIL_FROM_NAME} <{settings.MAIL_FROM}>"
    msg["To"] = to
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
        server.starttls()
        server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
        server.sendmail(settings.MAIL_FROM, to, msg.as_string())


def _base(content: str) -> str:
    return f"""
    <html><body style="font-family:Arial,sans-serif;background:#f5f7fa;padding:20px">
    <div style="max-width:600px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;
                box-shadow:0 2px 10px rgba(0,0,0,0.08)">
      <div style="background:linear-gradient(135deg,#1A6B9A,#2E8B6F);padding:30px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:26px">🦷 CliniSmile AI</h1>
        <p style="color:rgba(255,255,255,0.85);margin:6px 0 0">AI-Powered Dental Care Platform</p>
      </div>
      <div style="padding:32px">{content}</div>
      <div style="background:#f0f4f8;padding:16px;text-align:center">
        <p style="color:#888;font-size:12px;margin:0">
          © 2026 CliniSmile AI · Powered by AI · Built with ❤️
        </p>
      </div>
    </div>
    </body></html>
    """


# ── 1. Patient Welcome ────────────────────────────────────────────────────────
def send_patient_welcome(to: str, name: str):
    content = f"""
    <h2 style="color:#1A6B9A">Welcome to CliniSmile AI, {name}! 🎉</h2>
    <p>Your account has been created successfully. You can now:</p>
    <ul>
      <li>Search for verified dentists near you</li>
      <li>Book appointments online</li>
      <li>Chat with our AI dental assistant</li>
      <li>Manage your medical history</li>
    </ul>
    <a href="{settings.FRONTEND_URL}/login"
       style="display:inline-block;background:#1A6B9A;color:#fff;padding:12px 28px;
              border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">
      Get Started
    </a>
    """
    _send(to, "Welcome to CliniSmile AI! 🦷", _base(content))


# ── 2. Doctor Registration Received ──────────────────────────────────────────
def send_doctor_registration_received(to: str, name: str):
    content = f"""
    <h2 style="color:#1A6B9A">Registration Received, Dr. {name}</h2>
    <p>Thank you for registering on CliniSmile AI. Your application is under review.</p>
    <p><strong>What happens next?</strong></p>
    <ol>
      <li>Our AI system will scan your uploaded certificates</li>
      <li>Our admin team will manually review your credentials</li>
      <li>You'll receive an email with the approval decision within 24-48 hours</li>
    </ol>
    <p style="color:#888;font-size:14px">
      If you have questions, reply to this email.
    </p>
    """
    _send(to, "Your CliniSmile AI Registration is Under Review", _base(content))


# ── 3. Doctor Approved ────────────────────────────────────────────────────────
def send_doctor_approved(to: str, name: str):
    content = f"""
    <h2 style="color:#2E8B6F">Congratulations, Dr. {name}! ✅</h2>
    <p>Your registration has been <strong>approved</strong>. Your profile is now live and visible to patients.</p>
    <p><strong>Next steps:</strong></p>
    <ul>
      <li>Set your availability calendar</li>
      <li>Add your clinic photos and videos</li>
      <li>Complete your profile bio</li>
    </ul>
    <a href="{settings.FRONTEND_URL}/doctor/dashboard"
       style="display:inline-block;background:#2E8B6F;color:#fff;padding:12px 28px;
              border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">
      Go to Dashboard
    </a>
    """
    _send(to, "✅ Your CliniSmile AI Profile is Approved!", _base(content))


# ── 4. Doctor Rejected ────────────────────────────────────────────────────────
def send_doctor_rejected(to: str, name: str, reason: str):
    content = f"""
    <h2 style="color:#c0392b">Application Update, Dr. {name}</h2>
    <p>Unfortunately, your registration could not be approved at this time.</p>
    <div style="background:#fff5f5;border-left:4px solid #c0392b;padding:16px;border-radius:4px;margin:16px 0">
      <strong>Reason:</strong> {reason}
    </div>
    <p>You can re-submit your application with updated documentation:</p>
    <a href="{settings.FRONTEND_URL}/doctor/resubmit"
       style="display:inline-block;background:#1A6B9A;color:#fff;padding:12px 28px;
              border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">
      Re-submit Application
    </a>
    """
    _send(to, "CliniSmile AI — Application Status Update", _base(content))


# ── 5. Appointment Confirmation ───────────────────────────────────────────────
def send_appointment_confirmation(
    patient_email: str, doctor_email: str,
    patient_name: str, doctor_name: str,
    date: str, start_time: str, clinic_name: str, clinic_address: str,
    fee: str, appointment_id: str,
):
    patient_content = f"""
    <h2 style="color:#1A6B9A">Appointment Confirmed! 📅</h2>
    <div style="background:#f0f7fb;border-radius:8px;padding:20px;margin:16px 0">
      <p><strong>Doctor:</strong> Dr. {doctor_name}</p>
      <p><strong>Clinic:</strong> {clinic_name}</p>
      <p><strong>Address:</strong> {clinic_address}</p>
      <p><strong>Date:</strong> {date}</p>
      <p><strong>Time:</strong> {start_time}</p>
      <p><strong>Fee:</strong> PKR {fee}</p>
    </div>
    <p>Please arrive 10 minutes early. Bring any previous dental records if available.</p>
    """
    _send(patient_email, f"✅ Appointment Confirmed — {date}", _base(patient_content))

    doctor_content = f"""
    <h2 style="color:#2E8B6F">New Appointment Scheduled</h2>
    <div style="background:#f0f7fb;border-radius:8px;padding:20px;margin:16px 0">
      <p><strong>Patient:</strong> {patient_name}</p>
      <p><strong>Date:</strong> {date}</p>
      <p><strong>Time:</strong> {start_time}</p>
      <p><strong>Appointment ID:</strong> {appointment_id}</p>
    </div>
    """
    _send(doctor_email, f"New Patient Appointment — {date}", _base(doctor_content))


# ── 6. Payment Verified ───────────────────────────────────────────────────────
def send_payment_verified(to: str, name: str, amount: str, appointment_date: str):
    content = f"""
    <h2 style="color:#2E8B6F">Payment Verified ✅</h2>
    <p>Hi {name}, your payment of <strong>PKR {amount}</strong> has been verified.</p>
    <p>Your appointment on <strong>{appointment_date}</strong> is now confirmed.</p>
    <a href="{settings.FRONTEND_URL}/appointments"
       style="display:inline-block;background:#1A6B9A;color:#fff;padding:12px 28px;
              border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">
      View Appointment
    </a>
    """
    _send(to, "Payment Verified — Appointment Confirmed", _base(content))


# ── 7. Appointment Reminder ───────────────────────────────────────────────────
def send_appointment_reminder(
    to: str, name: str, doctor_name: str,
    date: str, start_time: str, clinic_address: str, hours_before: int
):
    urgency = "Tomorrow" if hours_before == 24 else "In 2 Hours"
    content = f"""
    <h2 style="color:#1A6B9A">⏰ Appointment Reminder — {urgency}</h2>
    <p>Hi {name}, this is a reminder about your upcoming appointment.</p>
    <div style="background:#f0f7fb;border-radius:8px;padding:20px;margin:16px 0">
      <p><strong>Doctor:</strong> Dr. {doctor_name}</p>
      <p><strong>Date:</strong> {date}</p>
      <p><strong>Time:</strong> {start_time}</p>
      <p><strong>Address:</strong> {clinic_address}</p>
    </div>
    """
    _send(to, f"⏰ Appointment Reminder — {urgency}", _base(content))


# ── 8. Appointment Cancelled ──────────────────────────────────────────────────
def send_appointment_cancelled(to: str, name: str, date: str, reason: str = ""):
    content = f"""
    <h2 style="color:#c0392b">Appointment Cancelled</h2>
    <p>Hi {name}, your appointment on <strong>{date}</strong> has been cancelled.</p>
    {"<p><strong>Reason:</strong> " + reason + "</p>" if reason else ""}
    <a href="{settings.FRONTEND_URL}/doctors"
       style="display:inline-block;background:#1A6B9A;color:#fff;padding:12px 28px;
              border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">
      Book Another Appointment
    </a>
    """
    _send(to, "Appointment Cancelled — CliniSmile AI", _base(content))

def send_email_verification_otp(to: str, name: str, otp: str):
    content = f"""
    <h2 style="color:#1A6B9A">Email Verification Code</h2>
    <p>Hi {name}, you requested to change your CliniSmile AI email address.</p>
    <p>Your 6-digit verification code is:</p>
    <div style="background:#f0f7fb;border-radius:12px;padding:24px;text-align:center;margin:20px 0">
      <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#1A6B9A">{otp}</span>
    </div>
    <p style="color:#888;font-size:14px">
      This code expires in <strong>15 minutes</strong>.
    </p>
    <p style="color:#888;font-size:14px">
      If you did not request this change, please ignore this email.
    </p>
    """
    _send(to, "CliniSmile AI — Email Verification Code", _base(content))