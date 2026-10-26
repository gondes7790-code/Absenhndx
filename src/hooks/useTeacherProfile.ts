import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { User } from '@supabase/supabase-js';
import { TeacherProfile } from '../types';
import { queryKeys } from '../lib/queryKeys';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useDataSource } from './useDataSource';
import { errorMessage, settle } from './mutationUtils';

/** Profil bawaan bila akun Supabase belum punya baris di tabel `profiles`. */
export function buildDefaultTeacher(user: User | null): TeacherProfile {
  return {
    name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guru Pendidik',
    email: user?.email || '',
    nip: '',
    nuptk: '',
    school: 'Hadir!',
    handle: `@${(user?.email?.split('@')[0] || 'guru').toLowerCase()}`,
    phone: '',
    mapelUtama: '',
    bio: '',
  };
}

export function useTeacherProfile() {
  const { user } = useAuth();
  const { scope, repo, isDemo } = useDataSource();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const key = queryKeys.profile(scope ?? 'anon');

  const query = useQuery<TeacherProfile | null>({
    queryKey: key,
    queryFn: () => repo!.profile.get(),
    enabled: Boolean(scope && repo),
    meta: { label: 'profil pendidik' },
  });

  const fallback = useMemo(() => buildDefaultTeacher(user), [user]);
  const teacher: TeacherProfile = query.data ?? fallback;

  const mutation = useMutation({
    mutationFn: (updated: TeacherProfile) => repo!.profile.update(updated),
    onSuccess: (saved) => {
      queryClient.setQueryData(key, saved);
      showToast('Profil Berhasil Diperbarui', 'Data identitas pendidik telah tersimpan ke sistem.');
    },
    onError: (err) =>
      showToast('Gagal Memperbarui Profil', errorMessage(err, 'Tidak dapat menyimpan profil ke Supabase.')),
  });

  return {
    teacher,
    /** Nama sekolah dari database (hanya mode Supabase); dipakai menyinkronkan `schoolName`. */
    remoteSchool: !isDemo ? query.data?.school || null : null,
    isLoading: query.isLoading,
    updateTeacher: useCallback(
      (updated: TeacherProfile) => settle(mutation.mutateAsync(updated)),
      [mutation.mutateAsync]
    ),
  };
}
