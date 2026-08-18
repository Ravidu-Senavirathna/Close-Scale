import React from "react";
import { useAuth } from "../context/AuthContext";
import "./DashboardStubPage.css";

export default function DashboardStubPage() {
  const { currentUser } = useAuth();

  return (
    <div className="dashboard-content">
      <h2 className="dashboard-greeting">
        Good morning 👋
      </h2>
      <p className="dashboard-subtitle">
        Here's what's happening across your pipeline today.
      </p>
    </div>
  );
}
