import { createClient } from "@supabase/supabase-js"

/**
 * Privileged client with full data access — every repository.ts uses this.
 * Server-only: SUPABASE_SECRET_KEY must never reach the browser bundle.
 */
export function createPrivilegedClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
