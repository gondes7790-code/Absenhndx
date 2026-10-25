import React, { useState } from 'react';
import {
  Menu,
  ChevronDown,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';
import { ClassRoom } from '../types';
import { HEADER_LOGO_URL } from '../utils/printConfig';

interface NavbarProps {
  onOpenDrawer: () => void;
  classes: ClassRoom[];
  activeClass?: ClassRoom | null;
  onSelectClass: (cls: ClassRoom) => void;
  onOpenClassManagement?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDrawer,
  classes,
  activeClass,
  onSelectClass,
  onOpenClassManagement,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#ffffff] border-b-2 border-slate-900 shadow-[0_3px_0px_#1e293b]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Drawer Trigger + Brand "Hadir!" */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            onClick={onOpenDrawer}
            className="p-2 sm:p-2.5 rounded-2xl bg-[#fef9c3] hover:bg-[#fde047] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-slate-900 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] cursor-pointer"
            aria-label="Buka Menu Navigasi"
            title="Buka Menu"
          >
            <Menu className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-slate-900 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-2.5">
            {/* Header Application Logo — polos, tanpa frame */}
            <img
              src={HEADER_LOGO_URL}
              alt="Logo Hadir!"
              className="h-10 sm:h-11 w-auto max-w-[96px] sm:max-w-[140px] object-contain shrink-0"
            />

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-xl tracking-tight leading-none text-slate-900">
                  Hadir!
                </span>
                <span className="text-[10px] font-mono font-bold bg-[#ede9fe] text-indigo-950 border border-slate-900 px-2 py-0.2 rounded-full shadow-[1px_1px_0px_#1e293b] hidden xs:inline-flex">
                  Kurikulum Merdeka
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium leading-tight truncate max-w-[150px] sm:max-w-none">
                Presensi & Penilaian Murid
              </span>
            </div>
          </div>
        </div>

        {/* Right: HANYA BILAH PEMILIH KELAS */}
        <div className="relative shrink-0">
          <button
            onClick={() => {
              if (classes.length === 0 && onOpenClassManagement) {
                onOpenClassManagement();
              } else {
                setDropdownOpen(!dropdownOpen);
              }
            }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl bg-[#e0f2fe] hover:bg-[#bae6fd] active:translate-x-[1px] active:translate-y-[1px] border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] text-xs sm:text-sm font-black text-slate-900 transition-all cursor-pointer"
            title="Ganti Kelas Aktif"
          >
            <GraduationCap className="w-4 h-4 text-sky-900 shrink-0 hidden sm:block" />
            <span className="max-w-[130px] sm:max-w-[200px] truncate">
              {activeClass?.nama || (classes.length > 0 ? 'Pilih Kelas' : '+ Buat Rombel')}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-900 shrink-0 ml-0.5" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white text-slate-900 rounded-3xl shadow-[5px_5px_0px_#1e293b] border-2 border-slate-900 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-1.5 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b-2 border-slate-100 flex items-center justify-between">
                <span>PILIH KELAS</span>
                <span className="text-[10px] font-mono bg-[#fef9c3] border border-slate-900 px-1.5 py-0.2 rounded font-bold">
                  {classes.length} ROMBEL
                </span>
              </div>
              <div className="p-1.5 space-y-1">
                {classes.length === 0 ? (
                  <div className="py-4 px-3 text-center text-xs text-slate-500 font-medium">
                    Belum ada rombel terdaftar.
                  </div>
                ) : (
                  classes.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSelectClass(c);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                        c.id === activeClass?.id
                          ? 'bg-[#dcfce7] border-2 border-slate-900 text-slate-950 font-black shadow-[2px_2px_0px_#1e293b]'
                          : 'hover:bg-[#faf7ee] text-slate-800 font-bold border border-transparent'
                      }`}
                    >
                      <div>
                        <p className="leading-tight">{c.nama}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">{c.mapel}</p>
                      </div>
                      {c.id === activeClass?.id && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
              {onOpenClassManagement && (
                <div className="pt-1.5 mt-1 border-t-2 border-slate-100 px-1.5">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenClassManagement();
                    }}
                    className="w-full py-1.5 px-3 rounded-xl bg-[#6ee7b7] hover:bg-[#34d399] border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#1e293b] text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span>+ Kelola & Tambah Rombel</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
