import { createBrowserClient } from "@supabase/ssr"

/** Browser client for client components. Uses the publishable (anon-scoped) key. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
