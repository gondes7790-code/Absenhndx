import React from 'react';
import {
  X,
  CalendarCheck,
  FileSpreadsheet,
  Award,
  Users,
  BookOpen,
  Wallet,
  BarChart3,
  BrainCircuit,
  Database,
  RefreshCw,
  Download,
  GraduationCap,
  LogOut,
  User,
  Sparkles,
} from 'lucide-react';
import { ActiveTab, ClassRoom, TeacherProfile } from '../types';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  activeClass: ClassRoom;
  onSwitchClass: () => void;
  onRefreshData: () => void;
  onDownloadBackup: () => void;
  teacher: TeacherProfile;
  schoolName: string;
  onLogout?: () => void;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  activeClass,
  onSwitchClass,
  onRefreshData,
  onDownloadBackup,
  teacher,
  schoolName,
  onLogout,
}) => {
  if (!isOpen) return null;

  const menuItems: {
    id: ActiveTab;
    label: string;
    sub: string;
    icon: React.ReactNode;
    pastelBg: string;
    hoverBg: string;
  }[] = [
    {
      id: 'presensi',
      label: 'Presensi Murid',
      sub: 'Input kehadiran harian & WhatsApp',
      icon: <CalendarCheck className="w-5 h-5 text-emerald-800" />,
      pastelBg: 'bg-[#dcfce7]',
      hoverBg: 'hover:bg-[#bbf7d0]',
    },
    {
      id: 'rekap',
      label: 'Rekap Absensi',
      sub: 'Rekap bulanan, cetak & Excel',
      icon: <FileSpreadsheet className="w-5 h-5 text-sky-800" />,
      pastelBg: 'bg-[#e0f2fe]',
      hoverBg: 'hover:bg-[#bae6fd]',
    },
    {
      id: 'penilaian',
      label: 'Penilaian & KKM',
      sub: 'Asesmen formatif & sumatif Merdeka',
      icon: <Award className="w-5 h-5 text-amber-800" />,
      pastelBg: 'bg-[#fef9c3]',
      hoverBg: 'hover:bg-[#fde047]',
    },
    {
      id: 'murid',
      label: 'Data Murid',
      sub: 'Kelola NISN & impor/ekspor data',
      icon: <Users className="w-5 h-5 text-orange-800" />,
      pastelBg: 'bg-[#ffedd5]',
      hoverBg: 'hover:bg-[#fed7aa]',
    },
    {
      id: 'jurnal',
      label: 'Buku Jurnal Pendidik',
      sub: 'Catatan agenda kegiatan KBM',
      icon: <BookOpen className="w-5 h-5 text-indigo-800" />,
      pastelBg: 'bg-[#ede9fe]',
      hoverBg: 'hover:bg-[#ddd6fe]',
    },
    {
      id: 'keuangan',
      label: 'Tabungan & Kas',
      sub: 'Buku kas & tabungan mandiri',
      icon: <Wallet className="w-5 h-5 text-rose-800" />,
      pastelBg: 'bg-[#ffe4e6]',
      hoverBg: 'hover:bg-[#fecdd3]',
    },
    {
      id: 'statistik',
      label: 'Statistik & Analisis',
      sub: 'Ketercapaian TP & distribusi nilai',
      icon: <BarChart3 className="w-5 h-5 text-teal-800" />,
      pastelBg: 'bg-[#ccfbf1]',
      hoverBg: 'hover:bg-[#99f6e4]',
    },
    {
      id: 'deeplearning',
      label: 'Analisis AI & Deep Learning',
      sub: 'Prediksi risiko dropout & narasi rapor',
      icon: <BrainCircuit className="w-5 h-5 text-purple-800" />,
      pastelBg: 'bg-[#f3e8ff]',
      hoverBg: 'hover:bg-[#e9d5ff]',
    },
    {
      id: 'profil',
      label: 'Profil Pendidik & Akun',
      sub: 'Kelola identitas guru & status login',
      icon: <User className="w-5 h-5 text-lime-900" />,
      pastelBg: 'bg-[#ecfccb]',
      hoverBg: 'hover:bg-[#d9f99d]',
    },
    {
      id: 'supabase',
      label: 'Skema Supabase & RLS',
      sub: 'PostgreSQL Cloud & Row Level Security',
      icon: <Database className="w-5 h-5 text-emerald-900" />,
      pastelBg: 'bg-[#d1fae5]',
      hoverBg: 'hover:bg-[#a7f3d0]',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-[#faf7ee] text-slate-900 h-full flex flex-col z-10 border-r-3 border-slate-900 shadow-[8px_0px_0px_#1e293b] overflow-hidden">
        {/* Header Drawer */}
        <div className="p-4 sm:p-5 bg-[#ffffff] border-b-2 border-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#dcfce7] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6 text-emerald-900" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-black text-slate-900 tracking-tight leading-none">
                  {schoolName}
                </h2>
              </div>
              <p className="text-[11px] font-bold text-slate-500 mt-1 flex items-center gap-1">
                <span>Ruang Pendidik</span>
                <span className="bg-[#ede9fe] border border-slate-900 text-indigo-950 text-[9px] font-mono px-1.5 py-0.2 rounded-md">
                  Kurikulum Merdeka
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-[#fee2e2] hover:bg-[#fca5a5] active:translate-x-[1px] active:translate-y-[1px] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-rose-900 transition-all cursor-pointer"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Active Class Switcher Card */}
        <div className="p-3.5 bg-[#fffdf8] border-b-2 border-slate-900">
          <div className="p-3 rounded-2xl bg-[#e0f2fe] border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-black uppercase text-sky-900 tracking-wider block">
                ROMBEL AKTIF SAAT INI
              </span>
              <p className="text-sm font-black text-slate-900 mt-0.5 leading-tight">
                {activeClass.nama}
              </p>
              <p className="text-[11px] font-bold text-slate-600 mt-0.5">
                {activeClass.mapel} • KKM: {activeClass.kkm}
              </p>
            </div>

            <button
              onClick={onSwitchClass}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-xs font-black text-slate-900 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer shrink-0 transition-all"
            >
              Ganti Kelas
            </button>
          </div>
        </div>

        {/* Menu Items List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2">
          <div className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-500 px-1 mb-1">
            NAVIGASI MODUL UTAMA
          </div>

          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full text-left p-2.5 sm:p-3 rounded-2xl border-2 border-slate-900 transition-all flex items-center gap-3 cursor-pointer ${
                  isActive
                    ? `${item.pastelBg} font-black shadow-[3px_3px_0px_#1e293b] translate-x-1`
                    : `bg-white ${item.hoverBg} text-slate-800 font-bold shadow-[2px_2px_0px_#1e293b]`
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl border-2 border-slate-900 flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-white shadow-[1px_1px_0px_#1e293b]' : item.pastelBg
                  }`}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black leading-tight text-slate-900">
                    {item.label}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5 font-medium">
                    {item.sub}
                  </p>
                </div>
                {isActive && (
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900 shrink-0" />
                )}
              </button>
            );
          })}

          {/* Supabase & Cloud Actions Strip */}
          <div className="pt-3 border-t-2 border-slate-200 space-y-2">
            <div className="p-3 rounded-2xl bg-[#dcfce7] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
                </span>
                <div>
                  <p className="text-xs font-black text-emerald-950">Cloud Supabase Aktif</p>
                  <p className="text-[10px] font-medium text-emerald-800">PostgreSQL & RLS Proteksi</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-white border border-slate-900 text-emerald-950 px-2 py-0.5 rounded-md shadow-[1px_1px_0px_#1e293b]">
                ONLINE
              </span>
            </div>

            <button
              onClick={() => {
                onRefreshData();
                onClose();
              }}
              className="w-full py-2 px-3 rounded-2xl bg-white hover:bg-[#faf7ee] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-slate-900 text-xs font-black flex items-center justify-center gap-2 transition-all active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-800" />
              <span>Refresh Data dari Supabase</span>
            </button>

            <button
              onClick={() => {
                onDownloadBackup();
                onClose();
              }}
              className="w-full py-2 px-3 rounded-2xl bg-white hover:bg-[#faf7ee] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-slate-900 text-xs font-bold flex items-center justify-center gap-2 transition-all active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-800" />
              <span>Download Backup Data (JSON)</span>
            </button>
          </div>
        </div>

        {/* Footer Profile & Logout Area */}
        <div className="p-3.5 bg-[#ffffff] border-t-2 border-slate-900">
          <div className="p-3 rounded-2xl bg-[#faf7ee] border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] flex items-center justify-between gap-2 mb-2">
            <button
              onClick={() => {
                onSelectTab('profil');
                onClose();
              }}
              className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-80 transition-opacity cursor-pointer flex-1"
              title="Buka Halaman Profil"
            >
              <div className="w-9 h-9 rounded-xl bg-[#ede9fe] border-2 border-slate-900 text-indigo-950 font-black flex items-center justify-center text-xs shrink-0 shadow-[1.5px_1.5px_0px_#1e293b]">
                {teacher.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-900 truncate leading-tight">
                  {teacher.name}
                </p>
                <p className="text-[10px] text-slate-500 font-mono truncate">
                  {teacher.email}
                </p>
              </div>
            </button>

            <span className="text-[10px] font-mono font-bold bg-slate-900 text-white px-2 py-1 rounded-lg shrink-0">
              {teacher.handle}
            </span>
          </div>

          {/* Quick Buttons: Profil Saya & Log Out */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onSelectTab('profil');
                onClose();
              }}
              className="py-2 px-2.5 rounded-xl bg-[#ecfccb] hover:bg-[#d9f99d] active:translate-x-[1px] active:translate-y-[1px] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-[11px] font-black text-lime-950 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-lime-900" />
              <span>Profil Guru</span>
            </button>

            {onLogout && (
              <button
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="py-2 px-2.5 rounded-xl bg-[#fee2e2] hover:bg-[#fca5a5] active:translate-x-[1px] active:translate-y-[1px] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-[11px] font-black text-rose-950 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-800" />
                <span>Keluar Akun</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
