import { GradeRecord, Student } from '../../types';

/** Predikat Kurikulum Merdeka berdasarkan nilai akhir & KKM. */
export function getPredikat(score: number, kkm: number) {
  if (score >= 90) return { letter: 'A', text: 'Sangat Baik', bg: 'bg-[#bbf7d0] text-emerald-950 border-slate-900' };
  if (score >= 80) return { letter: 'B', text: 'Baik', bg: 'bg-[#bae6fd] text-sky-950 border-slate-900' };
  if (score >= kkm) return { letter: 'C', text: 'Cukup', bg: 'bg-[#fef08a] text-amber-950 border-slate-900' };
  return { letter: 'D', text: 'Perlu Bimbingan', bg: 'bg-[#fecdd3] text-rose-950 border-slate-900' };
}

/** Statistik kelas: rata-rata, jumlah tuntas, persentase ketuntasan. */
export function computeClassStats(
classStudents: Student[],
gradesMap: Map<string, GradeRecord>,
formatifColumns: number,
kkm: number
) {
  let totalScoreSum = 0;
  let studentsWithScores = 0;
  let tuntasCount = 0;

  classStudents.forEach((s) => {
    const g = gradesMap.get(s.id);
    const validFormatif = (g?.formatif || [])
      .slice(0, formatifColumns)
      .filter((v): v is number => v !== null && !isNaN(v));

    if (validFormatif.length > 0 || g?.sts !== null || g?.sas !== null) {
      studentsWithScores++;
      const formatifAvg = validFormatif.length > 0
        ? validFormatif.reduce((a, b) => a + b, 0) / validFormatif.length
        : 0;
      const sts = g?.sts ?? formatifAvg;
      const sas = g?.sas ?? formatifAvg;
      const finalScore = Math.round((formatifAvg * 0.5) + (sts * 0.25) + (sas * 0.25));

      totalScoreSum += finalScore;
      if (finalScore >= kkm) {
        tuntasCount++;
      }
    }
  });

  const classAverage = studentsWithScores > 0 ? (totalScoreSum / studentsWithScores).toFixed(1) : '0';
  const tuntasPercent = studentsWithScores > 0 ? Math.round((tuntasCount / studentsWithScores) * 100) : 0;

  return { classAverage, tuntasCount, studentsWithScores, tuntasPercent };
}

/** Unduh CSV buku nilai (sesuai urutan/filter yang tampil). */
export function exportGradesCsv(
filteredStudents: Student[],
gradesMap: Map<string, GradeRecord>,
formatifColumns: number,
kkm: number,
className: string | undefined
): void {
  const headers = [
    'No',
    'NISN',
    'Nama Siswa',
    ...Array.from({ length: formatifColumns }, (_, i) => `TP ${i + 1}`),
    'STS',
    'SAS',
    'Nilai Akhir',
    'Predikat',
    'Catatan Capaian Kompetensi',
  ];

  const rows = filteredStudents.map((s, idx) => {
    const g = gradesMap.get(s.id);
    const validFormatif = (g?.formatif || []).slice(0, formatifColumns).map(v => v ?? '');
    const fAvg = validFormatif.filter(v => typeof v === 'number').reduce((a, b) => (a as number) + (b as number), 0) / (validFormatif.filter(v => typeof v === 'number').length || 1);
    const sts = g?.sts ?? fAvg;
    const sas = g?.sas ?? fAvg;
    const finalScore = Math.round(((fAvg as number) * 0.5) + (sts * 0.25) + (sas * 0.25));
    const pred = getPredikat(finalScore, kkm);

    return [
      idx + 1,
      `"${s.nisn}"`,
      `"${s.nama}"`,
      ...validFormatif,
      g?.sts ?? '',
      g?.sas ?? '',
      finalScore,
      pred.letter,
      `"${g?.deskripsi || ''}"`,
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Penilaian_Merdeka_${className || 'Kelas'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
