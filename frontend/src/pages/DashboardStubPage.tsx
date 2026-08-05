/**
 * DashboardStubPage — placeholder landing page after login.
 * Will be replaced with real widgets in Epic 6 (Reporting & Dashboards).
 */

import { useAuth } from "../context/AuthContext";

export default function DashboardStubPage() {
  const { currentUser } = useAuth();

  return (
    <div style={{ padding: "8px" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#f8fafc" }}>
        Welcome, {currentUser?.full_name || currentUser?.username}!
      </h2>
      <p style={{ color: "#94a3b8", marginTop: "12px", fontSize: "1rem" }}>
        Select an option from the sidebar to get started, or wait for dashboard widgets in Epic 6.
      </p>
    </div>
  );
}
