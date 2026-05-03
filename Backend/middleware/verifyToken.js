// middleware/verifyToken.js
// ─────────────────────────────────────────────────────────────
// Replaces the old Firebase verifyIdToken middleware.
// Reads the Bearer token from Authorization header and
// validates it against Supabase Auth.
// On success → attaches req.user (Supabase user object)
// ─────────────────────────────────────────────────────────────
const supabase = require("../config/supabase.js");

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // supabase.auth.getUser() validates the JWT and returns the user
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }

    req.user = user; // user.id is the Supabase UUID
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    return res.status(401).json({ message: "Unauthorized: Token verification failed" });
  }
}

module.exports = { verifyToken };
