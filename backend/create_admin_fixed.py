"""
Create Admin Account - Fixed Version
=====================================
This script properly creates the admin account using the corrected database configuration.

Usage:
    cd backend
    python -c "import asyncio; from create_admin_fixed import main; asyncio.run(main())"
    
Or simply:
    python create_admin_fixed.py
"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from core.database import AsyncSessionLocal, create_tables
from core.security import hash_password
from models.user import User, FeatureFlag
from sqlalchemy import select


DEFAULT_FLAGS = [
    {"flag_name": "chatbot",       "is_enabled": True,  "description": "AI Dental Consultation Chatbot"},
    {"flag_name": "payments",      "is_enabled": True,  "description": "Payment System (Easypaisa/JazzCash)"},
    {"flag_name": "reviews",       "is_enabled": True,  "description": "Patient Reviews & Ratings"},
    {"flag_name": "media_uploads", "is_enabled": True,  "description": "Doctor Clinic Media Uploads"},
    {"flag_name": "blog",          "is_enabled": False, "description": "Blog / Articles Section"},
]


async def main():
    try:
        print("🔧 Creating tables...")
        await create_tables()
        print("✅ Tables created/verified")

        async with AsyncSessionLocal() as db:
            # ── Admin user ────────────────────────────────────────────────────────
            print("\n👤 Checking for existing admin...")
            existing = await db.execute(
                select(User).where(User.email == "admin@cliniSmile.ai")
            )
            admin_user = existing.scalar_one_or_none()
            
            if admin_user:
                print("✅ Admin already exists!")
                print(f"   Email:    admin@cliniSmile.ai")
                print(f"   Password: Admin@123456")
                print(f"   Status:   Active: {admin_user.is_active}")
            else:
                print("Creating new admin account...")
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
                print("✅ Admin created successfully!")
                print(f"   Email:    admin@cliniSmile.ai")
                print(f"   Password: Admin@123456")

            # ── Feature flags ─────────────────────────────────────────────────────
            print("\n🚩 Setting up feature flags...")
            for flag_data in DEFAULT_FLAGS:
                existing_flag = await db.execute(
                    select(FeatureFlag).where(FeatureFlag.flag_name == flag_data["flag_name"])
                )
                if not existing_flag.scalar_one_or_none():
                    flag = FeatureFlag(**flag_data)
                    db.add(flag)
                    print(f"   ✓ {flag_data['flag_name']}")

            await db.commit()
            print("\n✅ Feature flags configured")
            
            print("\n" + "="*60)
            print("🚀 SETUP COMPLETE!")
            print("="*60)
            print("\n📋 Admin Login Credentials:")
            print("   Email:    admin@cliniSmile.ai")
            print("   Password: Admin@123456")
            print("\n🌐 Access at:    http://localhost:5173/login")
            print("📚 API Docs at:  http://localhost:8000/api/v1/docs")
            print("\n⚠️  IMPORTANT: Change the admin password after first login!")
            print("="*60 + "\n")

    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Make sure PostgreSQL is running")
        print("2. Check DATABASE_URL in .env file")
        print("3. Verify the database exists and is accessible")
        raise


if __name__ == "__main__":
    asyncio.run(main())
