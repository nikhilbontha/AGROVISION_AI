import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI") or os.getenv("MONGO_URL") or "mongodb+srv://nikhilbontha00_AgroVisionAI:Nani%40nikhil2005@agrovisionai.8lnljmn.mongodb.net/agrovision?appName=AgroVisionAI&tlsAllowInvalidCertificates=true"
client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=2000)
db = client.get_database()

# Collections
users_collection = db.get_collection("users")
disease_collection = db.get_collection("disease_predictions")
yield_collection = db.get_collection("yield_predictions")
recommendation_collection = db.get_collection("recommendations")
dashboard_collection = db.get_collection("dashboard_stats")
history_collection = db.get_collection("history")

async def test_connection():
    try:
        await client.admin.command('ping')
        print("Pinged your deployment. You successfully connected to MongoDB!")
    except Exception as e:
        print(f"MongoDB Connection Error: {e}")
