/**
 * Tingkat kelas ↔ Fase Kurikulum Merdeka.
 * A: kelas 1-2 • B: 3-4 • C: 5-6 (SD/MI) • D: 7-9 (SMP/MTs) • E: 10 • F: 11-12 (SMA/SMK/MA).
 */
export interface TingkatOption {
  value: string;
  label: string;
}

export interface TingkatGroup {
  label: string;
  options: TingkatOption[];
}

const opt = (value: number, fase: string, extra = ''): TingkatOption => ({
  value: String(value),
  label: `Kelas ${value} (Fase ${fase}${extra})`,
});

/** Pilihan tingkat pada formulir rombel, dikelompokkan per jenjang. */
export const TINGKAT_GROUPS: TingkatGroup[] = [
  {
    label: 'Sekolah Dasar (SD/MI)',
    options: [opt(1, 'A'), opt(2, 'A'), opt(3, 'B'), opt(4, 'B'), opt(5, 'C'), opt(6, 'C')],
  },
  {
    label: 'SMP/MTs',
    options: [opt(7, 'D'), opt(8, 'D'), opt(9, 'D')],
  },
  {
    label: 'SMA/SMK/MA',
    options: [opt(10, 'E'), opt(11, 'F'), opt(12, 'F', ' Lanjutan')],
  },
];

const ROMAN_TO_NUMBER: Record<string, number> = {
  I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12,
};

/** "10", "X", atau "Kelas 10" → 10; selain itu null. Data lama memakai angka Romawi. */
export function tingkatToNumber(tingkat: string): number | null {
  const text = (tingkat ?? '').trim().replace(/^kelas\s+/i, '').toUpperCase();
  if (/^\d{1,2}$/.test(text)) {
    const n = Number(text);
    return n >= 1 && n <= 12 ? n : null;
  }
  return ROMAN_TO_NUMBER[text] ?? null;
}

export function faseOf(tingkat: string): string | null {
  const n = tingkatToNumber(tingkat);
  if (n === null) return null;
  if (n <= 2) return 'A';
  if (n <= 4) return 'B';
  if (n <= 6) return 'C';
  if (n <= 9) return 'D';
  if (n === 10) return 'E';
  return 'F';
}

export function isSekolahDasar(tingkat: string): boolean {
  const n = tingkatToNumber(tingkat);
  return n !== null && n <= 6;
}

/** Ringkasan fase dari daftar tingkat, mis. ["4","5","10"] → "FASE B/C/E". */
export function summarizeFase(tingkatList: string[]): string {
  const fases = Array.from(
    new Set(tingkatList.map(faseOf).filter((f): f is string => f !== null))
  ).sort();
  return fases.length > 0 ? `FASE ${fases.join('/')}` : 'FASE -';
}

/** Apakah nilai tingkat ada di daftar pilihan formulir. */
export function isKnownTingkat(value: string): boolean {
  return TINGKAT_GROUPS.some((group) => group.options.some((o) => o.value === value));
}
