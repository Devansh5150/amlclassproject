import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import {
  ActionBadge,
  Card,
  Details,
  PageHeader,
  SimulatedNote
} from "../components/ui.jsx";
import {
  ZapIcon,
  SparklesIcon,
  CheckIcon,
  AlertTriangleIcon,
  DollarSignIcon
} from "../components/icons.jsx";
import { ACTION_HELP, money, pct } from "../theme.js";

const YN = [
  ["No", "No"],
  ["Yes", "Yes"],
];

const MAIN_FIELDS = [
  ["tenure", "Tenure (Months Subscribed)"],
  ["MonthlyCharges", "Monthly Recurring Charge ($)"],
  [
    "Contract",
    "Contract Term",
    [
      ["Month-to-month", "Month-to-month"],
      ["One year", "1-Year Term"],
      ["Two year", "2-Year Term"],
    ],
  ],
  [
    "InternetService",
    "Broadband Service",
    [
      ["Fiber optic", "Fiber Optic (Fast, higher tier)"],
      ["DSL", "DSL (Standard)"],
      ["No", "No Internet Service"],
    ],
  ],
  [
    "PaymentMethod",
    "Payment / Billing Method",
    [
      ["Electronic check", "Electronic Check"],
      ["Mailed check", "Mailed Check"],
      ["Bank transfer (automatic)", "Automatic Bank Transfer"],
      ["Credit card (automatic)", "Automatic Credit Card"],
    ],
  ],
  ["TechSupport", "Tech Support Add-on", YN],
  ["OnlineSecurity", "Cyber Security Add-on", YN],
];

const EXTRA_FIELDS = [
  ["PaperlessBilling", "Paperless Billing", YN],
  ["OnlineBackup", "Cloud Backup", YN],
  ["DeviceProtection", "Device Protection Plan", YN],
  ["StreamingTV", "Streaming TV Package", YN],
  ["StreamingMovies", "Streaming Movies Package", YN],
  ["PhoneService", "Voice / Phone Line", YN],
  ["MultipleLines", "Multiple Phone Lines", YN],
  ["Partner", "Has Partner", YN],
  ["Dependents", "Has Children / Dependents", YN],
  [
    "SeniorCitizen",
    "Senior Citizen (Age 65+)",
    [
      [0, "No"],
      [1, "Yes"],
    ],
  ],
  [
    "gender",
    "Subscriber Gender",
    [
      ["Female", "Female"],
      ["Male", "Male"],
    ],
  ],
];

const DEFAULTS = {
  tenure: 3,
  MonthlyCharges: 80,
  Contract: "Month-to-month",
  InternetService: "Fiber optic",
  PaymentMethod: "Electronic check",
  PaperlessBilling: "Yes",
  OnlineSecurity: "No",
  TechSupport: "No",
  OnlineBackup: "No",
  DeviceProtection: "No",
  StreamingTV: "No",
  StreamingMovies: "No",
  PhoneService: "Yes",
  MultipleLines: "No",
  Partner: "No",
  Dependents: "No",
  SeniorCitizen: 0,
  gender: "Female",
};

const PRESETS = {
  "⚡ High-Risk New User": DEFAULTS,
  "🛡️ Long-Tenure Loyalist": {
    ...DEFAULTS,
    tenure: 60,
    MonthlyCharges: 55,
    Contract: "Two year",
    InternetService: "DSL",
    PaymentMethod: "Credit card (automatic)",
    PaperlessBilling: "No",
    OnlineSecurity: "Yes",
    TechSupport: "Yes",
    Partner: "Yes",
  },
  "💼 Family Bundle": {
    ...DEFAULTS,
    tenure: 24,
    MonthlyCharges: 105,
    Contract: "One year",
    InternetService: "Fiber optic",
    MultipleLines: "Yes",
    Partner: "Yes",
    Dependents: "Yes",
    StreamingTV: "Yes",
    StreamingMovies: "Yes",
    TechSupport: "Yes",
    PaymentMethod: "Bank transfer (automatic)",
  },
};

function riskWords(p) {
  if (p >= 0.6) return { text: "Critical Departure Risk", cls: "high", sub: "Highly likely to cancel service without intervention" };
  if (p >= 0.3) return { text: "Moderate Churn Risk", cls: "medium", sub: "May defect if competitors offer promotional incentives" };
  return { text: "Stable Account Retention", cls: "low", sub: "High organic retention probability" };
}

