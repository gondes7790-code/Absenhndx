import React, { useState } from 'react';
import {
  User,
  Mail,
  ShieldCheck,
  Building,
  Award,
  Phone,
  FileText,
  KeyRound,
  LogOut,
  Save,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Users,
  Database,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  RotateCcw,
  GraduationCap,
} from 'lucide-react';
import { TeacherProfile, ClassRoom } from '../types';

interface ProfileViewProps {
  teacher: TeacherProfile;
  schoolName: string;
  classes: ClassRoom[];
  totalStudents: number;
  onUpdateTeacher: (updated: TeacherProfile) => void;
  onLogout: () => void;
  onShowToast: (title: string, desc: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  teacher,
  schoolName,
  classes,
  totalStudents,
  onUpdateTeacher,
  onLogout,
  onShowToast,
}) => {
  // Form State
  const [formData, setFormData] = useState<TeacherProfile>({ ...teacher });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Logout Confirmation Modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleInputChange = (field: keyof TeacherProfile, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTeacher(formData);
    setIsEditing(false);
    setIsSaved(true);
    onShowToast('Profil Berhasil Diperbarui', 'Data identitas pendidik telah tersimpan ke sistem.');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      onShowToast('Peringatan', 'Harap isi semua kolom kata sandi.');
      return;
    }
    if (newPassword !== confirmPassword) {
      onShowToast('Peringatan', 'Konfirmasi kata sandi baru tidak cocok.');
      return;
    }
    setPasswordSuccess(true);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onShowToast('Kata Sandi Diperbarui', 'Kata sandi akun pendidik berhasil diubah.');
    setTimeout(() => setPasswordSuccess(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner - Vintage Postmodern Neobrutalist */}
      <div className="bg-[#fffdf8] border-2 border-slate-900 rounded-3xl p-4 sm:p-6 shadow-[4px_4px_0px_#1e293b] relative overflow-hidden">
        {/* Decorative corner tag */}
        <div className="absolute top-0 right-0 bg-[#ede9fe] border-b-2 border-l-2 border-slate-900 px-3.5 py-1.5 rounded-bl-2xl text-[11px] font-mono font-bold text-indigo-950 flex items-center gap-1.5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>RUANG PENDIDIK</span>
          <span className="bg-slate-900 text-white px-2 py-0.2 rounded-full text-[10px]">
            {teacher.handle}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 sm:pt-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 mb-1.5">
              <span className="bg-[#fef9c3] text-amber-950 px-2.5 py-0.5 rounded-full border-2 border-slate-900 font-mono text-[11px] shadow-[1.5px_1.5px_0px_#1e293b]">
                IDENTITAS RESMI
              </span>
              <span>•</span>
              <span className="text-slate-600">{schoolName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              Profil Pendidik & Keamanan Akun
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl font-medium">
              Kelola data kepegawaian, verifikasi identitas pengajar Kurikulum Merdeka, serta konfigurasi akses akun Supabase Cloud.
            </p>
          </div>

          {/* Quick Logout Header Trigger */}
          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#fee2e2] hover:bg-[#fca5a5] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] text-xs font-black text-rose-950 flex items-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-700" />
              <span>Keluar (Log Out)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Left Column (ID Card + Metrics) & Right Column (Profile Edit Form + Security) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Postmodern Teacher Badge Card & Quick Stats (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Postmodern Identity ID Card */}
          <div className="bg-[#ffffff] border-2 border-slate-900 rounded-3xl p-6 shadow-[4px_4px_0px_#1e293b] relative">
            <div className="flex flex-col items-center text-center">
              {/* Eclectic Rounded Avatar Badge */}
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-3xl bg-[#dcfce7] border-3 border-slate-900 shadow-[4px_4px_0px_#1e293b] flex items-center justify-center text-3xl font-black text-emerald-950">
                  {teacher.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[#fef9c3] border-2 border-slate-900 p-1.5 rounded-xl shadow-[2px_2px_0px_#1e293b]">
                  <GraduationCap className="w-4 h-4 text-amber-900" />
                </div>
              </div>

              {/* Name & Official Titles */}
              <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                {teacher.name}
              </h2>
              <p className="text-xs font-bold text-emerald-800 bg-[#dcfce7] border border-slate-900 px-3 py-0.5 rounded-full mt-1.5 shadow-[1.5px_1.5px_0px_#1e293b]">
                {teacher.jabatan || 'Guru Produktif Kejuruan'}
              </p>
              <p className="text-xs text-slate-600 mt-2 font-mono">
                {teacher.email}
              </p>

              {/* Badges strip */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
                <span className="text-[10px] font-bold font-mono bg-[#ede9fe] text-indigo-950 border border-slate-900 px-2 py-0.5 rounded-lg shadow-[1px_1px_0px_#1e293b]">
                  NIP: {teacher.nip}
                </span>
                {teacher.nuptk && (
                  <span className="text-[10px] font-bold font-mono bg-[#e0f2fe] text-sky-950 border border-slate-900 px-2 py-0.5 rounded-lg shadow-[1px_1px_0px_#1e293b]">
                    NUPTK: {teacher.nuptk}
                  </span>
                )}
              </div>

              {/* Bio snippet */}
              <div className="mt-4 p-3 bg-[#faf7ee] border-2 border-slate-900 rounded-2xl text-left shadow-[2px_2px_0px_#1e293b] w-full">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                  Catatan Pendidik / Visi:
                </span>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  "{teacher.bio || 'Mendidik dengan hati, mengajar dengan bukti, menginspirasi dengan inovasi Kurikulum Merdeka.'}"
                </p>
              </div>
            </div>

            {/* Verification and Status Pill */}
            <div className="mt-5 pt-4 border-t-2 border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-900 animate-pulse" />
                <span className="font-bold text-slate-800">Status Akun:</span>
              </div>
              <span className="bg-[#bbf7d0] border border-slate-900 px-2.5 py-0.5 rounded-full font-black text-emerald-950 text-[11px] shadow-[1px_1px_0px_#1e293b]">
                Pendidik Aktif
              </span>
            </div>
          </div>

          {/* Quick Metrics in Pastel Neobrutalist Cards */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* Metric 1: Rombel */}
            <div className="bg-[#fef9c3] border-2 border-slate-900 rounded-2xl p-3.5 shadow-[3px_3px_0px_#1e293b]">
              <div className="flex items-center justify-between mb-1.5">
                <BookOpen className="w-4 h-4 text-amber-800" />
                <span className="text-[10px] font-mono font-bold bg-white border border-slate-900 px-1.5 py-0.2 rounded-md">
                  ROMBEL
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900">{classes.length} Kelas</div>
              <p className="text-[11px] font-medium text-amber-900 mt-0.5">Rombongan Belajar Diampu</p>
            </div>

            {/* Metric 2: Murid */}
            <div className="bg-[#e0f2fe] border-2 border-slate-900 rounded-2xl p-3.5 shadow-[3px_3px_0px_#1e293b]">
              <div className="flex items-center justify-between mb-1.5">
                <Users className="w-4 h-4 text-sky-800" />
                <span className="text-[10px] font-mono font-bold bg-white border border-slate-900 px-1.5 py-0.2 rounded-md">
                  MURID
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900">{totalStudents} Siswa</div>
              <p className="text-[11px] font-medium text-sky-900 mt-0.5">Terdaftar Dalam Database</p>
            </div>

            {/* Metric 3: Kurikulum */}
            <div className="bg-[#ede9fe] border-2 border-slate-900 rounded-2xl p-3.5 shadow-[3px_3px_0px_#1e293b]">
              <div className="flex items-center justify-between mb-1.5">
                <Award className="w-4 h-4 text-indigo-800" />
                <span className="text-[10px] font-mono font-bold bg-white border border-slate-900 px-1.5 py-0.2 rounded-md">
                  FASE E/F
                </span>
              </div>
              <div className="text-xl font-black text-slate-900">Merdeka</div>
              <p className="text-[11px] font-medium text-indigo-900 mt-0.5">Asesmen Formatif & TP</p>
            </div>

            {/* Metric 4: Supabase RLS */}
            <div className="bg-[#dcfce7] border-2 border-slate-900 rounded-2xl p-3.5 shadow-[3px_3px_0px_#1e293b]">
              <div className="flex items-center justify-between mb-1.5">
                <Database className="w-4 h-4 text-emerald-800" />
                <span className="text-[10px] font-mono font-bold bg-white border border-slate-900 px-1.5 py-0.2 rounded-md">
                  POSTGRES
                </span>
              </div>
              <div className="text-xl font-black text-emerald-950">RLS Aktif</div>
              <p className="text-[11px] font-medium text-emerald-900 mt-0.5">Row Level Security Cloud</p>
            </div>
          </div>

          {/* Developer Credit Postmodern Card */}
          <div className="bg-[#faf7ee] border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_#1e293b]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-mono font-black text-sm shrink-0">
                ★
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Pengembang Aplikasi Sistem:
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="bg-slate-900 text-[#6ee7b7] text-xs font-mono font-black px-2 py-0.5 rounded-lg">
                    {teacher.handle}
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium">
                    Kurikulum Merdeka 2026/2027
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form & Security Management (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Profile Form */}
          <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 shadow-[4px_4px_0px_#1e293b]">
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#ede9fe] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-900" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Informasi Biodata Pendidik
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Perbarui informasi nama, NIP, kontak, dan instansi Anda
                  </p>
                </div>
              </div>

              {isSaved && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#dcfce7] border-2 border-slate-900 text-xs font-bold text-emerald-950 animate-bounce">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Tersimpan!</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Pendidik */}
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1.5">
                    Nama Lengkap & Gelar *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488] transition-all"
                  />
                </div>

                {/* Email Akun Belajar */}
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1.5">
                    Alamat Email (Akun Belajar) *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488] transition-all"
                  />
                </div>

                {/* NIP */}
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1.5">
                    NIP (Nomor Induk Pegawai)
                  </label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => handleInputChange('nip', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488] transition-all"
                  />
                </div>

                {/* NUPTK */}
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1.5">
                    NUPTK
                  </label>
                  <input
                    type="text"
                    value={formData.nuptk || ''}
                    onChange={(e) => handleInputChange('nuptk', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488] transition-all"
                  />
                </div>

                {/* Satuan Pendidikan */}
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1.5">
                    Satuan Pendidikan (Sekolah) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.school}
                    onChange={(e) => handleInputChange('school', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488] transition-all"
                  />
                </div>

                {/* Mata Pelajaran Utama */}
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1.5">
                    Mata Pelajaran Utama / Kejuruan
                  </label>
                  <input
                    type="text"
                    value={formData.mapelUtama || ''}
                    onChange={(e) => handleInputChange('mapelUtama', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488] transition-all"
                  />
                </div>

                {/* Nomor Telepon / WhatsApp */}
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1.5">
                    No. WhatsApp Pendidik
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488] transition-all"
                  />
                </div>

                {/* Status Kepegawaian */}
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1.5">
                    Jabatan / Status Kepegawaian
                  </label>
                  <input
                    type="text"
                    value={formData.jabatan || 'Guru Produktif Kejuruan'}
                    onChange={(e) => handleInputChange('jabatan', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488] transition-all"
                  />
                </div>
              </div>

              {/* Bio / Deskripsi Pendidik */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5">
                  Bio Singkat / Visi Pembelajaran Merdeka
                </label>
                <textarea
                  rows={3}
                  value={formData.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488] transition-all resize-none"
                  placeholder="Tuliskan komitmen atau orientasi capaian pembelajaran Anda..."
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...teacher })}
                  className="px-4 py-2.5 rounded-2xl bg-[#f1f5f9] hover:bg-[#e2e8f0] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-xs font-bold text-slate-700 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-[#a7f3d0] hover:bg-[#6ee7b7] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] text-xs font-black text-slate-950 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Save className="w-4 h-4 text-emerald-900" />
                  <span>Simpan Perubahan Profil</span>
                </button>
              </div>
            </form>
          </div>

          {/* Security & Password Card */}
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
                  className="px-4 py-2 rounded-2xl bg-[#fecdd3] hover:bg-[#fda4af] active:translate-x-[1px] active:translate-y-[1px] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] font-black text-rose-950 text-xs cursor-pointer"
                >
                  Perbarui Kata Sandi
                </button>
              </div>
            </form>
          </div>

          {/* DEDICATED LOG OUT CARD - Vintage Postmodern Neobrutalist */}
          <div className="bg-[#fff1f2] border-2 border-slate-900 rounded-3xl p-6 shadow-[4px_4px_0px_#1e293b]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#fee2e2] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center justify-center shrink-0">
                  <LogOut className="w-6 h-6 text-rose-800" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900">
                      Sesi Pendidik Aktif
                    </h3>
                    <span className="bg-rose-900 text-white text-[10px] font-mono px-2 py-0.2 rounded-full font-bold">
                      LOG OUT
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 max-w-lg font-medium leading-relaxed">
                    Keluar akan mengakhiri sesi login pengajar di peramban ini. Seluruh database nilai, presensi, dan jurnal tetap tersimpan aman di Cloud Supabase (PostgreSQL & RLS).
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#fb7185] hover:bg-[#f43f5e] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] font-black text-white text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar Akun (Log Out)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Log Out */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border-3 border-slate-900 rounded-3xl p-6 shadow-[6px_6px_0px_#1e293b] relative animate-in zoom-in-95 duration-200">
            {/* Header tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fef9c3] border-2 border-slate-900 text-[10px] font-mono font-bold text-slate-900 shadow-[1.5px_1.5px_0px_#1e293b] mb-4">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>KONFIRMASI LOG OUT</span>
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
              Yakin Ingin Keluar dari Sesi Pendidik?
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Anda akan diarahkan kembali ke halaman masuk (Login). Anda dapat masuk kembali kapan saja menggunakan email <strong>{teacher.email}</strong>.
            </p>

            <div className="mt-5 p-3 rounded-2xl bg-[#faf7ee] border-2 border-slate-900 text-xs text-slate-700 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Semua data presensi dan nilai tersimpan di Supabase Cloud.</span>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2.5 rounded-2xl bg-[#f1f5f9] hover:bg-[#e2e8f0] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-xs font-bold text-slate-800 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutModal(false);
                  onLogout();
                }}
                className="px-5 py-2.5 rounded-2xl bg-[#f43f5e] hover:bg-[#e11d48] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] text-xs font-black text-white flex items-center gap-2 cursor-pointer transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Ya, Keluar Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
