import React from 'react';
import { Cloud, FileSpreadsheet, Flame, Plus, Printer, QrCode } from 'lucide-react';
import { ClassRoom } from '../../types';

interface AttendanceHeaderCardProps {
  activeClass: ClassRoom;
  schoolName: string;
  onSaveToCloud: () => void;
  onOpenParentLink: () => void;
  onCreateSession: () => void;
  onExportCsv: () => void;
  onPrint: () => void;
  /** Selektor pertemuan, ditampilkan di dalam kartu header. */
  children?: React.ReactNode;
}

export const AttendanceHeaderCard: React.FC<AttendanceHeaderCardProps> = ({
  activeClass,
  schoolName,
  onSaveToCloud,
  onOpenParentLink,
  onCreateSession,
  onExportCsv,
  onPrint,
  children,
}) => (
  <div className="bg-[#fffdf8] rounded-3xl p-4 sm:p-6 border-2 border-slate-900 shadow-[4px_4px_0px_#1e293b] relative overflow-visible z-20">
    {/* Retro Corner Stamp with Fire */}
    <div className="absolute top-0 right-0 bg-[#dcfce7] border-b-2 border-l-2 border-slate-900 px-3 py-1 rounded-bl-2xl text-[10px] font-mono font-bold text-emerald-950 flex items-center gap-1 shadow-xs z-10">
      <Flame className="w-3 h-3 text-orange-600 fill-orange-500" />
      <span>PRESENSI & AGENDA</span>
    </div>

    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 sm:pt-0">
      <div>
        <div className="flex items-center gap-2 text-xs font-black text-slate-600 mb-1.5 flex-wrap">
          <span className="bg-[#e0f2fe] text-sky-950 px-2.5 py-0.5 rounded-full border-2 border-slate-900 font-mono text-[11px] shadow-[1.5px_1.5px_0px_#1e293b]">
            {activeClass.nama}
          </span>
          <span>•</span>
          <span className="font-bold text-slate-700">
            Tahun Ajaran {activeClass.tahunAjaran} ({activeClass.semester})
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Buku Presensi & Kehadiran Murid
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
          {schoolName} • Pencatatan Harian Terkoneksi Otomatis ke Agenda Mengajar
        </p>
      </div>

      {/* Action Button Strip */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        <button
          onClick={onSaveToCloud}
          className="px-3.5 py-2 rounded-2xl bg-[#a7f3d0] hover:bg-[#6ee7b7] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-slate-950 text-xs sm:text-sm font-black flex items-center gap-2 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] transition-all cursor-pointer"
        >
          <Cloud className="w-4 h-4 text-emerald-950" />
          <span>Simpan Cloud</span>
        </button>

        <button
          onClick={onCreateSession}
          className="px-3.5 py-2 rounded-2xl bg-[#ede9fe] hover:bg-[#ddd6fe] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-indigo-950 text-xs sm:text-sm font-black flex items-center gap-2 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] transition-all cursor-pointer"
          title="Tambah pertemuan baru dengan isian materi & kegiatan yang otomatis tersinkron"
        >
          <Plus className="w-4 h-4 text-indigo-950" />
          <span>Buat Absen Baru</span>
        </button>

        <button
          onClick={onOpenParentLink}
          className="px-3.5 py-2 rounded-2xl bg-[#ffedd5] hover:bg-[#fed7aa] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-orange-950 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer"
          title="Buka Portal Publik & QR Code"
        >
          <QrCode className="w-4 h-4 text-orange-900" />
          <span>Link Publik & QR</span>
        </button>

        <button
          onClick={onExportCsv}
          className="px-3 py-2 rounded-2xl bg-[#fef9c3] hover:bg-[#fde047] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-amber-950 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
          title="Ekspor Data ke File Excel / CSV"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-amber-900" />
          <span>Excel</span>
        </button>

        <button
          onClick={() => onPrint()}
          className="px-3 py-2 rounded-2xl bg-[#fee2e2] hover:bg-[#fca5a5] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-rose-950 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
          title="Cetak Kertas Dokumen Resmi Putih Tanpa Margin Web"
        >
          <Printer className="w-3.5 h-3.5 text-rose-900" />
          <span>Kertas Cetak</span>
        </button>
      </div>
    </div>

    {children}
  </div>
);
