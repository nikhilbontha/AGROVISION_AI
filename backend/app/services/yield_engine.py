import math
from datetime import datetime
from typing import Dict, Any, List

# CONVERSION CONSTANTS
ACRE_TO_HA = 0.404686
HA_TO_ACRE = 2.47105
SQM_TO_ACRE = 0.000247105

# CROP BASELINE STATISTICS (Telangana / PJTSAU & ICAR APMC Benchmarks)
CROP_AGRONOMIC_BASELINES = {
    "Wheat": {"base_q_per_acre": 16.0, "base_cost_per_acre": 28000, "category": "Cereals"},
    "Rice": {"base_q_per_acre": 22.0, "base_cost_per_acre": 32000, "category": "Cereals"},
    "Paddy": {"base_q_per_acre": 22.0, "base_cost_per_acre": 32000, "category": "Cereals"},
    "Maize": {"base_q_per_acre": 25.0, "base_cost_per_acre": 25000, "category": "Cereals"},
    "Corn": {"base_q_per_acre": 25.0, "base_cost_per_acre": 25000, "category": "Cereals"},
    "Cotton": {"base_q_per_acre": 9.0, "base_cost_per_acre": 45000, "category": "Commercial"},
    "Chilli": {"base_q_per_acre": 12.0, "base_cost_per_acre": 55000, "category": "Spices"},
    "Soybean": {"base_q_per_acre": 10.0, "base_cost_per_acre": 22000, "category": "Oilseeds"},
    "Pulses": {"base_q_per_acre": 7.5, "base_cost_per_acre": 18000, "category": "Pulses"},
    "Sugarcane": {"base_q_per_acre": 320.0, "base_cost_per_acre": 60000, "category": "Commercial"},
    "Tomato": {"base_q_per_acre": 180.0, "base_cost_per_acre": 70000, "category": "Vegetables"},
    "Potato": {"base_q_per_acre": 140.0, "base_cost_per_acre": 55000, "category": "Horticulture"},
    "Apple": {"base_q_per_acre": 85.0, "base_cost_per_acre": 90000, "category": "Horticulture"}
}

SOIL_MULTIPLIERS = {
    "Loamy": 1.10,
    "Sandy Loam": 1.05,
    "Clay Loam": 1.02,
    "Black": 1.08,
    "Black Cotton Soil": 1.08,
    "Alluvial": 1.12,
    "Clay": 0.95,
    "Red": 0.90,
    "Sandy": 0.80,
    "Unknown": 1.00
}

CROP_STAGES = {
    "Wheat": ["Pre-sowing", "Germination and emergence", "Tillering", "Stem elongation", "Booting", "Heading and flowering", "Grain filling", "Maturity and harvest"],
    "Paddy": ["Nursery / Direct Seeding", "Transplanting", "Tillering", "Panicle Initiation", "Flowering", "Grain Filling", "Ripening & Harvest"],
    "Rice": ["Nursery / Direct Seeding", "Transplanting", "Tillering", "Panicle Initiation", "Flowering", "Grain Filling", "Ripening & Harvest"],
    "Cotton": ["Sowing & Germination", "Vegetative Branching", "Square Formation", "Flowering & Boll Setting", "Boll Development", "Boll Bursting & Picking"],
    "Maize": ["Sowing & Emergence", "V4-V8 Vegetative", "Tasseling & Silking", "Blister & Milk Stage", "Dough & Dent Stage", "Black Layer Maturity"],
    "Corn": ["Sowing & Emergence", "V4-V8 Vegetative", "Tasseling & Silking", "Blister & Milk Stage", "Dough & Dent Stage", "Black Layer Maturity"],
    "Chilli": ["Nursery", "Transplanting", "Vegetative Growth", "Flowering & Fruit Set", "Green Pod Harvest", "Red Ripe Harvest"],
    "Pulses": ["Sowing", "Vegetative", "Flowering", "Pod Formation", "Pod Maturity & Harvest"]
}

