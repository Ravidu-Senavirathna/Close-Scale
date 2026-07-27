import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AppLayout.css";

export default function AppLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <aside className="app-sidebar">
        <div className="app-sidebar__logo">
          <span className="app-sidebar__mark">A</span>
          <span className="app-sidebar__name">Altrium CRM</span>
        </div>
        
        <nav className="app-sidebar__nav">
          <NavLink to="/" className={({ isActive }) => `app-sidebar__link ${isActive ? 'active' : ''}`} end>
            Dashboard
          </NavLink>
          <NavLink to="/contacts" className={({ isActive }) => `app-sidebar__link ${isActive ? 'active' : ''}`}>
            Contacts
          </NavLink>
          <NavLink to="/organizations" className={({ isActive }) => `app-sidebar__link ${isActive ? 'active' : ''}`}>
            Organizations
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="app-main-content">
        {/* Top Header */}
        <header className="app-header">
          <div className="app-header__user">
            <span className="app-header__avatar">
              {currentUser?.full_name?.[0]?.toUpperCase() ?? "U"}
            </span>
            <span className="app-header__username">{currentUser?.full_name}</span>
            <span className="app-header__role">
              {currentUser?.role === "MANAGER"
                ? `Manager · ${currentUser.department}`
                : currentUser?.role?.replace("_", " ")}
            </span>
            <button className="app-logout-btn" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="app-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
