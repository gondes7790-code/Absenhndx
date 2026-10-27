import React from 'react';
import { Eye, Printer, Flame } from 'lucide-react';
import { ClassRoom } from '../../types';
import { PrintableDocumentType } from '../PrintableDocument';


interface PrintCenterTabProps {
  classes: ClassRoom[];
  currentClass: ClassRoom;
  selectedClassId: string;
  onSelectClass: (classId: string) => void;
  selectedDocType: PrintableDocumentType;
  onSelectDocType: (type: PrintableDocumentType) => void;
  onOpenPreview: () => void;
}

export const PrintCenterTab: React.FC<PrintCenterTabProps> = ({
  classes,
  currentClass,
  selectedClassId,
  onSelectClass,
  selectedDocType,
  onSelectDocType,
  onOpenPreview,
}) => (
  <>
      <div className="space-y-4 animate-in fade-in duration-150">
        <div className="p-4 rounded-2xl bg-[#fef9c3] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b]">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-amber-900" />
              <span className="text-xs font-black text-amber-950">
                Pusat Integrasi Dokumen Siap Cetak (A4 Full Putih)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-700">Pilih Kelas:</span>
              <select
                value={selectedClassId}
                onChange={(e) => onSelectClass(e.target.value)}
                className="px-2.5 py-1 rounded-xl bg-white border border-slate-900 text-xs font-bold text-slate-900 shadow-xs"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nama} ({c.mapel})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Cards for each document type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* 1. Presensi Pertemuan */}
          <div
            onClick={() => onSelectDocType('attendance')}
            className={`p-4 rounded-2xl border-2 border-slate-900 cursor-pointer transition-all ${
              selectedDocType === 'attendance'
                ? 'bg-[#dcfce7] shadow-[3px_3px_0px_#1e293b] scale-[1.01]'
                : 'bg-white hover:bg-slate-50 shadow-[1.5px_1.5px_0px_#1e293b]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">📄</span>
              <span className="text-[10px] font-mono font-bold bg-white border border-slate-900 px-1.5 py-0.5 rounded-md">
                ABSENSI
              </span>
            </div>
            <h4 className="text-xs font-black text-slate-900">
              Daftar Hadir Siswa Tatap Muka
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Presensi pertemuan per sesi dengan keterangan H/S/I/A/D.
            </p>
          </div>

          {/* 2. Rekap Bulanan */}
          <div
            onClick={() => onSelectDocType('recap')}
            className={`p-4 rounded-2xl border-2 border-slate-900 cursor-pointer transition-all ${
              selectedDocType === 'recap'
                ? 'bg-[#e0f2fe] shadow-[3px_3px_0px_#1e293b] scale-[1.01]'
                : 'bg-white hover:bg-slate-50 shadow-[1.5px_1.5px_0px_#1e293b]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">📊</span>
              <span className="text-[10px] font-mono font-bold bg-white border border-slate-900 px-1.5 py-0.5 rounded-md">
                REKAP
              </span>
            </div>
            <h4 className="text-xs font-black text-slate-900">
              Rekapitulasi Presensi Bulanan
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Akumulasi kehadiran, persentase %, dan predikat pembinaan.
            </p>
          </div>

          {/* 3. Buku Nilai */}
          <div
            onClick={() => onSelectDocType('gradebook')}
            className={`p-4 rounded-2xl border-2 border-slate-900 cursor-pointer transition-all ${
              selectedDocType === 'gradebook'
                ? 'bg-[#ede9fe] shadow-[3px_3px_0px_#1e293b] scale-[1.01]'
                : 'bg-white hover:bg-slate-50 shadow-[1.5px_1.5px_0px_#1e293b]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Flame className="w-5 h-5 text-orange-600" />
              <span className="text-[10px] font-mono font-bold bg-white border border-slate-900 px-1.5 py-0.5 rounded-md">
                NILAI
              </span>
            </div>
            <h4 className="text-xs font-black text-slate-900">
              Buku Daftar Nilai & Capaian TP
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Leger asesmen formatif TP, STS, SAS, dan nilai rapor akhir.
            </p>
          </div>

          {/* 4. Jurnal Mengajar */}
          <div
            onClick={() => onSelectDocType('journal')}
            className={`p-4 rounded-2xl border-2 border-slate-900 cursor-pointer transition-all ${
              selectedDocType === 'journal'
                ? 'bg-[#fef9c3] shadow-[3px_3px_0px_#1e293b] scale-[1.01]'
                : 'bg-white hover:bg-slate-50 shadow-[1.5px_1.5px_0px_#1e293b]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">📖</span>
              <span className="text-[10px] font-mono font-bold bg-white border border-slate-900 px-1.5 py-0.5 rounded-md">
                AGENDA
              </span>
            </div>
            <h4 className="text-xs font-black text-slate-900">
              Buku Agenda & Jurnal Guru
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Jurnal harian pembelajaran, materi kegiatan, dan jam tatap muka.
            </p>
          </div>

          {/* 5. Kas & Tabungan */}
          <div
            onClick={() => onSelectDocType('finance')}
            className={`p-4 rounded-2xl border-2 border-slate-900 cursor-pointer transition-all ${
              selectedDocType === 'finance'
                ? 'bg-[#fee2e2] shadow-[3px_3px_0px_#1e293b] scale-[1.01]'
                : 'bg-white hover:bg-slate-50 shadow-[1.5px_1.5px_0px_#1e293b]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">💰</span>
              <span className="text-[10px] font-mono font-bold bg-white border border-slate-900 px-1.5 py-0.5 rounded-md">
                KEUANGAN
              </span>
            </div>
            <h4 className="text-xs font-black text-slate-900">
              Rekapitulasi Kas & Tabungan Siswa
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Laporan kas kelas dan saldo tabungan siswa terverifikasi.
            </p>
          </div>
        </div>

        {/* Action to preview or print chosen doc */}
        <div className="p-4 rounded-2xl bg-[#faf7ee] border-2 border-slate-900 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-bold text-slate-900">
              Dokumen Terpilih:{' '}
              <span className="font-black underline uppercase">
                {selectedDocType === 'attendance'
                  ? 'Daftar Hadir Tatap Muka'
                  : selectedDocType === 'recap'
                  ? 'Rekapitulasi Presensi Bulanan'
                  : selectedDocType === 'gradebook'
                  ? 'Buku Nilai & Capaian TP'
                  : selectedDocType === 'journal'
                  ? 'Agenda & Jurnal Harian Mengajar'
                  : 'Rekapitulasi Kas & Tabungan'}
              </span>
            </p>
            <p className="text-[11px] text-slate-600">
              Kelas: {currentClass.nama} • Kop & Pengesahan Mengikuti Konfigurasi Di Atas
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenPreview}
            className="px-4 py-2.5 rounded-2xl bg-[#a7f3d0] hover:bg-[#6ee7b7] text-slate-950 font-black text-xs border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-2"
          >
            <Eye className="w-4 h-4 text-emerald-900" />
            <span>Buka Pratinjau Kertas Siap Cetak (A4 Putih)</span>
          </button>
        </div>
      </div>
  </>
);
