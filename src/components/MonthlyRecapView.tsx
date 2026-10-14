import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Flame,
} from 'lucide-react';
import {
  Student,
  AttendanceSession,
  AttendanceRecord,
  ClassRoom,
  TeacherProfile,
  PrintConfig,
} from '../types';
import { PrintableDocument } from './PrintableDocument';

interface MonthlyRecapViewProps {
  activeClass: ClassRoom;
  students: Student[];
  sessions: AttendanceSession[];
  attendanceRecords: AttendanceRecord[];
  teacher: TeacherProfile;
  schoolName: string;
  printConfig?: PrintConfig;
}

export const MonthlyRecapView: React.FC<MonthlyRecapViewProps> = ({
  activeClass,
  students,
  sessions,
  attendanceRecords,
  teacher,
  schoolName,
  printConfig,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Bulan Ini');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortMode, setSortMode] = useState<'no' | 'az' | 'za'>('no');
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  const periodPills = [
    { label: 'Triwulan 1', val: 'Triwulan 1' },
    { label: 'Triwulan 2', val: 'Triwulan 2' },
    { label: 'Bulan Ini (Okt)', val: 'Bulan Ini' },
    { label: 'Bulan Lalu (Sep)', val: 'Bulan Lalu' },
    { label: 'Semester Ganjil', val: 'Gasal' },
    { label: 'Satu Tahun Penuh', val: '1 Tahun' },
  ];

  // Aggregation per student
  const studentRecaps = useMemo(() => {
    return students.map((std) => {
      let h = 0;
      let s = 0;
      let i = 0;
      let a = 0;
      let d = 0;

      // Filter attendance records for active class and this student
      attendanceRecords
        .filter((rec) => rec.studentId === std.id && sessions.some((sess) => sess.id === rec.sessionId))
        .forEach((rec) => {
          if (rec.status === 'H') h++;
          else if (rec.status === 'S') s++;
          else if (rec.status === 'I') i++;
          else if (rec.status === 'A') a++;
          else if (rec.status === 'D') d++;
        });

      const totalPresenceOpportunities = h + s + i + a + d || 1;
      const percentage = Math.round((h / totalPresenceOpportunities) * 100);

      let keterangan = 'Sangat Baik';
      let ketBg = 'bg-[#dcfce7] text-emerald-950 border-slate-900';
      if (percentage < 75) {
        keterangan = 'Perlu Perhatian Khusus';
        ketBg = 'bg-[#fee2e2] text-rose-950 border-slate-900';
      } else if (percentage < 85) {
        keterangan = 'Cukup Baik';
        ketBg = 'bg-[#fef9c3] text-amber-950 border-slate-900';
      } else if (percentage < 95) {
        keterangan = 'Baik';
        ketBg = 'bg-[#e0f2fe] text-sky-950 border-slate-900';
      }

      return {
        student: std,
        h,
        s,
        i,
        a,
        d,
        percentage,
        keterangan,
        ketBg,
      };
    });
  }, [students, attendanceRecords, sessions]);

  // Overall class recap metrics
  const overallMetrics = useMemo(() => {
    const totalSesi = sessions.length;
    let totalH = 0;
    let totalS = 0;
    let totalI = 0;
    let totalA = 0;
    let totalD = 0;

    studentRecaps.forEach((r) => {
      totalH += r.h;
      totalS += r.s;
      totalI += r.i;
      totalA += r.a;
      totalD += r.d;
    });

    const grandTotal = totalH + totalS + totalI + totalA + totalD || 1;
    const avgRate = Math.round((totalH / grandTotal) * 100);

    return { totalSesi, totalH, totalS, totalI, totalA, totalD, avgRate };
  }, [sessions, studentRecaps]);

  // Filtered and sorted students
  const filteredRecaps = useMemo(() => {
    let list = [...studentRecaps];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) => r.student.nama.toLowerCase().includes(q) || r.student.nisn.includes(q));
    }

    if (sortMode === 'az') {
      list.sort((a, b) => a.student.nama.localeCompare(b.student.nama));
    } else if (sortMode === 'za') {
      list.sort((a, b) => b.student.nama.localeCompare(a.student.nama));
    } else {
      list.sort((a, b) => a.student.noUrut - b.student.noUrut);
    }
    return list;
  }, [studentRecaps, searchQuery, sortMode]);

  const handleExportExcel = () => {
    const headers = ['NO', 'NISN', 'NAMA MURID', 'L/P', 'KELAS', 'HADIR', 'SAKIT', 'IZIN', 'ALPA', 'DISPEN', 'PERSENTASE', 'KETERANGAN'];
    const rows = filteredRecaps.map((r, idx) => [
      idx + 1,
      `"${r.student.nisn}"`,
      `"${r.student.nama}"`,
      r.student.gender,
      `"${activeClass.nama}"`,
      r.h,
      r.s,
      r.i,
      r.a,
      r.d,
      `${r.percentage}%`,
      `"${r.keterangan}"`,
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Presensi_${activeClass.nama}_${selectedPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Header Card - Vintage Postmodern Neobrutalist */}
      <div className="bg-[#fffdf8] rounded-3xl p-4 sm:p-6 border-2 border-slate-900 shadow-[4px_4px_0px_#1e293b] relative overflow-hidden">
        {/* Retro Corner Stamp with Fire */}
        <div className="absolute top-0 right-0 bg-[#e0f2fe] border-b-2 border-l-2 border-slate-900 px-3 py-1 rounded-bl-2xl text-[10px] font-mono font-bold text-sky-950 flex items-center gap-1 shadow-xs">
          <Flame className="w-3 h-3 text-orange-600 fill-orange-500" />
          <span>REKAPITULASI PERIODIK</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 sm:pt-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-slate-600 mb-1.5 flex-wrap">
              <span className="bg-[#fef9c3] text-amber-950 px-2.5 py-0.5 rounded-full border-2 border-slate-900 font-mono text-[11px] shadow-[1.5px_1.5px_0px_#1e293b]">
                {activeClass.nama}
              </span>
              <span>•</span>
              <span className="font-bold text-slate-700">Periode: {selectedPeriod}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Rekapitulasi Absensi Bulanan & Periodik
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              {schoolName} • Pendidik: {teacher.name} ({teacher.handle})
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-2xl bg-[#fef9c3] hover:bg-[#fde047] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-amber-950 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-900" />
              <span>Ekspor Excel</span>
            </button>
            <button
              onClick={() => setShowPrintModal(true)}
              className="px-3.5 py-2 rounded-2xl bg-[#fee2e2] hover:bg-[#fca5a5] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-rose-950 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer"
              title="Cetak Kertas Rekap Formal A4 Putih"
            >
              <Printer className="w-4 h-4 text-rose-900" />
              <span>Kertas Cetak</span>
            </button>
          </div>
        </div>

        {/* Filter & Period Selector Container */}
        <div className="mt-5 pt-4 border-t-2 border-slate-100 space-y-3.5">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
              <Filter className="w-3.5 h-3.5 text-indigo-700" />
              <span>PILIH RENTANG PERIODE</span>
            </div>

            {/* Quick Period Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {periodPills.map((p) => (
                <button
                  key={p.val}
                  onClick={() => setSelectedPeriod(p.val)}
                  className={`px-3 py-1.5 rounded-2xl text-xs font-black transition-all cursor-pointer border-2 border-slate-900 ${
                    selectedPeriod === p.val
                      ? 'bg-[#dcfce7] text-slate-950 shadow-[2.5px_2.5px_0px_#1e293b]'
                      : 'bg-white hover:bg-[#faf7ee] text-slate-700 shadow-[1.5px_1.5px_0px_#1e293b]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6 Metric Tallies Grid in Pastel Neobrutalism */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Sesi */}
        <div className="bg-[#faf7ee] border-2 border-slate-900 rounded-2xl p-3 shadow-[2.5px_2.5px_0px_#1e293b] text-center">
          <span className="text-[10px] font-mono font-black text-slate-700 uppercase tracking-wider">
            TOTAL SESI
          </span>
          <p className="text-2xl font-black text-slate-950 font-mono mt-0.5">
            {overallMetrics.totalSesi}
          </p>
          <span className="text-[10px] font-bold text-slate-500">pertemuan KBM</span>
        </div>

        {/* Hadir */}
        <div className="bg-[#dcfce7] border-2 border-slate-900 rounded-2xl p-3 shadow-[2.5px_2.5px_0px_#1e293b] text-center">
          <span className="text-[10px] font-mono font-black text-emerald-950 uppercase tracking-wider">
            HADIR (H)
          </span>
          <p className="text-2xl font-black text-emerald-950 font-mono mt-0.5">
            {overallMetrics.totalH}
          </p>
          <span className="text-[10px] font-bold text-emerald-800">{overallMetrics.avgRate}% kehadiran</span>
        </div>

        {/* Sakit */}
        <div className="bg-[#fef9c3] border-2 border-slate-900 rounded-2xl p-3 shadow-[2.5px_2.5px_0px_#1e293b] text-center">
          <span className="text-[10px] font-mono font-black text-amber-950 uppercase tracking-wider">
            SAKIT (S)
          </span>
          <p className="text-2xl font-black text-amber-950 font-mono mt-0.5">
            {overallMetrics.totalS}
          </p>
          <span className="text-[10px] font-bold text-amber-800">surat dokter</span>
        </div>

        {/* Izin */}
        <div className="bg-[#ffedd5] border-2 border-slate-900 rounded-2xl p-3 shadow-[2.5px_2.5px_0px_#1e293b] text-center">
          <span className="text-[10px] font-mono font-black text-orange-950 uppercase tracking-wider">
            IZIN (I)
          </span>
          <p className="text-2xl font-black text-orange-950 font-mono mt-0.5">
            {overallMetrics.totalI}
          </p>
          <span className="text-[10px] font-bold text-orange-800">konfirmasi ortu</span>
        </div>

        {/* Alpa */}
        <div className="bg-[#fee2e2] border-2 border-slate-900 rounded-2xl p-3 shadow-[2.5px_2.5px_0px_#1e293b] text-center">
          <span className="text-[10px] font-mono font-black text-rose-950 uppercase tracking-wider">
            ALPA (A)
          </span>
          <p className="text-2xl font-black text-rose-950 font-mono mt-0.5">
            {overallMetrics.totalA}
          </p>
          <span className="text-[10px] font-bold text-rose-800">tanpa berita</span>
        </div>

        {/* Dispen */}
        <div className="bg-[#ede9fe] border-2 border-slate-900 rounded-2xl p-3 shadow-[2.5px_2.5px_0px_#1e293b] text-center">
          <span className="text-[10px] font-mono font-black text-indigo-950 uppercase tracking-wider">
            DISPEN (D)
          </span>
          <p className="text-2xl font-black text-indigo-950 font-mono mt-0.5">
            {overallMetrics.totalD}
          </p>
          <span className="text-[10px] font-bold text-indigo-800">tugas sekolah</span>
        </div>
      </div>

      {/* Recap Table */}
      <div className="bg-white border-2 border-slate-900 rounded-3xl shadow-[4px_4px_0px_#1e293b] overflow-hidden">
        {/* Table Filter Top Bar */}
        <div className="p-4 border-b-2 border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fffdf8]">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">
              Daftar Rekap Kehadiran Murid ({filteredRecaps.length} Murid)
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Data terverifikasi PostgreSQL Supabase Cloud dengan RLS
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari murid atau NISN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-2xl bg-[#faf7ee] border-2 border-slate-900 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:shadow-[2px_2px_0px_#0d9488]"
              />
            </div>

            <div className="flex items-center bg-white p-1 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] shrink-0 gap-1">
              <button
                onClick={() => setSortMode('no')}
                className={`px-2.5 py-1 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  sortMode === 'no' ? 'bg-[#dcfce7] text-slate-900 border border-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                No
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

        {/* Scrollable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#faf7ee] text-slate-900 font-black text-[11px] tracking-wider uppercase border-b-2 border-slate-900">
                <th className="py-3 px-3 w-10 text-center">NO</th>
                <th className="py-3 px-3 w-24">NISN</th>
                <th className="py-3 px-4 min-w-[200px]">NAMA MURID</th>
                <th className="py-3 px-2 w-10 text-center">L/P</th>
                <th className="py-3 px-3 min-w-[140px]">KELAS</th>
                <th className="py-3 px-2 w-14 text-center bg-[#dcfce7]">H</th>
                <th className="py-3 px-2 w-14 text-center bg-[#fef9c3]">S</th>
                <th className="py-3 px-2 w-14 text-center bg-[#ffedd5]">I</th>
                <th className="py-3 px-2 w-14 text-center bg-[#fee2e2]">A</th>
                <th className="py-3 px-2 w-14 text-center bg-[#ede9fe]">D</th>
                <th className="py-3 px-3 w-20 text-center">PERSENTASE</th>
                <th className="py-3 px-3 w-36 text-center">PREDIKAT KEHADIRAN</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {filteredRecaps.map((item, idx) => (
                <tr key={item.student.id} className="hover:bg-[#faf7ee]/60 transition-colors">
                  <td className="py-3 px-3 text-center text-slate-600 font-mono font-bold">
                    {item.student.noUrut || idx + 1}
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-slate-500">
                    {item.student.nisn}
                  </td>
                  <td className="py-3 px-4 font-black text-slate-900">
                    {item.student.nama}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className="inline-block w-6 h-6 rounded-xl bg-[#faf7ee] text-slate-900 font-black text-xs leading-6 text-center border-2 border-slate-900 shadow-[1px_1px_0px_#1e293b]">
                      {item.student.gender}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-bold truncate max-w-[130px]">
                    {activeClass.nama}
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-black text-emerald-950 bg-[#dcfce7]/40">
                    {item.h}
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-black text-amber-950 bg-[#fef9c3]/40">
                    {item.s}
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-black text-orange-950 bg-[#ffedd5]/40">
                    {item.i}
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-black text-rose-950 bg-[#fee2e2]/40">
                    {item.a}
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-black text-indigo-950 bg-[#ede9fe]/40">
                    {item.d}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-black text-slate-900">
                    {item.percentage}%
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-xl border-2 text-[10px] font-black shadow-[1.5px_1.5px_0px_#1e293b] ${item.ketBg}`}>
                      {item.keterangan}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formal Printable Document */}
      <PrintableDocument
        type="recap"
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        activeClass={activeClass}
        teacher={teacher}
        schoolName={schoolName}
        printConfig={printConfig}
        students={students}
        sessions={sessions}
        attendanceRecords={attendanceRecords}
      />
    </div>
  );
};
