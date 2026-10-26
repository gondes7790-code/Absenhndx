import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ActiveTab,
  AttendanceRecord,
  AttendanceSession,
  AttendanceStatus,
  NewSessionInput,
} from '../types';
import { downloadJsonBackup } from '../services/supabaseService';
import { useToast } from '../contexts/ToastContext';
import { useDataSource } from './useDataSource';
import { upsertRecordInList } from './useAttendance';
import { useJournalSync } from './useJournals';
import { newId } from './mutationUtils';
import type { Workspace } from './useWorkspace';

interface ActionsOptions {
  workspace: Workspace;
  teacherName: string;
  schoolName: string;
  onNavigate: (tab: ActiveTab) => void;
}

/**
 * Alur yang melibatkan lebih dari satu domain (presensi ↔ jurnal, backup,
 * sinkronisasi). Operasi CRUD satu domain tetap ada di hook domainnya.
 */
export function useWorkspaceActions({ workspace, teacherName, schoolName, onNavigate }: ActionsOptions) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { repo, isDemo } = useDataSource();
  const {
    classes,
    activeClass,
    activeSession,
    selectSession,
    studentsApi,
    sessionsApi,
    recordsApi,
    gradesApi,
  } = workspace;
  const { students } = studentsApi;
  const { sessions } = sessionsApi;
  const { sessionRecords, saveRecord } = recordsApi;

  const { syncSession, syncAllClasses } = useJournalSync(teacherName, classes);

  /* ---------------- Presensi ---------------- */

  // Ref ke state terbaru: `updateAttendanceRecord` tetap stabil sehingga baris tabel (React.memo)
  // tidak ikut render ulang setiap ada perubahan presensi pada murid lain.
  const latest = useRef({ activeClass, activeSession, sessionRecords, students });
  useEffect(() => {
    latest.current = { activeClass, activeSession, sessionRecords, students };
  });

  const updateAttendanceRecord = useCallback(
    (studentId: string, status: AttendanceStatus, keterangan = '') => {
      const { activeClass: cls, activeSession: session, sessionRecords: records, students: list } =
        latest.current;
      if (!cls || !session) return;
      const existing = records.find((r) => r.studentId === studentId);
      const record: AttendanceRecord = {
        id: existing?.id ?? newId(),
        sessionId: session.id,
        studentId,
        status,
        keterangan,
        updatedAt: new Date().toISOString(),
      };
      void saveRecord(cls.id, record);
      void syncSession({
        session,
        records: upsertRecordInList(records, record),
        students: list,
      });
      // Ketukan berikutnya (sebelum render ulang) harus melihat catatan ini.
      latest.current = {
        ...latest.current,
        sessionRecords: upsertRecordInList(records, record),
      };
    },
    [saveRecord, syncSession]
  );

  const setAllHadir = useCallback(
    async (targetSession?: AttendanceSession) => {
      if (!activeClass) {
        showToast('Pilih Rombel Terlebih Dahulu', 'Silakan buat atau pilih kelas aktif terlebih dahulu.');
        return;
      }
      const session = targetSession || activeSession;
      if (!session) {
        showToast(
          'Belum Ada Sesi Pertemuan',
          'Buat sesi presensi terlebih dahulu dengan menekan tombol "+ Buat Absen Baru".'
        );
        return;
      }
      if (students.length === 0) {
        showToast(
          'Kelas Masih Kosong',
          'Belum ada data murid di kelas ini. Silakan tambahkan murid terlebih dahulu di tab "Data Murid".'
        );
        return;
      }

      const current =
        session.id === activeSession?.id
          ? sessionRecords
          : await recordsApi.loadSessionRecords(session.id);
      const studentIds = new Set(students.map((st) => st.id));
      const now = new Date().toISOString();

      const allHadir: AttendanceRecord[] = students.map((std) => {
        const existing = current.find((r) => r.studentId === std.id);
        return {
          id: existing?.id || newId(),
          sessionId: session.id,
          studentId: std.id,
          status: 'H',
          keterangan: existing?.status === 'H' ? existing.keterangan || '' : '',
          updatedAt: now,
        };
      });
      const merged = [...current.filter((r) => !studentIds.has(r.studentId)), ...allHadir];

      void recordsApi.saveRecordsBatch(activeClass.id, session.id, allHadir);
      void syncSession({ session, records: merged, students });

      showToast(
        'Semua Murid Hadir (100%)',
        `Presensi pertemuan Ke-${session.pertemuanKe} (${students.length} siswa) berhasil diset 100% Hadir & disinkronkan ke Agenda Mengajar.`
      );
    },
    [activeClass, activeSession, students, sessionRecords, recordsApi, syncSession, showToast]
  );

  const createNewSession = useCallback(
    async (custom?: NewSessionInput) => {
      if (!activeClass) {
        showToast(
          'Pilih Rombel Terlebih Dahulu',
          'Silakan pilih atau buat rombel kelas sebelum membuat sesi presensi.'
        );
        return;
      }
      const nextNumber =
        custom?.pertemuanKe || sessions.reduce((max, s) => Math.max(max, s.pertemuanKe), 0) + 1;
      const tanggal = custom?.tanggal || new Date().toISOString().split('T')[0];
      const materi = custom?.materi || '';
      const kegiatan = custom?.kegiatan || '';

      const draft: AttendanceSession = {
        id: newId(),
        classId: activeClass.id,
        pertemuanKe: nextNumber,
        tanggal,
        mapel: custom?.mapel || activeClass.mapel,
        materi,
        kegiatan,
        jamPelajaran: custom?.jamPelajaran || '07:15 - 09:15 WIB',
        catatan:
          custom?.catatan ||
          (materi
            ? `${materi} — ${kegiatan}`
            : `Pertemuan Ke-${nextNumber} - Pembelajaran Tatap Muka & Praktikum`),
        createdAt: new Date().toISOString(),
      };

      const created = await sessionsApi.createSession(draft);
      if (!created) return;
      selectSession(created);

      const now = new Date().toISOString();
      const initialRecords: AttendanceRecord[] = custom?.setAllHadir
        ? students.map((std) => ({
            id: newId(),
            sessionId: created.id,
            studentId: std.id,
            status: 'H' as const,
            keterangan: '',
            updatedAt: now,
          }))
        : [];

      // Sesi baru: isi cache sesi langsung agar tidak perlu fetch.
      recordsApi.seedSessionRecords(created.id, initialRecords);
      if (initialRecords.length > 0) {
        void recordsApi.saveRecordsBatch(activeClass.id, created.id, initialRecords);
      }
      void syncSession({ session: created, records: initialRecords, students });

      showToast(
        'Sesi Absen Baru & Agenda Mengajar Terbentuk',
        `Pertemuan Ke-${nextNumber} (${tanggal}) ${
          materi ? 'materi "' + materi + '"' : ''
        } otomatis tersinkronisasi ke Agenda Mengajar.`
      );
    },
    [activeClass, sessions, students, sessionsApi, recordsApi, syncSession, selectSession, showToast]
  );

  const updateSession = useCallback(
    async (updated: AttendanceSession) => {
      const saved = await sessionsApi.updateSession(updated);
      if (!saved) return;
      const records =
        saved.id === activeSession?.id
          ? sessionRecords
          : await recordsApi.loadSessionRecords(saved.id);
      void syncSession({ session: saved, records, students });
      showToast(
        'Sesi Absen & Agenda Diperbarui',
        `Data Pertemuan Ke-${saved.pertemuanKe} (${saved.tanggal}) berhasil disimpan dan disinkronkan ke Agenda Mengajar.`
      );
    },
    [sessionsApi, activeSession?.id, sessionRecords, recordsApi, syncSession, students, showToast]
  );

  const deleteSession = useCallback(
    async (sessionId: string) => {
      if (sessions.length <= 1) {
        showToast('Perhatian', 'Minimal harus tersisa 1 sesi pertemuan pada rombel ini.');
        return;
      }
      const target = sessions.find((s) => s.id === sessionId);
      if (!target) return;
      const ok = await sessionsApi.deleteSession(target);
      if (!ok) return;
      // Sesi aktif otomatis jatuh ke sesi pertama yang tersisa (diturunkan di useWorkspace).
      showToast('Sesi Absen Dihapus', `Pertemuan Ke-${target.pertemuanKe} telah dihapus dari sistem.`);
    },
    [sessions, sessionsApi, showToast]
  );

  /* ---------------- Nilai ---------------- */

  const generateAllDescriptions = useCallback(
    () => gradesApi.generateAllDescriptions(students),
    [gradesApi, students]
  );

  const applyRiskDescriptions = useCallback(
    async (descriptions: Map<string, string>) => {
      const ok = await gradesApi.applyDescriptions(descriptions);
      if (ok) onNavigate('penilaian');
    },
    [gradesApi, onNavigate]
  );

  /* ---------------- Jurnal ---------------- */

  const syncAllAttendanceToJournals = useCallback(async () => {
    await syncAllClasses();
    showToast(
      'Agenda Mengajar Tersinkronisasi',
      'Seluruh data kehadiran murid berhasil diperbarui ke buku jurnal agenda.'
    );
    // Daftar jurnal bisa berubah di server; pastikan tampilan sama dengan sumber data.
    await queryClient.invalidateQueries({ queryKey: ['journals'] });
  }, [syncAllClasses, showToast, queryClient]);

  /* ---------------- Backup & sinkronisasi ---------------- */

  const downloadBackup = useCallback(async () => {
    if (!repo) return;
    try {
      // Satu-satunya jalur yang memuat seluruh kelas — hanya saat backup diminta.
      const snapshot = await repo.snapshot();
      downloadJsonBackup({
        exportDate: new Date().toISOString(),
        developer: '@hndx07',
        school: schoolName,
        ...snapshot,
      });
      showToast('Backup JSON Berhasil Diunduh', 'Seluruh database berhasil diekspor secara aman.');
    } catch (err) {
      showToast(
        'Gagal Membuat Backup',
        err instanceof Error && err.message ? err.message : 'Tidak dapat memuat data untuk backup.'
      );
    }
  }, [repo, schoolName, showToast]);

  const refreshData = useCallback(async () => {
    if (isDemo || !repo) {
      showToast('Mode Uji Coba Demo', 'Aplikasi saat ini berjalan dalam mode lokal & offline.');
      return;
    }
    showToast('Menyinkronkan...', 'Memuat data terbaru dari Supabase PostgreSQL Cloud.');
    await queryClient.invalidateQueries();
    showToast('Data Telah Disinkronkan', 'Data berhasil diperbarui dari Supabase Cloud.');
  }, [isDemo, repo, queryClient, showToast]);

  return {
    updateAttendanceRecord,
    setAllHadir,
    createNewSession,
    updateSession,
    deleteSession,
    generateAllDescriptions,
    applyRiskDescriptions,
    syncAllAttendanceToJournals,
    downloadBackup,
    refreshData,
  };
}
