import { getSupabase } from '../lib/supabase';

/**
 * Pengelolaan tautan publik wali murid (sisi GURU, butuh login).
 * Semua operasi berjalan lewat RLS: guru hanya bisa mengelola tautan miliknya.
 * Sisi wali murid ada di publicShareService.ts.
 */

export type ShareScope = 'absen' | 'nilai' | 'tabungan';

export const SHARE_SCOPE_LABEL: Record<ShareScope, string> = {
  absen: 'Absensi',
  nilai: 'Nilai',
  tabungan: 'Tabungan',
};

export interface ShareRow {
  id: string;
  token: string;
  classId: string;
  studentId: string;
  scopes: ShareScope[];
  expiresAt: string;
  createdAt: string;
}

const COLUMNS = 'id, token, class_id, student_id, scopes, expires_at, created_at';

function mapRow(row: any): ShareRow {
  return {
    id: row.id,
    token: row.token,
    classId: row.class_id,
    studentId: row.student_id,
    scopes: (row.scopes || []) as ShareScope[],
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

function friendlyError(error: { code?: string; message?: string } | null): string {
  const code = error?.code;
  if (code === '42501') {
    return 'Akses ditolak (42501). Pastikan supabase_public_share.sql sudah dijalankan dan Anda sudah login.';
  }
  if (code === 'PGRST205' || code === '42P01') {
    return 'Tabel public_shares belum ada. Jalankan supabase_public_share.sql di Supabase SQL Editor.';
  }
  if (code === '23503') {
    return 'Murid atau kelas belum tersimpan di Supabase. Muat ulang aplikasi lalu coba lagi.';
  }
  return error?.message || 'Terjadi kesalahan saat memproses tautan.';
}

/** Tautan yang dibagikan: ?p=<token>. Tidak memuat NISN, nama, atau id kelas. */
export function buildShareUrl(token: string): string {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('p', token);
  return url.toString();
}

/** Satu query: tautan aktif milik satu murid (terbaru di atas). */
export async function listActiveShares(studentId: string): Promise<ShareRow[]> {
  const { data, error } = await getSupabase()
    .from('public_shares')
    .select(COLUMNS)
    .eq('student_id', studentId)
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) throw new Error(friendlyError(error));
  return (data || []).map(mapRow);
}

export async function createShare(
  userId: string,
  input: { classId: string; studentId: string; scopes: ShareScope[]; days: number }
): Promise<ShareRow> {
  const supabase = getSupabase();
  const expiresAt = new Date(Date.now() + input.days * 86_400_000).toISOString();

  const { data, error } = await supabase
    .from('public_shares')
    .insert({
      user_id: userId,
      class_id: input.classId,
      student_id: input.studentId,
      scopes: input.scopes,
      expires_at: expiresAt,
    })
    .select(COLUMNS)
    .single();

  if (error || !data) throw new Error(friendlyError(error));

  // Satu tautan aktif per murid: cabut yang lama SETELAH yang baru berhasil dibuat,
  // sehingga wali murid tidak pernah kehilangan akses karena kegagalan di tengah jalan.
  const { error: revokeError } = await supabase
    .from('public_shares')
    .update({ revoked_at: new Date().toISOString() })
    .eq('student_id', input.studentId)
    .is('revoked_at', null)
    .neq('id', data.id);
  if (revokeError) {
    console.warn('[shareService] gagal mencabut tautan lama:', revokeError.message);
  }

  return mapRow(data);
}

export async function revokeShare(shareId: string): Promise<void> {
  const { error } = await getSupabase()
    .from('public_shares')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', shareId);
  if (error) throw new Error(friendlyError(error));
}
