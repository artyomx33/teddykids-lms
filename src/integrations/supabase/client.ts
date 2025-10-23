import { createClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

/**
 * Supabase client configured from Vite environment variables.
 *
 * Expected vars (define in `.env` or Factory env settings):
 *  - VITE_SUPABASE_URL
 *  - VITE_SUPABASE_PUBLISHABLE_KEY
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

// Removed top-level logger call - causes initialization error
// logger.debug('supabaseClient', 'Initializing with URL:', SUPABASE_URL);

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

// Silent initialization complete
// Removed top-level logger call - causes initialization error
// logger.debug('supabaseClient', 'Instance created with realtime:',
//   supabase.realtime.accessToken ? 'Configured' : 'Not configured'
// );
