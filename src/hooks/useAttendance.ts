import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AttendanceRecord, AttendanceSession, ClassRoom } from '../types';
import { queryKeys } from '../lib/queryKeys';
import { useToast } from '../contexts/ToastContext';
import { useDataSource } from './useDataSource';
import { errorMessage, settle } from './mutationUtils';

const EMPTY_SESSIONS: AttendanceSession[] = [];
const EMPTY_RECORDS: AttendanceRecord[] = [];

/** Sisipkan/ganti catatan berdasarkan pasangan (sesi, murid). */
export function upsertRecordInList(
  list: AttendanceRecord[],
  rec: AttendanceRecord
): AttendanceRecord[] {
  const idx = list.findIndex((r) => r.sessionId === rec.sessionId && r.studentId === rec.studentId);
  if (idx < 0) return [...list, rec];
  const next = [...list];
  next[idx] = rec;
  return next;
}

/* ------------------------------------------------------------------ */
/* Sesi pertemuan (per kelas)                                          */
/* ------------------------------------------------------------------ */

export function useAttendanceSessions(activeClass: ClassRoom | null, enabled = true) {
  const { scope, repo } = useDataSource();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const s = scope ?? 'anon';
  const classId = activeClass?.id ?? '';

  const query = useQuery<AttendanceSession[]>({
    queryKey: queryKeys.sessions(s, classId),
    queryFn: () => repo!.sessions.listByClass(classId),
    enabled: Boolean(scope && repo && classId && enabled),
    meta: { label: 'sesi presensi' },
  });

  const createMutation = useMutation({
    mutationFn: (session: AttendanceSession) => repo!.sessions.create(session),
    onSuccess: (created) => {
      queryClient.setQueryData<AttendanceSession[]>(
        queryKeys.sessions(s, created.classId),
        (prev) => [created, ...(prev ?? [])]
      );
      // Rekap gabungan kelas perlu memuat ulang daftar sesinya.
      queryClient.invalidateQueries({ queryKey: queryKeys.classRecords(s, created.classId) });
    },
    onError: (err) =>
      showToast('Gagal Membuat Sesi', errorMessage(err, 'Tidak dapat menyimpan sesi presensi ke Supabase.')),
  });

  const updateMutation = useMutation({
    mutationFn: (session: AttendanceSession) => repo!.sessions.update(session),
    onSuccess: (updated) => {
      queryClient.setQueryData<AttendanceSession[]>(
        queryKeys.sessions(s, updated.classId),
        (prev) => (prev ?? []).map((x) => (x.id === updated.id ? updated : x))
      );
    },
    onError: (err) =>
      showToast('Gagal Memperbarui Sesi', errorMessage(err, 'Tidak dapat memperbarui sesi presensi di Supabase.')),
  });

  const deleteMutation = useMutation({
    mutationFn: async (session: AttendanceSession) => {
      await repo!.sessions.remove(session.id);
      return session;
    },
    onSuccess: (session) => {
      queryClient.setQueryData<AttendanceSession[]>(
        queryKeys.sessions(s, session.classId),
        (prev) => (prev ?? []).filter((x) => x.id !== session.id)
      );
      queryClient.removeQueries({ queryKey: queryKeys.sessionRecords(s, session.id) });
      queryClient.setQueryData<AttendanceRecord[]>(
        queryKeys.classRecords(s, session.classId),
        (old) => (old ? old.filter((r) => r.sessionId !== session.id) : old)
      );
    },
    onError: (err) =>
      showToast('Gagal Menghapus Sesi', errorMessage(err, 'Tidak dapat menghapus sesi pertemuan dari Supabase.')),
  });

  return {
    sessions: query.data ?? EMPTY_SESSIONS,
    isLoading: query.isLoading,
    createSession: useCallback(
      (session: AttendanceSession) => settle(createMutation.mutateAsync(session)),
      [createMutation.mutateAsync]
    ),
    updateSession: useCallback(
      (session: AttendanceSession) => settle(updateMutation.mutateAsync(session)),
      [updateMutation.mutateAsync]
    ),
    deleteSession: useCallback(
      (session: AttendanceSession) => settle(deleteMutation.mutateAsync(session)),
      [deleteMutation.mutateAsync]
    ),
  };
}

/* ------------------------------------------------------------------ */
/* Catatan presensi                                                    */
/* ------------------------------------------------------------------ */

interface UseAttendanceRecordsOptions {
  activeClass: ClassRoom | null;
  /** Sesi yang sedang dibuka di tab Presensi: hanya catatan sesi ini yang di-fetch. */
  activeSessionId: string | null;
  sessionEnabled: boolean;
  /** Catatan seluruh sesi satu kelas (rekap, statistik, risk scoring, cetak, portal wali). */
  classEnabled: boolean;
}

