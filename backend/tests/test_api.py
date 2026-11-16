"""
Basic API tests. Run from the project root:
    pytest backend/tests -v
"""
from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)

# A typical high-risk customer: new, month-to-month, fiber, electronic check
RISKY = {
    "tenure": 2, "Contract": "Month-to-month", "InternetService": "Fiber optic",
    "PaymentMethod": "Electronic check", "MonthlyCharges": 85.0,
}
# A typical safe customer: long tenure, two-year contract, auto-pay
SAFE = {
    "tenure": 60, "Contract": "Two year", "InternetService": "DSL",
    "PaymentMethod": "Credit card (automatic)", "MonthlyCharges": 55.0,
    "OnlineSecurity": "Yes", "TechSupport": "Yes", "Partner": "Yes",
}


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_predict_returns_all_fields():
    r = client.post("/predict", json=RISKY)
    assert r.status_code == 200
    body = r.json()
    for key in ["churn_probability", "uplift_score", "recommended_action", "reason", "risk_level"]:
        assert key in body
    assert 0 <= body["churn_probability"] <= 1


def test_risky_customer_scores_higher_than_safe():
    risky = client.post("/predict", json=RISKY).json()["churn_probability"]
    safe = client.post("/predict", json=SAFE).json()["churn_probability"]
    assert risky > 0.5 > safe


def test_predict_rejects_bad_input():
    r = client.post("/predict", json={"Contract": "Ten year"})  # not an allowed value
    assert r.status_code == 422


def test_customers_sorted_and_paginated():
    r = client.get("/customers", params={"sort_by": "churn_prob", "limit": 10})
    assert r.status_code == 200
    items = r.json()["items"]
    assert len(items) == 10
    probs = [c["churn_prob"] for c in items]
    assert probs == sorted(probs, reverse=True)


def test_metrics_and_summary():
    m = client.get("/metrics").json()
    assert {"classical", "uplift", "roi"} <= m.keys()
    assert m["uplift"]["simulated"] is True
    s = client.get("/summary").json()
    assert 0.2 < s["churn_rate"] < 0.35
    assert len(s["top_drivers"]) > 0
