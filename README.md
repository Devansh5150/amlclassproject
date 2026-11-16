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
- **IBM Telco Customer Churn** (public, [IBM GitHub](https://github.com/IBM/telco-customer-churn-on-icp4d)): 7,043 customers, 21 columns.
- Each row is one customer: demographics, services, contract/billing details, tenure, and `Churn` (Yes/No).
- **Churn rate: 26.5%** (imbalanced: about 3 stayers for every churner).

**Get the data** (raw CSV is not committed to git):
```bash
python ml/download_data.py   # downloads to data/raw/telco_churn.csv
python ml/preprocess.py      # cleans it  -> data/processed/telco_clean.csv
```

**Cleaning** (`ml/preprocess.py`):
- `TotalCharges` is stored as text, with 11 blanks. All 11 are new customers (tenure = 0), so they are set to 0.
- "No internet service" / "No phone service" are merged into "No" (the base-service columns already record this).
- `Churn` is converted from Yes/No to 1/0.
- Encoding (one-hot) and scaling (StandardScaler) happen inside the model pipeline and are fitted on training data only, to avoid data leakage.

**EDA highlights** (`notebooks/01_eda.ipynb`, charts in `notebooks/figures/`):
| Finding | Churn rate |
|---|---|
| Month-to-month vs two-year contract | 43% vs 3% |
| Tenure 0–6 months vs 49–72 months | 53% vs 10% |
| Fiber optic vs DSL internet | 42% vs 19% |
| Electronic check vs automatic payment | 45% vs 15–17% |
| No tech support vs has tech support | 31% vs 15% |

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
