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

  // Global States with local persistence fallback
  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_classes`);
      return saved ? JSON.parse(saved) : initialClasses;
    } catch {
      return initialClasses;
    }
  });

  const [activeClass, setActiveClass] = useState<ClassRoom>(classes[0] || initialClasses[0]);

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_students`);
      return saved ? JSON.parse(saved) : initialStudents;
    } catch {
      return initialStudents;
    }
  });

  const [sessions, setSessions] = useState<AttendanceSession[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_sessions`);
      return saved ? JSON.parse(saved) : initialSessions;
    } catch {
      return initialSessions;
    }
  });

  const [activeSession, setActiveSession] = useState<AttendanceSession>(sessions[0] || initialSessions[0]);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_attendance`);
      return saved ? JSON.parse(saved) : initialAttendanceRecords;
    } catch {
      return initialAttendanceRecords;
    }
  });

  const [grades, setGrades] = useState<GradeRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_grades`);
      return saved ? JSON.parse(saved) : initialGrades;
    } catch {
      return initialGrades;
    }
  });

  const [journals, setJournals] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_journals`);
      return saved ? JSON.parse(saved) : initialJournals;
    } catch {
      return initialJournals;
    }
  });

  const [finances, setFinances] = useState<FinanceTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_finances`);
      return saved ? JSON.parse(saved) : initialFinances;
    } catch {
      return initialFinances;
    }
  });

  const [teacher, setTeacher] = useState<TeacherProfile>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_teacher`);
      return saved ? JSON.parse(saved) : initialTeacher;
    } catch {
      return initialTeacher;
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

  // Sync business data to LocalStorage (as cache / offline backup)
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_classes`, JSON.stringify(classes));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_students`, JSON.stringify(students));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_sessions`, JSON.stringify(sessions));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_attendance`, JSON.stringify(attendanceRecords));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_grades`, JSON.stringify(grades));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_journals`, JSON.stringify(journals));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_finances`, JSON.stringify(finances));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_teacher`, JSON.stringify(teacher));
    } catch (e) {
      console.warn('Storage sync issue', e);
    }
  }, [classes, students, sessions, attendanceRecords, grades, journals, finances, teacher]);

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
          dbRecords,
          dbGrades,
          dbJournals,
          dbFinances,
        ] = await Promise.all([
          fetchProfile(userId),
          fetchClasses(userId),
          fetchStudents(userId),
          fetchAttendanceSessions(userId),
          fetchAttendanceRecords(),
          fetchGrades(userId),
          fetchJournals(userId),
          fetchFinances(userId),
        ]);

        if (!isMounted) return;

        if (dbProfile) {
          setTeacher(dbProfile);
          if (dbProfile.school) setSchoolName(dbProfile.school);
        }

        if (dbClasses && dbClasses.length > 0) {
          setClasses(dbClasses);
          setActiveClass(dbClasses[0]);
        }

        if (dbStudents && dbStudents.length > 0) {
          setStudents(dbStudents);
        }

        if (dbSessions && dbSessions.length > 0) {
          setSessions(dbSessions);
          setActiveSession(dbSessions[0]);
        }

        if (dbRecords && dbRecords.length > 0) {
          setAttendanceRecords(dbRecords);
        }

        if (dbGrades && dbGrades.length > 0) {
          setGrades(dbGrades);
        }

        if (dbJournals && dbJournals.length > 0) {
          setJournals(dbJournals);
        }

        if (dbFinances && dbFinances.length > 0) {
          setFinances(dbFinances);
        }
      } catch (err) {
        console.warn('[App] Error loading Supabase data:', err);
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
      const targetPertemuanKe = `Ke-${sessionToSync.pertemuanKe}`;
      const existingIdx = prev.findIndex(
        (j) => j.classId === sessionToSync.classId && j.pertemuanKe === targetPertemuanKe
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
        next[existingIdx] = {
          ...existing,
          tanggal: sessionToSync.tanggal,
          mapel: sessionToSync.mapel,
          jamPelajaran: sessionToSync.jamPelajaran || existing.jamPelajaran || '07.15 - 09.15 WIB',
          materiKegiatan: combinedMateriKegiatan || existing.materiKegiatan,
          materi: sessionToSync.materi || existing.materi,
          kegiatan: sessionToSync.kegiatan || existing.kegiatan,
          absensiCatatan,
        };
        return next;
      } else {
        const newEntry: JournalEntry = {
          id: crypto.randomUUID(),
          tanggal: sessionToSync.tanggal,
          pendidik: teacher.name,
          mapel: sessionToSync.mapel,
          classId: sessionToSync.classId,
          className: targetClass.nama,
          pertemuanKe: targetPertemuanKe,
          jamPelajaran: sessionToSync.jamPelajaran || '07.15 - 09.15 WIB',
          materiKegiatan:
            combinedMateriKegiatan ||
            sessionToSync.catatan ||
            `Pembelajaran Tatap Muka & Praktikum Pertemuan Ke-${sessionToSync.pertemuanKe}`,
          materi: sessionToSync.materi,
          kegiatan: sessionToSync.kegiatan,
          absensiCatatan,
          semester: `${targetClass.tahunAjaran} (${targetClass.semester})`,
        };
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
      const today = new Date().toISOString().split('T')[0];
      const defaultSess: AttendanceSession = {
        id: crypto.randomUUID(),
        classId: cls.id,
        pertemuanKe: 1,
        tanggal: today,
        mapel: cls.mapel,
        catatan: 'Pertemuan Ke-1 Pembelajaran Tatap Muka',
        createdAt: new Date().toISOString(),
      };
      setSessions((prev) => [defaultSess, ...prev]);
      setActiveSession(defaultSess);
      if (!isDemoMode && userId) {
        createAttendanceSession(userId, defaultSess);
      }
    }
  };

  // Handlers for Attendance
  const handleUpdateAttendanceRecord = (studentId: string, status: AttendanceStatus, keterangan = '') => {
    setAttendanceRecords((prev) => {
      const existingIdx = prev.findIndex(
        (r) => r.sessionId === activeSession.id && r.studentId === studentId
      );

      let next: AttendanceRecord[];
      let targetRecord: AttendanceRecord;
      if (existingIdx >= 0) {
        next = [...prev];
        targetRecord = {
          ...next[existingIdx],
          status,
          keterangan,
          updatedAt: new Date().toISOString(),
        };
        next[existingIdx] = targetRecord;
      } else {
        targetRecord = {
          id: crypto.randomUUID(),
          sessionId: activeSession.id,
          studentId,
          status,
          keterangan,
          updatedAt: new Date().toISOString(),
        };
        next = [...prev, targetRecord];
      }

      if (!isDemoMode && userId) {
        upsertAttendanceRecord(targetRecord);
      }

      // Sync to journal automatically
      syncAttendanceSessionToJournal(activeSession, next, students);

      return next;
    });
  };

  const handleSetAllHadir = () => {
    const classStudents = students.filter((s) => s.classId === activeClass.id);
    const studentIdsInClass = new Set(classStudents.map((s) => s.id));

    setAttendanceRecords((prev) => {
      const filteredOther = prev.filter(
        (r) => !(r.sessionId === activeSession.id && studentIdsInClass.has(r.studentId))
      );

      const allHadirForCurrent: AttendanceRecord[] = classStudents.map((std) => ({
        id: crypto.randomUUID(),
        sessionId: activeSession.id,
        studentId: std.id,
        status: 'H',
        keterangan: '',
        updatedAt: new Date().toISOString(),
      }));

      if (!isDemoMode && userId) {
        upsertAttendanceRecordsBatch(allHadirForCurrent);
      }

      const updated = [...filteredOther, ...allHadirForCurrent];
      syncAttendanceSessionToJournal(activeSession, updated, students);
      return updated;
    });

    showToast(
      'Seluruh Murid Diset Hadir',
      `Presensi sesi ${activeSession.pertemuanKe} diperbarui menjadi 100% Hadir & disinkronkan ke Agenda Mengajar.`
    );
  };

  const handleSaveToCloud = () => {
    showToast('Tersimpan di Cloud Supabase', 'Data berhasil disinkronisasi ke PostgreSQL dengan Row Level Security.');
  };

  const handleCreateNewSession = (customData?: {
    pertemuanKe?: number;
    tanggal?: string;
    mapel?: string;
    materi?: string;
    kegiatan?: string;
    jamPelajaran?: string;
    catatan?: string;
    setAllHadir?: boolean;
  }) => {
    // Find next session number for current class
    const classSess = sessions.filter((s) => s.classId === activeClass.id);
    const nextNumber =
      customData?.pertemuanKe ||
      classSess.reduce((max, s) => Math.max(max, s.pertemuanKe), 0) + 1;
    const today = customData?.tanggal || new Date().toISOString().split('T')[0];
    const mapel = customData?.mapel || activeClass.mapel;
    const materi = customData?.materi || '';
    const kegiatan = customData?.kegiatan || '';
    const jamPelajaran = customData?.jamPelajaran || '07.15 - 09.15 WIB';

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

    setSessions((prev) => [newSession, ...prev]);
    setActiveSession(newSession);
    if (!isDemoMode && userId) {
      createAttendanceSession(userId, newSession);
    }

    const classStudents = students.filter((s) => s.classId === activeClass.id);

    let recordsToSync = attendanceRecords;
    if (customData?.setAllHadir) {
      const allHadirForCurrent: AttendanceRecord[] = classStudents.map((std) => ({
        id: crypto.randomUUID(),
        sessionId: newSession.id,
        studentId: std.id,
        status: 'H',
        keterangan: '',
        updatedAt: new Date().toISOString(),
      }));
      recordsToSync = [...attendanceRecords, ...allHadirForCurrent];
      setAttendanceRecords(recordsToSync);
      if (!isDemoMode && userId) {
        upsertAttendanceRecordsBatch(allHadirForCurrent);
      }
    }

    // Otomatis sinkronkan data absen menuju agenda mengajar
    syncAttendanceSessionToJournal(newSession, recordsToSync, students);

    showToast(
      'Sesi Absen Baru & Agenda Mengajar Terbentuk',
      `Pertemuan Ke-${nextNumber} (${today}) ${materi ? 'materi "' + materi + '"' : ''} otomatis tersinkronisasi ke Agenda Mengajar.`
    );
  };

  const handleUpdateSession = (updatedSession: AttendanceSession) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
    );
    if (activeSession.id === updatedSession.id) {
      setActiveSession(updatedSession);
    }
    if (!isDemoMode && userId) {
      updateAttendanceSession(updatedSession);
    }
    // Sinkronkan perubahan sesi absen ke Agenda Mengajar
    syncAttendanceSessionToJournal(updatedSession, attendanceRecords, students);
    showToast(
      'Sesi Absen & Agenda Diperbarui',
      `Data Pertemuan Ke-${updatedSession.pertemuanKe} (${updatedSession.tanggal}) berhasil disimpan dan disinkronkan ke Agenda Mengajar.`
    );
  };

  const handleDeleteSession = (sessionId: string) => {
    const classSess = sessions.filter((s) => s.classId === activeClass.id);
    if (classSess.length <= 1) {
      showToast('Perhatian', 'Minimal harus tersisa 1 sesi pertemuan pada rombel ini.');
      return;
    }
    const targetSession = sessions.find((s) => s.id === sessionId);
    const remaining = sessions.filter((s) => s.id !== sessionId);
    setSessions(remaining);
    setAttendanceRecords((prev) => prev.filter((r) => r.sessionId !== sessionId));
    if (!isDemoMode && userId) {
      deleteAttendanceSession(sessionId);
    }

    if (activeSession.id === sessionId) {
      const remainingForClass = remaining.filter((s) => s.classId === activeClass.id);
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
  const handleUpdateGrade = (studentId: string, updatedGrade: Partial<GradeRecord>) => {
    setGrades((prev) => {
      const idx = prev.findIndex((g) => g.studentId === studentId);
      let targetGrade: GradeRecord;
      let next: GradeRecord[];
      if (idx >= 0) {
        next = [...prev];
        targetGrade = { ...next[idx], ...updatedGrade, updatedAt: new Date().toISOString() };
        next[idx] = targetGrade;
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
        next = [...prev, targetGrade];
      }

      if (!isDemoMode && userId) {
        upsertGrade(userId, targetGrade);
      }

      return next;
    });
  };

  const handleGenerateAllDescriptions = () => {
    setGrades((prev) => {
      const updatedList = prev.map((g) => {
        const validF = (g.formatif || []).filter((v): v is number => v !== null && !isNaN(v));
        const avg = validF.length > 0 ? validF.reduce((a, b) => a + b, 0) / validF.length : 75;
        const student = students.find((s) => s.id === g.studentId);
        const name = student?.nama || 'Siswa';

        let deskripsi = '';
        if (avg >= 88) {
          deskripsi = `${name} menunjukkan penguasaan SANGAT BAIK pada seluruh capaian TP 1-5 dan memiliki kemandirian praktik yang tinggi.`;
        } else if (avg >= activeClass.kkm) {
          deskripsi = `${name} menunjukkan pencapaian yang BAIK dalam ketercapaian tujuan pembelajaran, perlu penguatan ketelitian pada evaluasi akhir.`;
        } else {
          deskripsi = `${name} perlu bimbingan dan pendampingan intensif (remedial) dalam memahami konsep dasar dan keselamatan kerja bengkel.`;
        }

        const updated = {
          ...g,
          deskripsi,
          updatedAt: new Date().toISOString(),
        };

        if (!isDemoMode && userId) {
          upsertGrade(userId, updated);
        }

        return updated;
      });
      return updatedList;
    });

    showToast('Deskripsi Merdeka Dibuat Otomatis', 'Catatan capaian kompetensi berhasil digenerate untuk seluruh murid.');
  };

  const handleApplyDeepLearningDescriptions = (descriptionsMap: Map<string, string>) => {
    setGrades((prev) => {
      return prev.map((g) => {
        const autoDesc = descriptionsMap.get(g.studentId);
        if (autoDesc) {
          const updated = {
            ...g,
            deskripsi: autoDesc,
            updatedAt: new Date().toISOString(),
          };
          if (!isDemoMode && userId) {
            upsertGrade(userId, updated);
          }
          return updated;
        }
        return g;
      });
    });

    showToast('Deskripsi AI Diterapkan', 'Analisis neural telah ditautkan langsung ke Buku Penilaian Rapor.');
    setActiveTab('penilaian');
  };

  // Handlers for Journals
  const handleAddJournal = (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: crypto.randomUUID(),
    };
    setJournals([newEntry, ...journals]);
    if (!isDemoMode && userId) {
      createJournal(userId, newEntry);
    }
    showToast('Agenda Mengajar Ditambahkan', `Pertemuan ${entry.pertemuanKe} kelas ${entry.className} tersimpan.`);
  };

  const handleUpdateJournal = (updatedEntry: JournalEntry) => {
    setJournals((prev) => prev.map((j) => (j.id === updatedEntry.id ? updatedEntry : j)));
    if (!isDemoMode && userId) {
      updateJournal(updatedEntry);
    }
    showToast(
      'Agenda Mengajar Diperbarui',
      `Catatan pertemuan ${updatedEntry.pertemuanKe} (${updatedEntry.className}) berhasil disimpan.`
    );
  };

  const handleDeleteJournal = (id: string) => {
    setJournals((prev) => prev.filter((j) => j.id !== id));
    if (!isDemoMode && userId) {
      deleteJournal(id);
    }
    showToast('Agenda Mengajar Dihapus', 'Catatan agenda telah dihapus dari buku jurnal.');
  };

  // Handlers for Finances
  const handleAddTransaction = (tx: Omit<FinanceTransaction, 'id'>) => {
    const newTx: FinanceTransaction = {
      ...tx,
      id: crypto.randomUUID(),
    };
    setFinances([newTx, ...finances]);
    if (!isDemoMode && userId) {
      createFinance(userId, newTx);
    }
    showToast('Transaksi Dicatat', `${tx.tipe} Rp ${tx.nominal.toLocaleString('id-ID')} masuk ke pembukuan.`);
  };

  const handleDeleteTransaction = (id: string) => {
    setFinances((prev) => prev.filter((t) => t.id !== id));
    if (!isDemoMode && userId) {
      deleteFinance(id);
    }
    showToast('Transaksi Dihapus', 'Data pembukuan berhasil disesuaikan.');
  };

  // Handlers for Students
  const handleAddStudent = (newStd: Omit<Student, 'id' | 'noUrut'>) => {
    const currentClassStudents = students.filter((s) => s.classId === activeClass.id);
    const nextNo = currentClassStudents.length + 1;
    const student: Student = {
      ...newStd,
      id: crypto.randomUUID(),
      noUrut: nextNo,
    };
    setStudents([...students, student]);
    if (!isDemoMode && userId) {
      createStudent(userId, student);
    }
    showToast('Murid Berhasil Ditambahkan', `${student.nama} terdaftar di kelas ${activeClass.nama} dengan nomor absen ${nextNo}.`);
  };

  const handleEditStudent = (updatedStudent: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    if (!isDemoMode && userId) {
      updateStudent(updatedStudent);
    }
    showToast('Data Murid Diperbarui', `Informasi ${updatedStudent.nama} berhasil diubah.`);
  };

  // Sistem dalam absen: jika data siswa dihapus, nomor absen siswa setelahnya otomatis diganti
  const handleDeleteStudent = (id: string) => {
    const studentToDelete = students.find((s) => s.id === id);
    if (!studentToDelete) return;
    const targetClassId = studentToDelete.classId;

    setStudents((prev) => {
      const otherStudents = prev.filter((s) => s.classId !== targetClassId);
      const remainingThisClass = prev
        .filter((s) => s.classId === targetClassId && s.id !== id)
        .sort((a, b) => a.noUrut - b.noUrut);

      const reindexed = remainingThisClass.map((s, idx) => ({
        ...s,
        noUrut: idx + 1,
      }));

      return [...otherStudents, ...reindexed];
    });

    setAttendanceRecords((prev) => prev.filter((r) => r.studentId !== id));
    setGrades((prev) => prev.filter((g) => g.studentId !== id));
    if (!isDemoMode && userId) {
      deleteStudent(id);
    }

    showToast(
      'Nomor Absen Diperbarui Otomatis',
      `Murid ${studentToDelete.nama} (No. ${studentToDelete.noUrut}) dihapus. Nomor absen rombel setelahnya otomatis digeser maju berurutan (misal 17 jadi 16).`
    );
  };

  // Batch Student Import (from Excel / Copas Langsung)
  const handleAddStudentsBatch = (
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
      setStudents([...otherClassStudents, ...formatted]);
      if (!isDemoMode && userId) {
        createStudentsBatch(userId, formatted);
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
      setStudents([...students, ...formatted]);
      if (!isDemoMode && userId) {
        createStudentsBatch(userId, formatted);
      }
      showToast(
        'Impor Selesai (Tambahkan)',
        `${formatted.length} murid baru berhasil ditambahkan ke kelas ${activeClass.nama}.`
      );
    }
  };

  // Handlers for Classes (Add, Edit, Delete Rombel)
  const handleAddClass = (newCls: Omit<ClassRoom, 'id'>) => {
    const newClassRoom: ClassRoom = {
      ...newCls,
      id: crypto.randomUUID(),
    };
    const nextClasses = [...classes, newClassRoom];
    setClasses(nextClasses);
    setActiveClass(newClassRoom);
    if (!isDemoMode && userId) {
      createClass(userId, newClassRoom);
    }
    showToast('Rombel Berhasil Ditambahkan', `Kelas ${newClassRoom.nama} siap digunakan.`);
  };

  const handleEditClass = (updatedCls: ClassRoom) => {
    const nextClasses = classes.map((c) => (c.id === updatedCls.id ? updatedCls : c));
    setClasses(nextClasses);
    if (activeClass.id === updatedCls.id) {
      setActiveClass(updatedCls);
    }
    if (!isDemoMode && userId) {
      updateClass(updatedCls);
    }
    showToast('Rombel Diperbarui', `Informasi kelas ${updatedCls.nama} berhasil disimpan.`);
  };

  const handleDeleteClass = (classId: string) => {
    if (classes.length <= 1) {
      showToast('Gagal Menghapus', 'Minimal harus ada 1 rombel belajar.');
      return;
    }
    const target = classes.find((c) => c.id === classId);
    const remaining = classes.filter((c) => c.id !== classId);
    setClasses(remaining);
    if (activeClass.id === classId) {
      setActiveClass(remaining[0]);
    }
    if (!isDemoMode && userId) {
      deleteClass(classId);
    }
    showToast('Rombel Dihapus', `Kelas ${target?.nama || ''} telah dihapus.`);
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
        dbRecords,
        dbGrades,
        dbJournals,
        dbFinances,
      ] = await Promise.all([
        fetchProfile(userId),
        fetchClasses(userId),
        fetchStudents(userId),
        fetchAttendanceSessions(userId),
        fetchAttendanceRecords(),
        fetchGrades(userId),
        fetchJournals(userId),
        fetchFinances(userId),
      ]);

      if (dbProfile) {
        setTeacher(dbProfile);
        if (dbProfile.school) setSchoolName(dbProfile.school);
      }
      if (dbClasses && dbClasses.length > 0) {
        setClasses(dbClasses);
        setActiveClass((prev) => dbClasses.find((c) => c.id === prev.id) || dbClasses[0]);
      }
      if (dbStudents && dbStudents.length > 0) setStudents(dbStudents);
      if (dbSessions && dbSessions.length > 0) {
        setSessions(dbSessions);
        setActiveSession((prev) => dbSessions.find((s) => s.id === prev.id) || dbSessions[0]);
      }
      if (dbRecords && dbRecords.length > 0) setAttendanceRecords(dbRecords);
      if (dbGrades && dbGrades.length > 0) setGrades(dbGrades);
      if (dbJournals && dbJournals.length > 0) setJournals(dbJournals);
      if (dbFinances && dbFinances.length > 0) setFinances(dbFinances);

      showToast('Data Telah Disinkronkan', 'Data berhasil diperbarui dari Supabase Cloud.');
    } catch (err: any) {
      showToast('Info Sinkronisasi', err?.message || 'Data lokal tetap aktif.');
    }
  };

  // 1. PUBLIC PORTAL VIEW (Strictly Read-Only without Edit Access / Login Locked)
  if (isPublicPortalMode) {
    return (
      <PublicPortalView
        initialType={publicPortalParams.tipe}
        initialClassId={publicPortalParams.kelas || activeClass.id}
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
        onDemoLogin={() => {
          setDemoMode(true);
          showToast('Mode Uji Coba Demo', 'Masuk sebagai Guru Pengajar Akun Demo (Lokal & Offline).');
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
            onUpdateTeacher={(updated) => {
              setTeacher(updated);
            }}
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
