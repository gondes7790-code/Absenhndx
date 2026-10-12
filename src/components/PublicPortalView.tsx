import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Wallet,
  Award,
  FileSpreadsheet,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  Flame,
  ArrowLeft,
  ExternalLink,
  User,
  GraduationCap,
} from 'lucide-react';
import QRCode from 'qrcode';
import {
  Student,
  AttendanceRecord,
  GradeRecord,
  ClassRoom,
  TeacherProfile,
  FinanceTransaction,
} from '../types';

export type PublicPortalType = 'absen' | 'tabungan' | 'nilai' | 'rekap';

interface PublicPortalViewProps {
  initialType?: PublicPortalType;
  initialClassId?: string;
  initialNisn?: string;
  classes: ClassRoom[];
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  grades: GradeRecord[];
  finances: FinanceTransaction[];
  teacher: TeacherProfile;
  schoolName: string;
  onExitPortal: () => void;
}

export const PublicPortalView: React.FC<PublicPortalViewProps> = ({
  initialType = 'absen',
  initialClassId,
  initialNisn,
  classes,
  students,
  attendanceRecords,
  grades,
  finances,
  teacher,
  schoolName,
  onExitPortal,
}) => {
  const [activePortalType, setActivePortalType] = useState<PublicPortalType>(initialType);
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId && classes.some((c) => c.id === initialClassId)
      ? initialClassId
      : classes[0]?.id || ''
  );
  
  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter((s) => s.classId === currentClass?.id);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    if (initialNisn) {
      const match = classStudents.find((s) => s.nisn === initialNisn);
      if (match) return match.id;
    }
    return classStudents[0]?.id || '';
  });

  // Keep selected student in sync when class changes
  useEffect(() => {
    if (!classStudents.some((s) => s.id === selectedStudentId)) {
      setSelectedStudentId(classStudents[0]?.id || '');
    }
  }, [selectedClassId, classStudents, selectedStudentId]);

  const currentStudent = classStudents.find((s) => s.id === selectedStudentId) || classStudents[0];

  const [copiedLink, setCopiedLink] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState(false);

  // Generate public deep link for this specific view
  const currentUrl = `${window.location.origin}?portal=publik&kelas=${currentClass?.id}&tipe=${activePortalType}${
    currentStudent ? `&nisn=${currentStudent.nisn}` : ''
  }`;

  useEffect(() => {
    QRCode.toDataURL(currentUrl, {
      width: 280,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code error', err));
  }, [currentUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // --- Calculations for Student & Class (Read-Only) ---
  const studentAttendances = attendanceRecords.filter((r) => r.studentId === currentStudent?.id);
  let hadirCount = 0;
  let sakitCount = 0;
  let izinCount = 0;
  let alpaCount = 0;
  let dispenCount = 0;
  studentAttendances.forEach((r) => {
    if (r.status === 'H') hadirCount++;
    else if (r.status === 'S') sakitCount++;
    else if (r.status === 'I') izinCount++;
    else if (r.status === 'A') alpaCount++;
    else if (r.status === 'D') dispenCount++;
  });
  const totalAttSessions = studentAttendances.length || 1;
  const attendanceRate = Math.round((hadirCount / totalAttSessions) * 100);

  // Tabungan
  const studentSavings = finances.filter(
    (f) => f.kategori === 'Tabungan Siswa' && f.studentId === currentStudent?.id
  );
  let studentSavingsBalance = 0;
  studentSavings.forEach((f) => {
    if (f.tipe === 'Pemasukan') studentSavingsBalance += f.nominal;
    else studentSavingsBalance -= f.nominal;
  });

  // Nilai
  const studentGrade = grades.find((g) => g.studentId === currentStudent?.id);
  const validFormatif = (studentGrade?.formatif || []).filter((v): v is number => v !== null && !isNaN(v));
  const formatifAvg =
    validFormatif.length > 0 ? validFormatif.reduce((a, b) => a + b, 0) / validFormatif.length : 0;
  const stsScore = studentGrade?.sts ?? formatifAvg;
  const sasScore = studentGrade?.sas ?? formatifAvg;
  const finalGrade = Math.round(formatifAvg * 0.5 + stsScore * 0.25 + sasScore * 0.25);
  const kkm = currentClass?.kkm || 75;
  const isTuntas = finalGrade >= kkm;

  return (
    <div className="min-h-screen bg-[#faf7ee] text-slate-900 font-sans selection:bg-[#6ee7b7] flex flex-col">
      {/* Top Read-Only Banner */}
      <div className="bg-[#fef9c3] border-b-2 border-slate-900 px-4 py-2 text-center text-xs font-black text-slate-900 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 mx-auto">
          <Flame className="w-4 h-4 text-orange-600 fill-orange-500" />
          <span>PORTAL RESMI HADIR! • TAMPILAN PUBLIK TERVERIFIKASI (READ-ONLY)</span>
          <span className="hidden sm:inline bg-white px-2 py-0.5 rounded-full border border-slate-900 text-[10px] font-mono">
            HANYA BACA
          </span>
        </div>
        <button
          onClick={onExitPortal}
          className="text-[11px] font-black bg-white hover:bg-slate-100 text-slate-900 px-2.5 py-1 rounded-xl border border-slate-900 shadow-[1px_1px_0px_#1e293b] flex items-center gap-1 cursor-pointer shrink-0"
          title="Kembali ke Aplikasi Utama"
        >
          <ArrowLeft className="w-3 h-3" />
          <span className="hidden xs:inline">Keluar Portal</span>
        </button>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b-2 border-slate-900 shadow-[0_3px_0px_#1e293b] py-3.5 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#ffedd5] border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] flex items-center justify-center text-2xl shrink-0">
              🔥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                  Hadir!
                </h1>
                <span className="text-[11px] font-mono font-bold bg-[#ede9fe] text-indigo-950 border border-slate-900 px-2 py-0.5 rounded-full shadow-[1px_1px_0px_#1e293b]">
                  Wali Murid & Siswa
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {schoolName} • Rombel {currentClass?.nama}
              </p>
            </div>
          </div>

          {/* Quick Sharing & QR Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShowQrModal(true)}
              className="flex-1 sm:flex-none px-3 py-2 rounded-2xl bg-[#ffedd5] hover:bg-[#fed7aa] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-xs font-black text-orange-950 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-orange-900" />
              <span>QR Code</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-2xl bg-[#dcfce7] hover:bg-[#bbf7d0] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-xs font-black text-emerald-950 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4 text-emerald-800" />}
              <span>{copiedLink ? 'Tersalin!' : 'Salin Tautan'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-5">
        {/* Dataset Focus Nav Pill - One link for all data, but isolated by category */}
        <div className="bg-white rounded-3xl p-2 sm:p-2.5 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] flex items-center justify-between gap-1.5 overflow-x-auto">
          <div className="flex items-center gap-1.5 w-full">
            <button
              onClick={() => setActivePortalType('absen')}
              className={`flex-1 min-w-[100px] py-2 px-3 rounded-2xl text-xs font-black text-center border-2 border-slate-900 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activePortalType === 'absen'
                  ? 'bg-[#dcfce7] text-slate-950 shadow-[2.5px_2.5px_0px_#1e293b]'
                  : 'bg-transparent border-transparent hover:bg-[#faf7ee] text-slate-600'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-800" />
              <span>Data Absen</span>
            </button>

            <button
              onClick={() => setActivePortalType('tabungan')}
              className={`flex-1 min-w-[100px] py-2 px-3 rounded-2xl text-xs font-black text-center border-2 border-slate-900 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activePortalType === 'tabungan'
                  ? 'bg-[#e0f2fe] text-slate-950 shadow-[2.5px_2.5px_0px_#1e293b]'
                  : 'bg-transparent border-transparent hover:bg-[#faf7ee] text-slate-600'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-sky-800" />
              <span>Data Tabungan</span>
            </button>

            <button
              onClick={() => setActivePortalType('nilai')}
              className={`flex-1 min-w-[100px] py-2 px-3 rounded-2xl text-xs font-black text-center border-2 border-slate-900 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activePortalType === 'nilai'
                  ? 'bg-[#fef9c3] text-slate-950 shadow-[2.5px_2.5px_0px_#1e293b]'
                  : 'bg-transparent border-transparent hover:bg-[#faf7ee] text-slate-600'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-800" />
              <span>Data Nilai</span>
            </button>

            <button
              onClick={() => setActivePortalType('rekap')}
              className={`flex-1 min-w-[100px] py-2 px-3 rounded-2xl text-xs font-black text-center border-2 border-slate-900 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activePortalType === 'rekap'
                  ? 'bg-[#ede9fe] text-slate-950 shadow-[2.5px_2.5px_0px_#1e293b]'
                  : 'bg-transparent border-transparent hover:bg-[#faf7ee] text-slate-600'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-800" />
              <span>Rekap Kelas</span>
            </button>
          </div>
        </div>

        {/* Student Selector Card (If viewing student-specific data) */}
        {activePortalType !== 'rekap' && (
          <div className="bg-[#fffdf8] rounded-3xl p-4 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <label className="block text-xs font-black text-slate-800 mb-1">
                Pilih Nama Siswa:
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-white text-xs font-bold text-slate-900 shadow-[1.5px_1.5px_0px_#1e293b] focus:outline-none cursor-pointer"
              >
                {classStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.noUrut}. {s.nama} ({s.nisn}) - {s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                  </option>
                ))}
              </select>
            </div>

            {currentStudent && (
              <div className="bg-[#faf7ee] p-3 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-[#6ee7b7] font-black flex items-center justify-center text-base shrink-0">
                  {currentStudent.nama.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 truncate max-w-[180px]">
                    {currentStudent.nama}
                  </h4>
                  <p className="text-[10px] font-mono font-bold text-slate-500">
                    NISN: {currentStudent.nisn} • No. {currentStudent.noUrut}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 1: DATA ABSEN SAJA */}
        {/* ======================================================== */}
        {activePortalType === 'absen' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-[#dcfce7] rounded-3xl p-5 sm:p-6 border-2 border-slate-900 shadow-[4px_4px_0px_#1e293b] relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-mono font-black text-emerald-950 uppercase tracking-wider bg-white/70 px-2.5 py-0.5 rounded-full border border-slate-900 inline-block mb-1">
                    RINGKASAN KEHADIRAN SISWA
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-950">
                    Tingkat Kehadiran: {attendanceRate}%
                  </h3>
                  <p className="text-xs text-emerald-950 font-bold mt-1">
                    {attendanceRate >= 85 ? 'Status: Sangat Disiplin & Aktif Belajar' : 'Status: Perlu Peningkatan Kehadiran'}
                  </p>
                </div>

                <div className="text-4xl sm:text-5xl font-black text-emerald-950 font-mono">
                  {hadirCount} / {totalAttSessions}
                  <span className="text-xs block font-sans font-bold text-emerald-900">Sesi Hadir</span>
                </div>
              </div>

              {/* Status Badges */}
              <div className="grid grid-cols-2 xs:grid-cols-5 gap-2 mt-4 pt-4 border-t-2 border-slate-900/20 text-center">
                <div className="bg-white p-2 rounded-xl border border-slate-900 shadow-[1px_1px_0px_#1e293b]">
                  <span className="text-[10px] font-black text-slate-600 block">HADIR (H)</span>
                  <span className="text-base font-black text-emerald-700 font-mono">{hadirCount}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-900 shadow-[1px_1px_0px_#1e293b]">
                  <span className="text-[10px] font-black text-slate-600 block">SAKIT (S)</span>
                  <span className="text-base font-black text-amber-700 font-mono">{sakitCount}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-900 shadow-[1px_1px_0px_#1e293b]">
                  <span className="text-[10px] font-black text-slate-600 block">IZIN (I)</span>
                  <span className="text-base font-black text-sky-700 font-mono">{izinCount}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-900 shadow-[1px_1px_0px_#1e293b]">
                  <span className="text-[10px] font-black text-slate-600 block">ALPA (A)</span>
                  <span className="text-base font-black text-rose-700 font-mono">{alpaCount}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-900 shadow-[1px_1px_0px_#1e293b] col-span-2 xs:col-span-1">
                  <span className="text-[10px] font-black text-slate-600 block">DISPEN (D)</span>
                  <span className="text-base font-black text-purple-700 font-mono">{dispenCount}</span>
                </div>
              </div>
            </div>

            {/* Attendance Details Table */}
            <div className="bg-white rounded-3xl p-5 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-800" />
                  <span>Log Riwayat Presensi Per Sesi</span>
                </h4>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {studentAttendances.length} Catatan
                </span>
              </div>

              {studentAttendances.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 italic bg-[#faf7ee] rounded-2xl border border-slate-900">
                  Belum ada rekaman presensi harian untuk siswa ini.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {studentAttendances.map((rec, idx) => (
                    <div key={rec.id || idx} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                      <div>
                        <p className="font-bold text-slate-900">
                          Pertemuan: {rec.sessionId}
                        </p>
                        {rec.keterangan && (
                          <p className="text-[11px] text-slate-500 italic mt-0.5">
                            Keterangan: {rec.keterangan}
                          </p>
                        )}
                      </div>

                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-black border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#1e293b] ${
                          rec.status === 'H'
                            ? 'bg-[#dcfce7] text-emerald-950'
                            : rec.status === 'S'
                            ? 'bg-[#fef9c3] text-amber-950'
                            : rec.status === 'I'
                            ? 'bg-[#e0f2fe] text-sky-950'
                            : rec.status === 'D'
                            ? 'bg-[#ede9fe] text-indigo-950'
                            : 'bg-[#fee2e2] text-rose-950'
                        }`}
                      >
                        {rec.status === 'H'
                          ? 'Hadir'
                          : rec.status === 'S'
                          ? 'Sakit'
                          : rec.status === 'I'
                          ? 'Izin'
                          : rec.status === 'D'
                          ? 'Dispen'
                          : 'Alpa'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: DATA TABUNGAN SAJA */}
        {/* ======================================================== */}
        {activePortalType === 'tabungan' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-[#e0f2fe] rounded-3xl p-5 sm:p-6 border-2 border-slate-900 shadow-[4px_4px_0px_#1e293b]">
              <span className="text-[11px] font-mono font-black text-sky-950 uppercase tracking-wider bg-white/70 px-2.5 py-0.5 rounded-full border border-slate-900 inline-block mb-1">
                SALDO TABUNGAN MANDIRI SISWA
              </span>
              <h3 className="text-3xl sm:text-4xl font-black text-slate-950 font-mono mt-1">
                Rp {studentSavingsBalance.toLocaleString('id-ID')}
              </h3>
              <p className="text-xs text-sky-950 font-bold mt-1.5">
                Tercatat pada pembukuan kas kelas {currentClass?.nama} • Dikelola oleh Wali Kelas: {teacher.name}
              </p>
            </div>

            {/* Mutations Log */}
            <div className="bg-white rounded-3xl p-5 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-sky-800" />
                  <span>Rincian Mutasi Setor & Tarik Tabungan</span>
                </h4>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {studentSavings.length} Transaksi
                </span>
              </div>

              {studentSavings.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 italic bg-[#faf7ee] rounded-2xl border border-slate-900">
                  Belum ada mutasi setoran atau penarikan tabungan untuk siswa ini.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {studentSavings.map((tx) => (
                    <div key={tx.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                      <div>
                        <p className="font-black text-slate-900">{tx.keterangan}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {tx.tanggal} • Dicatat: {tx.pencatat}
                        </p>
                      </div>

                      <span
                        className={`font-mono font-black px-2.5 py-1 rounded-xl border border-slate-900 text-xs ${
                          tx.tipe === 'Pemasukan'
                            ? 'bg-[#dcfce7] text-emerald-950'
                            : 'bg-[#fee2e2] text-rose-950'
                        }`}
                      >
                        {tx.tipe === 'Pemasukan' ? '+' : '-'} Rp {tx.nominal.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: DATA NILAI & RAPOR SAJA */}
        {/* ======================================================== */}
        {activePortalType === 'nilai' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#fef9c3] rounded-3xl p-5 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b]">
                <span className="text-[10px] font-mono font-black text-amber-950 uppercase tracking-wider bg-white/70 px-2.5 py-0.5 rounded-full border border-slate-900 inline-block mb-1">
                  NILAI AKHIR RAPOR
                </span>
                <div className="text-4xl font-black text-slate-950 font-mono mt-1">
                  {finalGrade}
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full border border-slate-900 ${
                      isTuntas ? 'bg-[#dcfce7] text-emerald-950' : 'bg-[#fee2e2] text-rose-950'
                    }`}
                  >
                    {isTuntas ? 'Tuntas Belajar (≥ KKM)' : 'Perlu Pendampingan Remedial'}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600">
                    (KKM: {kkm})
                  </span>
                </div>
              </div>

              <div className="bg-[#ede9fe] rounded-3xl p-5 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b]">
                <span className="text-[10px] font-mono font-black text-indigo-950 uppercase tracking-wider bg-white/70 px-2.5 py-0.5 rounded-full border border-slate-900 inline-block mb-1">
                  KOMPONEN ASESMEN SUMATIF
                </span>
                <div className="text-xl font-black text-slate-950 font-mono mt-2 space-y-1">
                  <p>STS: <span className="text-indigo-950 font-black">{stsScore}</span></p>
                  <p>SAS: <span className="text-indigo-950 font-black">{sasScore}</span></p>
                </div>
                <p className="text-xs font-bold text-indigo-900 mt-2">
                  Rata-rata Asesmen Formatif: {formatifAvg.toFixed(1)}
                </p>
              </div>
            </div>

            {/* Competency Description Card */}
            <div className="bg-white rounded-3xl p-5 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b]">
              <span className="text-[11px] font-mono font-black text-slate-500 uppercase tracking-wider block mb-2">
                Deskripsi Capaian Kompetensi Kurikulum Merdeka:
              </span>
              <div className="bg-[#faf7ee] p-4 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b]">
                <p className="text-xs sm:text-sm text-slate-800 italic leading-relaxed font-medium">
                  "{studentGrade?.deskripsi ||
                    'Siswa telah menunjukkan penguasaan yang sangat baik dalam memahami konsep pembelajaran kurikulum merdeka pada semester ini.'}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 4: REKAP KELAS SAJA */}
        {/* ======================================================== */}
        {activePortalType === 'rekap' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-[#ccfbf1] rounded-3xl p-5 sm:p-6 border-2 border-slate-900 shadow-[4px_4px_0px_#1e293b]">
              <span className="text-[11px] font-mono font-black text-teal-950 uppercase tracking-wider bg-white/70 px-2.5 py-0.5 rounded-full border border-slate-900 inline-block mb-1">
                REKAPITULASI ROMBONGAN BELAJAR
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-950">
                Kelas {currentClass?.nama}
              </h3>
              <p className="text-xs text-teal-950 font-bold mt-1">
                Total {classStudents.length} Siswa Terdaftar • Mata Pelajaran: {currentClass?.mapel}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b]">
              <h4 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-teal-800" />
                <span>Daftar Siswa Kelas Ini</span>
              </h4>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {classStudents.map((std) => (
                  <div key={std.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#faf7ee] border border-slate-900 font-mono font-bold flex items-center justify-center text-[11px]">
                        {std.noUrut}
                      </span>
                      <span className="font-black text-slate-900">{std.nama}</span>
                    </div>
                    <span className="font-mono text-slate-500 font-bold">
                      {std.nisn} ({std.gender})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* QR Code Modal Display */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border-3 border-slate-900 shadow-[8px_8px_0px_#1e293b] text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fef9c3] border-2 border-slate-900 text-xs font-black">
              <span>🔥</span>
              <span>PINDAI QR PORTAL RESMI</span>
            </div>

            <div className="p-3 bg-[#faf7ee] rounded-2xl border-2 border-slate-900 inline-block shadow-[3px_3px_0px_#1e293b]">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code Link Publik" className="w-48 h-48 rounded-xl mx-auto" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                  Membuat QR...
                </div>
              )}
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Scan dengan kamera HP untuk langsung membuka data <strong>{activePortalType.toUpperCase()}</strong> pada kelas {currentClass?.nama}.
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-2xl bg-slate-900 text-white font-black text-xs hover:bg-slate-800 transition-all cursor-pointer shadow-[2px_2px_0px_#1e293b]"
            >
              Tutup QR Code
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-8 bg-white border-t-2 border-slate-900 py-6 px-4 text-center text-xs font-medium text-slate-600 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#faf7ee] border border-slate-900 text-[11px] font-bold text-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Koneksi Aman Supabase PostgreSQL (RLS Protected) • Dikembangkan oleh @hndx07</span>
        </div>
        <p className="text-[11px]">
          Hadir! • Sistem Informasi Presensi & Penilaian Kurikulum Merdeka
        </p>
      </footer>
    </div>
  );
};
