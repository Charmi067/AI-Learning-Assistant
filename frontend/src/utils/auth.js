// src/utils/auth.js
// ─────────────────────────────────────────────────────────────
// Simple helpers to store and retrieve auth session from localStorage.
// Replaces Firebase's onAuthStateChanged / getIdToken pattern.
//
// After login → call saveSession(session, user)
// On any API call → call getToken() for the Bearer token
// On logout → call clearSession()
// ─────────────────────────────────────────────────────────────

/** Save Supabase session + user to localStorage after login/signup */
export function saveSession(session, user) {
  localStorage.setItem("token", session.access_token);
  localStorage.setItem("user", JSON.stringify(user));
}

/** Get the stored access token (used as Bearer token in API calls) */
export function getToken() {
  return localStorage.getItem("token");
}

/** Get the stored user object (has .id, .email, .user_metadata.name) */
export function getUser() {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}

/** Returns true if user is logged in */
export function isLoggedIn() {
  return !!localStorage.getItem("token");
}

/** Clear session on logout */
export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
