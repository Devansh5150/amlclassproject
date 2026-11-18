import React, { useEffect, useState } from "react";
import { ACTION_STYLE, RISK_STYLE, pct } from "../theme.js";
import { API_URL } from "../api.js";
import {
  SparklesIcon,
  AlertTriangleIcon,
  InfoIcon,
  ChevronRightIcon,
  RefreshCwIcon,
  ShieldCheckIcon
} from "./icons.jsx";

// Load data from the API; re-runs when `deps` change. Returns { data, error, loading }.
export function useApi(fn, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fn()
      .then((d) => {
        if (alive) {
          setData(d);
          setError(null);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (alive) {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, loading };
}

export function Loading({ error }) {
  if (error) {
    return (
      <div className="card error-card">
        <div className="error-icon-box">
          <AlertTriangleIcon size={20} />
        </div>
        <div>
          <h4>Can't reach the backend</h4>
          <p>
            This page expects the FastAPI backend at <code>{API_URL}</code>. Start it with <code>start.bat</code>,
            then refresh. If another app is using that port, close it first.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="loading-state">
      <div className="spinner"></div>
      <p className="loading-text">Analyzing customer portfolio…</p>
    </div>
  );
}

export function Stat({ label, value, note, tone, icon: IconComponent }) {
  return (
    <div className={`stat-card ${tone ? `stat-${tone}` : ""}`}>
      <div className="stat-card-top">
        <span className="stat-label">{label}</span>
        {IconComponent && (
          <div className="stat-icon-wrapper">
            <IconComponent size={18} />
          </div>
        )}
      </div>
      <div className={`stat-value ${tone || ""}`}>{value}</div>
      {note && <div className="stat-note">{note}</div>}
    </div>
  );
}

export function Card({ title, subtitle, children, action, className = "" }) {
  return (
    <section className={`card ${className}`}>
      {(title || subtitle || action) && (
        <div className="card-head">
          <div>
            {title && <h3>{title}</h3>}
            {subtitle && <p className="subtitle">{subtitle}</p>}
          </div>
          {action && <div className="card-head-action">{action}</div>}
        </div>
      )}
      <div className="card-content">{children}</div>
    </section>
  );
}

export function PageHeader({ title, children, right, badge }) {
  return (
    <div className="page-header">
      <div className="page-header-content">
        {badge && <div className="page-badge">{badge}</div>}
        <h1 className="page-title">{title}</h1>
        {children && <p className="lead">{children}</p>}
      </div>
      {right && <div className="page-header-right">{right}</div>}
    </div>
  );
}

export function KeyMessage({ children }) {
  return (
    <div className="key-message">
      <div className="key-message-icon">
        <SparklesIcon size={18} />
      </div>
      <div className="key-message-body">{children}</div>
    </div>
  );
}

export function ActionBadge({ action, large }) {
  const s = ACTION_STYLE[action] || {
    label: action,
    color: "#475569",
    bg: "#f1f5f9",
    border: "#cbd5e1",
    icon: "•",
  };
  return (
    <span
      className={`badge badge-action ${large ? "large" : ""}`}
      style={{
        color: s.color,
        backgroundColor: s.bg,
        borderColor: s.border,
      }}
    >
      <span className="badge-icon">{s.icon}</span>
      <span className="badge-text">{s.label}</span>
    </span>
  );
}

export function RiskBadge({ level }) {
  const s = RISK_STYLE[level] || {
    label: level,
    color: "#64748b",
    bg: "#f1f5f9",
    border: "#cbd5e1",
    icon: "•",
  };
  return (
    <span
      className="badge badge-risk"
      style={{
        color: s.color,
        backgroundColor: s.bg,
        borderColor: s.border,
      }}
    >
      <span className="badge-icon">{s.icon}</span>
      <span className="badge-text">{s.label}</span>
    </span>
  );
}

// "Chance of staying" as a number + sleek progress bar
export function StayBar({ value }) {
  const color =
    value >= 0.7
      ? "linear-gradient(90deg, #10b981 0%, #059669 100%)"
      : value >= 0.4
      ? "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)"
      : "linear-gradient(90deg, #f43f5e 0%, #e11d48 100%)";

  const textColor =
    value >= 0.7 ? "#059669" : value >= 0.4 ? "#d97706" : "#e11d48";

  return (
    <div className="staybar">
      <span className="staybar-value" style={{ color: textColor }}>
        {pct(value)}
      </span>
      <div className="staybar-track">
        <div
          className="staybar-fill"
          style={{ width: pct(value), background: color }}
        />
      </div>
    </div>
  );
}

export function SimulatedNote() {
  return (
    <div className="sim-note-box">
      <InfoIcon size={15} className="sim-note-icon" />
      <span className="sim-note-text">
        Robic has no record of past discounts, so the discount's effect is an{" "}
        <b>estimate based on a simulated uplift trial</b>. Treat these figures as a strategic guide.
      </span>
    </div>
  );
}

export function Details({ title = "Technical details & Methodology", children }) {
  const [open, setOpen] = useState(false);
  return (
    <details className="details" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>
        <span className="summary-title">{title}</span>
        <ChevronRightIcon size={16} className={`summary-arrow ${open ? "rotated" : ""}`} />
      </summary>
      <div className="details-body">{children}</div>
    </details>
  );
}

export function Legend({ items }) {
  return (
    <div className="legend">
      {items.map(([label, color]) => (
        <span key={label} className="legend-item">
          <i style={{ background: color }} />
          <span>{label}</span>
        </span>
      ))}
    </div>
  );
}
