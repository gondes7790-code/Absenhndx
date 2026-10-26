import React from 'react';
import { CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react';
import type { PasswordChangeState } from '../../hooks/usePasswordChange';

/** Kartu ganti kata sandi; logika ada di `usePasswordChange`. */
export const PasswordCard: React.FC<{ form: PasswordChangeState }> = ({ form }) => {
  const {
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
  } = form;

  return (
        <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 shadow-[4px_4px_0px_#1e293b]">
          <div className="flex items-center gap-2.5 pb-4 border-b-2 border-slate-100 mb-5">
            <div className="w-9 h-9 rounded-xl bg-[#fee2e2] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center justify-center">
              <Lock className="w-5 h-5 text-rose-900" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Keamanan & Kata Sandi Akun
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Pengaturan autentikasi PostgreSQL Supabase dengan Row Level Security
              </p>
            </div>
          </div>

          {passwordSuccess && (
            <div className="mb-4 p-3 rounded-2xl bg-[#dcfce7] border-2 border-slate-900 text-xs font-bold text-emerald-950 flex items-center gap-2 shadow-[2px_2px_0px_#1e293b]">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Kata sandi Anda berhasil diperbarui di database!</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Kata Sandi Lama
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#e11d48]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Kata Sandi Baru
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 8 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#e11d48]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Konfirmasi Baru
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ulangi kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#e11d48]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="font-bold text-slate-700 hover:text-slate-950 flex items-center gap-1.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showPassword ? 'Sembunyikan' : 'Tampilkan'} Kata Sandi</span>
              </button>

              <button
                type="submit"
                disabled={isPasswordUpdating}
                className="px-4 py-2 rounded-2xl bg-[#fecdd3] hover:bg-[#fda4af] active:translate-x-[1px] active:translate-y-[1px] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] font-black text-rose-950 text-xs cursor-pointer"
              >
                {isPasswordUpdating ? 'Memperbarui...' : 'Perbarui Kata Sandi'}
              </button>
            </div>
          </form>
        </div>
  );
};
