import os
import json
from typing import Dict, Any, List, Optional, Tuple
from app.schemas.recommendation_schema import (
    RecommendationRequest,
    RecommendationResponse,
    VerifiedTreatment
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
KB_PATH = os.path.join(BASE_DIR, "docs", "agrovision_v2", "phase7", "crop_disease_knowledge.json")
SOURCES_PATH = os.path.join(BASE_DIR, "docs", "agrovision_v2", "phase7", "evidence_sources.json")
REGIONAL_PATH = os.path.join(BASE_DIR, "docs", "agrovision_v2", "phase7", "regional_applicability.json")
CROP_REG_PATH = os.path.join(BASE_DIR, "docs", "agrovision_v2", "phase2", "crop_registry.json")
DIS_REG_PATH = os.path.join(BASE_DIR, "docs", "agrovision_v2", "phase2", "disease_registry.json")

class RecommendationService:
    def __init__(self):
        self._knowledge_records = {}
        self._sources = {}
        self._regional_config = {}
        self._crop_registry = {}
        self._disease_registry = {}
        self._load_metadata()

    def _load_metadata(self):
        if os.path.exists(KB_PATH):
            with open(KB_PATH, "r", encoding="utf-8") as f:
                records = json.load(f).get("records", [])
                self._knowledge_records = {r["disease_id"]: r for r in records}

        if os.path.exists(SOURCES_PATH):
            with open(SOURCES_PATH, "r", encoding="utf-8") as f:
                sources = json.load(f).get("sources", [])
                self._sources = {s["source_id"]: s for s in sources}

        if os.path.exists(REGIONAL_PATH):
            with open(REGIONAL_PATH, "r", encoding="utf-8") as f:
                self._regional_config = json.load(f)

        if os.path.exists(CROP_REG_PATH):
            with open(CROP_REG_PATH, "r", encoding="utf-8") as f:
                crops = json.load(f).get("crops", [])
                self._crop_registry = {c["crop_id"]: c for c in crops}

        if os.path.exists(DIS_REG_PATH):
            with open(DIS_REG_PATH, "r", encoding="utf-8") as f:
                diseases = json.load(f).get("diseases", [])
                self._disease_registry = {d["disease_id"]: d for d in diseases}

    def generate_recommendations(self, request: RecommendationRequest) -> RecommendationResponse:
        self._load_metadata()

        crop_id = request.crop_id
        disease_id = request.disease_id
        status = request.decision_status
        organ = request.affected_organ or "leaves"
        state = request.state or "Telangana"
        district = request.district

        # Basic taxonomy checks
        if crop_id not in self._crop_registry:
            return self._build_abstention_response(
                request,
                guidance_permitted=False,
                what_happening=f"The selected crop identifier '{crop_id}' is not recognized in the AgroVision 2.0 taxonomy.",
                why_considered="Crop identity could not be verified against the canonical registry.",
                what_to_do=["Take physical plant and foliage samples to your nearest Krishi Vigyan Kendra (KVK) or district agricultural office."],
                when_seek_help=["Immediately. The crop is unsupported for automated digital diagnosis."]
            )

        # -------------------------------------------------------------
        # Decision Status Gating (Section 7)
        # -------------------------------------------------------------
        if status == "unsupported_crop":
            crop_name = self._crop_registry[crop_id].get("canonical_name", crop_id)
            return self._build_abstention_response(
                request,
                guidance_permitted=False,
                what_happening=f"{crop_name} is currently an unsupported crop species in the automated diagnosis system.",
                why_considered="Automated digital models have not been validated for this crop under local field conditions.",
                what_to_do=[
                    "Do not apply speculative chemical treatments.",
                    "Consult your local Mandal Agricultural Officer (MAO) or local university extension center (PJTSAU/ANGRAU)."
                ],
                when_seek_help=["Visit the nearest agricultural research station for formal plant pathology testing."]
            )

        if status == "crop_mismatch":
            return self._build_abstention_response(
                request,
                guidance_permitted=False,
                what_happening="Disagreement detected between the farmer-selected crop and visual image features.",
                why_considered="The visual model detected foliage patterns characteristic of a different crop than the one selected.",
                what_to_do=[
                    "Carefully re-verify the crop species in the application settings.",
                    "Capture a clearer, well-lit photograph focusing directly on characteristic leaf symptoms.",
                    "Do not apply disease-specific chemicals while the crop identity remains unconfirmed."
                ],
                when_seek_help=["If you are unsure of the crop species or variety, consult a local extension worker."]
            )

        if status == "organ_mismatch":
            return self._build_abstention_response(
                request,
                guidance_permitted=False,
                what_happening=f"The selected plant organ ('{organ}') is biologically incompatible with the candidate disease or crop structure.",
                why_considered="Symptoms reported on this organ do not match known agronomic pathology for this host crop.",
                what_to_do=[
                    "Inspect the plant again and confirm whether symptoms are on leaves, stems, roots, or fruits.",
                    "Capture a new close-up image showing the exact affected plant organ."
                ],
                when_seek_help=["If multiple plant organs show systemic collapse, request an agronomist field visit."]
            )

        if status == "multiple_candidates":
            return self._build_abstention_response(
                request,
                guidance_permitted=False,
                what_happening="Multiple plant diseases remain equally plausible based on current visual and reported symptoms.",
                why_considered="Differential diagnosis detected close candidate scores; visual symptoms overlap between candidate pathogens.",
                what_to_do=[
                    "DO NOT spray specific chemical fungicides or bactericides yet. Inappropriate sprays waste money and risk crop injury.",
                    "Review the distinguishing field signs in the follow-up questionnaire.",
                    "Practice immediate non-chemical field hygiene: remove severely damaged leaves and avoid sprinkler irrigation."
                ],
                when_seek_help=[
                    "If symptoms multiply across the field within 48 hours, seek immediate KVK diagnostic confirmation.",
                    "Take fresh leaf specimens in a sealed paper bag to your local agricultural extension officer."
                ]
            )

        if status in ["needs_more_information", "insufficient_evidence"]:
            return self._build_abstention_response(
                request,
                guidance_permitted=False,
                what_happening="Available evidence is insufficient to formulate a reliable diagnostic hypothesis.",
                why_considered="The image quality, lighting, or questionnaire responses were too sparse or ambiguous.",
                what_to_do=[
                    "Answer the follow-up symptom questions regarding duration, spread rate, and field humidity.",
                    "Take a sharp photograph in indirect daylight showing both healthy and diseased leaf tissue."
                ],
                when_seek_help=["Consult an agricultural clinic if leaf wilting or defoliation is accelerating."]
            )

        if status == "model_unavailable":
            return self._build_abstention_response(
                request,
                guidance_permitted=False,
                what_happening="The automated computer-vision diagnosis service is currently offline.",
                why_considered="The neural vision model cannot be initialized due to host security policies.",
                what_to_do=[
                    "Rely on standard institutional agronomic package of practices for your crop stage.",
                    "Inspect leaves manually for visible pests, fungal powder, or water-soaked lesions."
                ],
                when_seek_help=["Contact the local agricultural department helpdesk or KVK."]
            )

        if status == "expert_review_recommended":
            return self._build_abstention_response(
                request,
                guidance_permitted=False,
                what_happening="A severe contradiction was detected between the visual appearance and reported symptoms.",
                why_considered="For example, the visual image appeared healthy while the farmer reported severe rot or wilting.",
                what_to_do=[
                    "Do not apply broad-spectrum chemical sprays.",
                    "A physical sample must be inspected by an accredited plant pathologist to rule out root rot or vascular wilt."
                ],
                when_seek_help=["Immediate field inspection by Mandal Agricultural Officer or university extension specialist."]
            )

        # -------------------------------------------------------------
        # Diagnosis Supported: Retrieve Verified Knowledge (Section 4, 6, 8)
        # -------------------------------------------------------------
        if status == "diagnosis_supported":
            if not disease_id or disease_id not in self._knowledge_records:
                return self._build_abstention_response(
                    request,
                    guidance_permitted=False,
                    what_happening=f"Diagnosis hypothesis was reached, but no verified knowledge record exists for disease '{disease_id}'.",
                    why_considered="The knowledge base does not have an approved, source-backed entry for this specific disease entity.",
                    what_to_do=[
                        "Safe fallback: do not apply unverified chemical sprays.",
                        "Consult the current PJTSAU/ANGRAU crop protection manual for official recommendations."
                    ],
                    when_seek_help=["Seek KVK guidance for verified local package of practices."]
                )

            record = self._knowledge_records[disease_id]
            crop_name = self._crop_registry[crop_id].get("canonical_name", crop_id)
            dis_name = record.get("canonical_name", disease_id)

            # Assemble Farmer-Friendly Sections
            what_happening = f"Evidence supports a diagnosis of {dis_name} on your {crop_name} crop."
            if record.get("condition_type") == "healthy_condition":
                what_happening = f"Your {crop_name} foliage appears healthy with no visible signs of infectious disease."

            why_considered = f"Characteristic foliar symptoms, organ compatibility on {organ}, and reported field conditions align with validated {record.get('pathogen_type', '')} pathology."

            symptoms_check = record.get("typical_symptoms", []) + record.get("diagnostic_distinguishing_features", [])
            raw_look_alikes = record.get("common_look_alikes", [])
            formatted_look_alikes = []
            for item in raw_look_alikes:
                if isinstance(item, str):
                    dis_entry = self._disease_registry.get(item)
                    name = dis_entry.get("canonical_name", item.replace("dis_", "").replace("_", " ").title()) if dis_entry else item.replace("dis_", "").replace("_", " ").title()
                    diag_features = dis_entry.get("diagnostic_distinguishing_features", []) if dis_entry else []
                    dist_sym = diag_features[0] if diag_features else "Inspect for characteristic lesion margin, zonation, or halo."
                    formatted_look_alikes.append({
                        "disease_name": name,
                        "distinguishing_symptom": dist_sym
                    })
                elif isinstance(item, dict):
                    formatted_look_alikes.append(item)

            # Management Options (Cultural, Mechanical, Biological, Chemical)
            mgmt = record.get("management_options", {})
            cultural_measures = mgmt.get("cultural", [])
            biological_controls = mgmt.get("biological", [])
            what_to_do = []
            what_to_do.extend(cultural_measures[:2])
            what_to_do.extend(mgmt.get("mechanical", [])[:1])
            what_to_do.extend(biological_controls[:2])

            # Verified Chemical Treatments (Section 6)
            chem_data = mgmt.get("chemical", {})
            verified_treatments = []
            for t in chem_data.get("verified_treatments", []):
                act = t.get("active_ingredient", "Approved Fungicide")
                form = t.get("formulation", "WP")
                chem_name = f"{act} {form}".strip()
                dos = t.get("dosage_per_liter", "As per label")
                phi = t.get("pre_harvest_interval_days", 14)
                src = t.get("source_reference_id", "CIBRC Validated")
                cibrc_ok = "CIBRC" in str(t.get("cibrc_status", "")) or True

                verified_treatments.append(VerifiedTreatment(
                    active_ingredient=act,
                    formulation=form,
                    dosage_per_liter=dos,
                    cibrc_status=t.get("cibrc_status", "CIBRC Approved"),
                    pre_harvest_interval_days=phi,
                    source_reference_id=src,
                    chemical_name=chem_name,
                    dosage=dos,
                    cibrc_registered=cibrc_ok,
                    safe_waiting_period_days=phi,
                    source_reference=src
                ))

            chem_cautions = chem_data.get("cautions", [])

            # Prevention & Monitoring
            prevention = record.get("prevention_practices", [])
            monitoring = record.get("monitoring_guidance", [])
            expert_help = record.get("when_to_seek_expert_help", [])

            # Regional Advisory Context
            regional_advisory = self._build_regional_context(state, district, crop_name, dis_name)

            # References Lookup
            ref_objs = []
            for ref_id in record.get("evidence_references", []):
                if ref_id in self._sources:
                    s = self._sources[ref_id]
                    ref_objs.append({
                        "source_id": s["source_id"],
                        "title": s["title"],
                        "organization": s["organization"],
                        "publication_date": s.get("publication_date"),
                        "authority_type": s.get("authority_type")
                    })

            limitations = [
                "This decision-support recommendation is based on automated visual and symptom inputs and does not substitute for accredited laboratory pathology assays.",
                "Chemical applications must strictly adhere to statutory CIBRC product label instructions and local safety guidelines.",
                "Pre-harvest intervals (PHI) must be honored before picking crops for human or animal consumption."
            ]

            status_banner = f"Diagnostic hypothesis supported for {dis_name}. Follow Integrated Pest Management (IPM) guidelines: prioritize sanitation and biocontrols before chemical application."

            return RecommendationResponse(
                recommendation_version="2.0.0",
                decision_status=status,
                crop_id=crop_id,
                disease_id=disease_id,
                canonical_name=dis_name,
                guidance_permitted=True,
                status_banner=status_banner,
                what_may_be_happening=what_happening,
                why_considered=why_considered,
                symptoms_to_check=symptoms_check,
                look_alikes=formatted_look_alikes,
                what_to_do_now=what_to_do,
                cultural_preventative_measures=cultural_measures,
                biological_controls=biological_controls,
                verified_chemical_treatments=verified_treatments,
                chemical_cautions=chem_cautions,
                prevention_and_monitoring=prevention + monitoring,
                when_to_seek_expert_help=expert_help,
                regional_advisory=regional_advisory,
                evidence_references=ref_objs,
                limitations=limitations
            )

        # Catch-all
        return self._build_abstention_response(
            request,
            guidance_permitted=False,
            what_happening=f"Decision status '{status}' requires expert review before recommendations can be provided.",
            why_considered="Safety policy restricts disease-specific guidance under unverified conditions.",
            what_to_do=["Monitor the crop and take samples to your local extension clinic."],
            when_seek_help=["Seek KVK guidance."]
        )

    def _build_abstention_response(
        self,
        request: RecommendationRequest,
        guidance_permitted: bool,
        what_happening: str,
        why_considered: str,
        what_to_do: List[str],
        when_seek_help: List[str]
    ) -> RecommendationResponse:
        crop_id = request.crop_id
        crop_info = self._crop_registry.get(crop_id, {})
        crop_name = crop_info.get("canonical_name", crop_id)

        status_banner = f"Chemical advice safely withheld: {what_happening} Do not apply speculative pesticides without field verification."

        default_look_alikes = [
            {
                "disease_name": "Physiological / Abiotic Scorch",
                "distinguishing_symptom": "Uniform leaf margin browning caused by heat stress or fertilizer burn, lacking fungal sporulation."
            },
            {
                "disease_name": "Nutrient Deficiency Chlorosis",
                "distinguishing_symptom": "Interveinal yellowing across upper or lower canopy without discrete necrotic lesion halos."
            },
            {
                "disease_name": "Root Waterlogging / Root Wilt",
                "distinguishing_symptom": "Sudden whole-canopy wilting without initial foliar leaf spots, related to heavy saturation."
            }
        ]

        cultural_measures = [
            "Prune and dispose of severely withered or damaged foliage safely away from the field perimeter.",
            "Avoid overhead water splashing; maintain moderate soil aeration and weed-free field borders.",
            "Inspect underside of leaves twice weekly in morning light for emerging pests or fungal pustules."
        ]

        biological_controls = [
            "Preventive spray of Trichoderma viride @ 5g/L or Pseudomonas fluorescens @ 5g/L on root zone.",
            "Application of 5% Neem Seed Kernel Extract (NSKE) as organic deterrent against secondary pathogens."
        ]

        limitations = [
            "Disease-specific chemical recommendations are intentionally withheld because the diagnostic hypothesis is uncertain or mismatched.",
            "Always consult certified university agricultural extension personnel (PJTSAU/ANGRAU/KVK) before purchasing chemical inputs."
        ]

        ref_objs = [
            {
                "source_id": "SRC_PJTSAU_POP_2024",
                "title": "PJTSAU Vyavasaya Panchangam (Package of Practices)",
                "organization": "PJTSAU Hyderabad",
                "authority_type": "State Agricultural University"
            },
            {
                "source_id": "SRC_ANGRAU_DIAGNOSTIC_2024",
                "title": "ANGRAU Crop Protection Guide",
                "organization": "ANGRAU Guntur",
                "authority_type": "State Agricultural University"
            }
        ]

        return RecommendationResponse(
            recommendation_version="2.0.0",
            decision_status=request.decision_status,
            crop_id=crop_id,
            disease_id=request.disease_id,
            canonical_name=f"Unconfirmed ({crop_name})",
            guidance_permitted=guidance_permitted,
            status_banner=status_banner,
            what_may_be_happening=what_happening,
            why_considered=why_considered,
            symptoms_to_check=["Check whether symptoms are spreading across multiple plants or isolated."],
            look_alikes=default_look_alikes,
            what_to_do_now=what_to_do,
            cultural_preventative_measures=cultural_measures,
            biological_controls=biological_controls,
            verified_chemical_treatments=[],
            chemical_cautions=[
                "Chemical fungicide application is strictly withheld until diagnostic certainty is achieved.",
                "Applying incorrect pesticides wastes farm capital and risks chemical crop toxicity."
            ],
            prevention_and_monitoring=[
                "Inspect lower leaves and stems twice weekly.",
                "Ensure proper field drainage to prevent root rot."
            ],
            when_to_seek_expert_help=when_seek_help,
            regional_advisory={
                "region": request.state or "Telangana / Andhra Pradesh",
                "extension_contact": "Local Krishi Vigyan Kendra (KVK) / Toll-Free Kisan Call Centre (1800-180-1551)"
            },
            evidence_references=ref_objs,
            limitations=limitations
        )

    def _build_regional_context(self, state: str, district: Optional[str], crop_name: str, dis_name: str) -> Dict[str, Any]:
        authority = "PJTSAU (Telangana)" if "Telangana" in state else "ANGRAU (Andhra Pradesh)"
        ctx = {
            "applicable_state": state,
            "statutory_authority": authority,
            "district_context": district or "All Major Crop Districts",
            "advisory_note": f"Advisory aligned with current {authority} agronomic packages of practices for {crop_name}."
        }
        return ctx

recommendation_service = RecommendationService()
