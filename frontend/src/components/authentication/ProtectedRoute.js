// src/components/authentication/ProtectedRoute.js
// ─────────────────────────────────────────────────────────────
// Replaces Firebase's onAuthStateChanged check.
// Simply checks if a token exists in localStorage.
// If not logged in → redirect to /login
// ─────────────────────────────────────────────────────────────
import React from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../../utils/auth";

const ProtectedRoute = ({ children }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
