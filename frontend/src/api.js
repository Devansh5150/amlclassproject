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

export const api = {
  summary: () => request("/summary"),
  metrics: () => request("/metrics"),
  customers: (sortBy = "uplift_score", limit = 2000) =>
    request(`/customers?sort_by=${sortBy}&limit=${limit}`),
  predict: (customer) =>
    request("/predict", { method: "POST", body: JSON.stringify(customer) }),
};