export function useAttendanceRecords({
  activeClass,
  activeSessionId,
  sessionEnabled,
  classEnabled,
}: UseAttendanceRecordsOptions) {
  const { scope, repo } = useDataSource();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const s = scope ?? 'anon';
  const classId = activeClass?.id ?? '';
  const sessionId = activeSessionId ?? '';

  const sessionQuery = useQuery<AttendanceRecord[]>({
    queryKey: queryKeys.sessionRecords(s, sessionId),
    queryFn: () => repo!.records.listBySessions([sessionId]),
    enabled: Boolean(scope && repo && sessionId && sessionEnabled),
    meta: { label: 'data presensi' },
  });

  const classQuery = useQuery<AttendanceRecord[]>({
    queryKey: queryKeys.classRecords(s, classId),
    queryFn: async () => {
      // ID sesi dibaca saat query dijalankan, bukan dari closure render lama.
      const sessions = await queryClient.ensureQueryData({
        queryKey: queryKeys.sessions(s, classId),
        queryFn: () => repo!.sessions.listByClass(classId),
      });
      return repo!.records.listBySessions(sessions.map((x) => x.id));
    },
    enabled: Boolean(scope && repo && classId && classEnabled),
    meta: { label: 'rekap presensi' },
  });

  /** Terapkan perubahan ke cache sesi & cache kelas (bila sedang dimuat) agar tetap konsisten. */
  const patchCaches = useCallback(
    (targetClassId: string, targetSessionId: string, fn: (list: AttendanceRecord[]) => AttendanceRecord[]) => {
      queryClient.setQueryData<AttendanceRecord[]>(
        queryKeys.sessionRecords(s, targetSessionId),
        (old) => (old ? fn(old) : old)
      );
      queryClient.setQueryData<AttendanceRecord[]>(
        queryKeys.classRecords(s, targetClassId),
        (old) => (old ? fn(old) : old)
      );
    },
    [queryClient, s]
  );

  const invalidateRecords = useCallback(
    (targetClassId: string, targetSessionId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessionRecords(s, targetSessionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.classRecords(s, targetClassId) });
    },
    [queryClient, s]
  );

  // Ketukan status presensi: optimistic. Bila gagal, cache dimuat ulang dari sumber data.
  const saveMutation = useMutation({
    mutationFn: (input: { classId: string; record: AttendanceRecord }) =>
      repo!.records.upsert(input.record),
    onMutate: async ({ classId: cid, record }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.sessionRecords(s, record.sessionId) });
      patchCaches(cid, record.sessionId, (list) => upsertRecordInList(list, record));
    },
    onError: (err, { classId: cid, record }) => {
      invalidateRecords(cid, record.sessionId);
      showToast('Gagal Menyimpan Presensi', errorMessage(err, 'Perubahan presensi tidak tersimpan ke Supabase.'));
    },
  });

  const saveBatchMutation = useMutation({
    mutationFn: (input: { classId: string; sessionId: string; records: AttendanceRecord[] }) =>
      repo!.records.upsertBatch(input.records),
    onMutate: ({ classId: cid, sessionId: sid, records }) => {
      patchCaches(cid, sid, (list) => records.reduce(upsertRecordInList, list));
    },
    onError: (err, { classId: cid, sessionId: sid }) => {
      invalidateRecords(cid, sid);
      showToast('Gagal Menyimpan Presensi', errorMessage(err, 'Presensi massal tidak tersimpan ke Supabase.'));
    },
  });

  const saveRecord = useCallback(
    (targetClassId: string, record: AttendanceRecord) =>
      settle(saveMutation.mutateAsync({ classId: targetClassId, record })),
    [saveMutation.mutateAsync]
  );

  const saveRecordsBatch = useCallback(
    (targetClassId: string, targetSessionId: string, records: AttendanceRecord[]) =>
      settle(
        saveBatchMutation.mutateAsync({ classId: targetClassId, sessionId: targetSessionId, records })
      ),
    [saveBatchMutation.mutateAsync]
  );

  /** Sesi baru: isi cache sesi langsung (mis. "semua hadir") tanpa fetch tambahan. */
  const seedSessionRecords = useCallback(
    (targetSessionId: string, records: AttendanceRecord[]) => {
      queryClient.setQueryData<AttendanceRecord[]>(
        queryKeys.sessionRecords(s, targetSessionId),
        records
      );
    },
    [queryClient, s]
  );

  /** Catatan sebuah sesi dari cache; di-fetch bila belum ada (mis. sesi selain yang sedang dibuka). */
  const loadSessionRecords = useCallback(
    (targetSessionId: string) =>
      queryClient.ensureQueryData({
        queryKey: queryKeys.sessionRecords(s, targetSessionId),
        queryFn: () => repo!.records.listBySessions([targetSessionId]),
      }),
    [queryClient, s, repo]
  );

  return {
    sessionRecords: sessionQuery.data ?? EMPTY_RECORDS,
    classRecords: classQuery.data ?? EMPTY_RECORDS,
    isSessionLoading: sessionQuery.isLoading,
    isClassLoading: classQuery.isLoading,
    saveRecord,
    saveRecordsBatch,
    seedSessionRecords,
    loadSessionRecords,
  };
}
