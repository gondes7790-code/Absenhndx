import { PrintConfig } from '../types';

export const APP_LOGO_URL =
  'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhYKnZQtngqKIln1uLBVvStR512j7QPf5q66cbDXh58rZKdjSpK71BUECeQS6yGOw17WCBLSLPwnJxEu4ghxoLsKdsQ0jckGJfEute9VIZjkn0IglM5a8QTTcH9x7_TSp-BP52AsIRfFtAkRcfO1uXhOyuYr1ud7N4AiGg5HG1P6VLxFENCnPZOV9I6BJON/s1254/56332.png';

/** Logo untuk header aplikasi (Navbar) — tampil polos, tanpa frame. */
export const HEADER_LOGO_URL =
  'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj35fOFocNE6ell6OOH82N3WfoTEN0juxQMMqmhtPCmp8QeEyII5GvVux10Z2p5L5dU5UKUcGH5_Peal5td3yRkLQAwQOP-85_oxHyXynz5Hfbe3LrMYB3ZfvLZuVybQYJlew8VncdQKaWC9t0RrHKzGCPdCpIPm9sntLR0eZycd-5LPHf7P0XKO0GdpchQ/s2022/63906.png';

/**
 * Preset lambang Tut Wuri Handayani (logo resmi Kemendikbud) — berkas SVG dari Wikipedia.
 * Sumber: https://id.wikipedia.org/wiki/Lambang_Tut_Wuri_Handayani
 * Dimuat lewat Special:FilePath agar selalu mengarah ke berkas aslinya.
 */
export const TUT_WURI_LOGO_SVG =
  'https://id.wikipedia.org/wiki/Special:FilePath/Logo_of_Ministry_of_Education_and_Culture_of_Republic_of_Indonesia.svg';

export const SMK_BISA_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120"><rect width="120" height="120" rx="24" fill="%231e3a8a"/><circle cx="60" cy="60" r="45" fill="%23f59e0b"/><polygon points="60,25 70,50 95,50 75,65 83,90 60,75 37,90 45,65 25,50 50,50" fill="%23ffffff"/><text x="60" y="112" font-family="Arial,sans-serif" font-size="12" font-weight="900" fill="%23ffffff" text-anchor="middle">SMK BISA!</text></svg>`;

export const GARUDA_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="48" fill="%23ffffff" stroke="%23b45309" stroke-width="3"/><path d="M50 15 L65 35 L85 45 L65 60 L70 85 L50 72 L30 85 L35 60 L15 45 L35 35 Z" fill="%23d97706"/><rect x="42" y="42" width="16" height="16" fill="%23dc2626" stroke="%23000000" stroke-width="1.5"/></svg>`;

export const DEFAULT_PRINT_CONFIG: PrintConfig = {
  dinasHeader: 'PEMERINTAH DAERAH PROVINSI • DINAS PENDIDIKAN',
  dinasSubHeader: 'CABANG DINAS PENDIDIKAN WILAYAH SATUAN PENDIDIKAN',
  schoolName: 'SEKOLAH MERDEKA INDONESIA',
  unitSubHeader: 'SISTEM MANAJEMEN PRESENSI & ASESMEN KURIKULUM MERDEKA',
  address: 'Jl. Merdeka Belajar No. 45, Kompleks Pendidikan Terpadu',
  phone: 'Telp. (021) 7890123 / Fax. (021) 7890124',
  emailWeb: 'info@sekolahmerdeka.sch.id • https://hadir.app',
  logoEmbedCode: TUT_WURI_LOGO_SVG,
  logoPosition: 'right',
  showTutWuriLogo: true,
  principalName: 'Drs. H. Mulyadi, M.Pd.',
  principalNip: '19680512 199403 1 004',
  documentCity: 'Jakarta',
  customDateText: '',
  borderStyle: 'double',
  footerNote: 'Dokumen Sah Digital - Dicetak melalui Hadir! Platform Manajemen Guru Kurikulum Merdeka',
};

const STORAGE_KEY = 'hadir_print_config_v2';

export const getSavedPrintConfig = (defaultSchoolName?: string): PrintConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Nilai logo lama (HTML/SVG embed) dinormalkan menjadi URL murni saat dimuat.
      return normalizePrintConfig({
        ...DEFAULT_PRINT_CONFIG,
        ...parsed,
        schoolName: parsed.schoolName || defaultSchoolName || DEFAULT_PRINT_CONFIG.schoolName,
      });
    }
  } catch (err) {
    console.warn('Failed to parse saved print config:', err);
  }
  return {
    ...DEFAULT_PRINT_CONFIG,
    schoolName: defaultSchoolName || DEFAULT_PRINT_CONFIG.schoolName,
  };
};

export const savePrintConfig = (config: PrintConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizePrintConfig(config)));
  } catch (err) {
    console.warn('Failed to save print config to localStorage:', err);
  }
};

/**
 * Cleans image URL from quotes, Google Drive sharing links, Dropbox links, etc.
 */
export const cleanImageUrl = (url: string): string => {
  if (!url) return '';
  let cleaned = url.trim().replace(/^["']|["']$/g, '');

  // Google Drive sharing URL converter
  // Matches /file/d/FILE_ID or id=FILE_ID or open?id=FILE_ID
  const gdriveMatch = cleaned.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_-]+)/i);
  if (gdriveMatch && gdriveMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${gdriveMatch[1]}&sz=w1000`;
  }

  // Dropbox dl=0 to raw=1
  if (cleaned.includes('dropbox.com') && cleaned.includes('dl=0')) {
    return cleaned.replace('dl=0', 'raw=1');
  }

  return cleaned;
};

