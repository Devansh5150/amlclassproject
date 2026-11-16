# Customer Churn Prediction with Simple Uplift Extension

**Group 11 · Track 3 Project Showcase · Topic A**

## 1. Problem
Telecom companies lose revenue when customers leave (churn). We:
1. Predict **who is likely to churn** using classical ML models.
2. Extend this with a basic **uplift model** that predicts **who will actually respond to a retention offer**.
3. Compare the two targeting strategies and give a **business recommendation** with ROI.

> ⚠️ **Note on uplift data:** the IBM Telco dataset has no real "treatment" column.
> The retention-offer flag and its effect on churn are **SIMULATED** with clearly
> documented assumptions (see Phase 4). Results from the uplift part show how the
> method works. They are not real campaign results.

## 2. Dataset
- IBM Telco Customer Churn (public): about 7,000 customers, 21 columns. *(Details added in Phase 2.)*

## 3. Tech Stack
| Layer    | Tools |
|----------|-------|
| ML       | Python, pandas, scikit-learn, XGBoost, SHAP, scikit-uplift |
| Backend  | FastAPI |
| Frontend | React (Vite) + Recharts |
| Deploy   | Vercel (frontend), Render (backend) |

## 4. Project Structure
```
churn-uplift/
  data/          raw + processed data (raw is git-ignored)
  notebooks/     EDA and experiments
  ml/            training + evaluation scripts, saved models
  backend/       FastAPI app
  frontend/      React app
  README.md
```

## 5. Setup
```bash
# Python 3.12 virtual environment
py -3.12 -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux
pip install -r requirements.txt
```
*(Run instructions for the backend and frontend will be added in later phases.)*

## 6. Results
*(Added in Phases 3–5.)*

## 7. Business Recommendation
*(Added in Phase 5.)*

## 8. Screenshots & Demo
*(Added in Phase 8.)*
