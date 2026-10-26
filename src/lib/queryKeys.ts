/**
 * Kunci cache TanStack Query. Selalu diawali nama domain lalu `scope`
 * (userId, atau 'demo'), sehingga data akun/mode berbeda tidak pernah tercampur
 * dan satu domain bisa di-invalidate dengan prefix `[domain, scope]`.
 */
export const queryKeys = {
  profile: (scope: string) => ['profile', scope] as const,
  classes: (scope: string) => ['classes', scope] as const,
  studentCount: (scope: string) => ['studentCount', scope] as const,

  // Lazy per kelas aktif
  students: (scope: string, classId: string) => ['students', scope, classId] as const,
  sessions: (scope: string, classId: string) => ['sessions', scope, classId] as const,
  grades: (scope: string, classId: string) => ['grades', scope, classId] as const,
  finances: (scope: string, classId: string) => ['finances', scope, classId] as const,

  // Presensi: per sesi (tab Presensi) dan gabungan satu kelas (rekap, statistik, cetak)
  sessionRecords: (scope: string, sessionId: string) =>
    ['records', scope, 'session', sessionId] as const,
  classRecords: (scope: string, classId: string) => ['records', scope, 'class', classId] as const,

  // Agenda mengajar lintas kelas (difilter di UI)
  journals: (scope: string) => ['journals', scope] as const,
} as const;

/** Prefix untuk memilih semua cache catatan presensi milik scope. */
export const recordsPrefix = (scope: string) => ['records', scope] as const;
