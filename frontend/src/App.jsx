import React, { useEffect, useRef, useState } from "react";
import { NavLink, Route, Routes, Link, useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Customers from "./pages/Customers.jsx";
import CustomerDetail from "./pages/CustomerDetail.jsx";
import Campaign from "./pages/Campaign.jsx";
import Models from "./pages/Models.jsx";
import Predictor from "./pages/Predictor.jsx";
import { ViewModeProvider, useViewMode } from "./context/ViewModeContext.jsx";
import { api } from "./api.js";
import { Glyph, Segmented } from "./components/clay.jsx";

const PERSONAS = [
  { value: "manager", label: "Manager", icon: "tie" },
  { value: "agent", label: "Support Agent", icon: "headset" },
  { value: "tech", label: "Data Scientist", icon: "flask" },
];

const NAV = [
  { to: "/", label: "Overview", icon: "home", end: true },
  { to: "/customers", label: "Who to call", icon: "users" },
  { to: "/campaign", label: "Campaign planner", icon: "calc" },
  { to: "/predict", label: "Check customer", icon: "search" },
  { to: "/models", label: "Models", icon: "chart" },
];

function timeAgo(iso) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
}

// Bell popover: the latest contacts logged in the database (GET /contacts)
function Notifications() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    api.recentContacts({ limit: 6 }).then(setItems).catch(() => setItems([]));
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <div className="notif" ref={ref}>
      <button type="button" className="round-btn" aria-label="Recent activity" aria-expanded={open}
        onClick={() => setOpen((o) => !o)}>
        {Glyph.bell({ size: 20 })}
      </button>
      {open && (
        <div className="notif-pop clay-raised" role="dialog" aria-label="Recent activity">
          <b className="notif-title">Recent activity</b>
          {items == null ? (
            <p className="muted">Loading…</p>
          ) : items.length === 0 ? (
            <p className="muted">No contacts logged yet. Open a customer and use the contact log to record a call.</p>
          ) : (
            <ul>
              {items.map((c) => (
                <li key={c.id}>
                  <Link to={`/customers/${c.customer_id}`} onClick={() => setOpen(false)}>
                    <b>{c.customer_name || c.customer_id}</b>
                    <span>{c.channel} · {c.outcome}</span>
                    <small>{timeAgo(c.created_at)}</small>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function AppContent() {
  const { viewMode, setViewMode } = useViewMode();
  const navigate = useNavigate();
  const persona = viewMode === "scientist" ? "tech" : viewMode;

  const handleExport = async () => {
    try {
      const res = await api.customers({ limit: 500, sort_by: "churn_prob" });
      if (!res?.items?.length) return;
      const headers = ["Customer ID", "Name", "Region", "Contract", "Tenure Months", "Monthly Bill", "Chance of Staying", "Risk Level", "Recommended Action"];
      const rows = res.items.map((c) => [
        `"${c.customerID}"`, `"${c.name}"`, `"${c.region}"`, `"${c.Contract}"`, c.tenure, c.MonthlyCharges,
        `${Math.round(c.chance_of_staying * 100)}%`, `"${c.risk_level}"`, `"${c.recommended_action}"`,
      ].join(","));
      const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `robic_customers_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
    } catch {
      /* the page itself shows the backend error */
    }
  };

  return (
    <div className="clay-app">
      <header className="clay-topbar clay-raised">
        <Link to="/" className="clay-brand" aria-label="Robic home">
          <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
            <defs>
              <linearGradient id="brand-g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#F78C8F" /><stop offset="1" stopColor="#E5484D" />
              </linearGradient>
            </defs>
            <circle cx="9" cy="31" r="4.5" fill="url(#brand-g)" />
            <path d="M6 19a15 15 0 0 1 15 15" stroke="url(#brand-g)" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M6 8a26 26 0 0 1 26 26" stroke="url(#brand-g)" strokeWidth="5" strokeLinecap="round" fill="none" />
          </svg>
          <span>
            <b>Robic</b>
            <small>Customer Retention Platform</small>
          </span>
        </Link>

        <Segmented label="Choose your view" options={PERSONAS} value={persona}
          onChange={(v) => { setViewMode(v); navigate("/"); }} />

        <div className="clay-top-actions">
          <button type="button" className="round-btn" onClick={handleExport} aria-label="Export customer list as CSV"
            title="Export customer list (CSV)">
            {Glyph.download({ size: 20 })}
          </button>
          <Notifications />
          <span className="user-avatar" aria-label="Signed in user">DD</span>
        </div>
      </header>

      <div className="clay-body">
        <nav className="clay-sidebar clay-raised" aria-label="Main">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} aria-label={item.label} data-tip={item.label}
              className={({ isActive }) => `side-btn ${isActive ? "is-active" : ""}`}>
              {Glyph[item.icon]({ size: 22 })}
            </NavLink>
          ))}
        </nav>

        <main className="clay-main main-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/campaign" element={<Campaign />} />
            <Route path="/models" element={<Models />} />
            <Route path="/predict" element={<Predictor />} />
          </Routes>
        </main>
      </div>

      <footer className="clay-footer">
        Robic Customer Retention · Random Forest churn model · T-learner uplift model (Logistic Regression) ·
        IBM Telco data, 7,043 customers
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ViewModeProvider>
      <AppContent />
    </ViewModeProvider>
  );
}
