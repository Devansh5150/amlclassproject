// Chart colors & design system tokens
export const COLORS = {
  primary: "#4f46e5",   // Indigo
  blue: "#2563eb",      // Electric Blue
  orange: "#ea580c",    // Energetic Orange / Amber
  aqua: "#059669",      // Vibrant Emerald
  purple: "#7c3aed",    // Violet
  neutral: "#94a3b8",   // Slate 400
  grid: "#e2e8f0",      // Light subtle border
  axis: "#64748b",      // Slate 500
};

// Plain-English names for the targeting methods
export const METHOD_LABEL = {
  "Churn risk": "Most likely to leave",
  "Churn risk (Random Forest)": "Most likely to leave",
  "Uplift (T-learner)": "Most likely to respond to discount",
  "T-learner (Logistic Regression)": "Most likely to respond to discount",
  Random: "Random picks",
};

export const METHOD_COLORS = {
  "Most likely to leave": "#2563eb",
  "Most likely to respond to discount": "#ea580c",
  "Random picks": "#94a3b8",
};

// Classical models
export const MODEL_COLORS = {
  "Logistic Regression": "#2563eb",
  "Random Forest": "#ea580c",
  XGBoost: "#059669",
};

// Backend action -> plain label + status color + icon + modern pills
export const ACTION_STYLE = {
  "Send retention offer": {
    label: "Send the discount",
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    icon: "✔",
    tone: "good"
  },
  "No action needed": {
    label: "No need, likely to stay",
    color: "#475569",
    bg: "#f8fafc",
    border: "#e2e8f0",
    icon: "–",
    tone: "neutral"
  },
  "Try non-discount retention": {
    label: "Call them instead",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    icon: "☎",
    tone: "warning"
  },
  "Do not contact": {
    label: "Don't contact",
    color: "#e11d48",
    bg: "#fff1f2",
    border: "#fecdd3",
    icon: "✖",
    tone: "danger"
  },
};

// Risk levels
export const RISK_STYLE = {
  High: {
    label: "High risk",
    color: "#e11d48",
    bg: "#fff1f2",
    border: "#fecdd3",
    icon: "▲",
    badgeClass: "badge-danger"
  },
  Medium: {
    label: "Medium risk",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    icon: "●",
    badgeClass: "badge-warning"
  },
  Low: {
    label: "Low risk",
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    icon: "▼",
    badgeClass: "badge-success"
  },
};

// Plain explanations of each action
export const ACTION_HELP = {
  "Send retention offer": "A $50 discount is likely to keep this customer, and preserving their lifetime value is worth significantly more than $50.",
  "No action needed": "This customer has high organic loyalty and will likely stay anyway. Offering a discount would needlessly dilute revenue.",
  "Try non-discount retention": "They are at risk of leaving, but a discount won't solve the core issue. Direct outreach or technical support resolution yields higher retention.",
  "Do not contact": "Contacting this customer or sending an unsolicited offer may trigger a negative reaction or accelerate churn.",
};

export const pct = (v, d = 0) => `${(v * 100).toFixed(d)}%`;
export const money = (v) =>
  `${v < 0 ? "-" : ""}$${Math.abs(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
