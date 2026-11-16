// Page 1: "Why customers leave": the big picture in plain English.
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api.js";
import { ActionBadge, Card, Details, KeyMessage, Loading, PageHeader, Stat, useApi } from "../components/ui.jsx";
import { COLORS, pct } from "../theme.js";

// Plain-English names for the model's top features
const PLAIN = {
  "Contract = Month-to-month": "On a month-to-month contract",
  "InternetService = Fiber optic": "Has fiber internet (pricier plan)",
  "tenure": "Been a customer for a long time",
  "Contract = Two year": "On a 2-year contract",
  "TotalCharges": "Has paid a lot in total (long-time customer)",
  "PaymentMethod = Electronic check": "Pays by electronic check",
  "MonthlyCharges": "Has a high monthly bill",
  "InternetService = No": "Has no internet service",
  "OnlineSecurity = Yes": "Pays for online security",
  "PaperlessBilling = Yes": "Uses paperless billing",
  "TechSupport = Yes": "Pays for tech support",
  "Contract = One year": "On a 1-year contract",
};

export default function Dashboard() {
  const { data, error } = useApi(api.summary);
  if (!data) return <Loading error={error} />;

  const contract = Object.entries(data.churn_by_contract).map(([k, v]) => ({
    name: { "Month-to-month": "Month-to-month", "One year": "1-year contract", "Two year": "2-year contract" }[k] || k, rate: v,
  }));
  const tenure = Object.entries(data.churn_by_tenure).map(([k, v]) => ({ name: `${k} months`, rate: v }));

  // Split the drivers into warning signs and good signs, plain wording, top 5 each
  const named = data.top_drivers.filter((d) => PLAIN[d.feature]);
  const warning = named.filter((d) => d.direction === "increases churn").slice(0, 5);
  const good = named.filter((d) => d.direction === "decreases churn").slice(0, 5);
  const sendCount = data.action_counts["Send retention offer"] || 0;

  return (
    <>
      <PageHeader title="Why do customers leave?">
        This tool helps a phone company decide <b>which customers to offer a $50 discount</b> so they don't cancel.
        First, here's what we learned about who leaves.
      </PageHeader>

      <div className="stats three">
        <Stat label="Customers who leave" value="1 in 4" note={`${pct(data.churn_rate, 1)} of customers cancel`} />
        <Stat label="Customers looked at" value={data.n_customers.toLocaleString()} note="real customer records" />
        <Stat label="Should get a discount" value={sendCount.toLocaleString()} note={`about ${pct(sendCount / data.n_customers)} of customers`} />
      </div>

      <KeyMessage>
        The biggest warning sign is a <b>month-to-month contract</b>. <b>New customers</b> are also much more likely to leave than loyal ones.
      </KeyMessage>

      <div className="grid2">
        <Card title="⚠ Warning signs" subtitle="Customers with these are MORE likely to leave">
          <ul className="signs bad">{warning.map((d) => <li key={d.feature}>{PLAIN[d.feature]}</li>)}</ul>
        </Card>
        <Card title="✔ Good signs" subtitle="Customers with these are LESS likely to leave">
          <ul className="signs good">{good.map((d) => <li key={d.feature}>{PLAIN[d.feature]}</li>)}</ul>
        </Card>
      </div>

      <div className="grid2">
        <Card title="Who leaves, by contract type" subtitle="Out of every 100 customers, how many leave">
          <RateChart data={contract} />
        </Card>
        <Card title="Who leaves, by how long they've been a customer" subtitle="New customers leave the most">
          <RateChart data={tenure} />
        </Card>
      </div>

      <Card title="What we recommend for each customer">
        <div className="actions">
          {Object.entries(data.action_counts).map(([a, n]) => (
            <div key={a} className="action-count"><ActionBadge action={a} /><b>{n.toLocaleString()}</b></div>
          ))}
        </div>
      </Card>

      <Details>
        <p>Warning/good signs come from SHAP feature importance on the {data.best_model} churn model
          (ROC-AUC {data.best_model_auc.toFixed(3)}), computed on {data.n_customers.toLocaleString()} held-out test customers.</p>
        <table className="table compact">
          <thead><tr><th>Feature</th><th>Mean |SHAP|</th><th>Effect</th></tr></thead>
          <tbody>{data.top_drivers.map((d) => (
            <tr key={d.feature}><td>{d.feature}</td><td>{d.mean_abs_shap.toFixed(3)}</td><td>{d.direction}</td></tr>
          ))}</tbody>
        </table>
      </Details>
    </>
  );
}

function RateChart({ data }) {
  const max = Math.max(...data.map((d) => d.rate));
  return (
    <ResponsiveContainer width="100%" height={190}>
      <BarChart data={data} margin={{ top: 22, right: 10, left: -10 }}>
        <CartesianGrid vertical={false} stroke={COLORS.grid} />
        <XAxis dataKey="name" tick={{ fill: COLORS.axis, fontSize: 12 }} interval={0} />
        <YAxis tickFormatter={(v) => pct(v)} tick={{ fill: COLORS.axis, fontSize: 12 }} width={44} />
        <Tooltip formatter={(v) => [`${Math.round(v * 100)} out of 100 leave`, ""]} />
        <Bar dataKey="rate" radius={[4, 4, 0, 0]} barSize={40}>
          {/* highlight the worst group, others in a lighter blue */}
          {data.map((d) => <Cell key={d.name} fill={d.rate === max ? COLORS.blue : "#9ec5f4"} />)}
          <LabelList dataKey="rate" position="top" formatter={(v) => pct(v)} style={{ fontSize: 12, fill: COLORS.axis }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
