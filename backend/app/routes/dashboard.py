from fastapi import APIRouter, Depends
from bson import ObjectId
from datetime import datetime
from app.database import users_collection, disease_collection, yield_collection, recommendation_collection
from app.routes.auth import get_current_user

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    # We can keep total platform users just for display if needed, but scans should be personal
    total_users = await users_collection.count_documents({})
    
    total_disease = await disease_collection.count_documents({"user_id": user_id})
    total_yield = await yield_collection.count_documents({"user_id": user_id})
    total_scans = total_disease + total_yield
    
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$predicted_disease", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 1}
    ]
    most_common = "None"
    async for doc in disease_collection.aggregate(pipeline):
        most_common = doc["_id"]
        
    latest_rec = "No recent recommendations"
    cursor = recommendation_collection.find({"user_id": user_id}).sort("created_at", -1).limit(1)
    async for doc in cursor:
        latest_rec = doc.get("crop_care", "Maintain regular care")

    # Real avg confidence and healthy percent for the user
    pipeline_conf = [
        {"$match": {"user_id": user_id}},
        {"$group": {
            "_id": None,
            "avgConfidence": {"$avg": "$confidence"},
            "totalCount": {"$sum": 1},
            "healthyCount": {
                "$sum": {
                    "$cond": [{"$regexMatch": {"input": {"$toLower": "$predicted_disease"}, "regex": "healthy"}}, 1, 0]
                }
            }
        }}
    ]
    avgConfidence = 0
    healthyPercent = 0
    async for doc in disease_collection.aggregate(pipeline_conf):
        avgConfidence = round(doc.get("avgConfidence", 0) or 0, 1)
        totalCount = doc.get("totalCount", 1)
        if totalCount > 0:
            healthyPercent = round((doc.get("healthyCount", 0) / totalCount) * 100, 1)

    # Calculate profit this month and high risk crops for user
    current_month = datetime.utcnow().month
    current_year = datetime.utcnow().year
    
    profitThisMonth = 0
    highRiskCrops = 0
    
    async for doc in yield_collection.find({"user_id": user_id}):
        created_at = doc.get("created_at")
        doc_month = -1
        doc_year = -1
        if isinstance(created_at, str):
            try:
                dt = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                doc_month = dt.month
                doc_year = dt.year
            except:
                pass
        elif isinstance(created_at, datetime):
            doc_month = created_at.month
            doc_year = created_at.year
            
        if doc_month == current_month and doc_year == current_year:
            profitThisMonth += doc.get("expected_profit", 0)
            
        if doc.get("loss_risk") == "High":
            highRiskCrops += 1

    return {
        "totalFarmers": total_users, # Keeping global for UX aesthetic if desired, otherwise could be 1
        "totalScans": total_scans,
        "diseasePredictions": total_disease,
        "yieldPredictions": total_yield,
        "mostCommonDisease": most_common,
        "latestRecommendation": latest_rec,
        "healthyPercent": healthyPercent,
        "avgConfidence": avgConfidence,
        "profitThisMonth": round(profitThisMonth, 2),
        "highRiskCrops": highRiskCrops
    }

