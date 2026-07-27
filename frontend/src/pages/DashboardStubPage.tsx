/**
 * DashboardStubPage — placeholder landing page after login.
 * Will be replaced with real widgets in Epic 6 (Reporting & Dashboards).
 */

import "./DashboardStubPage.css";

export default function DashboardStubPage() {
  return (
    <div className="stub-root">
      <main className="stub-body">
        <div className="stub-card">
          <div className="stub-card__icon">🚀</div>
          <h1>You're in!</h1>
          <p style={{ marginTop: '1rem', color: '#94a3b8' }}>
            Select a module from the sidebar to get started.
          </p>
        </div>
      </main>
    </div>
  );
}
