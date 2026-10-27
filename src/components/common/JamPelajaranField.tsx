import React, { useState } from 'react';
import { JamPresetManager } from './JamPresetManager';
import { formatJamPreset, useJamPresets } from '../../utils/jamPresets';

interface JamPelajaranFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const CUSTOM_OPTION = '__manual__';

const fieldClass =
  'w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold focus:bg-white focus:outline-none';

/**
 * Isian jam tatap muka: dropdown dari preset yang diatur guru, dengan opsi
 * mengetik manual. Nilai yang diteruskan tetap berupa teks biasa.
 */
export const JamPelajaranField: React.FC<JamPelajaranFieldProps> = ({
  label,
  value,
  onChange,
  required,
}) => {
  const presets = useJamPresets();
  const [managerOpen, setManagerOpen] = useState(false);

  const matched = value !== '' ? presets.find((p) => formatJamPreset(p) === value) : undefined;

  // Nilai lama / hasil ketikan yang tidak cocok dengan preset ditampilkan sebagai teks biasa.
  const [manualMode, setManualMode] = useState(() => value.trim() !== '' && !matched);
  const showManual = presets.length === 0 || manualMode;

  const backToPresets = () => {
    if (!matched) onChange(''); // hindari nilai tersembunyi yang tidak tampak di dropdown
    setManualMode(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <label className="block font-bold text-slate-800">{label}</label>
        <button
          type="button"
          onClick={() => setManagerOpen(true)}
          className="px-2 py-0.5 rounded-lg bg-[#e0f2fe] hover:bg-[#bae6fd] border border-slate-900 text-[10px] font-black text-sky-950 cursor-pointer"
        >
          Atur Preset
        </button>
      </div>

      {showManual ? (
        <div className="space-y-1">
          <input
            type="text"
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={fieldClass}
            placeholder="Contoh: 07.15 - 09.15 WIB"
          />
          {presets.length > 0 && (
            <button
              type="button"
              onClick={backToPresets}
              className="text-[10px] font-black text-sky-800 underline cursor-pointer"
            >
              Pilih dari preset
            </button>
          )}
        </div>
      ) : (
        <select
          required={required}
          value={matched ? matched.id : ''}
          onChange={(e) => {
            if (e.target.value === CUSTOM_OPTION) {
              setManualMode(true);
              return;
            }
            const chosen = presets.find((p) => p.id === e.target.value);
            if (chosen) onChange(formatJamPreset(chosen));
          }}
          className={fieldClass}
        >
          <option value="" disabled>
            Pilih jam pelajaran...
          </option>
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {formatJamPreset(p) || '(preset kosong)'}
            </option>
          ))}
          <option value={CUSTOM_OPTION}>Ketik manual...</option>
        </select>
      )}

      {managerOpen && <JamPresetManager onClose={() => setManagerOpen(false)} />}
    </div>
  );
};
