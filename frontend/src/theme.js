// Chart colors in ONE place (validated colorblind-safe categorical palette).
// Each entity always keeps the same color on every chart.
export const COLORS = {
  blue: "#2a78d6",
  orange: "#eb6834",
  aqua: "#1baf7a",
  neutral: "#8a8984", // "Random" baseline: gray, not a series hue
  grid: "#e6e5e0",
  axis: "#52514e",
};

// Plain-English names for the targeting methods (backend name -> what users see)
export const METHOD_LABEL = {
  "Churn risk": "Most likely to leave",
  "Churn risk (Random Forest)": "Most likely to leave",
  "Uplift (T-learner)": "Most likely to respond to discount",
  "T-learner (Logistic Regression)": "Most likely to respond to discount",
  Random: "Random picks",
};

export const METHOD_COLORS = {
  "Most likely to leave": COLORS.blue,
  "Most likely to respond to discount": COLORS.orange,
  "Random picks": COLORS.neutral,
};

// Classical models (technical details section only)
export const MODEL_COLORS = {
  "Logistic Regression": COLORS.blue,
  "Random Forest": COLORS.orange,
  XGBoost: COLORS.aqua,
};

// Backend action -> plain label + status color + icon (never color alone).
export const ACTION_STYLE = {
  "Send retention offer": { label: "Send the discount", color: "#0ca30c", icon: "✔" },
  "No action needed": { label: "No need, likely to stay", color: "#52514e", icon: "–" },
  "Try non-discount retention": { label: "Call them instead", color: "#c47a00", icon: "☎" },
  "Do not contact": { label: "Don't contact", color: "#d03b3b", icon: "✖" },
};

// Plain explanations of each action
export const ACTION_HELP = {
  "Send retention offer": "A $50 discount is likely to keep this customer, and keeping them is worth more than $50.",
  "No action needed": "This customer will probably stay anyway, so a discount would be wasted.",
  "Try non-discount retention": "They may leave, but a discount probably won't change their mind. A personal call to fix their problem may work better.",
  "Do not contact": "Contacting this customer might actually make them more likely to leave.",
};

export const pct = (v, d = 0) => `${(v * 100).toFixed(d)}%`;
export const money = (v) =>
  `${v < 0 ? "-" : ""}$${Math.abs(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
