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
        Could not reach the backend: {error}
        <br />
        Is it running? <code>uvicorn backend.app.main:app --reload</code>
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

export function ActionBadge({ action }) {
  const s = ACTION_STYLE[action] || { color: "#52514e", icon: "•" };
  return (
    <span className="badge" style={{ borderColor: s.color }}>
      <span style={{ color: s.color }}>{s.icon}</span> {action}
    </span>
  );
}

export function SimulatedBanner() {
  return (
    <div className="banner">
      ⚠ <b>Simulated:</b> the dataset has no real retention offer, so the offer and its effect are
      simulated with documented assumptions. Uplift numbers show the method, not real campaign results.
    </div>
  );
}

// Simple legend (always shown for 2+ series, so color is never the only cue)
export function Legend({ items }) {
  return (
    <div className="legend">
      {items.map(([label, color, dashed]) => (
        <span key={label}>
          <i style={{ background: dashed ? "transparent" : color, borderTop: dashed ? `2px dashed ${color}` : "none" }} />
          {label}
        </span>
      ))}
    </div>
  );
}
