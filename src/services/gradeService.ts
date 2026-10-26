import { getSupabase } from '../lib/supabase';
import { GradeRecord } from '../types';

export async function fetchGrades(userId: string, classId?: string): Promise<GradeRecord[]> {
  const supabase = getSupabase();
  let query = supabase.from('grades').select('*').eq('user_id', userId);
  if (classId) query = query.eq('class_id', classId);
  const { data, error } = await query;

  if (error) {
    console.error('[gradeService] fetchGrades error:', error);
    throw new Error(error.message || 'Gagal memuat data nilai.');
  }

  return (data || []).map((row) => ({
    id: row.id,
    classId: row.class_id,
    studentId: row.student_id,
    formatif: Array.isArray(row.formatif) ? row.formatif : [],
    sts: row.sts !== null ? Number(row.sts) : null,
    sas: row.sas !== null ? Number(row.sas) : null,
    deskripsi: row.deskripsi_merdeka || '',
    updatedAt: row.updated_at || new Date().toISOString(),
  }));
}

export async function upsertGrade(userId: string, grade: Omit<GradeRecord, 'id'> & { id?: string }): Promise<GradeRecord | null> {
  const supabase = getSupabase();
  const id = grade.id || crypto.randomUUID();

  const { data, error } = await supabase
    .from('grades')
    .upsert(
      {
        id,
        user_id: userId,
        class_id: grade.classId,
        student_id: grade.studentId,
        formatif: grade.formatif,
        sts: grade.sts,
        sas: grade.sas,
        deskripsi_merdeka: grade.deskripsi,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'class_id,student_id' }
    )
    .select()
    .single();

  if (error || !data) {
    console.error('[gradeService] upsertGrade error:', error);
    return null;
  }

  return {
    id: data.id,
    classId: data.class_id,
    studentId: data.student_id,
    formatif: data.formatif,
    sts: data.sts !== null ? Number(data.sts) : null,
    sas: data.sas !== null ? Number(data.sas) : null,
    deskripsi: data.deskripsi_merdeka,
    updatedAt: data.updated_at,
  };
}
