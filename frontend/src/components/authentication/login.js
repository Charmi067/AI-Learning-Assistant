// src/components/authentication/login.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { saveSession } from "../../utils/auth";
import "../css/login.css";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const LoginHandler = async (e) => {
    e.preventDefault();
    console.log("API URL:", process.env.REACT_APP_API_URL); // add this line to debug
    setError("");
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        { email, password }
      );
      saveSession(response.data.session, response.data.user);
      navigate("/AiDashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginContainer">
      <div className="loginBox">
        <h1>Welcome Back! Restore Your Access</h1>
        <form onSubmit={LoginHandler}>
          <label htmlFor="email">E-mail:</label><br />
          <input value={email} type="email" onChange={(e) => setEmail(e.target.value)} placeholder="Enter Your E-Mail" required /><br /><br />
          <label htmlFor="password">Password:</label><br />
          <input value={password} type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Enter Your Password" required /><br /><br />
          {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
          <button type="submit" id="LoginButton" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button><br /><br />
          <a id="forgot" href="/forgot">Forgot Password?</a><br />
          <a href="/signUp" style={{ fontSize: "14px" }}>Don't have an account? Sign Up</a>
        </form>
      </div>
    </div>
  );
};
