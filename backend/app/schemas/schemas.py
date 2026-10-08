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
    avatar: Optional[str] = None
    cameras: Optional[List[Dict[str, Any]]] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    cameras: Optional[List[Dict[str, Any]]] = None

class LanguageUpdate(BaseModel):
    language: str

from pydantic import BaseModel, EmailStr, Field

class YieldRequest(BaseModel):
    area: Optional[float] = Field(5.0, gt=0, description="Plot area in acres must be greater than zero")
    soil_type: str = "Loamy"
    crop_type: str = "Wheat"
    district: Optional[str] = "Hyderabad"
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    rainfall: Optional[float] = None
    soil_ph: Optional[float] = 6.5
    area_hectares: Optional[float] = None

# Response schemas for new collections are dynamically handled as dicts in endpoints,
# but we can define some structures for history endpoints.
class DashboardStats(BaseModel):
    total_users: int
    total_predictions: int
    disease_predictions: int
    yield_predictions: int
