# 🌾 AgroVision AI – Smart Crop Disease Detection & Yield Prediction System

AgroVision AI is an intelligent, industry-level agriculture web application designed to help farmers detect crop diseases from plant leaf images and predict crop yield using machine learning. The system features a modern, futuristic, and beginner-friendly interface.

## 🚀 Features
- **Crop Disease Detection**: Scan or upload leaf images to identify diseases using a CNN deep learning model (TensorFlow/Keras).
- **Yield Prediction**: Predict crop yield based on environmental data using a Machine Learning Regressor (Scikit-learn).
- **Smart Recommendations**: Get actionable insights on disease treatment, fertilizers, and farming best practices.
- **Farmer-Friendly UI**: A simple, mobile-responsive interface built with React, Tailwind CSS, and Framer Motion.
- **Robust Backend**: Fast and async APIs powered by FastAPI and MongoDB Atlas.
- **Dashboard & History**: Track your past predictions and visualize data analytics.

## 🛠️ Tech Stack
- **Frontend**: React.js, Vite, Tailwind CSS, Framer Motion, Axios, Recharts
- **Backend**: FastAPI, Python, Motor (MongoDB async driver), JWT Authentication
- **Machine Learning**: TensorFlow/Keras (MobileNetV2 Transfer Learning), Scikit-learn (Random Forest / XGBoost Regressor)
- **Database**: MongoDB Atlas
- **Deployment**: Vercel (Frontend), Render/Docker (Backend)

## 📂 Project Structure
```
AgroVisionAI/
│
├── backend/               # FastAPI backend
│   ├── app/               # Application code
│   │   ├── routes/        # API endpoints
│   │   ├── models/        # Database models
│   │   ├── schemas/       # Pydantic schemas for validation
│   │   └── main.py        # Entry point
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/              # React frontend
│   ├── src/               # React components and pages
│   ├── package.json
│   └── tailwind.config.js
│
├── ml_models/             # Machine Learning scripts and models
│   ├── disease_detection/
│   └── yield_prediction/
│
├── datasets/              # Placeholder for datasets
├── notebooks/             # Jupyter notebooks for model exploration
└── docker-compose.yml     # Docker compose for running the full stack locally
```

## ⚙️ Installation & Setup

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create a .env file with your MONGO_URI
echo "MONGO_URI=your_mongodb_connection_string" > .env
echo "JWT_SECRET=your_jwt_secret" >> .env

# Run the server
uvicorn app.main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
# Run the development server
npm run dev
```

### 3. Docker Setup
You can also run the entire application using Docker:
```bash
docker-compose up --build
```

## 📜 API Documentation
Once the backend is running, the interactive Swagger API documentation is available at:
`http://localhost:8000/docs`

## 👨‍🌾 Future Scope
- Voice-based interactions for easier accessibility.
- Drone image integration for large-scale farm analysis.
- Multi-language support for regional farmers.