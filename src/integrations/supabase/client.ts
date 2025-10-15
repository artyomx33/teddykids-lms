import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client configured from Vite environment variables.
 *
 * Expected vars (define in `.env` or Factory env settings):
 *  - VITE_SUPABASE_URL
 *  - VITE_SUPABASE_PUBLISHABLE_KEY
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    "Missing Supabase env vars: ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set"
  );
}

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
