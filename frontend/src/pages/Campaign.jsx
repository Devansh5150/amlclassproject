// Page 4: "Plan a campaign": choose how many customers to contact, see cost/profit and the call list.
import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api.js";
import { ActionBadge, Card, Details, KeyMessage, Legend, Loading, PageHeader, SimulatedNote, Stat, useApi } from "../components/ui.jsx";
import { COLORS, METHOD_COLORS, METHOD_LABEL, money, pct } from "../theme.js";

const SORTS = {
  churn_prob: "Most likely to leave (recommended)",
  uplift_score: "Most likely to respond to discount",
};
const PAGE = 20;

export default function Campaign() {
  const [sortBy, setSortBy] = useState("churn_prob");
  const [topPct, setTopPct] = useState(20);
  const [page, setPage] = useState(0);
  const customers = useApi(() => api.customers(sortBy), [sortBy]);
  const metrics = useApi(api.metrics);

  const selected = useMemo(() => {
    if (!customers.data) return [];
    return customers.data.items.slice(0, Math.round((topPct / 100) * customers.data.total));
  }, [customers.data, topPct]);

  if (!customers.data || !metrics.data) return <Loading error={customers.error || metrics.error} />;

  const roi = metrics.data.roi;
  const offer = customers.data.offer_cost;

  // Profit curve for the chosen method (plus the other two for comparison)
  const methods = [...new Set(roi.table.map((r) => r.method))];
  const curve = [...new Set(roi.table.map((r) => r.percent))].map((p) => ({
    percent: p, ...Object.fromEntries(methods.map((m) => [METHOD_LABEL[m], roi.table.find((r) => r.method === m && r.percent === p).profit])),
  }));
  const best = roi.table.reduce((a, b) => (b.profit > a.profit ? b : a));

  // Campaign numbers for the slider choice (from the ROI table: nearest 10%)
  const methodKey = sortBy === "churn_prob" ? "Churn risk" : "Uplift (T-learner)";
  const nearest = Math.min(100, Math.max(10, Math.round(topPct / 10) * 10));
  const row = roi.table.find((r) => r.method === methodKey && r.percent === nearest);
  const cost = selected.length * offer;

  const rows = selected.slice(page * PAGE, page * PAGE + PAGE);
  const pages = Math.max(1, Math.ceil(selected.length / PAGE));

  return (
    <>
      <PageHeader title="Plan a discount campaign">
        Choose how many customers to contact. We'll show the cost, the expected profit, and exactly who to call.
      </PageHeader>

      <KeyMessage>
        Best plan: contact the <b>top {best.percent}% most likely to leave</b>, for an expected profit of
        about <b>{money(best.profit)}</b>. Contacting more people than that costs more than it earns.
      </KeyMessage>

      <Card>
        <div className="controls">
          <label className="slider">
            <span>How many customers can you contact?</span>
            <input type="range" min="5" max="100" step="5" value={topPct}
                   onChange={(e) => { setTopPct(Number(e.target.value)); setPage(0); }} />
            <b>{topPct}% ({selected.length.toLocaleString()} customers)</b>
          </label>
          <label>
            <span>Who to contact first?</span>
            <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(0); }}>
              {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
        </div>
        <div className="stats three">
          <Stat label="Discounts sent" value={selected.length.toLocaleString()} note={`$${offer} each`} />
          <Stat label="Total cost" value={money(cost)} />
          <Stat label="Expected profit" value={row ? money(row.profit) : "–"} note={row ? `after paying for the discounts (≈ ${nearest}% plan)` : ""} />
        </div>
      </Card>

      <Card title="💰 Profit for each campaign size" subtitle="The dot marks the most profitable plan. The dashed line is your current choice.">
        <Legend items={methods.map((m) => [METHOD_LABEL[m], METHOD_COLORS[METHOD_LABEL[m]]])} />
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={curve} margin={{ top: 10, right: 16 }}>
            <CartesianGrid stroke={COLORS.grid} />
            <XAxis dataKey="percent" tick={{ fill: COLORS.axis, fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
            <YAxis domain={[-5000, "auto"]} tick={{ fill: COLORS.axis, fontSize: 12 }} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} width={44} />
            <Tooltip labelFormatter={(v) => `Contact ${v}% of customers`} formatter={(v, n) => [money(v), n]} />
            <ReferenceLine y={0} stroke={COLORS.axis} />
            <ReferenceLine x={nearest} stroke={COLORS.axis} strokeDasharray="3 3" label={{ value: "your plan", fontSize: 11, position: "insideTopRight" }} />
            <ReferenceDot x={best.percent} y={best.profit} r={6} fill={COLORS.blue} stroke="white" strokeWidth={2} />
            {methods.map((m) => (
              <Line key={m} dataKey={METHOD_LABEL[m]} stroke={METHOD_COLORS[METHOD_LABEL[m]]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <SimulatedNote />
      </Card>

        <Card title="📞 Call list" subtitle={`The ${selected.length.toLocaleString()} customers to contact, most important first`}>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>#</th><th>Customer</th><th>Contract</th><th>Months with us</th><th>Monthly bill</th><th>Chance of leaving</th><th>What to do</th></tr></thead>
              <tbody>
                {rows.map((c, i) => (
                  <tr key={c.customerID}>
                    <td className="muted">{page * PAGE + i + 1}</td>
                    <td>{c.customerID}</td>
                    <td>{c.Contract}</td>
                    <td>{c.tenure}</td>
                    <td>${c.MonthlyCharges.toFixed(0)}</td>
                    <td>{pct(c.churn_prob)}</td>
                    <td><ActionBadge action={c.recommended_action} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pager">
            <button className="ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>← Previous</button>
            Page {page + 1} of {pages}
            <button className="ghost" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>Next →</button>
          </div>
        </Card>

      <Details title="Technical details (for the viva)">
        <p>Assumptions (from <code>params.yaml</code>): offer cost ${roi.assumptions.offer_cost}; customer value = monthly bill × {roi.assumptions.clv_months} months
          (average {money(roi.assumptions.avg_customer_value)}). Profit = Σ(true simulated effect × customer value) − cost, on {roi.test_customers.toLocaleString()} held-out test customers.</p>
        <ul className="takeaways">{roi.recommendation.map((r) => <li key={r}>{r}</li>)}</ul>
      </Details>
    </>
  );
}
