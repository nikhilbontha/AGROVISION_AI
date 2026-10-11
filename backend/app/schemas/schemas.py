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
    # Step 1: Farm Profile
    district: Optional[str] = "Hyderabad"
    mandal: Optional[str] = ""
    village: Optional[str] = ""
    area: Optional[float] = Field(5.0, gt=0, description="Total farm area")
    area_unit: Optional[str] = "acres"  # acres, hectares, sq_meters
    cultivated_area: Optional[float] = Field(None, description="Cultivated area in selected unit")
    soil_type: str = "Loamy"
    soil_test_available: Optional[bool] = False
    soil_ph: Optional[float] = 6.5
    organic_carbon: Optional[float] = None
    electrical_conductivity: Optional[float] = None
    nitrogen_kgha: Optional[float] = None
    phosphorus_kgha: Optional[float] = None
    potassium_kgha: Optional[float] = None
    irrigation_source: Optional[str] = "borewell"
    irrigation_reliability: Optional[str] = "reliable"
    water_availability: Optional[str] = "sufficient"
    land_ownership: Optional[str] = "owned"
    land_rent_per_acre: Optional[float] = 0.0

    # Step 2: Crop Information
    crop_category: Optional[str] = "Cereals"
    crop_type: str = "Wheat"
    variety_name: Optional[str] = ""
    sowing_date: Optional[str] = ""
    crop_stage: Optional[str] = "Germination"
    expected_harvest_date: Optional[str] = ""
    seed_source: Optional[str] = ""
    sowing_method: Optional[str] = "Broadcasting"
    plant_spacing: Optional[str] = "Standard"
    previous_crop: Optional[str] = ""
    is_irrigated: Optional[bool] = True

    # Step 3: Crop Management
    seed_rate_per_acre: Optional[float] = None
    seed_cost_total: Optional[float] = None
    fertilizers_applied: Optional[List[Dict[str, Any]]] = None
    fertilizer_cost_total: Optional[float] = None
    manure_applied_tons: Optional[float] = None
    irrigation_frequency_days: Optional[int] = None
    weed_control_method: Optional[str] = "Manual"
    pesticide_cost_total: Optional[float] = None
    pest_symptoms: Optional[str] = ""
    crop_condition: Optional[str] = "good"
    stress_factors: Optional[List[str]] = None
    mechanization: Optional[str] = "rented"
    has_crop_insurance: Optional[bool] = False

    # Step 4: Weather & Environmental
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    rainfall: Optional[float] = None
    area_hectares: Optional[float] = None

    # Step 5: Financial Information
    itemized_costs: Optional[Dict[str, float]] = None
    total_custom_cost: Optional[float] = None
    expected_farmgate_price: Optional[float] = None
    byproduct_revenue: Optional[float] = 0.0

# Response schemas for new collections are dynamically handled as dicts in endpoints,
# but we can define some structures for history endpoints.
class DashboardStats(BaseModel):
    total_users: int
    total_predictions: int
    disease_predictions: int
    yield_predictions: int
