import React, { useState } from 'react';
import { Calendar, Check, CheckCircle2, ChevronDown, Edit2 } from 'lucide-react';
import { AttendanceSession } from '../../types';

interface SessionSelectorProps {
  classSessions: AttendanceSession[];
  activeSession: AttendanceSession;
  onSelectSession: (session: AttendanceSession) => void;
  onEditSession: () => void;
}

/** Dropdown pertemuan + timeline pil + banner materi. State dropdown bersifat lokal. */
export const SessionSelector: React.FC<SessionSelectorProps> = ({
  classSessions,
  activeSession,
  onSelectSession,
  onEditSession,
}) => {
  const [sessionDropdownOpen, setSessionDropdownOpen] = useState(false);

  return (
    <>
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
              onClick={onEditSession}
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
    </>
  );
};
