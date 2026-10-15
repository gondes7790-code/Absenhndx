import { getSupabase } from '../lib/supabase';
import { AttendanceSession, AttendanceRecord, AttendanceStatus } from '../types';

export async function fetchAttendanceSessions(userId: string): Promise<AttendanceSession[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('attendance_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('pertemuan_ke', { ascending: true });

  if (error) {
    console.error('[attendanceService] fetchAttendanceSessions error:', error);
    return [];
  }

  return (data || []).map((row) => {
    // Parse possible combined materi/kegiatan from catatan_kegiatan
    let materi = '';
    let kegiatan = '';
    if (row.catatan_kegiatan) {
      if (row.catatan_kegiatan.includes('||')) {
        const parts = row.catatan_kegiatan.split('||');
        materi = parts[0]?.trim() || '';
        kegiatan = parts[1]?.trim() || '';
      } else {
        materi = row.catatan_kegiatan;
      }
    }

    return {
      id: row.id,
      classId: row.class_id,
      pertemuanKe: Number(row.pertemuan_ke) || 1,
      tanggal: row.tanggal,
      mapel: row.mapel || '',
      materi,
      kegiatan,
      catatan: row.catatan_kegiatan,
      createdAt: row.created_at || new Date().toISOString(),
    };
  });
}

export async function fetchAttendanceRecords(): Promise<AttendanceRecord[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*');

  if (error) {
    console.error('[attendanceService] fetchAttendanceRecords error:', error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    sessionId: row.session_id,
    studentId: row.student_id,
    status: (row.status as AttendanceStatus) || 'H',
    keterangan: row.keterangan || '',
    updatedAt: row.updated_at || new Date().toISOString(),
  }));
}

export async function createAttendanceSession(
  userId: string,
  session: Omit<AttendanceSession, 'id'> & { id?: string }
): Promise<AttendanceSession | null> {
  const supabase = getSupabase();
  const id = session.id || crypto.randomUUID();

  const combinedCatatan = session.kegiatan
    ? `${session.materi || ''} || ${session.kegiatan}`
    : session.materi || session.catatan || '';

  const { data, error } = await supabase
    .from('attendance_sessions')
    .insert({
      id,
      user_id: userId,
      class_id: session.classId,
      pertemuan_ke: session.pertemuanKe,
      tanggal: session.tanggal,
      mapel: session.mapel,
      catatan_kegiatan: combinedCatatan,
    })
    .select()
    .single();

  if (error || !data) {
    console.error('[attendanceService] createAttendanceSession error:', error);
    return null;
  }

  return {
    id: data.id,
    classId: data.class_id,
    pertemuanKe: Number(data.pertemuan_ke),
    tanggal: data.tanggal,
    mapel: data.mapel,
    materi: session.materi,
    kegiatan: session.kegiatan,
    createdAt: data.created_at,
  };
}

export async function updateAttendanceSession(session: AttendanceSession): Promise<boolean> {
  const supabase = getSupabase();
  const combinedCatatan = session.kegiatan
    ? `${session.materi || ''} || ${session.kegiatan}`
    : session.materi || session.catatan || '';

  const { error } = await supabase
    .from('attendance_sessions')
    .update({
      pertemuan_ke: session.pertemuanKe,
      tanggal: session.tanggal,
      mapel: session.mapel,
      catatan_kegiatan: combinedCatatan,
    })
    .eq('id', session.id);

  if (error) {
    console.error('[attendanceService] updateAttendanceSession error:', error);
    return false;
  }
  return true;
}

export async function deleteAttendanceSession(sessionId: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from('attendance_sessions').delete().eq('id', sessionId);

  if (error) {
    console.error('[attendanceService] deleteAttendanceSession error:', error);
    return false;
  }
  return true;
}

export async function upsertAttendanceRecord(
  record: Omit<AttendanceRecord, 'id'> & { id?: string }
): Promise<AttendanceRecord | null> {
  const supabase = getSupabase();
  const id = record.id || crypto.randomUUID();

  const { data, error } = await supabase
    .from('attendance_records')
    .upsert(
      {
        id,
        session_id: record.sessionId,
        student_id: record.studentId,
        status: record.status,
        keterangan: record.keterangan || '',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'session_id,student_id' }
    )
    .select()
    .single();

  if (error || !data) {
    console.error('[attendanceService] upsertAttendanceRecord error:', error);
    return null;
  }

  return {
    id: data.id,
    sessionId: data.session_id,
    studentId: data.student_id,
    status: data.status,
    keterangan: data.keterangan,
    updatedAt: data.updated_at,
  };
}

export async function upsertAttendanceRecordsBatch(
  records: (Omit<AttendanceRecord, 'id'> & { id?: string })[]
): Promise<boolean> {
  const supabase = getSupabase();
  const rows = records.map((r) => ({
    id: r.id || crypto.randomUUID(),
    session_id: r.sessionId,
    student_id: r.studentId,
    status: r.status,
    keterangan: r.keterangan || '',
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('attendance_records')
    .upsert(rows, { onConflict: 'session_id,student_id' });

  if (error) {
    console.error('[attendanceService] upsertAttendanceRecordsBatch error:', error);
    return false;
  }
  return true;
}
