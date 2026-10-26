import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClassRoom, FinanceTransaction } from '../types';
import { queryKeys } from '../lib/queryKeys';
import { useToast } from '../contexts/ToastContext';
import { useDataSource } from './useDataSource';
import { errorMessage, newId, settle } from './mutationUtils';

const EMPTY_FINANCES: FinanceTransaction[] = [];

/** Transaksi kas/tabungan untuk SATU kelas; lazy saat tab keuangan (atau portal wali) dibutuhkan. */
export function useFinances(activeClass: ClassRoom | null, enabled = true) {
  const { scope, repo } = useDataSource();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const s = scope ?? 'anon';
  const classId = activeClass?.id ?? '';

  const query = useQuery<FinanceTransaction[]>({
    queryKey: queryKeys.finances(s, classId),
    queryFn: () => repo!.finances.listByClass(classId),
    enabled: Boolean(scope && repo && classId && enabled),
    meta: { label: 'data keuangan' },
  });

  const addMutation = useMutation({
    mutationFn: (tx: Omit<FinanceTransaction, 'id'>) => repo!.finances.create({ ...tx, id: newId() }),
    onSuccess: (created) => {
      queryClient.setQueryData<FinanceTransaction[]>(
        queryKeys.finances(s, created.classId),
        (prev) => [created, ...(prev ?? [])]
      );
      showToast(
        'Transaksi Dicatat',
        `${created.tipe} Rp ${created.nominal.toLocaleString('id-ID')} masuk ke pembukuan.`
      );
    },
    onError: (err) =>
      showToast('Gagal Mencatat Transaksi', errorMessage(err, 'Tidak dapat menyimpan transaksi ke Supabase.')),
  });

  const deleteMutation = useMutation({
    mutationFn: async (tx: FinanceTransaction) => {
      await repo!.finances.remove(tx.id);
      return tx;
    },
    onSuccess: (tx) => {
      queryClient.setQueryData<FinanceTransaction[]>(
        queryKeys.finances(s, tx.classId),
        (prev) => (prev ?? []).filter((t) => t.id !== tx.id)
      );
      showToast('Transaksi Dihapus', 'Data pembukuan berhasil disesuaikan.');
    },
    onError: (err) =>
      showToast('Gagal Menghapus Transaksi', errorMessage(err, 'Tidak dapat menghapus transaksi dari Supabase.')),
  });

  const finances = query.data ?? EMPTY_FINANCES;

  const addTransaction = useCallback(
    (tx: Omit<FinanceTransaction, 'id'>) => settle(addMutation.mutateAsync(tx)),
    [addMutation.mutateAsync]
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      const target = finances.find((t) => t.id === id);
      return target ? settle(deleteMutation.mutateAsync(target)) : Promise.resolve(null);
    },
    [finances, deleteMutation.mutateAsync]
  );

  return {
    finances,
    isLoading: query.isLoading,
    addTransaction,
    deleteTransaction,
  };
}
