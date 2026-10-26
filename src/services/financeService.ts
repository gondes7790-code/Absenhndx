import { getSupabase } from '../lib/supabase';
import { FinanceTransaction } from '../types';

export async function fetchFinances(userId: string, classId?: string): Promise<FinanceTransaction[]> {
  const supabase = getSupabase();
  let query = supabase.from('finances').select('*, students(nama)').eq('user_id', userId);
  if (classId) query = query.eq('class_id', classId);
  const { data, error } = await query.order('tanggal', { ascending: false });

  if (error) {
    console.error('[financeService] fetchFinances error:', error);
    throw new Error(error.message || 'Gagal memuat data keuangan.');
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    tanggal: row.tanggal,
    classId: row.class_id,
    tipe: (row.tipe as 'Pemasukan' | 'Pengeluaran') || 'Pemasukan',
    kategori: (row.kategori as 'Kas Kelas' | 'Tabungan Siswa') || 'Kas Kelas',
    keterangan: row.keterangan || '',
    nominal: Number(row.nominal) || 0,
    pencatat: row.pencatat || 'Bendahara',
    studentId: row.student_id || undefined,
    studentName: row.students?.nama || undefined,
  }));
}

export async function createFinance(userId: string, item: Omit<FinanceTransaction, 'id'> & { id?: string }): Promise<FinanceTransaction | null> {
  const supabase = getSupabase();
  const id = item.id || crypto.randomUUID();

  const { data, error } = await supabase
    .from('finances')
    .insert({
      id,
      user_id: userId,
      class_id: item.classId,
      tanggal: item.tanggal,
      tipe: item.tipe,
      kategori: item.kategori,
      keterangan: item.keterangan,
      nominal: item.nominal,
      pencatat: item.pencatat,
      student_id: item.studentId || null,
    })
    .select('*, students(nama)')
    .single();

  if (error || !data) {
    console.error('[financeService] createFinance error:', error);
    return null;
  }

  return {
    id: data.id,
    tanggal: data.tanggal,
    classId: data.class_id,
    tipe: data.tipe,
    kategori: data.kategori,
    keterangan: data.keterangan,
    nominal: Number(data.nominal),
    pencatat: data.pencatat,
    studentId: data.student_id || undefined,
    studentName: (data as any).students?.nama || item.studentName,
  };
}

export async function deleteFinance(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from('finances').delete().eq('id', id);

  if (error) {
    console.error('[financeService] deleteFinance error:', error);
    return false;
  }
  return true;
}
