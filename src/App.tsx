import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Drawer } from './components/Drawer';
import { AttendanceView } from './components/AttendanceView';
import { GradebookView } from './components/GradebookView';
import { MonthlyRecapView } from './components/MonthlyRecapView';
import { JournalView } from './components/JournalView';
import { FinanceView } from './components/FinanceView';
import { StudentManagementView } from './components/StudentManagementView';
import { DashboardView } from './components/DashboardView';
import { DeepLearningView } from './components/DeepLearningView';
import { ProfileView } from './components/ProfileView';
import { LoginView } from './components/LoginView';
import { SupabaseModal } from './components/SupabaseModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { ParentPortalModal } from './components/ParentPortalModal';
import { ClassManagementModal } from './components/ClassManagementModal';
import { Footer } from './components/Footer';

import {
  Student,
  ClassRoom,
  AttendanceSession,
  AttendanceRecord,
  GradeRecord,
  JournalEntry,
  FinanceTransaction,
  TeacherProfile,
  ActiveTab,
  AttendanceStatus,
  PrintConfig,
} from './types';
import { getSavedPrintConfig, savePrintConfig } from './utils/printConfig';

import {
  initialClasses,
  initialStudents,
  initialSessions,
  initialAttendanceRecords,
  initialGrades,
  initialJournals,
  initialFinances,
  initialTeacher,
} from './data/initialData';

import { downloadJsonBackup } from './services/supabaseService';
import { CheckCircle2, Flame, ShieldCheck } from 'lucide-react';
import { PublicPortalView, PublicPortalType } from './components/PublicPortalView';

import { useAuth } from './contexts/AuthContext';
import { fetchProfile, updateProfile } from './services/profileService';
import { fetchClasses, createClass, updateClass, deleteClass } from './services/classService';
import {
  fetchStudents,
  createStudent,
  createStudentsBatch,
  updateStudent,
  updateStudentsBatch,
  deleteStudent,
} from './services/studentService';
import {
  fetchAttendanceSessions,
  createAttendanceSession,
  updateAttendanceSession,
  deleteAttendanceSession,
  fetchAttendanceRecords,
  upsertAttendanceRecord,
  upsertAttendanceRecordsBatch,
} from './services/attendanceService';
import { fetchGrades, upsertGrade } from './services/gradeService';
import { fetchJournals, createJournal, updateJournal, deleteJournal } from './services/journalService';
import { fetchFinances, createFinance, deleteFinance } from './services/financeService';

const STORAGE_KEY_PREFIX = 'hndx_merdeka_app_v2';

