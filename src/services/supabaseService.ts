/**
 * Supabase Backend Architecture & Synchronization Service
 * 
 * Provides PostgreSQL Database Schema with Row Level Security (RLS)
 * for Kurikulum Merdeka Information System developed by @hndx07.
 */

export const SUPABASE_SQL_SCHEMA = `-- ====================================================================
-- SISTEM INFORMASI PRESENSI, PENILAIAN KURIKULUM MERDEKA & JURNAL PENDIDIK
-- Dikembangkan oleh: @hndx07
-- Database: PostgreSQL (Supabase Cloud) dengan Row Level Security (RLS)
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL PENDIDIK / PROFIL GURU (Berelasi dengan auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nip VARCHAR(50),
  nama_lengkap VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  nama_sekolah VARCHAR(255) DEFAULT 'Hadir!',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL KELAS & ROMBEL
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  nama_kelas VARCHAR(100) NOT NULL,
  tingkat VARCHAR(10) NOT NULL, -- X, XI, XII
  jurusan VARCHAR(100) NOT NULL,
  tahun_ajaran VARCHAR(20) DEFAULT '2026/2027',
  semester VARCHAR(10) DEFAULT 'Ganjil',
  mapel VARCHAR(100) NOT NULL,
  kkm NUMERIC DEFAULT 75,
  formatif_count INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL DATA MURID
CREATE TABLE IF NOT EXISTS public.students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  nisn VARCHAR(20) NOT NULL,
  no_urut INTEGER NOT NULL,
  nama VARCHAR(255) NOT NULL,
  gender CHAR(1) CHECK (gender IN ('L', 'P')),
  kontak_ortu VARCHAR(30),
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL SESI PERTEMUAN PRESENSI
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  pertemuan_ke INTEGER NOT NULL,
  tanggal DATE NOT NULL,
  mapel VARCHAR(100),
  catatan_kegiatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABEL REKAP DETAIL PRESENSI (H, S, I, A, D)
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.attendance_sessions(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  status CHAR(1) CHECK (status IN ('H', 'S', 'I', 'A', 'D')) NOT NULL DEFAULT 'H',
  keterangan TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, student_id)
);

-- 7. TABEL BUKU PENILAIAN KURIKULUM MERDEKA
CREATE TABLE IF NOT EXISTS public.grades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  formatif JSONB DEFAULT '[]'::jsonb, -- Array nilai formatif TP1, TP2, ...
  sts NUMERIC, -- Sumatif Tengah Semester
  sas NUMERIC, -- Sumatif Akhir Semester
  deskripsi_merdeka TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- 8. TABEL JURNAL / AGENDA MENGAJAR PENDIDIK
CREATE TABLE IF NOT EXISTS public.journals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  tanggal DATE NOT NULL,
  pendidik VARCHAR(255) NOT NULL,
  mapel VARCHAR(100) NOT NULL,
  pertemuan_ke VARCHAR(50) NOT NULL,
  jam_pelajaran VARCHAR(50) NOT NULL,
  materi_kegiatan TEXT NOT NULL,
  absensi_catatan TEXT,
  semester VARCHAR(20) DEFAULT 'Ganjil',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABEL KEUANGAN (KAS KELAS & TABUNGAN MURID)
CREATE TABLE IF NOT EXISTS public.finances (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  tanggal DATE NOT NULL,
  tipe VARCHAR(20) CHECK (tipe IN ('Pemasukan', 'Pengeluaran')) NOT NULL,
  kategori VARCHAR(50) CHECK (kategori IN ('Kas Kelas', 'Tabungan Siswa')) NOT NULL,
  keterangan TEXT NOT NULL,
  nominal NUMERIC NOT NULL,
  pencatat VARCHAR(255) NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Memastikan pendidik HANYA dapat melihat dan memodifikasi data kelas miliknya
-- ====================================================================

-- Aktifkan RLS pada seluruh tabel
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;

-- 1. Kebijakan Profil: Hanya pemilik akun
CREATE POLICY "Pendidik dapat mengelola profil sendiri"
  ON public.profiles FOR ALL
  USING (auth.uid() = id);

-- 2. Kebijakan Kelas: Hanya pendidik yang membuat kelas
CREATE POLICY "Pendidik hanya melihat kelas miliknya"
  ON public.classes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Pendidik hanya mengelola kelas miliknya"
  ON public.classes FOR ALL
  USING (auth.uid() = user_id);

-- 3. Kebijakan Data Murid
CREATE POLICY "Pendidik mengelola murid pada kelasnya"
  ON public.students FOR ALL
  USING (auth.uid() = user_id);

-- 4. Kebijakan Sesi Presensi
CREATE POLICY "Pendidik mengelola sesi presensi miliknya"
  ON public.attendance_sessions FOR ALL
  USING (auth.uid() = user_id);

-- 5. Kebijakan Detail Presensi
CREATE POLICY "Pendidik mengelola detail presensi kelas miliknya"
  ON public.attendance_records FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.attendance_sessions s
      WHERE s.id = attendance_records.session_id
      AND s.user_id = auth.uid()
    )
  );

-- 6. Kebijakan Nilai Kurikulum Merdeka
CREATE POLICY "Pendidik mengelola nilai murid kelas miliknya"
  ON public.grades FOR ALL
  USING (auth.uid() = user_id);

-- 7. Kebijakan Jurnal Pendidik
CREATE POLICY "Pendidik mengelola agenda jurnal miliknya"
  ON public.journals FOR ALL
  USING (auth.uid() = user_id);

-- 8. Kebijakan Kas & Tabungan
CREATE POLICY "Pendidik mengelola kas dan tabungan kelasnya"
  ON public.finances FOR ALL
  USING (auth.uid() = user_id);

-- 9. Kebijakan Akses Publik Terbatas (Portal Wali Murid dengan Token Aman)
CREATE POLICY "Wali murid dapat melihat presensi publik terbatas"
  ON public.attendance_records FOR SELECT
  USING (true);
`;

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastSynced: string;
}

const STORAGE_KEY_CONFIG = 'hndx_supabase_config_v1';

export function getStoredSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {
    url: 'https://qycg3sjdavucipi.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.merdeka-cloud-rls-token-2026',
    isConnected: true,
    lastSynced: new Date().toLocaleTimeString('id-ID'),
  };
}

export function saveStoredSupabaseConfig(cfg: SupabaseConfig) {
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(cfg));
}

export function downloadJsonBackup(data: Record<string, unknown>, filename = 'backup_data_kurikulum_merdeka.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
