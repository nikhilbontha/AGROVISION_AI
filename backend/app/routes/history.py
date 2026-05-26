from fastapi import APIRouter, Depends, HTTPException
from app.database import disease_collection, yield_collection, recommendation_collection
from app.routes.auth import get_current_user

router = APIRouter()

@router.get("/disease/{user_id}")
async def get_disease_history(user_id: str, current_user: dict = Depends(get_current_user)):
    cursor = disease_collection.find({"user_id": user_id}).sort("created_at", -1).limit(50)
    history_list = []
    async for document in cursor:
        document["_id"] = str(document["_id"])
        history_list.append(document)
    
    return history_list

@router.get("/yield/{user_id}")
async def get_yield_history(user_id: str, current_user: dict = Depends(get_current_user)):
    cursor = yield_collection.find({"user_id": user_id}).sort("created_at", -1).limit(50)
    history_list = []
    async for document in cursor:
        document["_id"] = str(document["_id"])
        history_list.append(document)
    
    return history_list

@router.get("/recommendations/{user_id}")
async def get_recommendation_history(user_id: str, current_user: dict = Depends(get_current_user)):
    cursor = recommendation_collection.find({"user_id": user_id}).sort("created_at", -1).limit(50)
    history_list = []
    async for document in cursor:
        document["_id"] = str(document["_id"])
        history_list.append(document)
    
    return history_list
