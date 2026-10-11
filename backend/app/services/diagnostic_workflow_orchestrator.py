import os
import cv2
import uuid
import base64
import logging
import numpy as np
from typing import Dict, Any, List, Optional

from app.schemas.diagnosis_schema import (
    DiagnosisRequest,
    DiagnosisResponse,
    FullDiagnosisResponse
)
from app.schemas.questionnaire_schema import QuestionnaireSubmissionRequest
from app.schemas.recommendation_schema import RecommendationRequest
from app.services.diagnosis_engine import diagnosis_engine
from app.services.recommendation_service import recommendation_service

logger = logging.getLogger("agrovision.workflow")

class DiagnosticWorkflowOrchestrator:
    def __init__(self):
        self.engine = diagnosis_engine
        self.recommender = recommendation_service

    def analyze_lesions(self, cv_img: np.ndarray, is_healthy: bool = False):
        if cv_img is None:
            return 0, "Healthy", None, []

        infected_area_count = 0
        severity = "Healthy"
        proc_img = cv_img.copy()
        boxes = []

        if not is_healthy:
            hsv = cv2.cvtColor(cv_img, cv2.COLOR_BGR2HSV)

            # Brown necrosis / lesions
            lower_brown = np.array([5, 40, 20])
            upper_brown = np.array([25, 255, 200])
            mask_brown = cv2.inRange(hsv, lower_brown, upper_brown)

            # Yellow chlorosis / halo
            lower_yellow = np.array([16, 60, 60])
            upper_yellow = np.array([38, 255, 255])
            mask_yellow = cv2.inRange(hsv, lower_yellow, upper_yellow)

            combined_mask = cv2.bitwise_or(mask_brown, mask_yellow)
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
            combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_OPEN, kernel)
            combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_CLOSE, kernel)

            contours, _ = cv2.findContours(combined_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            img_area = cv_img.shape[0] * cv_img.shape[1]
            min_area = 25
            max_area = img_area * 0.25

            for cnt in contours:
                area = cv2.contourArea(cnt)
                if min_area < area < max_area:
                    x, y, w, h = cv2.boundingRect(cnt)
                    # Vibrant red-orange bounding box
                    cv2.rectangle(proc_img, (x, y), (x + w, y + h), (0, 30, 240), 2)
                    # Centroid marker
                    cv2.circle(proc_img, (x + w // 2, y + h // 2), 3, (0, 255, 255), -1)
                    infected_area_count += 1
                    boxes.append({
                        "x": int(x),
                        "y": int(y),
                        "w": int(w),
                        "h": int(h),
                        "area": float(area)
                    })

            if infected_area_count > 15:
                severity = "High"
            elif infected_area_count > 5:
                severity = "Medium"
            elif infected_area_count > 0:
                severity = "Low"
            else:
                severity = "Low"

            header_bar_height = min(40, max(25, int(proc_img.shape[0] * 0.08)))
            cv2.rectangle(proc_img, (0, 0), (proc_img.shape[1], header_bar_height), (20, 24, 33), -1)
            cv2.putText(
                proc_img,
                f"LESIONS: {infected_area_count} | SEVERITY: {severity.upper()}",
                (12, int(header_bar_height * 0.65)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.55,
                (0, 220, 255),
                2
            )
        else:
            header_bar_height = min(40, max(25, int(proc_img.shape[0] * 0.08)))
            cv2.rectangle(proc_img, (0, 0), (proc_img.shape[1], header_bar_height), (20, 24, 33), -1)
            cv2.putText(
                proc_img,
                "FOLIAGE HEALTHY - NO PATHOLOGICAL LESIONS",
                (12, int(header_bar_height * 0.65)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.55,
                (0, 230, 100),
                2
            )
            severity = "Healthy"

        _, buffer_proc = cv2.imencode('.png', proc_img)
        processed_b64 = "data:image/png;base64," + base64.b64encode(buffer_proc).decode('utf-8')
        return infected_area_count, severity, processed_b64, boxes

    def execute_workflow(
        self,
        questionnaire_payload: QuestionnaireSubmissionRequest,
        image_bytes: Optional[bytes] = None,
        filename: Optional[str] = None,
        mock_model_scores: Optional[List[Dict[str, Any]]] = None,
        model_version: Optional[str] = "v1_baseline_39class",
        state: Optional[str] = "Telangana",
        district: Optional[str] = None,
        correlation_id: Optional[str] = None
    ) -> FullDiagnosisResponse:
        cid = correlation_id or f"req_{uuid.uuid4().hex[:12]}"
        logger.info(f"[{cid}] Initiating full diagnostic workflow for crop={questionnaire_payload.selected_crop_id}, organ={questionnaire_payload.affected_organ}")

        cv_img = None

        # -------------------------------------------------------------
        # Step A: Image Validation
        # -------------------------------------------------------------
        if image_bytes is not None:
            if len(image_bytes) == 0:
                logger.warning(f"[{cid}] Image validation failure: Empty 0-byte file.")
                err_diag = self.engine.stage_12_generate_report(
                    DiagnosisRequest(questionnaire_payload=questionnaire_payload),
                    decision_status="invalid_input",
                    crop_status="crop_uncertain",
                    candidates=[],
                    ledger=[],
                    raw_scores_formatted=[],
                    contradictions=[],
                    uncertainty_reasons=["IMAGE_FILE_EMPTY_ZERO_BYTES"],
                    status_message="The uploaded image file is empty (0 bytes). Please upload a valid crop photograph."
                )
                return FullDiagnosisResponse(**err_diag.model_dump(), recommendations=None)

            if len(image_bytes) > 15 * 1024 * 1024:
                logger.warning(f"[{cid}] Image validation failure: Size exceeds 15MB.")
                err_diag = self.engine.stage_12_generate_report(
                    DiagnosisRequest(questionnaire_payload=questionnaire_payload),
                    decision_status="invalid_input",
                    crop_status="crop_uncertain",
                    candidates=[],
                    ledger=[],
                    raw_scores_formatted=[],
                    contradictions=[],
                    uncertainty_reasons=["IMAGE_SIZE_EXCEEDS_15MB_LIMIT"],
                    status_message="The uploaded image exceeds the maximum allowed file size of 15MB."
                )
                return FullDiagnosisResponse(**err_diag.model_dump(), recommendations=None)

            # OpenCV Image Decoding
            try:
                np_arr = np.frombuffer(image_bytes, np.uint8)
                cv_img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
                if cv_img is None or cv_img.shape[0] < 16 or cv_img.shape[1] < 16:
                    logger.warning(f"[{cid}] Image validation failure: Corrupt or unreadable image.")
                    err_diag = self.engine.stage_12_generate_report(
                        DiagnosisRequest(questionnaire_payload=questionnaire_payload),
                        decision_status="invalid_input",
                        crop_status="crop_uncertain",
                        candidates=[],
                        ledger=[],
                        raw_scores_formatted=[],
                        contradictions=[],
                        uncertainty_reasons=["CORRUPT_OR_UNREADABLE_IMAGE_FILE"],
                        status_message="The uploaded file could not be parsed as a valid image. Ensure format is JPG, PNG, or WEBP."
                    )
                    return FullDiagnosisResponse(**err_diag.model_dump(), recommendations=None)
            except Exception as e:
                logger.error(f"[{cid}] OpenCV decoding exception: {e}")
                err_diag = self.engine.stage_12_generate_report(
                    DiagnosisRequest(questionnaire_payload=questionnaire_payload),
                    decision_status="invalid_input",
                    crop_status="crop_uncertain",
                    candidates=[],
                    ledger=[],
                    raw_scores_formatted=[],
                    contradictions=[],
                    uncertainty_reasons=[f"IMAGE_DECODING_EXCEPTION:{type(e).__name__}"],
                    status_message="Failed to decode image data. Please upload a standard photograph."
                )
                return FullDiagnosisResponse(**err_diag.model_dump(), recommendations=None)

        # -------------------------------------------------------------
        # Steps B, C, D, E: Evidence-Based Multimodal Diagnosis Engine
        # -------------------------------------------------------------
        real_scores = mock_model_scores
        inferred_model_version = model_version or "v2_unified_72class"

        if real_scores is None and image_bytes is not None:
            try:
                from app.routes.predict import get_disease_model
                from PIL import Image
                import io
                import tensorflow as tf

                c_model, idx_map = get_disease_model()
                if c_model is not None:
                    pil_img = Image.open(io.BytesIO(image_bytes)).convert('RGB').resize((224, 224))
                    img_arr = tf.keras.preprocessing.image.img_to_array(pil_img)
                    img_arr = tf.expand_dims(img_arr, 0)
                    preds = c_model.predict(img_arr, verbose=0)[0]

                    if len(preds) >= 72:
                        inferred_model_version = "v2_unified_72class"
                    else:
                        inferred_model_version = "v1_baseline_39class"

                    real_scores = [
                        {
                            "output_index": int(i),
                            "class_label": str(idx_map.get(i, f"Index_{i}")) if idx_map else f"Index_{i}",
                            "score": float(score)
                        }
                        for i, score in enumerate(preds)
                    ]
                    logger.info(f"[{cid}] Real model inference completed: {len(real_scores)} classes, top index={int(np.argmax(preds))}")
            except Exception as e:
                logger.error(f"[{cid}] Real model inference exception: {e}")

        diag_req = DiagnosisRequest(
            questionnaire_payload=questionnaire_payload,
            model_version=inferred_model_version,
            mock_model_scores=real_scores
        )
        diag_resp = self.engine.run_diagnosis_pipeline(diag_req)
        logger.info(f"[{cid}] Diagnosis Engine complete: status={diag_resp.decision_status}, candidates={len(diag_resp.candidate_diagnoses)}")

        # -------------------------------------------------------------
        # Step F: Agricultural Knowledge & Recommendations Lookup
        # -------------------------------------------------------------
        top_disease_id = diag_resp.candidate_diagnoses[0].canonical_disease_id if diag_resp.candidate_diagnoses else None
        rec_req = RecommendationRequest(
            crop_id=questionnaire_payload.selected_crop_id,
            disease_id=top_disease_id,
            decision_status=diag_resp.decision_status,
            affected_organ=questionnaire_payload.affected_organ,
            state=state,
            district=district
        )
        rec_resp = self.recommender.generate_recommendations(rec_req)
        logger.info(f"[{cid}] Recommendation Service complete: guidance_permitted={rec_resp.guidance_permitted}, verified_chems={len(rec_resp.verified_chemical_treatments)}")

        # -------------------------------------------------------------
        # Step G: Lesion Analysis & Bounding Boxes
        # -------------------------------------------------------------
        lesion_count = 0
        severity_level = "Low"
        processed_img_b64 = None
        bounding_boxes_list = []

        if cv_img is not None:
            top_cand = diag_resp.candidate_diagnoses[0] if diag_resp.candidate_diagnoses else None
            top_healthy = False
            if top_cand and ("healthy" in top_cand.canonical_disease_id.lower() or "healthy" in top_cand.canonical_name.lower()):
                top_healthy = True

            lesion_count, severity_level, processed_img_b64, bounding_boxes_list = self.analyze_lesions(cv_img, is_healthy=top_healthy)

        # -------------------------------------------------------------
        # Step H: Assemble Full Unified Diagnostic Report
        # -------------------------------------------------------------
        full_dict = diag_resp.model_dump()
        full_dict["recommendations"] = rec_resp.model_dump()
        full_dict["processed_image"] = processed_img_b64
        full_dict["lesion_count"] = lesion_count
        full_dict["severity"] = severity_level
        full_dict["bounding_boxes"] = bounding_boxes_list

        return FullDiagnosisResponse(**full_dict)

workflow_orchestrator = DiagnosticWorkflowOrchestrator()
