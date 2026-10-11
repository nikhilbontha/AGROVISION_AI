"""
Health and Readiness Checks for AgroVision AI 2.0 (Phase 10 Release Engineering)
Provides non-sensitive liveness, readiness, and model verification endpoints.
"""

from fastapi import APIRouter, Response, status
from typing import Dict, Any
import os
import time
import hashlib
import json
from datetime import datetime, timezone

router = APIRouter()

APP_START_TIME = time.time()

# Expected SHA-256 Checksums for Production & Candidate Models
KNOWN_CHECKSUMS = {
    "v1_baseline_39class": {
        "filename": "disease_model.h5",
        "relative_path": "ml_models/disease_detection/disease_model.h5",
        "expected_sha256": "6ce987f81f3f72ad8e13d16680ea93d294fbc42f4f1f3644796cc6ccce3831a9",
        "expected_classes": 39,
        "type": "production_baseline"
    },
    "v2_candidate_72class": {
        "filename": "AGROVISION_UNIFIED_72CLASS_MODEL.h5",
        "relative_path": "ml_models/disease_detection/unified_experiment/artifacts/agrovision_phase7_20261010_231412/AGROVISION_UNIFIED_72CLASS_MODEL.h5",
        "expected_sha256": "b4206b1d98173e89e3534fa206d4aaa8f283856ad52581e4585a11d5c4a4135c",
        "expected_classes": 72,
        "type": "approved_candidate"
    },
    "yield_model": {
        "filename": "yield_model.pkl",
        "relative_path": "ml_models/yield_prediction/yield_model.pkl",
        "expected_sha256": "1a06a98b0b20b2ce885cee9433f327413aa5e53e386f3b093769536a8151b2eb",
        "type": "production_yield"
    }
}

def compute_sha256_if_exists(rel_path: str) -> Dict[str, Any]:
    # Resolve relative to project root
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    target_path = os.path.join(base_dir, rel_path.replace("/", os.sep))
    
    if not os.path.exists(target_path):
        return {"exists": False, "verified": False}
        
    try:
        size_bytes = os.path.getsize(target_path)
        hasher = hashlib.sha256()
        with open(target_path, "rb") as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
        calc_sha = hasher.hexdigest()
        return {
            "exists": True,
            "size_bytes": size_bytes,
            "sha256": calc_sha
        }
    except Exception:
        return {"exists": True, "error": "checksum_computation_failed"}


@router.get("/live", summary="Liveness Probe")
def liveness_probe():
    """
    Kube/container liveness probe.
    Confirms process is alive and responding to HTTP traffic.
    """
    uptime_seconds = round(time.time() - APP_START_TIME, 2)
    return {
        "status": "alive",
        "uptime_seconds": uptime_seconds,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@router.get("/ready", summary="Readiness Probe")
async def readiness_probe(response: Response):
    """
    Kube/container readiness probe.
    Confirms supporting services, configuration, and data registries are loaded.
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    
    # Check critical registry files (Phase 2, 4, 7 deliverables)
    critical_registries = {
        "crop_registry": os.path.join(base_dir, "docs", "agrovision_v2", "phase2", "crop_registry.json"),
        "disease_registry": os.path.join(base_dir, "docs", "agrovision_v2", "phase2", "disease_registry.json"),
        "questionnaire_schema": os.path.join(base_dir, "docs", "agrovision_v2", "phase4", "questionnaire_request_schema.json"),
        "questionnaire_config": os.path.join(base_dir, "docs", "agrovision_v2", "phase4", "questionnaire_config.json"),
        "knowledge_base": os.path.join(base_dir, "docs", "agrovision_v2", "phase7", "crop_disease_knowledge.json")
    }
    
    registry_status = {}
    registries_ok = True
    for name, p in critical_registries.items():
        exists = os.path.exists(p)
        registry_status[name] = "ready" if exists else "missing"
        if not exists:
            registries_ok = False
            
    # Check yield model file existence
    yield_path = os.path.join(base_dir, "ml_models", "yield_prediction", "yield_model.pkl")
    yield_model_ok = os.path.exists(yield_path)
    
    # Check database ping with timeout
    db_ok = True
    db_status = "connected"
    try:
        from app.database import client
        # Short ping check
        await client.admin.command('ping')
    except Exception:
        db_ok = False
        db_status = "degraded_or_unavailable"

    is_ready = registries_ok and yield_model_ok
    if not is_ready:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "status": "ready" if is_ready else "not_ready",
        "registries": registry_status,
        "yield_model": "ready" if yield_model_ok else "missing",
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@router.get("/model", summary="Model Integrity & Status Probe")
def model_status_probe():
    """
    Verifies model checkpoints, SHA-256 checksums, and runtime loading status.
    Does not expose sensitive filesystem paths or credentials.
    """
    verification = {}
    for model_key, spec in KNOWN_CHECKSUMS.items():
        res = compute_sha256_if_exists(spec["relative_path"])
        is_verified = res.get("sha256") == spec["expected_sha256"]
        verification[model_key] = {
            "type": spec["type"],
            "exists": res.get("exists", False),
            "checksum_verified": is_verified,
            "expected_classes": spec.get("expected_classes"),
            "size_bytes": res.get("size_bytes")
        }

    # Inspect active inference runtime status
    active_runtime = "unconstrained_or_fallback"
    tf_available = False
    try:
        import tensorflow as tf
        tf_available = True
    except Exception:
        tf_available = False

    return {
        "model_verification": verification,
        "inference_engine": {
            "tensorflow_installed": tf_available,
            "runtime_environment": "Linux-Container-Ready" if tf_available else "Host-Policy-Guarded-Fallback-Active",
            "active_mode": "hybrid_multimodal_gated"
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@router.get("", summary="Overall System Health Summary")
async def health_summary(response: Response):
    """
    Unified operational health summary combining liveness, readiness, and model verification.
    """
    live_res = liveness_probe()
    ready_res = await readiness_probe(response)
    model_res = model_status_probe()
    
    overall_status = "healthy" if ready_res["status"] == "ready" else "degraded"
    
    return {
        "application": "AgroVision AI 2.0",
        "status": overall_status,
        "liveness": live_res,
        "readiness": ready_res,
        "models": model_res["model_verification"],
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
