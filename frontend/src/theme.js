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

// Targeting methods
export const METHOD_COLORS = {
  "Churn risk": COLORS.blue,
  "Churn risk (Random Forest)": COLORS.blue,
  "Uplift (T-learner)": COLORS.orange,
  "T-learner (Logistic Regression)": COLORS.orange,
  Random: COLORS.neutral,
};

// Classical models
export const MODEL_COLORS = {
  "Logistic Regression": COLORS.blue,
  "Random Forest": COLORS.orange,
  XGBoost: COLORS.aqua,
};

// Status colors for recommended actions: always shown WITH an icon + text label.
export const ACTION_STYLE = {
  "Send retention offer": { color: "#0ca30c", icon: "✔" },
  "No action needed": { color: "#52514e", icon: "–" },
  "Try non-discount retention": { color: "#c47a00", icon: "!" },
  "Do not contact": { color: "#d03b3b", icon: "✖" },
};

export const pct = (v, d = 0) => `${(v * 100).toFixed(d)}%`;
export const money = (v) =>
  `${v < 0 ? "-" : ""}$${Math.abs(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
