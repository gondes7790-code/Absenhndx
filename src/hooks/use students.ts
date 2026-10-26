import { useCallback, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AttendanceRecord, ClassRoom, GradeRecord, Student } from '../types';
import { queryKeys, recordsPrefix } from '../lib/queryKeys';
import { useToast } from '../contexts/ToastContext';
import { useDataSource } from './useDataSource';
import { errorMessage, newId, settle } from './mutationUtils';

const EMPTY_STUDENTS: Student[] = [];

/** Total murid seluruh kelas (kartu statistik Profil) — hanya angka, bukan seluruh barisnya. */
export function useStudentCount(enabled = true) {
  const { scope, repo } = useDataSource();
  const s = scope ?? 'anon';
  const query = useQuery<number>({
    queryKey: queryKeys.studentCount(s),
    queryFn: () => repo!.students.countAll(),
    enabled: Boolean(scope && repo && enabled),
    meta: { label: 'jumlah murid' },
  });
  return query.data ?? 0;
}

export type NewStudentInput = Omit<Student, 'id' | 'noUrut' | 'classId'>;

/**
 * Murid untuk SATU kelas. Lazy: baru di-fetch ketika `enabled` (mis. tab yang
 * membutuhkannya sedang aktif) dan sudah ada kelas aktif.
 */
