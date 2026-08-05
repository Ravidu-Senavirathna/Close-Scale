import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { authApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

export default function ResetPasswordPage() {
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
      setError("Invalid reset link");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({
        uid,
        token,
        new_password: password,
      });
      navigate("/login", { state: { message: "Password reset successfully. Please log in with your new password." } });
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        (err.response?.data?.new_password ? err.response.data.new_password[0] : "Failed to reset password. The link may be expired.")
      );
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
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem", color: "var(--palette-dark-blue)" }}>Reset Your Password</h2>
        
        {error && (
          <div style={{ backgroundColor: "#fee2e2", color: "#991b1b", padding: "0.75rem", borderRadius: "4px", marginBottom: "1rem", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: 500 }}>
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "0.875rem", fontWeight: 500 }}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        
        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <Link to="/login" style={{ color: "var(--palette-teal)", textDecoration: "none", fontSize: "0.875rem" }}>
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}