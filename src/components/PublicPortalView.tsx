import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Wallet,
  FileSpreadsheet,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  Flame,
  Lock,
  User,
  GraduationCap,
  Info,
  Clock,
  BookOpen,
} from 'lucide-react';
import QRCode from 'qrcode';
import {
  Student,
  AttendanceSession,
  AttendanceRecord,
  GradeRecord,
  ClassRoom,
  TeacherProfile,
  FinanceTransaction,
} from '../types';
import { APP_LOGO_URL } from '../utils/printConfig';

export type PublicPortalType = 'absen' | 'rekap' | 'nilai' | 'tabungan';

interface PublicPortalViewProps {
  initialType?: PublicPortalType;
  initialClassId?: string;
  initialNisn?: string;
  classes: ClassRoom[];
  students: Student[];
  sessions: AttendanceSession[];
  attendanceRecords: AttendanceRecord[];
  grades: GradeRecord[];
  finances: FinanceTransaction[];
  teacher: TeacherProfile;
  schoolName: string;
}

export const PublicPortalView: React.FC<PublicPortalViewProps> = ({
  initialType = 'absen',
  initialClassId,
  initialNisn,
  classes,
  students,
  sessions,
  attendanceRecords,
  grades,
  finances,
  teacher,
  schoolName,
}) => {
  const [activePortalType, setActivePortalType] = useState<PublicPortalType>(initialType);
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId && classes.some((c) => c.id === initialClassId)
      ? initialClassId
      : classes[0]?.id || ''
  );

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === currentClass?.id);
  }, [students, currentClass]);

  const classSessions = useMemo(() => {
    const list = sessions.filter((s) => s.classId === currentClass?.id);
    // Sort descending by pertemuanKe so the latest is first
    return list.sort((a, b) => b.pertemuanKe - a.pertemuanKe);
  }, [sessions, currentClass]);

  // The latest session (data absen yang diinput terakhir)
  const latestSession = classSessions[0];

  // Selected session for viewing (defaults to latest inputted session!)
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    latestSession?.id || ''
  );

  useEffect(() => {
    if (latestSession && (!selectedSessionId || !classSessions.some(s => s.id === selectedSessionId))) {
      setSelectedSessionId(latestSession.id);
    }
  }, [latestSession, classSessions, selectedSessionId]);

  const activeSessionToDisplay = classSessions.find((s) => s.id === selectedSessionId) || latestSession;

  // Selected student for student-specific tabs (if needed)
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    if (initialNisn) {
      const match = classStudents.find((s) => s.nisn === initialNisn);
      if (match) return match.id;
    }
    return classStudents[0]?.id || '';
  });

  useEffect(() => {
    if (!classStudents.some((s) => s.id === selectedStudentId)) {
      setSelectedStudentId(classStudents[0]?.id || '');
    }
  }, [selectedClassId, classStudents, selectedStudentId]);

  const currentStudent = classStudents.find((s) => s.id === selectedStudentId) || classStudents[0];

  const [copiedLink, setCopiedLink] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState(false);

  // Generate public deep link for this view
  const currentUrl = `${window.location.origin}?portal=publik&kelas=${currentClass?.id}&tipe=${activePortalType}`;

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

  // Metrics for active session
  const sessionMetrics = useMemo(() => {
    if (!activeSessionToDisplay) {
      return { hadir: 0, sakit: 0, izin: 0, alpa: 0, dispen: 0, belum: classStudents.length, percent: 0 };
    }

    const sessionRecs = attendanceRecords.filter((r) => r.sessionId === activeSessionToDisplay.id);
    const recMap = new Map<string, string>();
    sessionRecs.forEach((r) => recMap.set(r.studentId, r.status));

    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpa = 0;
    let dispen = 0;
    let belum = 0;

    classStudents.forEach((std) => {
      const st = recMap.get(std.id);
      if (st === 'H') hadir++;
      else if (st === 'S') sakit++;
      else if (st === 'I') izin++;
      else if (st === 'A') alpa++;
      else if (st === 'D') dispen++;
      else belum++;
    });

    const total = classStudents.length || 1;
    const percent = Math.round((hadir / total) * 100);

    return { hadir, sakit, izin, alpa, dispen, belum, percent };
  }, [activeSessionToDisplay, attendanceRecords, classStudents]);

  return (
    <div className="min-h-screen bg-[#faf7ee] text-slate-900 font-sans selection:bg-[#6ee7b7] flex flex-col">
      {/* Top Banner: Read-Only & Login Locked */}
      <div className="bg-[#fef9c3] border-b-2 border-slate-900 px-3 sm:px-4 py-2 text-center text-xs font-black text-slate-900 flex items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2 mx-auto flex-wrap justify-center">
          <Flame className="w-4 h-4 text-orange-600 fill-orange-500 shrink-0" />
          <span>PORTAL PUBLIK RESMI HADIR! • DATA TERVERIFIKASI REAL-TIME</span>
          <span className="bg-white px-2 py-0.5 rounded-full border border-slate-900 text-[10px] font-mono shadow-[1px_1px_0px_#1e293b]">
            READ-ONLY
          </span>
        </div>

        {/* Locked Login Badge */}
        <div className="flex items-center gap-1.5 bg-slate-900 text-white px-2.5 py-1 rounded-xl text-[10px] font-bold shrink-0 shadow-[1px_1px_0px_#1e293b]">
          <Lock className="w-3 h-3 text-amber-400" />
          <span className="hidden sm:inline">Akses Login Terkunci</span>
          <span className="sm:hidden">Terkunci</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b-2 border-slate-900 shadow-[0_3px_0px_#1e293b] py-3.5 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] flex items-center justify-center shrink-0 p-1 overflow-hidden">
              <img
                src={APP_LOGO_URL}
                alt="Logo Hadir!"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                  Hadir!
                </h1>
                <span className="text-[11px] font-mono font-bold bg-[#ede9fe] text-indigo-950 border border-slate-900 px-2 py-0.5 rounded-full shadow-[1px_1px_0px_#1e293b]">
                  Portal Terbuka Siswa & Wali Murid
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {schoolName} • Pendidik: {teacher.name} ({teacher.nip})
              </p>
            </div>
          </div>

          {/* Quick Sharing & QR Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Class Selector for Visitors */}
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 rounded-2xl bg-[#faf7ee] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-xs font-black text-slate-900 focus:outline-none cursor-pointer"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nama}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowQrModal(true)}
              className="px-3 py-1.5 rounded-2xl bg-[#ffedd5] hover:bg-[#fed7aa] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-xs font-black text-orange-950 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="Tampilkan QR Code"
            >
              <QrCode className="w-4 h-4 text-orange-900" />
              <span className="hidden xs:inline">QR Code</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-2xl bg-[#dcfce7] hover:bg-[#bbf7d0] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-xs font-black text-emerald-950 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="Salin Link Publik"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4 text-emerald-800" />}
              <span>{copiedLink ? 'Tersalin!' : 'Salin Link'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-3 sm:p-6 space-y-5">
        {/* Dataset Navigation Strip: One link for all data, organized cleanly */}
        <div className="bg-white rounded-3xl p-1.5 sm:p-2 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] flex items-center justify-between gap-1.5 overflow-x-auto">
          <div className="flex items-center gap-1.5 w-full">
            {/* Tab 1: Data Absen (Default / Tampilan Awal: Absen Terakhir) */}
            <button
              onClick={() => setActivePortalType('absen')}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-2xl text-xs font-black text-center border-2 border-slate-900 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activePortalType === 'absen'
                  ? 'bg-[#dcfce7] text-slate-950 shadow-[2.5px_2.5px_0px_#1e293b]'
                  : 'bg-transparent border-transparent hover:bg-[#faf7ee] text-slate-600'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-emerald-800" />
              <span>Absen Terakhir</span>
            </button>

            {/* Tab 2: Rekap Absen */}
            <button
              onClick={() => setActivePortalType('rekap')}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-2xl text-xs font-black text-center border-2 border-slate-900 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activePortalType === 'rekap'
                  ? 'bg-[#ede9fe] text-slate-950 shadow-[2.5px_2.5px_0px_#1e293b]'
                  : 'bg-transparent border-transparent hover:bg-[#faf7ee] text-slate-600'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-800" />
              <span>Rekap Absen</span>
            </button>

            {/* Tab 3: Data Nilai */}
            <button
              onClick={() => setActivePortalType('nilai')}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-2xl text-xs font-black text-center border-2 border-slate-900 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activePortalType === 'nilai'
                  ? 'bg-[#fef9c3] text-slate-950 shadow-[2.5px_2.5px_0px_#1e293b]'
                  : 'bg-transparent border-transparent hover:bg-[#faf7ee] text-slate-600'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-800" />
              <span>Data Nilai</span>
            </button>

            {/* Tab 4: Data Tabungan */}
            <button
              onClick={() => setActivePortalType('tabungan')}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-2xl text-xs font-black text-center border-2 border-slate-900 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activePortalType === 'tabungan'
                  ? 'bg-[#e0f2fe] text-slate-950 shadow-[2.5px_2.5px_0px_#1e293b]'
                  : 'bg-transparent border-transparent hover:bg-[#faf7ee] text-slate-600'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-sky-800" />
              <span>Data Tabungan</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: DATA ABSEN YANG DIINPUT TERAKHIR (TAMPILAN AWAL) */}
        {/* ======================================================== */}
        {activePortalType === 'absen' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Session Card Banner */}
            <div className="bg-[#dcfce7] rounded-3xl p-4 sm:p-6 border-2 border-slate-900 shadow-[4px_4px_0px_#1e293b] relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-mono font-black text-emerald-950 uppercase tracking-wider bg-white px-2.5 py-0.5 rounded-full border border-slate-900 shadow-[1px_1px_0px_#1e293b]">
                      DATA ABSEN TERAKHIR
                    </span>
                    {activeSessionToDisplay && (
                      <span className="text-[10px] font-bold bg-[#6ee7b7] text-slate-900 px-2 py-0.5 rounded-full border border-slate-900">
                        Pertemuan Ke-{activeSessionToDisplay.pertemuanKe}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-950">
                    {activeSessionToDisplay
                      ? new Date(activeSessionToDisplay.tanggal).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'Belum Ada Sesi'}
                  </h3>

                  <p className="text-xs text-emerald-950 font-bold mt-1">
                    Mapel: {activeSessionToDisplay?.mapel || currentClass.mapel} • {activeSessionToDisplay?.catatan || 'Praktikum & Tatap Muka'}
                  </p>
                </div>

                {/* Progress Ring / Percentage */}
                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                  <div className="text-3xl sm:text-5xl font-black text-emerald-950 font-mono">
                    {sessionMetrics.percent}%
                  </div>
                  <span className="text-xs font-bold text-emerald-900">
                    {sessionMetrics.hadir} dari {classStudents.length} Siswa Hadir
                  </span>
                </div>
              </div>

              {/* Stat Counters for this session */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4 pt-4 border-t-2 border-slate-900/20 text-center">
                <div className="bg-white p-2 rounded-xl border border-slate-900 shadow-[1px_1px_0px_#1e293b]">
                  <span className="text-[10px] font-black text-slate-600 block">HADIR (H)</span>
                  <span className="text-base font-black text-emerald-700 font-mono">{sessionMetrics.hadir}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-900 shadow-[1px_1px_0px_#1e293b]">
                  <span className="text-[10px] font-black text-slate-600 block">SAKIT (S)</span>
                  <span className="text-base font-black text-amber-700 font-mono">{sessionMetrics.sakit}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-900 shadow-[1px_1px_0px_#1e293b]">
                  <span className="text-[10px] font-black text-slate-600 block">IZIN (I)</span>
                  <span className="text-base font-black text-orange-700 font-mono">{sessionMetrics.izin}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-900 shadow-[1px_1px_0px_#1e293b]">
                  <span className="text-[10px] font-black text-slate-600 block">ALFA (A)</span>
                  <span className="text-base font-black text-rose-700 font-mono">{sessionMetrics.alpa}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-900 shadow-[1px_1px_0px_#1e293b]">
                  <span className="text-[10px] font-black text-slate-600 block">DISPEN (D)</span>
                  <span className="text-base font-black text-purple-700 font-mono">{sessionMetrics.dispen}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-900 shadow-[1px_1px_0px_#1e293b]">
                  <span className="text-[10px] font-black text-slate-600 block">BELUM</span>
                  <span className="text-base font-black text-slate-500 font-mono">{sessionMetrics.belum}</span>
                </div>
              </div>

              {/* Session Selector Dropdown if visitors wish to see previous sessions */}
              {classSessions.length > 1 && (
                <div className="mt-3 pt-3 border-t border-slate-900/10 flex items-center justify-between text-xs flex-wrap gap-2">
                  <span className="font-bold text-slate-800">Lihat Arsip Pertemuan Lain:</span>
                  <select
                    value={selectedSessionId}
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                    className="px-2.5 py-1 rounded-xl bg-white border border-slate-900 text-xs font-bold text-slate-900 cursor-pointer shadow-[1px_1px_0px_#1e293b]"
                  >
                    {classSessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        Pertemuan Ke-{s.pertemuanKe} ({s.tanggal})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Complete Student Attendance Table for this Session */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-800" />
                  <span>Daftar Kehadiran Siswa ({classStudents.length} Murid)</span>
                </h4>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {currentClass.nama}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#faf7ee] text-slate-900 font-black tracking-wider uppercase border-b-2 border-slate-900">
                      <th className="py-2.5 px-3 w-10 text-center">NO</th>
                      <th className="py-2.5 px-3">NAMA SISWA</th>
                      <th className="py-2.5 px-2 text-center w-12">L/P</th>
                      <th className="py-2.5 px-3 text-center w-28">STATUS</th>
                      <th className="py-2.5 px-3">KETERANGAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {classStudents.map((std, idx) => {
                      const rec = attendanceRecords.find(
                        (r) => r.sessionId === activeSessionToDisplay?.id && r.studentId === std.id
                      );
                      const status = rec?.status;

                      let statusBadge = (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-500">
                          Belum Diabsen
                        </span>
                      );

                      if (status === 'H') {
                        statusBadge = (
                          <span className="px-2.5 py-0.5 rounded-xl text-[11px] font-black bg-[#dcfce7] text-emerald-950 border border-slate-900 shadow-[1px_1px_0px_#1e293b]">
                            Hadir (H)
                          </span>
                        );
                      } else if (status === 'S') {
                        statusBadge = (
                          <span className="px-2.5 py-0.5 rounded-xl text-[11px] font-black bg-[#fef9c3] text-amber-950 border border-slate-900 shadow-[1px_1px_0px_#1e293b]">
                            Sakit (S)
                          </span>
                        );
                      } else if (status === 'I') {
                        statusBadge = (
                          <span className="px-2.5 py-0.5 rounded-xl text-[11px] font-black bg-[#ffedd5] text-orange-950 border border-slate-900 shadow-[1px_1px_0px_#1e293b]">
                            Izin (I)
                          </span>
                        );
                      } else if (status === 'A') {
                        statusBadge = (
                          <span className="px-2.5 py-0.5 rounded-xl text-[11px] font-black bg-[#fee2e2] text-rose-950 border border-slate-900 shadow-[1px_1px_0px_#1e293b]">
                            Alfa (A)
                          </span>
                        );
                      } else if (status === 'D') {
                        statusBadge = (
                          <span className="px-2.5 py-0.5 rounded-xl text-[11px] font-black bg-[#ede9fe] text-indigo-950 border border-slate-900 shadow-[1px_1px_0px_#1e293b]">
                            Dispen (D)
                          </span>
                        );
                      }

                      return (
                        <tr key={std.id} className="hover:bg-[#faf7ee]/50">
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-600">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-black text-slate-900 block">{std.nama}</span>
                            <span className="text-[10px] font-mono text-slate-500">NISN: {std.nisn}</span>
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono font-bold">
                            {std.gender}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {statusBadge}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 text-xs italic">
                            {rec?.keterangan || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: DATA REKAP ABSEN                                 */}
        {/* ======================================================== */}
        {activePortalType === 'rekap' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-[#ede9fe] rounded-3xl p-5 sm:p-6 border-2 border-slate-900 shadow-[4px_4px_0px_#1e293b]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono font-black text-indigo-950 uppercase tracking-wider bg-white px-2.5 py-0.5 rounded-full border border-slate-900 inline-block mb-1 shadow-[1px_1px_0px_#1e293b]">
                    REKAPITULASI SEMESTER
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-950">
                    Rekapitulasi Kehadiran Seluruh Sesi
                  </h3>
                  <p className="text-xs text-indigo-900 font-bold mt-1">
                    Total {classSessions.length} Pertemuan Telah Dilaksanakan • {currentClass.nama}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-indigo-950">
                    {classStudents.length} Siswa
                  </span>
                </div>
              </div>
            </div>

            {/* Recap Table */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#faf7ee] text-slate-900 font-black tracking-wider uppercase border-b-2 border-slate-900">
                      <th className="py-2.5 px-2 w-8 text-center">NO</th>
                      <th className="py-2.5 px-3 min-w-[180px]">NAMA SISWA</th>
                      <th className="py-2.5 px-1 text-center w-8">L/P</th>
                      <th className="py-2.5 px-2 text-center w-10 text-emerald-800">H</th>
                      <th className="py-2.5 px-2 text-center w-10 text-amber-800">S</th>
                      <th className="py-2.5 px-2 text-center w-10 text-orange-800">I</th>
                      <th className="py-2.5 px-2 text-center w-10 text-rose-800">A</th>
                      <th className="py-2.5 px-2 text-center w-10 text-indigo-800">D</th>
                      <th className="py-2.5 px-2 text-center w-14 font-mono">% HADIR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {classStudents.map((std, idx) => {
                      let h = 0;
                      let s = 0;
                      let i = 0;
                      let a = 0;
                      let d = 0;

                      attendanceRecords
                        .filter((rec) => rec.studentId === std.id && classSessions.some((sess) => sess.id === rec.sessionId))
                        .forEach((rec) => {
                          if (rec.status === 'H') h++;
                          else if (rec.status === 'S') s++;
                          else if (rec.status === 'I') i++;
                          else if (rec.status === 'A') a++;
                          else if (rec.status === 'D') d++;
                        });

                      const total = h + s + i + a + d || 1;
                      const pct = Math.round((h / total) * 100);

                      return (
                        <tr key={std.id} className="hover:bg-[#faf7ee]/50">
                          <td className="py-2 px-2 text-center font-mono font-bold text-slate-600">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{std.nama}</td>
                          <td className="py-2 px-1 text-center font-mono">{std.gender}</td>
                          <td className="py-2 px-2 text-center font-mono font-bold text-emerald-700">{h}</td>
                          <td className="py-2 px-2 text-center font-mono font-bold text-amber-700">{s}</td>
                          <td className="py-2 px-2 text-center font-mono font-bold text-orange-700">{i}</td>
                          <td className="py-2 px-2 text-center font-mono font-bold text-rose-700">{a}</td>
                          <td className="py-2 px-2 text-center font-mono font-bold text-indigo-700">{d}</td>
                          <td className="py-2 px-2 text-center font-mono font-black text-slate-900">{pct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: DATA NILAI                                       */}
        {/* ======================================================== */}
        {activePortalType === 'nilai' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-[#fef9c3] rounded-3xl p-5 sm:p-6 border-2 border-slate-900 shadow-[4px_4px_0px_#1e293b]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono font-black text-amber-950 uppercase tracking-wider bg-white px-2.5 py-0.5 rounded-full border border-slate-900 inline-block mb-1 shadow-[1px_1px_0px_#1e293b]">
                    BUKU NILAI KURIKULUM MERDEKA
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-950">
                    Capaian Pembelajaran & Rapor Siswa
                  </h3>
                  <p className="text-xs text-amber-900 font-bold mt-1">
                    KKM / Kriteria Ketercapaian TP: {currentClass.kkm} • {currentClass.mapel}
                  </p>
                </div>
              </div>
            </div>

            {/* Grades Table */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#faf7ee] text-slate-900 font-black tracking-wider uppercase border-b-2 border-slate-900">
                      <th className="py-2.5 px-2 w-8 text-center">NO</th>
                      <th className="py-2.5 px-3 min-w-[180px]">NAMA SISWA</th>
                      <th className="py-2.5 px-2 text-center w-12 font-mono">RATA TP</th>
                      <th className="py-2.5 px-2 text-center w-10 font-mono">STS</th>
                      <th className="py-2.5 px-2 text-center w-10 font-mono">SAS</th>
                      <th className="py-2.5 px-2 text-center w-14 font-mono">AKHIR</th>
                      <th className="py-2.5 px-3 min-w-[200px]">DESKRIPSI CAPAIAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {classStudents.map((std, idx) => {
                      const g = grades.find((gr) => gr.studentId === std.id);
                      const validFormatif = (g?.formatif || []).filter(
                        (v): v is number => v !== null && !isNaN(v)
                      );
                      const formatifAvg =
                        validFormatif.length > 0
                          ? validFormatif.reduce((a, b) => a + b, 0) / validFormatif.length
                          : 0;
                      const sts = g?.sts ?? (formatifAvg ? Math.round(formatifAvg) : null);
                      const sas = g?.sas ?? (formatifAvg ? Math.round(formatifAvg) : null);
                      const finalScore = Math.round(formatifAvg * 0.5 + (sts || 0) * 0.25 + (sas || 0) * 0.25);

                      return (
                        <tr key={std.id} className="hover:bg-[#faf7ee]/50">
                          <td className="py-2 px-2 text-center font-mono font-bold text-slate-600">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{std.nama}</td>
                          <td className="py-2 px-2 text-center font-mono font-semibold">{Math.round(formatifAvg) || '-'}</td>
                          <td className="py-2 px-2 text-center font-mono">{sts ?? '-'}</td>
                          <td className="py-2 px-2 text-center font-mono">{sas ?? '-'}</td>
                          <td className="py-2 px-2 text-center font-mono font-black text-emerald-800 text-sm">
                            {finalScore || '-'}
                          </td>
                          <td className="py-2 px-3 text-slate-600 text-[11px] italic">
                            {g?.deskripsi || 'Mencapai tujuan pembelajaran dengan baik.'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 4: DATA TABUNGAN                                    */}
        {/* ======================================================== */}
        {activePortalType === 'tabungan' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-[#e0f2fe] rounded-3xl p-5 sm:p-6 border-2 border-slate-900 shadow-[4px_4px_0px_#1e293b]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono font-black text-sky-950 uppercase tracking-wider bg-white px-2.5 py-0.5 rounded-full border border-slate-900 inline-block mb-1 shadow-[1px_1px_0px_#1e293b]">
                    BUKU TABUNGAN & KAS
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-950">
                    Transparansi Keuangan & Tabungan Siswa
                  </h3>
                  <p className="text-xs text-sky-900 font-bold mt-1">
                    Pencatatan tertib & terverifikasi wali murid
                  </p>
                </div>
              </div>
            </div>

            {/* Savings summary table */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#faf7ee] text-slate-900 font-black tracking-wider uppercase border-b-2 border-slate-900">
                      <th className="py-2.5 px-2 w-8 text-center">NO</th>
                      <th className="py-2.5 px-3 min-w-[200px]">NAMA SISWA</th>
                      <th className="py-2.5 px-3 text-right font-mono min-w-[140px]">SALDO TABUNGAN</th>
                      <th className="py-2.5 px-3 text-center w-28">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {classStudents.map((std, idx) => {
                      const studentFinances = finances.filter(
                        (f) => f.kategori === 'Tabungan Siswa' && f.studentId === std.id
                      );
                      let balance = 0;
                      studentFinances.forEach((t) => {
                        if (t.tipe === 'Pemasukan') balance += t.nominal;
                        else balance -= t.nominal;
                      });

                      return (
                        <tr key={std.id} className="hover:bg-[#faf7ee]/50">
                          <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-600">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{std.nama}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-800 text-sm">
                            Rp {balance.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#dcfce7] text-emerald-950 border border-slate-900">
                              Aktif
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border-3 border-slate-900 shadow-[8px_8px_0px_#1e293b] text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#ffedd5] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center justify-center text-2xl mx-auto mb-3">
              🔥
            </div>
            <h3 className="text-lg font-black text-slate-900">QR Code Portal Hadir!</h3>
            <p className="text-xs text-slate-600 mt-1">
              Pindai menggunakan kamera HP untuk membuka data {currentClass.nama} secara langsung.
            </p>

            <div className="my-4 p-3 bg-white border-2 border-slate-900 rounded-2xl shadow-[3px_3px_0px_#1e293b] inline-block">
              {qrDataUrl && <img src={qrDataUrl} alt="QR Code Hadir!" className="w-48 h-48 mx-auto" />}
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-2xl bg-slate-900 text-white font-black text-xs hover:bg-slate-800 cursor-pointer shadow-[2px_2px_0px_#1e293b]"
            >
              Tutup QR Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
