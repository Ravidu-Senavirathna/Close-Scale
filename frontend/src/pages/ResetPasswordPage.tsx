import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { authApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import "./ResetPasswordPage.css";

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
    <div className="reset-root">
      <div className="reset-card">
        <div className="reset-header">
          <h2>Reset Your Password</h2>
        </div>
        
        {error && (
          <div className="reset-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="reset-form" noValidate>
          <div className="reset-form-group">
            <label htmlFor="reset-password">NEW PASSWORD</label>
            <input
              id="reset-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="reset-form-group">
            <label htmlFor="reset-confirm-password">CONFIRM NEW PASSWORD</label>
            <input
              id="reset-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="reset-btn-primary"
            disabled={loading || !password || !confirmPassword}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        
        <div className="reset-link-container">
          <Link to="/login" className="reset-link">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}