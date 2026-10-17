import { getSupabase } from '../lib/supabase';
import { ClassRoom } from '../types';

export async function fetchClasses(userId: string): Promise<ClassRoom[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[classService] fetchClasses error:', error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    nama: row.nama_kelas,
    tingkat: row.tingkat,
    jurusan: row.jurusan,
    tahunAjaran: row.tahun_ajaran || '2026/2027',
    semester: (row.semester as 'Ganjil' | 'Genap') || 'Ganjil',
    mapel: row.mapel,
    kkm: Number(row.kkm) || 75,
    formatifCount: Number(row.formatif_count) || 5,
    tpTitles: (row.tp_titles as Record<number, string>) || {},
  }));
}

export async function createClass(userId: string, cls: Omit<ClassRoom, 'id'> & { id?: string }): Promise<ClassRoom | null> {
  const supabase = getSupabase();
  const id = cls.id || crypto.randomUUID();

  const { data, error } = await supabase
    .from('classes')
    .insert({
      id,
      user_id: userId,
      nama_kelas: cls.nama,
      tingkat: cls.tingkat,
      jurusan: cls.jurusan,
      tahun_ajaran: cls.tahunAjaran,
      semester: cls.semester,
      mapel: cls.mapel,
      kkm: cls.kkm,
      formatif_count: cls.formatifCount,
      tp_titles: cls.tpTitles || {},
    })
    .select()
    .single();

  if (error || !data) {
    console.error('[classService] createClass error:', error);
    return null;
  }

  return {
    id: data.id,
    nama: data.nama_kelas,
    tingkat: data.tingkat,
    jurusan: data.jurusan,
    tahunAjaran: data.tahun_ajaran,
    semester: data.semester,
    mapel: data.mapel,
    kkm: Number(data.kkm),
    formatifCount: Number(data.formatif_count),
    tpTitles: (data.tp_titles as Record<number, string>) || {},
  };
}

export async function updateClass(cls: ClassRoom): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('classes')
    .update({
      nama_kelas: cls.nama,
      tingkat: cls.tingkat,
      jurusan: cls.jurusan,
      tahun_ajaran: cls.tahunAjaran,
      semester: cls.semester,
      mapel: cls.mapel,
      kkm: cls.kkm,
      formatif_count: cls.formatifCount,
      tp_titles: cls.tpTitles || {},
    })
    .eq('id', cls.id);

  if (error) {
    console.error('[classService] updateClass error:', error);
    return false;
  }
  return true;
}

export async function deleteClass(classId: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from('classes').delete().eq('id', classId);

  if (error) {
    console.error('[classService] deleteClass error:', error);
    return false;
  }
  return true;
}
