import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import {
  ActionBadge,
  Card,
  Loading,
  PageHeader,
  RiskBadge,
  StayBar,
  useApi
} from "../components/ui.jsx";
import {
  SearchIcon,
  FilterIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  XIcon
} from "../components/icons.jsx";
import { ACTION_STYLE } from "../theme.js";

const PAGE = 25;
const SORTS = {
  churn_prob: "Highest churn risk first",
  chance_of_staying: "Highest retention first",
  MonthlyCharges: "Highest monthly charge",
  tenure: "Longest tenure first",
  name: "Subscriber Name (A–Z)",
};

// Generates stable pleasant pastel avatar background colors
function getAvatarColor(name = "") {
  const colors = [
    { bg: "#dbeafe", text: "#1d4ed8" },
    { bg: "#fce7f3", text: "#be185d" },
    { bg: "#ede9fe", text: "#6d28d9" },
    { bg: "#e0e7ff", text: "#4338ca" },
    { bg: "#ccfbf1", text: "#0f766e" },
    { bg: "#fef3c7", text: "#b45309" },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return colors[hash % colors.length];
}

export default function Customers() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");

  const risk = params.get("risk") || "";
  const contract = params.get("contract") || "";
  const action = params.get("action") || "";
  const sort = params.get("sort") || "churn_prob";
  const page = Number(params.get("page") || 0);
  const q = params.get("q") || "";

  const set = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== q) set("q", search);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const { data, error, loading } = useApi(
    () =>
      api.customers({
        q,
        risk,
        contract,
        action,
        limit: PAGE,
        offset: page * PAGE,
        sort_by: sort,
        descending: sort === "chance_of_staying" ? false : sort !== "name",
      }),
    [q, risk, contract, action, sort, page]
  );

  const pages = data ? Math.max(1, Math.ceil(data.total / PAGE)) : 1;
  const hasFilters = Boolean(risk || contract || action || q);

  return (
    <>
      <PageHeader
        badge="Subscriber Database"
        title="Customer Directory & Risk Roster"
        right={
          <Link to="/predict" className="button-link">
            <PlusIcon size={16} />
            <span>Simulate New Customer</span>
          </Link>
        }
      >
        Real-time telemetry, tenure tracking, and causal action recommendations for all{" "}
        {data ? ` ${data.total.toLocaleString()} ` : " "}subscribers.
      </PageHeader>

      <Card>
        <div className="filters">
          <div className="search-box">
            <SearchIcon size={16} className="search-icon" />
            <input
              type="text"
              className="search"
              placeholder="Search subscribers by name or ID (e.g. 7590-VHVEG)…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: "4px"
                }}
              >
                <XIcon size={14} />
              </button>
            )}
          </div>

          <select value={risk} onChange={(e) => set("risk", e.target.value)}>
            <option value="">All Risk Tiers</option>
            <option value="High">High Risk (≥60%)</option>
            <option value="Medium">Medium Risk (30-60%)</option>
            <option value="Low">Low Risk (&lt;30%)</option>
          </select>

          <select value={contract} onChange={(e) => set("contract", e.target.value)}>
            <option value="">All Contract Types</option>
            <option value="Month-to-month">Month-to-month</option>
            <option value="One year">1-Year Term</option>
            <option value="Two year">2-Year Term</option>
          </select>

          <select value={action} onChange={(e) => set("action", e.target.value)}>
            <option value="">All Causal Actions</option>
            {Object.entries(ACTION_STYLE).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>

          <select value={sort} onChange={(e) => set("sort", e.target.value)}>
            {Object.entries(SORTS).map(([k, v]) => (
              <option key={k} value={k}>
                Sort: {v}
              </option>
            ))}
          </select>

          {hasFilters && (
            <button
              className="ghost"
              onClick={() => {
                setSearch("");
                setParams(new URLSearchParams());
              }}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <XIcon size={14} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {!data ? (
          <Loading error={error} />
        ) : (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                margin: "14px 0 8px"
              }}
            >
              <p className="muted" style={{ margin: 0, fontSize: "13px" }}>
                Showing{" "}
                <b>
                  {data.items.length ? page * PAGE + 1 : 0}–
                  {page * PAGE + data.items.length}
                </b>{" "}
                of <b>{data.total.toLocaleString()}</b> active subscribers
              </p>
              {loading && <span className="muted small">Refreshing…</span>}
            </div>

            <div className="table-wrap">
              <table className="table clickable">
                <thead>
                  <tr>
                    <th>Subscriber</th>
                    <th>Region</th>
                    <th>Contract</th>
                    <th>Vintage</th>
                    <th>Monthly Bill</th>
                    <th>Chance of Staying</th>
                    <th>Risk Tier</th>
                    <th>Recommended Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((c) => {
                    const avatar = getAvatarColor(c.name);
                    return (
                      <tr
                        key={c.customerID}
                        onClick={() => navigate(`/customers/${c.customerID}`)}
                      >
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                backgroundColor: avatar.bg,
                                color: avatar.text,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: "12px",
                                flexShrink: 0
                              }}
                            >
                              {c.name.split(" ").map((p) => p[0]).join("")}
                            </div>
                            <div>
                              <b>{c.name}</b>
                              <div className="muted small">{c.customerID}</div>
                            </div>
                          </div>
                        </td>
                        <td>{c.region}</td>
                        <td>
                          <span className="meta-pill">{c.Contract}</span>
                        </td>
                        <td>
                          <span className="muted">{c.customer_since}</span>{" "}
                          <span className="small">({c.tenure}m)</span>
                        </td>
                        <td>
                          <b>${c.MonthlyCharges.toFixed(2)}</b>
                        </td>
                        <td>
                          <StayBar value={c.chance_of_staying} />
                        </td>
                        <td>
                          <RiskBadge level={c.risk_level} />
                        </td>
                        <td>
                          <ActionBadge action={c.recommended_action} />
                        </td>
                      </tr>
                    );
                  })}
                  {data.items.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", padding: "36px", color: "#64748b" }}>
                        No subscribers match the current filter query. Try adjusting your search or resetting filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pager">
              <button
                className="ghost pager-btn"
                disabled={page === 0}
                onClick={() => set("page", String(page - 1))}
              >
                <ChevronLeftIcon size={14} />
                <span>Previous</span>
              </button>
              <span>
                Page <b>{page + 1}</b> of <b>{pages}</b>
              </span>
              <button
                className="ghost pager-btn"
                disabled={page + 1 >= pages}
                onClick={() => set("page", String(page + 1))}
              >
                <span>Next</span>
                <ChevronRightIcon size={14} />
              </button>
            </div>
          </>
        )}
      </Card>
    </>
  );
}
