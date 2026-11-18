import React from "react";
import { useViewMode } from "../context/ViewModeContext.jsx";
import ManagerOverview from "./ManagerOverview.jsx";
import DashboardAgent from "./DashboardAgent.jsx";
import DashboardDataScientist from "./DashboardDataScientist.jsx";

export default function Dashboard() {
  const { viewMode } = useViewMode();

  if (viewMode === "agent") {
    return <DashboardAgent />;
  }

  if (viewMode === "tech" || viewMode === "scientist") {
    return <DashboardDataScientist />;
  }

  return <ManagerOverview />;
}
