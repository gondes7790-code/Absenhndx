export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastSynced: string;
}

const STORAGE_KEY_CONFIG = 'hndx_supabase_config_v1';

// Baca dari env (utama)
export const ENV_SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) || '';
export const ENV_SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || '';

/** true = production / ada env → tidak boleh diubah dari browser */
export const IS_CONFIG_LOCKED = Boolean(
  ENV_SUPABASE_URL.trim() && ENV_SUPABASE_ANON_KEY.trim()
);

export function getStoredSupabaseConfig(): SupabaseConfig {
  // Production: SELALU pakai env, abaikan localStorage
  if (IS_CONFIG_LOCKED) {
    return {
      url: ENV_SUPABASE_URL.trim(),
      anonKey: ENV_SUPABASE_ANON_KEY.trim(),
      isConnected: true,
      lastSynced: new Date().toISOString(),
    };
  }

  // Development / belum ada env: boleh pakai localStorage
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
  // Production: tolak perubahan
  if (IS_CONFIG_LOCKED) {
    console.warn(
      '[supabaseService] Konfigurasi dikunci oleh environment variables. Perubahan diabaikan.'
    );
    return;
  }
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(cfg));
}

/**
 * Mengunduh seluruh data (kelas, murid, presensi, nilai, jurnal, keuangan)
 * sebagai satu berkas JSON ke perangkat pengguna.
 */
export function downloadJsonBackup(data: unknown, filename?: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const stamp = new Date().toISOString().slice(0, 10);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `backup-absenhndx-${stamp}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Skema tabel + Row Level Security untuk Supabase (PostgreSQL).
 * Aman dijalankan berulang kali di Supabase SQL Editor.
 * Tabel tautan wali murid (public_shares) ada di berkas terpisah:
 * supabase_public_share.sql — jalankan SETELAH skema ini.
 */
export const SUPABASE_SQL_SCHEMA = `-- ============================================================
-- ABSENHNDX — Skema Database + Row Level Security (RLS)
-- ============================================================

-- 1. PROFIL PENDIDIK
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  nip           text,
  nama_lengkap  text,
  email         text,
  nama_sekolah  text,
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 2. KELAS / ROMBEL
create table if not exists public.classes (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  nama_kelas     text not null,
  tingkat        text,
  jurusan        text,
  tahun_ajaran   text default '2026/2027',
  semester       text default 'Ganjil' check (semester in ('Ganjil', 'Genap')),
  mapel          text,
  kkm            numeric default 75 check (kkm between 0 and 100),
  formatif_count int default 5 check (formatif_count between 1 and 15),
  tp_titles      jsonb default '{}'::jsonb,
  created_at     timestamptz not null default now()
);

-- 3. MURID
create table if not exists public.students (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  class_id     uuid not null references public.classes(id) on delete cascade,
  nisn         text,
  no_urut      int default 1 check (no_urut > 0),
  nama         text not null,
  gender       text default 'L' check (gender in ('L', 'P')),
  kontak_ortu  text default '',
  catatan      text default '',
  created_at   timestamptz not null default now()
);

-- 4. SESI PRESENSI (PERTEMUAN)
create table if not exists public.attendance_sessions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  class_id          uuid not null references public.classes(id) on delete cascade,
  pertemuan_ke      int not null default 1 check (pertemuan_ke > 0),
  tanggal           date not null,
  mapel             text,
  jam_pelajaran     text,
  materi            text default '',
  kegiatan          text default '',
  catatan_kegiatan  text default '',
  created_at        timestamptz not null default now()
);

-- 5. CATATAN KEHADIRAN PER MURID
create table if not exists public.attendance_records (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.attendance_sessions(id) on delete cascade,
  student_id  uuid not null references public.students(id) on delete cascade,
  status      text not null default 'H' check (status in ('H', 'S', 'I', 'A', 'D')),
  keterangan  text default '',
  updated_at  timestamptz not null default now(),
  constraint attendance_records_session_student_key unique (session_id, student_id)
);

-- 6. PENILAIAN
create table if not exists public.grades (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  class_id           uuid not null references public.classes(id) on delete cascade,
  student_id         uuid not null references public.students(id) on delete cascade,
  formatif           jsonb default '[]'::jsonb,
  sts                numeric,
  sas                numeric,
  deskripsi_merdeka  text default '',
  updated_at         timestamptz not null default now(),
  constraint grades_class_student_key unique (class_id, student_id)
);

-- 7. JURNAL MENGAJAR
create table if not exists public.journals (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  class_id         uuid references public.classes(id) on delete set null,
  tanggal          date not null,
  pendidik         text,
  mapel            text,
  pertemuan_ke     int default 1,
  jam_pelajaran    text,
  materi_kegiatan  text,
  absensi_catatan  text default '',
  semester         text default 'Ganjil',
  created_at       timestamptz not null default now()
);

