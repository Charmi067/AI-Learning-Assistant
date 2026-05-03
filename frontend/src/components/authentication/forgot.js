// src/components/authentication/forgot.js
// ─────────────────────────────────────────────────────────────
// Simplified forgot page — just shows the Reset Password option.
// Google login and Phone login are removed (backend doesn't support them).
// ─────────────────────────────────────────────────────────────
import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/login.css";

const Forgot = () => {
  const navigate = useNavigate();

  return (
    <div className="loginContainer">
      <div className="loginBox">
        <h1>Account Recovery</h1>
        <p style={{ marginBottom: "20px", color: "#555" }}>
          Choose an option below to recover your account.
        </p>
        <button id="GoogleButton" type="button" onClick={() => navigate("/reset-password")}>
          📧 Reset Password via Email
        </button>
        <br /><br />
        <a href="/login" style={{ fontSize: "14px" }}>← Back to Login</a>
      </div>
    </div>
  );
};

export default Forgot;
