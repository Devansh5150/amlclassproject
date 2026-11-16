// Page 3: "Best way to choose": compare the ways of picking who gets a discount.
import {
  Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { api } from "../api.js";
import { Card, Details, KeyMessage, Legend, Loading, PageHeader, SimulatedNote, useApi } from "../components/ui.jsx";
import { COLORS, METHOD_COLORS, METHOD_LABEL, MODEL_COLORS } from "../theme.js";

const axis = { fill: COLORS.axis, fontSize: 12 };

export default function Models() {
  const { data, error } = useApi(api.metrics);
  if (!data) return <Loading error={error} />;
  const { classical, uplift } = data;

  const methods = Object.keys(uplift.gain_curves); // backend names
  const names = methods.map((m) => METHOD_LABEL[m]); // plain names

  // Headline bar chart: customers kept when contacting the top 20%
  const top = methods.map((m) => ({ name: METHOD_LABEL[m], saved: Math.round(uplift.methods[m].true_saved_top20) }));
  const order = ["Most likely to leave", "Most likely to respond to discount", "Random picks"];
  top.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
  const k = uplift.k_customers;

  // Curve: customers kept vs % contacted
  const gain = uplift.gain_curves[methods[0]].map((p, i) => ({
    pct: p.pct, ...Object.fromEntries(methods.map((m) => [METHOD_LABEL[m], Math.round(uplift.gain_curves[m][i].saved)])),
  }));

  return (
    <>
      <PageHeader title="What's the best way to choose who gets a discount?">
        Say we can only afford to contact <b>{k} of {uplift.test_size.toLocaleString()} customers (20%)</b>. We tried three ways of choosing them.
      </PageHeader>

      <div className="grid3">
        <Card title="🎯 Most likely to leave">Contact the customers our system says are <b>most at risk</b> of cancelling.</Card>
        <Card title="🤝 Most likely to respond">Contact the customers a discount is <b>most likely to change the mind of</b>.</Card>
        <Card title="🎲 Random picks">Contact customers <b>at random</b>, for comparison.</Card>
      </div>

      <KeyMessage>
        <b>Contacting the customers most likely to leave kept the most customers.</b> Both smart methods do about
        3× better than random.
      </KeyMessage>

      <Card title={`Customers kept by contacting ${k} people`} subtitle="Higher is better">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={top} layout="vertical" margin={{ left: 20, right: 50 }}>
            <CartesianGrid horizontal={false} stroke={COLORS.grid} />
            <XAxis type="number" tick={axis} />
            <YAxis type="category" dataKey="name" width={230} tick={{ ...axis, fontSize: 13 }} />
            <Tooltip formatter={(v) => [`${v} customers kept`, ""]} />
            <Bar dataKey="saved" radius={[0, 4, 4, 0]} barSize={28}
                 shape={(p) => <rect x={p.x} y={p.y} width={p.width} height={p.height} rx={4} fill={METHOD_COLORS[p.payload.name]} />}>
              <LabelList dataKey="saved" position="right" style={{ fontSize: 14, fontWeight: 700, fill: COLORS.axis }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="What if we contacted more people?" subtitle="Customers kept as we contact more and more of the list">
        <Legend items={names.map((n) => [n, METHOD_COLORS[n]])} />
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={gain} margin={{ right: 20 }}>
            <CartesianGrid stroke={COLORS.grid} />
            <XAxis dataKey="pct" tick={axis} tickFormatter={(v) => `${v}%`} />
            <YAxis tick={axis} width={36} />
            <Tooltip labelFormatter={(v) => `Contacting ${v}% of customers`} formatter={(v, n) => [`${v} kept`, n]} />
            <ReferenceLine x={20} stroke={COLORS.axis} strokeDasharray="3 3" label={{ value: "20%", fontSize: 11, position: "top" }} />
            {names.map((n) => <Line key={n} dataKey={n} stroke={METHOD_COLORS[n]} strokeWidth={2} dot={false} />)}
          </LineChart>
        </ResponsiveContainer>
        <ul className="takeaways">
          <li>The lines <b>flatten after about 60%</b>. Contacting everyone doesn't keep more customers. Some people are even annoyed by it.</li>
          <li>The "respond to discount" method is good at <b>skipping customers who'll leave no matter what</b>, but in our data that wasn't enough to win.</li>
        </ul>
        <SimulatedNote />
      </Card>

      <Details title="Technical details (for the viva)">
        <h4>Classical churn models (test set, {classical.test_size.toLocaleString()} customers)</h4>
        <Legend items={Object.keys(classical.models).map((m) => [m, MODEL_COLORS[m]])} />
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={["roc_auc", "precision", "recall", "f1"].map((m) => ({
            metric: { roc_auc: "ROC-AUC", precision: "Precision", recall: "Recall", f1: "F1" }[m],
            ...Object.fromEntries(Object.keys(classical.models).map((n) => [n, classical.models[n][m]])),
          }))}>
            <CartesianGrid vertical={false} stroke={COLORS.grid} />
            <XAxis dataKey="metric" tick={axis} />
            <YAxis domain={[0, 1]} tick={axis} width={36} />
            <Tooltip formatter={(v) => v.toFixed(3)} />
            {Object.keys(classical.models).map((m) => <Bar key={m} dataKey={m} fill={MODEL_COLORS[m]} radius={[4, 4, 0, 0]} />)}
          </BarChart>
        </ResponsiveContainer>
        <table className="table compact">
          <thead><tr><th>Model</th><th>ROC-AUC</th><th>Precision</th><th>Recall</th><th>F1</th><th>5-fold CV AUC</th></tr></thead>
          <tbody>{Object.entries(classical.models).map(([m, r]) => (
            <tr key={m} className={m === classical.best_model ? "best" : ""}>
              <td>{m}{m === classical.best_model && " ✓"}</td><td>{r.roc_auc.toFixed(3)}</td><td>{r.precision.toFixed(3)}</td>
              <td>{r.recall.toFixed(3)}</td><td>{r.f1.toFixed(3)}</td><td>{r.cv_roc_auc_mean.toFixed(3)} ± {r.cv_roc_auc_std.toFixed(3)}</td>
            </tr>))}</tbody>
        </table>
        <h4>Uplift comparison (top 20%, simulated treatment)</h4>
        <table className="table compact">
          <thead><tr><th>Ranking</th><th>True saved</th><th>Qini AUC</th><th>Observed uplift@20%</th><th>Lost causes contacted</th></tr></thead>
          <tbody>{methods.map((m) => (
            <tr key={m}><td>{m}</td><td>{uplift.methods[m].true_saved_top20}</td><td>{uplift.methods[m].qini_auc.toFixed(3)}</td>
              <td>{(uplift.methods[m].observed_uplift_at_20 * 100).toFixed(1)} pts</td><td>{uplift.methods[m].segments_top20.lost_cause ?? 0}</td></tr>
          ))}</tbody>
        </table>
        <p className="note">Best possible (oracle) = {uplift.best_possible_saved_top20} saved. Uplift model: {uplift.chosen_uplift_model}, chosen by 5-fold CV Qini on training data.</p>
      </Details>
    </>
  );
}
