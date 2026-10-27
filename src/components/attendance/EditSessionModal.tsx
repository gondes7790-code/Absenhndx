import React, { useState } from 'react';
import { Sparkles, X, Calendar, Clock, BookOpen, Layers } from 'lucide-react';
import { ClassRoom, NewSessionInput } from '../../types';
import { JamPelajaranField } from '../common/JamPelajaranField';
import { formatJamPreset, getJamPresets } from '../../utils/jamPresets';

interface CreateSessionModalProps {
  activeClass: ClassRoom;
  nextSessionNumber: number;
  onClose: () => void;
  onSubmit: (data: NewSessionInput) => void;
}

/** Formulir "Buat Sesi Absen Baru"; state formulir lokal, di-reset tiap modal dibuka (dipasang ulang). */
export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  activeClass,
  nextSessionNumber,
  onClose,
  onSubmit,
}) => {
  const [createPertemuan, setCreatePertemuan] = useState<number>(nextSessionNumber);
  const [createTanggal, setCreateTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [createMapel, setCreateMapel] = useState<string>(activeClass.mapel || '');
  const [createJam, setCreateJam] = useState<string>(
    () => (getJamPresets()[0] && formatJamPreset(getJamPresets()[0])) || '07.15 - 09.15 WIB'
  );
  const [createMateri, setCreateMateri] = useState<string>('');
  const [createKegiatan, setCreateKegiatan] = useState<string>('');
  const [createStartMode, setCreateStartMode] = useState<'empty' | 'all_hadir'>('empty');

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      pertemuanKe: createPertemuan,
      tanggal: createTanggal,
      mapel: createMapel,
      materi: createMateri.trim(),
      kegiatan: createKegiatan.trim(),
      jamPelajaran: createJam.trim(),
      setAllHadir: createStartMode === 'all_hadir',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white border-3 border-slate-900 rounded-3xl p-6 shadow-[6px_6px_0px_#1e293b] relative animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#ede9fe] border border-slate-900 text-indigo-950">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Buat Sesi Absen Baru & Agenda Mengajar
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Otomatis sinkron ke Agenda Mengajar termasuk materi, kegiatan, dan kehadiran
              </p>
            </div>
          </div>
          <button
            onClick={() => onClose()}
            className="p-1.5 rounded-xl bg-[#fee2e2] border border-slate-900 text-rose-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmitCreate} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Pertemuan Ke- *
              </label>
              <input
                type="number"
                min={1}
                required
                value={createPertemuan}
                onChange={(e) => setCreatePertemuan(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-mono font-bold focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Tanggal Pertemuan *
              </label>
              <input
                type="date"
                required
                value={createTanggal}
                onChange={(e) => setCreateTanggal(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-mono font-bold focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Mata Pelajaran
              </label>
              <input
                type="text"
                required
                value={createMapel}
                onChange={(e) => setCreateMapel(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold focus:bg-white focus:outline-none"
              />
            </div>

            <JamPelajaranField
              label="Jam Tatap Muka"
              required
              value={createJam}
              onChange={setCreateJam}
            />
          </div>

          {/* Materi yang Diajarkan */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-800">
                Materi yang Diajarkan (Kurikulum Merdeka) *
              </label>
              <span className="text-[10px] font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Masuk Agenda Mengajar
              </span>
            </div>
            <input
              type="text"
              required
              value={createMateri}
              onChange={(e) => setCreateMateri(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold focus:bg-white focus:outline-none placeholder:text-slate-400"
              placeholder="Contoh: Teks Prosedur Manual & Kosakata Teknik Otomotif"
            />
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className="text-[10px] text-slate-500 font-bold">Saran Cepat:</span>
              <button
                type="button"
                onClick={() => setCreateMateri('Teks Prosedur Manual & Kosakata Teknik Otomotif')}
                className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg border border-slate-300 font-medium"
              >
                Teks Prosedur Manual
              </button>
              <button
                type="button"
                onClick={() => setCreateMateri('Perbaikan & Pemeriksaan Sistem Kelistrikan')}
                className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg border border-slate-300 font-medium"
              >
                Sistem Kelistrikan
              </button>
              <button
                type="button"
                onClick={() => setCreateMateri('K3LH & Budaya Kerja Industri 5R')}
                className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg border border-slate-300 font-medium"
              >
                K3LH & Budaya Kerja
              </button>
            </div>
          </div>

          {/* Kegiatan Pembelajaran */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Kegiatan Pembelajaran & Praktikum *
            </label>
            <textarea
              rows={2}
              required
              value={createKegiatan}
              onChange={(e) => setCreateKegiatan(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] focus:bg-white focus:outline-none resize-none font-medium placeholder:text-slate-400"
              placeholder="Contoh: Demonstrasi instruktur, bedah SOP, dan praktik kelompok di bengkel kerja..."
            />
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-[10px] text-slate-500 font-bold">Contoh Cepat:</span>
              <button
                type="button"
                onClick={() =>
                  setCreateKegiatan(
                    'Demonstrasi instruktur, bedah manual book, dan simulasi praktik kelompok'
                  )
                }
                className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg border border-slate-300 font-medium"
              >
                Demonstrasi & Praktik
              </button>
              <button
                type="button"
                onClick={() =>
                  setCreateKegiatan(
                    'Diskusi kelompok pemecahan studi kasus, presentasi, dan asesmen formatif'
                  )
                }
                className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg border border-slate-300 font-medium"
              >
                Diskusi & Presentasi
              </button>
            </div>
          </div>

          {/* Status Kehadiran Awal */}
          <div className="bg-[#faf7ee] p-3 rounded-2xl border-2 border-slate-900">
            <label className="block font-bold text-slate-800 mb-1.5">
              Pengaturan Awal Status Presensi:
            </label>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="radio"
                  name="startMode"
                  value="empty"
                  checked={createStartMode === 'empty'}
                  onChange={() => setCreateStartMode('empty')}
                  className="accent-emerald-700"
                />
                <span>
                  Absen Kosong (Belum Diisi — Sesuai permintaan, tombol "Semua Hadir" ditekan nanti jika perlu)
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="radio"
                  name="startMode"
                  value="all_hadir"
                  checked={createStartMode === 'all_hadir'}
                  onChange={() => setCreateStartMode('all_hadir')}
                  className="accent-emerald-700"
                />
                <span>Semua Hadir Langsung (Otomatis 100% Hadir)</span>
              </label>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t-2 border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onClose()}
              className="px-4 py-2 rounded-xl bg-[#f1f5f9] border-2 border-slate-900 font-bold text-slate-700 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#a7f3d0] hover:bg-[#6ee7b7] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] font-black text-slate-950 cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-emerald-950" />
              <span>Buat & Sinkronkan ke Agenda</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
