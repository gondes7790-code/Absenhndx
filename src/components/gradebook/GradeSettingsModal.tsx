import React from 'react';
import { X, Check, Plus, AlertTriangle, Sliders } from 'lucide-react';
import { ClassRoom } from '../../types';

interface GradeSettingsModalProps {
  activeClass: ClassRoom;
  formatifColumns: number;
  onFormatifColumnsChange: (count: number) => void;
  currentKkm: number;
  onKkmChange: (kkm: number) => void;
  tpTitles: Record<number, string>;
  onTpTitlesChange: (titles: Record<number, string>) => void;
  onClose: () => void;
  onSave: () => void;
}

/** Pengaturan jumlah kolom formatif, KKM, dan label capaian per TP. State dipegang GradebookView. */
export const GradeSettingsModal: React.FC<GradeSettingsModalProps> = ({
  activeClass,
  formatifColumns,
  onFormatifColumnsChange,
  currentKkm,
  onKkmChange,
  tpTitles,
  onTpTitlesChange,
  onClose,
  onSave,
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#fffdf8] w-full max-w-xl rounded-3xl border-3 border-slate-900 shadow-[8px_8px_0px_#1e293b] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b-2 border-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e0f2fe] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center justify-center text-sky-950 font-black shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Atur Kolom TP & Bobot Penilaian
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Sesuaikan jumlah kolom formatif, label capaian per TP, dan standar KKM kelas {activeClass.nama}.
              </p>
            </div>
          </div>
          <button
            onClick={() => onClose()}
            className="p-2 rounded-2xl bg-[#fee2e2] hover:bg-[#fca5a5] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-rose-950 cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Jumlah Kolom Formatif */}
          <div className="p-3.5 rounded-2xl bg-white border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] space-y-2">
            <label className="text-xs font-black text-slate-800 block">
              Jumlah Kolom Formatif (Tujuan Pembelajaran):
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {[3, 4, 5, 6, 8, 10, 12].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => onFormatifColumnsChange(num)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 border-slate-900 transition-all cursor-pointer ${
                    formatifColumns === num
                      ? 'bg-[#dcfce7] text-slate-950 shadow-[2px_2px_0px_#1e293b]'
                      : 'bg-white hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {num} Kolom
                </button>
              ))}
            </div>
          </div>

          {/* KKM Setting */}
          <div className="p-3.5 rounded-2xl bg-white border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center justify-between gap-3">
            <div>
              <label className="text-xs font-black text-slate-800 block">
                KKM / Kriteria Ketercapaian:
              </label>
              <p className="text-[11px] text-slate-500 font-medium">
                Standar ketuntasan minimal untuk mata pelajaran {activeClass.mapel}.
              </p>
            </div>
            <input
              type="number"
              min="50"
              max="100"
              value={currentKkm}
              onChange={(e) => onKkmChange(Number(e.target.value))}
              className="w-20 px-3 py-1.5 rounded-xl bg-[#faf7ee] border-2 border-slate-900 text-center text-sm font-black text-slate-900 font-mono focus:outline-none focus:bg-white"
            />
          </div>

          {/* Custom Titles per TP */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800">
                Label & Deskripsi Capaian per TP (Formatif 1 s/d {formatifColumns}):
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Opsional</span>
            </div>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {Array.from({ length: formatifColumns }, (_, i) => {
                const tpNum = i + 1;
                return (
                  <div key={tpNum} className="flex items-center gap-2">
                    <span className="w-14 px-2 py-1.5 rounded-xl bg-[#ede9fe] border-2 border-slate-900 text-center text-xs font-black font-mono text-indigo-950 shrink-0">
                      TP {tpNum}
                    </span>
                    <input
                      type="text"
                      value={tpTitles[tpNum] || ''}
                      placeholder={`Contoh: Capaian Pembelajaran Materi ${tpNum}`}
                      onChange={(e) => {
                        const updated = { ...tpTitles, [tpNum]: e.target.value };
                        onTpTitlesChange(updated);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-white border-2 border-slate-900 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t-2 border-slate-900 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onClose()}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 text-xs font-black text-slate-800 cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-5 py-2 rounded-xl bg-[#6ee7b7] hover:bg-[#34d399] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-xs font-black text-slate-950 cursor-pointer"
          >
            Simpan & Terapkan
          </button>
        </div>
      </div>
    </div>
);
