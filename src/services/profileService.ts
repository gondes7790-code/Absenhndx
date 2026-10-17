import { getSupabase } from '../lib/supabase';
import { TeacherProfile } from '../types';

export async function fetchProfile(userId: string): Promise<TeacherProfile | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    name: data.nama_lengkap || 'Pendidik Merdeka',
    email: data.email,
    nip: data.nip || '-',
    nuptk: '-',
    school: data.nama_sekolah || 'Sekolah Merdeka Indonesia',
    handle: '@' + (data.email?.split('@')[0] || 'guru'),
    phone: '',
    mapelUtama: 'Kurikulum Merdeka',
    bio: 'Pendidik Profesional Berdedikasi',
  };
}

export async function upsertProfile(userId: string, profile: TeacherProfile): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    nip: profile.nip,
    nama_lengkap: profile.name,
    email: profile.email,
    nama_sekolah: profile.school,
    avatar_url: null,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('[profileService] upsertProfile error:', error);
    return false;
  }
  return true;
}

export const updateProfile = upsertProfile;

