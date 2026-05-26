from fastapi import APIRouter, HTTPException
from app.schemas.assistant import ChatRequest, ChatResponse
from app.services.assistant_service import AssistantService
import logging

logger = logging.getLogger(__name__)
router = APIRouter()
assistant_service = AssistantService()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        if not request.message or not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
            
        logger.info(f"Received chat message: {request.message} (lang: {request.language}, context: {request.page_context})")
        response_data = await assistant_service.process_message(request.message, request.language, request.page_context)
        
        return ChatResponse(
            reply=response_data["reply"],
            intent=response_data["intent"],
            card=response_data.get("card"),
            audio_data=response_data.get("audio_data")
        )
    except Exception as e:
        logger.error(f"Error processing chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
