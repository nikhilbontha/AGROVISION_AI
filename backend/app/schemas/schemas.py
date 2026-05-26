from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    location: Optional[str] = None
    language: Optional[str] = "en"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    location: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None
    language: Optional[str] = "en"

class LanguageUpdate(BaseModel):
    language: str

class YieldRequest(BaseModel):
    area: float
    soil_type: str
    crop_type: str
    district: Optional[str] = "Hyderabad"
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    rainfall: Optional[float] = None

# Response schemas for new collections are dynamically handled as dicts in endpoints,
# but we can define some structures for history endpoints.
class DashboardStats(BaseModel):
    total_users: int
    total_predictions: int
    disease_predictions: int
    yield_predictions: int
