import { useSyncExternalStore } from 'react';

/**
 * Preset "Jam Tatap Muka" (jam pelajaran) yang diatur sendiri oleh guru, mis.
 * Jam ke-1 = 07.00 - 08.00. Disimpan di localStorage perangkat ini (tidak
 * mengubah skema database); sesi dan agenda tetap menyimpan teks jamnya.
 */
export interface JamPreset {
  id: string;
  label: string;
  /** Format 24 jam "HH:MM" (nilai <input type="time">). */
  start: string;
  end: string;
}

export const JAM_PRESETS_STORAGE_KEY = 'hndx_merdeka_app_v2_jam_presets';

const EMPTY: JamPreset[] = [];

function isPreset(value: unknown): value is JamPreset {
  if (typeof value !== 'object' || value === null) return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.id === 'string' &&
    typeof p.label === 'string' &&
    typeof p.start === 'string' &&
    typeof p.end === 'string'
  );
}

function load(): JamPreset[] {
  try {
    const raw = localStorage.getItem(JAM_PRESETS_STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isPreset) : EMPTY;
  } catch {
    return EMPTY;
  }
}

/* ---- Store kecil agar semua modal memakai daftar preset yang sama ---- */

let cache: JamPreset[] | null = null;
const listeners = new Set<() => void>();

export function getJamPresets(): JamPreset[] {
  if (cache === null) cache = load();
  return cache;
}

export function saveJamPresets(next: JamPreset[]): void {
  cache = next;
  try {
    localStorage.setItem(JAM_PRESETS_STORAGE_KEY, JSON.stringify(next));
  } catch (e) {
    console.warn('[jamPresets] Gagal menyimpan preset jam', e);
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Sinkron antar tab browser.
  const onStorage = (e: StorageEvent) => {
    if (e.key === JAM_PRESETS_STORAGE_KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function useJamPresets(): JamPreset[] {
  return useSyncExternalStore(subscribe, getJamPresets, getJamPresets);
}

/* ---- Format & util ---- */

/** "07:00" → "07.00" (gaya penulisan jam di aplikasi ini). */
export function formatClock(time: string): string {
  return time.replace(':', '.');
}

/** Teks yang disimpan pada sesi/agenda, mis. "Jam ke-1 (07.00 - 08.00 WIB)". */
export function formatJamPreset(preset: JamPreset): string {
  const label = preset.label.trim();
  const range =
    preset.start && preset.end ? `${formatClock(preset.start)} - ${formatClock(preset.end)} WIB` : '';
  if (label && range) return `${label} (${range})`;
  return label || range;
}

function toMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function fromMinutes(total: number): string {
  const capped = Math.min(Math.max(total, 0), 23 * 60 + 59);
  const h = String(Math.floor(capped / 60)).padStart(2, '0');
  const m = String(capped % 60).padStart(2, '0');
  return `${h}:${m}`;
}

/** Jam selesai harus setelah jam mulai. */
export function isValidRange(preset: JamPreset): boolean {
  const start = toMinutes(preset.start);
  const end = toMinutes(preset.end);
  return start !== null && end !== null && end > start;
}

/**
 * Baris baru yang sudah terisi: label berikutnya, mulai tepat setelah jam
 * sebelumnya, dan durasi sama dengan jam sebelumnya (default 60 menit).
 */
export function nextPresetDraft(existing: JamPreset[]): JamPreset {
  const last = existing[existing.length - 1];
  const lastStart = last ? toMinutes(last.start) : null;
  const lastEnd = last ? toMinutes(last.end) : null;
  const duration = lastStart !== null && lastEnd !== null && lastEnd > lastStart ? lastEnd - lastStart : 60;
  const startMinutes = lastEnd ?? 7 * 60;
  return {
    id: crypto.randomUUID(),
    label: `Jam ke-${existing.length + 1}`,
    start: fromMinutes(startMinutes),
    end: fromMinutes(startMinutes + duration),
  };
}
