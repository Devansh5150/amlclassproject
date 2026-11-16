import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import {
  ActionBadge,
  Card,
  Loading,
  RiskBadge,
  SimulatedNote,
  StayBar,
  useApi
} from "../components/ui.jsx";
import {
  ChevronLeftIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  DollarSignIcon,
  SparklesIcon,
  CheckIcon
} from "../components/icons.jsx";
import { ACTION_HELP, money, pct } from "../theme.js";

const FEATURES = [
  "tenure",
  "MonthlyCharges",
  "TotalCharges",
  "SeniorCitizen",
  "gender",
  "Partner",
  "Dependents",
  "PhoneService",
  "MultipleLines",
  "InternetService",
  "OnlineSecurity",
  "OnlineBackup",
  "DeviceProtection",
  "TechSupport",
  "StreamingTV",
  "StreamingMovies",
  "Contract",
  "PaperlessBilling",
  "PaymentMethod",
];

const WHAT_IFS = [
  {
    label: "Upgrade to 1-Year Contract Term",
    applies: (c) => c.Contract === "Month-to-month",
    change: { Contract: "One year" },
  },
  {
    label: "Upgrade to 2-Year Contract Term",
    applies: (c) => c.Contract !== "Two year",
    change: { Contract: "Two year" },
  },
  {
    label: "Bundle Dedicated Tech Support",
    applies: (c) => c.TechSupport === "No" && c.InternetService !== "No",
    change: { TechSupport: "Yes" },
  },
  {
    label: "Provision Security & Threat Protection",
    applies: (c) => c.OnlineSecurity === "No" && c.InternetService !== "No",
    change: { OnlineSecurity: "Yes" },
  },
  {
    label: "Enroll in Auto-Pay (Credit Card)",
    applies: (c) => !c.PaymentMethod.includes("automatic"),
    change: { PaymentMethod: "Credit card (automatic)" },
  },
];

const SERVICES = [
  ["Contract", "Contract Term"],
  ["InternetService", "Internet Tier"],
  ["PhoneService", "Voice Line"],
  ["MultipleLines", "Multiple Lines"],
  ["OnlineSecurity", "Cyber Security"],
  ["OnlineBackup", "Cloud Backup"],
  ["DeviceProtection", "Device Protection"],
  ["TechSupport", "Priority Support"],
  ["StreamingTV", "Streaming TV"],
  ["StreamingMovies", "Streaming Movies"],
  ["PaymentMethod", "Payment Method"],
  ["PaperlessBilling", "Paperless Billing"],
  ["Partner", "Partner Account"],
  ["Dependents", "Dependents"],
];

