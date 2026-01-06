import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Create a server-side Supabase client configured to integrate with Next.js cookies for SSR session handling.
 *
 * The client is initialized using the application's Supabase URL and anon key and will read from and write to
 * Next.js' cookie store so session cookies are preserved during server-side rendering.
 *
 * @returns A SupabaseClient instance parameterized for the application's Database type.
 */
export async function createClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}

/**
 * Create an administrative Supabase client configured with the service role key.
 *
 * @returns A SupabaseClient for the project's database authenticated with the service role key (bypasses Row Level Security).
 */
export function createAdminClient(): SupabaseClient<Database> {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}