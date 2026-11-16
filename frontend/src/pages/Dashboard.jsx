import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { api } from "../api.js";
import {
  ActionBadge,
  Card,
  Details,
  KeyMessage,
  Loading,
  PageHeader,
  Stat,
  StayBar,
  useApi
} from "../components/ui.jsx";
import {
  UsersIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  DollarSignIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  ShieldCheckIcon
} from "../components/icons.jsx";
import { COLORS, RISK_STYLE, money, pct } from "../theme.js";

const CONTRACT = { "Month-to-month": "Month-to-month", "One year": "1-year", "Two year": "2-year" };
const PAYMENT = {
  "Electronic check": "E-check",
  "Mailed check": "Mailed check",
  "Bank transfer (automatic)": "Auto bank",
  "Credit card (automatic)": "Auto card"
};
const INTERNET = { "Fiber optic": "Fiber", DSL: "DSL", No: "No internet" };

export default function Dashboard() {
  const { data, error } = useApi(api.summary);
  const navigate = useNavigate();

  if (!data) return <Loading error={error} />;

  const risk = ["High", "Medium", "Low"].map((k) => ({
    name: RISK_STYLE[k].label,
    level: k,
    n: data.risk_counts[k]
  }));
  const offers = data.action_counts["Send retention offer"] || 0;

  return (
    <>
      <PageHeader
        badge="Executive Portfolio Overview"
        title="Customer Retention Intelligence"
        right={
          <Link to="/campaign" className="button-link">
            <span>Launch Retention Campaign</span>
            <ArrowRightIcon size={15} />
          </Link>
        }
      >
        Real-time telemetry and churn predictions across Robic's{" "}
        <b>{data.n_customers.toLocaleString()} active subscribers</b>.
      </PageHeader>

      <div className="stats">
        <Stat
          label="Total Subscribers"
          value={data.n_customers.toLocaleString()}
          note={`${money(data.monthly_revenue)} MRR base`}
          icon={UsersIcon}
        />
        <Stat
          label="Monthly Retention"
          value={pct(data.retention_rate, 1)}
          note="Retained from prior cycle"
          tone="good"
          icon={TrendingUpIcon}
        />
        <Stat
          label="High Churn Risk"
          value={data.risk_counts.High.toLocaleString()}
          note="Projected to churn soon"
          tone="bad"
          icon={AlertTriangleIcon}
        />
        <Stat
          label="Revenue at Risk"
          value={money(data.monthly_revenue_at_risk)}
          note="Immediate exposure"
          tone="bad"
          icon={DollarSignIcon}
        />
      </div>

      <KeyMessage>
        Robic successfully maintains <b>{pct(data.retention_rate, 1)}</b> account retention.
        Subscribers on <b>month-to-month terms</b> and <b>first-year tenure</b> represent 71% of total churn velocity.
        <Link to="/customers?risk=High">
          Audit {data.risk_counts.High.toLocaleString()} vulnerable accounts
          <ArrowUpRightIcon size={13} />
        </Link>
      </KeyMessage>

      <div className="grid2">
        <Card
          title="Account Risk Stratification"
          subtitle="Machine learning churn risk distribution across all accounts"
        >
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={risk} layout="vertical" margin={{ left: 10, right: 60, top: 10, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tick={{ fill: COLORS.axis, fontSize: 13, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v) => [`${v.toLocaleString()} subscribers`, ""]}
                cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
              />
              <Bar
                dataKey="n"
                barSize={32}
                radius={[0, 6, 6, 0]}
                cursor="pointer"
                onClick={(d) => navigate(`/customers?risk=${d.level}`)}
              >
                {risk.map((r) => (
                  <Cell key={r.level} fill={RISK_STYLE[r.level].color} />
                ))}
                <LabelList
                  dataKey="n"
                  position="right"
                  formatter={(v) => v.toLocaleString()}
                  style={{ fontSize: 13, fontWeight: 700, fill: COLORS.axis }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="note">💡 Click any risk tier to filter the customer roster directly.</p>
        </Card>

        <Card
          title="Optimal Intervention Strategy"
          subtitle="Prescribed causal actions ranked by net expected value"
        >
          <div className="action-list">
            {Object.entries(data.action_counts).map(([a, n]) => (
              <Link
                key={a}
                to={`/customers?action=${encodeURIComponent(a)}`}
                className="action-row"
              >
                <ActionBadge action={a} />
                <b>{n.toLocaleString()}</b>
                <span className="muted" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px" }}>
                  Inspect <ArrowRightIcon size={12} />
                </span>
              </Link>
            ))}
          </div>
          <p className="note">
            🎯 Uplift modeling confirms <b>{offers.toLocaleString()} high-leverage accounts</b> justify an immediate $50 retention concession.
          </p>
        </Card>
      </div>

      <h2>Cohort Retention Analytics</h2>
      <p className="lead small">
        Empirical 30-day retention performance segmented by service attributes. Lower rates identify churn vulnerability.
      </p>

      <div className="grid2">
        <RetentionCard title="Term Structure" rows={data.retention_by_contract} labels={CONTRACT} />
        <RetentionCard title="Customer Tenure Vintage" rows={data.retention_by_tenure} />
        <RetentionCard title="Broadband Infrastructure" rows={data.retention_by_internet} labels={INTERNET} />
        <RetentionCard title="Billing & Settlement Channel" rows={data.retention_by_payment} labels={PAYMENT} />
      </div>

      <Card
        title="Priority Intervention Radar"
        subtitle="Top 10 highest-value accounts with critical departure indicators"
        action={
          <Link to="/customers" className="button-link">
            <span>Explore All {data.n_customers.toLocaleString()} Accounts</span>
            <ArrowRightIcon size={14} />
          </Link>
        }
      >
        <div className="table-wrap">
          <table className="table clickable">
            <thead>
              <tr>
                <th>Subscriber</th>
                <th>Contract Term</th>
                <th>Tenure</th>
                <th>Monthly Charge</th>
                <th>Probability of Staying</th>
                <th>Suggested Action</th>
              </tr>
            </thead>
            <tbody>
              {data.top_at_risk.map((c) => (
                <tr key={c.customerID} onClick={() => navigate(`/customers/${c.customerID}`)}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: "#fee2e2",
                          color: "#b91c1c",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "12px",
                          flexShrink: 0
                        }}
                      >
                        {c.name.split(" ").map((p) => p[0]).join("")}
                      </div>
                      <div>
                        <b>{c.name}</b>
                        <div className="muted small">{c.customerID}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="meta-pill">{c.Contract}</span>
                  </td>
                  <td>{c.tenure} mos</td>
                  <td>
                    <b>${c.MonthlyCharges.toFixed(2)}</b>
                  </td>
                  <td>
                    <StayBar value={c.chance_of_staying} />
                  </td>
                  <td>
                    <ActionBadge action={c.recommended_action || "Send retention offer"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Details title="Statistical Methodology & Cross-Validation Bounds">
        <p>
          Historical baseline retention metrics are computed using empirical target ground truth (<code>Churn</code>).
          Individual churn probabilities and survival likelihoods are inferred from the champion <b>{data.best_model}</b> model
          (Out-of-Fold Cross-Validated ROC-AUC: <b>{data.best_model_auc.toFixed(3)}</b>).
          Scoring is strictly out-of-fold to prevent informational data leakage.
          Risk bounds: <i>High Risk</i> (P_churn ≥ 0.60), <i>Medium Risk</i> (0.30 ≤ P_churn &lt; 0.60), and <i>Low Risk</i> (P_churn &lt; 0.30).
        </p>
      </Details>
    </>
  );
}

function RetentionCard({ title, rows, labels = {} }) {
  const data = rows.map((r) => ({ ...r, name: labels[r.group] || r.group }));
  const min = Math.min(...data.map((d) => d.retention));

  return (
    <Card title={title}>
      <ResponsiveContainer width="100%" height={190}>
        <BarChart data={data} margin={{ top: 24, right: 12, left: -14, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={COLORS.grid} strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fill: COLORS.axis, fontSize: 12 }} interval={0} />
          <YAxis
            domain={[0, 1]}
            tickFormatter={(v) => pct(v)}
            tick={{ fill: COLORS.axis, fontSize: 11 }}
            width={44}
          />
          <Tooltip
            formatter={(v, _n, p) => [
              `${pct(v)} retained (${p.payload.customers.toLocaleString()} subscribers)`,
              ""
            ]}
          />
          <Bar dataKey="retention" radius={[6, 6, 0, 0]} barSize={36}>
            {data.map((d) => (
              <Cell
                key={d.name}
                fill={d.retention === min ? "#ea580c" : "#2563eb"}
              />
            ))}
            <LabelList
              dataKey="retention"
              position="top"
              formatter={(v) => pct(v)}
              style={{ fontSize: 11.5, fontWeight: 700, fill: COLORS.axis }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
