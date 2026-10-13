import { PrintConfig } from '../types';

export const TUT_WURI_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="48" fill="%230f4c81" stroke="%23facc15" stroke-width="3"/><polygon points="50,15 63,40 90,40 68,56 77,82 50,66 23,82 32,56 10,40 37,40" fill="%23facc15"/><circle cx="50" cy="48" r="14" fill="%23ffffff"/><polygon points="50,38 54,46 62,47 56,53 58,61 50,57 42,61 44,53 38,47 46,46" fill="%23dc2626"/></svg>`;

export const SMK_BISA_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120"><rect width="120" height="120" rx="24" fill="%231e3a8a"/><circle cx="60" cy="60" r="45" fill="%23f59e0b"/><polygon points="60,25 70,50 95,50 75,65 83,90 60,75 37,90 45,65 25,50 50,50" fill="%23ffffff"/><text x="60" y="112" font-family="Arial,sans-serif" font-size="12" font-weight="900" fill="%23ffffff" text-anchor="middle">SMK BISA!</text></svg>`;

export const GARUDA_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="48" fill="%23ffffff" stroke="%23b45309" stroke-width="3"/><path d="M50 15 L65 35 L85 45 L65 60 L70 85 L50 72 L30 85 L35 60 L15 45 L35 35 Z" fill="%23d97706"/><rect x="42" y="42" width="16" height="16" fill="%23dc2626" stroke="%23000000" stroke-width="1.5"/></svg>`;

export const DEFAULT_PRINT_CONFIG: PrintConfig = {
  dinasHeader: 'PEMERINTAH DAERAH PROVINSI • DINAS PENDIDIKAN',
  dinasSubHeader: 'CABANG DINAS PENDIDIKAN WILAYAH SATUAN PENDIDIKAN MENENGAH KEJURUAN',
  schoolName: 'SMK MERDEKA INDONESIA',
  unitSubHeader: 'SISTEM MANAJEMEN PRESENSI & ASESMEN KURIKULUM MERDEKA',
  address: 'Jl. Merdeka Belajar No. 45, Kompleks Pendidikan Kejuruan Terpadu',
  phone: 'Telp. (021) 7890123 / Fax. (021) 7890124',
  emailWeb: 'info@smkmerdeka.sch.id • https://hadir.app',
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
 * Parses user input for logo:
 * - HTML <img> embed code (extracts src attribute)
 * - Raw SVG code (<svg...>...</svg>)
 * - Direct image URL (https://... or data:image/...)
 */
export const parseLogoEmbed = (
  embedCode: string
): { type: 'img' | 'svg' | 'none'; content: string } => {
  if (!embedCode || !embedCode.trim()) {
    return { type: 'none', content: '' };
  }

  const trimmed = embedCode.trim();

  // If user pasted an SVG
  if (trimmed.startsWith('<svg') && trimmed.endsWith('</svg>')) {
    return { type: 'svg', content: trimmed };
  }

  // If user pasted an <img> tag with src
  const imgMatch = trimmed.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    return { type: 'img', content: imgMatch[1] };
  }

  // If user pasted iframe or other tag with src
  const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (srcMatch && srcMatch[1]) {
    return { type: 'img', content: srcMatch[1] };
  }

  // If user pasted a direct URL or data URI
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('./')
  ) {
    return { type: 'img', content: trimmed };
  }

  // Fallback: if it has any url-like structure
  return { type: 'img', content: trimmed };
};
