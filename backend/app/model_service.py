"""
Loads the trained models + results once at startup and does the predictions.

Kept separate from main.py so the API routes stay short and this logic can
be tested on its own.
"""
import json
import os
from pathlib import Path

import joblib
import pandas as pd
import yaml

# Repo root = two folders above this file (backend/app/ -> churn-uplift/)
REPO_ROOT = Path(__file__).resolve().parents[2]
MODEL_DIR = Path(os.getenv("MODEL_DIR", REPO_ROOT / "ml" / "models"))
RESULTS_DIR = Path(os.getenv("RESULTS_DIR", REPO_ROOT / "ml" / "results"))
DEMO_DATA = Path(os.getenv("DEMO_DATA", REPO_ROOT / "backend" / "data" / "demo_customers.csv"))
PARAMS_PATH = Path(os.getenv("PARAMS_PATH", REPO_ROOT / "params.yaml"))

# Must match ml/preprocess.py FEATURE_COLS (same order as training)
FEATURE_COLS = [
    "tenure", "MonthlyCharges", "TotalCharges", "SeniorCitizen",
    "gender", "Partner", "Dependents", "PhoneService", "MultipleLines",
    "InternetService", "OnlineSecurity", "OnlineBackup", "DeviceProtection",
    "TechSupport", "StreamingTV", "StreamingMovies", "Contract",
    "PaperlessBilling", "PaymentMethod",
]


def _read_json(name: str) -> dict:
    with open(RESULTS_DIR / name) as f:
        return json.load(f)


class ModelService:
    def __init__(self) -> None:
        self.churn_model = joblib.load(MODEL_DIR / "best_churn_model.joblib")
        uplift = joblib.load(MODEL_DIR / "uplift_model.joblib")
        self.uplift_treated, self.uplift_control = uplift["treated"], uplift["control"]
        self.uplift_name = uplift.get("name", "T-learner")

        with open(PARAMS_PATH) as f:
            params = yaml.safe_load(f)
        self.offer_cost = params["business"]["offer_cost"]
        self.clv_months = params["business"]["clv_months"]
        self.low_risk = params["decision"]["low_risk_threshold"]

        self.classical = _read_json("classical_metrics.json")
        self.uplift_metrics = _read_json("uplift_metrics.json")
        self.roi = _read_json("roi_results.json")
        self.shap = _read_json("shap_importance.json")

        # Demo customers (the 1,409 test customers, already scored)
        self.customers = pd.read_csv(DEMO_DATA)
        self._add_decisions(self.customers)

    # ---------- core scoring ----------
    def score(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add churn_prob + uplift_score columns for a DataFrame of customers."""
        X = df[FEATURE_COLS]
        out = df.copy()
        out["churn_prob"] = self.churn_model.predict_proba(X)[:, 1]
        out["uplift_score"] = (self.uplift_treated.predict_proba(X)[:, 1]
                               - self.uplift_control.predict_proba(X)[:, 1])
        self._add_decisions(out)
        return out

    def _add_decisions(self, df: pd.DataFrame) -> None:
        df["customer_value"] = df["MonthlyCharges"] * self.clv_months
        df["expected_offer_profit"] = df["uplift_score"] * df["customer_value"] - self.offer_cost
        decided = [self.decide(p, u, e) for p, u, e in
                   zip(df["churn_prob"], df["uplift_score"], df["expected_offer_profit"])]
        df["recommended_action"] = [d[0] for d in decided]
        df["reason"] = [d[1] for d in decided]

    def decide(self, churn_prob: float, uplift: float, exp_profit: float) -> tuple[str, str]:
        """
        Simple, explainable decision rules (checked in order):
          1. negative uplift   -> don't contact (offer may make them leave)
          2. low churn risk    -> no action (they will probably stay anyway)
          3. offer pays off    -> send offer
          4. otherwise         -> high risk but offer won't pay off -> other action
        """
        if uplift < 0:
            return ("Do not contact",
                    "Offer is predicted to backfire for this customer (a 'sleeping dog').")
        if churn_prob < self.low_risk:
            return ("No action needed",
                    f"Low churn risk ({churn_prob:.0%}); they are likely to stay without an offer.")
        if exp_profit > 0:
            return ("Send retention offer",
                    f"Expected gain ${exp_profit + self.offer_cost:,.0f} is more than the ${self.offer_cost} offer cost.")
        return ("Try non-discount retention",
                "High risk, but a discount is unlikely to pay off. Consider a service call or fixing the root problem.")

    def predict_one(self, features: dict) -> dict:
        row = dict(features)
        if row.get("TotalCharges") is None:  # friendly default for the web form
            row["TotalCharges"] = row["MonthlyCharges"] * row["tenure"]
        r = self.score(pd.DataFrame([row])).iloc[0]
        p = float(r["churn_prob"])
        return {
            "churn_probability": round(p, 4),
            "uplift_score": round(float(r["uplift_score"]), 4),
            "customer_value": round(float(r["customer_value"]), 2),
            "expected_offer_profit": round(float(r["expected_offer_profit"]), 2),
            "risk_level": "High" if p >= 0.6 else ("Medium" if p >= self.low_risk else "Low"),
            "recommended_action": r["recommended_action"],
            "reason": r["reason"],
        }

    # ---------- data for the dashboard ----------
    def summary(self) -> dict:
        c = self.customers
        by_contract = (c.groupby("Contract")["Churn"].mean().round(4).to_dict())
        tenure_groups = pd.cut(c["tenure"], [-1, 6, 12, 24, 48, 100],
                               labels=["0-6", "7-12", "13-24", "25-48", "49+"])
        by_tenure = c.groupby(tenure_groups, observed=True)["Churn"].mean().round(4)
        return {
            "n_customers": int(len(c)),
            "churn_rate": round(float(c["Churn"].mean()), 4),
            "avg_monthly_charges": round(float(c["MonthlyCharges"].mean()), 2),
            "best_model": self.classical["best_model"],
            "best_model_auc": self.classical["models"][self.classical["best_model"]]["roc_auc"],
            "churn_by_contract": by_contract,
            "churn_by_tenure": {str(k): float(v) for k, v in by_tenure.items()},
            "top_drivers": self.shap["top_features"][:10],
            "action_counts": c["recommended_action"].value_counts().to_dict(),
        }
