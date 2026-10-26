import { useCallback, useEffect, useState } from 'react';
import { PrintConfig } from '../types';
import { getSavedPrintConfig, savePrintConfig } from '../utils/printConfig';

const DEFAULT_SCHOOL = 'Sekolah Merdeka Indonesia';

/** Konfigurasi kop dokumen cetak (localStorage) + nama sekolah aktif. */
export function usePrintSettings(remoteSchool: string | null) {
  const [printConfig, setPrintConfig] = useState<PrintConfig>(() => getSavedPrintConfig(DEFAULT_SCHOOL));
  const [schoolName, setSchoolName] = useState<string>(
    () => getSavedPrintConfig(DEFAULT_SCHOOL).schoolName || DEFAULT_SCHOOL
  );

  // Nama sekolah dari profil Supabase mengalahkan nilai tersimpan setelah profil dimuat.
  useEffect(() => {
    if (remoteSchool) setSchoolName(remoteSchool);
  }, [remoteSchool]);

  const updatePrintConfig = useCallback((cfg: PrintConfig) => {
    setPrintConfig(cfg);
    setSchoolName(cfg.schoolName);
    savePrintConfig(cfg);
  }, []);

  return { printConfig, schoolName, setSchoolName, updatePrintConfig };
}
