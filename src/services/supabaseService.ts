export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastSynced: string;
}

const STORAGE_KEY_CONFIG = 'hndx_supabase_config_v1';

// Baca dari env (utama)
export const ENV_SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) || '';
export const ENV_SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || '';

/** true = production / ada env → tidak boleh diubah dari browser */
export const IS_CONFIG_LOCKED = Boolean(
  ENV_SUPABASE_URL.trim() && ENV_SUPABASE_ANON_KEY.trim()
);

export function getStoredSupabaseConfig(): SupabaseConfig {
  // Production: SELALU pakai env, abaikan localStorage
  if (IS_CONFIG_LOCKED) {
    return {
      url: ENV_SUPABASE_URL.trim(),
      anonKey: ENV_SUPABASE_ANON_KEY.trim(),
      isConnected: true,
      lastSynced: new Date().toISOString(),
    };
  }

  // Development / belum ada env: boleh pakai localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        url: parsed.url || ENV_SUPABASE_URL,
        anonKey: parsed.anonKey || ENV_SUPABASE_ANON_KEY,
        isConnected: Boolean(parsed.isConnected),
        lastSynced: parsed.lastSynced || '',
      };
    }
  } catch {
    // fallback
  }

  return {
    url: ENV_SUPABASE_URL,
    anonKey: ENV_SUPABASE_ANON_KEY,
    isConnected: false,
    lastSynced: '',
  };
}

export function saveStoredSupabaseConfig(cfg: SupabaseConfig) {
  // Production: tolak perubahan
  if (IS_CONFIG_LOCKED) {
    console.warn(
      '[supabaseService] Konfigurasi dikunci oleh environment variables. Perubahan diabaikan.'
    );
    return;
  }
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(cfg));
}
