import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Memeriksa apakah kredensial Supabase sudah terkonfigurasi dengan valid (bukan placeholder).
 */
export function isSupabaseConfigured(): boolean {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  if (supabaseUrl.includes("your-project") || supabaseAnonKey.includes("your-anon-key")) {
    return false;
  }
  return true;
}

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Membuat atau mengembalikan singleton Supabase Browser Client.
 * Mengembalikan null jika kredensial belum dikonfigurasi.
 */
export function createClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      supabaseUrl!,
      supabaseAnonKey!
    );
  }

  return browserClient;
}
