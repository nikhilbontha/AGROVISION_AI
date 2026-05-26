from fastapi import APIRouter, UploadFile, File
import random

router = APIRouter()

@router.post("/predict-disease")
async def predict_disease(file: UploadFile = File(...)):
    diseases = ["Healthy", "Early Blight", "Late Blight", "Leaf Spot"]
    return {
        "disease": random.choice(diseases),
        "confidence": round(random.uniform(85, 99), 2)
    }