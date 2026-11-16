import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { api } from "../api.js";
import {
  Card,
  Details,
  KeyMessage,
  Legend,
  Loading,
  PageHeader,
  SimulatedNote,
  useApi
} from "../components/ui.jsx";
import {
  BrainIcon,
  TargetIcon,
  ZapIcon,
  CheckIcon,
  SparklesIcon
} from "../components/icons.jsx";
import { COLORS, METHOD_COLORS, METHOD_LABEL, MODEL_COLORS } from "../theme.js";

const axis = { fill: COLORS.axis, fontSize: 12 };

export default function Models() {
  const { data, error } = useApi(api.metrics);
  if (!data) return <Loading error={error} />;

  const { classical, uplift } = data;
  const methods = Object.keys(uplift.gain_curves);
  const names = methods.map((m) => METHOD_LABEL[m]);

  const top = methods.map((m) => ({
    name: METHOD_LABEL[m],
    saved: Math.round(uplift.methods[m].true_saved_top20),
  }));

  const order = [
    "Most likely to leave",
    "Most likely to respond to discount",
    "Random picks",
  ];
  top.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
  const k = uplift.k_customers;

  const gain = uplift.gain_curves[methods[0]].map((p, i) => ({
    pct: p.pct,
    ...Object.fromEntries(
      methods.map((m) => [
        METHOD_LABEL[m],
        Math.round(uplift.gain_curves[m][i].saved),
      ])
    ),
  }));

  return (
    <>
      <PageHeader
        badge="Machine Learning Architecture"
        title="Predictive Churn vs Causal Uplift Intelligence"
      >
        Comparing supervised classification models with counterfactual causal estimators across a fixed{" "}
        <b>20% outreach budget ({k} of {uplift.test_size.toLocaleString()} accounts)</b>.
      </PageHeader>

      <div className="grid3">
        <div className="card" style={{ borderTop: "3px solid #2563eb" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <div style={{ padding: "6px", background: "#dbeafe", color: "#1d4ed8", borderRadius: "8px" }}>
              <TargetIcon size={16} />
            </div>
            <h3 style={{ margin: 0 }}>Churn Risk Prioritization</h3>
          </div>
          <p className="muted" style={{ fontSize: "13.5px" }}>
            Targets subscribers with the <b>highest predicted departure probability</b> (P_churn).
          </p>
        </div>

        <div className="card" style={{ borderTop: "3px solid #ea580c" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <div style={{ padding: "6px", background: "#ffedd5", color: "#c2410c", borderRadius: "8px" }}>
              <ZapIcon size={16} />
            </div>
            <h3 style={{ margin: 0 }}>Causal Uplift (T-Learner)</h3>
          </div>
          <p className="muted" style={{ fontSize: "13.5px" }}>
            Estimates <b>treatment effect heterogeneity</b> (CATE) to isolate customers whose behavior is actually swayed by the incentive.
          </p>
        </div>

        <div className="card" style={{ borderTop: "3px solid #94a3b8" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <div style={{ padding: "6px", background: "#f1f5f9", color: "#64748b", borderRadius: "8px" }}>
              <BrainIcon size={16} />
            </div>
            <h3 style={{ margin: 0 }}>Random Control Baseline</h3>
          </div>
          <p className="muted" style={{ fontSize: "13.5px" }}>
            Uniform random assignment to establish benchmark empirical lift without algorithmic targeting.
          </p>
        </div>
      </div>

      <KeyMessage>
        <b>Empirical Evaluation Finding:</b> Targeting subscribers with highest predicted churn risk preserved the largest volume of accounts.
        Both algorithmic targeting strategies outperform uniform random assignment by <b>over 3× efficiency</b>.
      </KeyMessage>

      <Card
        title={`Incremental Accounts Saved via Top 20% Intervention (${k} contacts)`}
        subtitle="True positive retentions validated on held-out test cohort"
      >
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={top} layout="vertical" margin={{ left: 16, right: 60, top: 10, bottom: 10 }}>
            <CartesianGrid horizontal={false} stroke={COLORS.grid} strokeDasharray="3 3" />
            <XAxis type="number" tick={axis} />
            <YAxis
              type="category"
              dataKey="name"
              width={240}
              tick={{ ...axis, fontSize: 13, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip formatter={(v) => [`${v} subscribers preserved`, ""]} />
            <Bar dataKey="saved" radius={[0, 6, 6, 0]} barSize={30}>
              {top.map((entry) => (
                <Cell key={entry.name} fill={METHOD_COLORS[entry.name]} />
              ))}
              <LabelList
                dataKey="saved"
                position="right"
                style={{ fontSize: 14, fontWeight: 700, fill: COLORS.axis }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card
        title="Cumulative Gains Curve (Intervention Reach vs Retentions)"
        subtitle="Cumulative subscribers preserved as outreach expands across the percentiles"
      >
        <Legend items={names.map((n) => [n, METHOD_COLORS[n]])} />
        <ResponsiveContainer width="100%" height={270}>
          <LineChart data={gain} margin={{ right: 20, top: 10, bottom: 0 }}>
            <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="pct"
              tick={axis}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis tick={axis} width={40} />
            <Tooltip
              labelFormatter={(v) => `Contacting top ${v}% of base`}
              formatter={(v, n) => [`${v} saved`, n]}
            />
            <ReferenceLine
              x={20}
              stroke="#6366f1"
              strokeDasharray="4 4"
              label={{ value: "20% Budget Cutoff", fontSize: 11, position: "top", fill: "#4f46e5" }}
            />
            {names.map((n) => (
              <Line
                key={n}
                type="monotone"
                dataKey={n}
                stroke={METHOD_COLORS[n]}
                strokeWidth={2.5}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <div
          style={{
            marginTop: "16px",
            padding: "14px 18px",
            background: "#f8fafc",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            fontSize: "13.5px",
            lineHeight: "1.6",
            color: "var(--text-muted)",
          }}
        >
          <div style={{ fontWeight: 600, color: "var(--text-main)", marginBottom: "4px" }}>
            Key Strategic Takeaways:
          </div>
          <div>
            • <b>Saturation Knee Point:</b> Gain curves flatten beyond 60% outreach. Beyond this threshold, additional concessions generate diminishing returns.
          </div>
          <div>
            • <b>Lost Cause Filter:</b> Causal uplift filters out non-responsive accounts ("Lost Causes") who churn regardless of financial incentives.
          </div>
        </div>
        <SimulatedNote />
      </Card>

      <Details title="Academic & Defense Methodology (Viva / Presentation Details)">
        <h4 style={{ margin: "8px 0 12px" }}>
          Supervised Churn Classifiers Benchmark (Held-out Test: {classical.test_size.toLocaleString()} records)
        </h4>
        <Legend items={Object.keys(classical.models).map((m) => [m, MODEL_COLORS[m]])} />
        <ResponsiveContainer width="100%" height={230}>
          <BarChart
            data={["roc_auc", "precision", "recall", "f1"].map((m) => ({
              metric: { roc_auc: "ROC-AUC", precision: "Precision", recall: "Recall", f1: "F1 Score" }[m],
              ...Object.fromEntries(
                Object.keys(classical.models).map((n) => [n, classical.models[n][m]])
              ),
            }))}
            margin={{ top: 16, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke={COLORS.grid} strokeDasharray="3 3" />
            <XAxis dataKey="metric" tick={axis} />
            <YAxis domain={[0, 1]} tick={axis} width={36} />
            <Tooltip formatter={(v) => v.toFixed(3)} />
            {Object.keys(classical.models).map((m) => (
              <Bar key={m} dataKey={m} fill={MODEL_COLORS[m]} radius={[5, 5, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>

        <div className="table-wrap" style={{ margin: "16px 0" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Classifier Architecture</th>
                <th>Test ROC-AUC</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1 Score</th>
                <th>5-Fold CV AUC (Mean ± Std)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(classical.models).map(([m, r]) => (
                <tr key={m} style={m === classical.best_model ? { background: "#f0fdf4" } : {}}>
                  <td>
                    <b>{m}</b>
                    {m === classical.best_model && (
                      <span
                        style={{
                          marginLeft: "8px",
                          background: "#dcfce7",
                          color: "#15803d",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: 700,
                        }}
                      >
                        CHAMPION
                      </span>
                    )}
                  </td>
                  <td><b>{r.roc_auc.toFixed(3)}</b></td>
                  <td>{r.precision.toFixed(3)}</td>
                  <td>{r.recall.toFixed(3)}</td>
                  <td>{r.f1.toFixed(3)}</td>
                  <td>
                    {r.cv_roc_auc_mean.toFixed(3)} ± {r.cv_roc_auc_std.toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h4 style={{ margin: "20px 0 10px" }}>
          Causal Uplift Model Performance (Top 20% Outreach Cohort)
        </h4>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Ranking Strategy</th>
                <th>True Accounts Saved</th>
                <th>Qini Metric AUC</th>
                <th>Observed Uplift @ 20%</th>
                <th>Lost Causes Contacted</th>
              </tr>
            </thead>
            <tbody>
              {methods.map((m) => (
                <tr key={m}>
                  <td><b>{m}</b></td>
                  <td><b>{uplift.methods[m].true_saved_top20}</b></td>
                  <td>{uplift.methods[m].qini_auc.toFixed(3)}</td>
                  <td>{(uplift.methods[m].observed_uplift_at_20 * 100).toFixed(1)}%</td>
                  <td>{uplift.methods[m].segments_top20.lost_cause ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="note" style={{ marginTop: "12px" }}>
          Theoretical Oracle Upper Bound = {uplift.best_possible_saved_top20} accounts.
          Selected uplift estimator: <b>{uplift.chosen_uplift_model}</b> optimized via 5-Fold Cross-Validation Qini on training splits.
        </p>
      </Details>
    </>
  );
}
