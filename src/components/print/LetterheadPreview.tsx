import { useCallback, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AttendanceRecord,
  AttendanceSession,
  ClassRoom,
  JournalEntry,
  Student,
} from '../types';
import { queryKeys } from '../lib/queryKeys';
import { useToast } from '../contexts/ToastContext';
import { useDataSource } from './useDataSource';
import { errorMessage, newId, settle } from './mutationUtils';
import {
  buildAttendanceNote,
  createJournalFromSession,
  findJournalForSession,
  mergeSessionIntoJournal,
} from '../services/journalSync';

const EMPTY_JOURNALS: JournalEntry[] = [];

/** Agenda mengajar (lintas kelas, difilter di UI). Lazy: dimuat saat tab Jurnal/Profil dibuka. */
export function useJournals(enabled = true) {
  const { scope, repo } = useDataSource();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const s = scope ?? 'anon';
  const key = queryKeys.journals(s);

  const query = useQuery<JournalEntry[]>({
    queryKey: key,
    queryFn: () => repo!.journals.list(),
    enabled: Boolean(scope && repo && enabled),
    meta: { label: 'agenda mengajar' },
  });

  const addMutation = useMutation({
    mutationFn: (entry: Omit<JournalEntry, 'id'>) => repo!.journals.create({ ...entry, id: newId() }),
    onSuccess: (created) => {
      queryClient.setQueryData<JournalEntry[]>(key, (prev) => [created, ...(prev ?? [])]);
      showToast(
        'Agenda Mengajar Ditambahkan',
        `Pertemuan Ke-${created.pertemuanKe} kelas ${created.className} tersimpan.`
      );
    },
    onError: (err) =>
      showToast('Gagal Menambahkan Agenda', errorMessage(err, 'Tidak dapat menyimpan agenda mengajar ke Supabase.')),
  });

  const updateMutation = useMutation({
    mutationFn: (entry: JournalEntry) => repo!.journals.update(entry),
    onSuccess: (updated) => {
      queryClient.setQueryData<JournalEntry[]>(key, (prev) =>
        (prev ?? []).map((j) => (j.id === updated.id ? updated : j))
      );
      showToast(
        'Agenda Mengajar Diperbarui',
        `Catatan pertemuan Ke-${updated.pertemuanKe} (${updated.className}) berhasil disimpan.`
      );
    },
    onError: (err) =>
      showToast('Gagal Memperbarui Agenda', errorMessage(err, 'Tidak dapat memperbarui catatan agenda di Supabase.')),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await repo!.journals.remove(id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<JournalEntry[]>(key, (prev) => (prev ?? []).filter((j) => j.id !== id));
      showToast('Agenda Mengajar Dihapus', 'Catatan agenda telah dihapus dari buku jurnal.');
    },
    onError: (err) =>
      showToast('Gagal Menghapus Agenda', errorMessage(err, 'Tidak dapat menghapus agenda dari Supabase.')),
  });

  return {
    journals: query.data ?? EMPTY_JOURNALS,
    isLoading: query.isLoading,
    addJournal: useCallback(
      (entry: Omit<JournalEntry, 'id'>) => settle(addMutation.mutateAsync(entry)),
      [addMutation.mutateAsync]
    ),
    updateJournal: useCallback(
      (entry: JournalEntry) => settle(updateMutation.mutateAsync(entry)),
      [updateMutation.mutateAsync]
    ),
    deleteJournal: useCallback(
      (id: string) => settle(deleteMutation.mutateAsync(id)),
      [deleteMutation.mutateAsync]
    ),
  };
}

/* ------------------------------------------------------------------ */
/* Sinkronisasi Presensi → Agenda Mengajar                             */
/* ------------------------------------------------------------------ */

export interface JournalSyncRequest {
  session: AttendanceSession;
  /** Catatan presensi (boleh berisi sesi lain; difilter per sesi). */
  records: AttendanceRecord[];
  /** Murid kelas yang bersangkutan. */
  students: Student[];
}

/**
 * Sinkronisasi dijalankan BERURUTAN (antrian) dan digabung per sesi: ketukan
 * beruntun hanya menulis kondisi terbaru, dan tidak bisa membuat agenda ganda
 * walaupun cache jurnal belum pernah dimuat.
 */
