import React, { useRef, useState } from 'react';
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
import { getStoredSupabaseConfig } from '../services/supabaseService';
import { TurnstileWidget, TurnstileHandle } from './TurnstileWidget';

interface LoginViewProps {
  onLoginSuccess: (user: { id: string; email: string }, profile?: TeacherProfile | null) => void;
  onDemoLogin: () => void;
  schoolName?: string;
}

// Site key Turnstile bersifat publik (aman di frontend). Bila kosong, widget
// tidak ditampilkan dan tidak ada token yang dikirim ke Supabase.
const TURNSTILE_SITE_KEY = ((import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) || '').trim();

/** Terjemahkan pesan error Supabase Auth ke bahasa Indonesia yang ramah. */
function mapAuthError(message: string, status?: number): string {
  const m = (message || '').toLowerCase();
  if (m.includes('captcha')) {
    return 'Verifikasi keamanan ditolak atau sudah kedaluwarsa. Selesaikan ulang verifikasi lalu coba masuk lagi.';
  }
  if (m.includes('invalid login credentials')) {
    return 'Email atau kata sandi salah.';
  }
  if (m.includes('email not confirmed')) {
    return 'Email Anda belum dikonfirmasi. Hubungi admin untuk mengaktifkan akun.';
  }
  if (status === 429 || m.includes('rate limit') || m.includes('too many')) {
    return 'Terlalu banyak percobaan masuk. Tunggu beberapa menit lalu coba lagi.';
  }
  if (m.includes('failed to fetch') || m.includes('network') || m.includes('load failed')) {
    return 'Tidak dapat menghubungi server. Periksa koneksi internet Anda.';
  }
  return 'Gagal masuk. Silakan coba lagi.';
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
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);

  const turnstileEnabled = TURNSTILE_SITE_KEY.length > 0;
  const supabaseCfg = getStoredSupabaseConfig();
  const isSupabaseConfigured = Boolean(supabaseCfg.url?.trim() && supabaseCfg.anonKey?.trim());

  const canSubmit = !isLoading && isSupabaseConfigured && (!turnstileEnabled || Boolean(turnstileToken));

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMessage('');

    const cleanEmail = email.trim().toLowerCase();
    // Kata sandi sengaja TIDAK di-trim: spasi bisa menjadi bagian dari kata sandi.
    if (!cleanEmail || !password) {
      setErrorMessage('Harap isi email dan kata sandi Anda.');
      return;
    }

    if (!isSupabaseConfigured) {
      setErrorMessage('Supabase belum dikonfigurasi. Gunakan Mode Simulasi atau hubungi admin.');
      return;
    }

    if (turnstileEnabled && !turnstileToken) {
      setErrorMessage('Selesaikan verifikasi keamanan terlebih dahulu.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
        options: turnstileEnabled && turnstileToken ? { captchaToken: turnstileToken } : undefined,
      });

      if (error) {
        setErrorMessage(mapAuthError(error.message, (error as { status?: number }).status));
        return;
      }

      if (data.user) {
        let loadedProfile: TeacherProfile | null = null;
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          if (profileData) {
            loadedProfile = {
              name: profileData.nama_lengkap || 'Pendidik Merdeka',
              email: profileData.email || cleanEmail,
              nip: profileData.nip || '',
              nuptk: '',
              school: profileData.nama_sekolah || schoolName,
              handle: '@' + (cleanEmail.split('@')[0] || 'guru'),
              phone: '',
              mapelUtama: 'Kurikulum Merdeka',
              bio: 'Pendidik Profesional Berdedikasi',
            };
          }
        } catch (profileErr) {
          // Gagal memuat profil tidak boleh menggagalkan login.
          console.warn('[LoginView] Profil tidak dapat dimuat:', profileErr);
        }

        onLoginSuccess({ id: data.user.id, email: data.user.email || cleanEmail }, loadedProfile);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setErrorMessage(mapAuthError(msg));
    } finally {
      setIsLoading(false);
      // Token Turnstile sekali pakai: minta tantangan baru setelah setiap percobaan.
      if (turnstileEnabled) {
        turnstileRef.current?.reset();
      }
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
            POSTGRESQL RLS
          </div>

          {/* Logo & School Header */}
          <div className="flex items-center gap-3.5 mb-5">
            <div className="w-13 h-13 rounded-2xl bg-[#f0fdf4] border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] flex items-center justify-center shrink-0 p-1.5 overflow-hidden">
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

          <div className="mb-4">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Masuk ke Ruang Pendidik
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Gunakan email dan kata sandi akun pendidik Anda. Pendaftaran mandiri tidak tersedia;
              hubungi admin untuk dibuatkan akun.
            </p>
          </div>

          {!isSupabaseConfigured && (
            <div
              role="status"
              className="mb-4 p-3 rounded-2xl bg-[#fef9c3] border-2 border-slate-900 text-xs font-bold text-amber-950 flex items-start gap-2 shadow-[2px_2px_0px_#1e293b]"
            >
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>Supabase belum dikonfigurasi, sehingga login dinonaktifkan. Gunakan Mode Simulasi di bawah.</span>
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-4 p-3 rounded-2xl bg-[#fee2e2] border-2 border-slate-900 text-xs font-bold text-rose-950 flex items-start gap-2 shadow-[2px_2px_0px_#1e293b]"
            >
              <AlertCircle className="w-4 h-4 text-rose-800 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-xs" autoComplete="on">
            <div>
              <label htmlFor="login-email" className="block font-bold text-slate-800 mb-1">
                Alamat Email Pendidik
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                  placeholder="guru@sekolah.belajar.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#fbfbfa] text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:shadow-[2px_2px_0px_#059669] transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block font-bold text-slate-800 mb-1">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Kata sandi Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#fbfbfa] text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:shadow-[2px_2px_0px_#059669] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Cloudflare Turnstile: token dikirim ke Supabase Auth sebagai captchaToken */}
            {turnstileEnabled && (
              <div>
                <TurnstileWidget
                  ref={turnstileRef}
                  siteKey={TURNSTILE_SITE_KEY}
                  action="login"
                  onToken={setTurnstileToken}
                  onError={setErrorMessage}
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-3 px-4 rounded-2xl bg-[#6ee7b7] hover:bg-[#34d399] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#1e293b] border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] font-black text-slate-950 text-xs sm:text-sm flex items-center justify-center gap-2 transition-all mt-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </span>
              ) : (
                <>
                  <span>Masuk ke Ruang Guru</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Mode Simulasi: lokal, tanpa login, tidak tersambung ke Supabase */}
          <div className="mt-5 pt-4 border-t-2 border-slate-100 space-y-2">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider font-mono">
              Atau Coba Tanpa Akun:
            </p>

            <button
              type="button"
              onClick={onDemoLogin}
              className="w-full p-2.5 rounded-2xl bg-[#e0f2fe] hover:bg-[#bae6fd] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-left transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-4 h-4 text-sky-800 shrink-0" />
                <div>
                  <span className="text-[11px] font-black text-sky-950 block">
                    Mode Simulasi (Tanpa Supabase)
                  </span>
                  <span className="text-[10px] text-sky-800 font-medium">
                    Data contoh lokal di peramban ini, tidak terhubung ke server
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold bg-sky-900 text-white px-2 py-0.5 rounded-lg shrink-0">
                Data Contoh
              </span>
            </button>
          </div>
        </div>

        {/* Security & Credit Footer */}
        <div className="mt-4 text-center space-y-1 text-slate-500 text-[11px]">
          <div className="inline-flex items-center gap-1.5 font-medium text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {turnstileEnabled
                ? 'Dilindungi Cloudflare Turnstile & Row Level Security Supabase'
                : 'Terproteksi Row Level Security Supabase Cloud'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            Aplikasi Dikembangkan oleh <strong className="text-slate-700">@hndx07</strong> • Kurikulum Merdeka
          </p>
        </div>
      </div>
    </div>
  );
};
