// Page 2: "Check a customer": fill a simple form, get a plain-English answer.
import { useEffect, useState } from "react";
import { api } from "../api.js";
import { ActionBadge, Card, Details, PageHeader, SimulatedNote } from "../components/ui.jsx";
import { ACTION_HELP, money, pct } from "../theme.js";

const YN = [["No", "No"], ["Yes", "Yes"]];
// [field name, question shown to the user, options as [value, label]]. No options = number box.
const MAIN_FIELDS = [
  ["tenure", "How many months have they been a customer?"],
  ["MonthlyCharges", "Monthly bill ($)"],
  ["Contract", "Contract type", [["Month-to-month", "Month-to-month"], ["One year", "1-year contract"], ["Two year", "2-year contract"]]],
  ["InternetService", "Internet", [["Fiber optic", "Fiber (fast, pricier)"], ["DSL", "DSL (basic)"], ["No", "No internet"]]],
  ["PaymentMethod", "How do they pay?", [["Electronic check", "Electronic check"], ["Mailed check", "Mailed check"], ["Bank transfer (automatic)", "Automatic bank transfer"], ["Credit card (automatic)", "Automatic credit card"]]],
  ["TechSupport", "Pays for tech support?", YN],
  ["OnlineSecurity", "Pays for online security?", YN],
];
const EXTRA_FIELDS = [
  ["PaperlessBilling", "Paperless billing?", YN],
  ["OnlineBackup", "Online backup?", YN],
  ["DeviceProtection", "Device protection?", YN],
  ["StreamingTV", "Streaming TV?", YN],
  ["StreamingMovies", "Streaming movies?", YN],
  ["PhoneService", "Phone line?", YN],
  ["MultipleLines", "Multiple phone lines?", YN],
  ["Partner", "Has a partner?", YN],
  ["Dependents", "Has children / dependents?", YN],
  ["SeniorCitizen", "Senior citizen (65+)?", [[0, "No"], [1, "Yes"]]],
  ["gender", "Gender", [["Female", "Female"], ["Male", "Male"]]],
];

const DEFAULTS = {
  tenure: 3, MonthlyCharges: 80, Contract: "Month-to-month", InternetService: "Fiber optic",
  PaymentMethod: "Electronic check", PaperlessBilling: "Yes", OnlineSecurity: "No", TechSupport: "No",
  OnlineBackup: "No", DeviceProtection: "No", StreamingTV: "No", StreamingMovies: "No",
  PhoneService: "Yes", MultipleLines: "No", Partner: "No", Dependents: "No", SeniorCitizen: 0, gender: "Female",
};
const PRESETS = {
  "🆕 New customer": DEFAULTS,
  "🏠 Loyal customer": {
    ...DEFAULTS, tenure: 60, MonthlyCharges: 55, Contract: "Two year", InternetService: "DSL",
    PaymentMethod: "Credit card (automatic)", PaperlessBilling: "No", OnlineSecurity: "Yes", TechSupport: "Yes", Partner: "Yes",
  },
};

// Turn a probability into words
function riskWords(p) {
  if (p >= 0.6) return { text: "Very likely to leave", cls: "high" };
  if (p >= 0.3) return { text: "Might leave", cls: "medium" };
  return { text: "Likely to stay", cls: "low" };
}

export default function Predictor() {
  const [form, setForm] = useState(DEFAULTS);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Send the form to the backend; numbers from <input> arrive as text, so convert them.
  async function run(values) {
    setError(null);
    try {
      setResult(await api.predict({ ...values, tenure: Number(values.tenure), MonthlyCharges: Number(values.MonthlyCharges), SeniorCitizen: Number(values.SeniorCitizen) }));
    } catch {
      setError("Couldn't check this customer. Is the app's backend running?");
    }
  }
  // Re-check automatically whenever a field changes (no "submit" button needed)
  const update = (name, value) => { const next = { ...form, [name]: value }; setForm(next); run(next); };
  useEffect(() => { run(DEFAULTS); }, []);

  const field = ([name, label, options]) => (
    <label key={name}>
      <span>{label}</span>
      {options ? (
        <select value={form[name]} onChange={(e) => update(name, e.target.value)}>
          {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      ) : (
        <input type="number" min="0" step="1" value={form[name]} onChange={(e) => update(name, e.target.value)} />
      )}
    </label>
  );

  const risk = result && riskWords(result.churn_probability);
  const helps = result && result.uplift_score > 0;

  return (
    <>
      <PageHeader title="Check a customer">
        Describe a customer and we'll tell you if they're likely to leave, and whether a $50 discount is worth it.
      </PageHeader>

      <div className="grid2 predictor">
        <Card>
          <div className="presets">
            Quick examples:
            {Object.entries(PRESETS).map(([name, p]) => (
              <button key={name} type="button" className="ghost" onClick={() => { setForm(p); run(p); }}>{name}</button>
            ))}
          </div>
          <p className="muted small-hint">The answer on the right updates as soon as you change anything.</p>
          <div className="form">{MAIN_FIELDS.map(field)}</div>
          <Details title="More details (optional)">
            <div className="form">{EXTRA_FIELDS.map(field)}</div>
          </Details>
        </Card>

        <div className="result-col">
          {error && <div className="card error">{error}</div>}
          {result && (
            <Card>
              <div className="answer">
                <div className="q">1. Will they leave?</div>
                <div className={`big ${risk.cls}`}>{risk.text}</div>
                <div className="meter"><div className={risk.cls} style={{ width: pct(result.churn_probability) }} /></div>
                <div className="muted">About <b>{Math.round(result.churn_probability * 10)} in 10</b> customers like this one leave.</div>
              </div>

              <div className="answer">
                <div className="q">2. Would a $50 discount help?</div>
                <div className="big">{helps ? (result.uplift_score > 0.05 ? "Yes" : "A little") : "No"}</div>
                <div className="muted">
                  {helps
                    ? <>It raises their chance of staying by about <b>{Math.round(result.uplift_score * 100)}%</b>.</>
                    : <>A discount is not expected to help this customer.</>}
                </div>
              </div>

              <div className="answer final">
                <div className="q">3. What should we do?</div>
                <ActionBadge action={result.recommended_action} large />
                <p>{ACTION_HELP[result.recommended_action]}</p>
                <p className="muted">Keeping this customer for a year is worth about <b>{money(result.customer_value)}</b>.</p>
              </div>
              <SimulatedNote />
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
