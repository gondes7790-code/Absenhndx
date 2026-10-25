-- ABSENHNDX - Public Share Portal
-- Jalankan setelah schema utama. RPC hanya mengembalikan data yang diizinkan oleh scopes.

create extension if not exists pgcrypto;

create table if not exists public.public_shares (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  class_id    uuid not null references public.classes(id) on delete cascade,
  student_id  uuid not null references public.students(id) on delete cascade,
  token       text not null unique check (token ~ '^[0-9a-f]{64}$'),
  scopes      text[] not null default array['absen']::text[]
              check (scopes <@ array['absen','nilai','tabungan']::text[]),
  expires_at  timestamptz not null,
  revoked_at  timestamptz,
  created_at  timestamptz not null default now(),
  constraint public_shares_expiry_check check (expires_at > created_at)
);

create index if not exists idx_public_shares_token_active
  on public.public_shares (token)
  where revoked_at is null;
create index if not exists idx_public_shares_student_active
  on public.public_shares (student_id, created_at desc)
  where revoked_at is null;

alter table public.public_shares enable row level security;

drop policy if exists "public_shares_owner" on public.public_shares;
create policy "public_shares_owner" on public.public_shares
  for all to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.classes c
      where c.id = public_shares.class_id
        and c.user_id = auth.uid()
    )
    and exists (
      select 1 from public.students s
      where s.id = public_shares.student_id
        and s.class_id = public_shares.class_id
        and s.user_id = auth.uid()
    )
  );

-- Token yang dikirim ke wali tidak perlu disimpan sebagai plaintext.
-- Fungsi createShare pada client tetap kompatibel karena token dikembalikan setelah insert.
-- Untuk deployment dengan token hashing, gunakan Edge Function sebagai lapisan penerbit token.

create or replace function public.get_public_share(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  share_row record;
  result jsonb;
  attendance_data jsonb;
  grades_data jsonb;
  savings_data jsonb;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then
    return null;
  end if;

  select ps.*, c.nama_kelas, c.mapel as class_mapel, c.tahun_ajaran,
         c.semester, c.kkm, s.nama as student_name, s.no_urut,
         p.nama_sekolah, p.nama_lengkap
    into share_row
    from public.public_shares ps
    join public.classes c on c.id = ps.class_id
    join public.students s on s.id = ps.student_id and s.class_id = ps.class_id
    left join public.profiles p on p.id = ps.user_id
   where ps.token = lower(p_token)
     and ps.revoked_at is null
     and ps.expires_at > now()
   limit 1;

  if not found then
    return null;
  end if;

  if 'absen' = any(share_row.scopes) then
    select jsonb_build_object(
      'total', count(*)::int,
      'summary', jsonb_build_object(
        'H', count(*) filter (where ar.status = 'H')::int,
        'S', count(*) filter (where ar.status = 'S')::int,
        'I', count(*) filter (where ar.status = 'I')::int,
        'A', count(*) filter (where ar.status = 'A')::int,
        'D', count(*) filter (where ar.status = 'D')::int
      ),
      'recent', coalesce((
        select jsonb_agg(jsonb_build_object(
          'tanggal', x.tanggal,
          'pertemuan_ke', x.pertemuan_ke,
          'status', x.status,
          'keterangan', x.keterangan
        ) order by x.tanggal desc, x.pertemuan_ke desc)
        from (
          select ats.tanggal, ats.pertemuan_ke, ar2.status, ar2.keterangan
          from public.attendance_records ar2
          join public.attendance_sessions ats on ats.id = ar2.session_id
          where ar2.student_id = share_row.student_id
            and ats.class_id = share_row.class_id
          order by ats.tanggal desc, ats.pertemuan_ke desc
          limit 100
        ) x
      ), '[]'::jsonb)
    ) into attendance_data
    from public.attendance_records ar
    join public.attendance_sessions ats on ats.id = ar.session_id
   where ar.student_id = share_row.student_id
     and ats.class_id = share_row.class_id;
  end if;

  if 'nilai' = any(share_row.scopes) then
    select to_jsonb(g) - 'id' - 'user_id' - 'class_id' - 'student_id' - 'updated_at'
      into grades_data
      from public.grades g
     where g.class_id = share_row.class_id
       and g.student_id = share_row.student_id
     limit 1;
    if grades_data is not null then
      grades_data := jsonb_build_object(
        'formatif', coalesce(grades_data->'formatif', '[]'::jsonb),
        'sts', grades_data->'sts',
        'sas', grades_data->'sas',
        'deskripsi', grades_data->'deskripsi_merdeka'
      );
    end if;
  end if;

  if 'tabungan' = any(share_row.scopes) then
    select jsonb_build_object(
      'saldo', coalesce(sum(case when f.tipe = 'Pemasukan' then f.nominal else -f.nominal end), 0),
      'recent', coalesce(jsonb_agg(jsonb_build_object(
        'tanggal', f.tanggal,
        'tipe', f.tipe,
        'keterangan', coalesce(f.keterangan, ''),
        'nominal', f.nominal
      ) order by f.tanggal desc), '[]'::jsonb)
    ) into savings_data
    from (
      select f.*
      from public.finances f
      where f.class_id = share_row.class_id
        and f.student_id = share_row.student_id
        and f.kategori = 'Tabungan Siswa'
      order by f.tanggal desc
      limit 100
    ) f;
  end if;

  result := jsonb_build_object(
    'school', coalesce(share_row.nama_sekolah, ''),
    'teacher', coalesce(share_row.nama_lengkap, ''),
    'class', jsonb_build_object(
      'nama', share_row.nama_kelas,
      'mapel', coalesce(share_row.class_mapel, ''),
      'tahun_ajaran', coalesce(share_row.tahun_ajaran, ''),
      'semester', coalesce(share_row.semester, ''),
      'kkm', coalesce(share_row.kkm, 75)
    ),
    'student', jsonb_build_object(
      'nama', share_row.student_name,
      'no_urut', share_row.no_urut
    ),
    'scopes', to_jsonb(share_row.scopes),
    'expires_at', share_row.expires_at,
    'attendance', attendance_data,
    'grades', grades_data,
    'savings', savings_data
  );

  return result;
end;
$$;

revoke all on function public.get_public_share(text) from public;
grant execute on function public.get_public_share(text) to anon, authenticated;
revoke all on public.public_shares from anon;
