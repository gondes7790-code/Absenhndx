import {
  Student,
  ClassRoom,
  AttendanceSession,
  AttendanceRecord,
  GradeRecord,
  JournalEntry,
  FinanceTransaction,
  TeacherProfile,
} from '../types';

export const initialTeacher: TeacherProfile = {
  name: 'Hendra Setiawan, S. Pd.',
  email: 'hendrasetiawan72@guru.smk.belajar.id',
  nip: '19870415 201201 1 003',
  nuptk: '4351 7656 6720 0012',
  school: 'Hadir!',
  handle: '@hndx07',
  phone: '0812-3456-7890',
  mapelUtama: 'Teknik Otomotif & Bahasa Inggris Vokasi',
  bio: 'Pendidik Produktif Kejuruan & Koordinator Kurikulum Merdeka. Berdedikasi dalam implementasi asesmen formatif adaptif dan presensi presisi.',
};

export const INITIAL_CLASS_IDS = {
  class1: 'e7b0a82b-6c47-4952-b883-7c87c92b0e01',
  class2: 'f1c4e9d2-3a58-4b71-9c60-8d9e1f2a3b02',
  class3: 'a2b3c4d5-e6f7-48a9-b0c1-d2e3f4a5b603',
  class4: 'b3c4d5e6-f7a8-49b0-c1d2-e3f4a5b6c704',
  class5: 'c4d5e6f7-a8b9-40c1-d2e3-f4a5b6c7d805',
};

export const initialClasses: ClassRoom[] = [
  {
    id: INITIAL_CLASS_IDS.class1,
    nama: 'X TO 4 - Absen Harian',
    tingkat: 'X',
    jurusan: 'Teknik Otomotif',
    tahunAjaran: '2026/2027',
    semester: 'Ganjil',
    mapel: 'Absen Harian & Kejuruan',
    kkm: 75,
    formatifCount: 5,
  },
  {
    id: INITIAL_CLASS_IDS.class2,
    nama: 'XII TJAT 1',
    tingkat: 'XII',
    jurusan: 'Teknik Jaringan Akses Telekomunikasi',
    tahunAjaran: '2026/2027',
    semester: 'Ganjil',
    mapel: 'Bahasa Inggris',
    kkm: 75,
    formatifCount: 5,
  },
  {
    id: INITIAL_CLASS_IDS.class3,
    nama: 'XII TKJ 1',
    tingkat: 'XII',
    jurusan: 'Teknik Komputer dan Jaringan',
    tahunAjaran: '2026/2027',
    semester: 'Ganjil',
    mapel: 'Administrasi Infrastruktur Jaringan',
    kkm: 78,
    formatifCount: 5,
  },
  {
    id: INITIAL_CLASS_IDS.class4,
    nama: 'XII TJAT 2',
    tingkat: 'XII',
    jurusan: 'Teknik Jaringan Akses Telekomunikasi',
    tahunAjaran: '2026/2027',
    semester: 'Ganjil',
    mapel: 'Bahasa Inggris',
    kkm: 75,
    formatifCount: 5,
  },
  {
    id: INITIAL_CLASS_IDS.class5,
    nama: 'XII TKJ 3',
    tingkat: 'XII',
    jurusan: 'Teknik Komputer dan Jaringan',
    tahunAjaran: '2026/2027',
    semester: 'Ganjil',
    mapel: 'Bahasa Inggris',
    kkm: 75,
    formatifCount: 5,
  },
];

export const INITIAL_STUDENT_IDS: string[] = [
  '20000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000002',
  '20000000-0000-4000-8000-000000000003',
  '20000000-0000-4000-8000-000000000004',
  '20000000-0000-4000-8000-000000000005',
  '20000000-0000-4000-8000-000000000006',
  '20000000-0000-4000-8000-000000000007',
  '20000000-0000-4000-8000-000000000008',
  '20000000-0000-4000-8000-000000000009',
  '20000000-0000-4000-8000-000000000010',
  '20000000-0000-4000-8000-000000000011',
  '20000000-0000-4000-8000-000000000012',
  '20000000-0000-4000-8000-000000000013',
  '20000000-0000-4000-8000-000000000014',
  '20000000-0000-4000-8000-000000000015',
  '20000000-0000-4000-8000-000000000016',
  '20000000-0000-4000-8000-000000000017',
  '20000000-0000-4000-8000-000000000018',
  '20000000-0000-4000-8000-000000000019',
  '20000000-0000-4000-8000-000000000020',
  '20000000-0000-4000-8000-000000000021',
  '20000000-0000-4000-8000-000000000022',
  '20000000-0000-4000-8000-000000000023',
  '20000000-0000-4000-8000-000000000024',
  '20000000-0000-4000-8000-000000000025',
  '20000000-0000-4000-8000-000000000026',
  '20000000-0000-4000-8000-000000000027',
  '20000000-0000-4000-8000-000000000028',
  '20000000-0000-4000-8000-000000000029',
  '20000000-0000-4000-8000-000000000030',
  '20000000-0000-4000-8000-000000000031',
  '20000000-0000-4000-8000-000000000032',
  '20000000-0000-4000-8000-000000000033',
];

