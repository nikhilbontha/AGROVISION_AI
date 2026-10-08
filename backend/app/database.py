import os
import asyncio
from datetime import datetime
import bcrypt
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Fix dnspython blocking on Windows when default 8.8.8.8 DNS times out
try:
    import dns.resolver
    resolver = dns.resolver.Resolver(configure=True)
    resolver.nameservers = ['1.1.1.1', '1.0.0.1', '8.8.4.4']
    resolver.timeout = 1.5
    resolver.lifetime = 3.0
    dns.resolver.default_resolver = resolver
except Exception:
    pass

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI") or os.getenv("MONGO_URL") or "mongodb://nikhilbontha00_AgroVisionAI:Nani%40nikhil2005@ac-tsdlgxt-shard-00-01.8lnljmn.mongodb.net:27017,ac-tsdlgxt-shard-00-00.8lnljmn.mongodb.net:27017,ac-tsdlgxt-shard-00-02.8lnljmn.mongodb.net:27017/agrovision?replicaSet=atlas-1148m5-shard-0&ssl=true&authSource=admin&appName=AgroVisionAI&tlsAllowInvalidCertificates=true"

client = AsyncIOMotorClient(
    MONGO_URI,
    serverSelectionTimeoutMS=20000,
    connectTimeoutMS=20000,
    maxPoolSize=50,
    minPoolSize=5,
    maxIdleTimeMS=60000
)
db = client.get_database()

# Collections
users_collection = db.get_collection("users")
disease_collection = db.get_collection("disease_predictions")
yield_collection = db.get_collection("yield_predictions")
recommendation_collection = db.get_collection("recommendations")
dashboard_collection = db.get_collection("dashboard_stats")
history_collection = db.get_collection("history")

crops_collection = db.get_collection("crops")
diseases_collection = db.get_collection("diseases")
feedback_collection = db.get_collection("feedback")
model_history_collection = db.get_collection("model_history")

admin_collection = db.get_collection("admin")

def get_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

