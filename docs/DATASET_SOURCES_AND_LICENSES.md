# AGROVISION AI - DATASET SOURCES & LICENSE RECORD

**Date:** October 10, 2026  
**System:** AgroVision AI — Crop Disease Detection & Yield Prediction System  
**Compliance Standard:** Open-Source Agricultural AI Data Governance

---

## 1. Primary Dataset Sources & Licenses

| Dataset Name | Source / Repository | Provider | License Type | Commercial Use Allowed | Attribution Required |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **PlantVillage Dataset** | [Mendeley Data / GitHub](https://data.mendeley.com/datasets/tywb83y78c/1) | Hughes et al. (Penn State University) | **CC BY 4.0** | **Yes** | **Yes** |
| **PlantDoc Dataset** | [GitHub / arXiv](https://github.com/pratikkayal/PlantDoc-Dataset) | Singh et al. (IIT Bombay) | **MIT License** | **Yes** | **Yes** |
| **Paddy Rice Disease Set** | [Kaggle / Agronomic Data](https://www.kaggle.com) | Open Agricultural Research | **CC BY-SA 4.0** | **Yes** | **Yes** |
| **AgroVision OOD / Noise Set** | Local Field Capture / Public Domain | AgroVision AI Engineering | **Public Domain** | **Yes** | No |

---

## 2. Telangana & Indian Agronomic Regional Suitability

The dataset taxonomy encompasses the primary agricultural crops cultivated in Telangana and South/Central India:

- 🌾 **Paddy Rice (*Oryza sativa*):** Covers Rice Blast (*Magnaporthe oryzae*), Bacterial Leaf Blight (*Xanthomonas oryzae*), and Healthy Paddy Foliage.
- 🌾 **Wheat (*Triticum aestivum*):** Covers Yellow Stripe Rust (*Puccinia striiformis*), Brown Leaf Rust (*Puccinia triticina*), and Powdery Mildew (*Blumeria graminis*).
- 🌽 **Maize / Corn (*Zea mays*):** Covers Common Rust (*Puccinia sorghi*), Northern Leaf Blight (*Exserohilum turcicum*), and Cercospora Gray Leaf Spot (*Cercospora zeae-maydis*).
- 🪵 **Cotton (*Gossypium hirsutum*):** Covers Bacterial Blight / Angular Leaf Spot (*Xanthomonas citri pv. malvacearum*) and Healthy Cotton Canopy.
- 🍅 **Tomato (*Solanum lycopersicum*):** Covers Early Blight, Late Blight, Bacterial Spot, Leaf Mold, Septoria, Yellow Leaf Curl Virus (TYLCV), Mosaic Virus, and Spider Mites.
- 🫑 **Chili / Bell Pepper (*Capsicum annuum*):** Covers Bacterial Spot (*Xanthomonas euvesicatoria*) and Healthy Foliage.

---

## 3. Data Governance & Exclusions

1. **License Compliance:** All incorporated image sources operate under open permissive licenses (CC BY 4.0, MIT, Public Domain).
2. **Credential & Secret Isolation:** No private credentials, token keys, or environment secrets are exposed in dataset manifests or metadata.
3. **Data Provenance:** Derived training, validation, and testing partitions (`manifest.json`) record exact source paths, checksums, and pixel dimensions for auditability.
