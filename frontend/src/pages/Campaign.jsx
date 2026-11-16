// Page 4: Campaign targeting: ranked customer list + estimated ROI.
import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api.js";
import { ActionBadge, Card, Legend, Loading, SimulatedBanner, Stat, useApi } from "../components/ui.jsx";
import { COLORS, METHOD_COLORS, money, pct } from "../theme.js";

const SORTS = {
  uplift_score: "Uplift score",
  churn_prob: "Churn risk",
  expected_offer_profit: "Expected offer profit",
};
const PAGE = 25;

export default function Campaign() {
  const [sortBy, setSortBy] = useState("uplift_score");
  const [topPct, setTopPct] = useState(20);
  const [page, setPage] = useState(0);
  const customers = useApi(() => api.customers(sortBy), [sortBy]);
  const metrics = useApi(api.metrics);

  const selected = useMemo(() => {
    if (!customers.data) return [];
    const n = Math.round((topPct / 100) * customers.data.total);
    return customers.data.items.slice(0, n);
  }, [customers.data, topPct]);

  if (!customers.data || !metrics.data) return <Loading error={customers.error || metrics.error} />;

  const roi = metrics.data.roi;
  const methods = [...new Set(roi.table.map((r) => r.method))];
  const roiChart = roi.assumptions && [...new Set(roi.table.map((r) => r.percent))].map((p) => ({
    percent: p, ...Object.fromEntries(methods.map((m) => [m, roi.table.find((r) => r.method === m && r.percent === p).profit])),
  }));

  // Model-estimated campaign economics for the selected customers
  const cost = selected.length * customers.data.offer_cost;
  const estProfit = selected.reduce((s, c) => s + c.expected_offer_profit, 0);
  const rows = selected.slice(page * PAGE, page * PAGE + PAGE);
  const pages = Math.max(1, Math.ceil(selected.length / PAGE));

  return (
    <>
      <h1>Campaign targeting</h1>
      <p className="lead">Pick how to rank customers and how many to contact. Each offer costs ${customers.data.offer_cost}.</p>
      <SimulatedBanner />

      <Card title="Profit by campaign size" subtitle={`True simulated profit on ${roi.test_customers.toLocaleString()} test customers · offer $${roi.assumptions.offer_cost} · value = ${roi.assumptions.clv_months} × monthly bill`}>
        <Legend items={methods.map((m) => [m, METHOD_COLORS[m]])} />
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={roiChart}>
            <CartesianGrid stroke={COLORS.grid} />
            <XAxis dataKey="percent" tick={{ fill: COLORS.axis, fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
            <YAxis tick={{ fill: COLORS.axis, fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} width={48} />
            <Tooltip labelFormatter={(v) => `Contact top ${v}%`} formatter={(v) => money(v)} />
            <ReferenceLine x={topPct} stroke={COLORS.axis} strokeDasharray="3 3" />
            <ReferenceLine y={0} stroke={COLORS.axis} />
            {methods.map((m) => <Line key={m} dataKey={m} stroke={METHOD_COLORS[m]} strokeWidth={2} dot={{ r: 3 }} />)}
          </LineChart>
        </ResponsiveContainer>
        <ul className="takeaways">{roi.recommendation.map((r) => <li key={r}>{r}</li>)}</ul>
      </Card>

      <div className="controls">
        <label>Rank by
          <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(0); }}>
            {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label>Contact top <b>{topPct}%</b>
          <input type="range" min="5" max="100" step="5" value={topPct} onChange={(e) => { setTopPct(Number(e.target.value)); setPage(0); }} />
        </label>
      </div>

      <div className="stats">
        <Stat label="Customers contacted" value={selected.length.toLocaleString()} note={`of ${customers.data.total.toLocaleString()}`} />
        <Stat label="Campaign cost" value={money(cost)} />
        <Stat label="Model-estimated profit" value={money(estProfit)} note="sum of uplift × value − cost" />
        <Stat label="Estimated ROI" value={cost ? pct(estProfit / cost) : "–"} />
      </div>

      <Card title={`Top ${topPct}% ranked by ${SORTS[sortBy].toLowerCase()}`}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>#</th><th>Customer</th><th>Contract</th><th>Tenure</th><th>Internet</th><th>Monthly</th><th>Churn risk</th><th>Uplift</th><th>Exp. profit</th><th>Action</th></tr>
            </thead>
            <tbody>
              {rows.map((c, i) => (
                <tr key={c.customerID}>
                  <td className="muted">{page * PAGE + i + 1}</td>
                  <td>{c.customerID}</td>
                  <td>{c.Contract}</td>
                  <td>{c.tenure}</td>
                  <td>{c.InternetService}</td>
                  <td>${c.MonthlyCharges.toFixed(0)}</td>
                  <td>{pct(c.churn_prob)}</td>
                  <td>{c.uplift_score >= 0 ? "+" : ""}{(c.uplift_score * 100).toFixed(1)} pts</td>
                  <td>{money(c.expected_offer_profit)}</td>
                  <td><ActionBadge action={c.recommended_action} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pager">
          <button className="ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>← Prev</button>
          Page {page + 1} of {pages}
          <button className="ghost" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>Next →</button>
        </div>
      </Card>
    </>
  );
}
