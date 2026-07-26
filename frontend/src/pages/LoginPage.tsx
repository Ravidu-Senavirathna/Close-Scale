/**
 * LoginPage — email/password authentication.
 *
 * - Calls POST /api/auth/token/ via the AuthContext login() action.
 * - After success, redirects to the page the user was trying to reach (or "/").
 */

import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from: string = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch {
      setError("Invalid credentials. Please check your username and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-root">
      {/* Left panel — branding */}
      <aside className="login-brand">
        <div className="login-brand__inner">
          <div className="login-logo">
            <span className="login-logo__mark">A</span>
          </div>
          <h1 className="login-brand__title">Altrium CRM</h1>
          <p className="login-brand__subtitle">
            The complete client lifecycle platform for modern software teams.
          </p>
        </div>
        <div className="login-brand__glow" aria-hidden="true" />
      </aside>

      {/* Right panel — form */}
      <main className="login-form-panel">
        <div className="login-card">
          <header className="login-card__header">
            <h2>Welcome back</h2>
            <p>Sign in to your Altrium workspace</p>
          </header>


          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <div className="form-group">
              <label htmlFor="login-username">Username</label>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                placeholder="your.username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="login-error" role="alert">
                <span>⚠</span> {error}
              </div>
            )}

            <button
              id="login-submit-btn"
              type="submit"
              className="btn-primary"
              disabled={loading || !username || !password}
            >
              {loading ? (
                <span className="btn-spinner" aria-label="Signing in…" />
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <footer className="login-card__footer">
            <p>
              Having trouble? Contact your{" "}
              <strong>system administrator</strong>.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
