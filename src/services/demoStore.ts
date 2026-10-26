/**
 * Penyimpanan Mode Demo (localStorage).
 *
 * Modul ini satu-satunya tempat yang menyentuh localStorage untuk data demo,
 * sehingga mode Demo tetap terisolasi dari jalur Supabase. Kunci dan bentuk
 * data SAMA dengan versi sebelumnya (`hndx_merdeka_app_v2_demo_*`), jadi data
 * demo yang sudah tersimpan tetap terbaca.
 */
import {
  AttendanceRecord,
  AttendanceSession,
  ClassRoom,
  FinanceTransaction,
  GradeRecord,
  JournalEntry,
  Student,
  TeacherProfile,
} from '../types';
import {
  initialAttendanceRecords,
  initialClasses,
  initialFinances,
  initialGrades,
  initialJournals,
  initialSessions,
  initialStudents,
  initialTeacher,
} from '../data/initialData';

export const STORAGE_KEY_PREFIX = 'hndx_merdeka_app_v2';
const DEMO_PREFIX = `${STORAGE_KEY_PREFIX}_demo`;

export interface DemoCollections {
  classes: ClassRoom[];
  students: Student[];
  sessions: AttendanceSession[];
  attendance: AttendanceRecord[];
  grades: GradeRecord[];
  journals: JournalEntry[];
  finances: FinanceTransaction[];
}

export type DemoCollectionName = keyof DemoCollections;

const COLLECTION_FALLBACKS: DemoCollections = {
  classes: initialClasses,
  students: initialStudents,
  sessions: initialSessions,
  attendance: initialAttendanceRecords,
  grades: initialGrades,
  journals: initialJournals,
  finances: initialFinances,
};

const keyOf = (name: DemoCollectionName | 'teacher') => `${DEMO_PREFIX}_${name}`;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('[demoStore] Gagal menyimpan ke localStorage', e);
  }
}

export function readCollection<K extends DemoCollectionName>(name: K): DemoCollections[K] {
  return readJson<DemoCollections[K]>(keyOf(name), COLLECTION_FALLBACKS[name]);
}

export function writeCollection<K extends DemoCollectionName>(
  name: K,
  value: DemoCollections[K]
): void {
  writeJson(keyOf(name), value);
}

/** Ubah satu koleksi secara atomik: baca → transformasi → simpan → kembalikan hasil. */
export function updateCollection<K extends DemoCollectionName>(
  name: K,
  updater: (current: DemoCollections[K]) => DemoCollections[K]
): DemoCollections[K] {
  const next = updater(readCollection(name));
  writeCollection(name, next);
  return next;
}

export function readTeacher(): TeacherProfile {
  return readJson<TeacherProfile>(keyOf('teacher'), initialTeacher);
}

export function writeTeacher(teacher: TeacherProfile): void {
  writeJson(keyOf('teacher'), teacher);
}

/**
 * Isi ulang seluruh data demo dengan data contoh. Dipanggil saat tombol
 * "Coba Mode Demo" ditekan — perilaku sama seperti sebelumnya (data contoh segar).
 */
export function seedDemoData(): void {
  (Object.keys(COLLECTION_FALLBACKS) as DemoCollectionName[]).forEach((name) => {
    writeJson(keyOf(name), COLLECTION_FALLBACKS[name]);
  });
  writeTeacher(initialTeacher);
}

/** Salinan seluruh data demo (untuk backup JSON). */
export function readDemoSnapshot(): DemoCollections {
  return {
    classes: readCollection('classes'),
    students: readCollection('students'),
    sessions: readCollection('sessions'),
    attendance: readCollection('attendance'),
    grades: readCollection('grades'),
    journals: readCollection('journals'),
    finances: readCollection('finances'),
  };
}

/** Bersihkan kunci localStorage lama per-pengguna (`..._u_<userId>_*`) yang sudah tidak dipakai. */
export function cleanupLegacyUserStorage(userId: string): void {
  try {
    const prefix = `${STORAGE_KEY_PREFIX}_u_${userId}_`;
    Object.keys(localStorage)
      .filter((key) => key.startsWith(prefix))
      .forEach((key) => localStorage.removeItem(key));
  } catch (e) {
    console.warn('[demoStore] Legacy storage cleanup issue', e);
  }
}
