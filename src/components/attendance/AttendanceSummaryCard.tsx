import React from 'react';
import { CheckCircle2, Copy, Edit2 } from 'lucide-react';
import { AttendanceSession, Student } from '../../types';
import { AttendanceMetrics } from './attendanceMetrics';

interface AttendanceSummaryCardsProps {
  activeSession: AttendanceSession;
  classStudents: Student[];
  metrics: AttendanceMetrics;
  copyFeedback: boolean;
  onEditSession: () => void;
  onCopyReport: () => void;
  onSetAllHadir: () => void;
}

/** Banner sesi aktif + distribusi kehadiran. */
export const AttendanceSummaryCards: React.FC<AttendanceSummaryCardsProps> = ({
  activeSession,
  classStudents,
  metrics,
  copyFeedback,
  onEditSession,
  onCopyReport,
  onSetAllHadir,
}) => (
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
          onClick={onSetAllHadir}
          className="flex-1 py-2 px-3 rounded-2xl bg-[#6ee7b7] hover:bg-[#34d399] active:translate-x-[1px] active:translate-y-[1px] text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition-all border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] cursor-pointer"
          title="Setel semua siswa menjadi Hadir (100%)"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Set Semua Hadir</span>
        </button>
        <button
          onClick={onEditSession}
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
          onClick={onCopyReport}
          className="text-[11px] font-bold text-slate-700 hover:text-slate-950 flex items-center gap-1 cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>{copyFeedback ? 'Tersalin!' : 'Salin Teks WA'}</span>
        </button>
      </div>
    </div>
  </div>
);
