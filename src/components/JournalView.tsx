import React, { useState, useMemo } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Download,
  Eye,
  Plus,
  Cloud,
  Search,
  Filter,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  X,
  Flame,
  Printer,
  RefreshCw,
  Edit2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { JournalEntry, ClassRoom, TeacherProfile, PrintConfig } from '../types';
import { PrintableDocument } from './PrintableDocument';

interface JournalViewProps {
  journals: JournalEntry[];
  classes: ClassRoom[];
  teacher: TeacherProfile;
  onAddJournal: (entry: Omit<JournalEntry, 'id'>) => void;
  onUpdateJournal?: (entry: JournalEntry) => void;
  onDeleteJournal?: (id: string) => void;
  onSaveToCloud: () => void;
  schoolName: string;
  onSyncAttendance?: () => void;
  printConfig?: PrintConfig;
}

export const JournalView: React.FC<JournalViewProps> = ({
  journals,
  classes,
  teacher,
  onAddJournal,
  onUpdateJournal,
  onDeleteJournal,
  onSaveToCloud,
  schoolName,
  onSyncAttendance,
  printConfig,
}) => {
  const [filterClass, setFilterClass] = useState('Semua');
  const [filterMonth, setFilterMonth] = useState('Semua');
  const [filterSemester, setFilterSemester] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // New entry form state
  const [newTanggal, setNewTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [newClassId, setNewClassId] = useState(classes[0]?.id || 'class-1');
  const [newMapel, setNewMapel] = useState(classes[0]?.mapel || 'Bahasa Inggris & Kejuruan');
  const [newPertemuan, setNewPertemuan] = useState('Ke-1');
  const [newJam, setNewJam] = useState('07:15 - 09:15 WIB');
  const [newMateri, setNewMateri] = useState('');
  const [newKegiatan, setNewKegiatan] = useState('');
  const [newCatatanAbsen, setNewCatatanAbsen] = useState('');

  // Edit existing entry state
  const [editingJournal, setEditingJournal] = useState<JournalEntry | null>(null);
  const [editTanggal, setEditTanggal] = useState('');
  const [editClassId, setEditClassId] = useState('');
  const [editClassName, setEditClassName] = useState('');
  const [editMapel, setEditMapel] = useState('');
  const [editPertemuan, setEditPertemuan] = useState('');
  const [editJam, setEditJam] = useState('');
  const [editMateri, setEditMateri] = useState('');
  const [editKegiatan, setEditKegiatan] = useState('');
  const [editCatatanAbsen, setEditCatatanAbsen] = useState('');
  const [editSemester, setEditSemester] = useState('');

  // Filtered journals
  const filteredJournals = useMemo(() => {
    return journals.filter((j) => {
      const matchClass = filterClass === 'Semua' || j.className === filterClass;
      const matchSemester = filterSemester === 'Semua' || j.semester === filterSemester;
      const matchSearch =
        searchQuery.trim() === '' ||
        j.materiKegiatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.pertemuanKe.toLowerCase().includes(searchQuery.toLowerCase());

      return matchClass && matchSemester && matchSearch;
    });
  }, [journals, filterClass, filterSemester, searchQuery]);

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
      pertemuanKe: newPertemuan,
      jamPelajaran: newJam,
      materiKegiatan: combinedMateriKegiatan,
      materi: newMateri.trim(),
      kegiatan: newKegiatan.trim(),
      absensiCatatan: newCatatanAbsen.trim() || 'Nihil / Seluruh siswa hadir tertib.',
      semester: `${targetClass?.tahunAjaran || '2026/2027'} (${targetClass?.semester || 'Ganjil'})`,
    });

    setIsModalOpen(false);
    setNewMateri('');
    setNewKegiatan('');
    setNewCatatanAbsen('');
  };

  const handleOpenEdit = (j: JournalEntry) => {
    setEditingJournal(j);
    setEditTanggal(j.tanggal);
    setEditClassId(j.classId);
    setEditClassName(j.className);
    setEditMapel(j.mapel);
    setEditPertemuan(j.pertemuanKe);
    setEditJam(j.jamPelajaran);

    if (j.materi && j.kegiatan) {
      setEditMateri(j.materi);
      setEditKegiatan(j.kegiatan);
    } else if (j.materiKegiatan.includes(' — ')) {
      const parts = j.materiKegiatan.split(' — ');
      setEditMateri(parts[0] || '');
      setEditKegiatan(parts.slice(1).join(' — ') || '');
    } else {
      setEditMateri(j.materiKegiatan);
      setEditKegiatan('');
    }

    setEditCatatanAbsen(j.absensiCatatan || '');
    setEditSemester(j.semester || '2026/2027 (Ganjil)');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJournal || !onUpdateJournal) return;

    const targetClass = classes.find((c) => c.id === editClassId);
    const className = targetClass?.nama || editClassName;
    const combinedMateriKegiatan = editKegiatan.trim()
      ? `${editMateri.trim()} — ${editKegiatan.trim()}`
      : editMateri.trim();

    const updated: JournalEntry = {
      ...editingJournal,
      tanggal: editTanggal,
      classId: editClassId,
      className,
      mapel: editMapel,
      pertemuanKe: editPertemuan,
      jamPelajaran: editJam,
      materiKegiatan: combinedMateriKegiatan,
      materi: editMateri.trim(),
      kegiatan: editKegiatan.trim(),
      absensiCatatan: editCatatanAbsen.trim(),
      semester: editSemester,
    };

    onUpdateJournal(updated);
    setIsEditModalOpen(false);
    setEditingJournal(null);
  };

  const handleExportCSV = () => {
    const headers = ['NO', 'TANGGAL', 'KELAS', 'MAPEL', 'PERTEMUAN', 'JAM', 'MATERI & KEGIATAN TP', 'CATATAN ABSENSI'];
    const rows = filteredJournals.map((j, idx) => [
      idx + 1,
      `"${j.tanggal}"`,
      `"${j.className}"`,
      `"${j.mapel}"`,
      `"${j.pertemuanKe}"`,
      `"${j.jamPelajaran}"`,
      `"${j.materiKegiatan.replace(/"/g, '""')}"`,
      `"${(j.absensiCatatan || '').replace(/"/g, '""')}"`,
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Agenda_Mengajar_${teacher.handle}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Header Card - Vintage Postmodern Neobrutalist */}
      <div className="bg-[#fffdf8] rounded-3xl p-4 sm:p-6 border-2 border-slate-900 shadow-[4px_4px_0px_#1e293b] relative overflow-hidden">
        {/* Retro Corner Stamp with Fire */}
        <div className="absolute top-0 right-0 bg-[#ede9fe] border-b-2 border-l-2 border-slate-900 px-3 py-1 rounded-bl-2xl text-[10px] font-mono font-bold text-indigo-950 flex items-center gap-1 shadow-xs">
          <Flame className="w-3 h-3 text-orange-600 fill-orange-500" />
          <span>AGENDA MENGAJAR</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 sm:pt-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-slate-600 mb-1.5 flex-wrap">
              <span className="bg-[#fef9c3] text-amber-950 px-2.5 py-0.5 rounded-full border-2 border-slate-900 font-mono text-[11px] shadow-[1.5px_1.5px_0px_#1e293b]">
                {filterClass === 'Semua' ? 'Semua Rombel' : filterClass}
              </span>
              <span>•</span>
              <span className="font-bold text-slate-700">T.A. 2026/2027 (Ganjil)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Buku Jurnal / Agenda Mengajar Pendidik
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              Pencatatan tatap muka, materi TP Kurikulum Merdeka, dan dinamika kelas {schoolName}
            </p>
          </div>

          {/* Action Button Strip */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {onSyncAttendance && (
              <button
                onClick={onSyncAttendance}
                className="px-3.5 py-2 rounded-2xl bg-[#ccfbf1] hover:bg-[#99f6e4] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-teal-950 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer"
                title="Sinkronkan catatan kehadiran dari buku presensi"
              >
                <RefreshCw className="w-4 h-4 text-teal-900" />
                <span>Sinkronkan Presensi</span>
              </button>
            )}

            <button
              onClick={() => setShowPrintModal(true)}
              className="px-3.5 py-2 rounded-2xl bg-[#fee2e2] hover:bg-[#fca5a5] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-rose-950 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer"
              title="Cetak Kertas Agenda Formal A4 Putih"
            >
              <Printer className="w-4 h-4 text-rose-900" />
              <span>Kertas Cetak</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-2xl bg-[#fef9c3] hover:bg-[#fde047] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-amber-950 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer"
              title="Ekspor ke Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-900" />
              <span>Excel</span>
            </button>

            <button
              onClick={onSaveToCloud}
              className="px-3.5 py-2 rounded-2xl bg-[#a7f3d0] hover:bg-[#6ee7b7] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-slate-950 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Cloud className="w-4 h-4 text-emerald-950" />
              <span>Simpan Cloud</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-[#ede9fe] hover:bg-[#ddd6fe] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-indigo-950 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-indigo-950" />
              <span>Catat Agenda</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards in Pastel Neobrutalism */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t-2 border-slate-100">
          <div className="bg-[#faf7ee] rounded-2xl p-3 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b]">
            <span className="text-[10px] font-mono font-black text-slate-700 uppercase tracking-wider">
              TOTAL AGENDA
            </span>
            <p className="text-2xl font-black text-slate-950 font-mono mt-0.5">
              {filteredJournals.length}
            </p>
            <span className="text-[10px] font-bold text-slate-500">pertemuan KBM</span>
          </div>

          <div className="bg-[#e0f2fe] rounded-2xl p-3 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b]">
            <span className="text-[10px] font-mono font-black text-sky-950 uppercase tracking-wider">
              KELAS TERPANTAU
            </span>
            <p className="text-2xl font-black text-slate-950 font-mono mt-0.5">
              {classes.length}
            </p>
            <span className="text-[10px] font-bold text-sky-800">kelas binaan</span>
          </div>

          <div className="bg-[#dcfce7] rounded-2xl p-3 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b]">
            <span className="text-[10px] font-mono font-black text-emerald-950 uppercase tracking-wider">
              SINKRONISASI PRESENSI
            </span>
            <p className="text-2xl font-black text-emerald-950 font-mono mt-0.5">
              100%
            </p>
            <span className="text-[10px] font-bold text-emerald-800">terkoneksi otomatis</span>
          </div>

          <div className="bg-[#ffedd5] rounded-2xl p-3 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b]">
            <span className="text-[10px] font-mono font-black text-orange-950 uppercase tracking-wider">
              EDIT MANUAL
            </span>
            <p className="text-base font-black text-slate-950 mt-1 truncate">
              Tersedia Lengkap
            </p>
            <span className="text-[10px] font-bold text-orange-800">Akses Edit Bebas</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              FILTER KELAS
            </label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-3 py-1.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold text-slate-900 focus:outline-none"
            >
              <option value="Semua">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.nama}>{c.nama}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              BULAN KEGIATAN
            </label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-3 py-1.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold text-slate-900 focus:outline-none"
            >
              <option value="Semua">Semua Bulan</option>
              <option value="10">Oktober 2026</option>
              <option value="09">September 2026</option>
              <option value="08">Agustus 2026</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              SEMESTER
            </label>
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="w-full px-3 py-1.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold text-slate-900 focus:outline-none"
            >
              <option value="Semua">Semua Semester</option>
              <option value="2026/2027 (Ganjil)">2026/2027 (Ganjil)</option>
              <option value="2026/2027 (Genap)">2026/2027 (Genap)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              CARI MATERI TP
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Kata kunci materi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-slate-900 font-bold focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table: Jurnal Mengajar */}
      <div className="bg-white border-2 border-slate-900 rounded-3xl shadow-[4px_4px_0px_#1e293b] overflow-hidden">
        <div className="p-4 border-b-2 border-slate-100 flex items-center justify-between bg-[#fffdf8]">
          <h3 className="text-sm sm:text-base font-black text-slate-900">
            Daftar Agenda Pembelajaran Terjadwal ({filteredJournals.length} Pertemuan)
          </h3>
          <span className="text-xs font-mono font-bold bg-[#dcfce7] border border-slate-900 px-2.5 py-0.5 rounded-full text-emerald-950 shadow-[1px_1px_0px_#1e293b]">
            EDIT MANUAL AKTIF
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#faf7ee] text-slate-900 font-black text-[11px] tracking-wider uppercase border-b-2 border-slate-900">
                <th className="py-3 px-3 w-10 text-center">NO</th>
                <th className="py-3 px-3 w-28">TANGGAL</th>
                <th className="py-3 px-3 min-w-[150px] max-w-[200px]">KELAS & SESI</th>
                <th className="py-3 px-3 w-28 whitespace-nowrap">JAM KBM</th>
                <th className="py-3 px-4 min-w-[280px]">MATERI & KEGIATAN TP MERDEKA</th>
                <th className="py-3 px-4 min-w-[200px]">CATATAN PRESENSI SISWA</th>
                <th className="py-3 px-3 min-w-[100px] text-center whitespace-nowrap">AKSI EDIT</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {filteredJournals.map((j, idx) => (
                <tr key={j.id} className="hover:bg-[#faf7ee]/60 transition-colors group">
                  <td className="py-3 px-3 text-center text-slate-600 font-mono font-bold whitespace-nowrap">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {j.tanggal}
                  </td>
                  <td className="py-3 px-3 min-w-[150px] max-w-[200px]">
                    <span className="font-black text-slate-900 block truncate" title={j.className}>
                      {j.className}
                    </span>
                    <span
                      className="inline-block mt-1 text-[10px] font-bold text-emerald-950 bg-[#dcfce7] px-2 py-0.5 rounded-md border border-slate-900 max-w-full truncate align-middle shadow-[0.5px_0.5px_0px_#1e293b]"
                      title={j.pertemuanKe}
                    >
                      {j.pertemuanKe}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-mono font-medium">
                    {j.jamPelajaran}
                  </td>
                  <td className="py-3 px-4 text-slate-900 font-medium leading-relaxed">
                    {j.materiKegiatan}
                  </td>
                  <td className="py-3 px-4 text-slate-600 italic">
                    {j.absensiCatatan}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(j)}
                        className="p-1.5 rounded-xl bg-[#e0f2fe] hover:bg-[#bae6fd] text-sky-950 border border-slate-900 shadow-[1px_1px_0px_#1e293b] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                        title="Edit Manual Agenda Mengajar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {onDeleteJournal && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus catatan agenda pertemuan ${j.pertemuanKe} kelas ${j.className}?`)) {
                              onDeleteJournal(j.id);
                            }
                          }}
                          className="p-1.5 rounded-xl bg-[#fee2e2] hover:bg-[#fca5a5] text-rose-950 border border-slate-900 shadow-[1px_1px_0px_#1e293b] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                          title="Hapus Agenda"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Catat Agenda Baru */}
      {isModalOpen && (
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
                onClick={() => setIsModalOpen(false)}
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
                    type="text"
                    required
                    value={newPertemuan}
                    onChange={(e) => setNewPertemuan(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold focus:bg-white focus:outline-none"
                    placeholder="Contoh: Ke-1"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Jam Tatap Muka *
                  </label>
                  <input
                    type="text"
                    required
                    value={newJam}
                    onChange={(e) => setNewJam(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold focus:bg-white focus:outline-none"
                    placeholder="Contoh: 07:15 - 09:15 WIB"
                  />
                </div>
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
                  onClick={() => setIsModalOpen(false)}
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
      )}

      {/* Modal: Edit Manual Agenda Mengajar yang Sudah Diinput */}
      {isEditModalOpen && editingJournal && (
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
                onClick={() => setIsEditModalOpen(false)}
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
                    type="text"
                    required
                    value={editPertemuan}
                    onChange={(e) => setEditPertemuan(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold focus:bg-white focus:outline-none"
                    placeholder="Contoh: Ke-1"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Jam Tatap Muka *
                  </label>
                  <input
                    type="text"
                    required
                    value={editJam}
                    onChange={(e) => setEditJam(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold focus:bg-white focus:outline-none"
                    placeholder="Contoh: 07:15 - 09:15 WIB"
                  />
                </div>
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
                        setIsEditModalOpen(false);
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
                    onClick={() => setIsEditModalOpen(false)}
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
      )}

      {/* Formal Printable Document */}
      <PrintableDocument
        type="journal"
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        activeClass={classes[0]}
        teacher={teacher}
        schoolName={schoolName}
        printConfig={printConfig}
        journals={filteredJournals}
      />
    </div>
  );
};
