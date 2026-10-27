import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, X } from 'lucide-react';
import {
  JamPreset,
  isValidRange,
  nextPresetDraft,
  saveJamPresets,
  useJamPresets,
} from '../../utils/jamPresets';

interface JamPresetManagerProps {
  onClose: () => void;
}

const inputClass =
  'w-full px-3 py-2 rounded-xl border-2 border-slate-900 bg-white font-bold text-xs focus:outline-none focus:shadow-[2px_2px_0px_#0d9488]';

/**
 * Pengaturan preset jam tatap muka. Dirender lewat portal ke <body> agar tidak
 * ikut menjadi bagian <form> modal pemanggil (Enter tidak mengirim formulir).
 * Setiap perubahan langsung tersimpan.
 */
export const JamPresetManager: React.FC<JamPresetManagerProps> = ({ onClose }) => {
  const presets = useJamPresets();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const update = (id: string, patch: Partial<JamPreset>) =>
    saveJamPresets(presets.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const remove = (id: string) => saveJamPresets(presets.filter((p) => p.id !== id));

  const add = () => saveJamPresets([...presets, nextPresetDraft(presets)]);

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Atur preset jam tatap muka"
        className="w-full max-w-lg max-h-[88vh] flex flex-col bg-white border-3 border-slate-900 rounded-3xl p-4 sm:p-5 shadow-[6px_6px_0px_#1e293b] text-xs"
      >
        <div className="flex items-start justify-between gap-3 pb-3 border-b-2 border-slate-100">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">Atur Preset Jam Tatap Muka</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Isi sekali, lalu pilih lewat dropdown saat membuat sesi atau agenda. Perubahan langsung
              tersimpan di perangkat ini.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-2 rounded-xl bg-[#fee2e2] hover:bg-[#fca5a5] border-2 border-slate-900 text-rose-950 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
          {presets.length === 0 && (
            <p className="text-center text-slate-500 font-bold py-6">
              Belum ada preset. Tekan &quot;Tambah Jam&quot; untuk membuat Jam ke-1.
            </p>
          )}

          {presets.map((preset) => {
            const invalid = Boolean(preset.start && preset.end) && !isValidRange(preset);
            return (
              <div
                key={preset.id}
                className="p-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] space-y-2"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={preset.label}
                    onChange={(e) => update(preset.id, { label: e.target.value })}
                    aria-label="Nama jam"
                    placeholder="Contoh: Jam ke-1"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => remove(preset.id)}
                    aria-label={`Hapus ${preset.label || 'preset'}`}
                    className="p-2 rounded-xl bg-[#fee2e2] hover:bg-[#fca5a5] border-2 border-slate-900 text-rose-950 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="block text-[10px] font-black text-slate-600 uppercase mb-0.5">Mulai</span>
                    <input
                      type="time"
                      value={preset.start}
                      onChange={(e) => update(preset.id, { start: e.target.value })}
                      className={inputClass}
                    />
                  </label>
                  <label className="block">
                    <span className="block text-[10px] font-black text-slate-600 uppercase mb-0.5">Selesai</span>
                    <input
                      type="time"
                      value={preset.end}
                      onChange={(e) => update(preset.id, { end: e.target.value })}
                      className={inputClass}
                    />
                  </label>
                </div>
                {invalid && (
                  <p className="text-[10px] font-bold text-rose-700">Jam selesai harus setelah jam mulai.</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t-2 border-slate-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={add}
            className="px-3 py-2 rounded-2xl bg-[#e0f2fe] hover:bg-[#bae6fd] border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] font-black text-sky-950 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Jam</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-2xl bg-[#6ee7b7] hover:bg-[#34d399] border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] font-black text-slate-950 cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