@router.get("/recent-disease")
async def get_recent_disease(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    cursor = disease_collection.find({"user_id": user_id}).sort("created_at", -1).limit(5)
    recent = []
    
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    farmer_name = user["name"] if user else "Unknown"

    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        disease_name = doc.get("predicted_disease", "Unknown")
        confidence = doc.get("confidence", 0)

        recent.append({
            "id": doc["_id"],
            "farmer": farmer_name,
            "cropName": doc.get("crop_type", "Unknown"),
            "disease": disease_name,
            "confidence": f"{confidence}%" if isinstance(confidence, (int, float)) else confidence,
            "date": doc.get("created_at")
        })
    return recent

@router.get("/recent-yield")
async def get_recent_yield(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    cursor = yield_collection.find({"user_id": user_id}).sort("created_at", -1).limit(5)
    recent = []
    
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    farmer_name = user["name"] if user else "Unknown"
    
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        area = doc.get("area", "Unknown")
        predicted_yield = doc.get("predicted_yield", "Unknown")

        recent.append({
            "id": doc["_id"],
            "farmer": farmer_name,
            "cropName": doc.get("crop_type", "Unknown"),
            "predictedYield": str(predicted_yield),
            "date": doc.get("created_at"),
            "area": str(area)
        })
    return recent

@router.get("/analytics")
async def get_analytics(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    # diseaseDistribution
    dist_pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$predicted_disease", "value": {"$sum": 1}}},
        {"$sort": {"value": -1}},
        {"$limit": 5}
    ]
    diseaseDistribution = []
    mostCommonDisease = "None"
    async for doc in disease_collection.aggregate(dist_pipeline):
        name = doc["_id"] if doc["_id"] else "Unknown"
        if not diseaseDistribution:
            mostCommonDisease = name
        diseaseDistribution.append({"name": name, "value": doc["value"]})

    # cropHealth
    health_pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {
            "_id": "$crop_type",
            "total": {"$sum": 1},
            "healthy": {
                "$sum": {
                    "$cond": [{"$regexMatch": {"input": {"$toLower": "$predicted_disease"}, "regex": "healthy"}}, 1, 0]
                }
            }
        }},
        {"$limit": 5}
    ]
    cropHealth = []
    async for doc in disease_collection.aggregate(health_pipeline):
        crop = doc["_id"] if doc["_id"] else "Unknown"
        health_pct = round((doc["healthy"] / doc["total"]) * 100) if doc["total"] > 0 else 0
        cropHealth.append({"name": crop, "health": health_pct})

    # topPerformingCrop (most analyzed yield crop)
    yield_pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$crop_type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 1}
    ]
    topPerformingCrop = "None"
    async for doc in yield_collection.aggregate(yield_pipeline):
        topPerformingCrop = doc["_id"] if doc["_id"] else "None"

    # avgYield manual calculation
    total_yield = 0
    count_yield = 0
    async for doc in yield_collection.find({"user_id": user_id}):
        try:
            val = float(str(doc.get("predicted_yield", 0)).split()[0])
            total_yield += val
            count_yield += 1
        except:
            pass
    avgYield = f"{round(total_yield/count_yield, 2)} tons" if count_yield > 0 else "0 tons"

    return {
        "mostCommonDisease": mostCommonDisease,
        "topPerformingCrop": topPerformingCrop,
        "avgYield": avgYield,
        "diseaseDistribution": diseaseDistribution,
        "cropHealth": cropHealth
    }

@router.get("/profit-analysis")
async def get_profit_analysis(year: str = None, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    if not year:
        year = str(datetime.now().year)
        
    price_map = {
        "wheat": 15000,
        "rice": 18000,
        "corn": 12000,
        "tomato": 20000
    }
    
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    monthly_data = {m: {"month": m, "Wheat": 0, "Rice": 0, "Corn": 0, "Tomato": 0} for m in months}
    
    async for doc in yield_collection.find({"user_id": user_id}):
        created_at = doc.get("created_at")
        if not created_at:
            continue
            
        doc_year = ""
        doc_month_idx = 0
        if isinstance(created_at, str):
            try:
                dt = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                doc_year = str(dt.year)
                doc_month_idx = dt.month - 1
            except ValueError:
                # If it's a different string format, just skip
                continue
        elif isinstance(created_at, datetime):
            doc_year = str(created_at.year)
            doc_month_idx = created_at.month - 1
            
        if doc_year == year:
            crop_type = doc.get("crop_type", "").lower()
            crop_key = crop_type.capitalize()
            if crop_key not in ["Wheat", "Rice", "Corn", "Tomato"]:
                continue
                
            area = doc.get("area", 0)
            try:
                area = float(area)
            except:
                area = 0.0
                
            predicted_yield = doc.get("predicted_yield", 0)
            try:
                val = float(str(predicted_yield).split()[0])
            except:
                val = 0.0
                
            profit = val * area * price_map.get(crop_type, 10000)
            month_name = months[doc_month_idx]
            monthly_data[month_name][crop_key] += round(profit, 2)
            
    return list(monthly_data.values())
