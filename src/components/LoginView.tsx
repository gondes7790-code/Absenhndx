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
  UserPlus,
  LogIn,
  School,
  User,
  Sparkles,
} from 'lucide-react';
import { TeacherProfile } from '../types';
import { APP_LOGO_URL } from '../utils/printConfig';
import { getSupabase } from '../lib/supabase';

interface LoginViewProps {
  onLoginSuccess: (user: { id: string; email: string }, profile?: TeacherProfile | null) => void;
  onDemoLogin: (startEmpty?: boolean) => void;
  schoolName?: string;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onDemoLogin,
  schoolName = 'Sekolah Merdeka Indonesia',
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [schoolInput, setSchoolInput] = useState(schoolName);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleStartCleanEmpty = () => {
    setErrorMessage('');
    onDemoLogin(true);
  };

  const handleStartSimulatedDemo = () => {
    setErrorMessage('');
    onDemoLogin(false);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password.trim()) {
      setErrorMessage('Harap isi email dan kata sandi Anda.');
      return;
    }

    if (authMode === 'register' && password.trim().length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return;
    }

    setIsLoading(true);
    const supabase = getSupabase();

    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password.trim(),
        });

        if (error) {
          setErrorMessage(error.message || 'Gagal masuk. Periksa email dan kata sandi Anda.');
          return;
        }

        if (data.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const loadedProfile: TeacherProfile | null = profileData
            ? {
                name: profileData.nama_lengkap || 'Pendidik Merdeka',
                email: profileData.email || cleanEmail,
                nip: profileData.nip || '',
                nuptk: '',
                school: profileData.nama_sekolah || schoolName,
                handle: '@' + (cleanEmail.split('@')[0] || 'guru'),
                phone: '',
                mapelUtama: 'Kurikulum Merdeka',
                bio: 'Pendidik Profesional Berdedikasi',
              }
            : null;

          onLoginSuccess({ id: data.user.id, email: data.user.email || cleanEmail }, loadedProfile);
        }
      } else {
        // Register new teacher account (provides 100% clean/empty database for new user)
        const nameToUse = fullName.trim() || 'Guru Pendidik';
        const schoolToUse = schoolInput.trim() || schoolName;

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password.trim(),
          options: {
            data: {
              full_name: nameToUse,
              nama_sekolah: schoolToUse,
            },
          },
        });

        if (error) {
          setErrorMessage(error.message || 'Gagal mendaftarkan akun baru.');
          return;
        }

        if (data.user) {
          const newProfile: TeacherProfile = {
            name: nameToUse,
            email: cleanEmail,
            nip: '',
            nuptk: '',
            school: schoolToUse,
            handle: '@' + (cleanEmail.split('@')[0] || 'guru').toLowerCase(),
            phone: '',
            mapelUtama: 'Kurikulum Merdeka',
            bio: 'Pendidik Profesional',
          };

          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              nama_lengkap: nameToUse,
              email: cleanEmail,
              nama_sekolah: schoolToUse,
              nip: '',
              updated_at: new Date().toISOString(),
            });
          } catch (e) {
            console.warn('[LoginView] Profile upsert issue:', e);
          }

          onLoginSuccess({ id: data.user.id, email: cleanEmail }, newProfile);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi kendala pada koneksi ke Supabase Cloud.');
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

          {/* Auth Mode Toggle Tabs (Masuk vs Daftar Baru) */}
          <div className="grid grid-cols-2 p-1 bg-[#f1f5f9] border-2 border-slate-900 rounded-2xl mb-5 shadow-[2px_2px_0px_#1e293b]">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage('');
              }}
              className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'login'
                  ? 'bg-white text-slate-950 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#1e293b]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk (Login)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMessage('');
              }}
              className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'register'
                  ? 'bg-[#dcfce7] text-emerald-950 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#1e293b]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Akun Baru</span>
            </button>
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              {authMode === 'login' ? 'Masuk ke Ruang Pendidik' : 'Pendaftaran Akun Guru Baru'}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {authMode === 'login'
                ? 'Gunakan email dan kata sandi yang telah terdaftar di Supabase'
                : 'Akun baru akan mendapatkan database kosong yang bersih dan siap diisi'}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-[#fee2e2] border-2 border-slate-900 text-xs font-bold text-rose-950 flex items-start gap-2 shadow-[2px_2px_0px_#1e293b]">
              <AlertCircle className="w-4 h-4 text-rose-800 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-xs">
            {authMode === 'register' && (
              <>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Nama Lengkap & Gelar Pendidik
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Dra. Siti Rahmawati, M. Pd."
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#fbfbfa] text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:shadow-[2px_2px_0px_#059669] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Nama Satuan Pendidikan / Sekolah
                  </label>
                  <div className="relative">
                    <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: SMA Negeri 1 Merdeka"
                      value={schoolInput}
                      onChange={(e) => setSchoolInput(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#fbfbfa] text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:shadow-[2px_2px_0px_#059669] transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Alamat Email Pendidik
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="guru@sekolah.belajar.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#fbfbfa] text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:shadow-[2px_2px_0px_#059669] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimal 6 karakter"
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
                  <span>Memproses akun...</span>
                </span>
              ) : authMode === 'login' ? (
                <>
                  <span>Masuk ke Ruang Guru</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Daftarkan Akun Baru (Data Bersih)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Offline / Demo Options */}
          <div className="mt-5 pt-4 border-t-2 border-slate-100 space-y-2">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider font-mono">
              Atau Akses Cepat Tanpa Akun Cloud:
            </p>

            <button
              type="button"
              onClick={handleStartCleanEmpty}
              className="w-full p-2.5 rounded-2xl bg-[#dcfce7] hover:bg-[#bbf7d0] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-left transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-800 shrink-0" />
                <div>
                  <span className="text-[11px] font-black text-emerald-950 block">
                    Mulai Ruang Guru Baru (Data Kosong Bersih)
                  </span>
                  <span className="text-[10px] text-emerald-800 font-medium">
                    Ruang kerja baru tanpa data dummy, siap untuk kelas Anda
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold bg-emerald-900 text-white px-2 py-0.5 rounded-lg shrink-0">
                Data Kosong
              </span>
            </button>

            <button
              type="button"
              onClick={handleStartSimulatedDemo}
              className="w-full p-2.5 rounded-2xl bg-[#e0f2fe] hover:bg-[#bae6fd] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-left transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-4 h-4 text-sky-800 shrink-0" />
                <div>
                  <span className="text-[11px] font-black text-sky-950 block">
                    Mode Simulasi Contoh (Data Uji Coba)
                  </span>
                  <span className="text-[10px] text-sky-800 font-medium">
                    Uji coba fitur lengkap dengan data simulasi pratinjau
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