-- 8. KEUANGAN (KAS KELAS & TABUNGAN SISWA)
create table if not exists public.finances (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  class_id    uuid not null references public.classes(id) on delete cascade,
  student_id  uuid references public.students(id) on delete set null,
  tanggal     date not null,
  tipe        text not null check (tipe in ('Pemasukan', 'Pengeluaran')),
  kategori    text not null check (kategori in ('Kas Kelas', 'Tabungan Siswa')),
  keterangan  text,
  nominal     numeric not null default 0 check (nominal >= 0),
  pencatat    text,
  created_at  timestamptz not null default now()
);

-- INDEKS
create index if not exists idx_classes_user            on public.classes(user_id);
create index if not exists idx_students_user           on public.students(user_id);
create index if not exists idx_students_class          on public.students(class_id);
create index if not exists idx_att_sessions_user       on public.attendance_sessions(user_id);
create index if not exists idx_att_sessions_class      on public.attendance_sessions(class_id);
create index if not exists idx_att_records_session     on public.attendance_records(session_id);
create index if not exists idx_att_records_student     on public.attendance_records(student_id);
create index if not exists idx_grades_user             on public.grades(user_id);
create index if not exists idx_journals_user           on public.journals(user_id);
create index if not exists idx_journals_class          on public.journals(class_id);
create index if not exists idx_finances_user           on public.finances(user_id);
create index if not exists idx_finances_class          on public.finances(class_id);
create index if not exists idx_finances_student        on public.finances(student_id);

-- ============================================================
-- ROW LEVEL SECURITY: pendidik hanya bisa mengakses datanya sendiri
-- ============================================================
alter table public.profiles            enable row level security;
alter table public.classes             enable row level security;
alter table public.students            enable row level security;
alter table public.attendance_sessions enable row level security;
alter table public.attendance_records  enable row level security;
alter table public.grades              enable row level security;
alter table public.journals            enable row level security;
alter table public.finances            enable row level security;

-- profiles: kunci pada id = auth.uid()
drop policy if exists "profiles_own" on public.profiles;
create policy "profiles_own" on public.profiles
  for all to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- tabel dengan kolom user_id: auth.uid() = user_id
drop policy if exists "classes_own" on public.classes;
create policy "classes_own" on public.classes
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "students_own" on public.students;
create policy "students_own" on public.students
  for all to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.classes c
      where c.id = students.class_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "attendance_sessions_own" on public.attendance_sessions;
create policy "attendance_sessions_own" on public.attendance_sessions
  for all to authenticated
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.classes c
      where c.id = attendance_sessions.class_id
        and c.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.classes c
      where c.id = attendance_sessions.class_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "grades_own" on public.grades;
create policy "grades_own" on public.grades
  for all to authenticated
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.classes c
      where c.id = grades.class_id
        and c.user_id = auth.uid()
    )
    and exists (
      select 1 from public.students s
      where s.id = grades.student_id
        and s.class_id = grades.class_id
        and s.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.classes c
      where c.id = grades.class_id
        and c.user_id = auth.uid()
    )
    and exists (
      select 1 from public.students s
      where s.id = grades.student_id
        and s.class_id = grades.class_id
        and s.user_id = auth.uid()
    )
  );

drop policy if exists "journals_own" on public.journals;
create policy "journals_own" on public.journals
  for all to authenticated
  using (
    auth.uid() = user_id
    and (class_id is null or exists (
      select 1 from public.classes c
      where c.id = journals.class_id
        and c.user_id = auth.uid()
    ))
  )
  with check (
    auth.uid() = user_id
    and (class_id is null or exists (
      select 1 from public.classes c
      where c.id = journals.class_id
        and c.user_id = auth.uid()
    ))
  );

drop policy if exists "finances_own" on public.finances;
create policy "finances_own" on public.finances
  for all to authenticated
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.classes c
      where c.id = finances.class_id
        and c.user_id = auth.uid()
    )
    and (student_id is null or exists (
      select 1 from public.students s
      where s.id = finances.student_id
        and s.class_id = finances.class_id
        and s.user_id = auth.uid()
    ))
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.classes c
      where c.id = finances.class_id
        and c.user_id = auth.uid()
    )
    and (student_id is null or exists (
      select 1 from public.students s
      where s.id = finances.student_id
        and s.class_id = finances.class_id
        and s.user_id = auth.uid()
    ))
  );

-- attendance_records tidak punya user_id: kepemilikan lewat sesi presensinya
drop policy if exists "attendance_records_own" on public.attendance_records;
create policy "attendance_records_own" on public.attendance_records
  for all to authenticated
  using (
    exists (
      select 1 from public.attendance_sessions s
      where s.id = attendance_records.session_id
        and s.user_id = auth.uid()
        and exists (
          select 1 from public.students st
          where st.id = attendance_records.student_id
            and st.class_id = s.class_id
            and st.user_id = auth.uid()
        )
    )
  )
  with check (
    exists (
      select 1 from public.attendance_sessions s
      where s.id = attendance_records.session_id
        and s.user_id = auth.uid()
        and exists (
          select 1 from public.students st
          where st.id = attendance_records.student_id
            and st.class_id = s.class_id
            and st.user_id = auth.uid()
        )
    )
  );
`;
