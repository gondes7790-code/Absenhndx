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
  Flame,
} from 'lucide-react';
import { ActiveTab, ClassRoom, TeacherProfile } from '../types';
import { APP_LOGO_URL } from '../utils/printConfig';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  activeClass?: ClassRoom | null;
  onSwitchClass: () => void;
  onOpenClassManagement?: () => void;
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
  onOpenClassManagement,
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
          <div className="h-10 sm:h-11 rounded-2xl bg-white border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center justify-center shrink-0 p-1 overflow-hidden">
            <img
              src={APP_LOGO_URL}
              alt="Logo Hadir!"
              className="h-full w-auto max-w-[200px] object-contain"
            />
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
                {activeClass?.nama || 'Belum Ada Rombel'}
              </p>
              <p className="text-[11px] font-bold text-slate-600 mt-0.5">
                {activeClass
                  ? `${activeClass.mapel} • KKM: ${activeClass.kkm}`
                  : 'Belum ada kelas dipilih'}
              </p>
            </div>

            <div className="flex flex-col gap-1.5 shrink-0">
              <button
                onClick={activeClass ? onSwitchClass : onOpenClassManagement}
                className="px-3 py-1 rounded-xl bg-white hover:bg-slate-50 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#1e293b] text-xs font-black text-slate-900 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer transition-all"
              >
                {activeClass ? 'Ganti Kelas' : '+ Buat Kelas'}
              </button>
              {onOpenClassManagement && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenClassManagement();
                  }}
                  className="px-3 py-1 rounded-xl bg-[#6ee7b7] hover:bg-[#34d399] border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#1e293b] text-[11px] font-black text-slate-950 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer transition-all"
                >
                  + Kelola Rombel
                </button>
              )}
            </div>
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

          {/* Cloud Actions Strip (Tanpa Bilah Skema Supabase RLS) */}
          <div className="pt-3 border-t-2 border-slate-200 space-y-2">
            <button
              onClick={() => {
                onRefreshData();
                onClose();
              }}
              className="w-full py-2 px-3 rounded-2xl bg-white hover:bg-[#faf7ee] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-slate-900 text-xs font-black flex items-center justify-center gap-2 transition-all active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-800" />
              <span>Refresh Data Cloud</span>
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

        {/* Footer: Pusat Tombol Navigasi Profil Guru & Keluar Akun (Tanpa Tombol Duplikat) */}
        <div className="p-3.5 bg-[#ffffff] border-t-2 border-slate-900">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onSelectTab('profil');
                onClose();
              }}
              className="flex-1 p-2.5 rounded-2xl bg-[#ecfccb] hover:bg-[#d9f99d] active:translate-x-[1px] active:translate-y-[1px] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center gap-2.5 transition-all cursor-pointer min-w-0"
              title="Pusat Navigasi Profil Guru"
            >
              <div className="w-9 h-9 rounded-xl bg-white border-2 border-slate-900 text-lime-950 font-black flex items-center justify-center text-xs shrink-0 shadow-[1px_1px_0px_#1e293b]">
                <User className="w-4 h-4 text-lime-900" />
              </div>
              <div className="min-w-0 text-left flex-1">
                <p className="text-xs font-black text-slate-900 truncate leading-tight">
                  {teacher.name}
                </p>
                <p className="text-[10px] text-slate-600 font-medium truncate mt-0.5">
                  Profil Pendidik • {teacher.handle}
                </p>
              </div>
            </button>

            {onLogout && (
              <button
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="p-3 rounded-2xl bg-[#fee2e2] hover:bg-[#fca5a5] active:translate-x-[1px] active:translate-y-[1px] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-rose-950 flex items-center justify-center transition-all cursor-pointer shrink-0"
                title="Keluar dari Akun Guru"
                aria-label="Keluar Akun"
              >
                <LogOut className="w-4 h-4 text-rose-900 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
