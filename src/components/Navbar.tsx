import React, { useState } from 'react';
import {
  Menu,
  Database,
  ShieldCheck,
  ChevronDown,
  GraduationCap,
  CheckCircle2,
  User,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { ClassRoom, TeacherProfile, ActiveTab } from '../types';

interface NavbarProps {
  onOpenDrawer: () => void;
  classes: ClassRoom[];
  activeClass: ClassRoom;
  onSelectClass: (cls: ClassRoom) => void;
  onOpenSupabaseModal: () => void;
  supabaseConnected: boolean;
  schoolName: string;
  teacher?: TeacherProfile;
  activeTab?: ActiveTab;
  onSelectTab?: (tab: ActiveTab) => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDrawer,
  classes,
  activeClass,
  onSelectClass,
  onOpenSupabaseModal,
  supabaseConnected,
  schoolName,
  teacher,
  activeTab,
  onSelectTab,
  onLogout,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#ffffff] border-b-2 border-slate-900 shadow-[0_3px_0px_#1e293b]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Drawer Trigger + Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          <button
            onClick={onOpenDrawer}
            className="p-2 sm:p-2.5 rounded-2xl bg-[#fef9c3] hover:bg-[#fde047] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-slate-900 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] cursor-pointer"
            aria-label="Buka Menu Navigasi"
            title="Menu Navigasi Kurikulum Merdeka"
          >
            <Menu className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-slate-900 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* School Emblem Badge in Rounded Neobrutalist Style */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#dcfce7] border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6 text-emerald-900" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-black text-sm sm:text-base tracking-tight leading-none text-slate-900 whitespace-nowrap">
                  {schoolName}
                </span>
                <span className="hidden xs:inline-flex text-[10px] font-bold font-mono bg-[#ede9fe] text-indigo-950 border border-slate-900 px-2 py-0.5 rounded-full shadow-[1px_1px_0px_#1e293b]">
                  Kurikulum Merdeka
                </span>
                <span className="hidden md:inline-flex text-[10px] font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded-full">
                  @hndx07
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight truncate max-w-[190px] sm:max-w-xs mt-0.5">
                Presensi, Penilaian & Jurnal Pendidik
              </span>
            </div>
          </div>
        </div>

        {/* Right: Class Selector + Supabase Cloud + Profile & Logout */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Class Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
                setProfileDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl bg-[#e0f2fe] hover:bg-[#bae6fd] active:translate-x-[1px] active:translate-y-[1px] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-xs font-black text-slate-900 transition-all cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5 text-sky-900 shrink-0 hidden sm:block" />
              <span className="max-w-[100px] sm:max-w-[170px] truncate">
                {activeClass.nama}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-900 shrink-0 ml-0.5" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-slate-900 rounded-3xl shadow-[5px_5px_0px_#1e293b] border-2 border-slate-900 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-1.5 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b-2 border-slate-100 flex items-center justify-between">
                  <span>PILIH ROMBEL BELAJAR</span>
                  <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.2 rounded border border-slate-300">
                    {classes.length} KELAS
                  </span>
                </div>
                <div className="p-1.5 space-y-1">
                  {classes.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSelectClass(c);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                        c.id === activeClass.id
                          ? 'bg-[#dcfce7] border-2 border-slate-900 text-slate-950 font-black shadow-[2px_2px_0px_#1e293b]'
                          : 'hover:bg-[#faf7ee] text-slate-800 font-bold border border-transparent'
                      }`}
                    >
                      <div>
                        <p className="leading-tight">{c.nama}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">{c.mapel}</p>
                      </div>
                      {c.id === activeClass.id && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cloud Supabase Status Badge */}
          <button
            onClick={onOpenSupabaseModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl bg-[#dcfce7] hover:bg-[#bbf7d0] active:translate-x-[1px] active:translate-y-[1px] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-[11px] sm:text-xs font-black text-emerald-950 transition-all cursor-pointer group"
            title="Klik untuk melihat skema PostgreSQL & RLS Supabase"
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  supabaseConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  supabaseConnected ? 'bg-emerald-600' : 'bg-amber-600'
                }`}
              />
            </span>
            <Database className="w-3.5 h-3.5 text-emerald-900 hidden md:inline" />
            <span className="whitespace-nowrap font-black">Supabase</span>
            <span className="hidden sm:inline bg-emerald-700 text-white text-[9px] px-1.5 py-0.2 rounded font-mono">
              RLS
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-800 hidden lg:inline" />
          </button>

          {/* Teacher Profile & Logout Pill Button */}
          {teacher && onSelectTab && (
            <div className="relative">
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setDropdownOpen(false);
                }}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] transition-all cursor-pointer ${
                  activeTab === 'profil'
                    ? 'bg-[#fef9c3] font-black'
                    : 'bg-[#ede9fe] hover:bg-[#ddd6fe]'
                }`}
                title="Profil Pendidik & Keluar Akun"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] sm:text-xs font-black shrink-0">
                  {teacher.name.charAt(0)}
                </div>
                <span className="text-xs font-black text-slate-900 hidden sm:inline max-w-[90px] truncate">
                  {teacher.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-900" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white text-slate-900 rounded-3xl shadow-[5px_5px_0px_#1e293b] border-2 border-slate-900 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* Profile info preview */}
                  <div className="p-3 bg-[#faf7ee] border-2 border-slate-900 rounded-2xl mb-2">
                    <p className="text-xs font-black text-slate-900 truncate">
                      {teacher.name}
                    </p>
                    <p className="text-[10px] font-mono text-slate-600 truncate mt-0.5">
                      {teacher.email}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[9px] font-bold bg-[#dcfce7] border border-slate-900 text-emerald-950 px-2 py-0.2 rounded-md">
                        Pendidik Aktif
                      </span>
                      <span className="text-[9px] font-mono bg-slate-900 text-white px-1.5 py-0.2 rounded-md">
                        {teacher.handle}
                      </span>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        onSelectTab('profil');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-[#ede9fe] flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <User className="w-4 h-4 text-indigo-700" />
                      <span>Halaman Profil Pendidik</span>
                    </button>

                    {onLogout && (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-black text-rose-950 hover:bg-[#fee2e2] flex items-center gap-2 transition-all cursor-pointer border-t border-slate-100 mt-1 pt-2"
                      >
                        <LogOut className="w-4 h-4 text-rose-700" />
                        <span>Keluar Akun (Log Out)</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