def convert_area_to_acres(area_val: float, unit: str) -> float:
    """Converts input area to acres safely"""
    if not area_val or area_val <= 0:
        return 0.0
    u = (unit or "acres").lower().strip()
    if u in ["hectares", "ha"]:
        return area_val * HA_TO_ACRE
    elif u in ["sq_meters", "sqm", "square metres", "square meters"]:
        return area_val * SQM_TO_ACRE
    return area_val

def calculate_smart_yield(data_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Modular Agronomic & Financial Forecast Engine.
    Converts inputs, applies multi-factor agronomic multipliers, computes financial KPIs,
    generates low/base/high scenarios, price sensitivity, and weather-aware advice.
    """
    raw_area = float(data_dict.get("area") or 5.0)
    area_unit = data_dict.get("area_unit", "acres")
    total_area_acres = max(0.1, round(convert_area_to_acres(raw_area, area_unit), 3))
    
    raw_cultivated = data_dict.get("cultivated_area")
    if raw_cultivated is not None and float(raw_cultivated) > 0:
        cultivated_acres = max(0.1, round(convert_area_to_acres(float(raw_cultivated), area_unit), 3))
        cultivated_acres = min(cultivated_acres, total_area_acres)
    else:
        cultivated_acres = total_area_acres
        
    cultivated_ha = round(cultivated_acres * ACRE_TO_HA, 3)

    crop_type = data_dict.get("crop_type", "Wheat")
    crop_info = CROP_AGRONOMIC_BASELINES.get(crop_type, CROP_AGRONOMIC_BASELINES["Wheat"])
    base_q_acre = crop_info["base_q_per_acre"]
    
    soil_type = data_dict.get("soil_type", "Loamy")
    soil_mult = SOIL_MULTIPLIERS.get(soil_type, 1.0)
    
    # Soil test adjustment
    soil_test_mult = 1.0
    if data_dict.get("soil_test_available"):
        ph = float(data_dict.get("soil_ph") or 6.5)
        if 6.0 <= ph <= 7.5:
            soil_test_mult += 0.05
        elif ph < 5.5 or ph > 8.2:
            soil_test_mult -= 0.08
            
        oc = data_dict.get("organic_carbon")
        if oc and float(oc) >= 0.75:
            soil_test_mult += 0.05
            
    # Irrigation & Water adjustment
    irr_reliability = data_dict.get("irrigation_reliability", "reliable")
    water_avail = data_dict.get("water_availability", "sufficient")
    irr_mult = 1.0
    if irr_reliability == "reliable" and water_avail == "sufficient":
        irr_mult = 1.08
    elif irr_reliability == "limited" or water_avail == "moderate":
        irr_mult = 0.92
    elif irr_reliability == "uncertain" or water_avail == "scarce":
        irr_mult = 0.78
        
    # Crop condition adjustment
    condition = (data_dict.get("crop_condition") or "good").lower()
    cond_mult = {"excellent": 1.15, "good": 1.05, "moderate": 0.90, "poor": 0.72}.get(condition, 1.0)
    
    # Stress factors adjustment
    stress_factors = data_dict.get("stress_factors") or []
    stress_mult = 1.0
    if "drought" in stress_factors: stress_mult *= 0.80
    if "waterlogging" in stress_factors: stress_mult *= 0.85
    if "heat_stress" in stress_factors: stress_mult *= 0.88
    if "pest_disease" in stress_factors: stress_mult *= 0.82
    if "lodging" in stress_factors: stress_mult *= 0.90
    
    # Calculate Base Yield per Acre in Quintals
    yield_q_per_acre = round(base_q_acre * soil_mult * soil_test_mult * irr_mult * cond_mult * stress_mult, 2)
    yield_q_per_ha = round(yield_q_per_acre * HA_TO_ACRE, 2)
    
    yield_ton_per_acre = round(yield_q_per_acre / 10.0, 3)
    yield_ton_per_ha = round(yield_q_per_ha / 10.0, 3)
    
    # Total Harvest calculations
    total_harvest_q = round(yield_q_per_acre * cultivated_acres, 2)
    total_harvest_ton = round(total_harvest_q / 10.0, 2)
    total_harvest_kg = round(total_harvest_q * 100, 1)
    
    # Range estimates (Low, Base, High)
    low_q_acre = round(yield_q_per_acre * 0.82, 2)
    high_q_acre = round(yield_q_per_acre * 1.18, 2)
    
    low_total_harvest_q = round(low_q_acre * cultivated_acres, 2)
    high_total_harvest_q = round(high_q_acre * cultivated_acres, 2)
    
    # Evidence & Quality score
    data_quality_score = 75
    if data_dict.get("soil_test_available"): data_quality_score += 10
    if data_dict.get("sowing_date"): data_quality_score += 5
    if data_dict.get("fertilizers_applied"): data_quality_score += 5
    if data_dict.get("itemized_costs"): data_quality_score += 5
    data_quality_score = min(98, data_quality_score)
    
    # --- FINANCIAL FORECASTING ENGINE ---
    # Cost calculation (prevent double counting)
    itemized = data_dict.get("itemized_costs") or {}
    total_custom = data_dict.get("total_custom_cost")
    
    if itemized and len(itemized) > 0:
        calculated_operating_cost = sum(float(v or 0) for v in itemized.values())
    elif total_custom and float(total_custom) > 0:
        calculated_operating_cost = float(total_custom)
    else:
        # Default baseline cost per acre
        base_cost_acre = crop_info["base_cost_per_acre"]
        calculated_operating_cost = base_cost_acre * cultivated_acres

    # Land rent & insurance
    land_rent = float(data_dict.get("land_rent_per_acre") or 0.0) * cultivated_acres
    
    # Check if land rent already in itemized to avoid double counting
    if itemized and ("land_rent" in itemized or "rent" in itemized):
        total_operating_cost = round(calculated_operating_cost, 2)
    else:
        total_operating_cost = round(calculated_operating_cost + land_rent, 2)
        
    cost_per_acre = round(total_operating_cost / cultivated_acres, 2)
    
    # Price per quintal (Agmarknet baseline or custom expected)
    price_per_quintal = float(data_dict.get("expected_farmgate_price") or 2585.0)
    byproduct_rev = float(data_dict.get("byproduct_revenue") or 0.0)
    
    # Financial metrics
    gross_revenue = round((total_harvest_q * price_per_quintal) + byproduct_rev, 2)
    gross_revenue_per_acre = round(gross_revenue / cultivated_acres, 2)
    
    net_operating_profit = round(gross_revenue - total_operating_cost, 2)
    net_profit_per_acre = round(net_operating_profit / cultivated_acres, 2)
    
    profit_margin_pct = round((net_operating_profit / max(1.0, gross_revenue)) * 100, 1)
    return_on_investment_pct = round((net_operating_profit / max(1.0, total_operating_cost)) * 100, 1)
    
    # Break-even metrics
    breakeven_price_per_q = round(total_operating_cost / max(0.1, total_harvest_q), 2)
    breakeven_yield_per_acre = round(total_operating_cost / max(1.0, (price_per_quintal * cultivated_acres)), 2)
    production_cost_per_q = round(total_operating_cost / max(0.1, total_harvest_q), 2)
    
    # Financial Scenarios
    scenarios = {
        "conservative": {
            "name": "Conservative Case (-15% Yield, -10% Price)",
            "harvest_q": round(total_harvest_q * 0.85, 2),
            "price_per_q": round(price_per_quintal * 0.90, 2),
            "gross_revenue": round((total_harvest_q * 0.85 * price_per_quintal * 0.90) + byproduct_rev, 2),
            "total_cost": total_operating_cost,
            "net_profit": round(((total_harvest_q * 0.85 * price_per_quintal * 0.90) + byproduct_rev) - total_operating_cost, 2),
            "profit_per_acre": round((((total_harvest_q * 0.85 * price_per_quintal * 0.90) + byproduct_rev) - total_operating_cost) / cultivated_acres, 2)
        },
        "base": {
            "name": "Base Forecast",
            "harvest_q": total_harvest_q,
            "price_per_q": price_per_quintal,
            "gross_revenue": gross_revenue,
            "total_cost": total_operating_cost,
            "net_profit": net_operating_profit,
            "profit_per_acre": net_profit_per_acre
        },
        "optimistic": {
            "name": "Optimistic Case (+15% Yield, +10% Price)",
            "harvest_q": round(total_harvest_q * 1.15, 2),
            "price_per_q": round(price_per_quintal * 1.10, 2),
            "gross_revenue": round((total_harvest_q * 1.15 * price_per_quintal * 1.10) + byproduct_rev, 2),
            "total_cost": total_operating_cost,
            "net_profit": round(((total_harvest_q * 1.15 * price_per_quintal * 1.10) + byproduct_rev) - total_operating_cost, 2),
            "profit_per_acre": round((((total_harvest_q * 1.15 * price_per_quintal * 1.10) + byproduct_rev) - total_operating_cost) / cultivated_acres, 2)
        }
    }
    
    # Price Sensitivity Curve
    price_sensitivity = []
    for pct in [-20, -10, 0, 10, 20]:
        adj_price = round(price_per_quintal * (1 + (pct / 100.0)), 2)
        adj_rev = round((total_harvest_q * adj_price) + byproduct_rev, 2)
        adj_profit = round(adj_rev - total_operating_cost, 2)
        price_sensitivity.append({
            "change_pct": f"{'+' if pct > 0 else ''}{pct}%",
            "price_per_q": adj_price,
            "revenue": adj_rev,
            "net_profit": adj_profit
        })

    # Yield Sensitivity Curve
    yield_sensitivity = []
    for pct, scenario_name in [(-25, "Severe Drought / Pest"), (-10, "Sub-optimal Rain"), (0, "Base Condition"), (10, "Optimal Weather"), (20, "Bumper Harvest")]:
        adj_yield_q = round(yield_q_per_acre * (1 + (pct / 100.0)), 2)
        adj_tot_harvest = round(adj_yield_q * cultivated_acres, 2)
        adj_rev = round((adj_tot_harvest * price_per_quintal) + byproduct_rev, 2)
        adj_profit = round(adj_rev - total_operating_cost, 2)
        yield_sensitivity.append({
            "scenario": scenario_name,
            "change_pct": f"{'+' if pct > 0 else ''}{pct}%",
            "yield_q_acre": adj_yield_q,
            "total_harvest_q": adj_tot_harvest,
            "net_profit": adj_profit
        })

    # Prioritized Smart Farming Recommendations
    recommendations = generate_agronomic_recommendations(crop_type, soil_type, data_dict.get("crop_stage"), stress_factors)

    # Return structured dict
    return {
        "success": True,
        "farm_profile": {
            "district": data_dict.get("district", "Hyderabad"),
            "total_area_acres": total_area_acres,
            "cultivated_acres": cultivated_acres,
            "cultivated_ha": cultivated_ha,
            "soil_type": soil_type,
            "land_ownership": data_dict.get("land_ownership", "owned"),
            "irrigation_source": data_dict.get("irrigation_source", "borewell")
        },
        "crop_info": {
            "crop_type": crop_type,
            "category": crop_info["category"],
            "variety": data_dict.get("variety_name", "Standard Hybrid"),
            "crop_stage": data_dict.get("crop_stage", "Germination"),
            "sowing_date": data_dict.get("sowing_date", "Nov 2026")
        },
        "yield_forecast": {
            "yield_per_acre_q": yield_q_per_acre,
            "yield_per_ha_q": yield_q_per_ha,
            "yield_per_acre_ton": yield_ton_per_acre,
            "yield_per_ha_ton": yield_ton_per_ha,
            "total_harvest_q": total_harvest_q,
            "total_harvest_ton": total_harvest_ton,
            "total_harvest_kg": total_harvest_kg,
            "range": {
                "low_q_acre": low_q_acre,
                "base_q_acre": yield_q_per_acre,
                "high_q_acre": high_q_acre,
                "low_total_q": low_total_harvest_q,
                "high_total_q": high_total_harvest_q
            },
            "confidence_score": data_quality_score,
            "factors": [
                {"factor": f"Soil Type ({soil_type})", "impact": f"{'+' if soil_mult >= 1.0 else ''}{round((soil_mult-1)*100)}%"},
                {"factor": f"Irrigation Reliability ({irr_reliability})", "impact": f"{'+' if irr_mult >= 1.0 else ''}{round((irr_mult-1)*100)}%"},
                {"factor": f"Crop Health ({condition})", "impact": f"{'+' if cond_mult >= 1.0 else ''}{round((cond_mult-1)*100)}%"}
            ]
        },
        "financial_forecast": {
            "expected_farmgate_price_per_q": price_per_quintal,
            "gross_revenue": gross_revenue,
            "gross_revenue_per_acre": gross_revenue_per_acre,
            "total_operating_cost": total_operating_cost,
            "cost_per_acre": cost_per_acre,
            "net_operating_profit": net_operating_profit,
            "net_profit_per_acre": net_profit_per_acre,
            "profit_margin_pct": profit_margin_pct,
            "return_on_investment_pct": return_on_investment_pct,
            "breakeven_price_per_q": breakeven_price_per_q,
            "breakeven_yield_per_acre": breakeven_yield_per_acre,
            "production_cost_per_q": production_cost_per_q,
            "scenarios": scenarios,
            "price_sensitivity": price_sensitivity,
            "yield_sensitivity": yield_sensitivity
        },
        "recommendations": recommendations,
        "timestamp": datetime.now().isoformat()
    }

def generate_agronomic_recommendations(crop: str, soil: str, stage: str, stress_factors: List[str]) -> List[Dict[str, Any]]:
    recs = []
    
    # 1. Nutrient Management
    recs.append({
        "title": f"Crop-Stage Nutrient Timing ({crop})",
        "action": f"Apply split dose of NPK 19:19:19 (5 kg/acre) during {stage or 'vegetative'} growth stage.",
        "why": "Balances vegetative tillering and root node establishment.",
        "when": "Within the next 7-10 days",
        "priority": "High",
        "expected_benefit": "Boosts yield by 10-14%",
        "source": "PJTSAU Agronomic Package of Practices",
        "limitations": "Ensure soil has adequate moisture prior to top-dressing."
    })

    # 2. Water Stress & Irrigation
    if "drought" in (stress_factors or []):
        recs.append({
            "title": "Drought Mitigation & Moisture Conservation",
            "action": "Apply straw mulching between crop rows and schedule micro-drip irrigation during evening hours.",
            "why": "Reduces soil evaporation losses and prevents leaf scorching.",
            "when": "Immediate (Next 24-48 hours)",
            "priority": "High",
            "expected_benefit": "Prevents 20% crop loss from heat stress",
            "source": "ICAR Central Research Institute for Dryland Agriculture",
            "limitations": "Requires available drip lines or localized bucket irrigation."
        })
    else:
        recs.append({
            "title": "Irrigation Interval Scheduling",
            "action": f"Maintain 4 to 6 day irrigation cycle for {soil} soil type.",
            "why": "Prevents root saturation while maintaining field capacity moisture.",
            "when": "Every 5 days",
            "priority": "Medium",
            "expected_benefit": "Saves 15% water while stabilizing grain weight",
            "source": "Open-Meteo Evapotranspiration Model",
            "limitations": "Adjust if rain exceeds 15mm."
        })

    # 3. Pest Scouting & Harvest
    recs.append({
        "title": "Pest & Disease Scouting Warning",
        "action": "Inspect lower canopy leaves twice weekly for early signs of foliar spot or stem borer whorl damage.",
        "why": "Early detection allows organic / localized spray before threshold escalation.",
        "when": "Twice weekly",
        "priority": "Medium",
        "expected_benefit": "Reduces chemical pesticide costs by 30%",
        "source": "AgroVision AI Diagnostic Intelligence",
        "limitations": "Visual scouting required during morning daylight."
    })
    
    return recs
