import { QueryCache, QueryClient } from '@tanstack/react-query';

type QueryErrorHandler = (title: string, description: string) => void;

let queryErrorHandler: QueryErrorHandler | null = null;

/** Dipasang oleh ToastProvider agar error query tampil sebagai toast yang seragam. */
export function setQueryErrorHandler(handler: QueryErrorHandler | null): void {
  queryErrorHandler = handler;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        const label = typeof query.meta?.label === 'string' ? query.meta.label : 'data';
        console.warn(`[query] Gagal memuat ${label}:`, error);
        queryErrorHandler?.(
          'Gagal Memuat Data',
          error instanceof Error && error.message
            ? error.message
            : `Terjadi kendala saat mengambil ${label}.`
        );
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 1,
        // Urutan data (mis. sesi terbaru di atas) tidak boleh berubah diam-diam saat tab difokuskan lagi.
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
