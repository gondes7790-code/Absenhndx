import React, { useState } from 'react';
import { CheckCircle2, Edit2, Trash2, X } from 'lucide-react';
import { ClassRoom, JournalEntry } from '../../types';
import { JamPelajaranField } from '../common/JamPelajaranField';

function splitMateriKegiatan(j: JournalEntry): { materi: string; kegiatan: string } {
  if (j.materi && j.kegiatan) return { materi: j.materi, kegiatan: j.kegiatan };
  if (j.materiKegiatan.includes(' — ')) {
    const parts = j.materiKegiatan.split(' — ');
    return { materi: parts[0] || '', kegiatan: parts.slice(1).join(' — ') || '' };
  }
  return { materi: j.materiKegiatan, kegiatan: '' };
}

interface EditJournalModalProps {
  journal: JournalEntry;
  classes: ClassRoom[];
  onClose: () => void;
  onUpdateJournal?: (entry: JournalEntry) => void;
  onDeleteJournal?: (id: string) => void;
}

/** Edit manual agenda mengajar; state formulir diisi dari agenda saat modal dipasang. */
export const EditJournalModal: React.FC<EditJournalModalProps> = ({
  journal: editingJournal,
  classes,
  onClose,
  onUpdateJournal,
  onDeleteJournal,
}) => {
  const initial = splitMateriKegiatan(editingJournal);
  const [editTanggal, setEditTanggal] = useState(editingJournal.tanggal);
  const [editClassId, setEditClassId] = useState(editingJournal.classId);
  const [editClassName, setEditClassName] = useState(editingJournal.className);
  const [editMapel, setEditMapel] = useState(editingJournal.mapel);
  const [editPertemuan, setEditPertemuan] = useState<number>(Number(editingJournal.pertemuanKe) || 1);
  const [editJam, setEditJam] = useState(editingJournal.jamPelajaran);
  const [editMateri, setEditMateri] = useState(initial.materi);
  const [editKegiatan, setEditKegiatan] = useState(initial.kegiatan);
  const [editCatatanAbsen, setEditCatatanAbsen] = useState(editingJournal.absensiCatatan || '');
  const [editSemester, setEditSemester] = useState(editingJournal.semester || '2026/2027 (Ganjil)');

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateJournal) return;

    const targetClass = classes.find((c) => c.id === editClassId);
    const className = targetClass?.nama || editClassName;
    const combinedMateriKegiatan = editKegiatan.trim()
      ? `${editMateri.trim()} — ${editKegiatan.trim()}`
      : editMateri.trim();

    onUpdateJournal({
      ...editingJournal,
      tanggal: editTanggal,
      classId: editClassId,
      className,
      mapel: editMapel,
      pertemuanKe: Number(editPertemuan) || 1,
      jamPelajaran: editJam,
      materiKegiatan: combinedMateriKegiatan,
      materi: editMateri.trim(),
      kegiatan: editKegiatan.trim(),
      absensiCatatan: editCatatanAbsen.trim(),
      semester: editSemester,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white border-3 border-slate-900 rounded-3xl p-6 shadow-[6px_6px_0px_#1e293b] relative animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#e0f2fe] border border-slate-900 text-sky-950">
              <Edit2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Edit Manual Agenda Mengajar
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Ubah materi, kegiatan, jam atau tanggal agenda yang sudah tersimpan
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

        <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Tanggal Pertemuan *
              </label>
              <input
                type="date"
                required
                value={editTanggal}
                onChange={(e) => setEditTanggal(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-mono font-bold focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Pilih Kelas
              </label>
              <select
                value={editClassId}
                onChange={(e) => {
                  setEditClassId(e.target.value);
                  const target = classes.find((c) => c.id === e.target.value);
                  if (target) {
                    setEditClassName(target.nama);
                    setEditMapel(target.mapel);
                  }
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
                value={editPertemuan}
                onChange={(e) => setEditPertemuan(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold focus:bg-white focus:outline-none"
                placeholder="Contoh: 1"
              />
            </div>

            <JamPelajaranField
              label="Jam Tatap Muka *"
              required
              value={editJam}
              onChange={setEditJam}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Mata Pelajaran
            </label>
            <input
              type="text"
              value={editMapel}
              onChange={(e) => setEditMapel(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Materi yang Diajarkan *
            </label>
            <textarea
              rows={2}
              required
              value={editMateri}
              onChange={(e) => setEditMateri(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold focus:bg-white focus:outline-none resize-none"
              placeholder="Uraikan materi atau capaian TP..."
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Kegiatan Pembelajaran & Praktikum
            </label>
            <textarea
              rows={2}
              value={editKegiatan}
              onChange={(e) => setEditKegiatan(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] focus:bg-white focus:outline-none resize-none font-medium"
              placeholder="Aktivitas siswa, metode, dan refleksi..."
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Catatan Presensi Siswa / Keterangan Kehadiran
            </label>
            <input
              type="text"
              value={editCatatanAbsen}
              onChange={(e) => setEditCatatanAbsen(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] focus:bg-white focus:outline-none font-medium"
              placeholder="Contoh: Hadir lengkap 100% atau rincian siswa sakit/izin"
            />
          </div>

          <div className="mt-5 pt-3 border-t-2 border-slate-100 flex items-center justify-between">
            {onDeleteJournal && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Hapus agenda mengajar ini?')) {
                    onDeleteJournal(editingJournal.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 rounded-xl bg-[#fee2e2] hover:bg-[#fca5a5] text-rose-950 border-2 border-slate-900 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            )}

            <div className="flex gap-2 ml-auto">
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
                <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
