// Shared UI building blocks: icon glyphs, the coloured icon tile, the segmented control,
// and the simulation banner. Styles live in src/aircel.css.
import React from "react";

const G = ({ size = 20, children, sw = 2.2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export const Glyph = {
  home: (p) => <G {...p}><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v9.5h13V10" /><path d="M10 19.5v-5h4v5" /></G>,
  users: (p) => <G {...p}><circle cx="9" cy="8" r="3.2" /><path d="M3 19.5c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" /><circle cx="17" cy="9" r="2.4" /><path d="M16 14.2c2.8 0 5 1.8 5 4.6" /></G>,
  chart: (p) => <G {...p}><path d="M5 20V12" /><path d="M10 20V8" /><path d="M15 20V11" /><path d="M20 20V5" /></G>,
  flask: (p) => <G {...p}><path d="M9 3h6" /><path d="M10 3v6L4.5 18.5A1.6 1.6 0 0 0 5.9 21h12.2a1.6 1.6 0 0 0 1.4-2.5L14 9V3" /><path d="M7.5 15h9" /></G>,
  search: (p) => <G {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></G>,
  calc: (p) => <G {...p}><rect x="5" y="3" width="14" height="18" rx="3" /><path d="M8.5 7.5h7" /><path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" /></G>,
  bell: (p) => <G {...p}><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15Z" /><path d="M10 20.5a2.2 2.2 0 0 0 4 0" /></G>,
  heart: (p) => <G {...p}><path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10Z" /></G>,
  coins: (p) => <G {...p}><ellipse cx="9" cy="7" rx="5" ry="2.3" /><path d="M4 7v4c0 1.3 2.2 2.3 5 2.3s5-1 5-2.3V7" /><path d="M10 15.3c.9 1 2.8 1.7 5 1.7 2.8 0 5-1 5-2.3v-4c0-1.2-1.8-2.1-4.3-2.3" /></G>,
  alert: (p) => <G {...p}><path d="M12 4 2.8 19.5h18.4Z" /><path d="M12 10v4" /><path d="M12 17h.01" /></G>,
  tag: (p) => <G {...p}><path d="M3.5 12.5V4.5h8l9 9-8 8Z" /><circle cx="8" cy="9" r="1.4" /></G>,
  phone: (p) => <G {...p}><path d="M5 4h3.5l1.8 4.5-2.3 1.4a11 11 0 0 0 6.1 6.1l1.4-2.3L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4Z" /></G>,
  check: (p) => <G {...p}><circle cx="12" cy="12" r="8.5" /><path d="m8.3 12.2 2.5 2.5 5-5" /></G>,
  ban: (p) => <G {...p}><circle cx="12" cy="12" r="8.5" /><path d="m6 6 12 12" /></G>,
  calendar: (p) => <G {...p}><rect x="4" y="5" width="16" height="15" rx="2.5" /><path d="M4 10h16M8.5 3v4M15.5 3v4" /><path d="M8.5 14h.01M12 14h.01M15.5 14h.01" /></G>,
  hourglass: (p) => <G {...p}><path d="M6.5 3h11M6.5 21h11" /><path d="M7.5 3v3.5L12 12l-4.5 5.5V21M16.5 3v3.5L12 12l4.5 5.5V21" /></G>,
  wifi: (p) => <G {...p}><path d="M3 9.5a13 13 0 0 1 18 0" /><path d="M6.2 13a8.5 8.5 0 0 1 11.6 0" /><path d="M9.3 16.3a4 4 0 0 1 5.4 0" /><path d="M12 19.5h.01" /></G>,
  card: (p) => <G {...p}><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10.5h18M7 15h3" /></G>,
  headset: (p) => <G {...p}><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="13.5" width="4" height="6" rx="1.5" /><rect x="17" y="13.5" width="4" height="6" rx="1.5" /><path d="M19 19.5a3 3 0 0 1-3 2.5h-2" /></G>,
  stack: (p) => <G {...p}><ellipse cx="12" cy="6" rx="7.5" ry="2.8" /><path d="M4.5 6v4c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8V6" /><path d="M4.5 10v4c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-4" /><path d="M4.5 14v4c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-4" /></G>,
  sparkle: (p) => <G {...p}><path d="M12 3.5 13.8 9l5.7 1.9-5.7 1.9L12 18.5l-1.8-5.7L4.5 11l5.7-2Z" /><path d="M19 3v3M17.5 4.5h3" /></G>,
  info: (p) => <G {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5" /><path d="M12 7.8h.01" /></G>,
  download: (p) => <G {...p}><path d="M12 4v11" /><path d="m7.5 10.5 4.5 4.5 4.5-4.5" /><path d="M5 19.5h14" /></G>,
  tie: (p) => <G {...p}><path d="M9.5 3h5l-1 3.5 2.5 9-4 5-4-5 2.5-9Z" /></G>,
};

// Coloured tile holding a glyph. tone: indigo | rose | amber | emerald | lavender | blue
export function IconTile({ name, tone = "indigo", size = 48, glyph = 22 }) {
  const Ico = Glyph[name];
  return (
    <span className={`ax-icon tone-${tone}`} style={{ width: size, height: size }}>
      <Ico size={glyph} />
    </span>
  );
}

// Segmented control (persona switcher, method toggles)
export function Segmented({ options, value, onChange, label }) {
  return (
    <div className="ax-segmented" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" aria-selected={value === o.value}
          className={value === o.value ? "is-active" : ""} onClick={() => onChange(o.value)}>
          {o.icon && <span className="seg-icon">{Glyph[o.icon]({ size: 17 })}</span>}
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  );
}

// Mandatory disclaimer: shown wherever uplift, profit, ROI or customers-saved figures appear.
export function SimulationBanner() {
  return (
    <aside className="ax-disclaimer" role="note">
      <IconTile name="info" tone="indigo" size={40} glyph={20} />
      <strong>Simulation disclaimer</strong>
      <p>
        The dataset has no record of who received a discount, so the discount experiment and every
        uplift / profit number built on it are <b>simulated</b> (a what-if analysis), not from a real A/B test.
      </p>
    </aside>
  );
}
