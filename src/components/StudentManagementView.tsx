import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Cloud,
  FileSpreadsheet,
  Search,
  Edit2,
  Trash2,
  MessageCircle,
  X,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { Student, ClassRoom } from '../types';

interface StudentManagementViewProps {
  activeClass: ClassRoom;
  students: Student[];
  onAddStudent: (student: Omit<Student, 'id' | 'noUrut'>) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onSaveToCloud: () => void;
  schoolName: string;
}

export const StudentManagementView: React.FC<StudentManagementViewProps> = ({
  activeClass,
  students,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onSaveToCloud,
  schoolName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<'no' | 'az' | 'za'>('no');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form states
  const [formNisn, setFormNisn] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formGender, setFormGender] = useState<'L' | 'P'>('L');
  const [formKontak, setFormKontak] = useState('');
  const [formCatatan, setFormCatatan] = useState('');

  // Gender counters
  const genderStats = useMemo(() => {
    let l = 0;
    let p = 0;
    students.forEach((s) => {
      if (s.gender === 'L') l++;
      else p++;
    });
    return { l, p, total: students.length };
  }, [students]);

  // Filtered & sorted students
  const filteredStudents = useMemo(() => {
    let list = [...students];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => s.nama.toLowerCase().includes(q) || s.nisn.includes(q));
    }
    if (sortMode === 'az') {
      list.sort((a, b) => a.nama.localeCompare(b.nama));
    } else if (sortMode === 'za') {
      list.sort((a, b) => b.nama.localeCompare(a.nama));
    } else {
      list.sort((a, b) => a.noUrut - b.noUrut);
    }
    return list;
  }, [students, searchQuery, sortMode]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormNisn(`00${Math.floor(10000000 + Math.random() * 90000000)}`);
    setFormNama('');
    setFormGender('L');
    setFormKontak('0812-3456-7890');
    setFormCatatan('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Student) => {
    setEditingStudent(s);
    setFormNisn(s.nisn);
    setFormNama(s.nama);
    setFormGender(s.gender);
    setFormKontak(s.kontakOrtu);
    setFormCatatan(s.catatan || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) return;

    if (editingStudent) {
      onEditStudent({
        ...editingStudent,
        nisn: formNisn,
        nama: formNama,
        gender: formGender,
        kontakOrtu: formKontak,
        catatan: formCatatan,
      });
    } else {
      onAddStudent({
        nisn: formNisn,
        nama: formNama,
        gender: formGender,
        classId: activeClass.id,
        kontakOrtu: formKontak,
        catatan: formCatatan,
      });
    }

    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['NO', 'NISN', 'NAMA LENGKAP', 'L/P', 'KONTAK ORTU', 'CATATAN'];
    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      `"${s.nisn}"`,
      `"${s.nama}"`,
      s.gender,
      `"${s.kontakOrtu}"`,
      `"${(s.catatan || '').replace(/"/g, '""')}"`,
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Data_Murid_${activeClass.nama}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Header Card - Vintage Postmodern Neobrutalist */}
      <div className="bg-[#fffdf8] rounded-3xl p-4 sm:p-6 border-2 border-slate-900 shadow-[4px_4px_0px_#1e293b] relative overflow-hidden">
        {/* Retro Corner Stamp with Fire */}
        <div className="absolute top-0 right-0 bg-[#ffedd5] border-b-2 border-l-2 border-slate-900 px-3 py-1 rounded-bl-2xl text-[10px] font-mono font-bold text-orange-950 flex items-center gap-1 shadow-xs">
          <Flame className="w-3 h-3 text-orange-600 fill-orange-500" />
          <span>MANAJEMEN MURID</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 sm:pt-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-slate-600 mb-1.5 flex-wrap">
              <span className="bg-[#fef9c3] text-amber-950 px-2.5 py-0.5 rounded-full border-2 border-slate-900 font-mono text-[11px] shadow-[1.5px_1.5px_0px_#1e293b]">
                {activeClass.nama}
              </span>
              <span>•</span>
              <span className="font-bold text-slate-700">Rombel Belajar</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Manajemen Data Murid
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              Total {genderStats.total} murid terdaftar ({genderStats.l} Laki-laki, {genderStats.p} Perempuan) • {schoolName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              onClick={onSaveToCloud}
              className="px-3.5 py-2 rounded-2xl bg-[#a7f3d0] hover:bg-[#6ee7b7] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-slate-950 text-xs sm:text-sm font-black flex items-center gap-2 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] transition-all cursor-pointer"
            >
              <Cloud className="w-4 h-4 text-emerald-950" />
              <span>Simpan ke Cloud</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-2xl bg-[#fef9c3] hover:bg-[#fde047] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-amber-950 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-900" />
              <span>Ekspor Kelas Ini</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="px-3.5 py-2 rounded-2xl bg-[#ede9fe] hover:bg-[#ddd6fe] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-indigo-950 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-indigo-900" />
              <span>Tambah Murid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table: Data Murid */}
      <div className="bg-white border-2 border-slate-900 rounded-3xl shadow-[4px_4px_0px_#1e293b] overflow-hidden">
        {/* Table Top Controls */}
        <div className="p-4 border-b-2 border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fffdf8]">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama murid atau NISN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-2xl bg-[#faf7ee] border-2 border-slate-900 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:shadow-[2px_2px_0px_#0d9488]"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600 hidden sm:inline">
              Menampilkan {filteredStudents.length} dari {students.length} murid
            </span>
            <div className="flex items-center bg-white p-1 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] shrink-0 gap-1">
              <button
                onClick={() => setSortMode('no')}
                className={`px-2.5 py-1 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  sortMode === 'no' ? 'bg-[#dcfce7] text-slate-900 border border-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                No Urut
              </button>
              <button
                onClick={() => setSortMode('az')}
                className={`px-2.5 py-1 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  sortMode === 'az' ? 'bg-[#e0f2fe] text-slate-900 border border-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                A-Z
              </button>
              <button
                onClick={() => setSortMode('za')}
                className={`px-2.5 py-1 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  sortMode === 'za' ? 'bg-[#ede9fe] text-slate-900 border border-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Z-A
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#faf7ee] text-slate-900 font-black text-[11px] tracking-wider uppercase border-b-2 border-slate-900">
                <th className="py-3 px-3 w-12 text-center">NO</th>
                <th className="py-3 px-4 w-32">NISN</th>
                <th className="py-3 px-4 min-w-[200px]">NAMA LENGKAP</th>
                <th className="py-3 px-3 w-16 text-center">L/P</th>
                <th className="py-3 px-4 min-w-[150px]">KONTAK WALI MURID</th>
                <th className="py-3 px-4 min-w-[220px]">CATATAN KHUSUS</th>
                <th className="py-3 px-4 w-28 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {filteredStudents.map((student, idx) => (
                <tr key={student.id} className="hover:bg-[#faf7ee]/60 transition-colors">
                  <td className="py-3 px-3 text-center text-slate-600 font-mono font-bold">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-600">
                    {student.nisn}
                  </td>
                  <td className="py-3 px-4 font-black text-slate-900">
                    {student.nama}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block w-6 h-6 rounded-xl bg-[#faf7ee] text-slate-900 font-black text-xs leading-6 text-center border-2 border-slate-900 shadow-[1px_1px_0px_#1e293b]">
                      {student.gender}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-mono font-medium">
                    {student.kontakOrtu || '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-600 italic">
                    {student.catatan || 'Tidak ada catatan'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(student)}
                        className="p-1.5 rounded-xl bg-[#e0f2fe] hover:bg-[#bae6fd] text-sky-950 border border-slate-900 shadow-[1px_1px_0px_#1e293b] transition-all cursor-pointer"
                        title="Edit Data Siswa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteStudent(student.id)}
                        className="p-1.5 rounded-xl bg-[#fee2e2] hover:bg-[#fca5a5] text-rose-950 border border-slate-900 shadow-[1px_1px_0px_#1e293b] transition-all cursor-pointer"
                        title="Hapus Siswa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border-3 border-slate-900 rounded-3xl p-6 shadow-[6px_6px_0px_#1e293b] relative animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-900">
                {editingStudent ? 'Edit Data Murid' : 'Tambah Murid Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-[#fee2e2] border border-slate-900 text-rose-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nomor Induk Siswa Nasional (NISN)
                </label>
                <input
                  type="text"
                  required
                  value={formNisn}
                  onChange={(e) => setFormNisn(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-mono font-bold focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nama Lengkap Murid *
                </label>
                <input
                  type="text"
                  required
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as 'L' | 'P')}
                    className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold focus:bg-white focus:outline-none"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    No. WhatsApp Wali
                  </label>
                  <input
                    type="text"
                    value={formKontak}
                    onChange={(e) => setFormKontak(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-mono font-bold focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Catatan Siswa
                </label>
                <textarea
                  rows={2}
                  value={formCatatan}
                  onChange={(e) => setFormCatatan(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] focus:bg-white focus:outline-none resize-none font-medium"
                  placeholder="Catatan prestasi, kondisi khusus, dll."
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
                  className="px-5 py-2 rounded-xl bg-[#a7f3d0] hover:bg-[#6ee7b7] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] font-black text-slate-950 cursor-pointer"
                >
                  {editingStudent ? 'Simpan Perubahan' : 'Tambahkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
