import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getStoredSupabaseConfig } from './supabaseService';

/**
 * Sisi WALI MURID (tanpa login).
 * Sengaja TIDAK memakai lib/supabase.ts: klien di sini tidak menyimpan sesi,
 * tidak memperbarui token, dan tidak menyentuh localStorage, sehingga ringan
 * dan terpisah dari aplikasi guru. Satu-satunya akses ke data adalah RPC
 * get_public_share(token).
 */

export interface PublicShareData {
  school: string;
  teacher: string;
  class: { nama: string; mapel: string; tahun_ajaran: string; semester: string; kkm: number };
  student: { nama: string; no_urut: number };
  scopes: Array<'absen' | 'nilai' | 'tabungan'>;
  expires_at: string;
  attendance?: {
    total: number;
    summary: { H: number; S: number; I: number; A: number; D: number };
    recent: Array<{ tanggal: string; pertemuan_ke: number; status: string; keterangan: string | null }>;
  };
  grades?: {
    formatif: Array<number | null>;
    sts: number | null;
    sas: number | null;
    deskripsi: string | null;
  } | null;
  savings?: {
    saldo: number;
    recent: Array<{ tanggal: string; tipe: string; keterangan: string; nominal: number }>;
  };
}

export const TOKEN_PATTERN = /^[0-9a-f]{64}$/;

let client: SupabaseClient | null = null;

function getPublicClient(): SupabaseClient {
  if (client) return client;
  const cfg = getStoredSupabaseConfig();
  let url = cfg.url?.trim() || '';
  const key = cfg.anonKey?.trim() || '';
  if (!url || !key) {
    throw new Error(
      'Situs ini belum dikonfigurasi. Admin perlu mengisi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY saat build.'
    );
  }
  if (!/^https:\/\//.test(url)) url = `https://${url}`;
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}

/** null = tautan tidak valid / kedaluwarsa / dicabut (sengaja tidak dibedakan). */
export async function fetchPublicShare(token: string): Promise<PublicShareData | null> {
  if (!TOKEN_PATTERN.test(token)) return null;
  const { data, error } = await getPublicClient().rpc('get_public_share', { p_token: token });
  if (error) throw new Error(error.message || 'Gagal menghubungi server.');
  return (data as PublicShareData | null) ?? null;
}