const RAW_STUDENT_NAMES: { nama: string; nisn: string; kontakOrtu: string; catatan: string }[] = [
  { nama: 'ADHITYA WAHYU PRADANA', nisn: '0081234001', kontakOrtu: '628123456701', catatan: 'Aktif, tertib, disiplin di bengkel' },
  { nama: 'AHMAD ARIF FEBRIAN', nisn: '0081234002', kontakOrtu: '628123456702', catatan: 'Kehadiran konsisten 100%' },
  { nama: 'AHMAD REZA SAPUTRA', nisn: '0081234003', kontakOrtu: '628123456703', catatan: 'Perlu peningkatan motivasi belajar mandiri' },
  { nama: 'AKHMAD NAUFAL FIRMANDHA', nisn: '0081234004', kontakOrtu: '628123456704', catatan: 'Bagus dalam praktik mesin 2-tak' },
  { nama: 'ALWAN PERMANA NURRAKHMAN', nisn: '0081234005', kontakOrtu: '628123456705', catatan: 'Sering izin keperluan keluarga' },
  { nama: 'ANDHIKA PRATAMA', nisn: '0081234006', kontakOrtu: '628123456706', catatan: 'Bagus di tes teori otomotif' },
  { nama: 'ARDIAN INDRA MAULANA', nisn: '0081234007', kontakOrtu: '628123456707', catatan: 'Sakit flu musiman' },
  { nama: 'ATA AUFA ARZY APRIYANTO', nisn: '0081234008', kontakOrtu: '628123456708', catatan: 'Ketua kelompok diskusi' },
  { nama: 'BIMA RADITYA', nisn: '0081234009', kontakOrtu: '628123456709', catatan: 'Cekatan dalam pemeliharaan kelistrikan' },
  { nama: 'DANIYAL ARFA ABRISAM', nisn: '0081234010', kontakOrtu: '628123456710', catatan: 'Kerap membantu teman yang kesulitan' },
  { nama: 'DHAVIN AZKHER MUKHARAM', nisn: '0081234011', kontakOrtu: '628123456711', catatan: 'Perlu bimbingan pemahaman konseptual' },
  { nama: 'DUWI KHOIRUL ROZAK', nisn: '0081234012', kontakOrtu: '628123456712', catatan: 'Perlu dorongan aktif bertanya' },
  { nama: 'ENGGAR RADITYA PRATAMA', nisn: '0081234013', kontakOrtu: '628123456713', catatan: 'Perhatian fokus pada proyek bengkel' },
  { nama: 'FAIZA KHOIRUL FAHMI', nisn: '0081234014', kontakOrtu: '628123456714', catatan: 'Tertib administrasi tugas' },
  { nama: 'FURQON NURJATI', nisn: '0081234015', kontakOrtu: '628123456715', catatan: 'Cepat dalam merangkai sirkuit' },
  { nama: 'HAMZAH FANSURI', nisn: '0081234016', kontakOrtu: '628123456716', catatan: 'Kemampuan analisis logis baik' },
  { nama: 'IMUNG SEPTIANTO', nisn: '0081234017', kontakOrtu: '628123456717', catatan: 'Disiplin waktu dan kehadiran' },
  { nama: 'KHAMDAN NI\'AMILLAH', nisn: '0081234018', kontakOrtu: '628123456718', catatan: 'Aktif mengajukan pertanyaan kritis' },
  { nama: 'M. ALIF ZANDIANSYAH', nisn: '0081234019', kontakOrtu: '628123456719', catatan: 'Sangat teliti dalam pembacaan jangka sorong' },
  { nama: 'MOHAMMAD RIFKI', nisn: '0081234020', kontakOrtu: '628123456720', catatan: 'Kehadiran stabil, nilai memuaskan' },
  { nama: 'MUHAMMAD FARHAN', nisn: '0081234021', kontakOrtu: '628123456721', catatan: 'Penguasaan materi dasar tuntas' },
  { nama: 'MUHAMMAD ILHAM', nisn: '0081234022', kontakOrtu: '628123456722', catatan: 'Rapi dalam laporan portofolio kerja' },
  { nama: 'MUHAMMAD NUR RIZKI', nisn: '0081234023', kontakOrtu: '628123456723', catatan: 'Senang bereksperimen dengan tuning mesin' },
  { nama: 'NAUVAL DAFFA AL-KAUTSAR', nisn: '0081234024', kontakOrtu: '628123456724', catatan: 'Kemampuan komunikasi kelompok unggul' },
  { nama: 'RADITYA BAGAS KURNIAWAN', nisn: '0081234025', kontakOrtu: '628123456725', catatan: 'Konsisten menyelesaikan tugas tepat waktu' },
  { nama: 'RANGGA ADITYA PRANATA', nisn: '0081234026', kontakOrtu: '628123456726', catatan: 'Semangat belajar tinggi' },
  { nama: 'REVALDO SAPUTRA', nisn: '0081234027', kontakOrtu: '628123456727', catatan: 'Perlu pengawasan saat jam praktik mandiri' },
  { nama: 'RIFKI SETIAWAN', nisn: '0081234028', kontakOrtu: '628123456728', catatan: 'Tuntas pada seluruh sumatif' },
  { nama: 'RIZKY RAMADHAN', nisn: '0081234029', kontakOrtu: '628123456729', catatan: 'Hadir tepat waktu setiap sesi' },
  { nama: 'SATRIA BAGUS PAMUNGKAS', nisn: '0081234030', kontakOrtu: '628123456730', catatan: 'Performa uji kompetensi baik' },
  { nama: 'SEPTIAN DWI CAHYO', nisn: '0081234031', kontakOrtu: '628123456731', catatan: 'Aktif berkolaborasi dalam tim' },
  { nama: 'TEGAR PRATAMA YUDA', nisn: '0081234032', kontakOrtu: '628123456732', catatan: 'Keterampilan mekanik presisi tinggi' },
  { nama: 'YUDA PRATAMA KUSUMA', nisn: '0081234033', kontakOrtu: '628123456733', catatan: 'Sangat teliti dalam keselamatan K3' },
];

