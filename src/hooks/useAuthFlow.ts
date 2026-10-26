import { useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { queryKeys } from '../lib/queryKeys';
import { seedDemoData, cleanupLegacyUserStorage } from '../services/demoStore';
import { TeacherProfile } from '../types';

/** Alur masuk/keluar: login Supabase, mode Demo, dan logout. */
export function useAuthFlow() {
  const { userId, setDemoMode, signOut } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Bersihkan sisa kunci localStorage lama per-pengguna (sekali per pengguna).
  useEffect(() => {
    if (userId) cleanupLegacyUserStorage(userId);
  }, [userId]);

  const handleLoginSuccess = useCallback(
    (user: { id: string; email: string }, profile?: TeacherProfile | null) => {
      // Profil yang sudah dimuat LoginView langsung masuk cache; tidak perlu fetch ulang.
      if (profile) queryClient.setQueryData(queryKeys.profile(user.id), profile);
      showToast('Selamat Datang!', `Berhasil masuk ke Ruang Guru (${user.email})`);
    },
    [queryClient, showToast]
  );

  const handleDemoLogin = useCallback(() => {
    seedDemoData();
    setDemoMode(true);
    showToast('Mode Simulasi', 'Berjalan dengan data contoh lokal; tidak terhubung ke Supabase.');
  }, [setDemoMode, showToast]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
    } catch (err) {
      console.warn('Logout error:', err);
    }
    showToast('Sesi Berakhir', 'Anda telah keluar dari akun pendidik secara aman.');
  }, [signOut, showToast]);

  return { handleLoginSuccess, handleDemoLogin, handleLogout };
}
