import React from 'react';
import { Sparkles, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  schoolName: string;
}

export const Footer: React.FC<FooterProps> = ({ schoolName }) => {
  return (
    <footer className="mt-12 bg-[#fffdf8] border-t-2 border-slate-900 py-8 px-4 text-slate-900">
      <div className="max-w-5xl mx-auto text-center space-y-3">
        {/* Postmodern Badge Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fef9c3] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-xs font-black text-slate-900">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>SISTEM INFORMASI PRESENSI & PENILAIAN KURIKULUM MERDEKA</span>
        </div>

        <h3 className="text-xs sm:text-sm font-black tracking-wide uppercase text-slate-900">
          © {new Date().getFullYear()} {schoolName} • FASE E & F KEJURUAN
        </h3>

        <p className="text-xs text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium">
          Didesain dengan pendekatan presisi analitik pembelajaran, deep learning ketercapaian kompetensi, serta sinkronisasi aman berbasis PostgreSQL Cloud & Row Level Security.
        </p>

        {/* Developer Credit & Tech Badges */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-700 font-bold">
            Aplikasi Dikembangkan Oleh:
          </span>
          <span className="bg-slate-900 text-[#6ee7b7] font-mono font-black px-3 py-1 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b]">
            @hndx07
          </span>
          <span className="bg-[#ede9fe] text-indigo-950 font-mono font-bold px-2.5 py-1 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
            Supabase RLS Active
          </span>
          <span className="bg-[#dcfce7] text-emerald-950 font-mono font-bold px-2.5 py-1 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b]">
            PostgreSQL 15
          </span>
        </div>
      </div>
    </footer>
  );
};
