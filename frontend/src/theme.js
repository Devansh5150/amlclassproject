// myDel Retention Desk: colour tokens shared by charts and badges.
// Keep in sync with the :root variables in styles.css.
// Warm-grey canvas with charcoal ink and a neon-yellow accent.
export const C = {
  ink: "#232322",
  ink2: "#6B6A66",
  ink3: "#8F8E89",
  rule: "#CFCEC8",
  grid: "#DDDCD7",
  paper: "#E6E5E0",
  brand: "#232322",  // churn-risk targeting: the dark "ink" series
  accent: "#E4F23A", // neon yellow highlight (markers, peak dots)
  stay: "#3F8A55",   // likely to stay
  hold: "#B7871F",   // could go either way / call instead
  drop: "#D2532B",   // likely to leave
  offer: "#A3B312",  // discount (olive yellow, readable on the grey canvas)
  uplift: "#9AAA10", // uplift model
  quiet: "#A9A8A2",  // random / no action
};
C.line = C.brand;

// Legacy alias used by a few charts
export const COLORS = { primary: C.line, grid: C.grid, axis: C.ink2, neutral: C.quiet };

export const AXIS = { fill: C.ink2, fontSize: 12, fontFamily: "Manrope, sans-serif" };

// Plain-English names for the targeting methods
export const METHOD_LABEL = {
  "Churn risk": "Most likely to leave",
  "Churn risk (Random Forest)": "Most likely to leave",
  "Uplift (T-learner)": "Most likely to respond",
  "T-learner (Logistic Regression)": "Most likely to respond",
  "T-learner (XGBoost)": "Most likely to respond",
  Random: "Random picks",
  "Random picks": "Random picks",
};

export const METHOD_COLORS = {
  "Most likely to leave": C.brand,
  "Most likely to respond": C.uplift,
  "Random picks": C.quiet,
};

export const MODEL_COLORS = {
  "Logistic Regression": "#A9A8A2",
  "Random Forest": C.brand,
  XGBoost: C.uplift,
};

// Backend action -> plain label + tone (tones map to .tag-* classes)
export const ACTION_STYLE = {
  "Send retention offer": { label: "Send the discount", tone: "send", glyph: "tag" },
  "Try non-discount retention": { label: "Call them instead", tone: "call", glyph: "phone" },
  "No action needed": { label: "Leave them be", tone: "none", glyph: "check" },
  "Do not contact": { label: "Don't contact", tone: "skip", glyph: "ban" },
};
export const ACTION_ORDER = ["Send retention offer", "Try non-discount retention", "No action needed", "Do not contact"];
export const ACTION_FILL = {
  "Send retention offer": C.offer,
  "Try non-discount retention": C.hold,
  "No action needed": "#CFCEC8",
  "Do not contact": "#8E8D89",
};

export const RISK_STYLE = {
  High: { label: "High risk", tone: "high", color: C.drop },
  Medium: { label: "Medium risk", tone: "medium", color: C.hold },
  Low: { label: "Low risk", tone: "low", color: C.stay },
};

// What each action means, in the agent's words
export const ACTION_HELP = {
  "Send retention offer": "A $50 discount is likely to keep this customer, and a year of their bill is worth far more than $50.",
  "No action needed": "This customer will most likely stay anyway. A discount would only cost money.",
  "Try non-discount retention": "They might leave, but money isn't the fix. A call about service or support works better.",
  "Do not contact": "Reaching out may remind them to cancel. Leave this account alone.",
};

export const pct = (v, d = 0) => `${(v * 100).toFixed(d)}%`;
export const money = (v) =>
  `${v < 0 ? "−" : ""}$${Math.abs(v).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
export const kmoney = (v) => `${v < 0 ? "−" : ""}$${Math.round(Math.abs(v) / 1000)}k`;
export const num = (v) => Number(v).toLocaleString("en-US");
export const initials = (name = "") => name.split(" ").map((p) => p[0]).join("").slice(0, 2);

// Chance of staying -> tone
export const stayTone = (v) => (v >= 0.7 ? "low" : v >= 0.4 ? "medium" : "high");