/**
 * Logo sekolah = URL GAMBAR SAJA.
 *
 * Input pengguna tidak pernah dirender sebagai HTML/SVG. Hasil parse hanya berupa
 * string URL yang selalu ditampilkan lewat <img src={content} />.
 *
 * Diterima  : https://..., http://..., path relatif berawalan "/" (bukan "//"),
 *             dan data:image/* HANYA bila identik dengan preset bawaan aplikasi.
 * Ditolak   : <svg>...</svg>, <iframe>, <embed>, markup lain, javascript:, data:
 *             buatan pengguna.
 * Kompatibel: HTML lama berisi <img src="https://..."> diambil URL-nya saja.
 */

/** Satu-satunya data URI yang diterima: preset yang dikontrol kode, bukan input bebas. */
const TRUSTED_DATA_URIS: ReadonlySet<string> = new Set([SMK_BISA_LOGO_SVG, GARUDA_LOGO_SVG]);

const NO_LOGO = { type: 'none' as const, content: '' };

const HTTP_URL_PATTERN = /^https?:\/\/[^\s"'<>]+$/i;
const RELATIVE_PATH_PATTERN = /^\/(?!\/)[^\s"'<>\\]*$/;
const IMG_TAG_SRC_PATTERN = /<img\b[^>]*?\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>"']+))/i;
const ANY_HTTP_URL_PATTERN = /https?:\/\/[^\s"'<>()\]]+/i;

const isSafeHttpUrl = (url: string): boolean => {
  if (!HTTP_URL_PATTERN.test(url)) return false;
  try {
    const { protocol } = new URL(url);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};

const toImageResult = (content: string): { type: 'img'; content: string } => ({
  type: 'img',
  content,
});

export const parseLogoEmbed = (
  embedCode: string
): { type: 'img' | 'none'; content: string } => {
  const input = (embedCode ?? '').trim();
  if (!input) return NO_LOGO;

  // 1. Preset bawaan (data URI tepercaya) — hanya bila sama persis.
  if (TRUSTED_DATA_URIS.has(input)) return toImageResult(input);

  // 2. Ada markup: ambil URL dari <img src="..."> saja; selain itu ditolak.
  if (input.includes('<') || input.includes('>')) {
    const match = IMG_TAG_SRC_PATTERN.exec(input);
    const src = (match?.[1] ?? match?.[2] ?? match?.[3] ?? '').trim().replace(/&amp;/gi, '&');
    const cleaned = cleanImageUrl(src);
    return isSafeHttpUrl(cleaned) ? toImageResult(cleaned) : NO_LOGO;
  }

  // 3. URL polos: http(s) atau path relatif berawalan "/".
  const cleaned = cleanImageUrl(input);
  if (isSafeHttpUrl(cleaned) || RELATIVE_PATH_PATTERN.test(cleaned)) {
    return toImageResult(cleaned);
  }

  // 4. Teks lain yang memuat URL (mis. markdown ![alt](https://...)): ambil URL pertama.
  const anyUrl = ANY_HTTP_URL_PATTERN.exec(input);
  if (anyUrl) {
    const url = cleanImageUrl(anyUrl[0]);
    if (isSafeHttpUrl(url)) return toImageResult(url);
  }

  return NO_LOGO;
};

/** Nilai logo yang aman disimpan: URL murni, atau string kosong bila tidak valid. */
export const toLogoUrl = (input: string): string => {
  const parsed = parseLogoEmbed(input);
  return parsed.type === 'img' ? parsed.content : '';
};

/** Pastikan config selalu menyimpan logo sebagai URL (data lama berupa HTML/SVG dibersihkan). */
export const normalizePrintConfig = (config: PrintConfig): PrintConfig => ({
  ...config,
  logoEmbedCode: toLogoUrl(config.logoEmbedCode),
});
