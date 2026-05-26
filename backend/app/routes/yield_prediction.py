from fastapi import APIRouter
from pydantic import BaseModel
import random

router = APIRouter()

class YieldInput(BaseModel):
    temperature: float
    humidity: float
    rainfall: float
    area: float

@router.post("/predict-yield")
def predict_yield(data: YieldInput):
    prediction = round(random.uniform(3.5, 8.5), 2)
    return {"predicted_yield": prediction}