export const initialStudents: Student[] = RAW_STUDENT_NAMES.map((s, idx) => ({
  id: INITIAL_STUDENT_IDS[idx],
  nisn: s.nisn,
  noUrut: idx + 1,
  nama: s.nama,
  gender: 'L',
  classId: INITIAL_CLASS_IDS.class1,
  kontakOrtu: s.kontakOrtu,
  catatan: s.catatan,
}));

export const INITIAL_SESSION_IDS = {
  session44: '30000000-0000-4000-8000-000000000044',
  session43: '30000000-0000-4000-8000-000000000043',
  session42: '30000000-0000-4000-8000-000000000042',
  session41: '30000000-0000-4000-8000-000000000041',
};

export const initialSessions: AttendanceSession[] = [
  {
    id: INITIAL_SESSION_IDS.session44,
    classId: INITIAL_CLASS_IDS.class1,
    pertemuanKe: 44,
    tanggal: '2026-10-12',
    mapel: 'Absen Harian & Pemeliharaan Sistem',
    catatan: 'Pertemuan sesi pagi, evaluasi keselamatan kerja bengkel',
    createdAt: '2026-10-12T07:00:00Z',
  },
  {
    id: INITIAL_SESSION_IDS.session43,
    classId: INITIAL_CLASS_IDS.class1,
    pertemuanKe: 43,
    tanggal: '2026-10-10',
    mapel: 'Sistem Injeksi Otomotif',
    catatan: 'Pengujian scanner OBD-II dan pembacaan fault code',
    createdAt: '2026-10-10T07:00:00Z',
  },
  {
    id: INITIAL_SESSION_IDS.session42,
    classId: INITIAL_CLASS_IDS.class1,
    pertemuanKe: 42,
    tanggal: '2026-10-08',
    mapel: 'Kelistrikan Bodi',
    catatan: 'Praktik perakitan lampu kepala dan relay',
    createdAt: '2026-10-08T07:00:00Z',
  },
  {
    id: INITIAL_SESSION_IDS.session41,
    classId: INITIAL_CLASS_IDS.class1,
    pertemuanKe: 41,
    tanggal: '2026-10-05',
    mapel: 'Sistem Rem ABS',
    catatan: 'Bleeding hidrolik dan pengujian sensor kecepatan roda',
    createdAt: '2026-10-05T07:00:00Z',
  },
];

