import React, { useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '../lib/queryClient';
import { useAuth } from './AuthContext';

/**
 * QueryClientProvider diletakkan DI DALAM AuthProvider dan DI LUAR App,
 * sehingga cache bisa dibersihkan saat sesi berakhir. Halaman publik (?p=token)
 * tidak memakai provider ini sama sekali.
 */
export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queryClient] = useState(createQueryClient);
  const { isAuthenticated } = useAuth();

  // Keluar akun / berhenti dari demo → buang seluruh cache agar data tidak tersisa di memori.
  useEffect(() => {
    if (!isAuthenticated) queryClient.clear();
  }, [isAuthenticated, queryClient]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
