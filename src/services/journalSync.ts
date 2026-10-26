/**
 * Logika bisnis murni: menyusun catatan presensi & agenda mengajar dari sebuah
 * sesi. Dipisah dari React/hook agar mudah diuji dan tidak menumpuk di App.tsx.
 */
import {
  AttendanceRecord,
  AttendanceSession,
  ClassRoom,
  JournalEntry,
  Student,
} from '../types';

const DEFAULT_JAM = '07.15 - 09.15 WIB';

/** Ringkasan kehadiran satu sesi → teks `absensiCatatan` pada jurnal. */
export function buildAttendanceNote(
  classStudents: Student[],
  sessionRecords: AttendanceRecord[]
): string {
  let hadir = 0;
  let sakit = 0;
  let izin = 0;
  let alpa = 0;
  let dispen = 0;
  const keteranganList: string[] = [];

  classStudents.forEach((std) => {
    const rec = sessionRecords.find((r) => r.studentId === std.id);
    if (rec?.status === 'H') hadir++;
    else if (rec?.status === 'S') {
      sakit++;
      keteranganList.push(`${std.nama} (Sakit${rec.keterangan ? ': ' + rec.keterangan : ''})`);
    } else if (rec?.status === 'I') {
      izin++;
      keteranganList.push(`${std.nama} (Izin${rec.keterangan ? ': ' + rec.keterangan : ''})`);
    } else if (rec?.status === 'A') {
      alpa++;
      keteranganList.push(`${std.nama} (Alfa)`);
    } else if (rec?.status === 'D') {
      dispen++;
      keteranganList.push(`${std.nama} (Dispen)`);
    }
  });

  const totalFilled = hadir + sakit + izin + alpa + dispen;
  if (totalFilled === 0) {
    return 'Presensi pertemuan baru dibuka (absen kosong, siap diisi).';
  }
  if (sakit === 0 && izin === 0 && alpa === 0 && dispen === 0) {
    return `Hadir lengkap 100% (${hadir}/${classStudents.length} siswa).`;
  }
  return `H: ${hadir}, S: ${sakit}, I: ${izin}, A: ${alpa}, D: ${dispen}. ${
    keteranganList.length > 0 ? 'Catatan: ' + keteranganList.join('; ') : ''
  }`;
}

export function combineMateriKegiatan(materi?: string, kegiatan?: string): string {
  const m = (materi || '').trim();
  const k = (kegiatan || '').trim();
  if (m && k) return `${m} — ${k}`;
  return m || k;
}

/** Cari agenda yang sudah ada untuk (kelas, pertemuan ke-N). */
export function findJournalForSession(
  journals: JournalEntry[],
  session: AttendanceSession
): JournalEntry | undefined {
  const target = Number(session.pertemuanKe) || 1;
  return journals.find((j) => j.classId === session.classId && Number(j.pertemuanKe) === target);
}

/** Perbarui agenda yang sudah ada dengan data sesi terbaru. */
export function mergeSessionIntoJournal(
  existing: JournalEntry,
  session: AttendanceSession,
  absensiCatatan: string
): JournalEntry {
  return {
    ...existing,
    tanggal: session.tanggal,
    mapel: session.mapel,
    jamPelajaran: session.jamPelajaran || existing.jamPelajaran || DEFAULT_JAM,
    materiKegiatan: combineMateriKegiatan(session.materi, session.kegiatan) || existing.materiKegiatan,
    materi: session.materi || existing.materi,
    kegiatan: session.kegiatan || existing.kegiatan,
    absensiCatatan,
  };
}

/** Buat agenda baru dari sebuah sesi. */
export function createJournalFromSession(
  id: string,
  session: AttendanceSession,
  cls: ClassRoom | undefined,
  teacherName: string,
  absensiCatatan: string
): JournalEntry {
  const pertemuanKe = Number(session.pertemuanKe) || 1;
  return {
    id,
    tanggal: session.tanggal,
    pendidik: teacherName,
    mapel: session.mapel,
    classId: session.classId,
    className: cls?.nama || 'Kelas',
    pertemuanKe,
    jamPelajaran: session.jamPelajaran || DEFAULT_JAM,
    materiKegiatan:
      combineMateriKegiatan(session.materi, session.kegiatan) ||
      session.catatan ||
      `Pembelajaran Tatap Muka & Praktikum Pertemuan Ke-${session.pertemuanKe}`,
    materi: session.materi,
    kegiatan: session.kegiatan,
    absensiCatatan,
    semester: cls ? `${cls.tahunAjaran} (${cls.semester})` : 'Ganjil',
  };
}

/** Deskripsi rapor otomatis berdasarkan rata-rata formatif & KKM. */
export function buildGradeDescription(
  studentName: string,
  formatif: (number | null)[],
  kkm: number
): string {
  const valid = (formatif || []).filter((v): v is number => v !== null && !isNaN(v));
  const avg = valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : 75;
  if (avg >= 88) {
    return `${studentName} menunjukkan penguasaan SANGAT BAIK pada seluruh capaian TP 1-5 dan memiliki kemandirian praktik yang tinggi.`;
  }
  if (avg >= kkm) {
    return `${studentName} menunjukkan pencapaian yang BAIK dalam ketercapaian tujuan pembelajaran, perlu penguatan ketelitian pada evaluasi akhir.`;
  }
  return `${studentName} perlu bimbingan dan pendampingan intensif (remedial) dalam memahami konsep dasar dan keselamatan kerja bengkel.`;
}
