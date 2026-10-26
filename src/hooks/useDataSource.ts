import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createRepository, Repository } from '../services/repository';

export interface DataSource {
  /** userId (Supabase) atau 'demo'; `null` bila belum login. Dipakai sebagai bagian query key. */
  scope: string | null;
  repo: Repository | null;
  isDemo: boolean;
  userId: string | null;
}

/** Menentukan sumber data aktif (Demo/localStorage atau Supabase) untuk seluruh hook domain. */
export function useDataSource(): DataSource {
  const { userId, isDemoMode } = useAuth();
  return useMemo(() => {
    const scope = isDemoMode ? 'demo' : userId;
    return {
      scope,
      repo: createRepository({ isDemo: isDemoMode, userId }),
      isDemo: isDemoMode,
      userId,
    };
  }, [userId, isDemoMode]);
}
