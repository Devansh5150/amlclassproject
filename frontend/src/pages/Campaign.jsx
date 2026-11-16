import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { api } from "../api.js";
import {
  ActionBadge,
  Card,
  KeyMessage,
  Legend,
  Loading,
  PageHeader,
  SimulatedNote,
  Stat,
  StayBar,
  useApi
} from "../components/ui.jsx";
import {
  TargetIcon,
  DollarSignIcon,
  TrendingUpIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon
} from "../components/icons.jsx";
import { COLORS, METHOD_COLORS, METHOD_LABEL, money } from "../theme.js";

const SORTS = {
  churn_prob: "Highest churn risk (standard heuristic)",
  uplift_score: "Highest uplift sensitivity (T-Learner Causal AI)",
};
const PAGE = 20;

export default function Campaign() {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("churn_prob");
  const [topPct, setTopPct] = useState(20);
  const [page, setPage] = useState(0);

  const metrics = useApi(api.metrics);
  const list = useApi(
    () => api.customers({ sort_by: sortBy, limit: PAGE, offset: page * PAGE }),
    [sortBy, page]
  );

  if (!metrics.data) return <Loading error={metrics.error} />;

  const roi = metrics.data.robic_roi;
  const offer = roi.assumptions.offer_cost;
  const n = Math.round((topPct / 100) * roi.customers);

  // Profit curve data
  const methods = [...new Set(roi.table.map((r) => r.method))];
  const curve = [...new Set(roi.table.map((r) => r.percent))].map((p) => ({
    percent: p,
    ...Object.fromEntries(
      methods.map((m) => [
        METHOD_LABEL[m],
        roi.table.find((r) => r.method === m && r.percent === p).profit,
      ])
    ),
  }));

  const best = roi.table.reduce((a, b) => (b.profit > a.profit ? b : a));
  const methodKey = sortBy === "churn_prob" ? "Churn risk" : "Uplift (T-learner)";
  const nearest = Math.min(100, Math.max(10, Math.round(topPct / 10) * 10));
  const row = roi.table.find((r) => r.method === methodKey && r.percent === nearest);

  const pages = Math.max(1, Math.ceil(n / PAGE));
  const rows = list.data ? list.data.items.filter((_, i) => page * PAGE + i < n) : [];

  return (
    <>
      <PageHeader
        badge="Causal Campaign Optimization"
        title="Discount Campaign Simulator"
      >
        Simulate targeted retention concessions (${offer} incentive) to maximize incremental customer lifetime value.
      </PageHeader>

      <KeyMessage>
        <b>Optimal Strategy Frontier:</b> Targeting the top <b>{best.percent}% of high-risk subscribers</b> (
        {best.contacted.toLocaleString()} accounts) yields peak program profitability of <b>{money(best.profit)}</b>.
        Intervening beyond this threshold diminishes ROI due to non-responder concession waste.
      </KeyMessage>

      <div className="campaign-controls-card">
        <div className="slider-group">
          <div className="slider-header">
            <span className="slider-label">Target Outreach Volume</span>
            <div className="slider-value-pill">
              {topPct}% of subscriber base ({n.toLocaleString()} accounts)
            </div>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={topPct}
            onChange={(e) => {
              setTopPct(Number(e.target.value));
              setPage(0);
            }}
          />
          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            {[10, 20, 30, 50].map((preset) => (
              <button
                key={preset}
                type="button"
                className={`ghost small ${topPct === preset ? "primary" : ""}`}
                style={{ padding: "3px 10px", fontSize: "12px" }}
                onClick={() => {
                  setTopPct(preset);
                  setPage(0);
                }}
              >
                {preset}% {preset === 20 ? "(Optimal)" : ""}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-main)" }}>
            Priority Ordering Strategy:
          </span>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(0);
            }}
            style={{ minWidth: "320px" }}
          >
            {Object.entries(SORTS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="stats three" style={{ margin: 0 }}>
          <Stat
            label="Gross Campaign Concessions"
            value={n.toLocaleString()}
            note={`$${offer} discount per account`}
            icon={UsersIcon}
          />
          <Stat
            label="Total Campaign Budget"
            value={money(n * offer)}
            note="Direct outreach cost"
            icon={DollarSignIcon}
          />
          <Stat
            label="Projected Net Profit"
            value={row ? money(row.profit) : "–"}
            note={
              row
                ? `≈ ${row.customers_saved.toLocaleString()} accounts preserved (${nearest}% cohort)`
                : ""
            }
            tone={row && row.profit > 0 ? "good" : "bad"}
            icon={TrendingUpIcon}
          />
        </div>
      </div>

      <Card
        title="Incremental Campaign Profitability Curve"
        subtitle="Net financial return comparing Causal Uplift vs Churn Risk vs Random Baseline"
      >
        <Legend items={methods.map((m) => [METHOD_LABEL[m], METHOD_COLORS[METHOD_LABEL[m]]])} />
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={curve} margin={{ top: 16, right: 24, left: 10, bottom: 0 }}>
            <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="percent"
              tick={{ fill: COLORS.axis, fontSize: 12 }}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              tick={{ fill: COLORS.axis, fontSize: 12 }}
              tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
              width={56}
            />
            <Tooltip
              labelFormatter={(v) => `Outreach to ${v}% of subscribers`}
              formatter={(v, name) => [money(v), name]}
            />
            <ReferenceLine y={0} stroke="#94a3b8" />
            <ReferenceLine
              x={nearest}
              stroke="#6366f1"
              strokeDasharray="4 4"
              strokeWidth={2}
              label={{
                value: "Active Plan",
                fontSize: 12,
                fontWeight: 700,
                fill: "#4f46e5",
                position: "insideTopRight",
              }}
            />
            <ReferenceDot
              x={best.percent}
              y={best.profit}
              r={7}
              fill="#2563eb"
              stroke="#ffffff"
              strokeWidth={3}
            />
            {methods.map((m) => (
              <Line
                key={m}
                type="monotone"
                dataKey={METHOD_LABEL[m]}
                stroke={METHOD_COLORS[METHOD_LABEL[m]]}
                strokeWidth={2.5}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <SimulatedNote />
      </Card>

      <Card
        title="Prioritized Campaign Call List"
        subtitle={`Top ${n.toLocaleString()} priority accounts ranked by intervention leverage. Click any row for deep account diagnostics.`}
      >
        {!list.data ? (
          <Loading error={list.error} />
        ) : (
          <div className="table-wrap">
            <table className="table clickable">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>Rank</th>
                  <th>Subscriber</th>
                  <th>Contract</th>
                  <th>Tenure</th>
                  <th>Monthly Charge</th>
                  <th>Chance of Staying</th>
                  <th>Prescribed Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c, i) => (
                  <tr
                    key={c.customerID}
                    onClick={() => navigate(`/customers/${c.customerID}`)}
                  >
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: "#f1f5f9",
                          textAlign: "center",
                          lineHeight: "24px",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#64748b",
                        }}
                      >
                        {page * PAGE + i + 1}
                      </span>
                    </td>
                    <td>
                      <div>
                        <b>{c.name}</b>
                        <div className="muted small">{c.customerID}</div>
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
                      <ActionBadge action={c.recommended_action} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pager">
          <button
            className="ghost pager-btn"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeftIcon size={14} />
            <span>Previous</span>
          </button>
          <span>
            Page <b>{page + 1}</b> of <b>{pages}</b>
          </span>
          <button
            className="ghost pager-btn"
            disabled={page + 1 >= pages}
            onClick={() => setPage(page + 1)}
          >
            <span>Next</span>
            <ChevronRightIcon size={14} />
          </button>
        </div>
      </Card>
    </>
  );
}
