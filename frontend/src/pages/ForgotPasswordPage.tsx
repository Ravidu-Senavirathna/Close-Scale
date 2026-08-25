import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../api/authApi";
import "./ForgotPasswordPage.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError("Failed to process request. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-root">
      <div className="forgot-card">
        <div className="forgot-header">
          <h2>Forgot Password</h2>
          {!success && (
            <p>Enter your email address and we'll send you a link to reset your password.</p>
          )}
        </div>
        
        {error && (
          <div className="forgot-error" role="alert">
            {error}
          </div>
        )}

        {success ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="forgot-success">
              If an account with that email exists, we have sent a password reset link. Please check your inbox.
            </div>
            <div className="forgot-link-container">
              <Link to="/login" className="forgot-link">
                Return to login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="forgot-form" noValidate>
            <div className="forgot-form-group">
              <label htmlFor="forgot-email">EMAIL ADDRESS</label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="forgot-btn-primary"
              disabled={loading || !email}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            
            <div className="forgot-link-container">
              <Link to="/login" className="forgot-link">
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
