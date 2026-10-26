import {
  AttendanceRecord,
  AttendanceSession,
  ClassRoom,
  FinanceTransaction,
  GradeRecord,
  JournalEntry,
  Student,
} from '../types';
import { useStudents } from './useStudents';
import { useAttendanceRecords, useAttendanceSessions } from './useAttendance';
import { useGrades } from './useGrades';
import { useFinances } from './useFinances';
import { useJournals } from './useJournals';

export interface PrintDocumentData {
  students: Student[];
  sessions: AttendanceSession[];
  attendanceRecords: AttendanceRecord[];
  grades: GradeRecord[];
  journals: JournalEntry[];
  finances: FinanceTransaction[];
  isLoading: boolean;
}

/**
 * Data lengkap SATU kelas untuk Pusat Cetak (Profil). Hanya di-fetch saat
 * `enabled` (pratinjau dokumen dibuka), bukan saat tab Profil dibuka.
 * Query memakai cache yang sama dengan tab lain sehingga tidak ada fetch ganda.
 */
export function usePrintDocumentData(cls: ClassRoom | null, enabled: boolean): PrintDocumentData {
  const { students, isLoading: studentsLoading } = useStudents(cls, enabled);
  const { sessions, isLoading: sessionsLoading } = useAttendanceSessions(cls, enabled);
  const { classRecords, isClassLoading } = useAttendanceRecords({
    activeClass: cls,
    activeSessionId: null,
    sessionEnabled: false,
    classEnabled: enabled,
  });
  const { grades, isLoading: gradesLoading } = useGrades(cls, enabled);
  const { finances, isLoading: financesLoading } = useFinances(cls, enabled);
  const { journals, isLoading: journalsLoading } = useJournals(enabled);

  return {
    students,
    sessions,
    attendanceRecords: classRecords,
    grades,
    journals,
    finances,
    isLoading:
      studentsLoading ||
      sessionsLoading ||
      isClassLoading ||
      gradesLoading ||
      financesLoading ||
      journalsLoading,
  };
}
