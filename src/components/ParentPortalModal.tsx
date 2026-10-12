import React, { useState } from 'react';
import {
  Share2,
  CheckCircle2,
  Search,
  Award,
  Calendar,
  X,
  ShieldCheck,
  Wallet,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { Student, AttendanceRecord, GradeRecord, ClassRoom, TeacherProfile } from '../types';

interface ParentPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeClass: ClassRoom;
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  grades: GradeRecord[];
  teacher: TeacherProfile;
  schoolName: string;
}

export const ParentPortalModal: React.FC<ParentPortalModalProps> = ({
  isOpen,
  onClose,
  activeClass,
  students,
  attendanceRecords,
  grades,
  teacher,
  schoolName,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Compute attendance stats
  const studentRecords = attendanceRecords.filter((r) => r.studentId === currentStudent?.id);
  let h = 0;
  let s = 0;
  let i = 0;
  let a = 0;
  studentRecords.forEach((r) => {
    if (r.status === 'H') h++;
    else if (r.status === 'S') s++;
    else if (r.status === 'I') i++;
    else if (r.status === 'A') a++;
  });
  const totalAtt = studentRecords.length || 1;
  const attRate = Math.round((h / totalAtt) * 100);

  // Compute student grade
  const gradeObj = grades.find((g) => g.studentId === currentStudent?.id);
  const validFormatif = (gradeObj?.formatif || []).filter((v): v is number => v !== null && !isNaN(v));
  const formatifAvg = validFormatif.length > 0
    ? validFormatif.reduce((a, b) => a + b, 0) / validFormatif.length
    : 0;
  const sts = gradeObj?.sts ?? formatifAvg;
  const sas = gradeObj?.sas ?? formatifAvg;
  const finalScore = Math.round((formatifAvg * 0.5) + (sts * 0.25) + (sas * 0.25));

  const handleCopyLink = () => {
    const url = window.location.origin + `?portal=wali&class=${activeClass.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-[8px_8px_0px_#1e293b] border-3 border-slate-900 overflow-hidden">
        {/* Header - Vintage Postmodern Neobrutalist */}
        <div className="p-4 sm:p-5 bg-[#faf7ee] border-b-2 border-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ede9fe] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center justify-center text-indigo-950 shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Portal Publik Transparansi Wali Murid
                </h3>
                <span className="text-[10px] bg-[#dcfce7] border border-slate-900 text-emerald-950 px-2 py-0.2 rounded-full font-mono font-bold shadow-[1px_1px_0px_#1e293b]">
                  AKSES PUBLIK
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                Pratinjau tampilan yang dilihat orang tua murid melalui tautan publik
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

        {/* Link Copy Strip */}
        <div className="bg-[#fffdf8] px-4 py-2.5 border-b-2 border-slate-900 flex items-center justify-between gap-3 text-xs">
          <span className="text-slate-800 truncate font-bold">
            Tautan Aktif: <code className="bg-[#faf7ee] px-2 py-0.5 rounded-xl border border-slate-900 font-mono text-[11px] font-bold">{window.location.origin}/portal-wali/{activeClass.id}</code>
          </span>
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl bg-[#dcfce7] hover:bg-[#bbf7d0] text-emerald-950 font-black text-[11px] shrink-0 flex items-center gap-1 border border-slate-900 shadow-[1.5px_1.5px_0px_#1e293b] cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Tersalin!' : 'Salin Tautan'}</span>
          </button>
        </div>

        {/* Student Selector */}
        <div className="p-4 border-b-2 border-slate-100 bg-[#faf7ee]">
          <label className="block text-xs font-black text-slate-800 mb-1.5">
            Pilih Profil Siswa untuk Simulasi Tampilan Wali:
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

        {/* Public View Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-white">
          {/* Student Profile Card - Pastel Mint & Ivory */}
          <div className="bg-[#dcfce7] border-2 border-slate-900 rounded-3xl p-4 sm:p-5 shadow-[3px_3px_0px_#1e293b]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-900 font-mono font-bold uppercase tracking-wider bg-white border border-slate-900 px-2 py-0.2 rounded-md">
                  KARTU SISWA DIGITAL • {activeClass.nama}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1.5">
                  {currentStudent?.nama}
                </h2>
                <p className="text-xs text-emerald-950 font-mono font-bold">
                  NISN: {currentStudent?.nisn} • Wali Kelas: {teacher.name}
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center justify-center text-xl font-black text-slate-900">
                {currentStudent?.nama.charAt(0)}
              </div>
            </div>
          </div>

          {/* 2 Cards: Attendance & Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Presensi */}
            <div className="p-4 rounded-3xl bg-[#e0f2fe] border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b]">
              <div className="flex items-center gap-2 text-sky-950 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-black">Kehadiran Siswa</span>
              </div>
              <div className="text-3xl font-black text-slate-950 font-mono mt-1">
                {attRate}%
              </div>
              <p className="text-[11px] font-bold text-sky-900 mt-1">
                {h} Hadir • {s} Sakit • {i} Izin • {a} Alpa
              </p>
            </div>

            {/* Nilai Akhir */}
            <div className="p-4 rounded-3xl bg-[#fef9c3] border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b]">
              <div className="flex items-center gap-2 text-amber-950 mb-1">
                <Award className="w-4 h-4" />
                <span className="text-xs font-black">Capaian Nilai Akhir</span>
              </div>
              <div className="text-3xl font-black text-slate-950 font-mono mt-1">
                {finalScore}
              </div>
              <p className="text-[11px] font-bold text-amber-900 mt-1">
                Standar KKM: {activeClass.kkm} ({finalScore >= activeClass.kkm ? 'Tuntas' : 'Perlu Bimbingan'})
              </p>
            </div>
          </div>

          {/* Competency narrative */}
          <div className="p-4 rounded-3xl bg-[#faf7ee] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b]">
            <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-wider block mb-1">
              CATATAN CAPAIAN KOMPETENSI (RAPOR MERDEKA):
            </span>
            <p className="text-xs text-slate-800 leading-relaxed font-medium italic">
              "{gradeObj?.deskripsi || 'Siswa menunjukkan partisipasi dan ketuntasan capaian pembelajaran yang baik pada semester ini.'}"
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#faf7ee] border-t-2 border-slate-900 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">
            Terproteksi Row Level Security PostgreSQL
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] font-black text-slate-900 cursor-pointer"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  );
};
