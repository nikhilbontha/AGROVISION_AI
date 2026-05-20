# AgroVision AI – Smart Crop Disease Detection & Yield Prediction System

This document outlines the step-by-step implementation plan to build the AgroVision AI platform, a complete industry-level agriculture web application designed to help farmers detect crop diseases and predict crop yield using machine learning.

## User Review Required

> [!IMPORTANT]
> **MongoDB Credentials**: This project requires a MongoDB Atlas database. During implementation, we will set up the code using environment variables. You will need to provide your MongoDB URI or create a free cluster on MongoDB Atlas to test the backend fully.
>
> **ML Models and Datasets**: The datasets for PlantVillage and Crop Yield are quite large. Instead of downloading and training the models in this environment (which could take a very long time and consume too many resources), I propose creating Python training scripts (`train_disease_model.py` and `train_yield_model.py`) that you can run on a local machine with a GPU or Google Colab, and we will place pre-trained "mock/placeholder" models or a lightweight version of the model to make the application functional immediately.
>
> **Camera Access**: Ensure your browser/device allows camera access for the "Scan leaf using live camera" feature to work.

## Open Questions

> [!WARNING]
> 1. Do you want me to generate simplified, lightweight mock models (using basic sklearn/keras architectures with fake weights) so that the application is fully functional end-to-end without waiting hours for the actual model training?
> 2. For the MongoDB Atlas database, do you want me to mock the database logic temporarily using local storage/SQLite, or should we build the direct MongoDB connection from the start?

## Proposed Changes

We will systematically build the project using a clean, modular architecture in `e:\tekworks_projects\AgroVisionAI`.

### [Folder Structure & Configuration]
We will generate the complete modular project structure as requested.
- `backend/app/`, `frontend/src/`, `ml_models/`, `datasets/`, `notebooks/`

#### [NEW] [docker-compose.yml](file:///e:/tekworks_projects/AgroVisionAI/docker-compose.yml)
#### [NEW] [README.md](file:///e:/tekworks_projects/AgroVisionAI/README.md)

---

### [Machine Learning Module]
We will create the training scripts, utilities, and models for both disease detection and yield prediction.

#### [NEW] [disease_model.py](file:///e:/tekworks_projects/AgroVisionAI/ml_models/disease_detection/train.py)
Script to use transfer learning (MobileNetV2) with TensorFlow/Keras on the PlantVillage dataset.
#### [NEW] [yield_model.py](file:///e:/tekworks_projects/AgroVisionAI/ml_models/yield_prediction/train.py)
Script to train a Random Forest / XGBoost Regressor using scikit-learn.

---

### [Backend (FastAPI)]
We will build an asynchronous FastAPI backend to handle API requests, database interactions, and ML model inference.

#### [NEW] [main.py](file:///e:/tekworks_projects/AgroVisionAI/backend/app/main.py)
Entry point for FastAPI, setup CORS and app routing.
#### [NEW] [database.py](file:///e:/tekworks_projects/AgroVisionAI/backend/app/database.py)
MongoDB connection logic using `motor` (async MongoDB driver).
#### [NEW] [auth.py](file:///e:/tekworks_projects/AgroVisionAI/backend/app/routes/auth.py)
Login and Register API with JWT Authentication.
#### [NEW] [predict.py](file:///e:/tekworks_projects/AgroVisionAI/backend/app/routes/predict.py)
Routes for `/predict-disease` (image upload & inference) and `/predict-yield`.
#### [NEW] [history.py](file:///e:/tekworks_projects/AgroVisionAI/backend/app/routes/history.py)
Route to fetch user prediction history.
#### [NEW] [Dockerfile](file:///e:/tekworks_projects/AgroVisionAI/backend/Dockerfile)
#### [NEW] [requirements.txt](file:///e:/tekworks_projects/AgroVisionAI/backend/requirements.txt)
#### [NEW] [render.yaml](file:///e:/tekworks_projects/AgroVisionAI/backend/render.yaml)

---

### [Frontend (React + Vite)]
We will build a responsive, futuristic, and beginner-friendly UI using React, Tailwind CSS, and Framer Motion.

#### [NEW] [package.json](file:///e:/tekworks_projects/AgroVisionAI/frontend/package.json)
Dependencies including `axios`, `framer-motion`, `react-router-dom`, `recharts`, `lucide-react`.
#### [NEW] [tailwind.config.js](file:///e:/tekworks_projects/AgroVisionAI/frontend/tailwind.config.js)
Tailwind configuration for the dark futuristic AI and green agriculture theme.
#### [NEW] [App.jsx](file:///e:/tekworks_projects/AgroVisionAI/frontend/src/App.jsx)
Routing logic and main layout wrapper.
#### [NEW] [Home.jsx](file:///e:/tekworks_projects/AgroVisionAI/frontend/src/pages/Home.jsx)
Landing page with hero section and AI glowing effects.
#### [NEW] [DiseaseDetection.jsx](file:///e:/tekworks_projects/AgroVisionAI/frontend/src/pages/DiseaseDetection.jsx)
Page to upload plant images or open the camera and receive predictions.
#### [NEW] [YieldPrediction.jsx](file:///e:/tekworks_projects/AgroVisionAI/frontend/src/pages/YieldPrediction.jsx)
Form to input environmental data and receive yield predictions.
#### [NEW] [Dashboard.jsx](file:///e:/tekworks_projects/AgroVisionAI/frontend/src/pages/Dashboard.jsx)
Dashboard with Recharts to display statistics.
#### [NEW] [vercel.json](file:///e:/tekworks_projects/AgroVisionAI/frontend/vercel.json)

## Verification Plan

### Automated Tests
1. Verify FastAPI server starts without errors: `uvicorn app.main:app --reload`
2. Verify React Vite development server starts without errors: `npm run dev`
3. Send test requests to the API endpoints using the frontend UI and `axios` to ensure the models return valid mock/real predictions.
4. Verify MongoDB connection status.

### Manual Verification
1. Open the frontend in the browser and navigate through all pages (Home, Disease, Yield, Dashboard, Auth).
2. Test the file upload component by uploading a dummy leaf image.
3. Test the camera access functionality.
4. Verify the UI is mobile-responsive and matches the "dark futuristic AI" theme requirement.
5. Review the recommendations provided by the mock ML model in the results page.