export function useStudents(activeClass: ClassRoom | null, enabled = true) {
  const { scope, repo } = useDataSource();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const s = scope ?? 'anon';
  const classId = activeClass?.id ?? '';

  const query = useQuery<Student[]>({
    queryKey: queryKeys.students(s, classId),
    queryFn: () => repo!.students.listByClass(classId),
    enabled: Boolean(scope && repo && classId && enabled),
    meta: { label: 'data murid' },
  });

  /** Daftar murid sebuah kelas dari cache; mem-fetch bila belum ada (aman dipanggil lintas tab). */
  const ensureClassStudents = useCallback(
    (targetClassId: string) =>
      queryClient.ensureQueryData({
        queryKey: queryKeys.students(s, targetClassId),
        queryFn: () => repo!.students.listByClass(targetClassId),
      }),
    [queryClient, s, repo]
  );

  /** Hapus efek turunan murid (presensi & nilai) dari semua cache yang sedang dimuat. */
  const dropStudentsFromCaches = useCallback(
    (studentIds: string[]) => {
      const ids = new Set(studentIds);
      queryClient.setQueriesData<AttendanceRecord[]>({ queryKey: recordsPrefix(s) }, (old) =>
        old ? old.filter((r) => !ids.has(r.studentId)) : old
      );
      queryClient.setQueriesData<GradeRecord[]>({ queryKey: ['grades', s] }, (old) =>
        old ? old.filter((g) => !ids.has(g.studentId)) : old
      );
    },
    [queryClient, s]
  );

  const addMutation = useMutation({
    mutationFn: async (input: { student: NewStudentInput; cls: ClassRoom }) => {
      const current = await ensureClassStudents(input.cls.id);
      const student: Student = {
        ...input.student,
        id: newId(),
        classId: input.cls.id,
        noUrut: current.length + 1,
      };
      return repo!.students.create(student);
    },
    onSuccess: (created, { cls }) => {
      queryClient.setQueryData<Student[]>(queryKeys.students(s, cls.id), (prev) => [
        ...(prev ?? []),
        created,
      ]);
      queryClient.invalidateQueries({ queryKey: queryKeys.studentCount(s) });
      showToast(
        'Murid Berhasil Ditambahkan',
        `${created.nama} terdaftar di kelas ${cls.nama} dengan nomor absen ${created.noUrut}.`
      );
    },
    onError: (err) =>
      showToast('Gagal Menambahkan Murid', errorMessage(err, 'Terjadi kesalahan saat menyimpan data murid ke Supabase.')),
  });

  const editMutation = useMutation({
    mutationFn: (student: Student) => repo!.students.update(student),
    onSuccess: (updated) => {
      queryClient.setQueryData<Student[]>(queryKeys.students(s, updated.classId), (prev) =>
        (prev ?? []).map((st) => (st.id === updated.id ? updated : st))
      );
      showToast('Data Murid Diperbarui', `Informasi ${updated.nama} berhasil diubah.`);
    },
    onError: (err) =>
      showToast('Gagal Memperbarui Murid', errorMessage(err, 'Tidak dapat menyimpan perubahan data murid ke Supabase.')),
  });

  const deleteMutation = useMutation({
    mutationFn: async (target: Student) => {
      await repo!.students.remove(target.id);

      // Nomor absen sisa murid digeser maju berurutan.
      const current = await ensureClassStudents(target.classId);
      const reindexed = current
        .filter((st) => st.id !== target.id)
        .sort((a, b) => a.noUrut - b.noUrut)
        .map((st, idx) => ({ ...st, noUrut: idx + 1 }));

      if (reindexed.length > 0) {
        try {
          await repo!.students.updateBatch(reindexed);
        } catch (err) {
          console.warn('[useStudents] Gagal menyimpan urutan nomor absen:', err);
        }
      }
      return { target, reindexed };
    },
    onSuccess: ({ target, reindexed }) => {
      queryClient.setQueryData<Student[]>(queryKeys.students(s, target.classId), reindexed);
      queryClient.invalidateQueries({ queryKey: queryKeys.studentCount(s) });
      dropStudentsFromCaches([target.id]);
      showToast(
        'Nomor Absen Diperbarui Otomatis',
        `Murid ${target.nama} (No. ${target.noUrut}) dihapus. Nomor absen rombel setelahnya otomatis digeser maju berurutan.`
      );
    },
    onError: (err) =>
      showToast('Gagal Menghapus Murid', errorMessage(err, 'Tidak dapat menghapus data murid dari Supabase.')),
  });

  const importMutation = useMutation({
    mutationFn: async (input: {
      students: NewStudentInput[];
      mode: 'append' | 'replace';
      cls: ClassRoom;
    }) => {
      const existing = await ensureClassStudents(input.cls.id);
      const startNo = input.mode === 'replace' ? 0 : existing.length;
      const formatted: Student[] = input.students.map((st, idx) => ({
        ...st,
        id: newId(),
        classId: input.cls.id,
        noUrut: startNo + idx + 1,
      }));

      const created = await repo!.students.createBatch(formatted);

      // "Ganti Seluruh Murid": murid lama dihapus SETELAH murid baru berhasil tersimpan.
      let removedIds: string[] = [];
      if (input.mode === 'replace' && existing.length > 0) {
        removedIds = existing.map((st) => st.id);
        try {
          await repo!.students.removeMany(removedIds);
        } catch (err) {
          console.warn('[useStudents] Sebagian murid lama gagal dihapus:', err);
        }
      }
      return { created, existing, removedIds, mode: input.mode, cls: input.cls };
    },
    onSuccess: ({ created, existing, removedIds, mode, cls }) => {
      queryClient.setQueryData<Student[]>(
        queryKeys.students(s, cls.id),
        mode === 'replace' ? created : [...existing, ...created]
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.studentCount(s) });
      if (removedIds.length > 0) dropStudentsFromCaches(removedIds);
      showToast(
        mode === 'replace' ? 'Impor Selesai (Ganti Data)' : 'Impor Selesai (Tambahkan)',
        mode === 'replace'
          ? `${created.length} murid berhasil didaftarkan di kelas ${cls.nama}.`
          : `${created.length} murid baru berhasil ditambahkan ke kelas ${cls.nama}.`
      );
    },
    onError: (err) =>
      showToast('Gagal Mengimpor Murid', errorMessage(err, 'Tidak dapat menyimpan batch murid ke Supabase.')),
  });

  const addStudent = useCallback(
    (student: NewStudentInput) => {
      if (!activeClass) {
        showToast('Pilih Rombel Terlebih Dahulu', 'Silakan buat atau pilih rombel kelas.');
        return Promise.resolve(null);
      }
      return settle(addMutation.mutateAsync({ student, cls: activeClass }));
    },
    [activeClass, addMutation.mutateAsync, showToast]
  );

  const editStudent = useCallback(
    (student: Student) => settle(editMutation.mutateAsync(student)),
    [editMutation.mutateAsync]
  );

  // Daftar terbaru lewat ref agar `deleteStudent` stabil (baris tabel memakai React.memo).
  const studentsRef = useRef<Student[]>(EMPTY_STUDENTS);
  useEffect(() => {
    studentsRef.current = query.data ?? EMPTY_STUDENTS;
  });

  const deleteStudent = useCallback(
    async (id: string) => {
      const target = studentsRef.current.find((st) => st.id === id);
      if (!target) return null;
      return settle(deleteMutation.mutateAsync(target));
    },
    [deleteMutation.mutateAsync]
  );

  const importStudents = useCallback(
    (students: NewStudentInput[], mode: 'append' | 'replace') => {
      if (students.length === 0 || !activeClass) return Promise.resolve(null);
      return settle(importMutation.mutateAsync({ students, mode, cls: activeClass }));
    },
    [activeClass, importMutation.mutateAsync]
  );

  return {
    students: query.data ?? EMPTY_STUDENTS,
    isLoading: query.isLoading,
    addStudent,
    editStudent,
    deleteStudent,
    importStudents,
  };
}
