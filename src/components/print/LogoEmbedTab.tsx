import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Flame, Image as ImageIcon } from 'lucide-react';
import { PrintConfig } from '../../types';
import { APP_LOGO_URL, parseLogoEmbed, toLogoUrl } from '../../utils/printConfig';

type FieldChange = (field: keyof PrintConfig, value: PrintConfig[keyof PrintConfig]) => void;

export type LogoPreset = 'tutwuri' | 'smkbisa' | 'garuda' | 'applogo' | 'empty';

interface LogoEmbedTabProps {
  formData: PrintConfig;
  parsedLogo: ReturnType<typeof parseLogoEmbed>;
  onChange: FieldChange;
  onPreset: (type: LogoPreset) => void;
}

/** Pratinjau logo: hanya <img>; URL kosong/gagal dimuat menampilkan placeholder. */
const LogoPreviewBox: React.FC<{ url: string }> = ({ url }) => {
  const [failed, setFailed] = useState(false);
  if (!url || failed) {
    return (
      <div className="text-center p-2 text-slate-400">
        <ImageIcon className="w-8 h-8 mx-auto mb-1 stroke-1" />
        <span className="text-[10px]">{url ? 'Gambar Gagal Dimuat' : 'Logo Kosong'}</span>
      </div>
    );
  }
  return (
    <img
      src={url}
      alt="Pratinjau Logo"
      className="max-w-full max-h-full object-contain"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
};

export const LogoEmbedTab: React.FC<LogoEmbedTabProps> = ({
  formData,
  parsedLogo,
  onChange: handleInputChange,
  onPreset: handlePresetLogo,
}) => {
  const hasInput = formData.logoEmbedCode.trim() !== '';
  return (
  <>
      <div className="space-y-5 animate-in fade-in duration-150">
        <div className="p-4 rounded-2xl bg-[#eff6ff] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b]">
          <div className="flex items-start gap-3">
            <Flame className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-950 font-medium">
              <span className="font-bold">Logo Sekolah = URL Gambar:</span> tempel tautan gambar langsung
              seperti <code className="bg-white px-1.5 py-0.5 rounded border border-slate-900 font-mono text-[11px]">https://contoh.sch.id/logo.png</code>.
              Kode HTML atau SVG tidak diterima demi keamanan. Jika Anda menempel{' '}
              <code className="bg-white px-1.5 py-0.5 rounded border border-slate-900 font-mono text-[11px]">&lt;img src=&quot;https://...&quot;&gt;</code>{' '}
              lama, hanya alamat URL-nya yang diambil. Logo langsung tampil di kotak pratinjau.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Input URL Logo (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div>
              <label
                htmlFor="logoUrlInput"
                className="block text-xs font-black text-slate-800 mb-1.5 flex items-center justify-between"
              >
                <span>URL Logo Sekolah</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  Hanya URL https, tanpa HTML/SVG
                </span>
              </label>
              <input
                id="logoUrlInput"
                type="text"
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
                value={formData.logoEmbedCode}
                onChange={(e) => handleInputChange('logoEmbedCode', e.target.value)}
                onBlur={() => {
                  // Rapikan input (mis. HTML lama berisi <img src>) menjadi URL murni.
                  const normalized = toLogoUrl(formData.logoEmbedCode);
                  if (normalized && normalized !== formData.logoEmbedCode) {
                    handleInputChange('logoEmbedCode', normalized);
                  }
                }}
                placeholder="https://contoh.sch.id/logo.png"
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488]"
              />
              {hasInput && parsedLogo.type === 'none' && (
                <p className="mt-1.5 flex items-start gap-1 text-[11px] font-bold text-rose-700">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Format tidak didukung. Tempel URL gambar yang diawali https:// (kode HTML/SVG ditolak).</span>
                </p>
              )}
            </div>

            {/* Quick Presets */}
            <div>
              <span className="text-[11px] font-black text-slate-700 block mb-1.5">
                Preset Lambang Pendidikan Siap Pakai (1 Klik):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handlePresetLogo('applogo')}
                  className="px-2.5 py-1.5 rounded-xl bg-[#dcfce7] hover:bg-[#bbf7d0] border-2 border-slate-900 text-[11px] font-black text-emerald-950 shadow-[1.5px_1.5px_0px_#1e293b] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
                >
                  <img src={APP_LOGO_URL} alt="Logo" className="w-4 h-4 object-contain" />
                  <span>Logo Resmi Hadir!</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetLogo('tutwuri')}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border-2 border-slate-900 text-[11px] font-bold text-slate-900 shadow-[1.5px_1.5px_0px_#1e293b] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5 text-orange-600" />
                  <span>Tut Wuri Handayani</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetLogo('smkbisa')}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border-2 border-slate-900 text-[11px] font-bold text-slate-900 shadow-[1.5px_1.5px_0px_#1e293b] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5 text-orange-600" />
                  <span>SMK BISA Hebat</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetLogo('garuda')}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border-2 border-slate-900 text-[11px] font-bold text-slate-900 shadow-[1.5px_1.5px_0px_#1e293b] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5 text-orange-600" />
                  <span>Garuda Pancasila</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetLogo('empty')}
                  className="px-2.5 py-1.5 rounded-xl bg-[#fee2e2] hover:bg-[#fca5a5] border-2 border-slate-900 text-[11px] font-bold text-rose-950 shadow-[1.5px_1.5px_0px_#1e293b] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
                >
                  <span>🧹 Kosongkan Logo</span>
                </button>
              </div>
            </div>

            {/* Logo Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Posisi Logo Sekolah
                </label>
                <select
                  value={formData.logoPosition}
                  onChange={(e) =>
                    handleInputChange('logoPosition', e.target.value as 'left' | 'right' | 'both')
                  }
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900"
                >
                  <option value="right">Sisi Kanan Kop Surat (Standar)</option>
                  <option value="left">Sisi Kiri Kop Surat</option>
                  <option value="both">Kedua Sisi (Kiri & Kanan)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="showTutWuri"
                  checked={formData.showTutWuriLogo}
                  onChange={(e) => handleInputChange('showTutWuriLogo', e.target.checked)}
                  className="w-4 h-4 rounded border-2 border-slate-900 text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="showTutWuri" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Tampilkan Logo Tut Wuri di Sisi Kiri
                </label>
              </div>
            </div>
          </div>

          {/* Live Preview Logo Box (5 cols) */}
          <div className="lg:col-span-5 bg-[#faf7ee] border-2 border-slate-900 rounded-2xl p-4 shadow-[2px_2px_0px_#1e293b] flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 mb-3 block">
              Pratinjau Logo Sekolah
            </span>

            <div className="w-28 h-28 rounded-2xl bg-white border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center justify-center p-2 overflow-hidden mb-3">
              <LogoPreviewBox key={parsedLogo.content} url={parsedLogo.type === 'img' ? parsedLogo.content : ''} />
            </div>

            {parsedLogo.type !== 'none' ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#dcfce7] border border-slate-900 text-[10px] font-black text-emerald-950 shadow-[1px_1px_0px_#1e293b]">
                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                <span>URL Logo Valid</span>
              </div>
            ) : (
              <span className="text-[10px] text-slate-500 font-medium">
                Menggunakan lambang resmi Tut Wuri Handayani secara otomatis
              </span>
            )}
          </div>
        </div>
      </div>
  </>
  );
};