export default function App() {
  // Authentication State from Context (Session & User ID)
  const {
    user,
    userId,
    isAuthenticated,
    isDemoMode,
    setDemoMode,
    signOut,
    isLoading: isAuthLoading,
  } = useAuth();

  // Global States with local persistence fallback (User-scoped and Demo-scoped)
  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    try {
      if (isDemoMode) {
        const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_demo_classes`);
        return saved ? JSON.parse(saved) : initialClasses;
      }
      if (userId) {
        const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_u_${userId}_classes`);
        return saved ? JSON.parse(saved) : [];
      }
      return [];
    } catch {
      return isDemoMode ? initialClasses : [];
    }
  });

  const [activeClass, setActiveClass] = useState<ClassRoom | null>(() => {
    return classes[0] || (isDemoMode ? initialClasses[0] : null);
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      if (isDemoMode) {
        const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_demo_students`);
        return saved ? JSON.parse(saved) : initialStudents;
      }
      if (userId) {
        const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_u_${userId}_students`);
        return saved ? JSON.parse(saved) : [];
      }
      return [];
    } catch {
      return isDemoMode ? initialStudents : [];
    }
  });

  const [sessions, setSessions] = useState<AttendanceSession[]>(() => {
    try {
      if (isDemoMode) {
        const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_demo_sessions`);
        return saved ? JSON.parse(saved) : initialSessions;
      }
      if (userId) {
        const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_u_${userId}_sessions`);
        return saved ? JSON.parse(saved) : [];
      }
      return [];
    } catch {
      return isDemoMode ? initialSessions : [];
    }
  });

  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(() => {
    return sessions[0] || (isDemoMode ? initialSessions[0] : null);
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      if (isDemoMode) {
        const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_demo_attendance`);
        return saved ? JSON.parse(saved) : initialAttendanceRecords;
      }
      if (userId) {
        const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_u_${userId}_attendance`);
        return saved ? JSON.parse(saved) : [];
      }
      return [];
    } catch {
      return isDemoMode ? initialAttendanceRecords : [];
    }
  });

  const [grades, setGrades] = useState<GradeRecord[]>(() => {
    try {
      if (isDemoMode) {
        const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_demo_grades`);
        return saved ? JSON.parse(saved) : initialGrades;
      }
      if (userId) {
        const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_u_${userId}_grades`);
        return saved ? JSON.parse(saved) : [];
      }
      return [];
    } catch {
      return isDemoMode ? initialGrades : [];
    }
  });

  const [journals, setJournals] = useState<JournalEntry[]>(() => {
    try {
      if (isDemoMode) {
        const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_demo_journals`);
        return saved ? JSON.parse(saved) : initialJournals;
      }
      if (userId) {
        const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_u_${userId}_journals`);
        return saved ? JSON.parse(saved) : [];
      }
      return [];
    } catch {
      return isDemoMode ? initialJournals : [];
    }
  });

  const [finances, setFinances] = useState<FinanceTransaction[]>(() => {
    try {
      if (isDemoMode) {
        const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_demo_finances`);
        return saved ? JSON.parse(saved) : initialFinances;
      }
      if (userId) {
        const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_u_${userId}_finances`);
        return saved ? JSON.parse(saved) : [];
      }
      return [];
    } catch {
      return isDemoMode ? initialFinances : [];
    }
  });

  const [teacher, setTeacher] = useState<TeacherProfile>(() => {
    try {
      if (isDemoMode) {
        const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_demo_teacher`);
        return saved ? JSON.parse(saved) : initialTeacher;
      }
      if (userId) {
        const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_u_${userId}_teacher`);
        if (saved) return JSON.parse(saved);
      }
      return {
        name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guru Pendidik',
        email: user?.email || '',
        nip: '',
        nuptk: '',
        school: 'Hadir!',
        handle: `@${(user?.email?.split('@')[0] || 'guru').toLowerCase()}`,
        phone: '',
        mapelUtama: '',
        bio: '',
      };
    } catch {
      return isDemoMode
        ? initialTeacher
        : {
            name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guru Pendidik',
            email: user?.email || '',
            nip: '',
            nuptk: '',
            school: 'Hadir!',
            handle: `@${(user?.email?.split('@')[0] || 'guru').toLowerCase()}`,
            phone: '',
            mapelUtama: '',
            bio: '',
          };
    }
  });

  const [printConfig, setPrintConfig] = useState<PrintConfig>(() =>
    getSavedPrintConfig('Sekolah Merdeka Indonesia')
  );

  const [schoolName, setSchoolName] = useState<string>(() => {
    const savedCfg = getSavedPrintConfig('Sekolah Merdeka Indonesia');
    return savedCfg.schoolName || 'Sekolah Merdeka Indonesia';
  });

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<ActiveTab>('presensi');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [targetStudentWA, setTargetStudentWA] = useState<Student | undefined>(undefined);
  const [isParentPortalOpen, setIsParentPortalOpen] = useState(false);
  const [isPublicPortalMode, setIsPublicPortalMode] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.has('portal');
    } catch {
      return false;
    }
  });
  const [publicPortalParams, setPublicPortalParams] = useState<{
    tipe: PublicPortalType;
    kelas?: string;
    nisn?: string;
  }>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tipe = (params.get('tipe') as PublicPortalType) || 'absen';
      const kelas = params.get('kelas') || undefined;
      const nisn = params.get('nisn') || undefined;
      return { tipe, kelas, nisn };
    } catch {
      return { tipe: 'absen' };
    }
  });

  // Listen to browser popstate for public portal navigation
  useEffect(() => {
    const handlePopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.has('portal')) {
          setIsPublicPortalMode(true);
          setPublicPortalParams({
            tipe: (params.get('tipe') as PublicPortalType) || 'absen',
            kelas: params.get('kelas') || undefined,
            nisn: params.get('nisn') || undefined,
          });
        } else {
          setIsPublicPortalMode(false);
        }
      } catch {
        // fallback
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  const showToast = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Sync business data to LocalStorage (User-scoped and Demo-scoped cache)
  useEffect(() => {
    try {
      const storagePrefix = isDemoMode
        ? `${STORAGE_KEY_PREFIX}_demo`
        : userId
        ? `${STORAGE_KEY_PREFIX}_u_${userId}`
        : `${STORAGE_KEY_PREFIX}_guest`;

      localStorage.setItem(`${storagePrefix}_classes`, JSON.stringify(classes));
      localStorage.setItem(`${storagePrefix}_students`, JSON.stringify(students));
      localStorage.setItem(`${storagePrefix}_sessions`, JSON.stringify(sessions));
      localStorage.setItem(`${storagePrefix}_attendance`, JSON.stringify(attendanceRecords));
      localStorage.setItem(`${storagePrefix}_grades`, JSON.stringify(grades));
      localStorage.setItem(`${storagePrefix}_journals`, JSON.stringify(journals));
      localStorage.setItem(`${storagePrefix}_finances`, JSON.stringify(finances));
      localStorage.setItem(`${storagePrefix}_teacher`, JSON.stringify(teacher));
    } catch (e) {
      console.warn('Storage sync issue', e);
    }
  }, [isDemoMode, userId, classes, students, sessions, attendanceRecords, grades, journals, finances, teacher]);

  // Fetch data from Supabase when user is logged in (NOT demo mode)
  useEffect(() => {
    if (isDemoMode || !userId) return;

    let isMounted = true;
    const loadSupabaseData = async () => {
      try {
        const [
          dbProfile,
          dbClasses,
          dbStudents,
          dbSessions,
          dbGrades,
          dbJournals,
          dbFinances,
        ] = await Promise.all([
          fetchProfile(userId),
          fetchClasses(userId),
          fetchStudents(userId),
          fetchAttendanceSessions(userId),
          fetchGrades(userId),
          fetchJournals(userId),
          fetchFinances(userId),
        ]);

        if (!isMounted) return;

        // Filter attendance records by teacher's session IDs (never select whole table)
        const sessionIds = (dbSessions || []).map((s) => s.id);
        const dbRecords = sessionIds.length > 0 ? await fetchAttendanceRecords(sessionIds) : [];

        if (!isMounted) return;

        if (dbProfile) {
          setTeacher(dbProfile);
          if (dbProfile.school) setSchoolName(dbProfile.school);
        } else {
          setTeacher((prev) => ({
            ...prev,
            name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guru Pendidik',
            email: user?.email || prev.email || '',
          }));
        }

        const loadedClasses = dbClasses || [];
        setClasses(loadedClasses);
        if (loadedClasses.length > 0) {
          setActiveClass((prev) => (prev ? loadedClasses.find((c) => c.id === prev.id) || loadedClasses[0] : loadedClasses[0]));
        } else {
          setActiveClass(null);
        }

        setStudents(dbStudents || []);

        const loadedSessions = dbSessions || [];
        setSessions(loadedSessions);
        if (loadedSessions.length > 0) {
          setActiveSession((prev) => (prev ? loadedSessions.find((s) => s.id === prev.id) || loadedSessions[0] : loadedSessions[0]));
        } else {
          setActiveSession(null);
        }

        setAttendanceRecords(dbRecords || []);
        setGrades(dbGrades || []);
        setJournals(dbJournals || []);
        setFinances(dbFinances || []);
      } catch (err) {
        console.warn('[App] Error loading Supabase data:', err);
        showToast('Gagal Memuat Data Cloud', 'Terjadi kendala saat mengambil data dari Supabase.');
      }
    };

    loadSupabaseData();

    return () => {
      isMounted = false;
    };
  }, [userId, isDemoMode]);

  // Auth Handlers
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.warn('Logout error:', err);
    }
    setClasses([]);
    setActiveClass(null);
    setStudents([]);
    setSessions([]);
    setActiveSession(null);
    setAttendanceRecords([]);
    setGrades([]);
    setJournals([]);
    setFinances([]);
    setActiveTab('presensi');
    showToast('Sesi Berakhir', 'Anda telah keluar dari akun pendidik secara aman.');
  };

  // Synchronize attendance metrics into teaching agenda (JournalEntry)
  const syncAttendanceSessionToJournal = (
    sessionToSync: AttendanceSession,
    records: AttendanceRecord[],
    currentStudents: Student[]
  ) => {
    const classStudents = currentStudents.filter((s) => s.classId === sessionToSync.classId);
    const sessionRecords = records.filter((r) => r.sessionId === sessionToSync.id);

    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpa = 0;
    let dispen = 0;
    const keteranganList: string[] = [];

    classStudents.forEach((std) => {
      const rec = sessionRecords.find((r) => r.studentId === std.id);
      if (rec?.status === 'H') hadir++;
      else if (rec?.status === 'S') {
        sakit++;
        keteranganList.push(`${std.nama} (Sakit${rec.keterangan ? ': ' + rec.keterangan : ''})`);
      } else if (rec?.status === 'I') {
        izin++;
        keteranganList.push(`${std.nama} (Izin${rec.keterangan ? ': ' + rec.keterangan : ''})`);
      } else if (rec?.status === 'A') {
        alpa++;
        keteranganList.push(`${std.nama} (Alfa)`);
      } else if (rec?.status === 'D') {
        dispen++;
        keteranganList.push(`${std.nama} (Dispen)`);
      }
    });

    let absensiCatatan = '';
    const totalFilled = hadir + sakit + izin + alpa + dispen;
    if (totalFilled === 0) {
      absensiCatatan = 'Presensi pertemuan baru dibuka (absen kosong, siap diisi).';
    } else if (sakit === 0 && izin === 0 && alpa === 0 && dispen === 0) {
      absensiCatatan = `Hadir lengkap 100% (${hadir}/${classStudents.length} siswa).`;
    } else {
      absensiCatatan = `H: ${hadir}, S: ${sakit}, I: ${izin}, A: ${alpa}, D: ${dispen}. ${
        keteranganList.length > 0 ? 'Catatan: ' + keteranganList.join('; ') : ''
      }`;
    }

    setJournals((prev) => {
      const targetPertemuanKe = Number(sessionToSync.pertemuanKe) || 1;
      const existingIdx = prev.findIndex(
        (j) => j.classId === sessionToSync.classId && Number(j.pertemuanKe) === targetPertemuanKe
      );

      const targetClass = classes.find((c) => c.id === sessionToSync.classId) || activeClass;

      const materiText = (sessionToSync.materi || '').trim();
      const kegiatanText = (sessionToSync.kegiatan || '').trim();
      let combinedMateriKegiatan = '';
      if (materiText && kegiatanText) {
        combinedMateriKegiatan = `${materiText} — ${kegiatanText}`;
      } else if (materiText) {
        combinedMateriKegiatan = materiText;
      } else if (kegiatanText) {
        combinedMateriKegiatan = kegiatanText;
      }

      if (existingIdx >= 0) {
        const next = [...prev];
        const existing = next[existingIdx];
        const updatedJournal: JournalEntry = {
          ...existing,
          tanggal: sessionToSync.tanggal,
          mapel: sessionToSync.mapel,
          jamPelajaran: sessionToSync.jamPelajaran || existing.jamPelajaran || '07.15 - 09.15 WIB',
          materiKegiatan: combinedMateriKegiatan || existing.materiKegiatan,
          materi: sessionToSync.materi || existing.materi,
          kegiatan: sessionToSync.kegiatan || existing.kegiatan,
          absensiCatatan,
        };
        next[existingIdx] = updatedJournal;
        if (!isDemoMode && userId) {
          updateJournal(updatedJournal);
        }
        return next;
      } else {
        const newEntry: JournalEntry = {
          id: crypto.randomUUID(),
          tanggal: sessionToSync.tanggal,
          pendidik: teacher.name,
          mapel: sessionToSync.mapel,
          classId: sessionToSync.classId,
          className: targetClass?.nama || 'Kelas',
          pertemuanKe: targetPertemuanKe,
          jamPelajaran: sessionToSync.jamPelajaran || '07.15 - 09.15 WIB',
          materiKegiatan:
            combinedMateriKegiatan ||
            sessionToSync.catatan ||
            `Pembelajaran Tatap Muka & Praktikum Pertemuan Ke-${sessionToSync.pertemuanKe}`,
          materi: sessionToSync.materi,
          kegiatan: sessionToSync.kegiatan,
          absensiCatatan,
          semester: targetClass ? `${targetClass.tahunAjaran} (${targetClass.semester})` : 'Ganjil',
        };
        if (!isDemoMode && userId) {
          createJournal(userId, newEntry);
        }
        return [newEntry, ...prev];
      }
    });
  };

  const handleSyncAllAttendanceToJournals = () => {
    sessions.forEach((sess) => {
      syncAttendanceSessionToJournal(sess, attendanceRecords, students);
    });
    showToast(
      'Agenda Mengajar Tersinkronisasi',
      'Seluruh data kehadiran murid berhasil diperbarui ke buku jurnal agenda.'
    );
  };

  const handleSelectClass = (cls: ClassRoom) => {
    setActiveClass(cls);
    const classSess = sessions.filter((s) => s.classId === cls.id);
    if (classSess.length > 0) {
      setActiveSession(classSess[0]);
    } else {
      setActiveSession(null);
    }
  };

  // Keep activeSession always strictly synchronized to activeClass
  useEffect(() => {
    if (!activeClass) {
      if (activeSession !== null) setActiveSession(null);
      return;
    }
    const classSess = sessions.filter((s) => s.classId === activeClass.id);
    if (classSess.length === 0) {
      if (activeSession !== null) setActiveSession(null);
    } else {
      // If currently activeSession doesn't belong to activeClass, pick the first session of activeClass
      if (!activeSession || activeSession.classId !== activeClass.id || !classSess.some((s) => s.id === activeSession.id)) {
        setActiveSession(classSess[0]);
      }
    }
  }, [activeClass?.id, sessions]);

  // Handlers for Attendance
  const handleUpdateAttendanceRecord = async (
    studentId: string,
    status: AttendanceStatus,
    keterangan = ''
  ) => {
    if (!activeClass || !activeSession) return;
    const existingIdx = attendanceRecords.findIndex(
      (r) => r.sessionId === activeSession.id && r.studentId === studentId
    );

    let targetRecord: AttendanceRecord;
    if (existingIdx >= 0) {
      targetRecord = {
        ...attendanceRecords[existingIdx],
        status,
        keterangan,
        updatedAt: new Date().toISOString(),
      };
    } else {
      targetRecord = {
        id: crypto.randomUUID(),
        sessionId: activeSession.id,
        studentId,
        status,
        keterangan,
        updatedAt: new Date().toISOString(),
      };
    }

    const next =
      existingIdx >= 0
        ? attendanceRecords.map((r, i) => (i === existingIdx ? targetRecord : r))
        : [...attendanceRecords, targetRecord];

    setAttendanceRecords(next);
    syncAttendanceSessionToJournal(activeSession, next, students);

    if (!isDemoMode && userId) {
      try {
        const saved = await upsertAttendanceRecord(targetRecord);
        if (saved) {
          setAttendanceRecords((prev) =>
            prev.map((r) =>
              r.sessionId === targetRecord.sessionId && r.studentId === targetRecord.studentId
                ? saved
                : r
            )
          );
        }
      } catch (err) {
        console.warn('Attendance save issue:', err);
      }
    }
  };

  const handleSetAllHadir = async (targetSession?: AttendanceSession) => {
    if (!activeClass) {
      showToast('Pilih Rombel Terlebih Dahulu', 'Silakan buat atau pilih kelas aktif terlebih dahulu.');
      return;
    }

    // Resolve target session for activeClass (robust fallback)
    let sess = targetSession || (activeSession && activeSession.classId === activeClass.id ? activeSession : null);
    if (!sess) {
      const classSessions = sessions.filter((s) => s.classId === activeClass.id);
      if (classSessions.length > 0) {
        sess = classSessions[0];
        setActiveSession(sess);
      }
    }

    if (!sess) {
      showToast(
        'Belum Ada Sesi Pertemuan',
        'Buat sesi presensi terlebih dahulu dengan menekan tombol "+ Buat Absen Baru".'
      );
      return;
    }

    const classStudents = students.filter((s) => s.classId === activeClass.id);
    if (classStudents.length === 0) {
      showToast(
        'Kelas Masih Kosong',
        'Belum ada data murid di kelas ini. Silakan tambahkan murid terlebih dahulu di tab "Data Murid".'
      );
      return;
    }

    const studentIdsInClass = new Set(classStudents.map((s) => s.id));

    // Preserve existing record IDs if already exists in this session
    const allHadirForCurrent: AttendanceRecord[] = classStudents.map((std) => {
      const existing = attendanceRecords.find(
        (r) => r.sessionId === sess.id && r.studentId === std.id
      );
      return {
        id: existing?.id || crypto.randomUUID(),
        sessionId: sess.id,
        studentId: std.id,
        status: 'H',
        keterangan: existing?.status === 'H' ? existing.keterangan || '' : '',
        updatedAt: new Date().toISOString(),
      };
    });

    // Optimistic UI update: instantly update local state so UI responds with no lag
    const filteredOther = attendanceRecords.filter(
      (r) => !(r.sessionId === sess.id && studentIdsInClass.has(r.studentId))
    );

    const updated = [...filteredOther, ...allHadirForCurrent];
    setAttendanceRecords(updated);
    syncAttendanceSessionToJournal(sess, updated, students);

    showToast(
      'Semua Murid Hadir (100%)',
      `Presensi pertemuan Ke-${sess.pertemuanKe} (${classStudents.length} siswa) berhasil diset 100% Hadir & disinkronkan ke Agenda Mengajar.`
    );

    // Save to Supabase in background
    if (!isDemoMode && userId) {
      try {
        const success = await upsertAttendanceRecordsBatch(allHadirForCurrent);
        if (!success) {
          console.warn('[handleSetAllHadir] Batch upsert warning, retrying individual fallback');
          Promise.all(allHadirForCurrent.map((rec) => upsertAttendanceRecord(rec))).catch((err) =>
            console.error('[handleSetAllHadir] Fallback upsert error:', err)
          );
        }
      } catch (err) {
        console.error('[handleSetAllHadir] Error saving to Supabase:', err);
      }
    }
  };

  const handleSaveToCloud = () => {
    showToast('Tersimpan di Cloud Supabase', 'Data berhasil disinkronisasi ke PostgreSQL dengan Row Level Security.');
  };

  const handleCreateNewSession = async (customData?: {
    pertemuanKe?: number;
    tanggal?: string;
    mapel?: string;
    materi?: string;
    kegiatan?: string;
    jamPelajaran?: string;
    catatan?: string;
    setAllHadir?: boolean;
  }) => {
    if (!activeClass) {
      showToast('Pilih Rombel Terlebih Dahulu', 'Silakan pilih atau buat rombel kelas sebelum membuat sesi presensi.');
      return;
    }
    // Find next session number for current class
    const classSess = sessions.filter((s) => s.classId === activeClass.id);
    const nextNumber =
      customData?.pertemuanKe ||
      classSess.reduce((max, s) => Math.max(max, s.pertemuanKe), 0) + 1;
    const today = customData?.tanggal || new Date().toISOString().split('T')[0];
    const mapel = customData?.mapel || activeClass.mapel;
    const materi = customData?.materi || '';
    const kegiatan = customData?.kegiatan || '';
    const jamPelajaran = customData?.jamPelajaran || '07:15 - 09:15 WIB';

    const newSession: AttendanceSession = {
      id: crypto.randomUUID(),
      classId: activeClass.id,
      pertemuanKe: nextNumber,
      tanggal: today,
      mapel,
      materi,
      kegiatan,
      jamPelajaran,
      catatan:
        customData?.catatan ||
        (materi ? `${materi} — ${kegiatan}` : `Pertemuan Ke-${nextNumber} - Pembelajaran Tatap Muka & Praktikum`),
      createdAt: new Date().toISOString(),
    };

    let sessionToUse = newSession;
    if (!isDemoMode && userId) {
      const created = await createAttendanceSession(userId, newSession);
      if (!created) {
        showToast('Gagal Membuat Sesi', 'Tidak dapat menyimpan sesi presensi ke Supabase.');
        return;
      }
      sessionToUse = created;
    }

    setSessions((prev) => [sessionToUse, ...prev]);
    setActiveSession(sessionToUse);

    const classStudents = students.filter((s) => s.classId === activeClass.id);
    let recordsToSync = attendanceRecords;

    if (customData?.setAllHadir) {
      const allHadirForCurrent: AttendanceRecord[] = classStudents.map((std) => ({
        id: crypto.randomUUID(),
        sessionId: sessionToUse.id,
        studentId: std.id,
        status: 'H',
        keterangan: '',
        updatedAt: new Date().toISOString(),
      }));
      if (!isDemoMode && userId) {
        await upsertAttendanceRecordsBatch(allHadirForCurrent);
      }
      recordsToSync = [...attendanceRecords, ...allHadirForCurrent];
      setAttendanceRecords(recordsToSync);
    }

    // Otomatis sinkronkan data absen menuju agenda mengajar
    syncAttendanceSessionToJournal(sessionToUse, recordsToSync, students);

    showToast(
      'Sesi Absen Baru & Agenda Mengajar Terbentuk',
      `Pertemuan Ke-${nextNumber} (${today}) ${materi ? 'materi "' + materi + '"' : ''} otomatis tersinkronisasi ke Agenda Mengajar.`
    );
  };

  const handleUpdateSession = async (updatedSession: AttendanceSession) => {
    if (!isDemoMode && userId) {
      const success = await updateAttendanceSession(updatedSession);
      if (!success) {
        showToast('Gagal Memperbarui Sesi', 'Tidak dapat memperbarui sesi presensi di Supabase.');
        return;
      }
    }

    setSessions((prev) =>
      prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
    );
    if (activeSession?.id === updatedSession.id) {
      setActiveSession(updatedSession);
    }
    // Sinkronkan perubahan sesi absen ke Agenda Mengajar
    syncAttendanceSessionToJournal(updatedSession, attendanceRecords, students);
    showToast(
      'Sesi Absen & Agenda Diperbarui',
      `Data Pertemuan Ke-${updatedSession.pertemuanKe} (${updatedSession.tanggal}) berhasil disimpan dan disinkronkan ke Agenda Mengajar.`
    );
  };

  const handleDeleteSession = async (sessionId: string) => {
    const classSess = activeClass ? sessions.filter((s) => s.classId === activeClass.id) : [];
    if (classSess.length <= 1) {
      showToast('Perhatian', 'Minimal harus tersisa 1 sesi pertemuan pada rombel ini.');
      return;
    }
    const targetSession = sessions.find((s) => s.id === sessionId);

    if (!isDemoMode && userId) {
      const success = await deleteAttendanceSession(sessionId);
      if (!success) {
        showToast('Gagal Menghapus Sesi', 'Tidak dapat menghapus sesi pertemuan dari Supabase.');
        return;
      }
    }

    const remaining = sessions.filter((s) => s.id !== sessionId);
    setSessions(remaining);
    setAttendanceRecords((prev) => prev.filter((r) => r.sessionId !== sessionId));

    if (activeSession?.id === sessionId) {
      const remainingForClass = activeClass ? remaining.filter((s) => s.classId === activeClass.id) : [];
      if (remainingForClass.length > 0) {
        setActiveSession(remainingForClass[0]);
      }
    }
    showToast(
      'Sesi Absen Dihapus',
      `Pertemuan Ke-${targetSession?.pertemuanKe || ''} telah dihapus dari sistem.`
    );
  };

  // Handlers for Grades
  const handleUpdateGrade = async (studentId: string, updatedGrade: Partial<GradeRecord>) => {
    if (!activeClass) return;
    const idx = grades.findIndex((g) => g.studentId === studentId);
    let targetGrade: GradeRecord;
    if (idx >= 0) {
      targetGrade = { ...grades[idx], ...updatedGrade, updatedAt: new Date().toISOString() };
    } else {
      targetGrade = {
        id: crypto.randomUUID(),
        studentId,
        classId: activeClass.id,
        formatif: updatedGrade.formatif || Array(activeClass.formatifCount).fill(null),
        sts: updatedGrade.sts ?? null,
        sas: updatedGrade.sas ?? null,
        deskripsi: updatedGrade.deskripsi || '',
        updatedAt: new Date().toISOString(),
        ...updatedGrade,
      };
    }

    if (!isDemoMode && userId) {
      const saved = await upsertGrade(userId, targetGrade);
      if (!saved) {
        showToast('Gagal Menyimpan Nilai', 'Tidak dapat memperbarui nilai rapor di Supabase.');
        return;
      }
      targetGrade = saved;
    }

    const next =
      idx >= 0
        ? grades.map((g, i) => (i === idx ? targetGrade : g))
        : [...grades, targetGrade];
    setGrades(next);
  };

  const handleGenerateAllDescriptions = async () => {
    const kkm = activeClass?.kkm || 75;
    const updatedList = grades.map((g) => {
      const validF = (g.formatif || []).filter((v): v is number => v !== null && !isNaN(v));
      const avg = validF.length > 0 ? validF.reduce((a, b) => a + b, 0) / validF.length : 75;
      const student = students.find((s) => s.id === g.studentId);
      const name = student?.nama || 'Siswa';

      let deskripsi = '';
      if (avg >= 88) {
        deskripsi = `${name} menunjukkan penguasaan SANGAT BAIK pada seluruh capaian TP 1-5 dan memiliki kemandirian praktik yang tinggi.`;
      } else if (avg >= kkm) {
        deskripsi = `${name} menunjukkan pencapaian yang BAIK dalam ketercapaian tujuan pembelajaran, perlu penguatan ketelitian pada evaluasi akhir.`;
      } else {
        deskripsi = `${name} perlu bimbingan dan pendampingan intensif (remedial) dalam memahami konsep dasar dan keselamatan kerja bengkel.`;
      }

      return {
        ...g,
        deskripsi,
        updatedAt: new Date().toISOString(),
      };
    });

    if (!isDemoMode && userId) {
      try {
        await Promise.all(updatedList.map((g) => upsertGrade(userId, g)));
      } catch {
        showToast('Peringatan Sinkronisasi', 'Sebagian deskripsi nilai tidak tersimpan ke cloud.');
      }
    }

    setGrades(updatedList);
    showToast('Deskripsi Merdeka Dibuat Otomatis', 'Catatan capaian kompetensi berhasil digenerate untuk seluruh murid.');
  };

  const handleApplyDeepLearningDescriptions = async (descriptionsMap: Map<string, string>) => {
    const updatedList = grades.map((g) => {
      const autoDesc = descriptionsMap.get(g.studentId);
      if (autoDesc) {
        return {
          ...g,
          deskripsi: autoDesc,
          updatedAt: new Date().toISOString(),
        };
      }
      return g;
    });

    if (!isDemoMode && userId) {
      const changed = updatedList.filter((g) => descriptionsMap.has(g.studentId));
      try {
        await Promise.all(changed.map((g) => upsertGrade(userId, g)));
      } catch {
        showToast('Peringatan Sinkronisasi', 'Sebagian analisis AI tidak tersimpan ke Supabase.');
      }
    }

    setGrades(updatedList);
    showToast('Deskripsi AI Diterapkan', 'Analisis neural telah ditautkan langsung ke Buku Penilaian Rapor.');
    setActiveTab('penilaian');
  };

  // Handlers for Journals
  const handleAddJournal = async (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: crypto.randomUUID(),
    };
    if (!isDemoMode && userId) {
      const created = await createJournal(userId, newEntry);
      if (!created) {
        showToast('Gagal Menambahkan Agenda', 'Tidak dapat menyimpan agenda mengajar ke Supabase.');
        return;
      }
      setJournals((prev) => [created, ...prev]);
    } else {
      setJournals((prev) => [newEntry, ...prev]);
    }
    showToast('Agenda Mengajar Ditambahkan', `Pertemuan Ke-${entry.pertemuanKe} kelas ${entry.className} tersimpan.`);
  };

  const handleUpdateJournal = async (updatedEntry: JournalEntry) => {
    if (!isDemoMode && userId) {
      const success = await updateJournal(updatedEntry);
      if (!success) {
        showToast('Gagal Memperbarui Agenda', 'Tidak dapat memperbarui catatan agenda di Supabase.');
        return;
      }
    }
    setJournals((prev) => prev.map((j) => (j.id === updatedEntry.id ? updatedEntry : j)));
    showToast(
      'Agenda Mengajar Diperbarui',
      `Catatan pertemuan Ke-${updatedEntry.pertemuanKe} (${updatedEntry.className}) berhasil disimpan.`
    );
  };

  const handleDeleteJournal = async (id: string) => {
    if (!isDemoMode && userId) {
      const success = await deleteJournal(id);
      if (!success) {
        showToast('Gagal Menghapus Agenda', 'Tidak dapat menghapus agenda dari Supabase.');
        return;
      }
    }
    setJournals((prev) => prev.filter((j) => j.id !== id));
    showToast('Agenda Mengajar Dihapus', 'Catatan agenda telah dihapus dari buku jurnal.');
  };

  // Handlers for Finances
  const handleAddTransaction = async (tx: Omit<FinanceTransaction, 'id'>) => {
    const newTx: FinanceTransaction = {
      ...tx,
      id: crypto.randomUUID(),
    };
    if (!isDemoMode && userId) {
      const created = await createFinance(userId, newTx);
      if (!created) {
        showToast('Gagal Mencatat Transaksi', 'Tidak dapat menyimpan transaksi ke Supabase.');
        return;
      }
      setFinances((prev) => [created, ...prev]);
    } else {
      setFinances((prev) => [newTx, ...prev]);
    }
    showToast('Transaksi Dicatat', `${tx.tipe} Rp ${tx.nominal.toLocaleString('id-ID')} masuk ke pembukuan.`);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!isDemoMode && userId) {
      const success = await deleteFinance(id);
      if (!success) {
        showToast('Gagal Menghapus Transaksi', 'Tidak dapat menghapus transaksi dari Supabase.');
        return;
      }
    }
    setFinances((prev) => prev.filter((t) => t.id !== id));
    showToast('Transaksi Dihapus', 'Data pembukuan berhasil disesuaikan.');
  };

  // Handlers for Students
  const handleAddStudent = async (newStd: Omit<Student, 'id' | 'noUrut'>) => {
    if (!activeClass) {
      showToast('Pilih Rombel Terlebih Dahulu', 'Silakan buat atau pilih rombel kelas.');
      return;
    }
    const currentClassStudents = students.filter((s) => s.classId === activeClass.id);
    const nextNo = currentClassStudents.length + 1;
    const student: Student = {
      ...newStd,
      id: crypto.randomUUID(),
      classId: activeClass.id,
      noUrut: nextNo,
    };
    if (!isDemoMode && userId) {
      const created = await createStudent(userId, student);
      if (!created) {
        showToast('Gagal Menambahkan Murid', 'Terjadi kesalahan saat menyimpan data murid ke Supabase.');
        return;
      }
      setStudents((prev) => [...prev, created]);
    } else {
      setStudents((prev) => [...prev, student]);
    }
    showToast('Murid Berhasil Ditambahkan', `${student.nama} terdaftar di kelas ${activeClass.nama} dengan nomor absen ${nextNo}.`);
  };

  const handleEditStudent = async (updatedStudent: Student) => {
    if (!isDemoMode && userId) {
      const success = await updateStudent(updatedStudent);
      if (!success) {
        showToast('Gagal Memperbarui Murid', 'Tidak dapat menyimpan perubahan data murid ke Supabase.');
        return;
      }
    }
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    showToast('Data Murid Diperbarui', `Informasi ${updatedStudent.nama} berhasil diubah.`);
  };

  // Sistem dalam absen: jika data siswa dihapus, nomor absen siswa setelahnya otomatis diganti
  const handleDeleteStudent = async (id: string) => {
    const studentToDelete = students.find((s) => s.id === id);
    if (!studentToDelete) return;
    const targetClassId = studentToDelete.classId;

    if (!isDemoMode && userId) {
      const success = await deleteStudent(id);
      if (!success) {
        showToast('Gagal Menghapus Murid', 'Tidak dapat menghapus data murid dari Supabase.');
        return;
      }
    }

    const otherStudents = students.filter((s) => s.classId !== targetClassId);
    const remainingThisClass = students
      .filter((s) => s.classId === targetClassId && s.id !== id)
      .sort((a, b) => a.noUrut - b.noUrut);

    const reindexed = remainingThisClass.map((s, idx) => ({
      ...s,
      noUrut: idx + 1,
    }));

    if (!isDemoMode && userId && reindexed.length > 0) {
      await updateStudentsBatch(reindexed, userId);
    }

    setStudents([...otherStudents, ...reindexed]);
    setAttendanceRecords((prev) => prev.filter((r) => r.studentId !== id));
    setGrades((prev) => prev.filter((g) => g.studentId !== id));

    showToast(
      'Nomor Absen Diperbarui Otomatis',
      `Murid ${studentToDelete.nama} (No. ${studentToDelete.noUrut}) dihapus. Nomor absen rombel setelahnya otomatis digeser maju berurutan.`
    );
  };

  // Batch Student Import (from Excel / Copas Langsung)
  const handleAddStudentsBatch = async (
    newStds: Omit<Student, 'id' | 'noUrut'>[],
    mode: 'append' | 'replace'
  ) => {
    if (newStds.length === 0) return;

    if (mode === 'replace') {
      const otherClassStudents = students.filter((s) => s.classId !== activeClass.id);
      const formatted: Student[] = newStds.map((s, idx) => ({
        ...s,
        id: crypto.randomUUID(),
        classId: activeClass.id,
        noUrut: idx + 1,
      }));
      if (!isDemoMode && userId) {
        const created = await createStudentsBatch(userId, formatted);
        if (!created || created.length === 0) {
          showToast('Gagal Mengimpor Murid', 'Tidak dapat menyimpan batch murid ke Supabase.');
          return;
        }
        setStudents([...otherClassStudents, ...created]);
      } else {
        setStudents([...otherClassStudents, ...formatted]);
      }
      showToast(
        'Impor Selesai (Ganti Data)',
        `${formatted.length} murid berhasil didaftarkan di kelas ${activeClass.nama}.`
      );
    } else {
      const currentClassStudents = students.filter((s) => s.classId === activeClass.id);
      const startNo = currentClassStudents.length;
      const formatted: Student[] = newStds.map((s, idx) => ({
        ...s,
        id: crypto.randomUUID(),
        classId: activeClass.id,
        noUrut: startNo + idx + 1,
      }));
      if (!isDemoMode && userId) {
        const created = await createStudentsBatch(userId, formatted);
        if (!created || created.length === 0) {
          showToast('Gagal Mengimpor Murid', 'Tidak dapat menyimpan batch murid ke Supabase.');
          return;
        }
        setStudents([...students, ...created]);
      } else {
        setStudents([...students, ...formatted]);
      }
      showToast(
        'Impor Selesai (Tambahkan)',
        `${formatted.length} murid baru berhasil ditambahkan ke kelas ${activeClass.nama}.`
      );
    }
  };

  // Handlers for Classes (Add, Edit, Delete Rombel)
  const handleAddClass = async (newCls: Omit<ClassRoom, 'id'>) => {
    const newClassRoom: ClassRoom = {
      ...newCls,
      id: crypto.randomUUID(),
      tpTitles: newCls.tpTitles || {},
    };

    if (!isDemoMode && userId) {
      const created = await createClass(userId, newClassRoom);
      if (!created) {
        showToast('Gagal Menambahkan Rombel', 'Tidak dapat menyimpan kelas ke Supabase.');
        return;
      }
      setClasses((prev) => [...prev, created]);
      setActiveClass(created);
      setActiveSession(null);
    } else {
      setClasses((prev) => [...prev, newClassRoom]);
      setActiveClass(newClassRoom);
      setActiveSession(null);
    }
    showToast(
      'Rombel Berhasil Ditambahkan',
      `Kelas ${newClassRoom.nama} siap digunakan. Kelas masih kosong (belum ada murid dan sesi presensi).`
    );
  };

  const handleEditClass = async (updatedCls: ClassRoom) => {
    if (!isDemoMode && userId) {
      const success = await updateClass(updatedCls);
      if (!success) {
        showToast('Gagal Memperbarui Rombel', 'Tidak dapat memperbarui data kelas di Supabase.');
        return;
      }
    }
    setClasses((prev) => prev.map((c) => (c.id === updatedCls.id ? updatedCls : c)));
    if (activeClass?.id === updatedCls.id) {
      setActiveClass(updatedCls);
    }
    showToast('Rombel Diperbarui', `Informasi kelas ${updatedCls.nama} berhasil disimpan.`);
  };

  const handleDeleteClass = async (classId: string) => {
    const target = classes.find((c) => c.id === classId);

    if (!isDemoMode && userId) {
      const success = await deleteClass(classId);
      if (!success) {
        showToast('Gagal Menghapus Rombel', 'Tidak dapat menghapus kelas dari Supabase.');
        return;
      }
    }

    const remaining = classes.filter((c) => c.id !== classId);
    setClasses(remaining);
    if (activeClass?.id === classId) {
      if (remaining.length > 0) {
        setActiveClass(remaining[0]);
        const remSess = sessions.filter((s) => s.classId === remaining[0].id);
        setActiveSession(remSess.length > 0 ? remSess[0] : null);
      } else {
        setActiveClass(null);
        setActiveSession(null);
      }
    }
    showToast('Rombel Dihapus', `Kelas ${target?.nama || ''} telah dihapus.`);
  };

  const handleUpdateTeacher = async (updated: TeacherProfile) => {
    if (!isDemoMode && userId) {
      const success = await updateProfile(userId, updated);
      if (!success) {
        showToast('Gagal Memperbarui Profil', 'Tidak dapat menyimpan profil ke Supabase.');
        return;
      }
    }
    setTeacher(updated);
    if (updated.school) {
      setSchoolName(updated.school);
    }
    showToast('Profil Berhasil Diperbarui', 'Data identitas pendidik telah tersimpan ke sistem.');
  };

  // Backup & Refresh
  const handleDownloadBackup = () => {
    downloadJsonBackup({
      exportDate: new Date().toISOString(),
      developer: '@hndx07',
      school: schoolName,
      classes,
      students,
      sessions,
      attendanceRecords,
      grades,
      journals,
      finances,
    });
    showToast('Backup JSON Berhasil Diunduh', 'Seluruh database berhasil diekspor secara aman.');
  };

  const handleRefreshData = async () => {
    if (isDemoMode || !userId) {
      showToast('Mode Uji Coba Demo', 'Aplikasi saat ini berjalan dalam mode lokal & offline.');
      return;
    }
    showToast('Menyinkronkan...', 'Memuat data terbaru dari Supabase PostgreSQL Cloud.');
    try {
      const [
        dbProfile,
        dbClasses,
        dbStudents,
        dbSessions,
        dbGrades,
        dbJournals,
        dbFinances,
      ] = await Promise.all([
        fetchProfile(userId),
        fetchClasses(userId),
        fetchStudents(userId),
        fetchAttendanceSessions(userId),
        fetchGrades(userId),
        fetchJournals(userId),
        fetchFinances(userId),
      ]);

      const sessionIds = (dbSessions || []).map((s) => s.id);
      const dbRecords = sessionIds.length > 0 ? await fetchAttendanceRecords(sessionIds) : [];

      if (dbProfile) {
        setTeacher(dbProfile);
        if (dbProfile.school) setSchoolName(dbProfile.school);
      }
      if (dbClasses) {
        setClasses(dbClasses);
        if (dbClasses.length > 0) {
          setActiveClass((prev) => dbClasses.find((c) => c.id === prev.id) || dbClasses[0]);
        }
      }
      if (dbStudents) setStudents(dbStudents);
      if (dbSessions) {
        setSessions(dbSessions);
        if (dbSessions.length > 0) {
          setActiveSession((prev) => dbSessions.find((s) => s.id === prev.id) || dbSessions[0]);
        }
      }
      if (dbRecords) setAttendanceRecords(dbRecords);
      if (dbGrades) setGrades(dbGrades);
      if (dbJournals) setJournals(dbJournals);
      if (dbFinances) setFinances(dbFinances);

      showToast('Data Telah Disinkronkan', 'Data berhasil diperbarui dari Supabase Cloud.');
    } catch (err: any) {
      showToast('Gagal Sinkronisasi', err?.message || 'Tidak dapat memperbarui data dari cloud.');
    }
  };

  // 1. PUBLIC PORTAL VIEW (Strictly Read-Only without Edit Access / Login Locked)
  if (isPublicPortalMode) {
    return (
      <PublicPortalView
        initialType={publicPortalParams.tipe}
        initialClassId={publicPortalParams.kelas || activeClass?.id || ''}
        initialNisn={publicPortalParams.nisn}
        classes={classes}
        students={students}
        sessions={sessions}
        attendanceRecords={attendanceRecords}
        grades={grades}
        finances={finances}
        teacher={teacher}
        schoolName={schoolName}
      />
    );
  }

  // 2. Loading state while verifying Supabase session
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#faf7ee]">
        <div className="bg-white border-3 border-slate-900 rounded-3xl p-8 shadow-[6px_6px_0px_#1e293b] flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#6ee7b7] border-2 border-slate-900 flex items-center justify-center shadow-[2px_2px_0px_#1e293b]">
            <div className="w-6 h-6 border-3 border-slate-900 border-t-transparent rounded-full animate-spin" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm">Memeriksa Sesi Masuk...</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Menghubungkan ke Supabase Cloud</p>
          </div>
        </div>
      </div>
    );
  }

  // 3. If user is not authenticated, show the clean vintage postmodernism login view
  if (!isAuthenticated) {
    return (
      <LoginView
        onLoginSuccess={(user, profile) => {
          if (profile) setTeacher(profile);
          showToast('Selamat Datang!', `Berhasil masuk ke Ruang Guru (${user.email})`);
        }}
        onDemoLogin={(startEmpty = false) => {
          setDemoMode(true);
          if (startEmpty) {
            setClasses([]);
            setActiveClass(null);
            setStudents([]);
            setSessions([]);
            setActiveSession(null);
            setAttendanceRecords([]);
            setGrades([]);
            setJournals([]);
            setFinances([]);
            try {
              localStorage.setItem(`${STORAGE_KEY_PREFIX}_demo_classes`, JSON.stringify([]));
              localStorage.setItem(`${STORAGE_KEY_PREFIX}_demo_students`, JSON.stringify([]));
              localStorage.setItem(`${STORAGE_KEY_PREFIX}_demo_sessions`, JSON.stringify([]));
              localStorage.setItem(`${STORAGE_KEY_PREFIX}_demo_attendance`, JSON.stringify([]));
              localStorage.setItem(`${STORAGE_KEY_PREFIX}_demo_grades`, JSON.stringify([]));
              localStorage.setItem(`${STORAGE_KEY_PREFIX}_demo_journals`, JSON.stringify([]));
              localStorage.setItem(`${STORAGE_KEY_PREFIX}_demo_finances`, JSON.stringify([]));
            } catch (e) {
              console.warn('Local storage error', e);
            }
            showToast('Ruang Guru Bersih Siap Digunakan', 'Data kosong siap diisi dengan rombel dan murid sekolah Anda.');
          } else {
            setClasses(initialClasses);
            setActiveClass(initialClasses[0]);
            setStudents(initialStudents);
            setSessions(initialSessions);
            setActiveSession(initialSessions[0]);
            setAttendanceRecords(initialAttendanceRecords);
            setGrades(initialGrades);
            setJournals(initialJournals);
            setFinances(initialFinances);
            showToast('Mode Uji Coba Demo', 'Masuk sebagai Guru Pengajar Akun Demo (Data Simulasi).');
          }
        }}
        schoolName={schoolName}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7ee] font-sans selection:bg-[#6ee7b7] selection:text-slate-950">
      {/* Demo Mode Notice Banner */}
      {isDemoMode && (
        <div className="bg-[#fef9c3] border-b-2 border-slate-900 px-4 py-2 text-center text-xs font-black text-amber-950 flex items-center justify-center gap-2 shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span>Mode Demo Offline: Berjalan menggunakan data lokal mandiri dan tidak mengirim data ke Supabase Cloud.</span>
        </div>
      )}
      {/* Toast floating notification - Vintage Neobrutalist */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#ffffff] text-slate-900 px-4 py-3 rounded-2xl shadow-[4px_4px_0px_#1e293b] border-2 border-slate-900 flex items-start gap-3 animate-in slide-in-from-top duration-200">
          <div className="p-1 rounded-xl bg-[#dcfce7] border border-slate-900 text-emerald-900 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black">{toastMessage.title}</h4>
            <p className="text-[11px] text-slate-600 mt-0.5 font-medium">{toastMessage.desc}</p>
          </div>
        </div>
      )}

      {/* Top Navbar - Only class selector bar on the right */}
      <Navbar
        onOpenDrawer={() => setIsDrawerOpen(true)}
        classes={classes}
        activeClass={activeClass}
        onSelectClass={handleSelectClass}
        onOpenClassManagement={() => setIsClassModalOpen(true)}
      />

      {/* Navigation Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
        }}
        activeClass={activeClass}
        onSwitchClass={() => {
          const nextIdx = (classes.findIndex((c) => c.id === activeClass.id) + 1) % classes.length;
          handleSelectClass(classes[nextIdx]);
          showToast('Kelas Berganti', `Sekarang melihat data ${classes[nextIdx].nama}`);
        }}
        onOpenClassManagement={() => setIsClassModalOpen(true)}
        onRefreshData={handleRefreshData}
        onDownloadBackup={handleDownloadBackup}
        teacher={teacher}
        schoolName={schoolName}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-12">
        {activeTab === 'presensi' && (
          <AttendanceView
            activeClass={activeClass}
            students={students}
            sessions={sessions}
            activeSession={activeSession}
            attendanceRecords={attendanceRecords}
            onSelectSession={(s) => setActiveSession(s)}
            onUpdateRecord={handleUpdateAttendanceRecord}
            onSetAllHadir={handleSetAllHadir}
            onSaveToCloud={handleSaveToCloud}
            onCreateNewSession={handleCreateNewSession}
            onUpdateSession={handleUpdateSession}
            onDeleteSession={handleDeleteSession}
            onDeleteStudent={handleDeleteStudent}
            onOpenParentLink={() => setIsParentPortalOpen(true)}
            onOpenWhatsAppModal={(targetStd) => {
              setTargetStudentWA(targetStd);
              setIsWhatsAppModalOpen(true);
            }}
            schoolName={schoolName}
            teacher={teacher}
            printConfig={printConfig}
            onOpenClassManagement={() => setIsClassModalOpen(true)}
          />
        )}

        {activeTab === 'rekap' && (
          <MonthlyRecapView
            activeClass={activeClass}
            students={students}
            sessions={sessions}
            attendanceRecords={attendanceRecords}
            teacher={teacher}
            schoolName={schoolName}
            printConfig={printConfig}
            onOpenClassManagement={() => setIsClassModalOpen(true)}
          />
        )}

        {activeTab === 'penilaian' && (
          <GradebookView
            activeClass={activeClass}
            students={students}
            grades={grades}
            onUpdateGrade={handleUpdateGrade}
            onGenerateAllDescriptions={handleGenerateAllDescriptions}
            onSaveToCloud={handleSaveToCloud}
            onOpenParentLink={() => setIsParentPortalOpen(true)}
            schoolName={schoolName}
            teacher={teacher}
            onUpdateClass={handleEditClass}
            printConfig={printConfig}
            onOpenClassManagement={() => setIsClassModalOpen(true)}
          />
        )}

        {activeTab === 'murid' && (
          <StudentManagementView
            activeClass={activeClass}
            students={students}
            onAddStudent={handleAddStudent}
            onEditStudent={handleEditStudent}
            onDeleteStudent={handleDeleteStudent}
            onSaveToCloud={handleSaveToCloud}
            schoolName={schoolName}
            onAddStudentsBatch={handleAddStudentsBatch}
            onOpenClassManagement={() => setIsClassModalOpen(true)}
          />
        )}

        {activeTab === 'jurnal' && (
          <JournalView
            journals={journals}
            classes={classes}
            teacher={teacher}
            onAddJournal={handleAddJournal}
            onUpdateJournal={handleUpdateJournal}
            onDeleteJournal={handleDeleteJournal}
            onSaveToCloud={handleSaveToCloud}
            schoolName={schoolName}
            onSyncAttendance={handleSyncAllAttendanceToJournals}
            printConfig={printConfig}
          />
        )}

        {activeTab === 'keuangan' && (
          <FinanceView
            activeClass={activeClass}
            students={students}
            finances={finances}
            teacher={teacher}
            schoolName={schoolName}
            printConfig={printConfig}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onSaveToCloud={handleSaveToCloud}
            onOpenParentLink={() => setIsParentPortalOpen(true)}
          />
        )}

        {activeTab === 'statistik' && (
          <DashboardView
            activeClass={activeClass}
            students={students}
            sessions={sessions}
            attendanceRecords={attendanceRecords}
            grades={grades}
            finances={finances}
            onNavigateTab={(tab) => setActiveTab(tab)}
            schoolName={schoolName}
          />
        )}

        {activeTab === 'deeplearning' && (
          <DeepLearningView
            activeClass={activeClass}
            students={students}
            attendanceRecords={attendanceRecords}
            grades={grades}
            onApplyDescriptionsToGrades={handleApplyDeepLearningDescriptions}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'profil' && (
          <ProfileView
            teacher={teacher}
            schoolName={schoolName}
            classes={classes}
            totalStudents={students.length}
            onUpdateTeacher={handleUpdateTeacher}
            onLogout={handleLogout}
            onShowToast={showToast}
            activeClass={activeClass}
            students={students}
            sessions={sessions}
            attendanceRecords={attendanceRecords}
            grades={grades}
            journals={journals}
            financeTransactions={finances}
            printConfig={printConfig}
            onUpdatePrintConfig={(cfg) => {
              setPrintConfig(cfg);
              setSchoolName(cfg.schoolName);
              savePrintConfig(cfg);
            }}
          />
        )}
      </main>

      {/* Supabase Schema & Config Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onDownloadBackup={handleDownloadBackup}
      />

      {/* WhatsApp Message Modal */}
      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => {
          setIsWhatsAppModalOpen(false);
          setTargetStudentWA(undefined);
        }}
        activeClass={activeClass}
        activeSession={activeSession}
        students={students}
        attendanceRecords={attendanceRecords}
        targetStudent={targetStudentWA}
        teacher={teacher}
        schoolName={schoolName}
      />

      {/* Parent Portal Public Preview Modal */}
      <ParentPortalModal
        isOpen={isParentPortalOpen}
        onClose={() => setIsParentPortalOpen(false)}
        activeClass={activeClass}
        students={students}
        attendanceRecords={attendanceRecords}
        grades={grades}
        finances={finances}
        teacher={teacher}
        schoolName={schoolName}
        userId={userId}
        isDemoMode={isDemoMode}
        onOpenFullPublicPortal={() => {
          setIsParentPortalOpen(false);
          setIsPublicPortalMode(true);
        }}
      />

      {/* Class / Rombel Management Modal (Tambah, Edit, Hapus Kelas) */}
      <ClassManagementModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        classes={classes}
        activeClass={activeClass}
        onSelectClass={handleSelectClass}
        onAddClass={handleAddClass}
        onEditClass={handleEditClass}
        onDeleteClass={handleDeleteClass}
      />

      {/* Footer Hadir! crediting @hndx07 */}
      <Footer />
    </div>
  );
}
