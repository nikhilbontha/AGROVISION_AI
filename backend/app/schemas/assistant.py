from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    message: str
    language: str = "te"
    page_context: str = ""

class ChatResponse(BaseModel):
    reply: str
    intent: Optional[str] = None
    audio_data: Optional[str] = None
    card: Optional[dict] = None
