import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function assert(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

/**
 * Anonymous (RLS-enforced) client for server-side reads of public data.
 */
export function createAnonClient(): SupabaseClient {
  return createClient(assert(url, "NEXT_PUBLIC_SUPABASE_URL"), assert(anonKey, "NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    auth: { persistSession: false },
  });
}

/**
 * Service-role client. Bypasses RLS. Server-only — never import from client code.
 */
export function createServiceClient(): SupabaseClient {
  return createClient(assert(url, "NEXT_PUBLIC_SUPABASE_URL"), assert(serviceRoleKey, "SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false },
  });
}
