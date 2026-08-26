import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { authApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";

export default function ActivatePage() {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // If already logged in, redirect to dashboard
  if (currentUser) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!uid || !token) {
      setError("Invalid activation link");
      return;
    }

    setLoading(true);
    try {
      await authApi.activateAccount({
        uid,
        token,
        new_password: password,
      });
      navigate("/login", { state: { message: "Account activated successfully. Please log in." } });
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        (err.response?.data?.new_password ? err.response.data.new_password[0] : "Failed to activate account. The link may be expired.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Left panel */}
      <aside className="login-brand">
        <div className="login-brand-content">
          <h1 className="brand-headline">
            Your leads.<br />
            Your team.<br />
            <span className="text-green">One place.</span>
          </h1>
          <p className="brand-description">
            Manage leads, track deals through technical and financial assessments, coordinate project delivery, and monitor your pipeline — all from a single platform built for the way your team actually works.
          </p>

          <div className="brand-features">
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>
              </div>
              <div className="feature-text">
                <h4>Lead & Deal Pipeline</h4>
                <p>From first contact to signed deal</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon filled">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="12"></circle></svg>
              </div>
              <div className="feature-text">
                <h4>Technical & Financial Assessments</h4>
                <p>Structured review workflows</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
              </div>
              <div className="feature-text">
                <h4>Project Delivery</h4>
                <p>Resources, tasks, milestones</p>
              </div>
            </div>
          </div>

          <footer className="brand-footer">
            &copy; 2026 Altrium. All rights reserved.
          </footer>
        </div>
      </aside>

      {/* Right panel — form */}
      <main className="login-form-panel">
        <div className="login-form-container">
          <header className="login-header">
            <h2>Activate Your Account</h2>
            <p>Set a secure password to get started.</p>
          </header>

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <div className="form-group">
              <label htmlFor="new-password">NEW PASSWORD</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">CONFIRM PASSWORD</label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="login-error" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                {error}
              </div>
            )}

            <button type="submit" className="login-btn-primary" disabled={loading}>
              {loading ? "Activating..." : "Activate Account"}
            </button>
            
            <div className="back-to-login" style={{ marginTop: "1.5rem", textAlign: "center" }}>
              <Link to="/login" className="forgot-password-link">
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
