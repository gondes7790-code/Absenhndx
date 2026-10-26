/**
 * Repository: satu antarmuka data untuk dua sumber yang terisolasi.
 *
 *  - Mode Supabase → membungkus service yang sudah ada di `src/services/*`.
 *  - Mode Demo     → membaca/menulis localStorage lewat `demoStore`.
 *
 * Hook (TanStack Query) hanya bicara ke `Repository`, tidak peduli sumbernya.
 * Semua method melempar `Error` bila gagal agar `useMutation`/`useQuery`
 * dapat menangani error secara seragam (toast + rollback).
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
import { fetchProfile, updateProfile } from './profileService';
import { fetchClasses, createClass, updateClass, deleteClass } from './classService';
import {
  fetchStudents,
  createStudent,
  createStudentsBatch,
  countStudents,
  updateStudent,
  updateStudentsBatch,
  deleteStudent,
} from './studentService';
import {
  fetchAttendanceSessions,
  createAttendanceSession,
  updateAttendanceSession,
  deleteAttendanceSession,
  fetchAttendanceRecords,
  upsertAttendanceRecord,
  upsertAttendanceRecordsBatch,
} from './attendanceService';
import { fetchGrades, upsertGrade } from './gradeService';
import { fetchJournals, createJournal, updateJournal, deleteJournal } from './journalService';
import { fetchFinances, createFinance, deleteFinance } from './financeService';
import * as demo from './demoStore';

export interface FullSnapshot {
  classes: ClassRoom[];
  students: Student[];
  sessions: AttendanceSession[];
  attendanceRecords: AttendanceRecord[];
  grades: GradeRecord[];
  journals: JournalEntry[];
  finances: FinanceTransaction[];
}

export interface Repository {
  profile: {
    get(): Promise<TeacherProfile | null>;
    update(profile: TeacherProfile): Promise<TeacherProfile>;
  };
  classes: {
    list(): Promise<ClassRoom[]>;
    create(cls: ClassRoom): Promise<ClassRoom>;
    update(cls: ClassRoom): Promise<ClassRoom>;
    remove(classId: string): Promise<void>;
  };
  students: {
    listByClass(classId: string): Promise<Student[]>;
    countAll(): Promise<number>;
    create(student: Student): Promise<Student>;
    createBatch(students: Student[]): Promise<Student[]>;
    update(student: Student): Promise<Student>;
    updateBatch(students: Student[]): Promise<void>;
    remove(studentId: string): Promise<void>;
    removeMany(studentIds: string[]): Promise<void>;
  };
  sessions: {
    listByClass(classId: string): Promise<AttendanceSession[]>;
    create(session: AttendanceSession): Promise<AttendanceSession>;
    update(session: AttendanceSession): Promise<AttendanceSession>;
    remove(sessionId: string): Promise<void>;
  };
  records: {
    listBySessions(sessionIds: string[]): Promise<AttendanceRecord[]>;
    upsert(record: AttendanceRecord): Promise<AttendanceRecord>;
    upsertBatch(records: AttendanceRecord[]): Promise<void>;
  };
  grades: {
    listByClass(classId: string): Promise<GradeRecord[]>;
    upsert(grade: GradeRecord): Promise<GradeRecord>;
    upsertMany(grades: GradeRecord[]): Promise<void>;
  };
  journals: {
    list(): Promise<JournalEntry[]>;
    create(entry: JournalEntry): Promise<JournalEntry>;
    update(entry: JournalEntry): Promise<JournalEntry>;
    remove(id: string): Promise<void>;
  };
  finances: {
    listByClass(classId: string): Promise<FinanceTransaction[]>;
    create(tx: FinanceTransaction): Promise<FinanceTransaction>;
    remove(id: string): Promise<void>;
  };
  /** Seluruh data (dipakai untuk backup JSON; satu-satunya jalur yang memuat semua kelas). */
  snapshot(): Promise<FullSnapshot>;
}

