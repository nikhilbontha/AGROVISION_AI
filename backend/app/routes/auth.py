from fastapi import APIRouter, HTTPException, Depends, status
from app.schemas.schemas import UserCreate, UserLogin, Token, UserResponse, LanguageUpdate
from app.database import users_collection
from app.utils.security import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, decode_access_token
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId
import os

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = decode_access_token(token)
        if payload:
            return payload
    except:
        pass
    raise HTTPException(status_code=401, detail="Invalid authentication credentials")

@router.post("/register", response_model=Token)
async def register(user: UserCreate):
    # Check if user exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password and prepare document
    hashed_password = get_password_hash(user.password)
    user_dict = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password,
        "phone": user.phone,
        "location": user.location,
        "language": user.language or "en",
        "created_at": datetime.utcnow(),
        "last_login": datetime.utcnow()
    }
    
    result = await users_collection.insert_one(user_dict)
    user_id = str(result.inserted_id)
    
    # Create token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "id": user_id}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user_id": user_id}

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    db_user = await users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login
    await users_collection.update_one(
        {"_id": db_user["_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    user_id = str(db_user["_id"])
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user["email"], "id": user_id}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user_id": user_id}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")
    db_user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {
        "id": str(db_user["_id"]),
        "name": db_user["name"],
        "email": db_user["email"],
        "phone": db_user.get("phone"),
        "location": db_user.get("location"),
        "language": db_user.get("language", "en"),
        "created_at": db_user.get("created_at"),
        "last_login": db_user.get("last_login")
    }

@router.put("/language")
async def update_language(lang_update: LanguageUpdate, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"language": lang_update.language}}
    )
    return {"status": "success", "language": lang_update.language}

@router.get("/users")
async def get_all_users():
    users = []
    cursor = users_collection.find({})
    async for doc in cursor:
        users.append({
            "id": str(doc["_id"]),
            "name": doc["name"],
            "email": doc["email"],
            "created_at": doc.get("created_at")
        })
    return users
