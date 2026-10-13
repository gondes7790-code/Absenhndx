import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';
import { ClassRoom } from '../types';

interface ClassManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassRoom[];
  activeClass: ClassRoom;
  onSelectClass: (cls: ClassRoom) => void;
  onAddClass: (newClass: Omit<ClassRoom, 'id'>) => void;
  onEditClass: (updatedClass: ClassRoom) => void;
  onDeleteClass: (classId: string) => void;
}

export const ClassManagementModal: React.FC<ClassManagementModalProps> = ({
  isOpen,
  onClose,
  classes,
  activeClass,
  onSelectClass,
  onAddClass,
  onEditClass,
  onDeleteClass,
}) => {
  const [viewState, setViewState] = useState<'list' | 'add' | 'edit'>('list');
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form States
  const [formNama, setFormNama] = useState('');
  const [formTingkat, setFormTingkat] = useState('10');
  const [formJurusan, setFormJurusan] = useState('DKV');
  const [formMapel, setFormMapel] = useState('Dasar-dasar Kejuruan');
  const [formTahunAjaran, setFormTahunAjaran] = useState('2025/2026');
  const [formSemester, setFormSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
  const [formKkm, setFormKkm] = useState<number>(75);
  const [formFormatifCount, setFormFormatifCount] = useState<number>(5);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetForm = () => {
    setFormNama('');
    setFormTingkat('10');
    setFormJurusan('DKV');
    setFormMapel('Dasar-dasar Kejuruan');
    setFormTahunAjaran('2025/2026');
    setFormSemester('Ganjil');
    setFormKkm(75);
    setFormFormatifCount(5);
    setErrorMsg(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setViewState('add');
  };

  const handleOpenEdit = (cls: ClassRoom) => {
    setEditingClass(cls);
    setFormNama(cls.nama);
    setFormTingkat(cls.tingkat || '10');
    setFormJurusan(cls.jurusan || 'Kejuruan');
    setFormMapel(cls.mapel);
    setFormTahunAjaran(cls.tahunAjaran);
    setFormSemester(cls.semester);
    setFormKkm(cls.kkm || 75);
    setFormFormatifCount(cls.formatifCount || 5);
    setErrorMsg(null);
    setViewState('edit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) {
      setErrorMsg('Nama rombel/kelas wajib diisi.');
      return;
    }
    if (!formMapel.trim()) {
      setErrorMsg('Mata pelajaran wajib diisi.');
      return;
    }

    if (viewState === 'add') {
      onAddClass({
        nama: formNama.trim(),
        tingkat: formTingkat.trim(),
        jurusan: formJurusan.trim(),
        mapel: formMapel.trim(),
        tahunAjaran: formTahunAjaran.trim(),
        semester: formSemester,
        kkm: Number(formKkm) || 75,
        formatifCount: Number(formFormatifCount) || 5,
      });
      setViewState('list');
    } else if (viewState === 'edit' && editingClass) {
      onEditClass({
        ...editingClass,
        nama: formNama.trim(),
        tingkat: formTingkat.trim(),
        jurusan: formJurusan.trim(),
        mapel: formMapel.trim(),
        tahunAjaran: formTahunAjaran.trim(),
        semester: formSemester,
        kkm: Number(formKkm) || 75,
        formatifCount: Number(formFormatifCount) || 5,
      });
      setViewState('list');
    }
  };

  const handleDelete = (clsId: string) => {
    if (classes.length <= 1) {
      alert('Tidak dapat menghapus kelas terakhir. Minimal harus ada 1 rombel belajar.');
      return;
    }
    onDeleteClass(clsId);
    setDeleteConfirmId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#fffdf8] w-full max-w-2xl rounded-3xl border-3 border-slate-900 shadow-[8px_8px_0px_#1e293b] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 bg-white border-b-2 border-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e0f2fe] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center justify-center text-sky-950 font-black shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {viewState === 'list' && 'Kelola Kelas & Rombel Belajar'}
                {viewState === 'add' && 'Tambah Rombel / Kelas Baru'}
                {viewState === 'edit' && `Edit Rombel ${editingClass?.nama}`}
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {viewState === 'list' && `Tersedia ${classes.length} rombel pembelajaran aktif.`}
                {viewState === 'add' && 'Tambahkan rombel baru beserta mapel dan KKM.'}
                {viewState === 'edit' && 'Perbarui detail nama, mapel, atau standar KKM kelas ini.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-[#fee2e2] hover:bg-[#fca5a5] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-rose-950 transition-all cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-[#fee2e2] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center gap-2 text-xs font-bold text-rose-950">
              <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {viewState === 'list' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider font-mono">
                  Daftar Rombel ({classes.length})
                </span>
                <button
                  onClick={handleOpenAdd}
                  className="px-3.5 py-1.5 rounded-xl bg-[#6ee7b7] hover:bg-[#34d399] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-xs font-black text-slate-950 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Rombel Baru</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {classes.map((cls) => {
                  const isActive = cls.id === activeClass.id;
                  const isConfirmingDelete = deleteConfirmId === cls.id;

                  return (
                    <div
                      key={cls.id}
                      className={`p-3.5 rounded-2xl border-2 border-slate-900 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-[#dcfce7] shadow-[3px_3px_0px_#1e293b]'
                          : 'bg-white hover:bg-[#faf7ee] shadow-[2px_2px_0px_#1e293b]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl border-2 border-slate-900 flex items-center justify-center font-black text-xs shrink-0 ${
                            isActive ? 'bg-white text-emerald-950' : 'bg-[#e0f2fe] text-sky-950'
                          }`}
                        >
                          {cls.tingkat || '10'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-sm text-slate-900">{cls.nama}</span>
                            {isActive && (
                              <span className="text-[10px] font-mono font-black bg-emerald-800 text-white px-2 py-0.2 rounded-full">
                                AKTIF
                              </span>
                            )}
                            <span className="text-[10px] font-mono bg-white border border-slate-900 px-1.5 py-0.2 rounded font-bold text-slate-700">
                              KKM: {cls.kkm}
                            </span>
                            <span className="text-[10px] font-mono bg-[#fef9c3] border border-slate-900 px-1.5 py-0.2 rounded font-bold text-amber-950">
                              {cls.formatifCount || 5} TP
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium mt-0.5">
                            📚 {cls.mapel} • TA {cls.tahunAjaran} ({cls.semester})
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {!isActive && (
                          <button
                            onClick={() => {
                              onSelectClass(cls);
                              onClose();
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border-2 border-slate-900 text-xs font-black text-slate-900 cursor-pointer shadow-[1px_1px_0px_#1e293b]"
                          >
                            Pilih Kelas
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEdit(cls)}
                          className="p-1.5 rounded-xl bg-[#e0f2fe] hover:bg-[#bae6fd] border-2 border-slate-900 text-sky-950 cursor-pointer shadow-[1px_1px_0px_#1e293b]"
                          title="Edit Kelas"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(cls.id)}
                              className="px-2 py-1 rounded-xl bg-rose-600 text-white border-2 border-slate-900 text-[10px] font-black cursor-pointer"
                            >
                              Yakin?
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 rounded-xl bg-slate-200 text-slate-800 border border-slate-900 text-[10px] font-bold cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              if (classes.length <= 1) {
                                alert('Minimal harus ada 1 kelas terdaftar.');
                                return;
                              }
                              setDeleteConfirmId(cls.id);
                            }}
                            className="p-1.5 rounded-xl bg-[#fee2e2] hover:bg-[#fca5a5] border-2 border-slate-900 text-rose-950 cursor-pointer shadow-[1px_1px_0px_#1e293b]"
                            title="Hapus Kelas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(viewState === 'add' || viewState === 'edit') && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    Nama Rombel / Kelas <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    placeholder="Contoh: X DKV 1, XI RPL 2"
                    className="w-full px-3 py-2 rounded-xl bg-white border-2 border-slate-900 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    Tingkat Kelas
                  </label>
                  <select
                    value={formTingkat}
                    onChange={(e) => setFormTingkat(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border-2 border-slate-900 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="10">Kelas 10 (Fase E)</option>
                    <option value="11">Kelas 11 (Fase F)</option>
                    <option value="12">Kelas 12 (Fase F Lanjutan)</option>
                    <option value="7">Kelas 7 (Fase D)</option>
                    <option value="8">Kelas 8 (Fase D)</option>
                    <option value="9">Kelas 9 (Fase D)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    Mata Pelajaran <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formMapel}
                    onChange={(e) => setFormMapel(e.target.value)}
                    placeholder="Contoh: Dasar-dasar Kejuruan Desain Komunikasi Visual"
                    className="w-full px-3 py-2 rounded-xl bg-white border-2 border-slate-900 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    Tahun Ajaran
                  </label>
                  <input
                    type="text"
                    value={formTahunAjaran}
                    onChange={(e) => setFormTahunAjaran(e.target.value)}
                    placeholder="2025/2026"
                    className="w-full px-3 py-2 rounded-xl bg-white border-2 border-slate-900 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    Semester
                  </label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value as 'Ganjil' | 'Genap')}
                    className="w-full px-3 py-2 rounded-xl bg-white border-2 border-slate-900 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Ganjil">Semester Ganjil</option>
                    <option value="Genap">Semester Genap</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    KKM / Kriteria Ketercapaian
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={formKkm}
                    onChange={(e) => setFormKkm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border-2 border-slate-900 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    Jumlah Kolom Formatif (TP)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={formFormatifCount}
                    onChange={(e) => setFormFormatifCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border-2 border-slate-900 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t-2 border-slate-200 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setViewState('list')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 text-xs font-black text-slate-800 cursor-pointer"
                >
                  Kembali ke Daftar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#6ee7b7] hover:bg-[#34d399] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-xs font-black text-slate-950 cursor-pointer"
                >
                  {viewState === 'add' ? 'Simpan Rombel Baru' : 'Perbarui Kelas'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-3 bg-white border-t-2 border-slate-900 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-xs cursor-pointer shadow-[2px_2px_0px_#1e293b]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
