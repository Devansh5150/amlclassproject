import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import {
  ActionBadge,
  Card,
  Loading,
  PageHeader,
  Stat,
  StayBar,
  useApi
} from "../components/ui.jsx";
import {
  PhoneCallIcon,
  CheckIcon,
  CopyIcon,
  AlertTriangleIcon,
  SparklesIcon,
  ArrowRightIcon,
  XIcon,
  ShieldCheckIcon,
  DollarSignIcon
} from "../components/icons.jsx";
import { money, pct } from "../theme.js";

export default function DashboardAgent() {
  const { data, error } = useApi(api.summary);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [copied, setCopied] = useState(false);
  const [appliedOffer, setAppliedOffer] = useState(false);
  const [outcomeLogged, setOutcomeLogged] = useState(null);
  const [completedCount, setCompletedCount] = useState(3);
  const [agentNotes, setAgentNotes] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  if (!data) return <Loading error={error} />;

  const currentCustomer = selectedCustomer || data.top_at_risk[0];

  const filteredCustomers = data.top_at_risk.filter((c) => {
    if (searchFilter && !c.name.toLowerCase().includes(searchFilter.toLowerCase()) && !c.customerID.toLowerCase().includes(searchFilter.toLowerCase())) {
      return false;
    }
    if (activeTab === "discount") return c.recommended_action === "Send retention offer";
    if (activeTab === "call") return c.recommended_action === "Try non-discount retention";
    if (activeTab === "nocontact") return c.recommended_action === "Do not contact" || c.recommended_action === "No action needed";
    return true;
  });

  const handleCopyScript = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyOffer = () => {
    setAppliedOffer(true);
    setTimeout(() => setAppliedOffer(false), 3000);
  };

  const handleLogOutcome = (outcome) => {
    setOutcomeLogged(outcome);
    setCompletedCount(prev => prev + 1);
    setTimeout(() => setOutcomeLogged(null), 3500);
  };

  return (
    <>
      <PageHeader
        badge="Frontline Retention Console"
        title="Support & Retention Agent Workspace"
        right={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Agent: <b>Sarah Connor</b></span>
            <span className="live-badge-indicator">
              <span className="pulse-dot"></span>
              <span>On Queue (Ready)</span>
            </span>
          </div>
        }
      >
        Your dedicated call desk for subscriber outreach. Select an assigned subscriber to view their 3-second diagnosis, phone script, and pre-authorized concessions.
      </PageHeader>

      {/* 4 Agent Operational KPIs */}
      <div className="stats">
        <Stat
          label="Priority Calls Assigned"
          value={data.top_at_risk.length}
          note="High-urgency accounts"
          tone="bad"
          icon={PhoneCallIcon}
        />
        <Stat
          label="$50 Concessions Authorized"
          value={data.action_counts["Send retention offer"] || 0}
          note="Pre-approved bill credits"
          tone="good"
          icon={SparklesIcon}
        />
        <Stat
          label="Calls Resolved Today"
          value={completedCount}
          note="Subscribers stabilized"
          tone="good"
          icon={CheckIcon}
        />
        <Stat
          label="Saved Annual Value Today"
          value={money(completedCount * 1050)}
          note="Retained contract revenue"
          tone="good"
          icon={DollarSignIcon}
        />
      </div>

      {outcomeLogged && (
        <div style={{
          padding: "12px 18px",
          background: "#ecfdf5",
          border: "1px solid #a7f3d0",
          borderRadius: "10px",
          color: "#065f46",
          fontSize: "14px",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "16px",
          animation: "fadeIn 0.3s ease"
        }}>
          <CheckIcon size={18} />
          <span>Call Outcome Recorded: <b>"{outcomeLogged}"</b> for subscriber #{currentCustomer.customerID}. Queue updated!</span>
        </div>
      )}

      {/* 2-Column Frontline Workspace */}
      <div className="stitch-layout-grid">
        {/* Left Column: Call Queue */}
        <div className="stitch-col-left">
          <Card
            title="📞 Priority Customer Call Queue"
            subtitle="Ranked in order of departure urgency. Click to activate their script."
          >
            {/* Quick Search */}
            <div style={{ marginBottom: "12px" }}>
              <input
                type="text"
                placeholder="Search assigned queue by name or ID…"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
              />
            </div>

            {/* Filter Tabs */}
            <div className="queue-filter-tabs">
              <button
                type="button"
                className={`queue-tab-btn ${activeTab === "all" ? "active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                All Priority ({data.top_at_risk.length})
              </button>
              <button
                type="button"
                className={`queue-tab-btn ${activeTab === "discount" ? "active" : ""}`}
                onClick={() => setActiveTab("discount")}
              >
                $50 Concession
              </button>
              <button
                type="button"
                className={`queue-tab-btn ${activeTab === "call" ? "active" : ""}`}
                onClick={() => setActiveTab("call")}
              >
                Personal Support
              </button>
              <button
                type="button"
                className={`queue-tab-btn ${activeTab === "nocontact" ? "active" : ""}`}
                onClick={() => setActiveTab("nocontact")}
              >
                No Offer
              </button>
            </div>

            {/* List of customer cards */}
            <div className="customer-cards-stack">
              {filteredCustomers.map((c) => {
                const isSelected = currentCustomer && currentCustomer.customerID === c.customerID;
                return (
                  <div
                    key={c.customerID}
                    className={`queue-customer-card ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedCustomer(c);
                      setAppliedOffer(false);
                      setAgentNotes("");
                    }}
                  >
                    <div className="queue-card-header">
                      <div className="queue-avatar-group">
                        <div className="queue-avatar">
                          {c.name.split(" ").map((p) => p[0]).join("")}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <b className="queue-customer-name">{c.name}</b>
                            <span className="queue-customer-id">#{c.customerID}</span>
                          </div>
                          <div className="queue-customer-plan">
                            {c.Contract} · <b>${c.MonthlyCharges.toFixed(0)}/mo</b> · {c.tenure} mos
                          </div>
                        </div>
                      </div>

                      <div className="queue-action-pill">
                        <ActionBadge action={c.recommended_action || "Send retention offer"} />
                      </div>
                    </div>

                    <div className="queue-card-footer">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                        <StayBar value={c.chance_of_staying} />
                        <span className="muted" style={{ fontSize: "11px" }}>chance of staying</span>
                      </div>
                      <span className="queue-select-hint">
                        {isSelected ? "Active in Terminal 👉" : "Open script →"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Active Call Terminal */}
        <div className="stitch-col-right">
          {currentCustomer ? (
            <Card
              className="cheat-sheet-card"
              title="🎧 Active Call Script & Action Terminal"
              subtitle={`Live briefing for subscriber: ${currentCustomer.name} (#${currentCustomer.customerID})`}
            >
              <div className="cheat-sheet-body">
                {/* Customer Snapshot */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  background: "#ffffff",
                  border: "1px solid var(--border)",
                  borderRadius: "10px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="customer-avatar" style={{ width: "42px", height: "42px", fontSize: "16px" }}>
                      {currentCustomer.name.split(" ").map((p) => p[0]).join("")}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "16px" }}>{currentCustomer.name}</h3>
                      <div className="muted small">
                        {currentCustomer.Contract} Plan · Subscribed {currentCustomer.tenure} months
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "18px", fontWeight: 800 }}>${currentCustomer.MonthlyCharges.toFixed(0)}/mo</div>
                    <span className="meta-pill">{currentCustomer.region || "Metro"} Region</span>
                  </div>
                </div>

                {/* Section 1: The Situation */}
                <div className="cheat-sheet-section">
                  <div className="cheat-label">📌 The Situation (Diagnosis)</div>
                  <div style={{
                    padding: "10px 14px",
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "13.5px",
                    lineHeight: "1.5"
                  }}>
                    {currentCustomer.Contract === "Month-to-month" ? (
                      <span>
                        ⚠️ <b>Contract Vulnerability:</b> {currentCustomer.name} is on a flexible month-to-month agreement paying ${currentCustomer.MonthlyCharges.toFixed(0)}/month without contract protection.
                        {currentCustomer.tenure < 12 ? " Early-stage subscriber with high cancellation risk." : " Long-term user needing an annual rate guarantee."}
                      </span>
                    ) : (
                      <span>
                        ⚠️ <b>Service Health Review:</b> Customer has {currentCustomer.Contract} commitment. Review quality tickets and ensure satisfaction.
                      </span>
                    )}
                  </div>
                </div>

                {/* Section 2: Step-by-Step Phone Script */}
                <div className="cheat-sheet-section script-bubble">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div className="cheat-label" style={{ color: "#E5484D", margin: 0 }}>
                      💬 What to Say on the Phone
                    </div>
                    <button
                      type="button"
                      className="ghost small"
                      style={{ padding: "2px 8px", fontSize: "11px" }}
                      onClick={() =>
                        handleCopyScript(
                          `"Hi ${currentCustomer.name.split(" ")[0]}, my name is Sarah from Robic Telecom. We noticed your account is eligible for our preferred annual rate lock. Because you've been with us for ${currentCustomer.tenure} months, I am pre-authorized to apply an immediate $50 credit to your bill and include complimentary cyber security if we upgrade you to our 1-year rate guarantee today."`
                        )
                      }
                    >
                      <CopyIcon size={12} />
                      <span>{copied ? "Copied!" : "Copy Script"}</span>
                    </button>
                  </div>
                  <blockquote className="phone-script-quote">
                    "Hi <b>{currentCustomer.name.split(" ")[0]}</b>, my name is Sarah from Robic. We noticed your account is eligible for our preferred annual rate lock.
                    Because you've been with us for {currentCustomer.tenure} months, I am pre-authorized to apply an immediate <b>$50 bill credit</b> and include <b>complimentary cyber security</b> if we upgrade you to our 1-year rate guarantee today."
                  </blockquote>
                </div>

                {/* Section 3: Pre-Authorized Concession Button */}
                <div className="cheat-sheet-section">
                  <div className="cheat-label">🎁 Pre-Authorized Retention Concession</div>
                  {appliedOffer ? (
                    <div style={{
                      padding: "12px",
                      background: "#ecfdf5",
                      border: "1.5px solid #10b981",
                      borderRadius: "8px",
                      color: "#065f46",
                      fontSize: "13.5px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      <CheckIcon size={18} />
                      <span>$50 Bill Credit & Rate Lock Applied to Account #{currentCustomer.customerID}!</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="primary"
                      onClick={handleApplyOffer}
                      style={{
                        width: "100%",
                        padding: "12px",
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                    >
                      <SparklesIcon size={16} />
                      <span>Apply Authorized $50 Retention Credit</span>
                    </button>
                  )}
                </div>

                {/* Section 4: Log Outcome */}
                <div className="cheat-sheet-section">
                  <div className="cheat-label">📞 Log Call Outcome</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => handleLogOutcome("Saved - Accepted $50 Offer")}
                      style={{ borderColor: "#a7f3d0", color: "#065f46", fontSize: "12px", padding: "8px 4px" }}
                    >
                      ✅ Saved / Accepted
                    </button>
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => handleLogOutcome("Scheduled Callback")}
                      style={{ borderColor: "#fde68a", color: "#b45309", fontSize: "12px", padding: "8px 4px" }}
                    >
                      📅 Callback Needed
                    </button>
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => handleLogOutcome("Declined Offer")}
                      style={{ borderColor: "#fecdd3", color: "#be123c", fontSize: "12px", padding: "8px 4px" }}
                    >
                      ❌ Declined Offer
                    </button>
                  </div>
                </div>

                {/* Agent Notes */}
                <div className="cheat-sheet-section">
                  <div className="cheat-label">📝 Agent Call Notes</div>
                  <textarea
                    rows={2}
                    placeholder="Enter customer feedback or follow-up notes here…"
                    value={agentNotes}
                    onChange={(e) => setAgentNotes(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      fontFamily: "inherit",
                      fontSize: "13px"
                    }}
                  />
                </div>

                {/* Link to Full Record */}
                <div style={{ textAlign: "right", marginTop: "4px" }}>
                  <Link
                    to={`/customers/${currentCustomer.customerID}`}
                    className="button-link"
                    style={{ background: "transparent", color: "var(--brand-primary)", border: "1px solid var(--border)", boxShadow: "none" }}
                  >
                    <span>View Complete CRM History & Services →</span>
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            <Card title="No Subscriber Selected">
              <p className="muted">Please click an assigned subscriber from the queue on the left to begin.</p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
