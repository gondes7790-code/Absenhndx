import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { TeacherProfile } from '../types';
import { APP_LOGO_URL } from '../utils/printConfig';
import { getSupabase } from '../lib/supabase';

interface LoginViewProps {
  onLoginSuccess: (user: { id: string; email: string }, profile?: TeacherProfile | null) => void;
  onDemoLogin: () => void;
  schoolName?: string;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onDemoLogin,
  schoolName = 'Sekolah Merdeka Indonesia',
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleQuickDemoFill = () => {
    setErrorMessage('');
    onDemoLogin();
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password.trim()) {
      setErrorMessage('Harap isi email dan kata sandi Anda.');
      return;
    }

    setIsLoading(true);
    const supabase = getSupabase();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password.trim(),
      });

      if (error) {
        setErrorMessage(error.message || 'Gagal masuk. Periksa email dan kata sandi Anda.');
        return;
      }

      if (data.user) {
        // Fetch existing profile if available
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const loadedProfile: TeacherProfile | null = profileData
          ? {
              name: profileData.nama_lengkap || 'Pendidik Merdeka',
              email: profileData.email || cleanEmail,
              nip: profileData.nip || '-',
              nuptk: '-',
              school: profileData.nama_sekolah || schoolName,
              handle: '@' + (cleanEmail.split('@')[0] || 'guru'),
              phone: '',
              mapelUtama: 'Kurikulum Merdeka',
              bio: 'Pendidik Profesional Berdedikasi',
            }
          : null;

        onLoginSuccess({ id: data.user.id, email: data.user.email || cleanEmail }, loadedProfile);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi kendala pada koneksi ke Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#faf7ee]">
      <div className="w-full max-w-md">
        {/* Top Floating Badge */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fef9c3] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-xs font-bold text-slate-900">
            <img src={APP_LOGO_URL} alt="Logo" className="w-4 h-4 object-contain shrink-0" />
            <span>Hadir! • Kurikulum Merdeka</span>
            <span className="text-slate-400">•</span>
            <span className="bg-slate-900 text-white text-[10px] px-2 py-0.2 rounded-full font-mono">
              @hndx07
            </span>
          </div>
        </div>

        {/* Main Neobrutalist Login Card */}
        <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 sm:p-8 shadow-[5px_5px_0px_#1e293b] relative overflow-hidden">
          {/* Decorative pastel corner tab */}
          <div className="absolute top-0 right-0 bg-[#ede9fe] border-b-2 border-l-2 border-slate-900 px-3 py-1 rounded-bl-2xl text-[10px] font-mono font-bold text-indigo-900">
            SUPABASE POSTGRESQL RLS
          </div>

          {/* Logo & School Header */}
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] flex items-center justify-center shrink-0 p-1.5 overflow-hidden">
              <img
                src={APP_LOGO_URL}
                alt="Logo Sekolah & Aplikasi"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                Hadir!
              </h1>
              <p className="text-xs font-medium text-slate-500">
                Presensi, Penilaian & Jurnal Pendidik
              </p>
            </div>
          </div>

          <div className="mb-5">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Masuk ke Ruang Pendidik
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Gunakan email & kata sandi terdaftar atau coba akun demo offline
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-[#fee2e2] border-2 border-slate-900 text-xs font-bold text-rose-950 flex items-start gap-2 shadow-[2px_2px_0px_#1e293b]">
              <AlertCircle className="w-4 h-4 text-rose-800 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1.5">
                Alamat Email Pendidik
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="demo@guru.sekolah.belajar.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#fbfbfa] text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:shadow-[2px_2px_0px_#059669] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1.5">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Masukkan kata sandi Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#fbfbfa] text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:shadow-[2px_2px_0px_#059669] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-[#6ee7b7] hover:bg-[#34d399] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#1e293b] border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] font-black text-slate-950 text-xs sm:text-sm flex items-center justify-center gap-2 transition-all mt-4 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi akun...</span>
                </span>
              ) : (
                <>
                  <span>Masuk ke Ruang Guru</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Helper Box */}
          <div className="mt-5 pt-4 border-t-2 border-slate-100">
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="w-full p-2.5 rounded-2xl bg-[#e0f2fe] hover:bg-[#bae6fd] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-left transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-4 h-4 text-sky-800 shrink-0" />
                <div>
                  <span className="text-[10px] font-black text-sky-950 block">
                    Masuk Mode Uji Coba Demo (Lokal & Offline)
                  </span>
                  <span className="text-[10px] text-sky-800 font-medium">
                    Uji coba aplikasi mandiri tanpa memanggil Supabase Cloud
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold bg-sky-900 text-white px-2 py-0.5 rounded-lg shrink-0">
                1-Klik Uji Coba
              </span>
            </button>
          </div>
        </div>

        {/* Security & Credit Footer */}
        <div className="mt-4 text-center space-y-1 text-slate-500 text-[11px]">
          <div className="inline-flex items-center gap-1.5 font-medium text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Terproteksi Row Level Security Supabase Cloud</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Aplikasi Dikembangkan oleh <strong className="text-slate-700">@hndx07</strong> • Kurikulum Merdeka
          </p>
        </div>
      </div>
    </div>
  );
};
