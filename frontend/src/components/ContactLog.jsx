// Contact log for one customer, saved in the backend's SQLite database.
// Agents record what they did (channel, offer, outcome) and can update outcomes later.
import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { Card } from "./ui.jsx";

const CHANNELS = ["Phone call", "Email", "SMS", "In store"];
const ACTIONS = [
  "Retention offer ($50 discount)",
  "Contract upgrade offer",
  "Service / support call",
  "Check-in (no offer)",
];
const OUTCOMES = ["Pending", "Accepted offer", "Declined", "No answer", "Stayed", "Left"];
const OUTCOME_COLOR = {
  "Accepted offer": "#059669",
  Stayed: "#059669",
  Declined: "#e11d48",
  Left: "#e11d48",
  Pending: "#64748b",
  "No answer": "#d97706",
};

const EMPTY = { channel: CHANNELS[0], action: ACTIONS[0], outcome: "Pending", note: "", agent: "" };

export default function ContactLog({ customerId, suggestedAction }) {
  const [items, setItems] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = () =>
    api.contacts(customerId).then(setItems).catch(() => setError("Could not load contact history."));

  useEffect(() => {
    setItems(null);
    setForm({
      ...EMPTY,
      action: suggestedAction === "Send retention offer" ? ACTIONS[0]
        : suggestedAction === "Try non-discount retention" ? ACTIONS[2] : ACTIONS[3],
    });
    load();
  }, [customerId]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.addContact(customerId, form);
      setForm((f) => ({ ...f, note: "" }));
      await load();
    } catch {
      setError("Could not save. Is the backend running?");
    } finally {
      setSaving(false);
    }
  }

  async function changeOutcome(id, outcome) {
    await api.updateContact(id, { outcome });
    load();
  }

  async function remove(id) {
    await api.deleteContact(id);
    load();
  }

  const select = (k, options) => (
    <label>
      <span>{k[0].toUpperCase() + k.slice(1)}</span>
      <select value={form[k]} onChange={(e) => set(k, e.target.value)}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );

  return (
    <Card
      title="Contact Log"
      subtitle="Every retention contact is saved in the database (SQLite) so the team can track outcomes"
    >
      <form onSubmit={submit}>
        <div className="form-grid">
          {select("channel", CHANNELS)}
          {select("action", ACTIONS)}
          {select("outcome", OUTCOMES)}
          <label>
            <span>Agent</span>
            <input type="text" value={form.agent} maxLength={80} placeholder="Your name"
              onChange={(e) => set("agent", e.target.value)} />
          </label>
        </div>
        <label style={{ display: "block", marginTop: 12 }}>
          <span className="muted" style={{ fontSize: 13 }}>Note</span>
          <input type="text" value={form.note} maxLength={500} style={{ width: "100%", boxSizing: "border-box" }}
            placeholder="e.g. Customer asked about faster internet"
            onChange={(e) => set("note", e.target.value)} />
        </label>
        <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
          <button type="submit" className="primary" disabled={saving}>
            {saving ? "Saving…" : "Log contact"}
          </button>
          {error && <span style={{ color: "#e11d48", fontSize: 13 }}>{error}</span>}
        </div>
      </form>

      <div className="table-wrap" style={{ marginTop: 18 }}>
        {items == null ? (
          <p className="muted">Loading history…</p>
        ) : items.length === 0 ? (
          <p className="muted">No contacts logged for this customer yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>When</th>
                <th>Channel</th>
                <th>Action</th>
                <th>Outcome</th>
                <th>Note</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>{new Date(c.created_at).toLocaleString()}</td>
                  <td>{c.channel}</td>
                  <td>{c.action}</td>
                  <td>
                    <select value={c.outcome} style={{ color: OUTCOME_COLOR[c.outcome], fontWeight: 600 }}
                      onChange={(e) => changeOutcome(c.id, e.target.value)}>
                      {OUTCOMES.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {c.note}
                    {c.agent && <span className="muted"> ({c.agent})</span>}
                  </td>
                  <td>
                    <button type="button" onClick={() => remove(c.id)} title="Delete"
                      style={{ background: "none", border: "none", color: "#94a3b8" }}>
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}
