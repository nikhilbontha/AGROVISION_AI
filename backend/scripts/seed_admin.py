import asyncio
import os
import bcrypt
from datetime import datetime
from app.database import db, users_collection

def get_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

async def seed_admin():
    admin_email = "nikhilbontha00@gmail.com"
    hashed_password = get_hash("12345")

    admin_doc = {
        "name": "Nikhil Bontha",
        "email": admin_email,
        "password": hashed_password,
        "phone": "+91 98765 43210",
        "location": "Andhra Pradesh",
        "role": "admin",
        "status": "Active",
        "language": "en",
        "created_at": datetime.utcnow(),
        "last_login": datetime.utcnow()
    }

    # 1. Ensure admin exists in `users` collection
    res1 = await users_collection.update_one(
        {"email": admin_email},
        {"$set": admin_doc},
        upsert=True
    )
    print("Upserted admin in 'users' collection:", res1.upserted_id or "Updated existing document")

    # 2. Also create dedicated `admin` / `admin_users` collection in `agrovision` database
    admin_coll = db.get_collection("admin")
    res2 = await admin_coll.update_one(
        {"email": admin_email},
        {"$set": admin_doc},
        upsert=True
    )
    print("Upserted admin in dedicated 'admin' collection:", res2.upserted_id or "Updated existing document")

    # List all collections to verify
    collections = await db.list_collection_names()
    print("All collections in agrovision database:", collections)

if __name__ == "__main__":
    asyncio.run(seed_admin())