export default function CustomerDetail() {
  const { id } = useParams();
  const { data: c, error } = useApi(() => api.customer(id), [id]);
  const [whatIf, setWhatIf] = useState({});

  useEffect(() => {
    if (!c) return;
    setWhatIf({});
    const base = Object.fromEntries(FEATURES.map((f) => [f, c[f]]));

    api.predict(base).then((b) => {
      WHAT_IFS.filter((w) => w.applies(c)).forEach((w) =>
        api.predict({ ...base, ...w.change }).then((r) => {
          const change = b.churn_probability - r.churn_probability;
          const after = Math.min(1, Math.max(0, c.chance_of_staying + change));
          setWhatIf((prev) => ({ ...prev, [w.label]: after }));
        })
      );
    });
  }, [c]);

  if (!c) return <Loading error={error && "Customer record not found."} />;

  const options = WHAT_IFS.filter((w) => w.applies(c));
  const tone =
    c.chance_of_staying >= 0.7
      ? "good"
      : c.chance_of_staying >= 0.4
      ? "medium"
      : "bad";

  return (
    <>
      <Link to="/customers" className="back-link">
        <ChevronLeftIcon size={16} />
        <span>Return to Customer Directory</span>
      </Link>

      <div className="customer-hero-card">
        <div className="customer-avatar">
          {c.name.split(" ").map((p) => p[0]).join("")}
        </div>
        <div className="customer-identity">
          <h1>{c.name}</h1>
          <div className="customer-meta-row">
            <span className="meta-pill">ID: {c.customerID}</span>
            <span className="meta-pill">{c.region} Region</span>
            <span className="meta-pill">Subscribed {c.customer_since}</span>
            <span className="meta-pill">{c.tenure} months tenure</span>
          </div>
        </div>
        <RiskBadge level={c.risk_level} />
      </div>

      <div className="grid2">
        <Card title="Survival Likelihood & Retention Health">
          <div className={`hero-number ${tone}`}>
            {pct(c.chance_of_staying)}
          </div>
          <div className="meter big">
            <div
              className={`meter-fill ${tone}`}
              style={{ width: pct(c.chance_of_staying) }}
            />
          </div>
          <p className="muted">
            Empirical cohort survival: approximately{" "}
            <b>{Math.round(c.chance_of_staying * 10)} in 10 subscribers</b> with this profile maintain active service.
          </p>
          <div className="mini-stats-grid">
            <div className="mini-stat-item">
              <span>Monthly Recurring Bill</span>
              <b>${c.MonthlyCharges.toFixed(2)}</b>
            </div>
            <div className="mini-stat-item">
              <span>Annual Account Value</span>
              <b>{money(c.customer_value)}</b>
            </div>
            <div className="mini-stat-item">
              <span>Cumulative Lifetime Spend</span>
              <b>{money(c.TotalCharges)}</b>
            </div>
          </div>
        </Card>

        <Card title="Prescribed Causal Intervention">
          <div style={{ marginBottom: "14px" }}>
            <ActionBadge action={c.recommended_action} large />
          </div>
          <p style={{ fontSize: "14px", lineHeight: "1.6" }}>
            {ACTION_HELP[c.recommended_action]}
          </p>
          {c.uplift_score > 0 ? (
            <div
              style={{
                marginTop: "12px",
                padding: "10px 14px",
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                borderRadius: "8px",
                color: "#065f46",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <SparklesIcon size={16} />
              <span>
                A $50 discount concession is estimated to elevate {c.name.split(" ")[0]}'s retention by{" "}
                <b>+{Math.round(c.uplift_score * 100)} percentage points</b>.
              </span>
            </div>
          ) : (
            <div
              style={{
                marginTop: "12px",
                padding: "10px 14px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              Causal analysis detects negligible sensitivity to monetary discounting for this subscriber profile.
            </div>
          )}
          <SimulatedNote />
        </Card>
      </div>

      <div className="grid2">
        <Card title="Critical Churn Drivers (Risk Factors)">
          {c.reasons_leave.length ? (
            <ul className="signs bad">
              {c.reasons_leave.map((r) => (
                <li key={r}>
                  <AlertTriangleIcon size={16} />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted" style={{ padding: "12px 0" }}>
              No critical departure risk factors detected.
            </p>
          )}
        </Card>

        <Card title="Customer Loyalty Anchors">
          {c.reasons_stay.length ? (
            <ul className="signs good">
              {c.reasons_stay.map((r) => (
                <li key={r}>
                  <CheckIcon size={16} />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted" style={{ padding: "12px 0" }}>
              Limited long-term retention anchors established yet.
            </p>
          )}
        </Card>
      </div>

      {options.length > 0 && (
        <Card
          title="Counterfactual What-If Scenario Simulator"
          subtitle="Real-time model re-scoring under alternative subscription modifications"
        >
          <div className="table-wrap" style={{ margin: "10px 0 0" }}>
            <table className="table what-if-table">
              <thead>
                <tr>
                  <th>Simulated Offer / Contract Action</th>
                  <th>Current → Projected Retention</th>
                  <th>Delta Impact</th>
                </tr>
              </thead>
              <tbody>
                {options.map((w) => {
                  const v = whatIf[w.label];
                  const diff = v != null ? v - c.chance_of_staying : null;
                  return (
                    <tr key={w.label}>
                      <td>
                        <b>{w.label}</b>
                      </td>
                      <td>
                        {v == null ? (
                          <span className="muted">Evaluating model…</span>
                        ) : (
                          <span>
                            {pct(c.chance_of_staying)} → <b>{pct(v)}</b>
                          </span>
                        )}
                      </td>
                      <td className={diff > 0.005 ? "up" : diff < -0.005 ? "down" : "muted"}>
                        {diff == null ? (
                          ""
                        ) : diff > 0.005 ? (
                          <span
                            style={{
                              background: "#ecfdf5",
                              color: "#059669",
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontWeight: 700,
                              fontSize: "12px",
                            }}
                          >
                            +{Math.round(diff * 100)}% Retention Gain
                          </span>
                        ) : diff < -0.005 ? (
                          <span
                            style={{
                              background: "#fff1f2",
                              color: "#e11d48",
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontWeight: 700,
                              fontSize: "12px",
                            }}
                          >
                            -{Math.round(-diff * 100)}% Drop
                          </span>
                        ) : (
                          "Neutral Impact"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card title="Active Subscriptions & Account Configuration">
        <div className="services-grid">
          {SERVICES.map(([k, label]) => (
            <div key={k} className="service-card">
              <span>{label}</span>
              <b>{String(c[k])}</b>
            </div>
          ))}
          <div className="service-card">
            <span>Demographic</span>
            <b>{c.SeniorCitizen ? "Senior Citizen (65+)" : "Standard Adult"}</b>
          </div>
        </div>
      </Card>
    </>
  );
}
