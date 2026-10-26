import { AttendanceRecord, AttendanceSession, ClassRoom, Student } from '../../types';
import { AttendanceMetrics } from './attendanceMetrics';

interface WhatsAppReportInput {
  schoolName: string;
  activeClass?: ClassRoom | null;
  activeSession?: AttendanceSession | null;
  classStudents: Student[];
  recordsMap: Map<string, AttendanceRecord>;
  metrics: AttendanceMetrics;
}

/** Teks laporan presensi untuk disalin ke WhatsApp. */
export function buildWhatsAppReport({
schoolName,
activeClass,
activeSession,
classStudents,
recordsMap,
metrics,
}: WhatsAppReportInput): string {
  const absentList: string[] = [];
  classStudents.forEach((s) => {
    const rec = recordsMap.get(s.id);
    if (rec && rec.status && rec.status !== 'H') {
      const ket = rec.keterangan ? ` (${rec.keterangan})` : '';
      absentList.push(`• No. ${s.noUrut} ${s.nama}: [${rec.status}]${ket}`);
    }
  });

  const text = `*LAPORAN PRESENSI HARIAN SISWA*
🏫 *${schoolName}*
📚 Kelas: ${activeClass ? `${activeClass.nama} | ${activeClass.mapel}` : '-'}
📅 Tanggal: ${activeSession ? activeSession.tanggal : '-'} (Pertemuan Ke-${activeSession ? activeSession.pertemuanKe : '-'})
📖 Materi: ${activeSession?.materi || 'Kurikulum Merdeka'}
━━━━━━━━━━━━━━━━━━
📊 *Statistik Kehadiran:*
• Total Siswa: ${classStudents.length}
• Hadir (H): ${metrics.hadir} (${metrics.percentage}%)
• Sakit (S): ${metrics.sakit}
• Izin (I): ${metrics.izin}
• Alpa (A): ${metrics.alpa}
• Dispen (D): ${metrics.dispen}
${metrics.belumDiisi > 0 ? `• Belum Diisi: ${metrics.belumDiisi}\n` : ''}
${
absentList.length > 0
  ? `*Siswa Yang Tidak Hadir:*\n${absentList.join('\n')}`
  : metrics.belumDiisi > 0
  ? `_Catatan: Masih ada ${metrics.belumDiisi} siswa belum diisi presensinya._`
  : '✅ *Semua Siswa Hadir Lengkap (100%)*'
}

━━━━━━━━━━━━━━━━━━
_Laporan resmi dibuat via Sistem Kurikulum Merdeka Hadir! (Tersinkronisasi Otomatis ke Agenda Mengajar)._`;
  return text;
}

/** Unduh CSV presensi (sesuai urutan/filter yang tampil). */
export function exportAttendanceCsv(
filteredStudents: Student[],
recordsMap: Map<string, AttendanceRecord>,
className: string | undefined,
pertemuanKe: number | undefined
): void {
  const headers = ['No', 'NISN', 'Nama Siswa', 'L/P', 'Status', 'Keterangan'];
  const rows = filteredStudents.map((s, idx) => {
    const rec = recordsMap.get(s.id);
    return [
      s.noUrut || idx + 1,
      `"${s.nisn}"`,
      `"${s.nama}"`,
      s.gender,
      rec?.status || '-',
      `"${rec?.keterangan || ''}"`,
    ].join(',');
  });
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute(
    'download',
    `Presensi_${className || 'Kelas'}_Pertemuan_${pertemuanKe || 1}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
