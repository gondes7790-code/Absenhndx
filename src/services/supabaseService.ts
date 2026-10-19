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
  tp_titles JSONB DEFAULT '{}'::jsonb,
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
  jam_pelajaran VARCHAR(50),
  materi TEXT,
  kegiatan TEXT,
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
  pertemuan_ke INTEGER NOT NULL,
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

-- Re-runnable, tenant-isolated RLS policies. No base table is public.
DROP POLICY IF EXISTS "Pendidik dapat mengelola profil sendiri" ON public.profiles;
DROP POLICY IF EXISTS "Pendidik hanya melihat kelas miliknya" ON public.classes;
DROP POLICY IF EXISTS "Pendidik hanya mengelola kelas miliknya" ON public.classes;
DROP POLICY IF EXISTS "Pendidik mengelola murid pada kelasnya" ON public.students;
DROP POLICY IF EXISTS "Pendidik mengelola sesi presensi miliknya" ON public.attendance_sessions;
DROP POLICY IF EXISTS "Pendidik mengelola detail presensi kelas miliknya" ON public.attendance_records;
DROP POLICY IF EXISTS "Pendidik mengelola nilai murid kelas miliknya" ON public.grades;
DROP POLICY IF EXISTS "Pendidik mengelola agenda jurnal miliknya" ON public.journals;
DROP POLICY IF EXISTS "Pendidik mengelola kas dan tabungan kelasnya" ON public.finances;
DROP POLICY IF EXISTS "Wali murid dapat melihat presensi publik terbatas" ON public.attendance_records;

CREATE POLICY "Pendidik dapat mengelola profil sendiri" ON public.profiles FOR ALL
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Pendidik mengelola kelas miliknya" ON public.classes FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Pendidik mengelola murid pada kelasnya" ON public.students FOR ALL
  USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.user_id = auth.uid()))
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.user_id = auth.uid()));
CREATE POLICY "Pendidik mengelola sesi presensi miliknya" ON public.attendance_sessions FOR ALL
  USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.user_id = auth.uid()))
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.user_id = auth.uid()));
CREATE POLICY "Pendidik mengelola detail presensi kelas miliknya" ON public.attendance_records FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.attendance_sessions s JOIN public.students st ON st.id = student_id
    WHERE s.id = session_id AND s.user_id = auth.uid() AND st.class_id = s.class_id AND st.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.attendance_sessions s JOIN public.students st ON st.id = student_id
    WHERE s.id = session_id AND s.user_id = auth.uid() AND st.class_id = s.class_id AND st.user_id = auth.uid()
  ));
CREATE POLICY "Pendidik mengelola nilai murid kelas miliknya" ON public.grades FOR ALL
  USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.classes c JOIN public.students st ON st.class_id = c.id WHERE c.id = class_id AND st.id = student_id AND c.user_id = auth.uid() AND st.user_id = auth.uid()))
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.classes c JOIN public.students st ON st.class_id = c.id WHERE c.id = class_id AND st.id = student_id AND c.user_id = auth.uid() AND st.user_id = auth.uid()));
CREATE POLICY "Pendidik mengelola agenda jurnal miliknya" ON public.journals FOR ALL
  USING (auth.uid() = user_id AND (class_id IS NULL OR EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.user_id = auth.uid())))
  WITH CHECK (auth.uid() = user_id AND (class_id IS NULL OR EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.user_id = auth.uid())));
CREATE POLICY "Pendidik mengelola kas dan tabungan kelasnya" ON public.finances FOR ALL
  USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.user_id = auth.uid()) AND (student_id IS NULL OR EXISTS (SELECT 1 FROM public.students st WHERE st.id = student_id AND st.class_id = class_id AND st.user_id = auth.uid())))
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.user_id = auth.uid()) AND (student_id IS NULL OR EXISTS (SELECT 1 FROM public.students st WHERE st.id = student_id AND st.class_id = class_id AND st.user_id = auth.uid())));
-- Public portal must use the token RPC migration; direct table SELECT is intentionally absent.
`;

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastSynced: string;
}

const STORAGE_KEY_CONFIG = 'hndx_supabase_config_v1';

// Read from import.meta.env as primary configuration
export const ENV_SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || '';
export const ENV_SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || '';

export function getStoredSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        url: parsed.url || ENV_SUPABASE_URL,
        anonKey: parsed.anonKey || ENV_SUPABASE_ANON_KEY,
        isConnected: Boolean(parsed.isConnected),
        lastSynced: parsed.lastSynced || '',
      };
    }
  } catch {
    // fallback
  }
  return {
    url: ENV_SUPABASE_URL,
    anonKey: ENV_SUPABASE_ANON_KEY,
    isConnected: false,
    lastSynced: '',
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
