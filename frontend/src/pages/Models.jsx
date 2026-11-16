// Page 3: Model comparison: classical churn models, then churn ranking vs uplift ranking.
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { api } from "../api.js";
import { Card, Legend, Loading, SimulatedBanner, useApi } from "../components/ui.jsx";
import { COLORS, METHOD_COLORS, MODEL_COLORS } from "../theme.js";

const axis = { fill: COLORS.axis, fontSize: 12 };

export default function Models() {
  const { data, error } = useApi(api.metrics);
  if (!data) return <Loading error={error} />;
  const { classical, uplift } = data;
  const models = Object.keys(classical.models);

  // Grouped bars: one group per metric, one bar per model
  const metricRows = ["roc_auc", "precision", "recall", "f1"].map((m) => ({
    metric: { roc_auc: "ROC-AUC", precision: "Precision", recall: "Recall", f1: "F1" }[m],
    ...Object.fromEntries(models.map((n) => [n, classical.models[n][m]])),
  }));

  // ROC curves: merge each model's points on a shared x
  const roc = models.flatMap((n) => classical.roc_curves[n].map((p) => ({ fpr: p.fpr, [n]: p.tpr })))
    .sort((a, b) => a.fpr - b.fpr);

  // Uplift gain curves (true simulated customers saved)
  const methods = Object.keys(uplift.gain_curves);
  const gain = uplift.gain_curves[methods[0]].map((p, i) => ({
    pct: p.pct, ...Object.fromEntries(methods.map((m) => [m, uplift.gain_curves[m][i].saved])),
  }));
  const top = uplift.methods;
  const chosen = uplift.chosen_uplift_model;

  return (
    <>
      <h1>Model comparison</h1>
      <p className="lead">Part 1: which classical model predicts churn best? Part 2: if we can contact only 20% of customers, which ranking saves more of them?</p>

      <h2>1 · Classical churn models</h2>
      <div className="grid2">
        <Card title="Test-set metrics" subtitle={`${classical.test_size.toLocaleString()} test customers · threshold ${classical.threshold}`}>
          <Legend items={models.map((m) => [m, MODEL_COLORS[m]])} />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={metricRows} barGap={2}>
              <CartesianGrid vertical={false} stroke={COLORS.grid} />
              <XAxis dataKey="metric" tick={axis} />
              <YAxis domain={[0, 1]} tick={axis} width={36} />
              <Tooltip formatter={(v) => v.toFixed(3)} />
              {models.map((m) => <Bar key={m} dataKey={m} fill={MODEL_COLORS[m]} radius={[4, 4, 0, 0]} />)}
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="ROC curves" subtitle="Closer to the top-left = better. Dashed = random guessing.">
          <Legend items={models.map((m) => [`${m} (AUC ${classical.models[m].roc_auc.toFixed(3)})`, MODEL_COLORS[m]])} />
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={roc}>
              <CartesianGrid stroke={COLORS.grid} />
              <XAxis dataKey="fpr" type="number" domain={[0, 1]} tick={axis} label={{ value: "False positive rate", position: "insideBottom", offset: -2, fontSize: 12 }} />
              <YAxis domain={[0, 1]} tick={axis} width={36} />
              <Tooltip formatter={(v) => v?.toFixed(3)} labelFormatter={(v) => `FPR ${Number(v).toFixed(2)}`} />
              <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} stroke={COLORS.neutral} strokeDasharray="4 4" />
              {models.map((m) => <Line key={m} dataKey={m} stroke={MODEL_COLORS[m]} dot={false} strokeWidth={2} connectNulls />)}
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <table className="table">
        <thead><tr><th>Model</th><th>ROC-AUC</th><th>Precision</th><th>Recall</th><th>F1</th><th>5-fold CV AUC</th></tr></thead>
        <tbody>
          {models.map((m) => {
            const r = classical.models[m];
            return (
              <tr key={m} className={m === classical.best_model ? "best" : ""}>
                <td>{m}{m === classical.best_model && " ✓ best"}</td>
                <td>{r.roc_auc.toFixed(3)}</td><td>{r.precision.toFixed(3)}</td><td>{r.recall.toFixed(3)}</td><td>{r.f1.toFixed(3)}</td>
                <td>{r.cv_roc_auc_mean.toFixed(3)} ± {r.cv_roc_auc_std.toFixed(3)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="note">All three are within cross-validation noise (±0.011). Random Forest is kept because it has the best test ROC-AUC and F1.</p>

      <h2>2 · Churn-risk ranking vs uplift ranking</h2>
      <SimulatedBanner />
      <div className="grid2">
        <Card title="Customers saved vs % contacted" subtitle="Expected customers kept by the offer (true simulated effect), test set">
          <Legend items={methods.map((m) => [m, METHOD_COLORS[m]])} />
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={gain}>
              <CartesianGrid stroke={COLORS.grid} />
              <XAxis dataKey="pct" tick={axis} tickFormatter={(v) => `${v}%`} />
              <YAxis tick={axis} width={36} />
              <Tooltip labelFormatter={(v) => `Contact top ${v}%`} formatter={(v) => v.toFixed(1)} />
              <ReferenceLine x={20} stroke={COLORS.axis} strokeDasharray="3 3" label={{ value: "20% budget", fontSize: 11, position: "insideTopLeft" }} />
              {methods.map((m) => <Line key={m} dataKey={m} stroke={METHOD_COLORS[m]} strokeWidth={2} dot={{ r: 3 }} />)}
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Top 20% budget: head to head" subtitle={`${uplift.k_customers} customers contacted · best possible = ${uplift.best_possible_saved_top20} saved`}>
          <table className="table compact">
            <thead><tr><th>Ranking</th><th>Saved</th><th>Qini AUC</th><th>Lost causes contacted</th></tr></thead>
            <tbody>
              {["Churn risk (Random Forest)", chosen, "Random"].map((m) => (
                <tr key={m}>
                  <td><i className="dot" style={{ background: METHOD_COLORS[m] }} />{m}</td>
                  <td><b>{top[m].true_saved_top20}</b></td>
                  <td>{top[m].qini_auc.toFixed(3)}</td>
                  <td>{top[m].segments_top20.lost_cause ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="takeaways">
            <li><b>Churn risk wins</b> at the 20% budget in this simulation (also in 5-fold CV).</li>
            <li>Uplift <b>avoids lost causes</b>, high-risk customers the offer can't save.</li>
            <li>Both curves <b>peak around 60–65%</b>: contacting everyone saves fewer customers (offers backfire on "sleeping dogs").</li>
          </ul>
        </Card>
      </div>
    </>
  );
}
