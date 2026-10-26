import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClassRoom, GradeRecord, Student } from '../types';
import { queryKeys } from '../lib/queryKeys';
import { useToast } from '../contexts/ToastContext';
import { useDataSource } from './useDataSource';
import { errorMessage, newId, settle } from './mutationUtils';
import { buildGradeDescription } from '../services/journalSync';

const EMPTY_GRADES: GradeRecord[] = [];
const GRADE_PERSIST_DEBOUNCE_MS = 500;

function replaceGrades(list: GradeRecord[], incoming: GradeRecord[]): GradeRecord[] {
  const next = [...list];
  incoming.forEach((g) => {
    const idx = next.findIndex((x) => x.studentId === g.studentId && x.classId === g.classId);
    if (idx >= 0) next[idx] = g;
    else next.push(g);
  });
  return next;
}

/** Nilai untuk SATU kelas; lazy per kelas aktif & tab yang membutuhkannya. */
export function useGrades(activeClass: ClassRoom | null, enabled = true) {
  const { scope, repo } = useDataSource();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const s = scope ?? 'anon';
  const classId = activeClass?.id ?? '';
  const key = useMemo(() => queryKeys.grades(s, classId), [s, classId]);

  const query = useQuery<GradeRecord[]>({
    queryKey: key,
    queryFn: () => repo!.grades.listByClass(classId),
    enabled: Boolean(scope && repo && classId && enabled),
    meta: { label: 'data nilai' },
  });
  const grades = query.data ?? EMPTY_GRADES;

  // Simpan nilai: cache diperbarui langsung (optimistic) oleh updateGrade; bila gagal, muat ulang dari sumber data.
  const saveMutation = useMutation({
    mutationFn: (grade: GradeRecord) => repo!.grades.upsert(grade),
    onError: (err) => {
      queryClient.invalidateQueries({ queryKey: key });
      showToast('Gagal Menyimpan Nilai', errorMessage(err, 'Tidak dapat memperbarui nilai rapor di Supabase.'));
    },
  });

  const saveManyMutation = useMutation({
    mutationFn: async (list: GradeRecord[]) => {
      await repo!.grades.upsertMany(list);
      return list;
    },
    onSuccess: (list) => {
      queryClient.setQueryData<GradeRecord[]>(key, (prev) => replaceGrades(prev ?? [], list));
    },
    onError: (err) =>
      showToast('Peringatan Sinkronisasi', errorMessage(err, 'Sebagian deskripsi nilai tidak tersimpan ke cloud.')),
  });

  // Penyimpanan di-debounce per murid: mengetik angka tidak membuat satu request per ketikan.
  const persistTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const persistGrade = saveMutation.mutateAsync;

  // Saat berpindah kelas / hook dilepas, nilai yang masih menunggu disimpan langsung ditulis (tidak dibuang).
  useEffect(() => {
    const timers = persistTimers.current;
    return () => {
      const pendingIds = Array.from(timers.keys());
      pendingIds.forEach((studentId) => {
        const timer = timers.get(studentId);
        if (timer) clearTimeout(timer);
        timers.delete(studentId);
        const latest = queryClient.getQueryData<GradeRecord[]>(key)?.find((g) => g.studentId === studentId);
        if (latest) void settle(persistGrade(latest));
      });
    };
  }, [key, queryClient, persistGrade]);

  const updateGrade = useCallback(
    (studentId: string, patch: Partial<GradeRecord>) => {
      if (!activeClass) return;
      // Basis diambil dari cache terbaru (bukan closure render) supaya ketikan beruntun tidak saling menimpa.
      const current = queryClient.getQueryData<GradeRecord[]>(key) ?? [];
      const existing = current.find((g) => g.studentId === studentId);
      const now = new Date().toISOString();
      const target: GradeRecord = existing
        ? { ...existing, ...patch, updatedAt: now }
        : {
            id: newId(),
            studentId,
            classId: activeClass.id,
            formatif: patch.formatif || Array(activeClass.formatifCount).fill(null),
            sts: patch.sts ?? null,
            sas: patch.sas ?? null,
            deskripsi: patch.deskripsi || '',
            updatedAt: now,
            ...patch,
          };
      queryClient.setQueryData<GradeRecord[]>(key, (prev) => replaceGrades(prev ?? [], [target]));

      const timers = persistTimers.current;
      const pendingTimer = timers.get(studentId);
      if (pendingTimer) clearTimeout(pendingTimer);
      timers.set(
        studentId,
        setTimeout(() => {
          timers.delete(studentId);
          const latest = queryClient
            .getQueryData<GradeRecord[]>(key)
            ?.find((g) => g.studentId === studentId);
          if (latest) void settle(persistGrade(latest));
        }, GRADE_PERSIST_DEBOUNCE_MS)
      );
    },
    [activeClass, queryClient, key, persistGrade]
  );

  /** Buat deskripsi rapor otomatis untuk seluruh nilai kelas aktif. */
  const generateAllDescriptions = useCallback(
    async (students: Student[]) => {
      const kkm = activeClass?.kkm || 75;
      const now = new Date().toISOString();
      const updated = grades.map((g) => {
        const name = students.find((st) => st.id === g.studentId)?.nama || 'Siswa';
        return { ...g, deskripsi: buildGradeDescription(name, g.formatif, kkm), updatedAt: now };
      });
      const ok = await settle(saveManyMutation.mutateAsync(updated));
      if (ok) {
        showToast(
          'Deskripsi Merdeka Dibuat Otomatis',
          'Catatan capaian kompetensi berhasil digenerate untuk seluruh murid.'
        );
      }
      return Boolean(ok);
    },
    [activeClass?.kkm, grades, saveManyMutation.mutateAsync, showToast]
  );

  /** Terapkan draf deskripsi dari Risk Scoring ke buku nilai. */
  const applyDescriptions = useCallback(
    async (descriptions: Map<string, string>) => {
      const now = new Date().toISOString();
      const changed = grades
        .filter((g) => descriptions.has(g.studentId))
        .map((g) => ({ ...g, deskripsi: descriptions.get(g.studentId) as string, updatedAt: now }));
      if (changed.length > 0) {
        const ok = await settle(saveManyMutation.mutateAsync(changed));
        if (!ok) return false;
      }
      showToast('Deskripsi Draf Diterapkan', 'Draf deskripsi dari Analisis Prediktif telah ditautkan ke Buku Penilaian Rapor.');
      return true;
    },
    [grades, saveManyMutation.mutateAsync, showToast]
  );

  return {
    grades,
    isLoading: query.isLoading,
    updateGrade,
    generateAllDescriptions,
    applyDescriptions,
  };
}
