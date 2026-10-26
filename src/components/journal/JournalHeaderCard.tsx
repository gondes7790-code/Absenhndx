import React from 'react';
import { Cloud, FileSpreadsheet, Flame, Plus, Printer, RefreshCw } from 'lucide-react';

interface JournalHeaderCardProps {
  schoolName: string;
  filterClass: string;
  onSaveToCloud: () => void;
  onSyncAttendance?: () => void;
  onCreate: () => void;
  onExportCsv: () => void;
  onPrint: () => void;
  /** Kartu ringkasan & filter ditampilkan di dalam kartu header. */
  children?: React.ReactNode;
}

export const JournalHeaderCard: React.FC<JournalHeaderCardProps> = ({
  schoolName,
  filterClass,
  onSaveToCloud,
  onSyncAttendance,
  onCreate,
  onExportCsv,
  onPrint,
  children,
}) => (
  <div className="bg-[#fffdf8] rounded-3xl p-4 sm:p-6 border-2 border-slate-900 shadow-[4px_4px_0px_#1e293b] relative overflow-hidden">
    {/* Retro Corner Stamp with Fire */}
    <div className="absolute top-0 right-0 bg-[#ede9fe] border-b-2 border-l-2 border-slate-900 px-3 py-1 rounded-bl-2xl text-[10px] font-mono font-bold text-indigo-950 flex items-center gap-1 shadow-xs">
      <Flame className="w-3 h-3 text-orange-600 fill-orange-500" />
      <span>AGENDA MENGAJAR</span>
    </div>

    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 sm:pt-0">
      <div>
        <div className="flex items-center gap-2 text-xs font-black text-slate-600 mb-1.5 flex-wrap">
          <span className="bg-[#fef9c3] text-amber-950 px-2.5 py-0.5 rounded-full border-2 border-slate-900 font-mono text-[11px] shadow-[1.5px_1.5px_0px_#1e293b]">
            {filterClass === 'Semua' ? 'Semua Rombel' : filterClass}
          </span>
          <span>•</span>
          <span className="font-bold text-slate-700">T.A. 2026/2027 (Ganjil)</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Buku Jurnal / Agenda Mengajar Pendidik
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
          Pencatatan tatap muka, materi TP Kurikulum Merdeka, dan dinamika kelas {schoolName}
        </p>
      </div>

      {/* Action Button Strip */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        {onSyncAttendance && (
          <button
            onClick={onSyncAttendance}
            className="px-3.5 py-2 rounded-2xl bg-[#ccfbf1] hover:bg-[#99f6e4] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-teal-950 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer"
            title="Sinkronkan catatan kehadiran dari buku presensi"
          >
            <RefreshCw className="w-4 h-4 text-teal-900" />
            <span>Sinkronkan Presensi</span>
          </button>
        )}

        <button
          onClick={() => onPrint()}
          className="px-3.5 py-2 rounded-2xl bg-[#fee2e2] hover:bg-[#fca5a5] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-rose-950 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer"
          title="Cetak Kertas Agenda Formal A4 Putih"
        >
          <Printer className="w-4 h-4 text-rose-900" />
          <span>Kertas Cetak</span>
        </button>

        <button
          onClick={onExportCsv}
          className="px-3.5 py-2 rounded-2xl bg-[#fef9c3] hover:bg-[#fde047] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-amber-950 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer"
          title="Ekspor ke Excel / CSV"
        >
          <FileSpreadsheet className="w-4 h-4 text-amber-900" />
          <span>Excel</span>
        </button>

        <button
          onClick={onSaveToCloud}
          className="px-3.5 py-2 rounded-2xl bg-[#a7f3d0] hover:bg-[#6ee7b7] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-slate-950 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Cloud className="w-4 h-4 text-emerald-950" />
          <span>Simpan Cloud</span>
        </button>

        <button
          onClick={() => onCreate()}
          className="px-3.5 py-2 rounded-2xl bg-[#ede9fe] hover:bg-[#ddd6fe] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-indigo-950 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-indigo-950" />
          <span>Catat Agenda</span>
        </button>
      </div>
    </div>


    {children}
  </div>
);