async def seed_initial_db_data():
    try:
        # 1. Upsert Administrator nikhilbontha00@gmail.com / 12345 in MongoDB users and admin collection
        admin_email = "nikhilbontha00@gmail.com"
        hashed = await asyncio.to_thread(get_hash, "12345")
        admin_user = {
            "name": "Nikhil Bontha",
            "email": admin_email,
            "password": hashed,
            "phone": "+91 98765 43210",
            "location": "Andhra Pradesh",
            "role": "admin",
            "status": "Active",
            "language": "en",
            "created_at": datetime.utcnow(),
            "last_login": datetime.utcnow()
        }

        # Upsert in `users` collection
        await users_collection.update_one(
            {"email": admin_email},
            {"$set": admin_user},
            upsert=True
        )

        # Upsert in dedicated `admin` collection
        await admin_collection.update_one(
            {"email": admin_email},
            {"$set": admin_user},
            upsert=True
        )
        print(f"Admin user '{admin_email}' successfully seeded into MongoDB 'users' and 'admin' collections.")

        # 2. Seed Crops Collection if empty
        if await crops_collection.count_documents({}) == 0:
            initial_crops = [
                { "name": "Tomato", "scientific_name": "Solanum lycopersicum", "category": "Vegetables", "diseases_count": 9, "detections_count": 420, "status": "Active", "icon": "🍅", "created_at": datetime.utcnow() },
                { "name": "Corn (Maize)", "scientific_name": "Zea mays", "category": "Grains", "diseases_count": 4, "detections_count": 310, "status": "Active", "icon": "🌽", "created_at": datetime.utcnow() },
                { "name": "Potato", "scientific_name": "Solanum tuberosum", "category": "Tubers", "diseases_count": 3, "detections_count": 185, "status": "Active", "icon": "🥔", "created_at": datetime.utcnow() },
                { "name": "Grape", "scientific_name": "Vitis vinifera", "category": "Fruits", "diseases_count": 4, "detections_count": 140, "status": "Active", "icon": "🍇", "created_at": datetime.utcnow() },
                { "name": "Apple", "scientific_name": "Malus domestica", "category": "Fruits", "diseases_count": 4, "detections_count": 95, "status": "Active", "icon": "🍎", "created_at": datetime.utcnow() },
                { "name": "Rice (Paddy)", "scientific_name": "Oryza sativa", "category": "Grains", "diseases_count": 5, "detections_count": 260, "status": "Active", "icon": "🌾", "created_at": datetime.utcnow() },
                { "name": "Cotton", "scientific_name": "Gossypium hirsutum", "category": "Cash Crop", "diseases_count": 3, "detections_count": 110, "status": "Active", "icon": "☁️", "created_at": datetime.utcnow() }
            ]
            await crops_collection.insert_many(initial_crops)
            print("Crops collection seeded in MongoDB.")

        # 3. Seed Diseases Collection if empty
        if await diseases_collection.count_documents({}) == 0:
            initial_diseases = [
                { "name": "Tomato Early Blight", "crop": "Tomato", "severity": "High", "symptoms": "Concentric dark rings on lower leaves, yellow halo", "description": "Fungal infection caused by Alternaria solani causing foliar lesions and fruit drop.", "prevention": "Crop rotation, mulching, avoid overhead watering", "treatment": "Copper-based fungicides or Mancozeb sprays", "detections": 145, "status": "Active", "created_at": datetime.utcnow() },
                { "name": "Tomato Late Blight", "crop": "Tomato", "severity": "High", "symptoms": "Water-soaked lesions on leaves and stem, white fungal mold", "description": "Destructive oomycete Phytophthora infestans rapid foliage decay.", "prevention": "Use resistant varieties, adequate spacing", "treatment": "Systemic fungicides (Metalaxyl, Chlorothalonil)", "detections": 120, "status": "Active", "created_at": datetime.utcnow() },
                { "name": "Corn Northern Leaf Blight", "crop": "Corn (Maize)", "severity": "Medium", "symptoms": "Long grayish-green cigar-shaped lesions on leaves", "description": "Fungal leaf disease caused by Exserohilum turcicum causing photosynthetic drop.", "prevention": "Tillage practices, resistant hybrids", "treatment": "Apply foliar fungicide at first sign before silking", "detections": 98, "status": "Active", "created_at": datetime.utcnow() },
                { "name": "Potato Early Blight", "crop": "Potato", "severity": "Medium", "symptoms": "Small brown spots expanding into target-like brown patterns", "description": "Alternaria solani attacking potato leaves during warm moist conditions.", "prevention": "Maintain optimal soil nitrogen, removal of debris", "treatment": "Fungicide spray every 7-10 days in high humidity", "detections": 84, "status": "Active", "created_at": datetime.utcnow() },
                { "name": "Grape Black Rot", "crop": "Grape", "severity": "High", "symptoms": "Reddish-brown leaf spots, shriveled black mummified berries", "description": "Guignardia bidwellii affecting fruit yields severely in vineyards.", "prevention": "Prune canopy for sunlight, clean fallen debris", "treatment": "Myclobutanil or Azoxystrobin applications", "detections": 62, "status": "Active", "created_at": datetime.utcnow() }
            ]
            await diseases_collection.insert_many(initial_diseases)
            print("Diseases collection seeded in MongoDB.")

        # 4. Seed Model History Collection if empty
        if await model_history_collection.count_documents({}) == 0:
            initial_history = [
                { "version": "v2.4.0 (Current)", "accuracy": 96.4, "precision": 95.8, "recall": 96.1, "f1_score": 95.9, "dataset_size": "54,300 Images", "training_date": "2024-04-20", "status": "Deployed", "created_at": datetime.utcnow() },
                { "version": "v2.3.1", "accuracy": 94.8, "precision": 93.9, "recall": 94.2, "f1_score": 94.0, "dataset_size": "42,100 Images", "training_date": "2024-02-15", "status": "Archived", "created_at": datetime.utcnow() },
                { "version": "v2.2.0", "accuracy": 92.1, "precision": 91.5, "recall": 91.8, "f1_score": 91.6, "dataset_size": "31,500 Images", "training_date": "2023-11-10", "status": "Archived", "created_at": datetime.utcnow() }
            ]
            await model_history_collection.insert_many(initial_history)
            print("Model history seeded in MongoDB.")

        # 5. Seed Feedback Collection if empty
        if await feedback_collection.count_documents({}) == 0:
            initial_feedback = [
                { "user_name": "Rajesh Kumar", "email": "rajesh.k@agri.in", "feedback_type": "Model Accuracy", "message": "The Tomato Early Blight detection was spot on! Saved half of my tomato plot using suggested treatment.", "rating": 5, "date": "2024-05-17", "status": "Resolved", "created_at": datetime.utcnow() },
                { "user_name": "Anitha Devi", "email": "anitha.d@krishi.co", "feedback_type": "UI Suggestion", "message": "Telugu translation for yield prediction terms is very helpful. Voice guidance requested.", "rating": 5, "date": "2024-05-16", "status": "Pending", "created_at": datetime.utcnow() },
                { "user_name": "Ramesh Reddy", "email": "ramesh.reddy@field.in", "feedback_type": "Bug Report", "message": "Slow image processing on 3G network.", "rating": 3, "date": "2024-05-14", "status": "Pending", "created_at": datetime.utcnow() }
            ]
            await feedback_collection.insert_many(initial_feedback)
            print("Feedback collection seeded in MongoDB.")

    except Exception as e:
        print(f"Error seeding database: {e}")

async def init_db():
    try:
        await client.admin.command('ping')
        print("Connected to MongoDB Atlas!")
        # Ensure critical indexes exist for fast queries
        await users_collection.create_index([('email', 1)], unique=True)
        await disease_collection.create_index([('user_id', 1), ('created_at', -1)])
        await yield_collection.create_index([('user_id', 1), ('created_at', -1)])
        await recommendation_collection.create_index([('user_id', 1), ('created_at', -1)])
        await history_collection.create_index([('user_id', 1), ('created_at', -1)])

        # Run database seeder
        await seed_initial_db_data()
    except Exception as e:
        print(f"MongoDB Connection Warning: {e}")

async def test_connection():
    await init_db()
