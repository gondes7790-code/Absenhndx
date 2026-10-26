import { useState, type FormEvent } from 'react';
import { getSupabase } from '../lib/supabase';

/** Ganti kata sandi akun Supabase (dengan verifikasi ulang kata sandi lama). */
export function usePasswordChange(
  fallbackEmail: string,
  onShowToast: (title: string, desc: string) => void
) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (isPasswordUpdating) return;
    if (!oldPassword || !newPassword) {
      onShowToast('Peringatan', 'Harap isi semua kolom kata sandi.');
      return;
    }
    if (newPassword.length < 8) {
      onShowToast('Peringatan', 'Kata sandi baru minimal 8 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      onShowToast('Peringatan', 'Konfirmasi kata sandi baru tidak cocok.');
      return;
    }
    setIsPasswordUpdating(true);
    try {
      const supabase = getSupabase();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const email = userData.user?.email || fallbackEmail;
      if (userError || !email) {
        throw new Error('Sesi login tidak valid. Silakan masuk kembali.');
      }

      // Re-authenticate so the "kata sandi lama" field is actually verified.
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email,
        password: oldPassword,
      });
      if (reauthError) {
        throw new Error('Kata sandi lama tidak benar.');
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;

      setPasswordSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onShowToast('Kata Sandi Diperbarui', 'Kata sandi akun pendidik berhasil diubah.');
      setTimeout(() => setPasswordSuccess(false), 3500);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memperbarui kata sandi.';
      onShowToast('Gagal Memperbarui Kata Sandi', message);
    } finally {
      setIsPasswordUpdating(false);
    }
  };

  return {
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    passwordSuccess,
    isPasswordUpdating,
    handleChangePassword,
  };
}

export type PasswordChangeState = ReturnType<typeof usePasswordChange>;
