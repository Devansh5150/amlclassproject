// Page 1: Dashboard: churn rate, key numbers and top churn drivers.
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api.js";
import { Card, Legend, Loading, Stat, useApi, ActionBadge } from "../components/ui.jsx";
import { COLORS, pct } from "../theme.js";

const INCREASES = "#d03b3b"; // diverging pair: red = pushes towards churn
const DECREASES = COLORS.blue; // blue = pushes away from churn

export default function Dashboard() {
  const { data, error } = useApi(api.summary);
  if (!data) return <Loading error={error} />;

  const contract = Object.entries(data.churn_by_contract).map(([k, v]) => ({ name: k, rate: v }));
  const tenure = Object.entries(data.churn_by_tenure).map(([k, v]) => ({ name: k, rate: v }));
  const drivers = data.top_drivers.map((d) => ({ ...d, value: d.mean_abs_shap }));

  return (
    <>
      <h1>Customer churn overview</h1>
      <p className="lead">
        Who is leaving, and why? Numbers below are for the {data.n_customers.toLocaleString()} held-out test customers.
      </p>

      <div className="stats">
        <Stat label="Churn rate" value={pct(data.churn_rate, 1)} note="about 1 in 4 customers leave" />
        <Stat label="Customers" value={data.n_customers.toLocaleString()} note="test set (unseen by models)" />
        <Stat label="Avg monthly bill" value={`$${data.avg_monthly_charges}`} />
        <Stat label="Best churn model" value={data.best_model} note={`ROC-AUC ${data.best_model_auc.toFixed(3)}`} />
      </div>

      <div className="grid2">
        <Card title="Top churn drivers (SHAP)" subtitle="How much each feature moves the churn prediction, on average">
          <Legend items={[["Increases churn", INCREASES], ["Decreases churn", DECREASES]]} />
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={drivers} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid horizontal={false} stroke={COLORS.grid} />
              <XAxis type="number" tick={{ fill: COLORS.axis, fontSize: 12 }} />
              <YAxis type="category" dataKey="feature" width={210} tick={{ fill: COLORS.axis, fontSize: 12 }} />
              <Tooltip formatter={(v, _n, p) => [v.toFixed(3), p.payload.direction]} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14}>
                {drivers.map((d) => (
                  <Cell key={d.feature} fill={d.direction === "increases churn" ? INCREASES : DECREASES} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <div className="stack">
          <Card title="Churn rate by contract type" subtitle="Month-to-month customers leave far more often">
            <RateChart data={contract} />
          </Card>
          <Card title="Churn rate by tenure (months)" subtitle="New customers are the riskiest">
            <RateChart data={tenure} />
          </Card>
        </div>
      </div>

      <Card title="What the system recommends" subtitle="Recommended action for each test customer (churn model + uplift model + offer cost)">
        <div className="actions">
          {Object.entries(data.action_counts).map(([a, n]) => (
            <div key={a} className="action-count">
              <ActionBadge action={a} />
              <b>{n}</b>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function RateChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={data} margin={{ top: 18, right: 10 }}>
        <CartesianGrid vertical={false} stroke={COLORS.grid} />
        <XAxis dataKey="name" tick={{ fill: COLORS.axis, fontSize: 12 }} />
        <YAxis tickFormatter={(v) => pct(v)} tick={{ fill: COLORS.axis, fontSize: 12 }} width={40} />
        <Tooltip formatter={(v) => [pct(v, 1), "Churn rate"]} />
        <Bar dataKey="rate" fill={COLORS.blue} radius={[4, 4, 0, 0]} barSize={36}
             label={{ position: "top", formatter: (v) => pct(v), fontSize: 11, fill: COLORS.axis }} />
      </BarChart>
    </ResponsiveContainer>
  );
}
