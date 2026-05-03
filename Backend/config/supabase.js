// config/supabase.js
// ─────────────────────────────────────────────────────────────
// Supabase client using the SERVICE ROLE key.
// This key is for BACKEND use only — never expose it to frontend.
// It bypasses Row Level Security, so keep it secret.
// ─────────────────────────────────────────────────────────────
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("❌  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = supabase;
