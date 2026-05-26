from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, predict, history, dashboard, assistant
from app.database import test_connection

app = FastAPI(
    title="AgroVision AI API",
    description="Smart Crop Disease Detection & Yield Prediction System",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for demo purposes, restrict in production
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await test_connection()

@app.get("/")
def read_root():
    return {"message": "Welcome to AgroVision AI Backend!"}

from fastapi.responses import JSONResponse
import traceback

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "traceback": traceback.format_exc()}
    )

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(predict.router, prefix="/predict", tags=["Predictions"])
app.include_router(history.router, prefix="/history", tags=["History"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(assistant.router, prefix="/assistant", tags=["Assistant"])