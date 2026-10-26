import React from 'react';
import { PrintConfig } from '../../types';

type FieldChange = (field: keyof PrintConfig, value: PrintConfig[keyof PrintConfig]) => void;

interface PejabatTabProps {
  formData: PrintConfig;
  onChange: FieldChange;
}

export const PejabatTab: React.FC<PejabatTabProps> = ({ formData, onChange: handleInputChange }) => (
  <>
      <div className="space-y-4 animate-in fade-in duration-150">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1.5">
              Nama Lengkap Kepala Sekolah & Gelar *
            </label>
            <input
              type="text"
              required
              value={formData.principalName}
              onChange={(e) => handleInputChange('principalName', e.target.value)}
              placeholder="Contoh: Drs. H. Mulyadi, M.Pd."
              className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#fee2e2] text-xs font-black text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488]"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-800 mb-1.5">
              NIP Kepala Sekolah *
            </label>
            <input
              type="text"
              required
              value={formData.principalNip}
              onChange={(e) => handleInputChange('principalNip', e.target.value)}
              placeholder="Contoh: 19680512 199403 1 004"
              className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488]"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-800 mb-1.5">
              Kota Pembuatan Dokumen (Titimangsa) *
            </label>
            <input
              type="text"
              value={formData.documentCity}
              onChange={(e) => handleInputChange('documentCity', e.target.value)}
              placeholder="Contoh: Jakarta"
              className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488]"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-800 mb-1.5">
              Kustomisasi Tanggal Dokumen (Opsional)
            </label>
            <input
              type="text"
              value={formData.customDateText || ''}
              onChange={(e) => handleInputChange('customDateText', e.target.value)}
              placeholder="Kosongkan untuk tanggal hari ini otomatis"
              className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-black text-slate-800 mb-1.5">
              Catatan Kaki Dokumen Resmi (Footer Note)
            </label>
            <input
              type="text"
              value={formData.footerNote}
              onChange={(e) => handleInputChange('footerNote', e.target.value)}
              placeholder="Dokumen Sah Digital - Dicetak melalui Hadir! Platform Kurikulum Merdeka"
              className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488]"
            />
          </div>
        </div>
      </div>
  </>
);
