import { NavLink, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Predictor from "./pages/Predictor.jsx";
import Models from "./pages/Models.jsx";
import Campaign from "./pages/Campaign.jsx";

// Top navigation + the 4 pages.
export default function App() {
  const links = [
    ["/", "Dashboard"],
    ["/predict", "Predict a customer"],
    ["/models", "Model comparison"],
    ["/campaign", "Campaign targeting"],
  ];
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo">◎</span> Churn + Uplift
          <span className="sub">Group 11 · Telco demo</span>
        </div>
        <nav>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end className={({ isActive }) => (isActive ? "active" : "")}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/predict" element={<Predictor />} />
          <Route path="/models" element={<Models />} />
          <Route path="/campaign" element={<Campaign />} />
        </Routes>
      </main>
      <footer>
        Data: IBM Telco Customer Churn (public). Retention-offer effects are <b>simulated</b> for the uplift demo.
      </footer>
    </div>
  );
}
