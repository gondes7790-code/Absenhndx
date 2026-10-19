import { PrintConfig } from '../types';

export const APP_LOGO_URL =
  'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhYKnZQtngqKIln1uLBVvStR512j7QPf5q66cbDXh58rZKdjSpK71BUECeQS6yGOw17WCBLSLPwnJxEu4ghxoLsKdsQ0jckGJfEute9VIZjkn0IglM5a8QTTcH9x7_TSp-BP52AsIRfFtAkRcfO1uXhOyuYr1ud7N4AiGg5HG1P6VLxFENCnPZOV9I6BJON/s1254/56332.png';

export const TUT_WURI_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="48" fill="%230f4c81" stroke="%23facc15" stroke-width="3"/><polygon points="50,15 63,40 90,40 68,56 77,82 50,66 23,82 32,56 10,40 37,40" fill="%23facc15"/><circle cx="50" cy="48" r="14" fill="%23ffffff"/><polygon points="50,38 54,46 62,47 56,53 58,61 50,57 42,61 44,53 38,47 46,46" fill="%23dc2626"/></svg>`;

export const SMK_BISA_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120"><rect width="120" height="120" rx="24" fill="%231e3a8a"/><circle cx="60" cy="60" r="45" fill="%23f59e0b"/><polygon points="60,25 70,50 95,50 75,65 83,90 60,75 37,90 45,65 25,50 50,50" fill="%23ffffff"/><text x="60" y="112" font-family="Arial,sans-serif" font-size="12" font-weight="900" fill="%23ffffff" text-anchor="middle">SMK BISA!</text></svg>`;

export const GARUDA_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="48" fill="%23ffffff" stroke="%23b45309" stroke-width="3"/><path d="M50 15 L65 35 L85 45 L65 60 L70 85 L50 72 L30 85 L35 60 L15 45 L35 35 Z" fill="%23d97706"/><rect x="42" y="42" width="16" height="16" fill="%23dc2626" stroke="%23000000" stroke-width="1.5"/></svg>`;

/** Render SVG as an image resource, never as HTML, to prevent markup execution. */
export const svgToDataUrl = (svg: string): string =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

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
      return {
        ...DEFAULT_PRINT_CONFIG,
        ...parsed,
        schoolName: parsed.schoolName || defaultSchoolName || DEFAULT_PRINT_CONFIG.schoolName,
      };
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
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
 * Parses user input for logo:
 * - HTML <img> embed code (extracts src attribute)
 * - Raw SVG code (<svg...>...</svg>) even with XML headers or wrapper tags
 * - SVG data URIs (data:image/svg+xml;...)
 * - Markdown image syntax ![alt](url)
 * - <iframe> / <embed> src tags
 * - Direct image URL (https://..., http://..., data:image/...)
 */
export const parseLogoEmbed = (
  embedCode: string
): { type: 'img' | 'svg' | 'none'; content: string } => {
  if (!embedCode || !embedCode.trim()) {
    return { type: 'none', content: '' };
  }

  const trimmed = embedCode.trim();

  // 1. Check for SVG markup anywhere in string (handles <?xml ...>, comments, wrappers)
  const svgMatch = trimmed.match(/<svg[\s\S]*?<\/svg>/i);
  if (svgMatch && svgMatch[0]) {
    return { type: 'svg', content: svgMatch[0] };
  }

  // 2. Check for data:image/svg+xml;utf8,<svg...
  if (trimmed.startsWith('data:image/svg+xml;utf8,<svg') || trimmed.startsWith('data:image/svg+xml,<svg')) {
    const rawSvg = decodeURIComponent(
      trimmed.replace(/^data:image\/svg\+xml(?:;utf8)?,/, '')
    );
    return { type: 'svg', content: rawSvg };
  }

  // 3. Check for HTML <img> tag with src
  const imgMatch = trimmed.match(/<img[^>]+src=["']?([^"'>\s]+)["']?/i);
  if (imgMatch && imgMatch[1]) {
    return { type: 'img', content: cleanImageUrl(imgMatch[1]) };
  }

  // 4. Check for any tag with src (iframe, embed, object)
  const srcMatch = trimmed.match(/src=["']?([^"'>\s]+)["']?/i);
  if (srcMatch && srcMatch[1]) {
    return { type: 'img', content: cleanImageUrl(srcMatch[1]) };
  }

  // 5. Check for Markdown image syntax ![alt](url)
  const mdMatch = trimmed.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/i);
  if (mdMatch && mdMatch[1]) {
    return { type: 'img', content: cleanImageUrl(mdMatch[1]) };
  }

  // 6. Direct URLs or Data URIs
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('./')
  ) {
    return { type: 'img', content: cleanImageUrl(trimmed) };
  }

  // 7. General URL regex fallback (e.g. if user pasted arbitrary text containing a URL)
  const anyUrlMatch = trimmed.match(/(https?:\/\/[^\s"'<>]+)/i);
  if (anyUrlMatch && anyUrlMatch[1]) {
    return { type: 'img', content: cleanImageUrl(anyUrlMatch[1]) };
  }

  return { type: 'none', content: '' };
};
