import { getSupabase } from '../lib/supabase';
import { JournalEntry } from '../types';

export async function fetchJournals(userId: string): Promise<JournalEntry[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('journals')
    .select('*, classes(nama_kelas)')
    .eq('user_id', userId)
    .order('tanggal', { ascending: false });

  if (error) {
    console.error('[journalService] fetchJournals error:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    tanggal: row.tanggal,
    pendidik: row.pendidik || 'Pendidik',
    mapel: row.mapel || '',
    classId: row.class_id,
    className: row.classes?.nama_kelas || row.class_name || 'Kelas',
    pertemuanKe: Number(row.pertemuan_ke) || 1,
    jamPelajaran: row.jam_pelajaran || '',
    materiKegiatan: row.materi_kegiatan || '',
    absensiCatatan: row.absensi_catatan || '',
    semester: row.semester || 'Ganjil',
  }));
}

export async function createJournal(userId: string, journal: Omit<JournalEntry, 'id'> & { id?: string }): Promise<JournalEntry | null> {
  const supabase = getSupabase();
  const id = journal.id || crypto.randomUUID();

  const { data, error } = await supabase
    .from('journals')
    .insert({
      id,
      user_id: userId,
      class_id: journal.classId || null,
      tanggal: journal.tanggal,
      pendidik: journal.pendidik,
      mapel: journal.mapel,
      pertemuan_ke: Number(journal.pertemuanKe) || 1,
      jam_pelajaran: journal.jamPelajaran,
      materi_kegiatan: journal.materiKegiatan,
      absensi_catatan: journal.absensiCatatan || '',
      semester: journal.semester || 'Ganjil',
    })
    .select('*, classes(nama_kelas)')
    .single();

  if (error || !data) {
    console.error('[journalService] createJournal error:', error);
    return null;
  }

  return {
    id: data.id,
    tanggal: data.tanggal,
    pendidik: data.pendidik,
    mapel: data.mapel,
    classId: data.class_id,
    className: (data as any).classes?.nama_kelas || journal.className,
    pertemuanKe: Number(data.pertemuan_ke) || 1,
    jamPelajaran: data.jam_pelajaran,
    materiKegiatan: data.materi_kegiatan,
    absensiCatatan: data.absensi_catatan,
    semester: data.semester,
  };
}

export async function updateJournal(journal: JournalEntry): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('journals')
    .update({
      tanggal: journal.tanggal,
      pendidik: journal.pendidik,
      mapel: journal.mapel,
      class_id: journal.classId || null,
      pertemuan_ke: Number(journal.pertemuanKe) || 1,
      jam_pelajaran: journal.jamPelajaran,
      materi_kegiatan: journal.materiKegiatan,
      absensi_catatan: journal.absensiCatatan,
      semester: journal.semester,
    })
    .eq('id', journal.id);

  if (error) {
    console.error('[journalService] updateJournal error:', error);
    return false;
  }
  return true;
}

export async function deleteJournal(journalId: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from('journals').delete().eq('id', journalId);

  if (error) {
    console.error('[journalService] deleteJournal error:', error);
    return false;
  }
  return true;
}