export function useJournalSync(teacherName: string, classes: ClassRoom[]) {
  const { scope, repo } = useDataSource();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const s = scope ?? 'anon';

  const latest = useRef({ teacherName, classes, scope: s, repo });
  useEffect(() => {
    latest.current = { teacherName, classes, scope: s, repo };
  }, [teacherName, classes, s, repo]);

  const queue = useRef<Promise<void>>(Promise.resolve());
  const pending = useRef(new Map<string, JournalSyncRequest>());

  const run = useCallback(
    async (req: JournalSyncRequest) => {
      const { teacherName: teacher, classes: classList, scope: sc, repo: r } = latest.current;
      if (!r) return;
      const key = queryKeys.journals(sc);
      const { session } = req;

      const journals = await queryClient.ensureQueryData({
        queryKey: key,
        queryFn: () => r.journals.list(),
      });

      const note = buildAttendanceNote(
        req.students.filter((st) => st.classId === session.classId),
        req.records.filter((rec) => rec.sessionId === session.id)
      );
      const existing = findJournalForSession(journals, session);

      if (existing) {
        const updated = mergeSessionIntoJournal(existing, session, note);
        queryClient.setQueryData<JournalEntry[]>(key, (prev) =>
          (prev ?? []).map((j) => (j.id === updated.id ? updated : j))
        );
        try {
          await r.journals.update(updated);
        } catch (err) {
          console.warn('[useJournalSync] Gagal memperbarui agenda:', err);
          queryClient.invalidateQueries({ queryKey: key });
        }
        return;
      }

      const cls = classList.find((c) => c.id === session.classId);
      const entry = createJournalFromSession(newId(), session, cls, teacher, note);
      // Masuk cache lebih dulu agar sinkronisasi berikutnya menemukan agenda ini.
      queryClient.setQueryData<JournalEntry[]>(key, (prev) => [entry, ...(prev ?? [])]);
      try {
        const created = await r.journals.create(entry);
        queryClient.setQueryData<JournalEntry[]>(key, (prev) =>
          (prev ?? []).map((j) => (j.id === entry.id ? created : j))
        );
      } catch (err) {
        console.warn('[useJournalSync] Gagal membuat agenda:', err);
        queryClient.setQueryData<JournalEntry[]>(key, (prev) =>
          (prev ?? []).filter((j) => j.id !== entry.id)
        );
        showToast('Agenda Belum Tersinkron', 'Agenda mengajar otomatis tidak tersimpan ke Supabase.');
      }
    },
    [queryClient, showToast]
  );

  const syncSession = useCallback(
    (req: JournalSyncRequest): Promise<void> => {
      pending.current.set(req.session.id, req);
      queue.current = queue.current.then(async () => {
        const next = pending.current.get(req.session.id);
        if (!next) return; // sudah diproses oleh permintaan yang lebih baru
        pending.current.delete(req.session.id);
        try {
          await run(next);
        } catch (err) {
          console.warn('[useJournalSync] Sinkronisasi gagal:', err);
        }
      });
      return queue.current;
    },
    [run]
  );

  /** Sinkronkan seluruh sesi di SEMUA kelas (aksi manual dari tab Jurnal). */
  const syncAllClasses = useCallback(async () => {
    const { classes: classList, scope: sc, repo: r } = latest.current;
    if (!r) return;
    for (const cls of classList) {
      const [students, sessions] = await Promise.all([
        queryClient.ensureQueryData({
          queryKey: queryKeys.students(sc, cls.id),
          queryFn: () => r.students.listByClass(cls.id),
        }),
        queryClient.ensureQueryData({
          queryKey: queryKeys.sessions(sc, cls.id),
          queryFn: () => r.sessions.listByClass(cls.id),
        }),
      ]);
      const records = await queryClient.ensureQueryData({
        queryKey: queryKeys.classRecords(sc, cls.id),
        queryFn: () => r.records.listBySessions(sessions.map((x) => x.id)),
      });
      sessions.forEach((session) => {
        void syncSession({ session, records, students });
      });
    }
    await queue.current;
  }, [queryClient, syncSession]);

  return { syncSession, syncAllClasses };
}
