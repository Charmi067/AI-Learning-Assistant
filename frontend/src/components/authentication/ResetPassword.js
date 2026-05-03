// src/components/authentication/ResetPassword.js
// Calls backend POST /auth/forgot-password
// Supabase sends the reset email automatically
import { useState } from "react";
import axios from "axios";
import "../css/login.css";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const forgotPasswordHandler = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/forgot-password`, { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginContainer">
      <div className="loginBox">
        <h1>Reset Your Password</h1>
        {sent ? (
          <div>
            <p style={{ color: "green" }}>
              ✅ If this email is registered, a password reset link has been sent.<br />
              Please check your inbox.
            </p>
            <a href="/login">← Back to Login</a>
          </div>
        ) : (
          <form onSubmit={forgotPasswordHandler}>
            <label htmlFor="email">E-mail:</label><br />
            <input
              value={email}
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Your E-Mail"
              required
            /><br /><br />
            {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Email"}
            </button>
            <br /><br />
            <a href="/login">← Back to Login</a>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
