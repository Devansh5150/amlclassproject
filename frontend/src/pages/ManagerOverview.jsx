// Manager overview (/manager). Every number comes from the API:
// GET /summary (customers, risk, actions, churn drivers) and GET /metrics (campaign profit table).
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { api } from "../api.js";
import { Loading, useApi } from "../components/ui.jsx";
import { IconTile, SimulationBanner } from "../components/kit.jsx";

const RISK = [
  { key: "High", label: "High risk", color: "#E11D48", mark: "▲" },
  { key: "Medium", label: "Medium risk", color: "#D97706", mark: "●" },
  { key: "Low", label: "Low risk", color: "#059669", mark: "▼" },
];

const ACTIONS = [
  { key: "Send retention offer", label: "Send the discount", icon: "tag", tone: "emerald" },
  { key: "Try non-discount retention", label: "Call them instead", icon: "phone", tone: "amber" },
  { key: "No action needed", label: "No need, likely to stay", icon: "check", tone: "slate" },
  { key: "Do not contact", label: "Don't contact", icon: "ban", tone: "rose" },
];

const METHODS = [
  { key: "Churn risk", label: "Churn risk", color: "#2563EB" },
  { key: "Uplift (T-learner)", label: "Uplift model", color: "#EA580C" },
  { key: "Random", label: "Random", color: "#94A3B8" },
];

const k = (v) => `${v < 0 ? "−" : ""}$${Math.round(Math.abs(v) / 1000)}k`;
const pc = (v, d = 0) => `${(v * 100).toFixed(d)}%`;
const n = (v) => v.toLocaleString("en-US");
const initials = (name) => name.split(" ").map((p) => p[0]).join("");

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning!" : h < 17 ? "Good afternoon!" : "Good evening!";
}

// Churn rate (1 - retention) for one group of a /summary breakdown
const churnOf = (rows, group) => 1 - (rows.find((r) => r.group === group)?.retention ?? 1);

function ProfitTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="ax-tooltip">
      <b>{label}% of customers contacted</b>
      {payload.map((p) => (
        <div key={p.dataKey}>
          <i style={{ background: p.color }} />
          {METHODS.find((m) => m.key === p.dataKey).label}
          <span className="mono">{k(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function ManagerOverview() {
  const navigate = useNavigate();
  const { data: s, error } = useApi(api.summary);
  const { data: m, error: mError } = useApi(api.metrics);
  if (!s || !m) return <Loading error={error || mError} />;

  // ---- campaign profit table -> one row per contact percentage
  const table = m.robic_roi.table;
  const percents = [...new Set(table.map((r) => r.percent))].sort((a, b) => a - b);
  const curve = percents.map((p) => {
    const row = { percent: p };
    METHODS.forEach(({ key }) => {
      row[key] = table.find((r) => r.method === key && r.percent === p)?.profit ?? null;
    });
    return row;
  });
  const peakOf = (key) => table.filter((r) => r.method === key).reduce((a, b) => (b.profit > a.profit ? b : a));
  const best = peakOf("Churn risk");
  const upliftPeak = peakOf("Uplift (T-learner)");
  const randomPeak = peakOf("Random");
  const at20 = table.find((r) => r.method === "Churn risk" && r.percent === 20);

  // ---- why customers leave (live churn rates from /summary)
  const autoPay = Math.min(
    churnOf(s.retention_by_payment, "Bank transfer (automatic)"),
    churnOf(s.retention_by_payment, "Credit card (automatic)"),
  );
  const reasons = [
    { icon: "calendar", title: "Month-to-month contract",
      text: `${pc(churnOf(s.retention_by_contract, "Month-to-month"))} leave vs ${pc(churnOf(s.retention_by_contract, "Two year"))} on 2-year` },
    { icon: "hourglass", title: "Short tenure",
      text: `${pc(churnOf(s.retention_by_tenure, "0-6 months"))} leave in the first 6 months vs ${pc(churnOf(s.retention_by_tenure, "4+ years"))} after 4 years` },
    { icon: "wifi", title: "Fiber-optic internet",
      text: `${pc(churnOf(s.retention_by_internet, "Fiber optic"))} leave vs ${pc(churnOf(s.retention_by_internet, "DSL"))} on DSL` },
    { icon: "card", title: "Electronic-check payment",
      text: `${pc(churnOf(s.retention_by_payment, "Electronic check"))} leave vs ${pc(autoPay)} on auto-pay` },
    { icon: "headset", title: "No tech support", text: "31% leave vs 15% with tech support" },
    { icon: "stack", title: "High bills", text: "Higher monthly bills go with higher churn" },
  ];

  const riskData = RISK.map((r) => ({ ...r, value: s.risk_counts[r.key] }));
  const total = s.n_customers;

  return (
    <div className="ov">
      <div className="ov-main">
        {/* ---------- welcome ---------- */}
        <header className="ov-hero ax-raised">
          <div className="ov-hero-text">
            <h1>{greeting()} <span aria-hidden="true">👋</span></h1>
            <p>Here's your retention snapshot for <b className="mono">{n(total)}</b> customers.</p>
          </div>
        </header>

        {/* ---------- KPIs ---------- */}
        <section className="ov-kpis" aria-label="Key figures">
          {[
            { icon: "users", tone: "lavender", value: n(total), label: "Total customers" },
            { icon: "heart", tone: "rose", value: pc(s.retention_rate, 1), label: "Retention rate" },
            { icon: "coins", tone: "amber", value: k(s.monthly_revenue), label: "Monthly revenue" },
            { icon: "alert", tone: "rose", value: k(s.monthly_revenue_at_risk), label: "Revenue at risk", note: "from high-risk customers" },
          ].map((c) => (
            <article key={c.label} className="kpi ax-raised ax-hover">
              <IconTile name={c.icon} tone={c.tone} size={58} glyph={26} />
              <div>
                <div className="kpi-value mono">{c.value}</div>
                <div className="kpi-label">{c.label}</div>
                {c.note && <div className="kpi-note">{c.note}</div>}
              </div>
            </article>
          ))}
        </section>

        <div className="ov-row ov-row-a">
          {/* ---------- risk donut ---------- */}
          <section className="ax-raised panel">
            <h2 className="panel-title">Customer risk distribution</h2>
            <div className="risk-body">
              <div className="donut ax-recessed">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskData} dataKey="value" nameKey="label" innerRadius="70%" outerRadius="94%"
                      startAngle={90} endAngle={-270} paddingAngle={2} cornerRadius={6} stroke="none" isAnimationActive={false}>
                      {riskData.map((r) => <Cell key={r.key} fill={r.color} />)}
                    </Pie>
                    <Tooltip formatter={(v, name) => [`${n(v)} (${pc(v / total, 1)})`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-center">
                  <b className="mono">{n(total)}</b>
                  <span>customers</span>
                </div>
              </div>
              <ul className="risk-legend">
                {riskData.map((r) => (
                  <li key={r.key}>
                    <button type="button" onClick={() => navigate(`/customers?risk=${r.key}`)}>
                      <span className="risk-mark" style={{ color: r.color }} aria-hidden="true">{r.mark}</span>
                      <span className="risk-name">{r.label}</span>
                      <span className="mono risk-n">{n(r.value)}</span>
                      <span className="mono muted">({pc(r.value / total, 1)})</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ---------- actions ---------- */}
          <section className="ax-raised panel">
            <h2 className="panel-title">Recommended actions <span className="muted">(all customers)</span></h2>
            <div className="action-tiles">
              {ACTIONS.map((a) => (
                <button key={a.key} type="button" className={`action-tile tone-${a.tone} ax-hover`}
                  onClick={() => navigate(`/customers?action=${encodeURIComponent(a.key)}`)}>
                  <IconTile name={a.icon} tone={a.tone} size={40} glyph={20} />
                  <b className="mono">{n(s.action_counts[a.key] || 0)}</b>
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="ov-row ov-row-b">
          {/* ---------- profit simulation ---------- */}
          <section className="ax-raised panel">
            <div className="panel-head">
              <h2 className="panel-title">Campaign profit simulation</h2>
              <ul className="line-legend">
                {METHODS.map((mt) => (
                  <li key={mt.key}><i style={{ background: mt.color }} />{mt.label}{mt.key === "Churn risk" && " (best)"}</li>
                ))}
              </ul>
            </div>
            <div className="chart-well ax-recessed">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={curve} margin={{ top: 34, right: 18, left: 4, bottom: 18 }}>
                  <CartesianGrid stroke="#F5DEDB" strokeDasharray="4 6" vertical={false} />
                  <XAxis dataKey="percent" tickFormatter={(v) => `${v}%`} tick={{ fill: "#7D6A6D", fontSize: 12 }}
                    axisLine={false} tickLine={false}
                    label={{ value: "% of customers contacted", position: "insideBottom", offset: -12, fill: "#7D6A6D", fontSize: 12 }} />
                  <YAxis tickFormatter={k} tick={{ fill: "#7D6A6D", fontSize: 12 }} axisLine={false} tickLine={false} width={52} />
                  <Tooltip content={<ProfitTooltip />} />
                  <ReferenceLine x={best.percent} stroke="#E5484D" strokeDasharray="5 5" strokeWidth={1.5}
                    label={{ value: `Peak ${k(best.profit)} at ${best.percent}%`, position: "top", fill: "#7A1E24", fontSize: 12, fontWeight: 700 }} />
                  {METHODS.map((mt) => (
                    <Line key={mt.key} type="monotone" dataKey={mt.key} stroke={mt.color}
                      strokeWidth={mt.key === "Random" ? 2 : 3}
                      dot={{ r: 3.5, fill: "#fff", stroke: mt.color, strokeWidth: 2 }}
                      activeDot={{ r: 6 }} isAnimationActive={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="panel-foot">Profit peaks at about <b>{best.percent}%</b> contacted. Beyond that, extra offers go to people who would stay anyway or react badly.</p>
          </section>

          {/* ---------- investment summary ---------- */}
          <section className="ax-raised panel">
            <h2 className="panel-title with-icon"><IconTile name="calc" tone="indigo" size={34} glyph={17} />Investment summary</h2>
            <dl className="summary-rows">
              <div><dt>Best strategy</dt><dd><span className="pill pill-indigo">Churn-risk targeting</span></dd></div>
              <div><dt>Peak profit</dt><dd><span className="pill pill-emerald mono">{k(best.profit)} at {best.percent}%</span></dd></div>
              <div><dt>Profit at 20%</dt><dd><span className="pill mono">{k(at20.profit)}</span></dd></div>
              <div><dt>Uplift model peak</dt><dd><span className="pill mono">{k(upliftPeak.profit)} at {upliftPeak.percent}%</span></dd></div>
              <div><dt>Random targeting</dt><dd><span className="pill mono">~{k(randomPeak.profit)} max</span></dd></div>
            </dl>
            <Link to="/campaign" className="ax-button">Plan a campaign</Link>
          </section>
        </div>

        {/* ---------- accounts to rescue ---------- */}
        <section className="ax-raised panel">
          <div className="panel-head">
            <h2 className="panel-title">Accounts to rescue first</h2>
            <Link to="/customers" className="text-link">See all customers</Link>
          </div>
          <ul className="rescue-grid">
            {s.top_at_risk.slice(0, 6).map((c) => (
              <li key={c.customerID}>
                <Link to={`/customers/${c.customerID}`} className="rescue-item ax-hover">
                  <span className="avatar">{initials(c.name)}</span>
                  <span className="rescue-who">
                    <b>{c.name}</b>
                    <small>{c.Contract} · {c.tenure} mo · <span className="mono">${c.MonthlyCharges.toFixed(0)}</span>/mo</small>
                  </span>
                  <span className="rescue-stay">
                    <span className="mono">{pc(c.chance_of_staying)}</span>
                    <small>chance of staying</small>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <SimulationBanner />
      </div>

      {/* ---------- right column ---------- */}
      <aside className="ov-side">
        <section className="ax-raised panel takeaway">
          <h2 className="panel-title with-icon"><IconTile name="sparkle" tone="indigo" size={34} glyph={17} />Key takeaway</h2>
          <p>Contacting about {best.percent}% of customers gives the highest profit.</p>
          <div className="takeaway-figure ax-raised">
            <IconTile name="chart" tone="indigo" size={46} glyph={22} />
            <div>
              <b className="mono">{k(best.profit)}</b>
              <span>Peak campaign profit ({best.percent}% contacted)</span>
            </div>
          </div>
        </section>

        <section className="ax-raised panel">
          <h2 className="panel-title">Why customers leave</h2>
          <ul className="reasons">
            {reasons.map((r) => (
              <li key={r.title} className="reason ax-raised">
                <IconTile name={r.icon} tone="lavender" size={38} glyph={18} />
                <div>
                  <b>{r.title}</b>
                  <span>{r.text}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  );
}
