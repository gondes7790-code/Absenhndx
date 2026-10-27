import React, { useState, useEffect } from 'react';
import {
  Share2,
  Calendar,
  Wallet,
  FileSpreadsheet,
  X,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  ShieldCheck,
  User,
  Trash2,
  Send,
  Flame,
} from 'lucide-react';
import QRCode from 'qrcode';
import {
  ShareRow,
  ShareScope,
  SHARE_SCOPE_LABEL,
  buildShareUrl,
  createShare,
  listActiveShares,
  revokeShare,
} from '../services/shareService';
import { Student, AttendanceRecord, GradeRecord, ClassRoom, TeacherProfile, FinanceTransaction } from '../types';
import { APP_LOGO_URL } from '../utils/printConfig';

export type PortalType = 'absen' | 'tabungan' | 'nilai' | 'rekap';

interface ParentPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeClass?: ClassRoom | null;
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  grades: GradeRecord[];
  finances: FinanceTransaction[];
  teacher: TeacherProfile;
  schoolName?: string;
  initialType?: PortalType;
  onOpenFullPublicPortal?: () => void;
  userId?: string | null;
  isDemoMode?: boolean;
}

export const ParentPortalModal: React.FC<ParentPortalModalProps> = ({
  isOpen,
  onClose,
  activeClass,
  students,
  attendanceRecords,
  grades,
  finances,
  teacher,
  initialType = 'absen',
  onOpenFullPublicPortal,
  userId,
  isDemoMode,
  schoolName,
}) => {
  const [activePortalType, setActivePortalType] = useState<PortalType>(initialType);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showQrExpanded, setShowQrExpanded] = useState(false);

  // Tautan aman wali murid (token acak, masa berlaku, bisa dicabut)
  const [shares, setShares] = useState<ShareRow[]>([]);
  const [sharesLoading, setSharesLoading] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [shareError, setShareError] = useState('');
  const [shareScopes, setShareScopes] = useState<ShareScope[]>(['absen']);
  const [shareDays, setShareDays] = useState<number>(30);

  const canShare = Boolean(userId) && !isDemoMode;
  const sharingAllowed = canShare && activePortalType !== 'rekap';
  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const currentStudentId = currentStudent?.id;
  const activeShare = sharingAllowed ? shares[0] || null : null;
  const shareUrl = activeShare ? buildShareUrl(activeShare.token) : '';

  // CATATAN: semua hook harus dipanggil SEBELUM early return di bawah.
  // (Versi lama memanggil useEffect setelah `return null`, yang membuat React
  // melempar "Rendered more hooks than during the previous render" saat modal dibuka.)
  useEffect(() => {
    setActivePortalType(initialType);
  }, [initialType, isOpen]);

  // Muat tautan aktif milik murid terpilih (satu query)
  useEffect(() => {
    if (!isOpen || !canShare || !currentStudentId) {
      setShares([]);
      return;
    }
    let cancelled = false;
    setSharesLoading(true);
    setShareError('');
    listActiveShares(currentStudentId)
      .then((rows) => {
        if (!cancelled) setShares(rows);
      })
      .catch((err: Error) => {
        if (!cancelled) setShareError(err.message);
      })
      .finally(() => {
        if (!cancelled) setSharesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, canShare, currentStudentId]);

  // QR hanya dibuat untuk tautan yang benar-benar ada
  useEffect(() => {
    if (!isOpen || !shareUrl) {
      setQrDataUrl('');
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(shareUrl, {
      width: 240,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch((err) => console.error('QR code error', err));
    return () => {
      cancelled = true;
    };
  }, [shareUrl, isOpen]);

  if (!isOpen || !activeClass) return null;

  // --- 1. Data Absen (Read-Only) ---
  const studentRecords = attendanceRecords.filter((r) => r.studentId === currentStudent?.id);
  let hadirCount = 0;
  let sakitCount = 0;
  let izinCount = 0;
  let alpaCount = 0;
  let dispenCount = 0;
  studentRecords.forEach((r) => {
    if (r.status === 'H') hadirCount++;
    else if (r.status === 'S') sakitCount++;
    else if (r.status === 'I') izinCount++;
    else if (r.status === 'A') alpaCount++;
    else if (r.status === 'D') dispenCount++;
  });
  const totalAtt = studentRecords.length || 1;
  const attPercent = Math.round((hadirCount / totalAtt) * 100);

  // --- 2. Data Tabungan (Read-Only) ---
  const studentTransactions = finances.filter(
    (f) => f.kategori === 'Tabungan Siswa' && f.studentId === currentStudent?.id
  );
  let totalTabungan = 0;
  studentTransactions.forEach((t) => {
    if (t.tipe === 'Pemasukan') totalTabungan += t.nominal;
    else totalTabungan -= t.nominal;
  });

  // --- 3. Data Nilai (Read-Only) ---
  const gradeObj = grades.find((g) => g.studentId === currentStudent?.id);
  const validFormatif = (gradeObj?.formatif || []).filter((v): v is number => v !== null && !isNaN(v));
  const formatifAvg = validFormatif.length > 0
    ? validFormatif.reduce((a, b) => a + b, 0) / validFormatif.length
    : 0;
  const sts = gradeObj?.sts ?? formatifAvg;
  const sas = gradeObj?.sas ?? formatifAvg;
  const finalScore = Math.round((formatifAvg * 0.5) + (sts * 0.25) + (sas * 0.25));

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const toggleShareScope = (scope: ShareScope) => {
    setShareScopes((prev) =>
      prev.includes(scope) ? (prev.length > 1 ? prev.filter((x) => x !== scope) : prev) : [...prev, scope]
    );
  };

  const handleCreateShare = async () => {
    if (!userId || !currentStudent) return;
    setShareBusy(true);
    setShareError('');
    try {
      const row = await createShare(userId, {
        classId: activeClass.id,
        studentId: currentStudent.id,
        scopes: shareScopes,
        days: shareDays,
      });
      setShares([row]);
    } catch (err: any) {
      setShareError(err?.message || 'Gagal membuat tautan.');
    } finally {
      setShareBusy(false);
    }
  };

  const handleRevokeShare = async () => {
    if (!activeShare) return;
    if (!window.confirm('Cabut tautan ini? Wali murid tidak akan bisa membukanya lagi.')) return;
    setShareBusy(true);
    setShareError('');
    try {
      await revokeShare(activeShare.id);
      setShares([]);
    } catch (err: any) {
      setShareError(err?.message || 'Gagal mencabut tautan.');
    } finally {
      setShareBusy(false);
    }
  };

  const handleSendWhatsApp = () => {
    if (!shareUrl || !currentStudent) return;
    const number = (currentStudent.kontakOrtu || '').replace(/\D/g, '').replace(/^0/, '62');
    const text =
      `Assalamu'alaikum Bapak/Ibu wali dari ${currentStudent.nama}. ` +
      `Berikut tautan pribadi untuk memantau data ananda di ${schoolName || 'sekolah'}:\n${shareUrl}\n\n` +
      'Tautan ini bersifat pribadi, mohon tidak dibagikan kepada pihak lain.';
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-[8px_8px_0px_#1e293b] border-3 border-slate-900 overflow-hidden">
        {/* Header - Vintage Postmodern Neobrutalist */}
        <div className="p-4 sm:p-5 bg-[#faf7ee] border-b-2 border-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center justify-center shrink-0 p-1 overflow-hidden">
              <img
                src={APP_LOGO_URL}
                alt="Logo Hadir!"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  Portal Publik Hadir!
                </h3>
                <span className="text-[10px] bg-[#dcfce7] border border-slate-900 text-emerald-950 px-2 py-0.2 rounded-full font-mono font-bold shadow-[1px_1px_0px_#1e293b]">
                  READ-ONLY
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                Satu tautan resmi & QR Code terverifikasi • Tanpa akses ubah data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#fee2e2] border border-slate-900 text-rose-950 hover:bg-[#fca5a5] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Module Switcher Bar (Only the requested data displays) */}
        <div className="bg-[#fffdf8] px-3 sm:px-4 py-2 border-b-2 border-slate-900 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setActivePortalType('absen')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 border-slate-900 ${
                activePortalType === 'absen'
                  ? 'bg-[#dcfce7] text-slate-950 shadow-[2px_2px_0px_#1e293b]'
                  : 'bg-white hover:bg-[#faf7ee] text-slate-700'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 inline mr-1 text-emerald-800" />
              Data Absen
            </button>
            <button
              onClick={() => setActivePortalType('tabungan')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 border-slate-900 ${
                activePortalType === 'tabungan'
                  ? 'bg-[#e0f2fe] text-slate-950 shadow-[2px_2px_0px_#1e293b]'
                  : 'bg-white hover:bg-[#faf7ee] text-slate-700'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 inline mr-1 text-sky-800" />
              Data Tabungan
            </button>
            <button
              onClick={() => setActivePortalType('nilai')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 border-slate-900 ${
                activePortalType === 'nilai'
                  ? 'bg-[#fef9c3] text-slate-950 shadow-[2px_2px_0px_#1e293b]'
                  : 'bg-white hover:bg-[#faf7ee] text-slate-700'
              }`}
            >
              <Flame className="w-3.5 h-3.5 inline mr-1 text-amber-800" />
              Data Nilai Rapor
            </button>
            <button
              onClick={() => setActivePortalType('rekap')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 border-slate-900 ${
                activePortalType === 'rekap'
                  ? 'bg-[#ede9fe] text-slate-950 shadow-[2px_2px_0px_#1e293b]'
                  : 'bg-white hover:bg-[#faf7ee] text-slate-700'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 inline mr-1 text-indigo-800" />
              Rekap Kelas
            </button>
          </div>

          <button
            onClick={() => setShowQrExpanded(!showQrExpanded)}
            className="px-2.5 py-1.5 rounded-xl bg-[#ffedd5] hover:bg-[#fed7aa] border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#1e293b] text-xs font-black text-orange-950 flex items-center gap-1 shrink-0 cursor-pointer"
            title="Tampilkan QR Code"
          >
            <QrCode className="w-3.5 h-3.5 text-orange-900" />
            <span className="hidden sm:inline">QR Code</span>
          </button>
        </div>

        {/* Link & QR Code Strip */}
        <div className="bg-[#faf7ee] px-4 py-2.5 border-b-2 border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="truncate flex items-center gap-1.5 font-bold text-slate-800 min-w-0">
            <span className="text-slate-500 shrink-0">Tautan:</span>
            <code className="bg-white px-2 py-0.5 rounded-lg border border-slate-900 font-mono text-[11px] truncate">
              {shareUrl || 'Belum ada tautan aktif'}
            </code>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenFullPublicPortal && (
              <button
                onClick={onOpenFullPublicPortal}
                className="px-3 py-1.5 rounded-xl bg-[#e0f2fe] hover:bg-[#bae6fd] text-sky-950 font-black text-xs flex items-center gap-1 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#1e293b] cursor-pointer"
                title="Buka Pratinjau Publik Layar Penuh (Read-Only)"
              >
                <ExternalLink className="w-3.5 h-3.5 text-sky-800" />
                <span>Buka Layar Penuh</span>
              </button>
            )}

            <button
              onClick={handleCopyLink}
              disabled={!shareUrl}
              className="disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded-xl bg-[#dcfce7] hover:bg-[#bbf7d0] text-emerald-950 font-black text-xs flex items-center gap-1 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#1e293b] cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-800" /> : <Copy className="w-3.5 h-3.5 text-emerald-800" />}
              <span>{copiedLink ? 'Tersalin!' : 'Salin Tautan'}</span>
            </button>
          </div>
        </div>

        {/* Pengaturan Tautan Aman: token acak, isi dipilih guru, ada masa berlaku, bisa dicabut */}
        <div className="px-4 py-3 border-b-2 border-slate-900 bg-[#fffdf8] text-xs space-y-2.5">
          <div className="flex items-center gap-1.5 font-black text-slate-900">
            <ShieldCheck className="w-4 h-4 text-emerald-800" />
            <span>Tautan Pribadi Wali Murid</span>
          </div>

          {!canShare ? (
            <p className="font-medium text-slate-600 leading-relaxed">
              Tautan publik hanya tersedia setelah login ke Supabase (bukan mode demo). Pratinjau di bawah tetap bisa dilihat.
            </p>
          ) : activePortalType === 'rekap' ? (
            <p className="font-medium text-slate-600 leading-relaxed">
              Rekap kelas memuat data semua murid, jadi tidak dibagikan lewat tautan publik. Pilih tab Absen, Tabungan, atau Nilai untuk membuat tautan per murid.
            </p>
          ) : (
            <>
              <p className="font-bold text-slate-700">
                {currentStudent?.nama}:{' '}
                {sharesLoading
                  ? 'memeriksa tautan...'
                  : activeShare
                  ? `tautan aktif sampai ${new Date(activeShare.expiresAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })} (isi: ${activeShare.scopes.map((sc) => SHARE_SCOPE_LABEL[sc]).join(', ')})`
                  : 'belum ada tautan aktif'}
              </p>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-bold text-slate-500">Isi:</span>
                {(['absen', 'nilai', 'tabungan'] as ShareScope[]).map((sc) => (
                  <label
                    key={sc}
                    className={`cursor-pointer px-2.5 py-1 rounded-xl border-2 border-slate-900 font-black ${
                      shareScopes.includes(sc)
                        ? 'bg-[#dcfce7] text-slate-950 shadow-[1.5px_1.5px_0px_#1e293b]'
                        : 'bg-white text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={shareScopes.includes(sc)}
                      onChange={() => toggleShareScope(sc)}
                    />
                    {SHARE_SCOPE_LABEL[sc]}
                  </label>
                ))}
                <select
                  value={shareDays}
                  onChange={(e) => setShareDays(Number(e.target.value))}
                  className="px-2 py-1 rounded-xl border-2 border-slate-900 bg-white font-bold text-slate-900"
                  aria-label="Masa berlaku tautan"
                >
                  <option value={7}>7 hari</option>
                  <option value={30}>30 hari</option>
                  <option value={90}>90 hari</option>
                  <option value={180}>180 hari</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCreateShare}
                  disabled={shareBusy || sharesLoading || !currentStudent}
                  className="disabled:opacity-50 px-3 py-1.5 rounded-xl bg-[#a7f3d0] hover:bg-[#6ee7b7] border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#1e293b] font-black text-slate-950 cursor-pointer"
                >
                  {shareBusy ? 'Memproses...' : activeShare ? 'Buat Ulang (ganti tautan)' : 'Buat Tautan Aman'}
                </button>
                {activeShare && (
                  <>
                    <button
                      onClick={handleSendWhatsApp}
                      className="px-3 py-1.5 rounded-xl bg-[#dcfce7] hover:bg-[#bbf7d0] border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#1e293b] font-black text-emerald-950 flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim WhatsApp</span>
                    </button>
                    <button
                      onClick={handleRevokeShare}
                      disabled={shareBusy}
                      className="disabled:opacity-50 px-3 py-1.5 rounded-xl bg-[#fee2e2] hover:bg-[#fca5a5] border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#1e293b] font-black text-rose-950 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cabut</span>
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {shareError && <p className="font-bold text-rose-700 leading-relaxed">{shareError}</p>}
        </div>

        {/* QR Code Collapsible Display */}
        {showQrExpanded && (
          <div className="p-4 bg-[#fffdf8] border-b-2 border-slate-900 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in duration-200">
            <div className="p-2 bg-white rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] shrink-0">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code Link Publik" className="w-36 h-36 rounded-xl" />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center text-xs text-slate-400">
                  {shareUrl ? 'Memuat QR...' : 'Buat tautan dulu'}
                </div>
              )}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fef9c3] border border-slate-900 text-[10px] font-mono font-bold text-slate-900 mb-1.5">
                <span>🔥</span>
                <span>SCAN UNTUK AKSES WALI MURID</span>
              </div>
              <h4 className="text-sm font-black text-slate-900">
                Pindai dengan Kamera Ponsel
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Arahkan kamera smartphone untuk membuka data <strong>{currentStudent?.nama}</strong>. Tautan bersifat pribadi dan hanya baca.
              </p>
            </div>
          </div>
        )}

        {/* Student Selector (Only for student-specific views) */}
        {activePortalType !== 'rekap' && (
          <div className="p-3.5 border-b-2 border-slate-100 bg-[#fffdf8]">
            <label className="block text-xs font-black text-slate-800 mb-1">
              Pilih Profil Murid untuk Simulasi Pratinjau Wali:
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-white text-xs font-bold text-slate-900 focus:outline-none"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.noUrut}. {s.nama} ({s.nisn})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Public View Body - Read Only Displays */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-white">
          {/* Student Profile Card Header */}
          {activePortalType !== 'rekap' && currentStudent && (
            <div className="bg-[#faf7ee] border-2 border-slate-900 rounded-2xl p-3.5 shadow-[2.5px_2.5px_0px_#1e293b] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold bg-[#ede9fe] border border-slate-900 px-2 py-0.2 rounded-md text-indigo-950">
                  {activeClass.nama}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  {currentStudent.nama}
                </h3>
                <p className="text-xs font-mono font-bold text-slate-500">
                  NISN: {currentStudent.nisn} • Wali Kelas: {teacher.name}
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center text-sm shrink-0">
                {currentStudent.nama.charAt(0)}
              </div>
            </div>
          )}

          {/* VIEW 1: DATA ABSEN SAJA */}
          {activePortalType === 'absen' && (
            <div className="space-y-3">
              <div className="p-4 rounded-3xl bg-[#dcfce7] border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                    Persentase Kehadiran
                  </span>
                  <span className="text-xs font-bold font-mono bg-white border border-slate-900 px-2 py-0.5 rounded-full">
                    {studentRecords.length} Sesi Pertemuan
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-slate-950 font-mono mt-1">
                  {attPercent}%
                </div>
                <p className="text-xs font-bold text-emerald-900 mt-1">
                  {hadirCount} Hadir • {sakitCount} Sakit • {izinCount} Izin • {alpaCount} Alpa • {dispenCount} Dispen
                </p>
              </div>

              {/* Attendance Log Table */}
              <div className="bg-[#faf7ee] border-2 border-slate-900 rounded-2xl p-3 shadow-[2px_2px_0px_#1e293b]">
                <h4 className="text-xs font-black text-slate-900 mb-2">
                  Riwayat Kehadiran Terbaru
                </h4>
                {studentRecords.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Belum ada catatan presensi untuk sesi ini.</p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {studentRecords.slice(0, 8).map((rec) => (
                      <div
                        key={rec.id}
                        className="p-2 bg-white rounded-xl border border-slate-900 text-xs flex items-center justify-between font-bold"
                      >
                        <span className="text-slate-700">Pertemuan: {rec.sessionId}</span>
                        <span
                          className={`px-2 py-0.2 rounded-full border text-[10px] font-black ${
                            rec.status === 'H'
                              ? 'bg-[#dcfce7] text-emerald-950 border-slate-900'
                              : rec.status === 'S'
                              ? 'bg-[#fef9c3] text-amber-950 border-slate-900'
                              : 'bg-[#fee2e2] text-rose-950 border-slate-900'
                          }`}
                        >
                          Status: {rec.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW 2: DATA TABUNGAN SAJA */}
          {activePortalType === 'tabungan' && (
            <div className="space-y-3">
              <div className="p-4 rounded-3xl bg-[#e0f2fe] border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b]">
                <span className="text-xs font-black text-sky-950 uppercase tracking-wider">
                  Total Saldo Tabungan Murid
                </span>
                <div className="text-3xl sm:text-4xl font-black text-slate-950 font-mono mt-1">
                  Rp {totalTabungan.toLocaleString('id-ID')}
                </div>
                <p className="text-xs font-bold text-sky-900 mt-1">
                  Tersimpan di pembukuan kas kelas {activeClass.nama}
                </p>
              </div>

              {/* Transactions Log */}
              <div className="bg-[#faf7ee] border-2 border-slate-900 rounded-2xl p-3 shadow-[2px_2px_0px_#1e293b]">
                <h4 className="text-xs font-black text-slate-900 mb-2">
                  Riwayat Mutasi Tabungan
                </h4>
                {studentTransactions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Belum ada mutasi tabungan tercatat.</p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {studentTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="p-2 bg-white rounded-xl border border-slate-900 text-xs flex items-center justify-between"
                      >
                        <div>
                          <p className="font-black text-slate-900">{tx.keterangan}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{tx.tanggal}</p>
                        </div>
                        <span
                          className={`font-mono font-black ${
                            tx.tipe === 'Pemasukan' ? 'text-emerald-700' : 'text-rose-700'
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

          {/* VIEW 3: DATA NILAI & RAPOR SAJA */}
          {activePortalType === 'nilai' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#fef9c3] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b]">
                  <span className="text-[10px] font-mono font-black text-amber-950 uppercase tracking-wider">
                    Nilai Akhir
                  </span>
                  <div className="text-3xl font-black text-slate-950 font-mono mt-1">
                    {finalScore}
                  </div>
                  <span className="text-[10px] font-bold text-amber-900">
                    KKM: {activeClass.kkm} ({finalScore >= activeClass.kkm ? 'Tuntas' : 'Perlu Bimbingan'})
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#ede9fe] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b]">
                  <span className="text-[10px] font-mono font-black text-indigo-950 uppercase tracking-wider">
                    Asesmen STS & SAS
                  </span>
                  <div className="text-xl font-black text-slate-950 font-mono mt-1">
                    STS: {sts} | SAS: {sas}
                  </div>
                  <span className="text-[10px] font-bold text-indigo-900">
                    Rata Formatif: {formatifAvg.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#faf7ee] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b]">
                <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Catatan Capaian Kompetensi Kurikulum Merdeka:
                </span>
                <p className="text-xs text-slate-800 italic leading-relaxed font-medium">
                  "{gradeObj?.deskripsi || 'Siswa telah menunjukkan ketercapaian kompetensi pembelajaran yang baik pada semester ini.'}"
                </p>
              </div>
            </div>
          )}

          {/* VIEW 4: REKAP KELAS SAJA */}
          {activePortalType === 'rekap' && (
            <div className="space-y-3">
              <div className="p-4 rounded-3xl bg-[#ccfbf1] border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b]">
                <span className="text-xs font-black text-teal-950 uppercase tracking-wider">
                  Ringkasan Presensi Rombel {activeClass.nama}
                </span>
                <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono mt-1">
                  {students.length} Siswa Terdaftar
                </div>
                <p className="text-xs font-bold text-teal-900 mt-1">
                  Data kehadiran dan keaktifan murid Kurikulum Merdeka terverifikasi
                </p>
              </div>

              <div className="bg-[#faf7ee] border-2 border-slate-900 rounded-2xl p-3 shadow-[2px_2px_0px_#1e293b]">
                <h4 className="text-xs font-black text-slate-900 mb-2">
                  Daftar Murid Kelas Ini
                </h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {students.map((std) => (
                    <div
                      key={std.id}
                      className="p-2 bg-white rounded-xl border border-slate-900 text-xs flex items-center justify-between font-bold"
                    >
                      <span className="text-slate-900">{std.noUrut}. {std.nama}</span>
                      <span className="text-slate-500 font-mono text-[11px]">{std.nisn}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#faf7ee] border-t-2 border-slate-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Koneksi Aman Supabase PostgreSQL (RLS Protected)</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] font-black text-slate-900 cursor-pointer"
          >
            Tutup Portal
          </button>
        </div>
      </div>
    </div>
  );
};
