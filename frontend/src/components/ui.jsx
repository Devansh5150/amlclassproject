// Small reusable building blocks used by every page.
import { useEffect, useState } from "react";
import { ACTION_STYLE } from "../theme.js";

// Load data from the API once; returns { data, error }.
export function useApi(fn, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    fn().then(setData).catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, error };
}

export function Loading({ error }) {
  if (error)
    return (
      <div className="card error">
        The app can't reach its data right now. Make sure the backend window is open
        (double-click <code>start.bat</code>), then refresh this page.
      </div>
    );
  return <div className="card muted">Loading…</div>;
}

export function Stat({ label, value, note }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {note && <div className="stat-note">{note}</div>}
    </div>
  );
}

export function Card({ title, subtitle, children }) {
  return (
    <section className="card">
      {title && <h3>{title}</h3>}
      {subtitle && <p className="subtitle">{subtitle}</p>}
      {children}
    </section>
  );
}

// Page header: big title + one plain sentence
export function PageHeader({ title, children }) {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      <p className="lead">{children}</p>
    </div>
  );
}

// The one key message of a page, in a highlighted box
export function KeyMessage({ children }) {
  return <div className="key-message">💡 {children}</div>;
}

export function ActionBadge({ action, large }) {
  const s = ACTION_STYLE[action] || { label: action, color: "#52514e", icon: "•" };
  return (
    <span className={`badge ${large ? "large" : ""}`} style={{ borderColor: s.color }}>
      <span style={{ color: s.color }}>{s.icon}</span> {s.label}
    </span>
  );
}

export function SimulatedNote() {
  return (
    <p className="sim-note">
      ⓘ Our data doesn't record who got discounts in the past, so the discount's effect is an
      <b> estimate based on a simulated test</b>. Treat these numbers as an example, not a promise.
    </p>
  );
}

// Collapsed-by-default box for technical content (for the viva / curious readers)
export function Details({ title = "Technical details", children }) {
  return (
    <details className="details">
      <summary>{title}</summary>
      <div className="details-body">{children}</div>
    </details>
  );
}

// Simple legend (always shown for 2+ series, so color is never the only cue)
export function Legend({ items }) {
  return (
    <div className="legend">
      {items.map(([label, color]) => (
        <span key={label}>
          <i style={{ background: color }} />
          {label}
        </span>
      ))}
    </div>
  );
}
