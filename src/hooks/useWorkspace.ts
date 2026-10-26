import { useCallback, useMemo, useState } from 'react';
import { ActiveTab, AttendanceSession, ClassRoom } from '../types';
import { useClasses } from './useClasses';
import { useStudents } from './useStudents';
import { useAttendanceRecords, useAttendanceSessions } from './useAttendance';
import { useGrades } from './useGrades';
import { useFinances } from './useFinances';
import { useJournals } from './useJournals';

/** Jenis data yang bisa dimuat lazy. `profile` dan `classes` selalu dimuat dan tidak termasuk di sini. */
export type DataNeed =
  | 'students'
  | 'sessions'
  | 'sessionRecords'
  | 'classRecords'
  | 'grades'
  | 'finances'
  | 'journals';

/**
 * Peta tab → data yang dibutuhkan. Hanya data di sini yang di-fetch untuk tab aktif
 * (dan hanya untuk kelas aktif), bukan seluruh database saat login.
 */
export const TAB_DATA_NEEDS: Record<ActiveTab, readonly DataNeed[]> = {
  presensi: ['students', 'sessions', 'sessionRecords'],
  rekap: ['students', 'sessions', 'classRecords'],
  penilaian: ['students', 'grades'],
  murid: ['students'],
  jurnal: ['journals'],
  keuangan: ['students', 'finances'],
  statistik: ['students', 'sessions', 'classRecords', 'grades', 'finances'],
  risiko: ['students', 'classRecords', 'grades'],
  // Profil hanya butuh profil + kelas (+ jumlah murid). Pusat Cetak memuat data kelas saat pratinjau dibuka.
  profil: [],
  supabase: [],
};

const PARENT_PORTAL_NEEDS: readonly DataNeed[] = ['students', 'classRecords', 'grades', 'finances'];
const WHATSAPP_NEEDS: readonly DataNeed[] = ['students', 'sessions', 'sessionRecords'];

interface WorkspaceOptions {
  activeTab: ActiveTab;
  parentPortalOpen: boolean;
  whatsAppOpen: boolean;
}

/**
 * Menyatukan pemilihan kelas/sesi aktif dengan data domain yang dimuat lazy.
 * Pemilihan disimpan sebagai ID; objek kelas/sesi aktif diturunkan dari data
 * terbaru sehingga tidak pernah basi setelah edit/hapus.
 */
export function useWorkspace({ activeTab, parentPortalOpen, whatsAppOpen }: WorkspaceOptions) {
  const classesApi = useClasses();
  const { classes } = classesApi;

  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const activeClass: ClassRoom | null = useMemo(
    () => classes.find((c) => c.id === activeClassId) ?? classes[0] ?? null,
    [classes, activeClassId]
  );

  const needs = useMemo(() => {
    const set = new Set<DataNeed>(TAB_DATA_NEEDS[activeTab]);
    if (parentPortalOpen) PARENT_PORTAL_NEEDS.forEach((n) => set.add(n));
    if (whatsAppOpen) WHATSAPP_NEEDS.forEach((n) => set.add(n));
    return set;
  }, [activeTab, parentPortalOpen, whatsAppOpen]);

  const studentsApi = useStudents(activeClass, needs.has('students'));
  const sessionsApi = useAttendanceSessions(activeClass, needs.has('sessions'));
  const { sessions } = sessionsApi;

  const activeSession: AttendanceSession | null = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) ?? sessions[0] ?? null,
    [sessions, activeSessionId]
  );

  const recordsApi = useAttendanceRecords({
    activeClass,
    activeSessionId: activeSession?.id ?? null,
    sessionEnabled: needs.has('sessionRecords'),
    classEnabled: needs.has('classRecords'),
  });
  const gradesApi = useGrades(activeClass, needs.has('grades'));
  const financesApi = useFinances(activeClass, needs.has('finances'));
  const journalsApi = useJournals(needs.has('journals'));

  const selectClass = useCallback((cls: ClassRoom) => {
    setActiveClassId(cls.id);
    setActiveSessionId(null);
  }, []);

  const selectSession = useCallback((session: AttendanceSession) => {
    setActiveSessionId(session.id);
  }, []);

  return {
    // pemilihan
    classes,
    activeClass,
    activeSession,
    selectClass,
    selectSession,
    // domain API (query + mutation)
    classesApi,
    studentsApi,
    sessionsApi,
    recordsApi,
    gradesApi,
    financesApi,
    journalsApi,
    isInitialLoading: classesApi.isLoading,
  };
}

export type Workspace = ReturnType<typeof useWorkspace>;
