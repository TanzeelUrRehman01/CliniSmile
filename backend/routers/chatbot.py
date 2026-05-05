from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from core.database import get_db
from core.security import get_current_user
from models.user import User, ChatSession, ChatMessage
from services.chatbot import process_message

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


class MessageRequest(BaseModel):
    message: str
    session_id: str = ""


@router.post("/message")
async def chat(
    data: MessageRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Process through chatbot engine
    result = process_message(data.message)

    # Save to DB for audit
    if data.session_id:
        user_msg = ChatMessage(
            session_id=data.session_id,
            role="user",
            content=data.message,
        )
        ai_msg = ChatMessage(
            session_id=data.session_id,
            role="assistant",
            content=result.response,
        )
        db.add(user_msg)
        db.add(ai_msg)

    return {
        "success": True,
        "data": {
            "response": result.response,
            "intent": result.intent,
            "severity": result.severity,
            "suggest_booking": result.suggest_booking,
        },
    }


@router.post("/session")
async def start_session(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    session = ChatSession(user_id=current_user.id)
    db.add(session)
    await db.flush()
    return {"success": True, "session_id": session.id}
