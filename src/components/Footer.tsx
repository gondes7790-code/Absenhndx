import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { APP_LOGO_URL } from '../utils/printConfig';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 bg-[#fffdf8] border-t-2 border-slate-900 py-8 px-4 text-slate-900">
      <div className="max-w-5xl mx-auto text-center space-y-3">
        {/* Postmodern Badge Pill with App Logo */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fef9c3] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-xs font-black text-slate-900">
          <img src={APP_LOGO_URL} alt="Logo" className="w-4 h-4 object-contain shrink-0" />
          <span>HADIR! • SISTEM INFORMASI PRESENSI & PENILAIAN</span>
        </div>

        <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
          Hadir!
        </h3>

        <p className="text-xs text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium">
          Sistem Informasi Presensi, Penilaian Kurikulum Merdeka, dan Manajemen Kas Terpadu.
        </p>

        {/* Developer Credit & Tech Badges with Fire */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-700 font-bold">
            Dikembangkan oleh:
          </span>
          <span className="bg-slate-900 text-[#6ee7b7] font-mono font-black px-3 py-1 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center gap-1.5">
            <span>🔥</span>
            <span>@hndx07</span>
          </span>
          <span className="bg-[#ede9fe] text-indigo-950 font-mono font-bold px-2.5 py-1 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
            Terverifikasi & Aman
          </span>
        </div>
      </div>
    </footer>
  );
};