function ensure<T>(value: T | null | undefined, message: string): T {
  if (value === null || value === undefined) throw new Error(message);
  return value;
}

function ensureOk(ok: boolean, message: string): void {
  if (!ok) throw new Error(message);
}

/* ------------------------------------------------------------------ */
/* Supabase                                                            */
/* ------------------------------------------------------------------ */

function createSupabaseRepository(userId: string): Repository {
  return {
    profile: {
      get: () => fetchProfile(userId),
      update: async (profile) => {
        ensureOk(await updateProfile(userId, profile), 'Gagal menyimpan profil.');
        return profile;
      },
    },
    classes: {
      list: () => fetchClasses(userId),
      create: async (cls) => ensure(await createClass(userId, cls), 'Gagal menyimpan kelas.'),
      update: async (cls) => {
        ensureOk(await updateClass(cls), 'Gagal memperbarui kelas.');
        return cls;
      },
      remove: async (classId) => {
        ensureOk(await deleteClass(classId), 'Gagal menghapus kelas.');
      },
    },
    students: {
      listByClass: (classId) => fetchStudents(userId, classId),
      countAll: () => countStudents(userId),
      create: async (student) =>
        ensure(await createStudent(userId, student), 'Gagal menyimpan murid.'),
      createBatch: async (students) => {
        const created = await createStudentsBatch(userId, students);
        if (created.length === 0) throw new Error('Gagal menyimpan batch murid.');
        return created;
      },
      update: async (student) => {
        ensureOk(await updateStudent(student), 'Gagal memperbarui murid.');
        return student;
      },
      updateBatch: async (students) => {
        ensureOk(await updateStudentsBatch(students, userId), 'Gagal memperbarui nomor absen.');
      },
      remove: async (studentId) => {
        ensureOk(await deleteStudent(studentId), 'Gagal menghapus murid.');
      },
      removeMany: async (studentIds) => {
        const results = await Promise.all(studentIds.map((id) => deleteStudent(id)));
        ensureOk(results.every(Boolean), 'Sebagian murid lama gagal dihapus.');
      },
    },
    sessions: {
      listByClass: (classId) => fetchAttendanceSessions(userId, classId),
      create: async (session) =>
        ensure(await createAttendanceSession(userId, session), 'Gagal menyimpan sesi presensi.'),
      update: async (session) => {
        ensureOk(await updateAttendanceSession(session), 'Gagal memperbarui sesi presensi.');
        return session;
      },
      remove: async (sessionId) => {
        ensureOk(await deleteAttendanceSession(sessionId), 'Gagal menghapus sesi presensi.');
      },
    },
    records: {
      listBySessions: (sessionIds) => fetchAttendanceRecords(sessionIds),
      upsert: async (record) =>
        ensure(await upsertAttendanceRecord(record), 'Gagal menyimpan presensi.'),
      upsertBatch: async (records) => {
        if (await upsertAttendanceRecordsBatch(records)) return;
        // Fallback: simpan satu per satu bila upsert batch ditolak (mis. constraint berbeda).
        const results = await Promise.all(records.map((rec) => upsertAttendanceRecord(rec)));
        ensureOk(results.every(Boolean), 'Gagal menyimpan presensi massal.');
      },
    },
    grades: {
      listByClass: (classId) => fetchGrades(userId, classId),
      upsert: async (grade) => ensure(await upsertGrade(userId, grade), 'Gagal menyimpan nilai.'),
      upsertMany: async (grades) => {
        const results = await Promise.all(grades.map((g) => upsertGrade(userId, g)));
        ensureOk(results.every(Boolean), 'Sebagian nilai gagal disimpan.');
      },
    },
    journals: {
      list: () => fetchJournals(userId),
      create: async (entry) => ensure(await createJournal(userId, entry), 'Gagal menyimpan agenda.'),
      update: async (entry) => {
        ensureOk(await updateJournal(entry), 'Gagal memperbarui agenda.');
        return entry;
      },
      remove: async (id) => {
        ensureOk(await deleteJournal(id), 'Gagal menghapus agenda.');
      },
    },
    finances: {
      listByClass: (classId) => fetchFinances(userId, classId),
      create: async (tx) => ensure(await createFinance(userId, tx), 'Gagal menyimpan transaksi.'),
      remove: async (id) => {
        ensureOk(await deleteFinance(id), 'Gagal menghapus transaksi.');
      },
    },
    snapshot: async () => {
      const [classes, students, sessions, grades, journals, finances] = await Promise.all([
        fetchClasses(userId),
        fetchStudents(userId),
        fetchAttendanceSessions(userId),
        fetchGrades(userId),
        fetchJournals(userId),
        fetchFinances(userId),
      ]);
      const attendanceRecords = await fetchAttendanceRecords(sessions.map((s) => s.id));
      return { classes, students, sessions, attendanceRecords, grades, journals, finances };
    },
  };
}

