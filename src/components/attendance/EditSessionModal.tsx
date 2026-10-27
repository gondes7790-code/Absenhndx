import React, { useState } from 'react';
import { X, Edit2, Calendar, Clock, BookOpen, Layers, Save, RotateCcw, Trash2, CheckCircle2 } from 'lucide-react';
import { AttendanceSession } from '../../types';
import { JamPelajaranField } from '../common/JamPelajaranField';

interface EditSessionModalProps {
  session: AttendanceSession;
  onClose: () => void;
  onSubmit: (updated: AttendanceSession) => void;
  onDeleteSession?: (sessionId: string) => void;
}

/** Edit manual sesi absen yang sudah diinput; state formulir diisi dari sesi saat modal dipasang. */
export const EditSessionModal: React.FC<EditSessionModalProps> = ({
  session: activeSession,
  onClose,
  onSubmit,
  onDeleteSession,
}) => {
  const [editPertemuan, setEditPertemuan] = useState<number>(activeSession.pertemuanKe);
  const [editTanggal, setEditTanggal] = useState<string>(activeSession.tanggal);
  const [editMapel, setEditMapel] = useState<string>(activeSession.mapel);
  const [editJam, setEditJam] = useState<string>(activeSession.jamPelajaran || '07.15 - 09.15 WIB');
  const [editMateri, setEditMateri] = useState<string>(activeSession.materi || '');
  const [editKegiatan, setEditKegiatan] = useState<string>(activeSession.kegiatan || '');
  const [editCatatan, setEditCatatan] = useState<string>(activeSession.catatan || '');

  const handleSubmitEditSession = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...activeSession,
      pertemuanKe: editPertemuan,
      tanggal: editTanggal,
      mapel: editMapel,
      jamPelajaran: editJam,
      materi: editMateri.trim(),
      kegiatan: editKegiatan.trim(),
      catatan:
        editMateri.trim() && editKegiatan.trim()
          ? `${editMateri.trim()} — ${editKegiatan.trim()}`
          : editMateri.trim() || editCatatan,
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
                Edit Manual Sesi Absen & Agenda Mengajar
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Edit data pertemuan yang sudah diinput & perbarui otomatis ke Agenda Mengajar
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

        <form onSubmit={handleSubmitEditSession} className="space-y-3.5 text-xs">
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
                onChange={(e) => setEditPertemuan(parseInt(e.target.value) || 1)}
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
                value={editTanggal}
                onChange={(e) => setEditTanggal(e.target.value)}
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
                value={editMapel}
                onChange={(e) => setEditMapel(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold focus:bg-white focus:outline-none"
              />
            </div>

            <JamPelajaranField
              label="Jam Tatap Muka"
              value={editJam}
              onChange={setEditJam}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Materi yang Diajarkan *
            </label>
            <input
              type="text"
              required
              value={editMateri}
              onChange={(e) => setEditMateri(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold focus:bg-white focus:outline-none"
              placeholder="Uraikan materi pembelajaran..."
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
              placeholder="Uraikan metode, diskusi, atau praktikum..."
            />
          </div>

          <div className="mt-5 pt-3 border-t-2 border-slate-100 flex items-center justify-between">
            {onDeleteSession && (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      `Hapus sesi pertemuan Ke-${activeSession.pertemuanKe} (${activeSession.tanggal}) beserta riwayat absensinya?`
                    )
                  ) {
                    onDeleteSession(activeSession.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 rounded-xl bg-[#fee2e2] hover:bg-[#fca5a5] text-rose-950 border-2 border-slate-900 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Sesi</span>
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
                <span>Simpan & Sinkronkan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
