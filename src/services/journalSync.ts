import {
  AttendanceRecord,
  AttendanceSession,
  ClassRoom,
  JournalEntry,
  Student,
} from '../types';

/**
 * Ringkas hasil presensi satu sesi menjadi catatan singkat untuk agenda mengajar.
 * Contoh: "Hadir 28, Sakit 1, Izin 0, Alpa 1 (dari 30 siswa)"
 */
export function buildAttendanceNote(
  students: Student[],
  records: AttendanceRecord[]
): string {
  const total = students.length;
  if (total === 0 && records.length === 0) {
    return 'Belum ada data presensi.';
  }

  let hadir = 0;
  let sakit = 0;
  let izin = 0;
  let alpa = 0;

  const byStudent = new Map<string, string>();
  for (const r of records) {
    byStudent.set(r.studentId, (r.status || 'H').toUpperCase());
  }

  for (const st of students) {
    const status = byStudent.get(st.id) || 'A';
    switch (status) {
      case 'H':
        hadir++;
        break;
      case 'S':
        sakit++;
        break;
      case 'I':
        izin++;
        break;
      default:
        alpa++;
        break;
    }
  }

  for (const [studentId, status] of byStudent) {
    if (students.some((s) => s.id === studentId)) continue;
    switch (status) {
      case 'H':
        hadir++;
        break;
      case 'S':
        sakit++;
        break;
      case 'I':
        izin++;
        break;
      default:
        alpa++;
        break;
    }
  }

  const parts = [
    `Hadir ${hadir}`,
    `Sakit ${sakit}`,
    `Izin ${izin}`,
    `Alpa ${alpa}`,
  ];
  const fromTotal = total > 0 ? ` (dari ${total} siswa)` : '';
  return parts.join(', ') + fromTotal;
}

/**
 * Cari agenda mengajar yang sudah ada untuk sesi presensi tertentu.
 */
export function findJournalForSession(
  journals: JournalEntry[],
  session: AttendanceSession
): JournalEntry | undefined {
  return journals.find(
    (j) =>
      j.classId === session.classId &&
      Number(j.pertemuanKe) === Number(session.pertemuanKe)
  );
}

/**
 * Gabungkan data sesi presensi terbaru ke agenda yang sudah ada.
 */
export function mergeSessionIntoJournal(
  existing: JournalEntry,
  session: AttendanceSession,
  note: string
): JournalEntry {
  const materi = session.materi?.trim() || '';
  const kegiatan = session.kegiatan?.trim() || '';
  const combinedFromSession =
    materi && kegiatan ? `${materi} — ${kegiatan}` : materi || kegiatan || session.catatan || '';

  return {
    ...existing,
    tanggal: session.tanggal || existing.tanggal,
    mapel: session.mapel || existing.mapel,
    jamPelajaran: session.jamPelajaran || existing.jamPelajaran,
    materiKegiatan: existing.materiKegiatan?.trim()
      ? existing.materiKegiatan
      : combinedFromSession || existing.materiKegiatan,
    materi: existing.materi?.trim() ? existing.materi : materi || existing.materi,
    kegiatan: existing.kegiatan?.trim() ? existing.kegiatan : kegiatan || existing.kegiatan,
    absensiCatatan: note,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Buat entri agenda mengajar baru dari sesi presensi.
 */
export function createJournalFromSession(
  id: string,
  session: AttendanceSession,
  cls: ClassRoom | undefined,
  teacher: string,
  note: string
): JournalEntry {
  const materi = session.materi?.trim() || '';
  const kegiatan = session.kegiatan?.trim() || '';
  const materiKegiatan =
    materi && kegiatan
      ? `${materi} — ${kegiatan}`
      : materi || kegiatan || session.catatan || 'Materi sesuai RPP / modul ajar';

  const semesterLabel = cls
    ? `\( {cls.tahunAjaran || ''} ( \){cls.semester || 'Ganjil'})`.trim()
    : '2026/2027 (Ganjil)';

  return {
    id,
    tanggal: session.tanggal,
    classId: session.classId,
    className: cls?.nama || '',
    mapel: session.mapel || cls?.mapel || '',
    pertemuanKe: Number(session.pertemuanKe) || 1,
    jamPelajaran: session.jamPelajaran || '',
    materiKegiatan,
    materi: materi || undefined,
    kegiatan: kegiatan || undefined,
    absensiCatatan: note,
    semester: semesterLabel,
    guru: teacher || '',
    createdAt: session.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate deskripsi capaian kompetensi (gaya Kurikulum Merdeka)
 * berdasarkan rata-rata nilai formatif dibanding KKM.
 */
export function buildGradeDescription(
  name: string,
  formatif: (number | null)[] | undefined,
  kkm: number
): string {
  const scores = (formatif || []).filter(
    (v): v is number => typeof v === 'number' && !Number.isNaN(v)
  );

  if (scores.length === 0) {
    return `${name} belum memiliki data penilaian formatif yang cukup untuk dibuatkan deskripsi capaian.`;
  }

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const rounded = Math.round(avg);

  if (rounded >= kkm + 15) {
    return `${name} menunjukkan penguasaan kompetensi yang sangat baik (rata-rata ${rounded}). Mampu menerapkan konsep secara mandiri dan konsisten melampaui KKM.`;
  }
  if (rounded >= kkm + 5) {
    return `${name} telah menguasai kompetensi dengan baik (rata-rata ${rounded}). Mampu menyelesaikan tugas dengan tepat dan menunjukkan pemahaman yang kuat.`;
  }
  if (rounded >= kkm) {
    return `${name} mencapai kompetensi sesuai kriteria ketuntasan (rata-rata ${rounded}). Perlu penguatan pada beberapa indikator agar lebih optimal.`;
  }
  if (rounded >= kkm - 10) {
    return `${name} belum sepenuhnya mencapai KKM (rata-rata ${rounded}). Memerlukan bimbingan tambahan dan latihan terfokus pada materi yang belum dikuasai.`;
  }
  return `${name} memerlukan perhatian khusus (rata-rata ${rounded}). Disarankan pendampingan intensif dan remedial agar dapat mencapai kompetensi dasar.`;
}
