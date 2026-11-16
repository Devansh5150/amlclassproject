// Page 2: Single-customer predictor form -> POST /predict
import { useEffect, useState } from "react";
import { api } from "../api.js";
import { ActionBadge, Card } from "../components/ui.jsx";
import { money, pct } from "../theme.js";

const YN = ["No", "Yes"];
// Form fields: [name, label, options]. Options = dropdown, otherwise a number box.
const FIELDS = [
  ["tenure", "Tenure (months)"],
  ["MonthlyCharges", "Monthly charges ($)"],
  ["Contract", "Contract", ["Month-to-month", "One year", "Two year"]],
  ["InternetService", "Internet service", ["Fiber optic", "DSL", "No"]],
  ["PaymentMethod", "Payment method", ["Electronic check", "Mailed check", "Bank transfer (automatic)", "Credit card (automatic)"]],
  ["PaperlessBilling", "Paperless billing", YN],
  ["OnlineSecurity", "Online security", YN],
  ["TechSupport", "Tech support", YN],
  ["OnlineBackup", "Online backup", YN],
  ["DeviceProtection", "Device protection", YN],
  ["StreamingTV", "Streaming TV", YN],
  ["StreamingMovies", "Streaming movies", YN],
  ["PhoneService", "Phone service", YN],
  ["MultipleLines", "Multiple lines", YN],
  ["Partner", "Has partner", YN],
  ["Dependents", "Has dependents", YN],
  ["SeniorCitizen", "Senior citizen", [0, 1]],
  ["gender", "Gender", ["Female", "Male"]],
];

const DEFAULTS = {
  tenure: 3, MonthlyCharges: 80, Contract: "Month-to-month", InternetService: "Fiber optic",
  PaymentMethod: "Electronic check", PaperlessBilling: "Yes", OnlineSecurity: "No", TechSupport: "No",
  OnlineBackup: "No", DeviceProtection: "No", StreamingTV: "No", StreamingMovies: "No",
  PhoneService: "Yes", MultipleLines: "No", Partner: "No", Dependents: "No", SeniorCitizen: 0, gender: "Female",
};

// Two example customers to make the demo quick
const PRESETS = {
  "Risky new customer": DEFAULTS,
  "Loyal long-term customer": {
    ...DEFAULTS, tenure: 60, MonthlyCharges: 55, Contract: "Two year", InternetService: "DSL",
    PaymentMethod: "Credit card (automatic)", PaperlessBilling: "No", OnlineSecurity: "Yes", TechSupport: "Yes", Partner: "Yes",
  },
};

export default function Predictor() {
  const [form, setForm] = useState(DEFAULTS);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (name, value) => setForm({ ...form, [name]: value });

  // Send the form to the backend; numbers from <input> arrive as text, so convert them.
  async function run(values) {
    setLoading(true); setError(null);
    try {
      setResult(await api.predict({ ...values, tenure: Number(values.tenure), MonthlyCharges: Number(values.MonthlyCharges), SeniorCitizen: Number(values.SeniorCitizen) }));
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }
  const submit = (e) => { e.preventDefault(); run(form); };

  // Score the example customer once when the page opens (handy for the demo)
  useEffect(() => { run(DEFAULTS); }, []);

  return (
    <>
      <h1>Predict a single customer</h1>
      <p className="lead">Enter a customer's details to get their churn risk, how much a retention offer would help, and what to do.</p>
      <div className="grid2 predictor">
        <Card>
          <div className="presets">
            Try:{" "}
            {Object.entries(PRESETS).map(([name, p]) => (
              <button key={name} type="button" className="ghost" onClick={() => { setForm(p); run(p); }}>{name}</button>
            ))}
          </div>
          <form onSubmit={submit} className="form">
            {FIELDS.map(([name, label, options]) => (
              <label key={name}>
                <span>{label}</span>
                {options ? (
                  <select value={form[name]} onChange={(e) => update(name, e.target.value)}>
                    {options.map((o) => <option key={o} value={o}>{name === "SeniorCitizen" ? (o ? "Yes" : "No") : o}</option>)}
                  </select>
                ) : (
                  <input type="number" min="0" step={name === "tenure" ? 1 : 0.01} value={form[name]} onChange={(e) => update(name, e.target.value)} required />
                )}
              </label>
            ))}
            <button type="submit" className="primary" disabled={loading}>{loading ? "Scoring…" : "Predict"}</button>
          </form>
        </Card>

        <div>
          {error && <div className="card error">{error}</div>}
          {!result && !error && <Card><p className="muted">Fill in the form and press <b>Predict</b>.</p></Card>}
          {result && (
            <Card title="Result">
              <div className="result-hero">
                <div>
                  <div className="stat-label">Churn probability</div>
                  <div className="hero-number">{pct(result.churn_probability)}</div>
                  <div className="meter"><div style={{ width: pct(result.churn_probability) }} /></div>
                  <div className="stat-note">{result.risk_level} risk</div>
                </div>
              </div>
              <div className="stats small">
                <div className="stat">
                  <div className="stat-label">Uplift from offer</div>
                  <div className="stat-value">{result.uplift_score >= 0 ? "+" : ""}{(result.uplift_score * 100).toFixed(1)} pts</div>
                  <div className="stat-note">change in chance of staying*</div>
                </div>
                <div className="stat">
                  <div className="stat-label">Customer value</div>
                  <div className="stat-value">{money(result.customer_value)}</div>
                  <div className="stat-note">12 × monthly bill</div>
                </div>
                <div className="stat">
                  <div className="stat-label">Expected offer profit</div>
                  <div className="stat-value">{money(result.expected_offer_profit)}</div>
                  <div className="stat-note">uplift × value − $50</div>
                </div>
              </div>
              <div className="recommend">
                <div className="stat-label">Recommended action</div>
                <ActionBadge action={result.recommended_action} />
                <p>{result.reason}</p>
              </div>
              <p className="footnote">* Uplift model trained on simulated offer data.</p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
