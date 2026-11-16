// All calls to the FastAPI backend live here.
// The backend address comes from VITE_API_URL (see .env.example).
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}

// Build "?a=1&b=2", skipping empty values
const qs = (params) =>
  "?" + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== "" && v != null)).toString();

export const api = {
  summary: () => request("/summary"),
  metrics: () => request("/metrics"),
  customers: (params = {}) => request(`/customers${qs(params)}`),
  customer: (id) => request(`/customers/${encodeURIComponent(id)}`),
  predict: (customer) =>
    request("/predict", { method: "POST", body: JSON.stringify(customer) }),
};
