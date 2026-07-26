/**
 * App — root routing configuration.
 *
 * Route structure:
 *   /login          — public (redirects to / if already logged in)
 *   /               — protected (requires auth)
 *   /*              — 404 fallback
 */

import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import LoginPage from "./pages/LoginPage";
import DashboardStubPage from "./pages/DashboardStubPage";

export default function App() {
  const { currentUser, isLoading } = useAuth();

  // Don't render routes until the session is restored
  if (isLoading) {
    return <AppLoadingScreen />;
  }

  return (
    <Routes>
      {/* Public route — redirect to dashboard if already authenticated */}
      <Route
        path="/login"
        element={currentUser ? <Navigate to="/" replace /> : <LoginPage />}
      />

      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<DashboardStubPage />} />
      </Route>

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/** Minimal full-screen loader shown while the auth session is being restored. */
function AppLoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0d0f14",
        color: "#6366f1",
        fontSize: "1.5rem",
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 32,
          height: 32,
          border: "3px solid rgba(99,102,241,0.25)",
          borderTopColor: "#6366f1",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