// Generate attendance records for session 44 with full UUID format
export const initialAttendanceRecords: AttendanceRecord[] = initialStudents.map((std, idx) => {
  let status: 'H' | 'S' | 'I' | 'A' | 'D' = 'H';
  let keterangan = '';

  if (std.id === INITIAL_STUDENT_IDS[4]) {
    status = 'I';
    keterangan = 'Izin ada keperluan keluarga di luar kota';
  } else if (std.id === INITIAL_STUDENT_IDS[6]) {
    status = 'S';
    keterangan = 'Sakit flu demam (surat dokter terlampir)';
  } else if (std.id === INITIAL_STUDENT_IDS[3]) {
    status = 'A';
    keterangan = 'Tanpa keterangan resmi';
  }

  const hexSuffix = String(idx + 1).padStart(12, '0');
  return {
    id: `40000000-0044-4000-8000-${hexSuffix}`,
    sessionId: INITIAL_SESSION_IDS.session44,
    studentId: std.id,
    status,
    keterangan,
    updatedAt: '2026-10-12T07:30:00Z',
  };
});

// Initial grades reflecting Kurikulum Merdeka with full UUID format
export const initialGrades: GradeRecord[] = initialStudents.map((std, idx) => {
  let formatif: (number | null)[] = [85, 88, 90, 84, 86];
  let sts: number | null = 86;
  let sas: number | null = 88;

  if (idx === 0) {
    formatif = [75, 78, 70, 72, 70];
    sts = 72;
    sas = 68;
  } else if (idx === 3) {
    formatif = [45, 40, 42, 38, 40];
    sts = 40;
    sas = 40;
  } else if (idx === 4) {
    formatif = [20, 18, 22, 15, 18];
    sts = 18;
    sas = 18;
  } else if (idx === 5) {
    formatif = [42, 40, 45, 38, 40];
    sts = 40;
    sas = 40;
  } else if (idx === 6 || idx === 7 || idx === 8 || idx === 9) {
    formatif = [60, 58, 62, 55, 58];
    sts = 58;
    sas = 58;
  } else if (idx >= 10 && idx <= 12) {
    formatif = [28, 25, 30, 22, 25];
    sts = 25;
    sas = 25;
  } else if (idx % 3 === 0) {
    formatif = [92, 95, 94, 90, 96];
    sts = 94;
    sas = 95;
  } else if (idx % 2 === 0) {
    formatif = [82, 85, 80, 84, 86];
    sts = 85;
    sas = 82;
  }

  const avg = formatif.filter((v): v is number => v !== null).reduce((a, b) => a + b, 0) / (formatif.length || 1);
  let deskripsi = '';
  if (avg >= 85) {
    deskripsi = `Menunjukkan pemahaman sangat unggul dalam TP 1-3 serta mahir mengaplikasikan keselamatan kerja bengkel secara mandiri.`;
  } else if (avg >= 75) {
    deskripsi = `Menunjukkan pencapaian kompetensi yang baik pada sebagian besar tujuan pembelajaran, perlu penguatan lanjutan pada TP 4.`;
  } else {
    deskripsi = `Perlu bimbingan dan pendampingan intensif (remedial) dalam pemahaman konseptual dan praktik kerja TP 1 - TP 5.`;
  }

  const hexSuffix = String(idx + 1).padStart(12, '0');
  return {
    id: `50000000-0000-4000-8000-${hexSuffix}`,
    studentId: std.id,
    classId: INITIAL_CLASS_IDS.class1,
    formatif,
    sts,
    sas,
    deskripsi: `${std.nama} ${deskripsi}`,
    updatedAt: '2026-10-12T08:00:00Z',
  };
});

