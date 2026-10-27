import React, { useState } from 'react';
import { BookOpen, Plus, X } from 'lucide-react';
import { ClassRoom, JournalEntry, TeacherProfile } from '../../types';
import { JamPelajaranField } from '../common/JamPelajaranField';
import { formatJamPreset, getJamPresets } from '../../utils/jamPresets';

interface NewJournalModalProps {
  classes: ClassRoom[];
  teacher: TeacherProfile;
  onClose: () => void;
  onAddJournal: (entry: Omit<JournalEntry, 'id'>) => void;
}

/** Formulir "Catat Agenda Baru"; state formulir lokal dan di-reset tiap modal dibuka. */
export const NewJournalModal: React.FC<NewJournalModalProps> = ({ classes, teacher, onClose, onAddJournal }) => {
  const [newTanggal, setNewTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [newClassId, setNewClassId] = useState(classes[0]?.id || 'class-1');
  const [newMapel, setNewMapel] = useState(classes[0]?.mapel || 'Bahasa Inggris & Kejuruan');
  const [newPertemuan, setNewPertemuan] = useState<number>(1);
  const [newJam, setNewJam] = useState(
    () => (getJamPresets()[0] && formatJamPreset(getJamPresets()[0])) || '07:15 - 09:15 WIB'
  );
  const [newMateri, setNewMateri] = useState('');
  const [newKegiatan, setNewKegiatan] = useState('');
  const [newCatatanAbsen, setNewCatatanAbsen] = useState('');

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMateri.trim()) return;

    const targetClass = classes.find((c) => c.id === newClassId);
    const className = targetClass?.nama || 'X TO 4';
    const combinedMateriKegiatan = newKegiatan.trim()
      ? `${newMateri.trim()} — ${newKegiatan.trim()}`
      : newMateri.trim();

    onAddJournal({
      tanggal: newTanggal,
      pendidik: teacher.name,
      mapel: newMapel,
      classId: newClassId,
      className,
      pertemuanKe: Number(newPertemuan) || 1,
      jamPelajaran: newJam,
      materiKegiatan: combinedMateriKegiatan,
      materi: newMateri.trim(),
      kegiatan: newKegiatan.trim(),
      absensiCatatan: newCatatanAbsen.trim() || 'Nihil / Seluruh siswa hadir tertib.',
      semester: `${targetClass?.tahunAjaran || '2026/2027'} (${targetClass?.semester || 'Ganjil'})`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white border-3 border-slate-900 rounded-3xl p-6 shadow-[6px_6px_0px_#1e293b] relative animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#ede9fe] border border-slate-900 text-indigo-950">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Tambah Catatan Agenda KBM Baru
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Kolom isian materi & kegiatan pembelajaran
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

        <form onSubmit={handleCreateEntry} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Tanggal Pertemuan *
              </label>
              <input
                type="date"
                required
                value={newTanggal}
                onChange={(e) => setNewTanggal(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-mono font-bold focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Pilih Kelas *
              </label>
              <select
                value={newClassId}
                onChange={(e) => {
                  setNewClassId(e.target.value);
                  const target = classes.find((c) => c.id === e.target.value);
                  if (target) setNewMapel(target.mapel);
                }}
                className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold focus:bg-white focus:outline-none"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nama}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Pertemuan Ke- *
              </label>
              <input
                type="number"
                min={1}
                required
                value={newPertemuan}
                onChange={(e) => setNewPertemuan(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold focus:bg-white focus:outline-none"
                placeholder="Contoh: 1"
              />
            </div>

            <JamPelajaranField
              label="Jam Tatap Muka *"
              required
              value={newJam}
              onChange={setNewJam}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Mata Pelajaran
            </label>
            <input
              type="text"
              value={newMapel}
              onChange={(e) => setNewMapel(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Materi yang Diajarkan *
            </label>
            <input
              type="text"
              required
              value={newMateri}
              onChange={(e) => setNewMateri(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold focus:bg-white focus:outline-none"
              placeholder="Contoh: Prosedur Keselamatan Kerja & Pengoperasian Alat Praktik"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Kegiatan Pembelajaran & Praktikum
            </label>
            <textarea
              rows={2}
              value={newKegiatan}
              onChange={(e) => setNewKegiatan(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] focus:bg-white focus:outline-none resize-none font-medium"
              placeholder="Contoh: Demonstrasi interaktif, simulasi praktik kelompok, dan evaluasi formatif mandiri..."
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Catatan Siswa / Kehadiran
            </label>
            <input
              type="text"
              value={newCatatanAbsen}
              onChange={(e) => setNewCatatanAbsen(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] focus:bg-white focus:outline-none font-medium"
              placeholder="Contoh: Hadir lengkap 100% atau 1 siswa izin"
            />
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
              <Plus className="w-4 h-4" />
              <span>Simpan Agenda</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
