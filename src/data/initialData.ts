import { Student, ClassRoom, AttendanceSession, AttendanceRecord, GradeRecord, JournalEntry, FinanceTransaction, TeacherProfile } from '../types';

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

export const initialClasses: ClassRoom[] = [
  {
    id: 'class-1',
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
    id: 'class-2',
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
    id: 'class-3',
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
    id: 'class-4',
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
    id: 'class-5',
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

export const initialStudents: Student[] = [
  { id: 'std-1', nisn: '0081234001', noUrut: 1, nama: 'ADHITYA WAHYU PRADANA', gender: 'L', classId: 'class-1', kontakOrtu: '628123456701', catatan: 'Aktif, tertib, disiplin di bengkel' },
  { id: 'std-2', nisn: '0081234002', noUrut: 2, nama: 'AHMAD ARIF FEBRIAN', gender: 'L', classId: 'class-1', kontakOrtu: '628123456702', catatan: 'Kehadiran konsisten 100%' },
  { id: 'std-3', nisn: '0081234003', noUrut: 3, nama: 'AHMAD REZA SAPUTRA', gender: 'L', classId: 'class-1', kontakOrtu: '628123456703', catatan: 'Perlu peningkatan motivasi belajar mandiri' },
  { id: 'std-4', nisn: '0081234004', noUrut: 4, nama: 'AKHMAD NAUFAL FIRMANDHA', gender: 'L', classId: 'class-1', kontakOrtu: '628123456704', catatan: 'Bagus dalam praktik mesin 2-tak' },
  { id: 'std-5', nisn: '0081234005', noUrut: 5, nama: 'ALWAN PERMANA NURRAKHMAN', gender: 'L', classId: 'class-1', kontakOrtu: '628123456705', catatan: 'Sering izin keperluan keluarga' },
  { id: 'std-6', nisn: '0081234006', noUrut: 6, nama: 'ANDHIKA PRATAMA', gender: 'L', classId: 'class-1', kontakOrtu: '628123456706', catatan: 'Bagus di tes teori otomotif' },
  { id: 'std-7', nisn: '0081234007', noUrut: 7, nama: 'ARDIAN INDRA MAULANA', gender: 'L', classId: 'class-1', kontakOrtu: '628123456707', catatan: 'Sakit flu musiman' },
  { id: 'std-8', nisn: '0081234008', noUrut: 8, nama: 'ATA AUFA ARZY APRIYANTO', gender: 'L', classId: 'class-1', kontakOrtu: '628123456708', catatan: 'Ketua kelompok diskusi' },
  { id: 'std-9', nisn: '0081234009', noUrut: 9, nama: 'BIMA RADITYA', gender: 'L', classId: 'class-1', kontakOrtu: '628123456709', catatan: 'Cekatan dalam pemeliharaan kelistrikan' },
  { id: 'std-10', nisn: '0081234010', noUrut: 10, nama: 'DANIYAL ARFA ABRISAM', gender: 'L', classId: 'class-1', kontakOrtu: '628123456710', catatan: 'Kerap membantu teman yang kesulitan' },
  { id: 'std-11', nisn: '0081234011', noUrut: 11, nama: 'DHAVIN AZKHER MUKHARAM', gender: 'L', classId: 'class-1', kontakOrtu: '628123456711', catatan: 'Perlu bimbingan pemahaman konseptual' },
  { id: 'std-12', nisn: '0081234012', noUrut: 12, nama: 'DUWI KHOIRUL ROZAK', gender: 'L', classId: 'class-1', kontakOrtu: '628123456712', catatan: 'Perlu dorongan aktif bertanya' },
  { id: 'std-13', nisn: '0081234013', noUrut: 13, nama: 'ENGGAR RADITYA PRATAMA', gender: 'L', classId: 'class-1', kontakOrtu: '628123456713', catatan: 'Perhatian fokus pada proyek bengkel' },
  { id: 'std-14', nisn: '0081234014', noUrut: 14, nama: 'FAIZA KHOIRUL FAHMI', gender: 'L', classId: 'class-1', kontakOrtu: '628123456714', catatan: 'Tertib administrasi tugas' },
  { id: 'std-15', nisn: '0081234015', noUrut: 15, nama: 'FURQON NURJATI', gender: 'L', classId: 'class-1', kontakOrtu: '628123456715', catatan: 'Cepat dalam merangkai sirkuit' },
  { id: 'std-16', nisn: '0081234016', noUrut: 16, nama: 'HAMZAH FANSURI', gender: 'L', classId: 'class-1', kontakOrtu: '628123456716', catatan: 'Kemampuan analisis logis baik' },
  { id: 'std-17', nisn: '0081234017', noUrut: 17, nama: 'IMUNG SEPTIANTO', gender: 'L', classId: 'class-1', kontakOrtu: '628123456717', catatan: 'Disiplin waktu dan kehadiran' },
  { id: 'std-18', nisn: '0081234018', noUrut: 18, nama: 'KHAMDAN NI\'AMILLAH', gender: 'L', classId: 'class-1', kontakOrtu: '628123456718', catatan: 'Aktif mengajukan pertanyaan kritis' },
  { id: 'std-19', nisn: '0081234019', noUrut: 19, nama: 'M. ALIF ZANDIANSYAH', gender: 'L', classId: 'class-1', kontakOrtu: '628123456719', catatan: 'Sangat teliti dalam pembacaan jangka sorong' },
  { id: 'std-20', nisn: '0081234020', noUrut: 20, nama: 'MOHAMMAD RIFKI', gender: 'L', classId: 'class-1', kontakOrtu: '628123456720', catatan: 'Kehadiran stabil, nilai memuaskan' },
  { id: 'std-21', nisn: '0081234021', noUrut: 21, nama: 'MUHAMMAD FARHAN', gender: 'L', classId: 'class-1', kontakOrtu: '628123456721', catatan: 'Penguasaan materi dasar tuntas' },
  { id: 'std-22', nisn: '0081234022', noUrut: 22, nama: 'MUHAMMAD ILHAM', gender: 'L', classId: 'class-1', kontakOrtu: '628123456722', catatan: 'Rapi dalam laporan portofolio kerja' },
  { id: 'std-23', nisn: '0081234023', noUrut: 23, nama: 'MUHAMMAD NUR RIZKI', gender: 'L', classId: 'class-1', kontakOrtu: '628123456723', catatan: 'Senang bereksperimen dengan tuning mesin' },
  { id: 'std-24', nisn: '0081234024', noUrut: 24, nama: 'NAUVAL DAFFA AL-KAUTSAR', gender: 'L', classId: 'class-1', kontakOrtu: '628123456724', catatan: 'Kemampuan komunikasi kelompok unggul' },
  { id: 'std-25', nisn: '0081234025', noUrut: 25, nama: 'RADITYA BAGAS KURNIAWAN', gender: 'L', classId: 'class-1', kontakOrtu: '628123456725', catatan: 'Konsisten menyelesaikan tugas tepat waktu' },
  { id: 'std-26', nisn: '0081234026', noUrut: 26, nama: 'RANGGA ADITYA PRANATA', gender: 'L', classId: 'class-1', kontakOrtu: '628123456726', catatan: 'Semangat belajar tinggi' },
  { id: 'std-27', nisn: '0081234027', noUrut: 27, nama: 'REVALDO SAPUTRA', gender: 'L', classId: 'class-1', kontakOrtu: '628123456727', catatan: 'Perlu pengawasan saat jam praktik mandiri' },
  { id: 'std-28', nisn: '0081234028', noUrut: 28, nama: 'RIFKI SETIAWAN', gender: 'L', classId: 'class-1', kontakOrtu: '628123456728', catatan: 'Tuntas pada seluruh sumatif' },
  { id: 'std-29', nisn: '0081234029', noUrut: 29, nama: 'RIZKY RAMADHAN', gender: 'L', classId: 'class-1', kontakOrtu: '628123456729', catatan: 'Hadir tepat waktu setiap sesi' },
  { id: 'std-30', nisn: '0081234030', noUrut: 30, nama: 'SATRIA BAGUS PAMUNGKAS', gender: 'L', classId: 'class-1', kontakOrtu: '628123456730', catatan: 'Performa uji kompetensi baik' },
  { id: 'std-31', nisn: '0081234031', noUrut: 31, nama: 'SEPTIAN DWI CAHYO', gender: 'L', classId: 'class-1', kontakOrtu: '628123456731', catatan: 'Aktif berkolaborasi dalam tim' },
  { id: 'std-32', nisn: '0081234032', noUrut: 32, nama: 'TEGAR PRATAMA YUDA', gender: 'L', classId: 'class-1', kontakOrtu: '628123456732', catatan: 'Keterampilan mekanik presisi tinggi' },
  { id: 'std-33', nisn: '0081234033', noUrut: 33, nama: 'YUDA PRATAMA KUSUMA', gender: 'L', classId: 'class-1', kontakOrtu: '628123456733', catatan: 'Sangat teliti dalam keselamatan K3' },
];

export const initialSessions: AttendanceSession[] = [
  {
    id: 'session-44',
    classId: 'class-1',
    pertemuanKe: 44,
    tanggal: '2026-10-12',
    mapel: 'Absen Harian & Pemeliharaan Sistem',
    catatan: 'Pertemuan sesi pagi, evaluasi keselamatan kerja bengkel',
    createdAt: '2026-10-12T07:00:00Z',
  },
  {
    id: 'session-43',
    classId: 'class-1',
    pertemuanKe: 43,
    tanggal: '2026-10-10',
    mapel: 'Sistem Injeksi Otomotif',
    catatan: 'Pengujian scanner OBD-II dan pembacaan fault code',
    createdAt: '2026-10-10T07:00:00Z',
  },
  {
    id: 'session-42',
    classId: 'class-1',
    pertemuanKe: 42,
    tanggal: '2026-10-08',
    mapel: 'Kelistrikan Bodi',
    catatan: 'Praktik perakitan lampu kepala dan relay',
    createdAt: '2026-10-08T07:00:00Z',
  },
  {
    id: 'session-41',
    classId: 'class-1',
    pertemuanKe: 41,
    tanggal: '2026-10-05',
    mapel: 'Sistem Rem ABS',
    catatan: 'Bleeding hidrolik dan pengujian sensor kecepatan roda',
    createdAt: '2026-10-05T07:00:00Z',
  },
];

// Generate attendance records for session 44:
// 30 Hadir, 1 Sakit (Ardian Indra Maulana), 1 Izin (Alwan Permana), 1 Alfa (Akhmad Naufal / std-4), 0 Dispen
export const initialAttendanceRecords: AttendanceRecord[] = initialStudents.map((std) => {
  let status: 'H' | 'S' | 'I' | 'A' | 'D' = 'H';
  let keterangan = '';

  if (std.id === 'std-5') {
    status = 'I';
    keterangan = 'Izin ada keperluan keluarga di luar kota';
  } else if (std.id === 'std-7') {
    status = 'S';
    keterangan = 'Sakit flu demam (surat dokter terlampir)';
  } else if (std.id === 'std-4') {
    status = 'A';
    keterangan = 'Tanpa keterangan resmi';
  }

  return {
    id: `rec-44-${std.id}`,
    sessionId: 'session-44',
    studentId: std.id,
    status,
    keterangan,
    updatedAt: '2026-10-12T07:30:00Z',
  };
});

// Initial grades reflecting Kurikulum Merdeka
export const initialGrades: GradeRecord[] = initialStudents.map((std, idx) => {
  // Give realistic sample grades
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

  // Calculate descriptive feedback based on Kurikulum Merdeka standards
  const avg = formatif.filter((v): v is number => v !== null).reduce((a, b) => a + b, 0) / (formatif.length || 1);
  let deskripsi = '';
  if (avg >= 85) {
    deskripsi = `Menunjukkan pemahaman sangat unggul dalam TP 1-3 serta mahir mengaplikasikan keselamatan kerja bengkel secara mandiri.`;
  } else if (avg >= 75) {
    deskripsi = `Menunjukkan pencapaian kompetensi yang baik pada sebagian besar tujuan pembelajaran, perlu penguatan lanjutan pada TP 4.`;
  } else {
    deskripsi = `Perlu bimbingan dan pendampingan intensif (remedial) dalam pemahaman konseptual dan praktik kerja TP 1 - TP 5.`;
  }

  return {
    id: `grade-${std.id}`,
    studentId: std.id,
    classId: 'class-1',
    formatif,
    sts,
    sas,
    deskripsi: `${std.nama} ${deskripsi}`,
    updatedAt: '2026-10-12T08:00:00Z',
  };
});

export const initialJournals: JournalEntry[] = [
  {
    id: 'jrn-1',
    tanggal: '2026-10-12',
    pendidik: 'Hendra Setiawan, S. Pd.',
    mapel: 'Bahasa Inggris',
    classId: 'class-2',
    className: 'XII TJAT 1',
    pertemuanKe: 'Ke-10',
    jamPelajaran: '13:00 - 13:40 WIB',
    materiKegiatan: 'Latihan Soal TKA: Drill soal TKA Kemendikbudristek Bahasa Inggris & Analisis Teks Prosedural Teknik.',
    absensiCatatan: 'Tidak hadir: ALWAN PERMANA NURRAKHMAN (Izin), ARDIAN INDRA MAULANA (Sakit), NAYAKA PRAMUDYA (Alpa), DWIREZA ERLANGGA WIDODO (Alpa).',
    semester: 'Ganjil',
  },
  {
    id: 'jrn-2',
    tanggal: '2026-10-12',
    pendidik: 'Hendra Setiawan, S. Pd.',
    mapel: 'Bahasa Inggris',
    classId: 'class-2',
    className: 'XII TJAT 1',
    pertemuanKe: 'Ke-1 - 4',
    jamPelajaran: '07:15 - 09:15 WIB',
    materiKegiatan: 'Latihan Soal TKA: Drill soal TKA Kemendikbudristek Bahasa Inggris bagian Reading Comprehension.',
    absensiCatatan: 'Tidak hadir: ALFAT (Alpa), BILQISA TISNAWATI (Alpa), MUHAMMAD NUR (Alpa).',
    semester: 'Ganjil',
  },
  {
    id: 'jrn-3',
    tanggal: '2026-10-12',
    pendidik: 'Hendra Setiawan, S. Pd.',
    mapel: 'Bahasa Inggris',
    classId: 'class-5',
    className: 'XII TKJ 3',
    pertemuanKe: 'Ke-5 - 6',
    jamPelajaran: '09:30 - 10:30 WIB',
    materiKegiatan: 'Latihan Soal TKA Kemendikbudristek: Struktur Grammar Bahasa Inggris Teknik.',
    absensiCatatan: 'Tidak hadir: MUHAMMAD SATRIA BIMA PRASETYO (Alpa).',
    semester: 'Ganjil',
  },
  {
    id: 'jrn-4',
    tanggal: '2026-10-12',
    pendidik: 'Hendra Setiawan, S. Pd.',
    mapel: 'Bahasa Inggris',
    classId: 'class-3',
    className: 'XII TKJ 1',
    pertemuanKe: 'Ke-7 - 8',
    jamPelajaran: '10:30 - 11:30 WIB',
    materiKegiatan: 'Latihan Soal TKA Kemendikbudristek: Drill listening & dialog kontekstual kejuruan.',
    absensiCatatan: 'Tidak hadir: FIRLI LISKA INDRIYANI (Izin), HIDAYATULLATIFAH (Sakit), SHINTA NURUL (Sakit).',
    semester: 'Ganjil',
  },
  {
    id: 'jrn-5',
    tanggal: '2026-10-08',
    pendidik: 'Hendra Setiawan, S. Pd.',
    mapel: 'Bahasa Inggris',
    classId: 'class-4',
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
    id: 'fin-1',
    tanggal: '2026-10-12',
    classId: 'class-1',
    tipe: 'Pemasukan',
    kategori: 'Kas Kelas',
    keterangan: 'Total Kas Kelas Iuran Rutin Mingguan',
    nominal: 275000,
    pencatat: 'Hendra Setiawan, S. Pd.',
  },
  {
    id: 'fin-2',
    tanggal: '2026-10-12',
    classId: 'class-1',
    tipe: 'Pemasukan',
    kategori: 'Tabungan Siswa',
    keterangan: 'Tabungan Mandiri Siswa (Setoran Kolektif)',
    nominal: 15000,
    pencatat: 'Hendra Setiawan, S. Pd.',
    studentId: 'std-1',
    studentName: 'ADHITYA WAHYU PRADANA',
  },
];
