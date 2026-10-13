import React from 'react';
import { Printer, X, Download, FileText, CheckCircle2 } from 'lucide-react';
import {
  Student,
  AttendanceSession,
  AttendanceRecord,
  GradeRecord,
  JournalEntry,
  ClassRoom,
  TeacherProfile,
} from '../types';

export type PrintableDocumentType = 'attendance' | 'recap' | 'gradebook' | 'journal';

interface PrintableDocumentProps {
  type: PrintableDocumentType;
  isOpen?: boolean;
  onClose?: () => void;
  activeClass: ClassRoom;
  teacher: TeacherProfile;
  schoolName: string;
  // Specific data
  students?: Student[];
  session?: AttendanceSession;
  sessions?: AttendanceSession[];
  attendanceRecords?: AttendanceRecord[];
  grades?: GradeRecord[];
  journals?: JournalEntry[];
}

export const PrintableDocument: React.FC<PrintableDocumentProps> = ({
  type,
  isOpen = false,
  onClose,
  activeClass,
  teacher,
  schoolName,
  students = [],
  session,
  sessions = [],
  attendanceRecords = [],
  grades = [],
  journals = [],
}) => {
  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  // Content renderer based on type
  const renderDocumentContent = () => {
    switch (type) {
      case 'attendance': {
        const activeSess = session || sessions[0];
        const recordsMap = new Map<string, AttendanceRecord>();
        if (activeSess) {
          attendanceRecords
            .filter((r) => r.sessionId === activeSess.id)
            .forEach((r) => recordsMap.set(r.studentId, r));
        }

        let hadirCount = 0;
        let sakitCount = 0;
        let izinCount = 0;
        let alpaCount = 0;
        let dispenCount = 0;
        let belumDiabsen = 0;

        students.forEach((s) => {
          const rec = recordsMap.get(s.id);
          const st = rec?.status;
          if (st === 'H') hadirCount++;
          else if (st === 'S') sakitCount++;
          else if (st === 'I') izinCount++;
          else if (st === 'A') alpaCount++;
          else if (st === 'D') dispenCount++;
          else belumDiabsen++;
        });

        const percent = students.length > 0 ? Math.round((hadirCount / students.length) * 100) : 0;

        return (
          <div className="text-black bg-white">
            <div className="text-center mb-4">
              <h2 className="text-base font-bold uppercase tracking-wider underline">
                DAFTAR HADIR SISWA PERTEMUAN TATAP MUKA
              </h2>
              <p className="text-xs font-semibold mt-1">
                Pertemuan Ke-{activeSess?.pertemuanKe || 1} • Tanggal:{' '}
                {activeSess ? activeSess.tanggal : todayFormatted}
              </p>
            </div>

            {/* Meta Table */}
            <table className="w-full text-xs mb-3 border-none">
              <tbody>
                <tr>
                  <td className="w-28 font-semibold py-0.5">Satuan Pendidikan</td>
                  <td className="w-3 py-0.5">:</td>
                  <td className="py-0.5 font-bold">{schoolName}</td>
                  <td className="w-28 font-semibold py-0.5">Mata Pelajaran</td>
                  <td className="w-3 py-0.5">:</td>
                  <td className="py-0.5">{activeSess?.mapel || activeClass.mapel}</td>
                </tr>
                <tr>
                  <td className="font-semibold py-0.5">Kelas / Rombel</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5 font-bold">{activeClass.nama}</td>
                  <td className="font-semibold py-0.5">Tahun Ajaran</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">
                    {activeClass.tahunAjaran} ({activeClass.semester})
                  </td>
                </tr>
                <tr>
                  <td className="font-semibold py-0.5">Guru Pengampu</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{teacher.name}</td>
                  <td className="font-semibold py-0.5">Topik / Materi</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5 italic">
                    {activeSess?.catatan || 'Praktikum dan Pembelajaran Tatap Muka'}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Formal Data Table */}
            <table className="w-full text-[11px] border-collapse border border-black mb-4">
              <thead>
                <tr className="bg-slate-100 font-bold text-center">
                  <th className="border border-black py-1.5 px-2 w-10">NO</th>
                  <th className="border border-black py-1.5 px-2 w-28">NISN</th>
                  <th className="border border-black py-1.5 px-3 text-left">NAMA SISWA</th>
                  <th className="border border-black py-1.5 px-2 w-12">L/P</th>
                  <th className="border border-black py-1.5 px-2 w-20">STATUS</th>
                  <th className="border border-black py-1.5 px-3 text-left">KETERANGAN / ALASAN</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => {
                  const rec = recordsMap.get(student.id);
                  const status = rec?.status || '-';
                  let statusLabel = '-';
                  if (status === 'H') statusLabel = 'Hadir';
                  else if (status === 'S') statusLabel = 'Sakit';
                  else if (status === 'I') statusLabel = 'Izin';
                  else if (status === 'A') statusLabel = 'Alfa';
                  else if (status === 'D') statusLabel = 'Dispen';

                  return (
                    <tr key={student.id} className="text-center even:bg-slate-50/50">
                      <td className="border border-black py-1 px-2 font-mono">{idx + 1}</td>
                      <td className="border border-black py-1 px-2 font-mono">{student.nisn}</td>
                      <td className="border border-black py-1 px-3 text-left font-medium">
                        {student.nama}
                      </td>
                      <td className="border border-black py-1 px-2 font-mono">{student.gender}</td>
                      <td className="border border-black py-1 px-2 font-bold font-mono">
                        {statusLabel}
                      </td>
                      <td className="border border-black py-1 px-3 text-left italic">
                        {rec?.keterangan || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Summary Statistics Box */}
            <div className="border border-black p-2 mb-6 text-xs bg-slate-50">
              <span className="font-bold underline block mb-1">Rekapitulasi Kehadiran:</span>
              <div className="grid grid-cols-6 gap-2 text-center font-semibold">
                <div>Total Siswa: {students.length}</div>
                <div>Hadir (H): {hadirCount}</div>
                <div>Sakit (S): {sakitCount}</div>
                <div>Izin (I): {izinCount}</div>
                <div>Alfa (A): {alpaCount}</div>
                <div>% Kehadiran: {percent}%</div>
              </div>
            </div>
          </div>
        );
      }

      case 'recap': {
        const studentRecaps = students.map((std) => {
          let h = 0;
          let s = 0;
          let i = 0;
          let a = 0;
          let d = 0;

          attendanceRecords
            .filter((rec) => rec.studentId === std.id && sessions.some((sess) => sess.id === rec.sessionId))
            .forEach((rec) => {
              if (rec.status === 'H') h++;
              else if (rec.status === 'S') s++;
              else if (rec.status === 'I') i++;
              else if (rec.status === 'A') a++;
              else if (rec.status === 'D') d++;
            });

          const total = h + s + i + a + d || 1;
          const percentage = Math.round((h / total) * 100);
          return { student: std, h, s, i, a, d, percentage };
        });

        return (
          <div className="text-black bg-white">
            <div className="text-center mb-4">
              <h2 className="text-base font-bold uppercase tracking-wider underline">
                REKAPITULASI PRESENSI & KEHADIRAN SISWA
              </h2>
              <p className="text-xs font-semibold mt-1">
                Tahun Ajaran {activeClass.tahunAjaran} • Semester {activeClass.semester}
              </p>
            </div>

            {/* Meta Table */}
            <table className="w-full text-xs mb-3 border-none">
              <tbody>
                <tr>
                  <td className="w-28 font-semibold py-0.5">Satuan Pendidikan</td>
                  <td className="w-3 py-0.5">:</td>
                  <td className="py-0.5 font-bold">{schoolName}</td>
                  <td className="w-28 font-semibold py-0.5">Jumlah Sesi Selesai</td>
                  <td className="w-3 py-0.5">:</td>
                  <td className="py-0.5">{sessions.length} Pertemuan</td>
                </tr>
                <tr>
                  <td className="font-semibold py-0.5">Kelas / Rombel</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5 font-bold">{activeClass.nama}</td>
                  <td className="font-semibold py-0.5">Guru Pengampu</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{teacher.name}</td>
                </tr>
              </tbody>
            </table>

            {/* Formal Recap Table */}
            <table className="w-full text-[11px] border-collapse border border-black mb-6">
              <thead>
                <tr className="bg-slate-100 font-bold text-center">
                  <th className="border border-black py-1.5 px-1 w-8">NO</th>
                  <th className="border border-black py-1.5 px-2 w-24">NISN</th>
                  <th className="border border-black py-1.5 px-3 text-left">NAMA SISWA</th>
                  <th className="border border-black py-1.5 px-1 w-10">L/P</th>
                  <th className="border border-black py-1.5 px-1 w-10">H</th>
                  <th className="border border-black py-1.5 px-1 w-10">S</th>
                  <th className="border border-black py-1.5 px-1 w-10">I</th>
                  <th className="border border-black py-1.5 px-1 w-10">A</th>
                  <th className="border border-black py-1.5 px-1 w-10">D</th>
                  <th className="border border-black py-1.5 px-1 w-14">%</th>
                  <th className="border border-black py-1.5 px-2 w-28 text-left">KETERANGAN</th>
                </tr>
              </thead>
              <tbody>
                {studentRecaps.map((item, idx) => (
                  <tr key={item.student.id} className="text-center even:bg-slate-50/50">
                    <td className="border border-black py-1 px-1 font-mono">{idx + 1}</td>
                    <td className="border border-black py-1 px-2 font-mono">{item.student.nisn}</td>
                    <td className="border border-black py-1 px-3 text-left font-medium">
                      {item.student.nama}
                    </td>
                    <td className="border border-black py-1 px-1 font-mono">{item.student.gender}</td>
                    <td className="border border-black py-1 px-1 font-mono">{item.h}</td>
                    <td className="border border-black py-1 px-1 font-mono">{item.s}</td>
                    <td className="border border-black py-1 px-1 font-mono">{item.i}</td>
                    <td className="border border-black py-1 px-1 font-mono">{item.a}</td>
                    <td className="border border-black py-1 px-1 font-mono">{item.d}</td>
                    <td className="border border-black py-1 px-1 font-mono font-bold">
                      {item.percentage}%
                    </td>
                    <td className="border border-black py-1 px-2 text-left text-[10px]">
                      {item.percentage >= 90
                        ? 'Sangat Baik'
                        : item.percentage >= 80
                        ? 'Baik'
                        : 'Perlu Pembinaan'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      case 'gradebook': {
        const gradeList = students.map((std) => {
          const g = grades.find((gr) => gr.studentId === std.id);
          const validFormatif = (g?.formatif || []).filter(
            (v): v is number => v !== null && !isNaN(v)
          );
          const formatifAvg =
            validFormatif.length > 0
              ? validFormatif.reduce((a, b) => a + b, 0) / validFormatif.length
              : 0;
          const sts = g?.sts ?? (formatifAvg ? Math.round(formatifAvg) : null);
          const sas = g?.sas ?? (formatifAvg ? Math.round(formatifAvg) : null);
          const finalScore = Math.round(formatifAvg * 0.5 + (sts || 0) * 0.25 + (sas || 0) * 0.25);
          return {
            student: std,
            formatif: g?.formatif || [],
            formatifAvg: Math.round(formatifAvg),
            sts,
            sas,
            finalScore,
            deskripsi: g?.deskripsi || 'Mencapai tujuan pembelajaran dengan kriteria baik.',
          };
        });

        return (
          <div className="text-black bg-white">
            <div className="text-center mb-4">
              <h2 className="text-base font-bold uppercase tracking-wider underline">
                BUKU DAFTAR NILAI & CAPAIAN ASESMEN KURIKULUM MERDEKA
              </h2>
              <p className="text-xs font-semibold mt-1">
                Tahun Ajaran {activeClass.tahunAjaran} • Semester {activeClass.semester}
              </p>
            </div>

            {/* Meta Table */}
            <table className="w-full text-xs mb-3 border-none">
              <tbody>
                <tr>
                  <td className="w-28 font-semibold py-0.5">Satuan Pendidikan</td>
                  <td className="w-3 py-0.5">:</td>
                  <td className="py-0.5 font-bold">{schoolName}</td>
                  <td className="w-28 font-semibold py-0.5">KKM / Kriteria TP</td>
                  <td className="w-3 py-0.5">:</td>
                  <td className="py-0.5">{activeClass.kkm}</td>
                </tr>
                <tr>
                  <td className="font-semibold py-0.5">Kelas / Rombel</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5 font-bold">{activeClass.nama}</td>
                  <td className="font-semibold py-0.5">Mata Pelajaran</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5 font-bold">{activeClass.mapel}</td>
                </tr>
              </tbody>
            </table>

            {/* Formal Grade Table */}
            <table className="w-full text-[10px] border-collapse border border-black mb-6">
              <thead>
                <tr className="bg-slate-100 font-bold text-center">
                  <th className="border border-black py-1.5 px-1 w-7">NO</th>
                  <th className="border border-black py-1.5 px-2 w-20">NISN</th>
                  <th className="border border-black py-1.5 px-2 text-left">NAMA SISWA</th>
                  <th className="border border-black py-1.5 px-1 w-8">L/P</th>
                  <th className="border border-black py-1.5 px-1 w-9">TP 1</th>
                  <th className="border border-black py-1.5 px-1 w-9">TP 2</th>
                  <th className="border border-black py-1.5 px-1 w-9">TP 3</th>
                  <th className="border border-black py-1.5 px-1 w-9">TP 4</th>
                  <th className="border border-black py-1.5 px-1 w-9">TP 5</th>
                  <th className="border border-black py-1.5 px-1 w-10">RATA</th>
                  <th className="border border-black py-1.5 px-1 w-9">STS</th>
                  <th className="border border-black py-1.5 px-1 w-9">SAS</th>
                  <th className="border border-black py-1.5 px-1 w-10 font-black">AKHIR</th>
                  <th className="border border-black py-1.5 px-2 text-left">DESKRIPSI CAPAIAN</th>
                </tr>
              </thead>
              <tbody>
                {gradeList.map((item, idx) => (
                  <tr key={item.student.id} className="text-center even:bg-slate-50/50">
                    <td className="border border-black py-1 px-1 font-mono">{idx + 1}</td>
                    <td className="border border-black py-1 px-1 font-mono">{item.student.nisn}</td>
                    <td className="border border-black py-1 px-2 text-left font-medium">
                      {item.student.nama}
                    </td>
                    <td className="border border-black py-1 px-1 font-mono">{item.student.gender}</td>
                    <td className="border border-black py-1 px-1 font-mono">{item.formatif[0] ?? '-'}</td>
                    <td className="border border-black py-1 px-1 font-mono">{item.formatif[1] ?? '-'}</td>
                    <td className="border border-black py-1 px-1 font-mono">{item.formatif[2] ?? '-'}</td>
                    <td className="border border-black py-1 px-1 font-mono">{item.formatif[3] ?? '-'}</td>
                    <td className="border border-black py-1 px-1 font-mono">{item.formatif[4] ?? '-'}</td>
                    <td className="border border-black py-1 px-1 font-mono font-semibold">
                      {item.formatifAvg || '-'}
                    </td>
                    <td className="border border-black py-1 px-1 font-mono">{item.sts ?? '-'}</td>
                    <td className="border border-black py-1 px-1 font-mono">{item.sas ?? '-'}</td>
                    <td className="border border-black py-1 px-1 font-mono font-bold text-black">
                      {item.finalScore}
                    </td>
                    <td className="border border-black py-1 px-2 text-left text-[9px] italic">
                      {item.deskripsi}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      case 'journal': {
        const classJournals = journals.filter(
          (j) => j.classId === activeClass.id || j.className === activeClass.nama
        );
        const listToDisplay = classJournals.length > 0 ? classJournals : journals;

        return (
          <div className="text-black bg-white">
            <div className="text-center mb-4">
              <h2 className="text-base font-bold uppercase tracking-wider underline">
                BUKU AGENDA & JURNAL MENGAJAR HARIAN PENDIDIK
              </h2>
              <p className="text-xs font-semibold mt-1">
                Tahun Ajaran {activeClass.tahunAjaran} • Semester {activeClass.semester}
              </p>
            </div>

            {/* Meta Table */}
            <table className="w-full text-xs mb-3 border-none">
              <tbody>
                <tr>
                  <td className="w-28 font-semibold py-0.5">Satuan Pendidikan</td>
                  <td className="w-3 py-0.5">:</td>
                  <td className="py-0.5 font-bold">{schoolName}</td>
                  <td className="w-28 font-semibold py-0.5">Nama Pendidik</td>
                  <td className="w-3 py-0.5">:</td>
                  <td className="py-0.5 font-bold">{teacher.name}</td>
                </tr>
                <tr>
                  <td className="font-semibold py-0.5">Kelas / Rombel</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{activeClass.nama}</td>
                  <td className="font-semibold py-0.5">NIP / NUPTK</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5">{teacher.nip}</td>
                </tr>
              </tbody>
            </table>

            {/* Formal Journal Table */}
            <table className="w-full text-[10px] border-collapse border border-black mb-6">
              <thead>
                <tr className="bg-slate-100 font-bold text-center">
                  <th className="border border-black py-1.5 px-1 w-7">NO</th>
                  <th className="border border-black py-1.5 px-2 w-20">TANGGAL</th>
                  <th className="border border-black py-1.5 px-1 w-16">PERTEMUAN</th>
                  <th className="border border-black py-1.5 px-2 w-20">JAM KE-</th>
                  <th className="border border-black py-1.5 px-2 w-24">KELAS & MAPEL</th>
                  <th className="border border-black py-1.5 px-3 text-left">
                    MATERI / TUJUAN PEMBELAJARAN (TP)
                  </th>
                  <th className="border border-black py-1.5 px-3 text-left w-48">
                    CATATAN KEHADIRAN & DINAMIKA KELAS
                  </th>
                </tr>
              </thead>
              <tbody>
                {listToDisplay.map((j, idx) => (
                  <tr key={j.id || idx} className="text-center even:bg-slate-50/50">
                    <td className="border border-black py-1 px-1 font-mono">{idx + 1}</td>
                    <td className="border border-black py-1 px-2 font-mono">{j.tanggal}</td>
                    <td className="border border-black py-1 px-1 font-bold">{j.pertemuanKe}</td>
                    <td className="border border-black py-1 px-2">{j.jamPelajaran}</td>
                    <td className="border border-black py-1 px-2 font-semibold text-left">
                      {j.className}
                    </td>
                    <td className="border border-black py-1 px-3 text-left font-medium">
                      {j.materiKegiatan}
                    </td>
                    <td className="border border-black py-1 px-3 text-left text-[9px] italic">
                      {j.absensiCatatan || 'Siswa hadir tertib.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }
  };

  // The Formal Paper Document (Kertas Siap Cetak Resmi Standar Sekolah)
  const paperSheet = (
    <div className="printable-sheet bg-white text-black p-8 sm:p-10 font-sans max-w-[210mm] mx-auto border-0 shadow-none leading-normal">
      {/* Official School Letterhead (Kop Surat Resmi) */}
      <div className="border-b-4 border-double border-black pb-3 mb-4 text-center">
        <h3 className="text-xs font-bold tracking-widest uppercase">
          PEMERINTAH PROVINSI • DINAS PENDIDIKAN DAN KEBUDAYAAN
        </h3>
        <h1 className="text-2xl font-black tracking-wider uppercase mt-0.5">
          {schoolName}
        </h1>
        <p className="text-[11px] text-black font-medium mt-0.5">
          SISTEM INFORMASI MANAJEMEN PRESENSI & KURIKULUM MERDEKA INDONESIA
        </p>
        <p className="text-[10px] text-slate-800 font-mono mt-0.5">
          Tautan Portal Publik: hadir.app • Pengampu: {teacher.name} ({teacher.nip})
        </p>
      </div>

      {/* Main Document Content */}
      {renderDocumentContent()}

      {/* Official Signatures Block (Tanda Tangan Pengesahan) */}
      <div className="mt-8 pt-4 grid grid-cols-2 gap-8 text-xs text-center break-inside-avoid">
        <div>
          <p className="font-semibold">Mengetahui,</p>
          <p className="font-bold">Kepala Sekolah {schoolName}</p>
          <div className="h-16" />
          <p className="font-bold underline uppercase">Drs. H. Mulyadi, M.Pd.</p>
          <p className="text-[10px] font-mono">NIP. 19680512 199403 1 004</p>
        </div>

        <div>
          <p className="font-semibold">Kota, {todayFormatted}</p>
          <p className="font-bold">Guru Mata Pelajaran / Pendidik</p>
          <div className="h-16" />
          <p className="font-bold underline uppercase">{teacher.name}</p>
          <p className="text-[10px] font-mono">NIP. {teacher.nip}</p>
        </div>
      </div>
    </div>
  );

  // If in screen modal mode (when previewing the printable sheet)
  if (isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-[8px_8px_0px_#1e293b] border-3 border-slate-900 overflow-hidden my-auto">
          {/* Modal Header */}
          <div className="p-4 bg-[#faf7ee] border-b-2 border-slate-900 flex items-center justify-between no-print">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#dcfce7] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center justify-center text-xl shrink-0">
                📄
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Kertas Dokumen Siap Cetak (Formal A4)
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  Putih bersih tanpa margin/warna web • Standar format laporan dinas pendidikan
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-2xl bg-[#6ee7b7] hover:bg-[#34d399] active:translate-x-[1px] active:translate-y-[1px] text-slate-950 font-black text-xs flex items-center gap-2 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Simpan PDF</span>
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-2xl bg-[#fee2e2] hover:bg-[#fca5a5] text-rose-950 border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] cursor-pointer"
                  title="Tutup Pratinjau"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Paper Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/80 flex justify-center">
            <div className="bg-white shadow-[0_0_20px_rgba(0,0,0,0.15)] rounded-sm w-full max-w-[210mm]">
              {paperSheet}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Hidden on screen, but revealed and printed via @media print!
  return <div className="printable-document hidden-on-screen">{paperSheet}</div>;
};
