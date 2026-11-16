import React from "react";
import { NavLink, Route, Routes, Link, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Customers from "./pages/Customers.jsx";
import CustomerDetail from "./pages/CustomerDetail.jsx";
import Campaign from "./pages/Campaign.jsx";
import Models from "./pages/Models.jsx";
import Predictor from "./pages/Predictor.jsx";
import {
  TrendingUpIcon,
  UsersIcon,
  TargetIcon,
  BrainIcon,
  ZapIcon,
  PlusIcon
} from "./components/icons.jsx";

export default function App() {
  const location = useLocation();

  const links = [
    { to: "/", label: "Dashboard", icon: TrendingUpIcon },
    { to: "/customers", label: "Customers", icon: UsersIcon },
    { to: "/campaign", label: "Discount Campaign", icon: TargetIcon },
    { to: "/models", label: "Model Intelligence", icon: BrainIcon },
    { to: "/predict", label: "Check Customer", icon: ZapIcon },
  ];

  return (
    <div className="app-layout">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand-group">
            <div className="brand-logo-badge">
              <span className="brand-logo-char">R</span>
            </div>
            <div className="brand-text">
              <span className="brand-name">Robic</span>
              <span className="brand-tagline">Retention & Uplift AI</span>
            </div>
          </Link>

          <nav className="main-nav">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                <Icon size={15} className="nav-icon" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="topbar-actions">
            <div className="engine-status-pill">
              <span className="pulse-indicator">
                <span className="pulse-dot"></span>
                <span className="pulse-ring"></span>
              </span>
              <span className="engine-label">T-Learner Online</span>
            </div>
            <Link to="/predict" className="btn-quick-check">
              <PlusIcon size={14} />
              <span>Simulate Customer</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="main-container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/campaign" element={<Campaign />} />
          <Route path="/models" element={<Models />} />
          <Route path="/predict" element={<Predictor />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-brand">Robic Telecom Intelligence</span>
            <span className="footer-dot">•</span>
            <span className="footer-muted">Causal Machine Learning & Churn Prevention</span>
          </div>
          <div className="footer-right">
            <span className="footer-pill">Group 11 AML Project</span>
            <span className="footer-muted">IBM Telco Benchmark Dataset</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
