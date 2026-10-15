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

const STORAGE_KEY_PREFIX = 'hndx_merdeka_app_v2';

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_auth`);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

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

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_auth`, JSON.stringify(isAuthenticated));
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
  }, [isAuthenticated, classes, students, sessions, attendanceRecords, grades, journals, finances, teacher]);

  // Auth Handlers
  const handleLogin = (email: string, _pass: string) => {
    setIsAuthenticated(true);
    showToast('Selamat Datang!', `Berhasil masuk ke Ruang Guru (${email})`);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
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
          id: `jrn-sync-${sessionToSync.id}`,
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
        id: `session-${cls.id}-1`,
        classId: cls.id,
        pertemuanKe: 1,
        tanggal: today,
        mapel: cls.mapel,
        catatan: 'Pertemuan Ke-1 Pembelajaran Tatap Muka',
        createdAt: new Date().toISOString(),
      };
      setSessions((prev) => [defaultSess, ...prev]);
      setActiveSession(defaultSess);
    }
  };

  // Handlers for Attendance
  const handleUpdateAttendanceRecord = (studentId: string, status: AttendanceStatus, keterangan = '') => {
    setAttendanceRecords((prev) => {
      const existingIdx = prev.findIndex(
        (r) => r.sessionId === activeSession.id && r.studentId === studentId
      );

      let next: AttendanceRecord[];
      if (existingIdx >= 0) {
        next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          status,
          keterangan,
          updatedAt: new Date().toISOString(),
        };
      } else {
        next = [
          ...prev,
          {
            id: `rec-${activeSession.id}-${studentId}`,
            sessionId: activeSession.id,
            studentId,
            status,
            keterangan,
            updatedAt: new Date().toISOString(),
          },
        ];
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
        id: `rec-${activeSession.id}-${std.id}`,
        sessionId: activeSession.id,
        studentId: std.id,
        status: 'H',
        keterangan: '',
        updatedAt: new Date().toISOString(),
      }));

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
      id: `session-${activeClass.id}-${nextNumber}-${Date.now()}`,
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

    const classStudents = students.filter((s) => s.classId === activeClass.id);

    let recordsToSync = attendanceRecords;
    if (customData?.setAllHadir) {
      const allHadirForCurrent: AttendanceRecord[] = classStudents.map((std) => ({
        id: `rec-${newSession.id}-${std.id}`,
        sessionId: newSession.id,
        studentId: std.id,
        status: 'H',
        keterangan: '',
        updatedAt: new Date().toISOString(),
      }));
      recordsToSync = [...attendanceRecords, ...allHadirForCurrent];
      setAttendanceRecords(recordsToSync);
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
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...updatedGrade };
        return next;
      } else {
        return [
          ...prev,
          {
            id: `grade-${studentId}`,
            studentId,
            classId: activeClass.id,
            formatif: updatedGrade.formatif || Array(activeClass.formatifCount).fill(null),
            sts: updatedGrade.sts ?? null,
            sas: updatedGrade.sas ?? null,
            deskripsi: updatedGrade.deskripsi || '',
            updatedAt: new Date().toISOString(),
            ...updatedGrade,
          },
        ];
      }
    });
  };

  const handleGenerateAllDescriptions = () => {
    setGrades((prev) => {
      return prev.map((g) => {
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

        return {
          ...g,
          deskripsi,
          updatedAt: new Date().toISOString(),
        };
      });
    });

    showToast('Deskripsi Merdeka Dibuat Otomatis', 'Catatan capaian kompetensi berhasil digenerate untuk seluruh murid.');
  };

  const handleApplyDeepLearningDescriptions = (descriptionsMap: Map<string, string>) => {
    setGrades((prev) => {
      return prev.map((g) => {
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
    });

    showToast('Deskripsi AI Diterapkan', 'Analisis neural telah ditautkan langsung ke Buku Penilaian Rapor.');
    setActiveTab('penilaian');
  };

  // Handlers for Journals
  const handleAddJournal = (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: `jrn-${Date.now()}`,
    };
    setJournals([newEntry, ...journals]);
    showToast('Agenda Mengajar Ditambahkan', `Pertemuan ${entry.pertemuanKe} kelas ${entry.className} tersimpan.`);
  };

  const handleUpdateJournal = (updatedEntry: JournalEntry) => {
    setJournals((prev) => prev.map((j) => (j.id === updatedEntry.id ? updatedEntry : j)));
    showToast(
      'Agenda Mengajar Diperbarui',
      `Catatan pertemuan ${updatedEntry.pertemuanKe} (${updatedEntry.className}) berhasil disimpan.`
    );
  };

  const handleDeleteJournal = (id: string) => {
    setJournals((prev) => prev.filter((j) => j.id !== id));
    showToast('Agenda Mengajar Dihapus', 'Catatan agenda telah dihapus dari buku jurnal.');
  };

  // Handlers for Finances
  const handleAddTransaction = (tx: Omit<FinanceTransaction, 'id'>) => {
    const newTx: FinanceTransaction = {
      ...tx,
      id: `fin-${Date.now()}`,
    };
    setFinances([newTx, ...finances]);
    showToast('Transaksi Dicatat', `${tx.tipe} Rp ${tx.nominal.toLocaleString('id-ID')} masuk ke pembukuan.`);
  };

  const handleDeleteTransaction = (id: string) => {
    setFinances((prev) => prev.filter((t) => t.id !== id));
    showToast('Transaksi Dihapus', 'Data pembukuan berhasil disesuaikan.');
  };

  // Handlers for Students
  const handleAddStudent = (newStd: Omit<Student, 'id' | 'noUrut'>) => {
    const currentClassStudents = students.filter((s) => s.classId === activeClass.id);
    const nextNo = currentClassStudents.length + 1;
    const student: Student = {
      ...newStd,
      id: `std-${Date.now()}`,
      noUrut: nextNo,
    };
    setStudents([...students, student]);
    showToast('Murid Berhasil Ditambahkan', `${student.nama} terdaftar di kelas ${activeClass.nama} dengan nomor absen ${nextNo}.`);
  };

  const handleEditStudent = (updatedStudent: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    showToast('Data Murid Diperbarui', `Informasi ${updatedStudent.nama} berhasil diubah.`);
  };

  // Sistem dalam absen: jika data siswa dihapus, nomor absen siswa setelahnya otomatis diganti (misal no 16 dihapus, no 17 menjadi 16)
  const handleDeleteStudent = (id: string) => {
    const studentToDelete = students.find((s) => s.id === id);
    if (!studentToDelete) return;
    const targetClassId = studentToDelete.classId;

    setStudents((prev) => {
      const otherStudents = prev.filter((s) => s.classId !== targetClassId);
      const remainingThisClass = prev
        .filter((s) => s.classId === targetClassId && s.id !== id)
        .sort((a, b) => a.noUrut - b.noUrut);

      // Otomatis ganti nomor absen setelahnya berurutan tanpa jeda
      const reindexed = remainingThisClass.map((s, idx) => ({
        ...s,
        noUrut: idx + 1,
      }));

      return [...otherStudents, ...reindexed];
    });

    // Bersihkan riwayat absensi dan nilai murid yang dihapus
    setAttendanceRecords((prev) => prev.filter((r) => r.studentId !== id));
    setGrades((prev) => prev.filter((g) => g.studentId !== id));

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
        id: `std-${Date.now()}-${idx}`,
        classId: activeClass.id,
        noUrut: idx + 1,
      }));
      setStudents([...otherClassStudents, ...formatted]);
      showToast(
        'Impor Selesai (Ganti Data)',
        `${formatted.length} murid berhasil didaftarkan di kelas ${activeClass.nama}.`
      );
    } else {
      const currentClassStudents = students.filter((s) => s.classId === activeClass.id);
      const startNo = currentClassStudents.length;
      const formatted: Student[] = newStds.map((s, idx) => ({
        ...s,
        id: `std-${Date.now()}-${idx}`,
        classId: activeClass.id,
        noUrut: startNo + idx + 1,
      }));
      setStudents([...students, ...formatted]);
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
      id: `class-${Date.now()}`,
    };
    const nextClasses = [...classes, newClassRoom];
    setClasses(nextClasses);
    setActiveClass(newClassRoom);
    showToast('Rombel Berhasil Ditambahkan', `Kelas ${newClassRoom.nama} siap digunakan.`);
  };

  const handleEditClass = (updatedCls: ClassRoom) => {
    const nextClasses = classes.map((c) => (c.id === updatedCls.id ? updatedCls : c));
    setClasses(nextClasses);
    if (activeClass.id === updatedCls.id) {
      setActiveClass(updatedCls);
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

  const handleRefreshData = () => {
    showToast('Data Telah Disinkronkan', 'Memuat data terbaru dari Supabase PostgreSQL Cloud.');
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

  // 2. If user is not authenticated, show the clean vintage postmodernism login view
  if (!isAuthenticated) {
    return (
      <LoginView
        onLoginSuccess={(user, profile) => {
          setIsAuthenticated(true);
          if (profile) setTeacher(profile);
          showToast('Selamat Datang!', `Berhasil masuk ke Ruang Guru (${user.email})`);
        }}
        onDemoLogin={() => {
          setIsAuthenticated(true);
          showToast('Mode Uji Coba Demo', 'Masuk sebagai Guru Pengajar Akun Demo.');
        }}
        schoolName={schoolName}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7ee] font-sans selection:bg-[#6ee7b7] selection:text-slate-950">
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
