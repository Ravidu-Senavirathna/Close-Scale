/**
 * DashboardStubPage — placeholder landing page after login.
 * Will be replaced with real widgets in Epic 6 (Reporting & Dashboards).
 */

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./DashboardStubPage.css";

export default function DashboardStubPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="stub-root">
      {/* Top nav */}
      <nav className="stub-nav">
        <div className="stub-nav__logo">
          <span className="stub-nav__mark">A</span>
          <span className="stub-nav__name">Altrium CRM</span>
        </div>
        <div className="stub-nav__user">
          <span className="stub-nav__avatar">
            {currentUser?.full_name?.[0]?.toUpperCase() ?? "U"}
          </span>
          <span className="stub-nav__username">{currentUser?.full_name}</span>
          <span className="stub-nav__role">
            {currentUser?.role === "MANAGER"
              ? `Manager · ${currentUser.department}`
              : currentUser?.role?.replace("_", " ")}
          </span>
          <button id="logout-btn" className="stub-logout-btn" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </nav>

      {/* Body */}
      <main className="stub-body">
        <div className="stub-card">
          <div className="stub-card__icon">🚀</div>
          <h1>You're in!</h1>

          {currentUser?.role === "ADMIN" && (
            <button
              className="stub-btn-primary"
              onClick={() => navigate("/admin/users")}
            >
              Go to User Management
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
