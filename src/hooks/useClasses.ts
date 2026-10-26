import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClassRoom } from '../types';
import { queryKeys, recordsPrefix } from '../lib/queryKeys';
import { useToast } from '../contexts/ToastContext';
import { useDataSource } from './useDataSource';
import { errorMessage, newId, settle } from './mutationUtils';

const EMPTY_CLASSES: ClassRoom[] = [];

export function useClasses() {
  const { scope, repo } = useDataSource();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const s = scope ?? 'anon';
  const listKey = queryKeys.classes(s);

  // Data awal yang selalu dimuat: hanya `classes` (bersama profil).
  const query = useQuery<ClassRoom[]>({
    queryKey: listKey,
    queryFn: () => repo!.classes.list(),
    enabled: Boolean(scope && repo),
    meta: { label: 'daftar kelas' },
  });

  const addMutation = useMutation({
    mutationFn: (input: Omit<ClassRoom, 'id'>) =>
      repo!.classes.create({ ...input, id: newId(), tpTitles: input.tpTitles || {} }),
    onSuccess: (created) => {
      queryClient.setQueryData<ClassRoom[]>(listKey, (prev) => [...(prev ?? []), created]);
      showToast(
        'Rombel Berhasil Ditambahkan',
        `Kelas ${created.nama} siap digunakan. Kelas masih kosong (belum ada murid dan sesi presensi).`
      );
    },
    onError: (err) =>
      showToast('Gagal Menambahkan Rombel', errorMessage(err, 'Tidak dapat menyimpan kelas ke Supabase.')),
  });

  const editMutation = useMutation({
    mutationFn: (cls: ClassRoom) => repo!.classes.update(cls),
    onSuccess: (updated) => {
      queryClient.setQueryData<ClassRoom[]>(listKey, (prev) =>
        (prev ?? []).map((c) => (c.id === updated.id ? updated : c))
      );
      showToast('Rombel Diperbarui', `Informasi kelas ${updated.nama} berhasil disimpan.`);
    },
    onError: (err) =>
      showToast('Gagal Memperbarui Rombel', errorMessage(err, 'Tidak dapat memperbarui data kelas di Supabase.')),
  });

  const deleteMutation = useMutation({
    mutationFn: async (classId: string) => {
      await repo!.classes.remove(classId);
      return classId;
    },
    onSuccess: (classId) => {
      const target = queryClient.getQueryData<ClassRoom[]>(listKey)?.find((c) => c.id === classId);
      queryClient.setQueryData<ClassRoom[]>(listKey, (prev) =>
        (prev ?? []).filter((c) => c.id !== classId)
      );
      // Data turunan kelas ini sudah terhapus (cascade) → buang cache-nya.
      queryClient.removeQueries({ queryKey: queryKeys.students(s, classId) });
      queryClient.removeQueries({ queryKey: queryKeys.sessions(s, classId) });
      queryClient.removeQueries({ queryKey: queryKeys.grades(s, classId) });
      queryClient.removeQueries({ queryKey: queryKeys.finances(s, classId) });
      queryClient.removeQueries({ queryKey: queryKeys.classRecords(s, classId) });
      queryClient.invalidateQueries({ queryKey: recordsPrefix(s) });
      queryClient.invalidateQueries({ queryKey: queryKeys.journals(s) });
      queryClient.invalidateQueries({ queryKey: queryKeys.studentCount(s) });
      showToast('Rombel Dihapus', `Kelas ${target?.nama || ''} telah dihapus.`);
    },
    onError: (err) =>
      showToast('Gagal Menghapus Rombel', errorMessage(err, 'Tidak dapat menghapus kelas dari Supabase.')),
  });

  const addClass = useCallback(
    (input: Omit<ClassRoom, 'id'>) => settle(addMutation.mutateAsync(input)),
    [addMutation.mutateAsync]
  );
  const editClass = useCallback(
    (cls: ClassRoom) => settle(editMutation.mutateAsync(cls)),
    [editMutation.mutateAsync]
  );
  const deleteClassById = useCallback(
    (classId: string) => settle(deleteMutation.mutateAsync(classId)),
    [deleteMutation.mutateAsync]
  );

  return {
    classes: query.data ?? EMPTY_CLASSES,
    isLoading: query.isLoading,
    addClass,
    editClass,
    deleteClass: deleteClassById,
  };
}
