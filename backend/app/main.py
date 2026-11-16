"""
FastAPI backend for the Churn + Uplift demo.

Endpoints
  GET  /health      is the API up and are models loaded?
  GET  /summary     dashboard numbers (churn rate, top drivers, ...)
  GET  /customers   demo customers ranked by uplift / churn risk / profit
  POST /predict     score one customer -> churn prob, uplift, recommended action
  GET  /metrics     model comparison (classical, uplift, ROI)

Run locally from the project root:
    uvicorn backend.app.main:app --reload
Interactive docs: http://127.0.0.1:8000/docs
"""
import os
from typing import Literal

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from .model_service import ModelService
from .schemas import CustomerFeatures, PredictionResponse

app = FastAPI(
    title="Churn + Uplift API",
    description="Customer churn prediction with a simple uplift extension. "
                "Uplift results use SIMULATED retention-offer data.",
    version="1.0.0",
)

# CORS: lets the React frontend (a different address/port) call this API.
# Set CORS_ORIGINS="https://my-app.vercel.app" in production.
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models ONCE when the server starts (not on every request).
service = ModelService()


@app.get("/health")
def health():
    return {"status": "ok", "models_loaded": True, "customers": len(service.customers)}


@app.get("/summary")
def summary():
    return service.summary()


@app.get("/customers")
def customers(
    sort_by: Literal["uplift_score", "churn_prob", "expected_offer_profit"] = "uplift_score",
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    """Demo customers (held-out test set), highest score first."""
    df = service.customers.sort_values(sort_by, ascending=False)
    page = df.iloc[offset: offset + limit]
    cols = ["customerID", "Contract", "tenure", "InternetService", "PaymentMethod",
            "MonthlyCharges", "churn_prob", "uplift_score", "customer_value",
            "expected_offer_profit", "recommended_action"]
    return {
        "total": int(len(df)),
        "sort_by": sort_by,
        "offer_cost": service.offer_cost,
        "items": page[cols].round(4).to_dict(orient="records"),
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(customer: CustomerFeatures):
    return service.predict_one(customer.model_dump())


@app.get("/metrics")
def metrics():
    return {
        "classical": service.classical,
        "uplift": service.uplift_metrics,
        "roi": service.roi,
    }