export default function Predictor() {
  const [form, setForm] = useState(DEFAULTS);
  const [activePreset, setActivePreset] = useState("⚡ High-Risk New User");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function run(values) {
    setError(null);
    try {
      const res = await api.predict({
        ...values,
        tenure: Number(values.tenure),
        MonthlyCharges: Number(values.MonthlyCharges),
        SeniorCitizen: Number(values.SeniorCitizen),
      });
      setResult(res);
    } catch {
      setError("Unable to score profile. Verify that the FastAPI backend is running.");
    }
  }

  const update = (name, value) => {
    setActivePreset(null);
    const next = { ...form, [name]: value };
    setForm(next);
    run(next);
  };

  useEffect(() => {
    run(DEFAULTS);
  }, []);

  const field = ([name, label, options]) => (
    <label key={name}>
      <span>{label}</span>
      {options ? (
        <select value={form[name]} onChange={(e) => update(name, e.target.value)}>
          {options.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="number"
          min="0"
          step="1"
          value={form[name]}
          onChange={(e) => update(name, e.target.value)}
        />
      )}
    </label>
  );

  const risk = result && riskWords(result.churn_probability);
  const helps = result && result.uplift_score > 0;

  return (
    <>
      <PageHeader
        badge="Real-Time Inference Engine"
        title="Interactive Subscriber Simulator"
      >
        Configure arbitrary subscriber attributes and receive immediate machine learning churn predictions and causal action directives.
      </PageHeader>

      <div className="grid2 predictor">
        <Card title="Account Profile & Plan Attributes">
          <div className="presets-bar">
            <span className="presets-label">Preset Profiles:</span>
            {Object.entries(PRESETS).map(([name, p]) => (
              <button
                key={name}
                type="button"
                className={`preset-chip ${activePreset === name ? "primary" : ""}`}
                onClick={() => {
                  setActivePreset(name);
                  setForm(p);
                  run(p);
                }}
              >
                {name}
              </button>
            ))}
          </div>

          <p className="note" style={{ marginTop: 0, marginBottom: "16px" }}>
            ⚡ Machine learning scores re-evaluate dynamically in real time with each keystroke.
          </p>

          <div className="form-grid">{MAIN_FIELDS.map(field)}</div>

          <Details title="Secondary Account & Demographic Attributes (Optional)">
            <div className="form-grid">{EXTRA_FIELDS.map(field)}</div>
          </Details>
        </Card>

        <div className="result-col">
          {error && <div className="card error-card">{error}</div>}
          {result && (
            <Card className="prediction-result-card" title="Machine Learning Inference Report">
              <div className="prediction-box">
                <div className="prediction-eyebrow">1. Churn Risk Probability</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div className={`prediction-big-text ${risk.cls}`}>
                    {risk.text}
                  </div>
                  <span style={{ fontSize: "20px", fontWeight: 800 }}>
                    {pct(result.churn_probability)}
                  </span>
                </div>
                <div className="meter big">
                  <div
                    className={`meter-fill ${risk.cls}`}
                    style={{ width: pct(result.churn_probability) }}
                  />
                </div>
                <div className="muted" style={{ fontSize: "13px" }}>
                  Cohort survival expectation: <b>{Math.round(result.churn_probability * 10)} out of 10</b> subscribers with this profile churn within 30 days.
                </div>
              </div>

              <div className="prediction-box">
                <div className="prediction-eyebrow">2. Causal Uplift Sensitivity ($50 Discount)</div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    margin: "4px 0 8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "22px",
                      fontWeight: 800,
                      color: helps ? "#059669" : "#64748b",
                    }}
                  >
                    {helps ? (result.uplift_score > 0.05 ? "High Treatment Lift" : "Marginal Lift") : "Zero Treatment Impact"}
                  </span>
                  {helps && (
                    <span
                      style={{
                        background: "#ecfdf5",
                        color: "#059669",
                        border: "1px solid #a7f3d0",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontWeight: 700,
                        fontSize: "12.5px",
                      }}
                    >
                      +{Math.round(result.uplift_score * 100)}% Lift
                    </span>
                  )}
                </div>
                <div className="muted" style={{ fontSize: "13px" }}>
                  {helps ? (
                    <>
                      Providing a $50 discount concession is estimated to reduce churn by approximately{" "}
                      <b>{Math.round(result.uplift_score * 100)} percentage points</b>.
                    </>
                  ) : (
                    "This account exhibits low elasticity to monetary discounting. Offering concessions would dilute margin without preventing departure."
                  )}
                </div>
              </div>

              <div className="prediction-box">
                <div className="prediction-eyebrow">3. Optimal Prescribed Action</div>
                <div style={{ margin: "8px 0 12px" }}>
                  <ActionBadge action={result.recommended_action} large />
                </div>
                <p style={{ fontSize: "13.5px", lineHeight: "1.55", color: "var(--text-main)" }}>
                  {ACTION_HELP[result.recommended_action]}
                </p>
                <div
                  style={{
                    marginTop: "12px",
                    padding: "10px 14px",
                    background: "var(--bg-subtle)",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    fontSize: "13px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span className="muted">Estimated Annual Subscriber Value:</span>
                  <b style={{ color: "var(--text-main)", fontSize: "15px" }}>
                    {money(result.customer_value)} / year
                  </b>
                </div>
              </div>

              <SimulatedNote />
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
