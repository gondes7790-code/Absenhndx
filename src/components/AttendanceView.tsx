import React, { useMemo, useState } from 'react';
import { Calendar, GraduationCap, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Student,
  AttendanceSession,
  AttendanceRecord,
  AttendanceStatus,
  ClassRoom,
  NewSessionInput,
  TeacherProfile,
  PrintConfig,
} from '../types';
import { PrintableDocument } from './PrintableDocument';
import { AttendanceHeaderCard } from './attendance/AttendanceHeaderCard';
import { SessionSelector } from './attendance/SessionSelector';
import { AttendanceSummaryCards } from './attendance/AttendanceSummaryCards';
import { StudentAttendanceTable, SortMode } from './attendance/StudentAttendanceTable';
import { CreateSessionModal } from './attendance/CreateSessionModal';
import { EditSessionModal } from './attendance/EditSessionModal';
import { computeAttendanceMetrics } from './attendance/attendanceMetrics';
import { buildWhatsAppReport, exportAttendanceCsv } from './attendance/attendanceReports';

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
  onCreateNewSession: (customData?: NewSessionInput) => void;
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
  const [sortMode, setSortMode] = useState<SortMode>('no');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
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

  const nextSessionNumber = useMemo(
    () => classSessions.reduce((max, s) => Math.max(max, s.pertemuanKe), 0) + 1,
    [classSessions]
  );

  // Map of studentId -> AttendanceRecord (sesi aktif)
  const recordsMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    if (activeSession) {
      attendanceRecords
        .filter((r) => r.sessionId === activeSession.id)
        .forEach((r) => map.set(r.studentId, r));
    }
    return map;
  }, [attendanceRecords, activeSession]);

  const metrics = useMemo(
    () => computeAttendanceMetrics(classStudents, recordsMap),
    [classStudents, recordsMap]
  );

  // Filter & sort students
  const filteredStudents = useMemo(() => {
    let list = [...classStudents];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => s.nama.toLowerCase().includes(q) || s.nisn.includes(q));
    }
    if (sortMode === 'az') list.sort((a, b) => a.nama.localeCompare(b.nama));
    else if (sortMode === 'za') list.sort((a, b) => b.nama.localeCompare(a.nama));
    else list.sort((a, b) => a.noUrut - b.noUrut);
    return list;
  }, [classStudents, searchQuery, sortMode]);

  const handleCopyReport = () => {
    const text = buildWhatsAppReport({
      schoolName,
      activeClass,
      activeSession,
      classStudents,
      recordsMap,
      metrics,
    });
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  const handleExportCSV = () =>
    exportAttendanceCsv(filteredStudents, recordsMap, activeClass?.nama, activeSession?.pertemuanKe);

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
  const createSessionModal =
    isCreateModalOpen && activeClass ? (
      <CreateSessionModal
        activeClass={activeClass}
        nextSessionNumber={nextSessionNumber}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={onCreateNewSession}
      />
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
          onClick={() => setIsCreateModalOpen(true)}
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
      <AttendanceHeaderCard
        activeClass={activeClass}
        schoolName={schoolName}
        onSaveToCloud={onSaveToCloud}
        onOpenParentLink={onOpenParentLink}
        onCreateSession={() => setIsCreateModalOpen(true)}
        onExportCsv={handleExportCSV}
        onPrint={() => setShowPrintModal(true)}
      >
        <SessionSelector
          classSessions={classSessions}
          activeSession={activeSession}
          onSelectSession={onSelectSession}
          onEditSession={() => setIsEditSessionModalOpen(true)}
        />
      </AttendanceHeaderCard>

      <AttendanceSummaryCards
        activeSession={activeSession}
        classStudents={classStudents}
        metrics={metrics}
        copyFeedback={copyFeedback}
        onEditSession={() => setIsEditSessionModalOpen(true)}
        onCopyReport={handleCopyReport}
        onSetAllHadir={handleTriggerConfetti}
      />

      <StudentAttendanceTable
        filteredStudents={filteredStudents}
        recordsMap={recordsMap}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortMode={sortMode}
        onSortChange={setSortMode}
        onSetAllHadir={handleTriggerConfetti}
        onUpdateRecord={onUpdateRecord}
        onOpenWhatsAppModal={onOpenWhatsAppModal}
        onDeleteStudent={onDeleteStudent}
      />

      {createSessionModal}

      {isEditSessionModalOpen && onUpdateSession && (
        <EditSessionModal
          session={activeSession}
          onClose={() => setIsEditSessionModalOpen(false)}
          onSubmit={onUpdateSession}
          onDeleteSession={onDeleteSession}
        />
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
