import { NavLink, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Predictor from "./pages/Predictor.jsx";
import Models from "./pages/Models.jsx";
import Campaign from "./pages/Campaign.jsx";

// Top navigation + the 4 pages. Labels are written for non-technical users.
export default function App() {
  const links = [
    ["/", "1. Why customers leave"],
    ["/predict", "2. Check a customer"],
    ["/models", "3. Best way to choose"],
    ["/campaign", "4. Plan a campaign"],
  ];
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo">◎</span> Keep Customers
          <span className="sub">Who should get a $50 discount so they don't leave?</span>
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
        Group 11 · Built on public data from a phone company (IBM Telco Customer Churn). The discount's effect is simulated.
      </footer>
    </div>
  );
}
