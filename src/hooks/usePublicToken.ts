import { useEffect, useState } from 'react';
import { TOKEN_PATTERN } from '../services/publicShareService';

function readPublicTokenFromUrl(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const token = (params.get('p') || '').trim().toLowerCase();
    return TOKEN_PATTERN.test(token) ? token : null;
  } catch {
    return null;
  }
}

/**
 * Token tautan publik (?p=<64 hex>). Mode lama `?portal=` tetap dinonaktifkan.
 * Pada pemuatan awal, main.tsx sudah merender halaman publik tanpa App; hook ini
 * menjaga kasus navigasi riwayat (popstate) di dalam App.
 */
export function usePublicToken(): string | null {
  const [token, setToken] = useState<string | null>(() => readPublicTokenFromUrl());

  useEffect(() => {
    const onPopState = () => setToken(readPublicTokenFromUrl());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return token;
}
