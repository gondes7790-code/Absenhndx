export type AttendanceStatus = 'H' | 'S' | 'I' | 'A' | 'D';

export interface Student {
  id: string;
  nisn: string;
  noUrut: number;
  nama: string;
  gender: 'L' | 'P';
  classId: string;
  kontakOrtu: string;
  catatan?: string;
}

export interface ClassRoom {
  id: string;
  nama: string;
  tingkat: string;
  jurusan: string;
  tahunAjaran: string;
  semester: 'Ganjil' | 'Genap';
  mapel: string;
  kkm: number;
  formatifCount: number;
  tpTitles?: Record<number, string>;
}

export interface AttendanceSession {
  id: string;
  classId: string;
  pertemuanKe: number;
  tanggal: string; // YYYY-MM-DD
  mapel: string;
  materi?: string;
  kegiatan?: string;
  jamPelajaran?: string;
  catatan?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  keterangan: string;
  updatedAt: string;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  classId: string;
  formatif: (number | null)[];
  sts: number | null;
  sas: number | null;
  deskripsi: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  tanggal: string;
  pendidik: string;
  mapel: string;
  classId: string;
  className: string;
  pertemuanKe: number;
  jamPelajaran: string;
  materiKegiatan: string;
  materi?: string;
  kegiatan?: string;
  absensiCatatan: string;
  semester: string;
}

export interface FinanceTransaction {
  id: string;
  tanggal: string;
  classId: string;
  tipe: 'Pemasukan' | 'Pengeluaran';
  kategori: 'Kas Kelas' | 'Tabungan Siswa';
  keterangan: string;
  nominal: number;
  pencatat: string;
  studentId?: string;
  studentName?: string;
}

export interface TeacherProfile {
  name: string;
  email: string;
  nip: string;
  nuptk?: string;
  school: string;
  handle: string;
  phone?: string;
  mapelUtama?: string;
  bio?: string;
  statusKepegawaian?: string;
  jabatan?: string;
}

/**
 * Hasil Risk Scoring siswa (heuristik client-side, bukan model machine learning).
 */
export interface RiskPrediction {
  studentId: string;
  studentName: string;
  nisn: string;
  riskScore: number; // 0 to 100
  riskLevel: 'Aman' | 'Rendah' | 'Sedang' | 'Tinggi';
  predictedFinalGrade: number;
  predictedAttendanceRate: number;
  dropoutRiskPercent: number;
  remedialRiskPercent: number;
  featureWeights: {
    attendanceConsistency: number;
    formatifMomentum: number;
    varianceRisk: number;
    unexcusedAbsencePenalty: number;
  };
  keyFactors: string[];
  suggestedAction: string;
  autoReportDescription: string;
}

export interface AuthSession {
  user: TeacherProfile;
  token: string;
  expiresAt: string;
  provider: 'supabase-pg-auth';
}

export type ActiveTab = 
  | 'presensi' 
  | 'rekap' 
  | 'penilaian' 
  | 'murid' 
  | 'jurnal' 
  | 'keuangan' 
  | 'statistik' 
  | 'risiko' 
  | 'profil'
  | 'supabase';

export interface PrintConfig {
  dinasHeader: string;
  dinasSubHeader: string;
  schoolName: string;
  unitSubHeader?: string;
  address: string;
  phone: string;
  emailWeb: string;
  logoEmbedCode: string; // URL gambar saja (https://... atau data:image preset internal); nama field dipertahankan demi data lama
  logoPosition: 'left' | 'right' | 'both';
  showTutWuriLogo: boolean;
  principalName: string;
  principalNip: string;
  documentCity: string;
  customDateText?: string;
  borderStyle: 'double' | 'solid' | 'thick';
  footerNote: string;
}


/** Data formulir "Buat Sesi Absen Baru". */
export interface NewSessionInput {
  pertemuanKe?: number;
  tanggal?: string;
  mapel?: string;
  materi?: string;
  kegiatan?: string;
  jamPelajaran?: string;
  catatan?: string;
  setAllHadir?: boolean;
}
