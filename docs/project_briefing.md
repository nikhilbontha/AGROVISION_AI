# AgroVision AI – Smart Crop Disease Detection & Yield Prediction System
**Project Briefing & Presentation Outline**

This document provides a complete summary of your project, structured specifically so you can easily copy and paste the content into a PowerPoint (PPT) presentation. It covers the core features, how the system works, the pipelines, and the tech stack.

---

## Slide 1: Title Slide
- **Project Title:** AgroVision AI
- **Subtitle:** Smart Crop Disease Detection, Yield Prediction, and Market Analysis System
- **Objective:** Empowering farmers with AI-driven diagnostics, real-time weather integration, and predictive market analysis for smarter agricultural decisions.

---

## Slide 2: Project Overview & Problem Statement
- **The Problem:** Farmers often face massive crop losses due to delayed disease identification, unpredictable weather, and volatile market prices. 
- **The Solution:** AgroVision AI is an intelligent, industry-level web application that acts as a digital assistant for farmers.
- **Key Capabilities:**
  - Diagnoses crop diseases instantly from leaf images.
  - Predicts crop yield accurately based on soil, crop type, and real-time weather.
  - Recommends best practices and calculates expected profits based on live market data.

---

## Slide 3: Core Features
- 🔍 **AI Disease Detection:** Identifies crop diseases and provides confidence scores, treatment steps, and visual symptom highlighting.
- 🌾 **Yield & Profit Prediction:** Estimates total yield (tons) and calculates expected revenue, cost, and profit.
- 🌤️ **Real-Time Weather Integration:** Automatically fetches live climate data (temperature, humidity, rainfall) instead of relying on manual inputs.
- 📈 **Live Market Prices:** Pulls current market rates for crops to provide accurate financial forecasting and loss risk analysis.
- 🌍 **Multilingual Support:** Farmer-friendly UI with language translation capabilities.
- 📊 **Analytics Dashboard:** Tracks past predictions and visualizes data using interactive charts.

---

## Slide 4: Technology Stack (Tools Used)
*AgroVision AI is built on a modern, decoupled architecture.*

**Frontend (Client Side):**
- **Framework:** React.js powered by Vite (for fast builds)
- **Styling:** Tailwind CSS (responsive design) & Framer Motion (smooth animations)
- **Data Visualization:** Recharts
- **Routing & State:** React Router DOM & Context API (Language Context)

**Backend (Server Side):**
- **Framework:** FastAPI (Python) - Fast, asynchronous, and robust.
- **Authentication:** JWT (JSON Web Tokens) with Passlib bcrypt hashing.
- **Database:** MongoDB Atlas (NoSQL) accessed via the `Motor` asynchronous driver.

**Machine Learning & Data Science:**
- **Computer Vision:** TensorFlow / Keras (MobileNetV2 / EfficientNetB0 Transfer Learning), OpenCV (for image processing and highlighting infected leaf areas).
- **Yield Prediction:** Scikit-learn (Random Forest Regressor), Pandas, NumPy.

---

## Slide 5: High-Level System Architecture
1. **Client Layer:** User interacts with the React interface (uploads image or inputs crop/soil data).
2. **API Gateway:** FastAPI receives the request and validates the JWT authentication token.
3. **Processing Layer:**
   - Image requests go to the Computer Vision pipeline.
   - Yield requests fetch external data (Open-Meteo & Agmarknet) and go to the Scikit-learn pipeline.
4. **Database Layer:** All prediction results, user history, and recommendations are saved asynchronously to MongoDB.
5. **Response:** Processed insights are sent back and rendered beautifully on the React frontend.

---

## Slide 6: Pipeline 1 – Crop Disease Detection
**How it works step-by-step:**
1. **Upload & Quality Check:** Farmer uploads a leaf image. The system validates image quality.
2. **Leaf Detection (Optional):** A lightweight AI model ensures the image is actually a plant leaf.
3. **CNN Classification:** The image is preprocessed (resized to 224x224) and fed into a deep learning model (e.g., MobileNetV2 / EfficientNetB0) to classify the disease.
4. **Image Processing (OpenCV):** The backend uses HSV color masking and contours to locate brown/yellow spots, drawing bounding boxes to highlight infected areas on the leaf.
5. **Diagnostic Report:** The system maps the prediction to a database of treatments and returns the severity, top 3 predictions, and actionable advice.

---

## Slide 7: Pipeline 2 – Yield & Market Prediction
**How it works step-by-step:**
1. **User Input:** Farmer selects Crop Type, District, Soil Type, and Area (in acres).
2. **External APIs Triggered:**
   - **Weather Service:** Fetches real-time temperature, humidity, and rainfall probability for the selected district.
   - **Market Service:** Fetches current crop prices per quintal from Agmarknet.
3. **ML Prediction:** The Random Forest Regressor combines user inputs with live weather data to predict yield (tons per hectare).
4. **Financial Calculation:** Yield is multiplied by area and live market price to estimate revenue. Base farming costs are subtracted to predict **Net Profit** and **Loss Risk**.
5. **Smart Suggestions:** Generates dynamic watering and fertilizer advice based on the *real* weather forecast.

---

## Slide 8: How It Works (User Flow)
1. **Onboarding:** User registers/logs in securely.
2. **Dashboard:** Views a high-level summary of their farming history and insights.
3. **Action - Disease Detection:** Navigates to the scanner, uploads a photo, gets an instant visual report and treatment plan, which is automatically saved.
4. **Action - Yield Prediction:** Navigates to the yield calculator, enters basic farm details, and instantly receives an interactive report showing expected yield, profit margins, and weather warnings.
5. **History:** User can always refer back to past scans and predictions to track farm health over time.

---

## Slide 9: External Integrations & APIs
- **Open-Meteo API:** Used in the background to supply real-time, highly accurate localized weather data.
- **Agmarknet Data Sources:** Used to fetch deterministic, real-time agricultural market prices to calculate financial viability.
- **MongoDB Atlas:** Cloud-hosted database ensuring data is securely stored and accessible from anywhere.

---

## Slide 10: Future Scope & Enhancements
*(Good for concluding the presentation)*
- **Voice-based Interactions:** Adding voice commands for farmers who are less comfortable with text interfaces.
- **Drone Integration:** Analyzing large-scale drone imagery for entire farm disease mapping.
- **IoT Sensor Integration:** Pulling real soil moisture data instead of relying entirely on weather APIs.
- **Expanded Crop Support:** Continuously training the models on larger datasets to support a wider variety of regional crops.
