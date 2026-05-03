// src/components/authentication/SignUp.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/SignUp.css";

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/signup`, {
        name,
        email,
        password,
      });
      alert("✅ Signup successful! Please check your email to verify your account, then login.");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || "Signup failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Create an account</h2>
        <form onSubmit={submitHandler}>
          <label htmlFor="name">Full Name:</label>
          <input className="signup-input" value={name} id="name" type="text" onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />

          <label htmlFor="email">E-mail:</label>
          <input className="signup-input" value={email} id="email" type="email" onChange={(e) => setEmail(e.target.value)} placeholder="Enter your e-mail" required />

          <label htmlFor="password">Password:</label>
          <input className="signup-input" value={password} id="password" type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Create a password (min 6 chars)" required />

          {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}

          <button className="signup-button" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
        <div className="signup-footer">
          Already have an account? <a href="/login">Sign In</a>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
