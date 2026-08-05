import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../api/authApi";

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
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f9fafb",
      padding: "1rem"
    }}>
      <div style={{
        maxWidth: "400px",
        width: "100%",
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem", color: "var(--palette-dark-blue)" }}>Forgot Password</h2>
        
        {error && (
          <div style={{ backgroundColor: "#fee2e2", color: "#991b1b", padding: "0.75rem", borderRadius: "4px", marginBottom: "1rem", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}

        {success ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ backgroundColor: "#d1fae5", color: "#065f46", padding: "1rem", borderRadius: "4px", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
              If an account with that email exists, we have sent a password reset link. Please check your inbox.
            </div>
            <Link to="/login" style={{ color: "var(--palette-teal)", textDecoration: "none", fontWeight: 500 }}>
              Return to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ color: "#4b5563", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: 500 }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "var(--palette-teal)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            
            <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
              <Link to="/login" style={{ color: "var(--palette-teal)", textDecoration: "none", fontSize: "0.875rem" }}>
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
