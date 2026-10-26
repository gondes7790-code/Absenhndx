import { AttendanceRecord, Student } from '../../types';

export interface AttendanceMetrics {
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  dispen: number;
  belumDiisi: number;
  total: number;
  percentage: number;
}

/** Ringkasan kehadiran satu sesi untuk murid satu kelas. */
export function computeAttendanceMetrics(
  classStudents: Student[],
  recordsMap: Map<string, AttendanceRecord>
): AttendanceMetrics {
  let hadir = 0;
  let sakit = 0;
  let izin = 0;
  let alpa = 0;
  let dispen = 0;
  let belumDiisi = 0;

  classStudents.forEach((std) => {
    const status = recordsMap.get(std.id)?.status;
    if (status === 'H') hadir++;
    else if (status === 'S') sakit++;
    else if (status === 'I') izin++;
    else if (status === 'A') alpa++;
    else if (status === 'D') dispen++;
    else belumDiisi++;
  });

  const total = classStudents.length || 1;
  return {
    hadir,
    sakit,
    izin,
    alpa,
    dispen,
    belumDiisi,
    total: classStudents.length,
    percentage: Math.round((hadir / total) * 100),
  };
}
