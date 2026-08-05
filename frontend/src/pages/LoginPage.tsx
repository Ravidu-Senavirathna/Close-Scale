import { FormEvent, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
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
      {/* Left panel — branding and illustration */}
      <aside className="login-brand">
        <div className="brand-logo-container">
          <img src="/logo.png" alt="Close - Scale Logo" className="brand-logo" />
        </div>
        <div className="brand-illustration-container">
          <img src="/reception.png" alt="Reception Illustration" className="brand-illustration" />
        </div>
      </aside>

      {/* Right panel — form */}
      <main className="login-form-panel">
        <div className="login-card">
          <header className="login-card__header">
            <h2>Welcome Back</h2>
          </header>

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <div className="form-group">
              <label htmlFor="login-username">Username</label>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                placeholder="your-username"
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
                placeholder="*************"
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
                "Sign In"
              )}
            </button>
          </form>

          <footer className="login-card__footer">
            <Link to="/forgot-password" style={{ color: "inherit", textDecoration: "none", fontSize: "0.9rem" }}>
              Forgot your password?
            </Link>
          </footer>
        </div>
      </main>
    </div>
  );
}
