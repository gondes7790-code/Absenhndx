import { JournalEntry } from '../../types';

/** Unduh CSV agenda mengajar (sesuai filter yang tampil). */
export function exportJournalsCsv(journals: JournalEntry[], teacherHandle: string): void {
  const headers = ['NO', 'TANGGAL', 'KELAS', 'MAPEL', 'PERTEMUAN', 'JAM', 'MATERI & KEGIATAN TP', 'CATATAN ABSENSI'];
  const rows = journals.map((j, idx) =>
    [
      idx + 1,
      `"${j.tanggal}"`,
      `"${j.className}"`,
      `"${j.mapel}"`,
      `"${j.pertemuanKe}"`,
      `"${j.jamPelajaran}"`,
      `"${j.materiKegiatan.replace(/"/g, '""')}"`,
      `"${(j.absensiCatatan || '').replace(/"/g, '""')}"`,
    ].join(',')
  );

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Agenda_Mengajar_${teacherHandle}_2026.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
