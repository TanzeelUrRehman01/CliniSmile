# 🦷 CliniSmile AI — Full Project Setup Guide

A comprehensive dental clinic management and patient care solution. Streamline appointments, patient records, and clinical workflows. Designed to enhance operational efficiency and improve patient experience in dental practices.

## Project Structure
```
CliniSmile/
├── backend/        ← FastAPI (Python)
├── frontend/       ← React + Tailwind CSS
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ (or free Supabase account)
- Tesseract OCR installed

### Install Tesseract
- **Windows:** https://github.com/UB-Mannheim/tesseract/wiki
- **Ubuntu/WSL:** `sudo apt install tesseract-ocr`
- **Mac:** `brew install tesseract`

---

## Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env         # Windows
# cp .env.example .env         # Mac/Linux
# → Edit .env with your credentials

# Run database migrations
alembic upgrade head

# Start development server
uvicorn main:app --reload --port 8000
```

**API Docs:** http://localhost:8000/api/v1/docs

---

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
echo VITE_API_URL=http://localhost:8000/api/v1 > .env.local

# Start development server
npm run dev
```

**Frontend:** http://localhost:5173

---

## Environment Variables (backend/.env)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | Random secret for JWT signing |
| `CLOUDINARY_CLOUD_NAME` | From cloudinary.com dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `MAIL_USERNAME` | Gmail address |
| `MAIL_PASSWORD` | Gmail App Password (not your Gmail password) |
| `COMMISSION_RATE` | Platform commission % (default: 25) |

---

## Creating Admin Account

After starting the backend, run:

```python
# In Python shell or script
import asyncio
from core.database import AsyncSessionLocal
from models.user import User
from core.security import hash_password

async def create_admin():
    async with AsyncSessionLocal() as db:
        admin = User(
            email="admin@cliniSmile.ai",
            password_hash=hash_password("Admin@123"),
            role="admin",
            full_name="CliniSmile Admin",
        )
        db.add(admin)
        await db.commit()

asyncio.run(create_admin())
```

---

## Deployment

| Service | Platform | Command |
|---|---|---|
| Frontend | Vercel | `vercel --prod` |
| Backend | Render | Connect GitHub repo |
| Database | Supabase | Free managed PostgreSQL |
| Media | Cloudinary | Free CDN storage |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Tailwind CSS + Vite |
| Backend | FastAPI (Python 3.11) |
| Database | PostgreSQL (Supabase) |
| Auth | JWT + bcrypt |
| OCR | Tesseract 5 + pytesseract |
| Storage | Cloudinary |
| Email | Gmail SMTP |
| Maps | Leaflet.js + OpenStreetMap |

---

## AI Features Built

1. **OCR Certificate Verification** — `backend/services/ocr_verification.py`
2. **NLP Dental Chatbot** — `backend/services/chatbot.py`  
3. **Smart Recommendation Engine** — `backend/services/recommendation.py`

---

*Built with ❤️ · Powered by CliniSmile AI*
