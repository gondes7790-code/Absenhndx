import { getSupabase } from '../lib/supabase';
import { Student } from '../types';

/**
 * Ambil murid milik guru. Jika `classId` diberikan, hanya murid rombel tersebut
 * yang dimuat (dipakai untuk lazy loading per kelas aktif).
 */
export async function fetchStudents(userId: string, classId?: string): Promise<Student[]> {
  const supabase = getSupabase();
  let query = supabase.from('students').select('*').eq('user_id', userId);
  if (classId) query = query.eq('class_id', classId);
  const { data, error } = await query.order('no_urut', { ascending: true });

  if (error) {
    console.error('[studentService] fetchStudents error:', error);
    throw new Error(error.message || 'Gagal memuat data murid.');
  }

  return (data || []).map((row) => ({
    id: row.id,
    nisn: row.nisn,
    noUrut: Number(row.no_urut) || 1,
    nama: row.nama,
    gender: (row.gender as 'L' | 'P') || 'L',
    classId: row.class_id,
    kontakOrtu: row.kontak_ortu || '',
    catatan: row.catatan || '',
  }));
}

/** Jumlah seluruh murid milik guru (tanpa mengunduh barisnya). */
export async function countStudents(userId: string): Promise<number> {
  const supabase = getSupabase();
  const { count, error } = await supabase
    .from('students')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    console.error('[studentService] countStudents error:', error);
    throw new Error(error.message || 'Gagal menghitung jumlah murid.');
  }
  return count ?? 0;
}

export async function createStudent(userId: string, std: Omit<Student, 'id'> & { id?: string }): Promise<Student | null> {
  const supabase = getSupabase();
  const id = std.id || crypto.randomUUID();

  const { data, error } = await supabase
    .from('students')
    .insert({
      id,
      user_id: userId,
      class_id: std.classId,
      nisn: std.nisn,
      no_urut: std.noUrut,
      nama: std.nama,
      gender: std.gender,
      kontak_ortu: std.kontakOrtu,
      catatan: std.catatan || '',
    })
    .select()
    .single();

  if (error || !data) {
    console.error('[studentService] createStudent error:', error);
    return null;
  }

  return {
    id: data.id,
    nisn: data.nisn,
    noUrut: Number(data.no_urut),
    nama: data.nama,
    gender: data.gender,
    classId: data.class_id,
    kontakOrtu: data.kontak_ortu,
    catatan: data.catatan,
  };
}

export async function createStudentsBatch(userId: string, students: Omit<Student, 'id'>[]): Promise<Student[]> {
  const supabase = getSupabase();
  const rows = students.map((s) => ({
    id: crypto.randomUUID(),
    user_id: userId,
    class_id: s.classId,
    nisn: s.nisn,
    no_urut: s.noUrut,
    nama: s.nama,
    gender: s.gender,
    kontak_ortu: s.kontakOrtu,
    catatan: s.catatan || '',
  }));

  const { data, error } = await supabase.from('students').insert(rows).select();

  if (error || !data) {
    console.error('[studentService] createStudentsBatch error:', error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    nisn: row.nisn,
    noUrut: Number(row.no_urut),
    nama: row.nama,
    gender: row.gender,
    classId: row.class_id,
    kontakOrtu: row.kontak_ortu,
    catatan: row.catatan,
  }));
}

export async function updateStudent(std: Student): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('students')
    .update({
      nisn: std.nisn,
      no_urut: std.noUrut,
      nama: std.nama,
      gender: std.gender,
      kontak_ortu: std.kontakOrtu,
      catatan: std.catatan,
    })
    .eq('id', std.id);

  if (error) {
    console.error('[studentService] updateStudent error:', error);
    return false;
  }
  return true;
}

export async function updateStudentsBatch(students: Student[], userId?: string): Promise<boolean> {
  if (!students || students.length === 0) return true;
  const supabase = getSupabase();
  const rows = students.map((std) => ({
    id: std.id,
    ...(userId ? { user_id: userId } : {}),
    class_id: std.classId,
    no_urut: std.noUrut,
    nama: std.nama,
    nisn: std.nisn,
    gender: std.gender,
    kontak_ortu: std.kontakOrtu,
    catatan: std.catatan || '',
  }));

  const { error } = await supabase
    .from('students')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    console.error('[studentService] updateStudentsBatch error:', error);
    return false;
  }
  return true;
}

export async function deleteStudent(studentId: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from('students').delete().eq('id', studentId);

  if (error) {
    console.error('[studentService] deleteStudent error:', error);
    return false;
  }
  return true;
}
