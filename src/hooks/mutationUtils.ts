/** Pesan error dari objek apa pun yang dilempar. */
export function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

/**
 * `mutateAsync` melempar saat gagal; `onError` hook sudah menampilkan toast.
 * Wrapper ini mengubah kegagalan menjadi `null` agar pemanggil tidak perlu try/catch.
 */
export async function settle<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch {
    return null;
  }
}

export const newId = (): string => crypto.randomUUID();
