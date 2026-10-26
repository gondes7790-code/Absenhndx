import React from 'react';
import { PrintConfig } from '../../types';

type FieldChange = (field: keyof PrintConfig, value: PrintConfig[keyof PrintConfig]) => void;

interface KopSuratTabProps {
  formData: PrintConfig;
  onChange: FieldChange;
}

export const KopSuratTab: React.FC<KopSuratTabProps> = ({ formData, onChange: handleInputChange }) => (
  <>
      <div className="space-y-4 animate-in fade-in duration-150">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1.5">
              Baris 1: Instansi Induk / Pemerintah Daerah *
            </label>
            <input
              type="text"
              value={formData.dinasHeader}
              onChange={(e) => handleInputChange('dinasHeader', e.target.value)}
              placeholder="Contoh: PEMERINTAH DAERAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA"
              className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488]"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-800 mb-1.5">
              Baris 2: Dinas Pendidikan / Bidang Kejuruan
            </label>
            <input
              type="text"
              value={formData.dinasSubHeader}
              onChange={(e) => handleInputChange('dinasSubHeader', e.target.value)}
              placeholder="Contoh: DINAS PENDIDIKAN DAN KEBUDAYAAN"
              className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-black text-slate-800 mb-1.5">
              Baris 3: Nama Satuan Pendidikan (Nama Sekolah Utama) *
            </label>
            <input
              type="text"
              required
              value={formData.schoolName}
              onChange={(e) => handleInputChange('schoolName', e.target.value)}
              placeholder="Contoh: SMA / SMK / SMP MERDEKA INDONESIA"
              className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#fef9c3] text-sm font-black text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-black text-slate-800 mb-1.5">
              Baris 4: Program Keahlian / Sub Judul Dokumen
            </label>
            <input
              type="text"
              value={formData.unitSubHeader || ''}
              onChange={(e) => handleInputChange('unitSubHeader', e.target.value)}
              placeholder="Contoh: SISTEM MANAJEMEN PRESENSI & KURIKULUM MERDEKA INDONESIA"
              className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-black text-slate-800 mb-1.5">
              Alamat Lengkap Satuan Pendidikan *
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Contoh: Jl. Merdeka Belajar No. 45, Kompleks Pendidikan Kejuruan Terpadu"
              className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488]"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-800 mb-1.5">
              Kontak Telepon / Fax Sekolah
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Contoh: Telp. (021) 7890123 / Fax. (021) 7890124"
              className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488]"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-800 mb-1.5">
              Alamat Email & Website / Portal Resmi
            </label>
            <input
              type="text"
              value={formData.emailWeb}
              onChange={(e) => handleInputChange('emailWeb', e.target.value)}
              placeholder="Contoh: info@smkmerdeka.sch.id • https://hadir.app"
              className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488]"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-800 mb-1.5">
              Gaya Garis Pembatas Kop Surat
            </label>
            <select
              value={formData.borderStyle}
              onChange={(e) =>
                handleInputChange('borderStyle', e.target.value as 'double' | 'solid' | 'thick')
              }
              className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488]"
            >
              <option value="double">Garis Ganda Dinas Standar (Double Border 3px)</option>
              <option value="thick">Garis Tunggal Tebal (Thick Solid 4px)</option>
              <option value="solid">Garis Tunggal Halus (Solid 2px)</option>
            </select>
          </div>
        </div>
      </div>
  </>
);
