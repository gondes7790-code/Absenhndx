import React from 'react';
import { CheckCircle2, Search, Users } from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, Student } from '../../types';
import { StudentAttendanceRow } from './StudentAttendanceRow';

export type SortMode = 'no' | 'az' | 'za';

interface StudentAttendanceTableProps {
  filteredStudents: Student[];
  recordsMap: Map<string, AttendanceRecord>;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortMode: SortMode;
  onSortChange: (mode: SortMode) => void;
  onSetAllHadir: () => void;
  onUpdateRecord: (studentId: string, status: AttendanceStatus, keterangan?: string) => void;
  onOpenWhatsAppModal: (student?: Student) => void;
  onDeleteStudent?: (studentId: string) => void;
}

/** Kartu tabel presensi murid: kontrol cari/urut + baris murid. */
export const StudentAttendanceTable: React.FC<StudentAttendanceTableProps> = ({
  filteredStudents,
  recordsMap,
  searchQuery,
  onSearchChange,
  sortMode,
  onSortChange,
  onSetAllHadir,
  onUpdateRecord,
  onOpenWhatsAppModal,
  onDeleteStudent,
}) => (
  <div className="bg-white border-2 border-slate-900 rounded-3xl shadow-[4px_4px_0px_#1e293b] overflow-hidden">
    {/* Table Top Controls */}
    <div className="p-4 border-b-2 border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fffdf8]">
      <div>
        <h3 className="text-base font-black text-slate-900">
          Daftar Kehadiran Murid ({filteredStudents.length} Siswa)
        </h3>
        <p className="text-[11px] text-slate-500 font-medium">
          Nomor urut absen otomatis bergeser berurutan jika ada data siswa yang dihapus.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onSetAllHadir}
          className="px-3 py-1.5 rounded-2xl bg-[#6ee7b7] hover:bg-[#34d399] active:translate-x-[1px] active:translate-y-[1px] text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] cursor-pointer shrink-0"
          title="Setel semua siswa menjadi Hadir (100%)"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
          <span>Semua Hadir</span>
        </button>

        <div className="relative flex-1 sm:w-64 min-w-[160px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari murid atau NISN..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-2xl bg-[#faf7ee] border-2 border-slate-900 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center bg-white p-1 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] shrink-0 gap-1">
          <button
            onClick={() => onSortChange('no')}
            className={`px-2.5 py-1 text-xs font-black rounded-xl transition-all cursor-pointer ${
              sortMode === 'no'
                ? 'bg-[#dcfce7] text-slate-900 border border-slate-900'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            No
          </button>
          <button
            onClick={() => onSortChange('az')}
            className={`px-2.5 py-1 text-xs font-black rounded-xl transition-all cursor-pointer ${
              sortMode === 'az'
                ? 'bg-[#e0f2fe] text-slate-900 border border-slate-900'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            A-Z
          </button>
          <button
            onClick={() => onSortChange('za')}
            className={`px-2.5 py-1 text-xs font-black rounded-xl transition-all cursor-pointer ${
              sortMode === 'za'
                ? 'bg-[#ede9fe] text-slate-900 border border-slate-900'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Z-A
          </button>
        </div>
      </div>
    </div>

    {/* Scrollable Table */}
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs sm:text-sm">
        <thead>
          <tr className="bg-[#faf7ee] text-slate-900 font-black text-xs tracking-wider uppercase border-b-2 border-slate-900">
            <th className="py-3 px-3 w-12 text-center whitespace-nowrap">NO</th>
            <th className="py-3 px-4 min-w-[180px]">NAMA MURID</th>
            <th className="py-3 px-2 w-12 text-center whitespace-nowrap">L/P</th>
            <th className="py-3 px-3 min-w-[230px] text-center whitespace-nowrap">PRESENSI (H/S/I/A/D)</th>
            <th className="py-3 px-3 min-w-[180px] max-w-[250px]">KETERANGAN / ALASAN</th>
            <th className="py-3 px-3 min-w-[135px] text-center whitespace-nowrap">AKSI</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-slate-100">
          {filteredStudents.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-10 text-center text-slate-500 font-bold bg-[#faf7ee]/30">
                <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-700 font-black">
                  {searchQuery ? 'Tidak ada siswa yang sesuai pencarian' : 'Belum Ada Murid di Kelas Ini'}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {searchQuery
                    ? 'Coba kata kunci pencarian lain'
                    : 'Buka tab "Data Murid" untuk mendaftarkan siswa ke kelas ini.'}
                </p>
              </td>
            </tr>
          ) : (
            filteredStudents.map((student, idx) => {
              const record = recordsMap.get(student.id);
              return (
                <StudentAttendanceRow
                  key={student.id}
                  student={student}
                  displayNo={student.noUrut || idx + 1}
                  status={record?.status || ''}
                  keterangan={record?.keterangan || ''}
                  onUpdateRecord={onUpdateRecord}
                  onOpenWhatsAppModal={onOpenWhatsAppModal}
                  onDeleteStudent={onDeleteStudent}
                />
              );
            }))}
        </tbody>
      </table>
    </div>
  </div>
);
