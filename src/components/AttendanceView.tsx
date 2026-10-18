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
  Edit2,
  Trash2,
  X,
  RotateCcw,
  Clock,
  Layers,
  GraduationCap,
  Users,
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
  activeClass?: ClassRoom | null;
  students: Student[];
  sessions: AttendanceSession[];
  activeSession?: AttendanceSession | null;
  attendanceRecords: AttendanceRecord[];
  onSelectSession: (s: AttendanceSession) => void;
  onUpdateRecord: (studentId: string, status: AttendanceStatus, keterangan?: string) => void;
  onSetAllHadir: (session?: AttendanceSession) => void;
  onSaveToCloud: () => void;
  onCreateNewSession: (customData?: {
    pertemuanKe?: number;
    tanggal?: string;
    mapel?: string;
    materi?: string;
    kegiatan?: string;
    jamPelajaran?: string;
    catatan?: string;
    setAllHadir?: boolean;
  }) => void;
  onUpdateSession?: (session: AttendanceSession) => void;
  onDeleteSession?: (sessionId: string) => void;
  onDeleteStudent?: (studentId: string) => void;
  onOpenParentLink: () => void;
  onOpenWhatsAppModal: (targetStudent?: Student) => void;
  onOpenClassManagement?: () => void;
  schoolName: string;
  teacher?: TeacherProfile;
  printConfig?: PrintConfig;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  activeClass,
  students,
  sessions,
  activeSession: rawActiveSession,
  attendanceRecords,
  onSelectSession,
  onUpdateRecord,
  onSetAllHadir,
  onSaveToCloud,
  onCreateNewSession,
  onUpdateSession,
  onDeleteSession,
  onDeleteStudent,
  onOpenParentLink,
  onOpenWhatsAppModal,
  onOpenClassManagement,
  schoolName,
  teacher,
  printConfig,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<'no' | 'az' | 'za'>('no');
  const [sessionDropdownOpen, setSessionDropdownOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Modal states for Create Session & Manual Edit Session
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditSessionModalOpen, setIsEditSessionModalOpen] = useState(false);

  // Class-specific students & sessions (strict filter by activeClass.id)
  const classStudents = useMemo(() => {
    if (!activeClass) return [];
    return students.filter((s) => s.classId === activeClass.id);
  }, [students, activeClass?.id]);

  const classSessions = useMemo(() => {
    if (!activeClass) return [];
    return sessions.filter((s) => s.classId === activeClass.id);
  }, [sessions, activeClass?.id]);

  // Ensure activeSession belongs to activeClass
  const activeSession = useMemo(() => {
    if (!rawActiveSession || !activeClass) return null;
    if (rawActiveSession.classId && rawActiveSession.classId !== activeClass.id) return null;
    return rawActiveSession;
  }, [rawActiveSession, activeClass]);

  // Create Session Form State
  const nextSessionNumber = useMemo(() => {
    return classSessions.reduce((max, s) => Math.max(max, s.pertemuanKe), 0) + 1;
  }, [classSessions]);

  const [createPertemuan, setCreatePertemuan] = useState<number>(nextSessionNumber);
  const [createTanggal, setCreateTanggal] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [createMapel, setCreateMapel] = useState<string>(activeClass?.mapel || '');
  const [createJam, setCreateJam] = useState<string>('07.15 - 09.15 WIB');
  const [createMateri, setCreateMateri] = useState<string>('');
  const [createKegiatan, setCreateKegiatan] = useState<string>('');
  const [createStartMode, setCreateStartMode] = useState<'empty' | 'all_hadir'>('empty');

  // Edit Session Form State
  const [editPertemuan, setEditPertemuan] = useState<number>(1);
  const [editTanggal, setEditTanggal] = useState<string>('');
  const [editMapel, setEditMapel] = useState<string>('');
  const [editJam, setEditJam] = useState<string>('');
  const [editMateri, setEditMateri] = useState<string>('');
  const [editKegiatan, setEditKegiatan] = useState<string>('');
  const [editCatatan, setEditCatatan] = useState<string>('');

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

  // Attendance metrics calculation
  const metrics = useMemo(() => {
    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpa = 0;
    let dispen = 0;
    let belumDiisi = 0;

    classStudents.forEach((std) => {
      const rec = recordsMap.get(std.id);
      const status = rec?.status;
      if (status === 'H') hadir++;
      else if (status === 'S') sakit++;
      else if (status === 'I') izin++;
      else if (status === 'A') alpa++;
      else if (status === 'D') dispen++;
      else belumDiisi++;
    });

    const total = classStudents.length || 1;
    const percentage = Math.round((hadir / total) * 100);

    return {
      hadir,
      sakit,
      izin,
      alpa,
      dispen,
      belumDiisi,
      total: classStudents.length,
      percentage,
    };
  }, [classStudents, recordsMap]);

  // Filter & sort students
  const filteredStudents = useMemo(() => {
    let list = [...classStudents];
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
  }, [classStudents, searchQuery, sortMode]);

  // Open Create Modal handler
  const handleOpenCreateModal = () => {
    setCreatePertemuan(nextSessionNumber);
    setCreateTanggal(new Date().toISOString().split('T')[0]);
    setCreateMapel(activeClass?.mapel || '');
    setCreateJam('07.15 - 09.15 WIB');
    setCreateMateri('');
    setCreateKegiatan('');
    setCreateStartMode('empty');
    setIsCreateModalOpen(true);
  };

  // Submit Create Session handler
  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateNewSession({
      pertemuanKe: createPertemuan,
      tanggal: createTanggal,
      mapel: createMapel,
      materi: createMateri.trim(),
      kegiatan: createKegiatan.trim(),
      jamPelajaran: createJam.trim(),
      setAllHadir: createStartMode === 'all_hadir',
    });
    setIsCreateModalOpen(false);
  };

  // Open Edit Session Modal handler
  const handleOpenEditSessionModal = () => {
    if (!activeSession) return;
    setEditPertemuan(activeSession.pertemuanKe);
    setEditTanggal(activeSession.tanggal);
    setEditMapel(activeSession.mapel);
    setEditJam(activeSession.jamPelajaran || '07.15 - 09.15 WIB');
    setEditMateri(activeSession.materi || '');
    setEditKegiatan(activeSession.kegiatan || '');
    setEditCatatan(activeSession.catatan || '');
    setIsEditSessionModalOpen(true);
  };

  // Submit Edit Session handler
  const handleSubmitEditSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || !onUpdateSession) return;

    const updatedSession: AttendanceSession = {
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
    };

    onUpdateSession(updatedSession);
    setIsEditSessionModalOpen(false);
  };

  // Generate WhatsApp report text
  const generateWhatsAppReport = () => {
    const absentList: string[] = [];
    classStudents.forEach((s) => {
      const rec = recordsMap.get(s.id);
      if (rec && rec.status && rec.status !== 'H') {
        const ket = rec.keterangan ? ` (${rec.keterangan})` : '';
        absentList.push(`• No. ${s.noUrut} ${s.nama}: [${rec.status}]${ket}`);
      }
    });

    const text = `*LAPORAN PRESENSI HARIAN SISWA*
🏫 *${schoolName}*
📚 Kelas: ${activeClass ? `${activeClass.nama} | ${activeClass.mapel}` : '-'}
📅 Tanggal: ${activeSession ? activeSession.tanggal : '-'} (Pertemuan Ke-${activeSession ? activeSession.pertemuanKe : '-'})
📖 Materi: ${activeSession?.materi || 'Kurikulum Merdeka'}
━━━━━━━━━━━━━━━━━━
📊 *Statistik Kehadiran:*
• Total Siswa: ${classStudents.length}
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
        s.noUrut || idx + 1,
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
      `Presensi_${activeClass?.nama || 'Kelas'}_Pertemuan_${activeSession?.pertemuanKe || 1}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTriggerConfetti = () => {
    onSetAllHadir(activeSession || undefined);
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

  // Modal "Buat Absen Baru" dipakai bersama oleh tampilan kosong (belum ada sesi)
  // dan tampilan utama, supaya tombol pembuka modal berfungsi di kedua kondisi.
  const createSessionModal = isCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border-3 border-slate-900 rounded-3xl p-6 shadow-[6px_6px_0px_#1e293b] relative animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-[#ede9fe] border border-slate-900 text-indigo-950">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Buat Sesi Absen Baru & Agenda Mengajar
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Otomatis sinkron ke Agenda Mengajar termasuk materi, kegiatan, dan kehadiran
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl bg-[#fee2e2] border border-slate-900 text-rose-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreate} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Pertemuan Ke- *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={createPertemuan}
                    onChange={(e) => setCreatePertemuan(parseInt(e.target.value) || 1)}
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
                    value={createTanggal}
                    onChange={(e) => setCreateTanggal(e.target.value)}
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
                    value={createMapel}
                    onChange={(e) => setCreateMapel(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Jam Tatap Muka
                  </label>
                  <input
                    type="text"
                    required
                    value={createJam}
                    onChange={(e) => setCreateJam(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold focus:bg-white focus:outline-none"
                    placeholder="Contoh: 07.15 - 09.15 WIB"
                  />
                </div>
              </div>

              {/* Materi yang Diajarkan */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-800">
                    Materi yang Diajarkan (Kurikulum Merdeka) *
                  </label>
                  <span className="text-[10px] font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    Masuk Agenda Mengajar
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={createMateri}
                  onChange={(e) => setCreateMateri(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold focus:bg-white focus:outline-none placeholder:text-slate-400"
                  placeholder="Contoh: Teks Prosedur Manual & Kosakata Teknik Otomotif"
                />
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-500 font-bold">Saran Cepat:</span>
                  <button
                    type="button"
                    onClick={() => setCreateMateri('Teks Prosedur Manual & Kosakata Teknik Otomotif')}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg border border-slate-300 font-medium"
                  >
                    Teks Prosedur Manual
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateMateri('Perbaikan & Pemeriksaan Sistem Kelistrikan')}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg border border-slate-300 font-medium"
                  >
                    Sistem Kelistrikan
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateMateri('K3LH & Budaya Kerja Industri 5R')}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg border border-slate-300 font-medium"
                  >
                    K3LH & Budaya Kerja
                  </button>
                </div>
              </div>

              {/* Kegiatan Pembelajaran */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Kegiatan Pembelajaran & Praktikum *
                </label>
                <textarea
                  rows={2}
                  required
                  value={createKegiatan}
                  onChange={(e) => setCreateKegiatan(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] focus:bg-white focus:outline-none resize-none font-medium placeholder:text-slate-400"
                  placeholder="Contoh: Demonstrasi instruktur, bedah SOP, dan praktik kelompok di bengkel kerja..."
                />
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="text-[10px] text-slate-500 font-bold">Contoh Cepat:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setCreateKegiatan(
                        'Demonstrasi instruktur, bedah manual book, dan simulasi praktik kelompok'
                      )
                    }
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg border border-slate-300 font-medium"
                  >
                    Demonstrasi & Praktik
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCreateKegiatan(
                        'Diskusi kelompok pemecahan studi kasus, presentasi, dan asesmen formatif'
                      )
                    }
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg border border-slate-300 font-medium"
                  >
                    Diskusi & Presentasi
                  </button>
                </div>
              </div>

              {/* Status Kehadiran Awal */}
              <div className="bg-[#faf7ee] p-3 rounded-2xl border-2 border-slate-900">
                <label className="block font-bold text-slate-800 mb-1.5">
                  Pengaturan Awal Status Presensi:
                </label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="radio"
                      name="startMode"
                      value="empty"
                      checked={createStartMode === 'empty'}
                      onChange={() => setCreateStartMode('empty')}
                      className="accent-emerald-700"
                    />
                    <span>
                      Absen Kosong (Belum Diisi — Sesuai permintaan, tombol "Semua Hadir" ditekan nanti jika perlu)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="radio"
                      name="startMode"
                      value="all_hadir"
                      checked={createStartMode === 'all_hadir'}
                      onChange={() => setCreateStartMode('all_hadir')}
                      className="accent-emerald-700"
                    />
                    <span>Semua Hadir Langsung (Otomatis 100% Hadir)</span>
                  </label>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t-2 border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#f1f5f9] border-2 border-slate-900 font-bold text-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#a7f3d0] hover:bg-[#6ee7b7] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] font-black text-slate-950 cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-emerald-950" />
                  <span>Buat & Sinkronkan ke Agenda</span>
                </button>
              </div>
            </form>
          </div>
        </div>
  ) : null;

  if (!activeClass) {
    return (
      <div className="bg-[#fffdf8] rounded-3xl p-8 border-2 border-slate-900 shadow-[4px_4px_0px_#1e293b] text-center max-w-xl mx-auto my-6">
        <div className="w-14 h-14 rounded-2xl bg-[#6ee7b7] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] mx-auto flex items-center justify-center mb-3">
          <GraduationCap className="w-7 h-7 text-slate-950" />
        </div>
        <h3 className="text-base font-black text-slate-900 mb-1">Belum Ada Rombel / Kelas Aktif</h3>
        <p className="text-xs font-bold text-slate-600 mb-4">
          Silakan buat rombel kelas pertama Anda melalui menu Kelola Rombel untuk mulai presensi.
        </p>
        {onOpenClassManagement && (
          <button
            onClick={onOpenClassManagement}
            className="px-4 py-2.5 rounded-2xl bg-[#6ee7b7] hover:bg-[#34d399] border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] font-black text-xs text-slate-950 cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Rombel Pertama</span>
          </button>
        )}
      </div>
    );
  }

  if (!activeSession) {
    return (
      <>
      <div className="bg-[#fffdf8] rounded-3xl p-8 border-2 border-slate-900 shadow-[4px_4px_0px_#1e293b] text-center max-w-xl mx-auto my-6">
        <div className="w-14 h-14 rounded-2xl bg-[#ede9fe] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] mx-auto flex items-center justify-center mb-3">
          <Calendar className="w-7 h-7 text-indigo-950" />
        </div>
        <h3 className="text-base font-black text-slate-900 mb-1">
          Belum Ada Sesi Presensi ({activeClass.nama})
        </h3>
        <p className="text-xs font-bold text-slate-600 mb-5">
          Buat pertemuan presensi pertama untuk kelas ini sekaligus sinkronkan ke agenda mengajar.
        </p>
        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 rounded-2xl bg-[#6ee7b7] hover:bg-[#34d399] text-slate-950 font-black text-xs border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] cursor-pointer inline-flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Pertemuan Pertama & Agenda</span>
        </button>
      </div>
      {createSessionModal}
      </>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Header Card - Vintage Postmodern Neobrutalist */}
      <div className="bg-[#fffdf8] rounded-3xl p-4 sm:p-6 border-2 border-slate-900 shadow-[4px_4px_0px_#1e293b] relative overflow-visible z-20">
        {/* Retro Corner Stamp with Fire */}
        <div className="absolute top-0 right-0 bg-[#dcfce7] border-b-2 border-l-2 border-slate-900 px-3 py-1 rounded-bl-2xl text-[10px] font-mono font-bold text-emerald-950 flex items-center gap-1 shadow-xs z-10">
          <Flame className="w-3 h-3 text-orange-600 fill-orange-500" />
          <span>PRESENSI & AGENDA</span>
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
              {schoolName} • Pencatatan Harian Terkoneksi Otomatis ke Agenda Mengajar
            </p>
          </div>

          {/* Action Button Strip */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              onClick={onSaveToCloud}
              className="px-3.5 py-2 rounded-2xl bg-[#a7f3d0] hover:bg-[#6ee7b7] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-slate-950 text-xs sm:text-sm font-black flex items-center gap-2 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] transition-all cursor-pointer"
            >
              <Cloud className="w-4 h-4 text-emerald-950" />
              <span>Simpan Cloud</span>
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="px-3.5 py-2 rounded-2xl bg-[#ede9fe] hover:bg-[#ddd6fe] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-indigo-950 text-xs sm:text-sm font-black flex items-center gap-2 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] transition-all cursor-pointer"
              title="Tambah pertemuan baru dengan isian materi & kegiatan yang otomatis tersinkron"
            >
              <Plus className="w-4 h-4 text-indigo-950" />
              <span>Buat Absen Baru</span>
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
            <div className="flex items-center gap-2 flex-wrap">
              {/* Meeting Dropdown */}
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
                    {classSessions.length} Sesi <ChevronDown className="w-3 h-3 inline-block ml-0.5" />
                  </span>
                </button>

                {sessionDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white rounded-3xl shadow-[6px_6px_0px_#1e293b] border-2 border-slate-900 py-2 z-50 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3.5 py-1.5 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                      <span>DAFTAR SESI PERTEMUAN</span>
                      <span className="font-mono">{classSessions.length} Sesi</span>
                    </div>
                    <div className="p-1.5 space-y-1">
                      {classSessions.map((s) => (
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
                              {s.tanggal} • {s.materi || s.mapel}
                            </p>
                          </div>
                          {s.id === activeSession.id && <Check className="w-4 h-4 text-emerald-700" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Edit Manual Sesi Absen Button (Access for already inputted attendance) */}
              <button
                onClick={handleOpenEditSessionModal}
                className="px-3.5 py-2 rounded-2xl bg-[#e0f2fe] hover:bg-[#bae6fd] border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] text-xs font-black text-sky-950 flex items-center gap-1.5 transition-all cursor-pointer"
                title="Edit Manual Tanggal, Materi, dan Catatan Pertemuan yang Sudah Diinput"
              >
                <Edit2 className="w-3.5 h-3.5 text-sky-900" />
                <span>Edit Manual Sesi & Materi</span>
              </button>
            </div>

            <span className="text-[11px] font-medium text-slate-500">
              Pilih atau edit sesi untuk memperbarui materi dan catatan agenda.
            </span>
          </div>

          {/* Horizontal Meeting Pills Timeline */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5">
            <span className="text-[10px] font-black uppercase text-slate-500 shrink-0 font-mono mr-1">
              Sesi:
            </span>
            {classSessions.map((s) => {
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

          {/* Pratinjau Pertemuan & Materi Banner */}
          <div className="bg-[#f0fdf4] border-2 border-emerald-900/30 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-emerald-950 bg-white px-2 py-0.5 rounded-lg border border-emerald-900/20 shadow-xs">
                Pertemuan Ke-{activeSession.pertemuanKe}
              </span>
              <span className="text-slate-700 font-medium">
                📅 {activeSession.tanggal} • 📚 {activeSession.mapel}
              </span>
              {activeSession.materi && (
                <span className="font-bold text-emerald-900 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300">
                  Materi: {activeSession.materi}
                </span>
              )}
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
            {activeSession.materi && (
              <p className="text-xs text-slate-700 font-medium mt-1.5 bg-white/70 p-2 rounded-xl border border-emerald-900/20 line-clamp-2">
                <span className="font-black text-emerald-950">Materi: </span>
                {activeSession.materi}
                {activeSession.kegiatan ? ` (${activeSession.kegiatan})` : ''}
              </p>
            )}
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
              onClick={handleOpenEditSessionModal}
              className="py-2 px-3 rounded-2xl bg-white hover:bg-[#faf7ee] active:translate-x-[1px] active:translate-y-[1px] text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] cursor-pointer"
              title="Edit manual sesi & materi"
            >
              <Edit2 className="w-3.5 h-3.5 text-sky-900" />
              <span>Edit Sesi</span>
            </button>
          </div>
        </div>

        {/* Card 2: Attendance Distribution */}
        <div className="md:col-span-7 bg-[#fffdf8] border-2 border-slate-900 rounded-3xl p-4 sm:p-5 shadow-[4px_4px_0px_#1e293b] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-black text-slate-700 uppercase tracking-wider">
              DISTRIBUSI KEHADIRAN
            </span>
            <span className="text-xs font-bold text-slate-600 font-mono">
              Total: {classStudents.length} Siswa
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 my-3">
            <div className="bg-[#dcfce7] border-2 border-slate-900 rounded-2xl p-2 text-center shadow-[1.5px_1.5px_0px_#1e293b]">
              <span className="text-[10px] font-black text-emerald-900">HADIR</span>
              <p className="text-xl font-black text-emerald-950 font-mono">{metrics.hadir}</p>
            </div>
            <div className="bg-[#fef9c3] border-2 border-slate-900 rounded-2xl p-2 text-center shadow-[1.5px_1.5px_0px_#1e293b]">
              <span className="text-[10px] font-black text-amber-900">SAKIT</span>
              <p className="text-xl font-black text-amber-950 font-mono">{metrics.sakit}</p>
            </div>
            <div className="bg-[#ffedd5] border-2 border-slate-900 rounded-2xl p-2 text-center shadow-[1.5px_1.5px_0px_#1e293b]">
              <span className="text-[10px] font-black text-orange-900">IZIN</span>
              <p className="text-xl font-black text-orange-950 font-mono">{metrics.izin}</p>
            </div>
            <div className="bg-[#fee2e2] border-2 border-slate-900 rounded-2xl p-2 text-center shadow-[1.5px_1.5px_0px_#1e293b]">
              <span className="text-[10px] font-black text-rose-900">ALPA</span>
              <p className="text-xl font-black text-rose-950 font-mono">{metrics.alpa}</p>
            </div>
            <div className="bg-[#ede9fe] border-2 border-slate-900 rounded-2xl p-2 text-center shadow-[1.5px_1.5px_0px_#1e293b]">
              <span className="text-[10px] font-black text-indigo-900">DISPEN</span>
              <p className="text-xl font-black text-indigo-950 font-mono">{metrics.dispen}</p>
            </div>
            <div className="bg-slate-100 border-2 border-slate-900 rounded-2xl p-2 text-center shadow-[1.5px_1.5px_0px_#1e293b]">
              <span className="text-[10px] font-black text-slate-700">KOSONG</span>
              <p className="text-xl font-black text-slate-900 font-mono">{metrics.belumDiisi}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t-2 border-slate-100">
            <span className="font-bold text-slate-700">
              Persentase Hadir: <span className="font-black text-emerald-700 font-mono">{metrics.percentage}%</span>
            </span>
            <button
              onClick={handleCopyReport}
              className="text-[11px] font-bold text-slate-700 hover:text-slate-950 flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copyFeedback ? 'Tersalin!' : 'Salin Teks WA'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table: Daftar Kehadiran Murid */}
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
              onClick={handleTriggerConfetti}
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-2xl bg-[#faf7ee] border-2 border-slate-900 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white transition-all placeholder:text-slate-400"
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
                const currentStatus: AttendanceStatus | '' = record?.status || '';
                const currentKet = record?.keterangan || '';
                const displayNo = student.noUrut || idx + 1;

                return (
                  <tr key={student.id} className="hover:bg-[#faf7ee]/60 transition-colors group">
                    <td className="py-3 px-3 text-center text-slate-600 font-mono font-bold whitespace-nowrap">
                      {displayNo}
                    </td>
                    <td className="py-3 px-4 min-w-[180px]">
                      <div className="font-black text-slate-900 group-hover:text-emerald-800 transition-colors flex items-center gap-1.5 flex-wrap">
                        <span className="break-words">{student.nama}</span>
                        {currentStatus === '' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                            Kosong
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono font-medium">
                        NISN: {student.nisn}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      <span className="inline-block w-6 h-6 rounded-xl bg-[#faf7ee] text-slate-900 font-black text-xs leading-6 text-center border-2 border-slate-900 shadow-[1px_1px_0px_#1e293b]">
                        {student.gender}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap min-w-[230px]">
                      {/* H S I A D Toggle Buttons */}
                      <div className="inline-flex items-center justify-center gap-1 p-1 bg-[#faf7ee] rounded-xl border border-slate-900 shadow-[1px_1px_0px_#1e293b] whitespace-nowrap">
                        {/* H */}
                        <button
                          onClick={() => onUpdateRecord(student.id, 'H', currentKet)}
                          className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg text-xs font-black transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                            currentStatus === 'H'
                              ? 'bg-[#6ee7b7] text-slate-950 border border-slate-900 shadow-[1px_1px_0px_#1e293b]'
                              : 'text-slate-600 hover:bg-white hover:text-slate-900'
                          }`}
                          title="Hadir"
                        >
                          H
                        </button>

                        {/* S */}
                        <button
                          onClick={() => onUpdateRecord(student.id, 'S', currentKet)}
                          className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg text-xs font-black transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                            currentStatus === 'S'
                              ? 'bg-[#fde047] text-amber-950 border border-slate-900 shadow-[1px_1px_0px_#1e293b]'
                              : 'text-slate-600 hover:bg-white hover:text-slate-900'
                          }`}
                          title="Sakit"
                        >
                          S
                        </button>

                        {/* I */}
                        <button
                          onClick={() => onUpdateRecord(student.id, 'I', currentKet)}
                          className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg text-xs font-black transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                            currentStatus === 'I'
                              ? 'bg-[#fdba74] text-orange-950 border border-slate-900 shadow-[1px_1px_0px_#1e293b]'
                              : 'text-slate-600 hover:bg-white hover:text-slate-900'
                          }`}
                          title="Izin"
                        >
                          I
                        </button>

                        {/* A */}
                        <button
                          onClick={() => onUpdateRecord(student.id, 'A', currentKet)}
                          className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg text-xs font-black transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                            currentStatus === 'A'
                              ? 'bg-[#f87171] text-white border border-slate-900 shadow-[1px_1px_0px_#1e293b]'
                              : 'text-slate-600 hover:bg-white hover:text-slate-900'
                          }`}
                          title="Alfa (Tanpa Keterangan)"
                        >
                          A
                        </button>

                        {/* D */}
                        <button
                          onClick={() => onUpdateRecord(student.id, 'D', currentKet)}
                          className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg text-xs font-black transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                            currentStatus === 'D'
                              ? 'bg-[#c084fc] text-white border border-slate-900 shadow-[1px_1px_0px_#1e293b]'
                              : 'text-slate-600 hover:bg-white hover:text-slate-900'
                          }`}
                          title="Dispensasi"
                        >
                          D
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3 min-w-[180px] max-w-[250px]">
                      <div className="w-full">
                        <input
                          type="text"
                          placeholder="Catatan izin/keterangan..."
                          value={currentKet}
                          onChange={(e) => {
                            if (currentStatus) {
                              onUpdateRecord(student.id, currentStatus, e.target.value);
                            }
                          }}
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-900 bg-[#faf7ee] text-slate-900 font-bold focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap min-w-[135px]">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenWhatsAppModal(student)}
                          className="px-2.5 py-1.5 rounded-xl bg-[#dcfce7] hover:bg-[#bbf7d0] text-emerald-950 border border-slate-900 shadow-[1px_1px_0px_#1e293b] text-xs font-black flex items-center gap-1 transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
                          title="Kirim pesan WA ke Wali Murid"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WA</span>
                        </button>
                        {onDeleteStudent && (
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Hapus murid "${student.nama}" (Nomor Absen ${displayNo}) dari kelas? Nomor absen setelahnya akan otomatis diganti berurutan (misalnya nomor 17 menjadi 16).`
                                )
                              ) {
                                onDeleteStudent(student.id);
                              }
                            }}
                            className="p-1.5 rounded-xl bg-[#fee2e2] hover:bg-[#fca5a5] text-rose-950 border border-slate-900 shadow-[1px_1px_0px_#1e293b] transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
                            title="Hapus Siswa (Nomor Absen Otomatis Diganti)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {createSessionModal}

      {/* Modal: Edit Manual Sesi Absen yang Sudah Diinput */}
      {isEditSessionModalOpen && activeSession && (
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
                onClick={() => setIsEditSessionModalOpen(false)}
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

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Jam Tatap Muka
                  </label>
                  <input
                    type="text"
                    value={editJam}
                    onChange={(e) => setEditJam(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold focus:bg-white focus:outline-none"
                    placeholder="Contoh: 07.15 - 09.15 WIB"
                  />
                </div>
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
                        setIsEditSessionModalOpen(false);
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
                    onClick={() => setIsEditSessionModalOpen(false)}
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
      )}

      {/* Formal Printable Document Component */}
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
