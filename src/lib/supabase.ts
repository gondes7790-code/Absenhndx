import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getStoredSupabaseConfig } from '../services/supabaseService';

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey = '';

/**
 * Returns a configured Supabase client instance.
 * Automatically updates if the stored URL or Anon Key changes.
 */
export function getSupabase(): SupabaseClient {
  const cfg = getStoredSupabaseConfig();
  const currentKey = `${cfg.url}:${cfg.anonKey}`;

  if (cachedClient && cachedConfigKey === currentKey) {
    return cachedClient;
  }

  // Ensure valid URL or fallback
  let validUrl = cfg.url?.trim() || '';
  if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
    validUrl = 'https://' + validUrl;
  }
  const validKey = cfg.anonKey?.trim() || 'dummy-anon-key';

  try {
    cachedClient = createClient(validUrl, validKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    cachedConfigKey = currentKey;
  } catch (err) {
    console.warn('[Supabase] Failed to initialize client with current config:', err);
    // Fallback client to prevent crashing
    cachedClient = createClient('https://fallback.supabase.co', 'fallback-key');
    cachedConfigKey = 'fallback';
  }

  return cachedClient;
}

/**
 * Resets the cached Supabase client so next getSupabase() reinitializes
 */
export function resetSupabaseClient() {
  cachedClient = null;
  cachedConfigKey = '';
}

/**
 * Tests connection to the configured Supabase instance
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const client = getSupabase();
    // Test auth service reachability
    const { error } = await client.auth.getSession();
    if (error && !error.message.includes('Auth session missing')) {
      return { success: false, message: error.message };
    }

    // Try a lightweight query to test PostgreSQL connection
    const { error: dbError } = await client
      .from('classes')
      .select('id', { count: 'exact', head: true })
      .limit(1);

    if (dbError) {
      // Table might not exist yet if SQL hasn't been run, but Supabase API responded
      if (dbError.code === '42P01' || dbError.message.includes('relation "public.classes" does not exist')) {
        return {
          success: true,
          message: 'Terhubung ke Supabase! Catatan: Tabel belum dibuat, silakan jalankan Skema SQL di Supabase SQL Editor.',
        };
      }
      return { success: false, message: `Database error: ${dbError.message}` };
    }

    return {
      success: true,
      message: 'Koneksi ke Supabase Cloud & PostgreSQL Database Berhasil!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Gagal menghubungi server Supabase. Periksa URL dan Anon Key.',
    };
  }
}

export const supabase = getSupabase();
