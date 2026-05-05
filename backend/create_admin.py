"""
Create Admin Account
====================
Run this ONCE after setting up the database to create the first admin user.

Usage:
    cd backend
    python create_admin.py
"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from core.database import AsyncSessionLocal, engine, create_tables
from core.security import hash_password
from models.user import User, FeatureFlag
from sqlalchemy import select
import time


DEFAULT_FLAGS = [
    {"flag_name": "chatbot",       "is_enabled": True,  "description": "AI Dental Consultation Chatbot"},
    {"flag_name": "payments",      "is_enabled": True,  "description": "Payment System (Easypaisa/JazzCash)"},
    {"flag_name": "reviews",       "is_enabled": True,  "description": "Patient Reviews & Ratings"},
    {"flag_name": "media_uploads", "is_enabled": True,  "description": "Doctor Clinic Media Uploads"},
    {"flag_name": "blog",          "is_enabled": False, "description": "Blog / Articles Section"},
]


async def seed():
    print("🔧 Creating tables...")
    await create_tables()

    async with AsyncSessionLocal() as db:
        # ── Admin user ────────────────────────────────────────────────────────
        existing = await db.execute(
            select(User).where(User.email == "admin@cliniSmile.ai")
        )
        if existing.scalar_one_or_none():
            print("✅ Admin already exists.")
        else:
            admin = User(
                email="admin@cliniSmile.ai",
                password_hash=hash_password("Admin@123456"),
                role="admin",
                full_name="CliniSmile Admin",
                phone="+92-000-0000000",
                is_active=True,
                email_verified=True,
            )
            db.add(admin)
            await db.flush()
            print(f"✅ Admin created: admin@cliniSmile.ai / Admin@123456")

        # ── Feature flags ─────────────────────────────────────────────────────
        for flag_data in DEFAULT_FLAGS:
            existing_flag = await db.execute(
                select(FeatureFlag).where(FeatureFlag.flag_name == flag_data["flag_name"])
            )
            if not existing_flag.scalar_one_or_none():
                flag = FeatureFlag(**flag_data)
                db.add(flag)

        await db.commit()
        print("✅ Feature flags seeded.")
        print("\n🚀 Setup complete! You can now log in at /login")
        print("   Email:    admin@cliniSmile.ai")
        print("   Password: Admin@123456")
        print("\n⚠️  Change the admin password after first login!")


if __name__ == "__main__":
    asyncio.run(seed())
