import React, { useState, useMemo } from 'react';
import {
  Cloud,
  Plus,
  FileSpreadsheet,
  FileText,
  Calendar,
  Check,
  Copy,
  MessageCircle,
  Search,
  CheckCircle2,
  Flame,
  QrCode,
  Eye,
  Send,
  Printer,
  ChevronDown,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Student,
  AttendanceSession,
  AttendanceRecord,
  AttendanceStatus,
  ClassRoom,
  TeacherProfile,
  PrintConfig,
} from '../types';
import { PrintableDocument } from './PrintableDocument';

interface AttendanceViewProps {
  activeClass: ClassRoom;
  students: Student[];
  sessions: AttendanceSession[];
  activeSession: AttendanceSession;
  attendanceRecords: AttendanceRecord[];
  onSelectSession: (s: AttendanceSession) => void;
  onUpdateRecord: (studentId: string, status: AttendanceStatus, keterangan?: string) => void;
  onSetAllHadir: () => void;
  onSaveToCloud: () => void;
  onCreateNewSession: () => void;
  onOpenParentLink: () => void;
  onOpenWhatsAppModal: (targetStudent?: Student) => void;
  schoolName: string;
  teacher?: TeacherProfile;
  printConfig?: PrintConfig;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  activeClass,
  students,
  sessions,
  activeSession,
  attendanceRecords,
  onSelectSession,
  onUpdateRecord,
  onSetAllHadir,
  onSaveToCloud,
  onCreateNewSession,
  onOpenParentLink,
  onOpenWhatsAppModal,
  schoolName,
  teacher = {
    name: 'Hendra Setiawan, S. Pd.',
    email: 'hendrasetiawan72@guru.smk.belajar.id',
    nip: '19870415 201201 1 003',
    school: 'Hadir!',
    handle: '@hndx07',
  },
  printConfig,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<'no' | 'az' | 'za'>('no');
  const [sessionDropdownOpen, setSessionDropdownOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Map of studentId -> AttendanceRecord
  const recordsMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    if (activeSession) {
      attendanceRecords
        .filter((r) => r.sessionId === activeSession.id)
        .forEach((r) => map.set(r.studentId, r));
    }
    return map;
  }, [attendanceRecords, activeSession]);

  // Attendance metrics calculation (handles newly created sessions starting empty / kosong)
  const metrics = useMemo(() => {
    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpa = 0;
    let dispen = 0;
    let belumDiisi = 0;

    students.forEach((std) => {
      const rec = recordsMap.get(std.id);
      const status = rec?.status;
      if (status === 'H') hadir++;
      else if (status === 'S') sakit++;
      else if (status === 'I') izin++;
      else if (status === 'A') alpa++;
      else if (status === 'D') dispen++;
      else belumDiisi++;
    });

    const total = students.length || 1;
    const percentage = Math.round((hadir / total) * 100);

    return {
      hadir,
      sakit,
      izin,
      alpa,
      dispen,
      belumDiisi,
      total: students.length,
      percentage,
    };
  }, [students, recordsMap]);

  // Filter & sort students
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

  // Generate WhatsApp report text
  const generateWhatsAppReport = () => {
    const absentList: string[] = [];
    students.forEach((s) => {
      const rec = recordsMap.get(s.id);
      if (rec && rec.status && rec.status !== 'H') {
        const ket = rec.keterangan ? ` (${rec.keterangan})` : '';
        absentList.push(`• ${s.nama}: [${rec.status}]${ket}`);
      }
    });

    const text = `*LAPORAN PRESENSI HARIAN SISWA*
🏫 *${schoolName}*
📚 Kelas: ${activeClass.nama} | ${activeClass.mapel}
📅 Tanggal: ${activeSession ? activeSession.tanggal : '-'} (Pertemuan Ke-${activeSession ? activeSession.pertemuanKe : '-'})
━━━━━━━━━━━━━━━━━━
📊 *Statistik Kehadiran:*
• Total Siswa: ${students.length}
• Hadir (H): ${metrics.hadir} (${metrics.percentage}%)
• Sakit (S): ${metrics.sakit}
• Izin (I): ${metrics.izin}
• Alpa (A): ${metrics.alpa}
• Dispen (D): ${metrics.dispen}
${metrics.belumDiisi > 0 ? `• Belum Diisi: ${metrics.belumDiisi}\n` : ''}
${
  absentList.length > 0
    ? `*Siswa Yang Tidak Hadir:*\n${absentList.join('\n')}`
    : metrics.belumDiisi > 0
    ? `_Catatan: Masih ada ${metrics.belumDiisi} siswa belum diisi presensinya._`
    : '✅ *Semua Siswa Hadir Lengkap (100%)*'
}

━━━━━━━━━━━━━━━━━━
_Laporan resmi dibuat via Sistem Kurikulum Merdeka Hadir! (Tersinkronisasi Otomatis ke Agenda Mengajar)._`;
    return text;
  };

  const handleCopyReport = () => {
    const text = generateWhatsAppReport();
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  const handleExportCSV = () => {
    const headers = ['No', 'NISN', 'Nama Siswa', 'L/P', 'Status', 'Keterangan'];
    const rows = filteredStudents.map((s, idx) => {
      const rec = recordsMap.get(s.id);
      return [
        idx + 1,
        `"${s.nisn}"`,
        `"${s.nama}"`,
        s.gender,
        rec?.status || '-',
        `"${rec?.keterangan || ''}"`,
      ].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Presensi_${activeClass.nama}_Pertemuan_${activeSession?.pertemuanKe || 1}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTriggerConfetti = () => {
    onSetAllHadir();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#a7f3d0', '#fef08a', '#ede9fe', '#bae6fd'],
      });
    } catch {
      // fallback
    }
  };

  if (!activeSession) {
    return (
      <div className="bg-white rounded-3xl p-8 border-2 border-slate-900 shadow-[4px_4px_0px_#1e293b] text-center">
        <p className="text-sm font-bold text-slate-600 mb-4">
          Belum ada sesi presensi untuk kelas ini.
        </p>
        <button
          onClick={onCreateNewSession}
          className="px-4 py-2 rounded-2xl bg-[#6ee7b7] text-slate-950 font-black text-xs border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] cursor-pointer"
        >
          Buat Pertemuan Pertama
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Header Card - Vintage Postmodern Neobrutalist (overflow-visible to prevent clipping dropdowns) */}
      <div className="bg-[#fffdf8] rounded-3xl p-4 sm:p-6 border-2 border-slate-900 shadow-[4px_4px_0px_#1e293b] relative overflow-visible z-20">
        {/* Retro Corner Stamp with Fire */}
        <div className="absolute top-0 right-0 bg-[#dcfce7] border-b-2 border-l-2 border-slate-900 px-3 py-1 rounded-bl-2xl text-[10px] font-mono font-bold text-emerald-950 flex items-center gap-1 shadow-xs z-10">
          <Flame className="w-3 h-3 text-orange-600 fill-orange-500" />
          <span>PRESENSI HARIAN</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 sm:pt-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-slate-600 mb-1.5 flex-wrap">
              <span className="bg-[#e0f2fe] text-sky-950 px-2.5 py-0.5 rounded-full border-2 border-slate-900 font-mono text-[11px] shadow-[1.5px_1.5px_0px_#1e293b]">
                {activeClass.nama}
              </span>
              <span>•</span>
              <span className="font-bold text-slate-700">
                Tahun Ajaran {activeClass.tahunAjaran} ({activeClass.semester})
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Buku Presensi & Kehadiran Murid
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              {schoolName} • Pencatatan Harian Realtime Terhubung Cloud & Agenda Mengajar
            </p>
          </div>

          {/* Action Button Strip - Clean & No Dualism */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              onClick={onSaveToCloud}
              className="px-3.5 py-2 rounded-2xl bg-[#a7f3d0] hover:bg-[#6ee7b7] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-slate-950 text-xs sm:text-sm font-black flex items-center gap-2 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] transition-all cursor-pointer"
            >
              <Cloud className="w-4 h-4 text-emerald-950" />
              <span>Simpan ke Cloud</span>
            </button>

            <button
              onClick={onCreateNewSession}
              className="px-3.5 py-2 rounded-2xl bg-[#ede9fe] hover:bg-[#ddd6fe] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-indigo-950 text-xs sm:text-sm font-black flex items-center gap-2 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] transition-all cursor-pointer"
              title="Tambah pertemuan baru dengan absen kosong"
            >
              <Plus className="w-4 h-4 text-indigo-950" />
              <span>Pertemuan Baru</span>
            </button>

            <button
              onClick={onOpenParentLink}
              className="px-3.5 py-2 rounded-2xl bg-[#ffedd5] hover:bg-[#fed7aa] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-orange-950 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer"
              title="Buka Portal Publik & QR Code"
            >
              <QrCode className="w-4 h-4 text-orange-900" />
              <span>Link Publik & QR</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-2xl bg-[#fef9c3] hover:bg-[#fde047] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-amber-950 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
              title="Ekspor Data ke File Excel / CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-900" />
              <span>Excel</span>
            </button>

            {/* Kertas Siap Cetak Button (Dokumen Standar Putih Bersih) */}
            <button
              onClick={() => setShowPrintModal(true)}
              className="px-3 py-2 rounded-2xl bg-[#fee2e2] hover:bg-[#fca5a5] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-rose-950 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
              title="Cetak Kertas Dokumen Resmi Putih Tanpa Margin Web"
            >
              <Printer className="w-3.5 h-3.5 text-rose-900" />
              <span>Kertas Cetak</span>
            </button>
          </div>
        </div>

        {/* Meeting Dropdown & Interactive Timeline Selector */}
        <div className="mt-4 pt-4 border-t-2 border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="relative">
              <button
                onClick={() => setSessionDropdownOpen(!sessionDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#faf7ee] hover:bg-[#f5eedc] border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] text-xs sm:text-sm font-black text-slate-900 transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-emerald-800" />
                <span>
                  Pertemuan Ke-{activeSession.pertemuanKe} ({activeSession.tanggal})
                </span>
                <span className="text-xs bg-slate-900 text-white px-2 py-0.5 rounded-full ml-1 font-mono">
                  {sessions.length} Sesi <ChevronDown className="w-3 h-3 inline-block ml-0.5" />
                </span>
              </button>

              {/* Dropdown Menu - Unclipped with high z-index */}
              {sessionDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white rounded-3xl shadow-[6px_6px_0px_#1e293b] border-2 border-slate-900 py-2 z-50 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-1.5 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                    <span>DAFTAR SESI PERTEMUAN</span>
                    <span className="font-mono">{sessions.length} Sesi</span>
                  </div>
                  <div className="p-1.5 space-y-1">
                    {sessions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          onSelectSession(s);
                          setSessionDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                          s.id === activeSession.id
                            ? 'bg-[#dcfce7] border-2 border-slate-900 text-slate-950 font-black shadow-[2px_2px_0px_#1e293b]'
                            : 'hover:bg-[#faf7ee] text-slate-800 font-bold'
                        }`}
                      >
                        <div>
                          <p className="font-bold">Pertemuan Ke-{s.pertemuanKe}</p>
                          <p className="text-[10px] text-slate-500">
                            {s.tanggal} • {s.mapel}
                          </p>
                        </div>
                        {s.id === activeSession.id && <Check className="w-4 h-4 text-emerald-700" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <span className="text-[11px] font-medium text-slate-500">
              Pilih sesi untuk melihat atau mengedit daftar hadir tanggal terkait.
            </span>
          </div>

          {/* Horizontal Meeting Pills Timeline so meetings are immediately visible and clickable */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5">
            <span className="text-[10px] font-black uppercase text-slate-500 shrink-0 font-mono mr-1">
              Sesi:
            </span>
            {sessions.map((s) => {
              const isActive = s.id === activeSession.id;
              return (
                <button
                  key={s.id}
                  onClick={() => onSelectSession(s)}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 border-2 border-slate-900 ${
                    isActive
                      ? 'bg-[#6ee7b7] text-slate-950 shadow-[2px_2px_0px_#1e293b]'
                      : 'bg-white hover:bg-[#faf7ee] text-slate-700 shadow-[1px_1px_0px_#1e293b]'
                  }`}
                >
                  Ke-{s.pertemuanKe}{' '}
                  <span className="text-[10px] font-mono font-medium opacity-80">
                    ({s.tanggal.slice(5)})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dedicated Pratinjau Pertemuan Banner (ensures preview below meeting is clear & synchronized) */}
          <div className="bg-[#f0fdf4] border-2 border-emerald-900/30 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-black text-emerald-950 bg-white px-2 py-0.5 rounded-lg border border-emerald-900/20 shadow-xs">
                Pratinjau Pertemuan Ke-{activeSession.pertemuanKe}
              </span>
              <span className="text-slate-700 font-medium">
                📅 {activeSession.tanggal} • 📚 {activeSession.mapel}
              </span>
            </div>
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Tersinkronisasi otomatis ke Agenda Mengajar</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards Grid in Pastel Neobrutalism */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4">
        {/* Card 1: Session Controller Banner */}
        <div className="md:col-span-5 bg-[#dcfce7] text-slate-900 border-2 border-slate-900 rounded-3xl p-4 sm:p-5 shadow-[4px_4px_0px_#1e293b] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black bg-white border border-slate-900 px-2.5 py-0.5 rounded-full shadow-[1.5px_1.5px_0px_#1e293b]">
                Pertemuan Ke-{activeSession.pertemuanKe}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-950">
                📅 {activeSession.tanggal}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black mt-2 tracking-tight text-slate-900">
              {new Date(activeSession.tanggal).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </h3>
            <p className="text-xs text-emerald-900 font-bold mt-0.5 truncate">
              {activeSession.mapel}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-3 border-t-2 border-emerald-300">
            <button
              onClick={handleTriggerConfetti}
              className="flex-1 py-2 px-3 rounded-2xl bg-[#6ee7b7] hover:bg-[#34d399] active:translate-x-[1px] active:translate-y-[1px] text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition-all border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] cursor-pointer"
              title="Setel semua siswa menjadi Hadir (100%)"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Set Semua Hadir</span>
            </button>
            <button
              onClick={handleCopyReport}
              className="flex-1 py-2 px-3 rounded-2xl bg-white hover:bg-[#faf7ee] active:translate-x-[1px] active:translate-y-[1px] text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-slate-800" />
              <span>{copyFeedback ? 'Tersalin!' : 'Salin Laporan WA'}</span>
            </button>
          </div>
        </div>

        {/* Card 2: Percentage Progress in Pastel Teal */}
        <div className="md:col-span-3 bg-[#ccfbf1] border-2 border-slate-900 rounded-3xl p-4 sm:p-5 shadow-[4px_4px_0px_#1e293b] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-black text-teal-950 tracking-wider uppercase bg-white border border-slate-900 px-2 py-0.5 rounded-md shadow-[1px_1px_0px_#1e293b]">
              PERSENTASE HADIR
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl sm:text-4xl font-black text-teal-950 tracking-tight font-mono">
                {metrics.percentage}%
              </span>
              <span className="text-xs font-bold text-teal-800">
                ({metrics.hadir}/{metrics.total} Murid)
              </span>
            </div>
            {metrics.belumDiisi > 0 && (
              <span className="text-[11px] font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-900/30 inline-block mt-1">
                {metrics.belumDiisi} Siswa Belum Diabsen
              </span>
            )}
          </div>

          <div className="mt-4">
            <div className="w-full bg-white rounded-full h-3.5 overflow-hidden p-0.5 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#1e293b]">
              <div
                className="bg-[#0d9488] h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.percentage}%` }}
              />
            </div>
            <p className="text-[11px] font-bold text-teal-900 mt-2 text-right">
              Target Ketercapaian: &gt; 90%
            </p>
          </div>
        </div>

        {/* Card 3: 5 Colorful Pastel Neobrutalist Bars (H, S, I, A, D) */}
        <div className="md:col-span-4 bg-white border-2 border-slate-900 rounded-3xl p-3 sm:p-4 shadow-[4px_4px_0px_#1e293b] flex items-stretch gap-1.5 sm:gap-2">
          {/* Hadir */}
          <div className="flex-1 bg-[#dcfce7] border-2 border-slate-900 rounded-2xl p-2 flex flex-col items-center justify-center text-center shadow-[2px_2px_0px_#1e293b]">
            <span className="text-xl sm:text-2xl font-black text-emerald-950 font-mono">
              {metrics.hadir}
            </span>
            <span className="text-[10px] sm:text-xs font-black text-emerald-900 mt-0.5">Hadir</span>
          </div>

          {/* Sakit */}
          <div className="flex-1 bg-[#fef9c3] border-2 border-slate-900 rounded-2xl p-2 flex flex-col items-center justify-center text-center shadow-[2px_2px_0px_#1e293b]">
            <span className="text-xl sm:text-2xl font-black text-amber-950 font-mono">
              {metrics.sakit}
            </span>
            <span className="text-[10px] sm:text-xs font-black text-amber-900 mt-0.5">Sakit</span>
          </div>

          {/* Izin */}
          <div className="flex-1 bg-[#ffedd5] border-2 border-slate-900 rounded-2xl p-2 flex flex-col items-center justify-center text-center shadow-[2px_2px_0px_#1e293b]">
            <span className="text-xl sm:text-2xl font-black text-orange-950 font-mono">
              {metrics.izin}
            </span>
            <span className="text-[10px] sm:text-xs font-black text-orange-900 mt-0.5">Izin</span>
          </div>

          {/* Alfa */}
          <div className="flex-1 bg-[#fee2e2] border-2 border-slate-900 rounded-2xl p-2 flex flex-col items-center justify-center text-center shadow-[2px_2px_0px_#1e293b]">
            <span className="text-xl sm:text-2xl font-black text-rose-950 font-mono">
              {metrics.alpa}
            </span>
            <span className="text-[10px] sm:text-xs font-black text-rose-900 mt-0.5">Alfa</span>
          </div>

          {/* Dispen */}
          <div className="flex-1 bg-[#ede9fe] border-2 border-slate-900 rounded-2xl p-2 flex flex-col items-center justify-center text-center shadow-[2px_2px_0px_#1e293b]">
            <span className="text-xl sm:text-2xl font-black text-indigo-950 font-mono">
              {metrics.dispen}
            </span>
            <span className="text-[10px] sm:text-xs font-black text-indigo-900 mt-0.5">Dispen</span>
          </div>
        </div>
      </div>

      {/* WhatsApp Parent Notification Strip */}
      <div className="bg-[#faf7ee] border-2 border-slate-900 rounded-3xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-[3px_3px_0px_#1e293b]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#dcfce7] border-2 border-slate-900 text-emerald-950 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#1e293b]">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-slate-900">
                Pratinjau Teks WhatsApp Laporan Orang Tua
              </h4>
              <span className="text-[10px] font-mono font-bold bg-[#dcfce7] border border-slate-900 text-emerald-950 px-2 py-0.2 rounded-md">
                AUTO-SYNC
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Format etika kesopanan Indonesia terstruktur. Otomatis diperbarui saat status absensi dipilih.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenWhatsAppModal()}
            className="px-3.5 py-1.5 rounded-xl bg-[#6ee7b7] hover:bg-[#34d399] border-2 border-slate-900 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-[2.5px_2.5px_0px_#1e293b] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim WA & Japri</span>
          </button>
        </div>
      </div>

      {/* Main Table: Daftar Kehadiran Murid */}
      <div className="bg-white border-2 border-slate-900 rounded-3xl shadow-[4px_4px_0px_#1e293b] overflow-hidden">
        {/* Table Top Controls */}
        <div className="p-4 border-b-2 border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fffdf8]">
          <h3 className="text-base font-black text-slate-900">
            Daftar Kehadiran Murid ({filteredStudents.length} Siswa)
          </h3>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari murid atau NISN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-2xl bg-[#faf7ee] border-2 border-slate-900 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:shadow-[2px_2px_0px_#0d9488] transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center bg-white p-1 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] shrink-0 gap-1">
              <button
                onClick={() => setSortMode('no')}
                className={`px-2.5 py-1 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  sortMode === 'no'
                    ? 'bg-[#dcfce7] text-slate-900 border border-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                No
              </button>
              <button
                onClick={() => setSortMode('az')}
                className={`px-2.5 py-1 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  sortMode === 'az'
                    ? 'bg-[#e0f2fe] text-slate-900 border border-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                A-Z
              </button>
              <button
                onClick={() => setSortMode('za')}
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
                <th className="py-3 px-3 w-12 text-center">NO</th>
                <th className="py-3 px-4 min-w-[200px]">NAMA MURID</th>
                <th className="py-3 px-3 w-14 text-center">L/P</th>
                <th className="py-3 px-4 min-w-[240px] text-center">STATUS KEHADIRAN (H/S/I/A/D)</th>
                <th className="py-3 px-4 min-w-[220px]">KETERANGAN / ALASAN</th>
                <th className="py-3 px-3 w-24 text-center">WA ORTU</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {filteredStudents.map((student, idx) => {
                const record = recordsMap.get(student.id);
                // When status is undefined or empty, it is empty (belum diisi)
                const currentStatus: AttendanceStatus | '' = record?.status || '';
                const currentKet = record?.keterangan || '';

                return (
                  <tr key={student.id} className="hover:bg-[#faf7ee]/60 transition-colors group">
                    <td className="py-3 px-3 text-center text-slate-600 font-mono font-bold">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-black text-slate-900 group-hover:text-emerald-800 transition-colors flex items-center gap-1.5">
                        <span>{student.nama}</span>
                        {currentStatus === '' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                            Kosong
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono font-medium">
                        NISN: {student.nisn}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-block w-6 h-6 rounded-xl bg-[#faf7ee] text-slate-900 font-black text-xs leading-6 text-center border-2 border-slate-900 shadow-[1px_1px_0px_#1e293b]">
                        {student.gender}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {/* Interactive H S I A D Toggle Buttons */}
                      <div className="inline-flex items-center gap-1 sm:gap-1.5 p-1 bg-[#faf7ee] rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b]">
                        {/* H */}
                        <button
                          onClick={() => onUpdateRecord(student.id, 'H', currentKet)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-black transition-all flex items-center justify-center cursor-pointer ${
                            currentStatus === 'H'
                              ? 'bg-[#6ee7b7] text-slate-950 border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b]'
                              : 'text-slate-600 hover:bg-white hover:text-slate-900'
                          }`}
                          title="Hadir"
                        >
                          H
                        </button>

                        {/* S */}
                        <button
                          onClick={() => onUpdateRecord(student.id, 'S', currentKet)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-black transition-all flex items-center justify-center cursor-pointer ${
                            currentStatus === 'S'
                              ? 'bg-[#fde047] text-amber-950 border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b]'
                              : 'text-slate-600 hover:bg-white hover:text-slate-900'
                          }`}
                          title="Sakit"
                        >
                          S
                        </button>

                        {/* I */}
                        <button
                          onClick={() => onUpdateRecord(student.id, 'I', currentKet)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-black transition-all flex items-center justify-center cursor-pointer ${
                            currentStatus === 'I'
                              ? 'bg-[#fdba74] text-orange-950 border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b]'
                              : 'text-slate-600 hover:bg-white hover:text-slate-900'
                          }`}
                          title="Izin"
                        >
                          I
                        </button>

                        {/* A */}
                        <button
                          onClick={() => onUpdateRecord(student.id, 'A', currentKet)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-black transition-all flex items-center justify-center cursor-pointer ${
                            currentStatus === 'A'
                              ? 'bg-[#f87171] text-white border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b]'
                              : 'text-slate-600 hover:bg-white hover:text-slate-900'
                          }`}
                          title="Alfa (Tanpa Keterangan)"
                        >
                          A
                        </button>

                        {/* D */}
                        <button
                          onClick={() => onUpdateRecord(student.id, 'D', currentKet)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-black transition-all flex items-center justify-center cursor-pointer ${
                            currentStatus === 'D'
                              ? 'bg-[#c084fc] text-white border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b]'
                              : 'text-slate-600 hover:bg-white hover:text-slate-900'
                          }`}
                          title="Dispensasi"
                        >
                          D
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        placeholder="Catatan izin/keterangan..."
                        value={currentKet}
                        onChange={(e) => {
                          if (currentStatus) {
                            onUpdateRecord(student.id, currentStatus, e.target.value);
                          }
                        }}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border-2 border-slate-900 bg-[#faf7ee] text-slate-900 font-bold focus:bg-white focus:outline-none focus:shadow-[2px_2px_0px_#0d9488] transition-all placeholder:text-slate-400"
                      />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onOpenWhatsAppModal(student)}
                        className="px-2.5 py-1.5 rounded-xl bg-[#dcfce7] hover:bg-[#bbf7d0] text-emerald-950 border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-xs font-black flex items-center gap-1 mx-auto transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
                        title="Kirim pesan WA ke Wali Murid"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WA</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formal Printable Document Component (Modal View & Print Target) */}
      <PrintableDocument
        type="attendance"
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        activeClass={activeClass}
        teacher={teacher}
        schoolName={schoolName}
        printConfig={printConfig}
        session={activeSession}
        sessions={sessions}
        students={students}
        attendanceRecords={attendanceRecords}
      />
    </div>
  );
};