export const initialJournals: JournalEntry[] = [
  {
    id: '60000000-0000-4000-8000-000000000001',
    tanggal: '2026-10-12',
    pendidik: 'Hendra Setiawan, S. Pd.',
    mapel: 'Bahasa Inggris',
    classId: INITIAL_CLASS_IDS.class2,
    className: 'XII TJAT 1',
    pertemuanKe: 'Ke-10',
    jamPelajaran: '13:00 - 13:40 WIB',
    materiKegiatan: 'Latihan Soal TKA: Drill soal TKA Kemendikbudristek Bahasa Inggris & Analisis Teks Prosedural Teknik.',
    absensiCatatan: 'Tidak hadir: ALWAN PERMANA NURRAKHMAN (Izin), ARDIAN INDRA MAULANA (Sakit), NAYAKA PRAMUDYA (Alpa), DWIREZA ERLANGGA WIDODO (Alpa).',
    semester: 'Ganjil',
  },
  {
    id: '60000000-0000-4000-8000-000000000002',
    tanggal: '2026-10-12',
    pendidik: 'Hendra Setiawan, S. Pd.',
    mapel: 'Bahasa Inggris',
    classId: INITIAL_CLASS_IDS.class2,
    className: 'XII TJAT 1',
    pertemuanKe: 'Ke-1 - 4',
    jamPelajaran: '07:15 - 09:15 WIB',
    materiKegiatan: 'Latihan Soal TKA: Drill soal TKA Kemendikbudristek Bahasa Inggris bagian Reading Comprehension.',
    absensiCatatan: 'Tidak hadir: ALFAT (Alpa), BILQISA TISNAWATI (Alpa), MUHAMMAD NUR (Alpa).',
    semester: 'Ganjil',
  },
  {
    id: '60000000-0000-4000-8000-000000000003',
    tanggal: '2026-10-12',
    pendidik: 'Hendra Setiawan, S. Pd.',
    mapel: 'Bahasa Inggris',
    classId: INITIAL_CLASS_IDS.class5,
    className: 'XII TKJ 3',
    pertemuanKe: 'Ke-5 - 6',
    jamPelajaran: '09:30 - 10:30 WIB',
    materiKegiatan: 'Latihan Soal TKA Kemendikbudristek: Struktur Grammar Bahasa Inggris Teknik.',
    absensiCatatan: 'Tidak hadir: MUHAMMAD SATRIA BIMA PRASETYO (Alpa).',
    semester: 'Ganjil',
  },
  {
    id: '60000000-0000-4000-8000-000000000004',
    tanggal: '2026-10-12',
    pendidik: 'Hendra Setiawan, S. Pd.',
    mapel: 'Bahasa Inggris',
    classId: INITIAL_CLASS_IDS.class3,
    className: 'XII TKJ 1',
    pertemuanKe: 'Ke-7 - 8',
    jamPelajaran: '10:30 - 11:30 WIB',
    materiKegiatan: 'Latihan Soal TKA Kemendikbudristek: Drill listening & dialog kontekstual kejuruan.',
    absensiCatatan: 'Tidak hadir: FIRLI LISKA INDRIYANI (Izin), HIDAYATULLATIFAH (Sakit), SHINTA NURUL (Sakit).',
    semester: 'Ganjil',
  },
  {
    id: '60000000-0000-4000-8000-000000000005',
    tanggal: '2026-10-08',
    pendidik: 'Hendra Setiawan, S. Pd.',
    mapel: 'Bahasa Inggris',
    classId: INITIAL_CLASS_IDS.class4,
    className: 'XII TJAT 2',
    pertemuanKe: 'Ke-1 - 4',
    jamPelajaran: '07:15 - 09:15 WIB',
    materiKegiatan: 'Drill soal TKA Kemendikbudristek Bahasa Inggris & Penguatan Kosakata Vokasi.',
    absensiCatatan: 'Tidak hadir: AKHMAD SUBEKHI (Sakit), ERFIANI BELA PRATIWI (Sakit), GESYA GAFIN (Alpa).',
    semester: 'Ganjil',
  },
];

export const initialFinances: FinanceTransaction[] = [
  {
    id: '70000000-0000-4000-8000-000000000001',
    tanggal: '2026-10-12',
    classId: INITIAL_CLASS_IDS.class1,
    tipe: 'Pemasukan',
    kategori: 'Kas Kelas',
    keterangan: 'Total Kas Kelas Iuran Rutin Mingguan',
    nominal: 275000,
    pencatat: 'Hendra Setiawan, S. Pd.',
  },
  {
    id: '70000000-0000-4000-8000-000000000002',
    tanggal: '2026-10-12',
    classId: INITIAL_CLASS_IDS.class1,
    tipe: 'Pemasukan',
    kategori: 'Tabungan Siswa',
    keterangan: 'Tabungan Mandiri Siswa (Setoran Kolektif)',
    nominal: 15000,
    pencatat: 'Hendra Setiawan, S. Pd.',
    studentId: INITIAL_STUDENT_IDS[0],
    studentName: 'ADHITYA WAHYU PRADANA',
  },
];
