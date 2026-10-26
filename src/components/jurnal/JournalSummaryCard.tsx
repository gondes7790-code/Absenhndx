import React from 'react';
import { ClassRoom, JournalEntry } from '../../types';

interface JournalSummaryCardsProps {
  filteredJournals: JournalEntry[];
  classes: ClassRoom[];
}

export const JournalSummaryCards: React.FC<JournalSummaryCardsProps> = ({ filteredJournals, classes }) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t-2 border-slate-100">
      <div className="bg-[#faf7ee] rounded-2xl p-3 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b]">
        <span className="text-[10px] font-mono font-black text-slate-700 uppercase tracking-wider">
          TOTAL AGENDA
        </span>
        <p className="text-2xl font-black text-slate-950 font-mono mt-0.5">
          {filteredJournals.length}
        </p>
        <span className="text-[10px] font-bold text-slate-500">pertemuan KBM</span>
      </div>

      <div className="bg-[#e0f2fe] rounded-2xl p-3 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b]">
        <span className="text-[10px] font-mono font-black text-sky-950 uppercase tracking-wider">
          KELAS TERPANTAU
        </span>
        <p className="text-2xl font-black text-slate-950 font-mono mt-0.5">
          {classes.length}
        </p>
        <span className="text-[10px] font-bold text-sky-800">kelas binaan</span>
      </div>

      <div className="bg-[#dcfce7] rounded-2xl p-3 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b]">
        <span className="text-[10px] font-mono font-black text-emerald-950 uppercase tracking-wider">
          SINKRONISASI PRESENSI
        </span>
        <p className="text-2xl font-black text-emerald-950 font-mono mt-0.5">
          100%
        </p>
        <span className="text-[10px] font-bold text-emerald-800">terkoneksi otomatis</span>
      </div>

      <div className="bg-[#ffedd5] rounded-2xl p-3 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b]">
        <span className="text-[10px] font-mono font-black text-orange-950 uppercase tracking-wider">
          EDIT MANUAL
        </span>
        <p className="text-base font-black text-slate-950 mt-1 truncate">
          Tersedia Lengkap
        </p>
        <span className="text-[10px] font-bold text-orange-800">Akses Edit Bebas</span>
      </div>
    </div>
);