/* ------------------------------------------------------------------ */
/* Demo (localStorage)                                                 */
/* ------------------------------------------------------------------ */

function createDemoRepository(): Repository {
  return {
    profile: {
      get: async () => demo.readTeacher(),
      update: async (profile) => {
        demo.writeTeacher(profile);
        return profile;
      },
    },
    classes: {
      list: async () => demo.readCollection('classes'),
      create: async (cls) => {
        demo.updateCollection('classes', (list) => [...list, cls]);
        return cls;
      },
      update: async (cls) => {
        demo.updateCollection('classes', (list) => list.map((c) => (c.id === cls.id ? cls : c)));
        return cls;
      },
      remove: async (classId) => {
        // Meniru ON DELETE CASCADE di database.
        const sessionIds = new Set(
          demo.readCollection('sessions').filter((s) => s.classId === classId).map((s) => s.id)
        );
        const studentIds = new Set(
          demo.readCollection('students').filter((s) => s.classId === classId).map((s) => s.id)
        );
        demo.updateCollection('classes', (list) => list.filter((c) => c.id !== classId));
        demo.updateCollection('students', (list) => list.filter((s) => s.classId !== classId));
        demo.updateCollection('sessions', (list) => list.filter((s) => s.classId !== classId));
        demo.updateCollection('attendance', (list) =>
          list.filter((r) => !sessionIds.has(r.sessionId) && !studentIds.has(r.studentId))
        );
        demo.updateCollection('grades', (list) => list.filter((g) => g.classId !== classId));
        demo.updateCollection('journals', (list) => list.filter((j) => j.classId !== classId));
        demo.updateCollection('finances', (list) => list.filter((t) => t.classId !== classId));
      },
    },
    students: {
      listByClass: async (classId) =>
        demo.readCollection('students').filter((s) => s.classId === classId),
      countAll: async () => demo.readCollection('students').length,
      create: async (student) => {
        demo.updateCollection('students', (list) => [...list, student]);
        return student;
      },
      createBatch: async (students) => {
        demo.updateCollection('students', (list) => [...list, ...students]);
        return students;
      },
      update: async (student) => {
        demo.updateCollection('students', (list) =>
          list.map((s) => (s.id === student.id ? student : s))
        );
        return student;
      },
      updateBatch: async (students) => {
        const byId = new Map(students.map((s) => [s.id, s]));
        demo.updateCollection('students', (list) => list.map((s) => byId.get(s.id) ?? s));
      },
      remove: async (studentId) => {
        demo.updateCollection('students', (list) => list.filter((s) => s.id !== studentId));
        demo.updateCollection('attendance', (list) => list.filter((r) => r.studentId !== studentId));
        demo.updateCollection('grades', (list) => list.filter((g) => g.studentId !== studentId));
      },
      removeMany: async (studentIds) => {
        const ids = new Set(studentIds);
        demo.updateCollection('students', (list) => list.filter((s) => !ids.has(s.id)));
        demo.updateCollection('attendance', (list) => list.filter((r) => !ids.has(r.studentId)));
        demo.updateCollection('grades', (list) => list.filter((g) => !ids.has(g.studentId)));
      },
    },
    sessions: {
      listByClass: async (classId) =>
        demo.readCollection('sessions').filter((s) => s.classId === classId),
      create: async (session) => {
        demo.updateCollection('sessions', (list) => [session, ...list]);
        return session;
      },
      update: async (session) => {
        demo.updateCollection('sessions', (list) =>
          list.map((s) => (s.id === session.id ? session : s))
        );
        return session;
      },
      remove: async (sessionId) => {
        demo.updateCollection('sessions', (list) => list.filter((s) => s.id !== sessionId));
        demo.updateCollection('attendance', (list) => list.filter((r) => r.sessionId !== sessionId));
      },
    },
    records: {
      listBySessions: async (sessionIds) => {
        const ids = new Set(sessionIds);
        return demo.readCollection('attendance').filter((r) => ids.has(r.sessionId));
      },
      upsert: async (record) => {
        demo.updateCollection('attendance', (list) => upsertRecords(list, [record]));
        return record;
      },
      upsertBatch: async (records) => {
        demo.updateCollection('attendance', (list) => upsertRecords(list, records));
      },
    },
    grades: {
      listByClass: async (classId) =>
        demo.readCollection('grades').filter((g) => g.classId === classId),
      upsert: async (grade) => {
        demo.updateCollection('grades', (list) => upsertGrades(list, [grade]));
        return grade;
      },
      upsertMany: async (grades) => {
        demo.updateCollection('grades', (list) => upsertGrades(list, grades));
      },
    },
    journals: {
      list: async () => demo.readCollection('journals'),
      create: async (entry) => {
        demo.updateCollection('journals', (list) => [entry, ...list]);
        return entry;
      },
      update: async (entry) => {
        demo.updateCollection('journals', (list) => list.map((j) => (j.id === entry.id ? entry : j)));
        return entry;
      },
      remove: async (id) => {
        demo.updateCollection('journals', (list) => list.filter((j) => j.id !== id));
      },
    },
    finances: {
      listByClass: async (classId) =>
        demo.readCollection('finances').filter((t) => t.classId === classId),
      create: async (tx) => {
        demo.updateCollection('finances', (list) => [tx, ...list]);
        return tx;
      },
      remove: async (id) => {
        demo.updateCollection('finances', (list) => list.filter((t) => t.id !== id));
      },
    },
    snapshot: async () => {
      const data = demo.readDemoSnapshot();
      return {
        classes: data.classes,
        students: data.students,
        sessions: data.sessions,
        attendanceRecords: data.attendance,
        grades: data.grades,
        journals: data.journals,
        finances: data.finances,
      };
    },
  };
}

function upsertRecords(list: AttendanceRecord[], incoming: AttendanceRecord[]): AttendanceRecord[] {
  const next = [...list];
  incoming.forEach((rec) => {
    const idx = next.findIndex(
      (r) => r.id === rec.id || (r.sessionId === rec.sessionId && r.studentId === rec.studentId)
    );
    if (idx >= 0) next[idx] = rec;
    else next.push(rec);
  });
  return next;
}

function upsertGrades(list: GradeRecord[], incoming: GradeRecord[]): GradeRecord[] {
  const next = [...list];
  incoming.forEach((grade) => {
    const idx = next.findIndex(
      (g) => g.id === grade.id || (g.classId === grade.classId && g.studentId === grade.studentId)
    );
    if (idx >= 0) next[idx] = grade;
    else next.push(grade);
  });
  return next;
}

export interface RepositoryContext {
  isDemo: boolean;
  userId: string | null;
}

/** Pilih sumber data. Mode Demo tidak pernah menyentuh Supabase, dan sebaliknya. */
export function createRepository({ isDemo, userId }: RepositoryContext): Repository | null {
  if (isDemo) return createDemoRepository();
  if (userId) return createSupabaseRepository(userId);
  return null;
}
