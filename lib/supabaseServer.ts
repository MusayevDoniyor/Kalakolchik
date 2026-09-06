import { createClient } from "@supabase/supabase-js";

/**
 * Creates and returns a Supabase client for server-side usage.
 * Uses Service Role key if available, otherwise falls back to public key.
 */
export function getSupabaseAdmin() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://innkgyknwiehspebjypz.supabase.co";

  // Clean URL in case rest/v1 was appended
  const cleanUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, "");

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  if (!serviceRoleKey) {
    throw new Error("Missing Supabase key in environment variables");
  }

  return createClient(cleanUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
