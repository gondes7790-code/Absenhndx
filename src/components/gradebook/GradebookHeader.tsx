import React from 'react';
import { CheckCircle2, Cloud, FileSpreadsheet, Flame, Printer, Share2, Sliders } from 'lucide-react';
import { ClassRoom } from '../../types';

interface GradebookHeaderProps {
  activeClass: ClassRoom;
  formatifColumns: number;
  onFormatifColumnsChange: (count: number) => void;
  computedStats: {
    classAverage: string;
    tuntasCount: number;
    studentsWithScores: number;
    tuntasPercent: number;
  };
  settingsOpen: boolean;
  onToggleSettings: () => void;
  onGenerateAllDescriptions: () => void;
  onSaveToCloud: () => void;
  onOpenParentLink: () => void;
  onPrint: () => void;
  onExport: () => void;
}

/** Kartu header Buku Penilaian: aksi cepat, pemilih kolom formatif, dan ringkasan kelas. */
export const GradebookHeader: React.FC<GradebookHeaderProps> = ({
  activeClass,
  formatifColumns,
  onFormatifColumnsChange,
  computedStats,
  settingsOpen,
  onToggleSettings,
  onGenerateAllDescriptions,
  onSaveToCloud,
  onOpenParentLink,
  onPrint,
  onExport,
}) => (
  <div className="bg-[#fffdf8] rounded-3xl p-4 sm:p-6 border-2 border-slate-900 shadow-[4px_4px_0px_#1e293b] relative overflow-hidden">
    {/* Retro Corner Stamp with Fire */}
    <div className="absolute top-0 right-0 bg-[#fef9c3] border-b-2 border-l-2 border-slate-900 px-3 py-1 rounded-bl-2xl text-[10px] font-mono font-bold text-amber-950 flex items-center gap-1 shadow-xs">
      <Flame className="w-3 h-3 text-orange-600 fill-orange-500" />
      <span>BUKU PENILAIAN</span>
    </div>

    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 sm:pt-0">
      <div>
        <div className="flex items-center gap-2 text-xs font-black text-slate-600 mb-1.5 flex-wrap">
          <span className="bg-[#e0f2fe] text-sky-950 px-2.5 py-0.5 rounded-full border-2 border-slate-900 font-mono text-[11px] shadow-[1.5px_1.5px_0px_#1e293b]">
            {activeClass.nama}
          </span>
          <span>•</span>
          <span className="font-mono text-emerald-950 bg-[#dcfce7] px-2.5 py-0.5 rounded-full border border-slate-900 font-bold shadow-[1px_1px_0px_#1e293b]">
            KKM: {activeClass.kkm}
          </span>
          <span>•</span>
          <span className="text-emerald-800 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Tersimpan di Supabase
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Buku Penilaian Murid (Kurikulum Merdeka)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
          Matriks asesmen formatif (TP), STS, SAS, dan otomasi narasi capaian kompetensi rapor.
        </p>
      </div>

      {/* Action Button Strip - Colorful Soft Pastel */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        <button
          onClick={onSaveToCloud}
          className="px-3.5 py-2 rounded-2xl bg-[#a7f3d0] hover:bg-[#6ee7b7] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-slate-950 text-xs sm:text-sm font-black flex items-center gap-2 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] transition-all cursor-pointer"
        >
          <Cloud className="w-4 h-4 text-emerald-950" />
          <span>Simpan Cloud</span>
        </button>

        <button
          onClick={() => onToggleSettings()}
          className="px-3.5 py-2 rounded-2xl bg-[#e0f2fe] hover:bg-[#bae6fd] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-sky-950 text-xs sm:text-sm font-black flex items-center gap-1.5 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] transition-all cursor-pointer"
        >
          <Sliders className="w-4 h-4 text-sky-900" />
          <span>Atur Kolom TP</span>
        </button>

        <button
          onClick={onGenerateAllDescriptions}
          className="px-3.5 py-2 rounded-2xl bg-[#ede9fe] hover:bg-[#ddd6fe] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-indigo-950 text-xs sm:text-sm font-black flex items-center gap-2 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] transition-all cursor-pointer"
        >
          <Flame className="w-4 h-4 text-orange-600 fill-orange-500" />
          <span>Deskripsi Merdeka</span>
        </button>

        <button
          onClick={onExport}
          className="px-3 py-2 rounded-2xl bg-[#fef9c3] hover:bg-[#fde047] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-amber-950 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-amber-900" />
          <span>Ekspor Excel</span>
        </button>

        <button
          onClick={() => onPrint()}
          className="px-3 py-2 rounded-2xl bg-[#fee2e2] hover:bg-[#fca5a5] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-rose-950 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
          title="Cetak Kertas Nilai Formal A4 Putih"
        >
          <Printer className="w-3.5 h-3.5 text-rose-900" />
          <span>Kertas Cetak</span>
        </button>

        <button
          onClick={onOpenParentLink}
          className="px-3 py-2 rounded-2xl bg-[#ffedd5] hover:bg-[#fed7aa] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-orange-950 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-orange-900" />
          <span>Link Publik</span>
        </button>
      </div>
    </div>

    {/* Formative Column Selector & Metrics Banner */}
    <div className="mt-4 pt-4 border-t-2 border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-black text-slate-800">
          Tampilkan Kolom Formatif:
        </span>
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b]">
          {[3, 5, 8, 10].map((num) => (
            <button
              key={num}
              onClick={() => onFormatifColumnsChange(num)}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                formatifColumns === num
                  ? 'bg-[#dcfce7] border border-slate-900 text-slate-950 shadow-[1px_1px_0px_#1e293b]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {num} TP
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
        {/* Rata-rata Kelas Card */}
        <div className="px-3 py-1.5 rounded-2xl bg-[#fef9c3] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center gap-2">
          <span className="text-[11px] font-bold text-amber-950">Rata-rata:</span>
          <span className="text-base font-black text-slate-900 font-mono">
            {computedStats.classAverage}
          </span>
        </div>

        {/* Ketuntasan KKM Card */}
        <div className="px-3 py-1.5 rounded-2xl bg-[#dcfce7] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center gap-2">
          <span className="text-[11px] font-bold text-emerald-950">Ketuntasan:</span>
          <span className="text-xs font-black text-emerald-950 font-mono">
            {computedStats.tuntasCount} / {computedStats.studentsWithScores} Murid ({computedStats.tuntasPercent}%)
          </span>
        </div>
      </div>
    </div>
  </div>
);
