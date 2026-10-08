from fastapi import APIRouter, HTTPException, Depends, status
from app.schemas.schemas import UserCreate, UserLogin, Token, UserResponse, LanguageUpdate, UserUpdate
from app.database import users_collection
from app.utils.security import get_password_hash, verify_password, async_get_password_hash, async_verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, decode_access_token
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId
import os

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    if token:
        try:
            payload = decode_access_token(token)
            if payload:
                return payload
        except Exception:
            pass
    return {"id": "guest_user", "sub": "guest@agrovision.ai", "name": "Guest Farmer"}

@router.post("/register", response_model=Token)
async def register(user: UserCreate):
    clean_email = user.email.strip().lower()
    # Check if user exists
    existing_user = await users_collection.find_one({"$or": [{"email": user.email}, {"email": clean_email}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password and prepare document
    hashed_password = await async_get_password_hash(user.password)
    user_dict = {
        "name": user.name.strip(),
        "email": clean_email,
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
        data={"sub": clean_email, "id": user_id}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user_id": user_id}

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    clean_email = user.email.strip().lower()
    
    # Special admin check for nikhilbontha00@gmail.com / 12345
    if clean_email == "nikhilbontha00@gmail.com" and user.password == "12345":
        db_user = await users_collection.find_one({"email": clean_email})
        if not db_user:
            hashed_pass = await async_get_password_hash("12345")
            admin_doc = {
                "name": "Nikhil Bontha",
                "email": "nikhilbontha00@gmail.com",
                "password": hashed_pass,
                "role": "admin",
                "phone": "+91 98765 43210",
                "location": "Andhra Pradesh",
                "language": "en",
                "created_at": datetime.utcnow(),
                "last_login": datetime.utcnow()
            }
            res = await users_collection.insert_one(admin_doc)
            user_id = str(res.inserted_id)
        else:
            user_id = str(db_user["_id"])
            await users_collection.update_one({"_id": db_user["_id"]}, {"$set": {"last_login": datetime.utcnow()}})
            
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": clean_email, "id": user_id, "role": "admin"}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer", "user_id": user_id}

    db_user = await users_collection.find_one({"$or": [{"email": user.email}, {"email": clean_email}]})
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    is_valid = await async_verify_password(user.password, db_user["password"])
    if not is_valid:
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
        "last_login": db_user.get("last_login"),
        "avatar": db_user.get("avatar"),
        "cameras": db_user.get("cameras")
    }

@router.put("/me", response_model=UserResponse)
async def update_profile(user_update: UserUpdate, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")
    update_data = {k: v for k, v in user_update.dict().items() if v is not None}
    if update_data:
        await users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
    return await get_me(current_user)

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
