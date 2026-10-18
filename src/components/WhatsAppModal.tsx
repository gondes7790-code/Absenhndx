import React, { useState } from 'react';
import {
  MessageCircle,
  Copy,
  ExternalLink,
  Check,
  Send,
  User,
  X,
  Users,
} from 'lucide-react';
import { Student, AttendanceSession, AttendanceRecord, ClassRoom, TeacherProfile } from '../types';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeClass?: ClassRoom | null;
  activeSession?: AttendanceSession | null;
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  targetStudent?: Student;
  teacher: TeacherProfile;
  schoolName: string;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  activeClass,
  activeSession,
  students,
  attendanceRecords,
  targetStudent,
  teacher,
  schoolName,
}) => {
  const [activeTab, setActiveTab] = useState<'group' | 'japri'>(targetStudent ? 'japri' : 'group');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(targetStudent?.id || students[0]?.id || '');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !activeClass || !activeSession) return null;

  const recordsMap = new Map<string, AttendanceRecord>();
  attendanceRecords
    .filter((r) => r.sessionId === activeSession.id)
    .forEach((r) => recordsMap.set(r.studentId, r));

  // Build group message
  const generateGroupMessage = () => {
    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpa = 0;
    let dispen = 0;
    const absentees: string[] = [];

    students.forEach((s) => {
      const rec = recordsMap.get(s.id);
      const st = rec?.status || 'H';
      if (st === 'H') hadir++;
      else if (st === 'S') {
        sakit++;
        absentees.push(`• ${s.nama}: [Sakit]${rec?.keterangan ? ` (${rec.keterangan})` : ''}`);
      } else if (st === 'I') {
        izin++;
        absentees.push(`• ${s.nama}: [Izin]${rec?.keterangan ? ` (${rec.keterangan})` : ''}`);
      } else if (st === 'A') {
        alpa++;
        absentees.push(`• ${s.nama}: [Alpa/Tanpa Keterangan]`);
      } else if (st === 'D') {
        dispen++;
        absentees.push(`• ${s.nama}: [Dispensasi]${rec?.keterangan ? ` (${rec.keterangan})` : ''}`);
      }
    });

    const total = students.length || 1;
    const pct = Math.round((hadir / total) * 100);

    return `*LAPORAN PRESENSI KELAS ${activeClass.nama}*
🏫 *${schoolName}*
📅 Tanggal: ${new Date(activeSession.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
⏰ Pertemuan: Ke-${activeSession.pertemuanKe} (${activeSession.mapel})
━━━━━━━━━━━━━━━━━━
📊 *Ringkasan Kehadiran:*
• Total Siswa: ${students.length}
• Hadir (H): ${hadir} (${pct}%)
• Sakit (S): ${sakit}
• Izin (I): ${izin}
• Alpa (A): ${alpa}
• Dispen (D): ${dispen}

${absentees.length > 0 ? `*Daftar Siswa Tidak Hadir:*\n${absentees.join('\n')}` : '✅ *Alhamdulillah seluruh siswa hadir 100% hari ini.*'}

━━━━━━━━━━━━━━━━━━
_Laporan otomatis via Sistem Informasi Kurikulum Merdeka @hndx07 (Cloud Supabase)._
Salam hangat,
*${teacher.name}* (Pendidik)`;
  };

  // Build personal parent message
  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const currentRecord = currentStudent ? recordsMap.get(currentStudent.id) : undefined;
  const currentStatus = currentRecord?.status || 'H';

  const generateJapriMessage = () => {
    if (!currentStudent) return '';

    let statusText = 'Hadir';
    let detailAdvice = 'mengikuti pembelajaran di kelas dengan baik dan tepat waktu.';
    if (currentStatus === 'S') {
      statusText = 'Sakit';
      detailAdvice = `tercatat Sakit${currentRecord?.keterangan ? ` (${currentRecord.keterangan})` : ''}. Semoga lekas sembuh dan dapat beraktivitas kembali.`;
    } else if (currentStatus === 'I') {
      statusText = 'Izin';
      detailAdvice = `tercatat Izin${currentRecord?.keterangan ? ` (${currentRecord.keterangan})` : ''}.`;
    } else if (currentStatus === 'A') {
      statusText = 'Alpa (Tanpa Keterangan)';
      detailAdvice = 'tercatat BELUM HADIR di sekolah tanpa keterangan resmi. Mohon konfirmasi dari Bapak/Ibu terkait keberadaan ananda hari ini.';
    } else if (currentStatus === 'D') {
      statusText = 'Dispensasi';
      detailAdvice = 'tercatat mengikuti tugas dispensasi mewakili sekolah.';
    }

    return `Assalamu’alaikum Wr. Wb.
Yth. Bapak/Ibu Orang Tua / Wali dari ananda *${currentStudent.nama}*,

Kami dari ${schoolName} ingin menginformasikan rekap kehadiran ananda pada hari ini:

• *Tanggal:* ${new Date(activeSession.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
• *Kelas:* ${activeClass.nama}
• *Mata Pelajaran:* ${activeSession.mapel}
• *Status Kehadiran:* *[${statusText}]*
• *Keterangan:* Ananda ${detailAdvice}

Terima kasih atas perhatian dan kerja sama Bapak/Ibu dalam mendampingi putra-putri kita.

Wassalamu’alaikum Wr. Wb.
*${teacher.name}*
${schoolName}`;
  };

  const currentMessage = activeTab === 'group' ? generateGroupMessage() : generateJapriMessage();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWA = () => {
    const phone = activeTab === 'japri' && currentStudent?.kontakOrtu ? currentStudent.kontakOrtu : '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(currentMessage)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(currentMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-[8px_8px_0px_#1e293b] border-3 border-slate-900 overflow-hidden">
        {/* Header - Vintage Postmodern Neobrutalist */}
        <div className="p-4 sm:p-5 bg-[#faf7ee] border-b-2 border-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#dcfce7] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center justify-center text-emerald-950 shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Notifikasi WhatsApp Orang Tua
                </h3>
                <span className="text-[10px] bg-[#dcfce7] border border-slate-900 text-emerald-950 px-2 py-0.2 rounded-full font-mono font-bold shadow-[1px_1px_0px_#1e293b]">
                  AUTO-TEXT
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                Format teks otomatis sesuai tata krama kesopanan Indonesia
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

        {/* Tab switch */}
        <div className="bg-[#fffdf8] px-4 pt-2.5 flex items-center justify-between border-b-2 border-slate-900">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('group')}
              className={`px-3 py-2 text-xs font-black rounded-t-xl transition-all cursor-pointer border-t-2 border-x-2 border-slate-900 ${
                activeTab === 'group'
                  ? 'bg-white text-slate-900 shadow-[2px_-2px_0px_#1e293b]'
                  : 'bg-[#faf7ee] text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 inline mr-1 text-emerald-800" />
              Laporan Grup Kelas
            </button>
            <button
              onClick={() => setActiveTab('japri')}
              className={`px-3 py-2 text-xs font-black rounded-t-xl transition-all cursor-pointer border-t-2 border-x-2 border-slate-900 ${
                activeTab === 'japri'
                  ? 'bg-white text-slate-900 shadow-[2px_-2px_0px_#1e293b]'
                  : 'bg-[#faf7ee] text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5 inline mr-1 text-indigo-800" />
              Pesan Japri Personal
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 mb-1.5 rounded-xl bg-white hover:bg-[#faf7ee] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-xs font-black text-slate-900 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-white">
          {activeTab === 'japri' && (
            <div className="bg-[#faf7ee] p-3.5 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b]">
              <label className="block text-xs font-black text-slate-900 mb-1">
                Pilih Murid Penerima Pesan:
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-white text-xs font-bold text-slate-900 focus:outline-none"
              >
                {students.map((s) => {
                  const rec = recordsMap.get(s.id);
                  const st = rec?.status || 'H';
                  return (
                    <option key={s.id} value={s.id}>
                      {s.noUrut}. {s.nama} [Status: {st}] {s.kontakOrtu ? `(${s.kontakOrtu})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Formatted Text Preview */}
          <div className="relative">
            <textarea
              readOnly
              rows={12}
              value={currentMessage}
              className="w-full p-4 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-mono text-slate-900 leading-relaxed resize-none focus:outline-none shadow-[2px_2px_0px_#1e293b]"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#faf7ee] border-t-2 border-slate-900 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-600 font-medium">
            Terkoneksi langsung ke API Deep Link WhatsApp Web & Mobile
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-xs font-bold text-slate-900 flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin</span>
            </button>
            <button
              onClick={handleSendWA}
              className="px-4 py-2 rounded-2xl bg-[#a7f3d0] hover:bg-[#6ee7b7] border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] text-xs font-black text-emerald-950 flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Buka di WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
