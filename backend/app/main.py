"""
FastAPI backend for the Robic customer-retention demo.
(Robic is a FICTIONAL company; its customers are real anonymous IBM Telco records
with generated fake names.)

Endpoints
  GET  /health                 is the API up and are models loaded?
  GET  /summary                dashboard numbers for all Robic customers
  GET  /customers              customer list: search, filter, sort, pages
  GET  /customers/{id}         one customer: chance of staying, reasons, action
  POST /predict                score any customer details -> churn prob, uplift, action
  GET  /metrics                model comparison (classical, uplift, ROI)

Run locally from the project root:
    uvicorn backend.app.main:app --reload
Interactive docs: http://127.0.0.1:8000/docs
"""
import os
from typing import Literal, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .model_service import ModelService
from .schemas import CustomerFeatures, PredictionResponse

app = FastAPI(
    title="Robic Retention API",
    description="Customer churn prediction with a simple uplift extension for the fictional "
                "company Robic. Uplift results use SIMULATED retention-offer data.",
    version="2.0.0",
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

# Load models + customer data ONCE when the server starts (not on every request).
service = ModelService()


@app.get("/health")
def health():
    return {"status": "ok", "models_loaded": True, "customers": len(service.customers)}


@app.get("/summary")
def summary():
    return service.summary()


@app.get("/customers")
def customers(
    q: str = Query("", description="Search by name or customer ID"),
    risk: Optional[Literal["High", "Medium", "Low"]] = None,
    contract: Optional[Literal["Month-to-month", "One year", "Two year"]] = None,
    action: Optional[str] = None,
    sort_by: Literal["churn_prob", "chance_of_staying", "uplift_score", "expected_offer_profit",
                     "MonthlyCharges", "tenure", "name"] = "churn_prob",
    descending: bool = True,
    limit: int = Query(25, ge=1, le=10000),
    offset: int = Query(0, ge=0),
):
    """Robic's customers. Default: most at-risk first."""
    return service.list_customers(q, risk, contract, action, sort_by, descending, limit, offset)


@app.get("/customers/{customer_id}")
def customer_detail(customer_id: str):
    c = service.get_customer(customer_id)
    if c is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return c


@app.post("/predict", response_model=PredictionResponse)
def predict(customer: CustomerFeatures):
    return service.predict_one(customer.model_dump())


@app.get("/metrics")
def metrics():
    return {
        "classical": service.classical,
        "uplift": service.uplift_metrics,
        "roi": service.roi,              # test-set ROI (Phase 5, in the README)
        "robic_roi": service.robic_roi,  # same method on all Robic customers (used by the app)
    }
