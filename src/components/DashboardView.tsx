import React, { useMemo } from 'react';
import {
  Users,
  CalendarCheck,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  BookOpen,
  Flame,
} from 'lucide-react';
import { Student, AttendanceSession, AttendanceRecord, GradeRecord, FinanceTransaction, ClassRoom, ActiveTab } from '../types';

interface DashboardViewProps {
  activeClass?: ClassRoom | null;
  students: Student[];
  sessions: AttendanceSession[];
  attendanceRecords: AttendanceRecord[];
  grades: GradeRecord[];
  finances: FinanceTransaction[];
  onNavigateTab: (tab: ActiveTab) => void;
  schoolName: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeClass,
  students,
  sessions,
  attendanceRecords,
  grades,
  finances,
  onNavigateTab,
  schoolName,
}) => {
  const kkm = activeClass?.kkm || 75;

  // Compute metrics (scoped to activeClass if available)
  const stats = useMemo(() => {
    const classStudents = activeClass
      ? students.filter((s) => s.classId === activeClass.id)
      : students;
    const classSessions = activeClass
      ? sessions.filter((s) => s.classId === activeClass.id)
      : sessions;
    const classFinances = activeClass
      ? finances.filter((t) => t.classId === activeClass.id)
      : finances;

    // 1. Attendance Average
    const relevantRecords = attendanceRecords.filter((r) =>
      classSessions.some((s) => s.id === r.sessionId)
    );
    const totalRecorded = relevantRecords.length;
    const hadirCount = relevantRecords.filter((r) => r.status === 'H').length;
    const avgAttendance = totalRecorded > 0 ? Math.round((hadirCount / totalRecorded) * 100) : 0;

    // 2. Grades & Predicate distribution
    let predA = 0;
    let predB = 0;
    let predC = 0;
    let predD = 0;
    let sumScore = 0;
    let evaluatedCount = 0;
    let tuntasCount = 0;
    let remedialCount = 0;

    const gradesMap = new Map<string, GradeRecord>();
    grades.forEach((g) => gradesMap.set(g.studentId, g));

    classStudents.forEach((s) => {
      const g = gradesMap.get(s.id);
      const validFormatif = (g?.formatif || []).filter((v): v is number => v !== null && !isNaN(v));
      if (validFormatif.length > 0 || g?.sts !== null || g?.sas !== null) {
        evaluatedCount++;
        const fAvg = validFormatif.length > 0
          ? validFormatif.reduce((a, b) => a + b, 0) / validFormatif.length
          : 0;
        const sts = g?.sts ?? fAvg;
        const sas = g?.sas ?? fAvg;
        const finalScore = Math.round((fAvg * 0.5) + (sts * 0.25) + (sas * 0.25));

        sumScore += finalScore;

        if (finalScore >= 90) predA++;
        else if (finalScore >= 80) predB++;
        else if (finalScore >= kkm) predC++;
        else predD++;

        if (finalScore >= kkm) {
          tuntasCount++;
        } else {
          remedialCount++;
        }
      }
    });

    const avgGrade = evaluatedCount > 0 ? (sumScore / evaluatedCount).toFixed(1) : '0';

    // 3. Finances
    let totalKasDanTabungan = 0;
    classFinances.forEach((tx) => {
      if (tx.tipe === 'Pemasukan') totalKasDanTabungan += tx.nominal;
      else totalKasDanTabungan -= tx.nominal;
    });

    return {
      avgAttendance,
      avgGrade,
      totalStudents: students.length,
      maleCount: students.filter((s) => s.gender === 'L').length,
      femaleCount: students.filter((s) => s.gender === 'P').length,
      totalKasDanTabungan,
      evaluatedCount,
      predA,
      predB,
      predC,
      predD,
      tuntasCount,
      remedialCount,
      pctA: evaluatedCount > 0 ? Math.round((predA / evaluatedCount) * 100) : 0,
      pctB: evaluatedCount > 0 ? Math.round((predB / evaluatedCount) * 100) : 0,
      pctC: evaluatedCount > 0 ? Math.round((predC / evaluatedCount) * 100) : 0,
      pctD: evaluatedCount > 0 ? Math.round((predD / evaluatedCount) * 100) : 0,
      pctTuntas: evaluatedCount > 0 ? Math.round((tuntasCount / evaluatedCount) * 100) : 0,
      pctRemedial: evaluatedCount > 0 ? Math.round((remedialCount / evaluatedCount) * 100) : 0,
    };
  }, [students, sessions, attendanceRecords, grades, finances, kkm]);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Banner Card - Vintage Postmodern Neobrutalist */}
      <div className="bg-[#fffdf8] text-slate-900 rounded-3xl p-4 sm:p-6 border-2 border-slate-900 shadow-[4px_4px_0px_#1e293b] relative overflow-hidden">
        {/* Retro Corner Stamp with Fire */}
        <div className="absolute top-0 right-0 bg-[#ede9fe] border-b-2 border-l-2 border-slate-900 px-3 py-1 rounded-bl-2xl text-[10px] font-mono font-bold text-indigo-950 flex items-center gap-1 shadow-xs">
          <Flame className="w-3 h-3 text-orange-600 fill-orange-500" />
          <span>ANALITIK MERDEKA</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 sm:pt-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#fef9c3] border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-amber-900" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#e0f2fe] text-sky-950 px-2.5 py-0.5 rounded-full border border-slate-900 text-[10px] font-mono font-bold shadow-[1px_1px_0px_#1e293b]">
                  {activeClass?.nama || 'Seluruh Rombel'}
                </span>
                <span className="text-xs font-bold text-slate-500">•</span>
                <span className="text-xs font-bold text-slate-600">{activeClass?.mapel || 'Kurikulum Merdeka'}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Statistik & Analisis Pembelajaran
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                {schoolName} • Ketercapaian Kompetensi Kurikulum Merdeka
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto bg-[#faf7ee] px-3.5 py-2 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b]">
            <span className="text-xs text-slate-700 font-bold">KKM Standar:</span>
            <span className="text-xl font-black text-slate-950 font-mono">{kkm}</span>
          </div>
        </div>

        {/* 4 Summary Metric Cards in Colorful Soft Pastels */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-5 border-t-2 border-slate-100">
          {/* Total Siswa - Pastel Mint */}
          <div className="bg-[#dcfce7] border-2 border-slate-900 rounded-2xl p-3.5 shadow-[3px_3px_0px_#1e293b]">
            <div className="flex items-center justify-between text-emerald-950">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider">Total Siswa</span>
              <Users className="w-4 h-4 text-emerald-900" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-950 font-mono mt-1">
              {stats.totalStudents}
            </p>
            <p className="text-[10px] text-emerald-900 font-bold mt-0.5 truncate">
              {stats.maleCount} Laki • {stats.femaleCount} Perempuan
            </p>
          </div>

          {/* Rata-rata Presensi - Pastel Sky */}
          <div className="bg-[#e0f2fe] border-2 border-slate-900 rounded-2xl p-3.5 shadow-[3px_3px_0px_#1e293b]">
            <div className="flex items-center justify-between text-sky-950">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider">Rata-rata Presensi</span>
              <CalendarCheck className="w-4 h-4 text-sky-900" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-950 font-mono mt-1">
              {stats.avgAttendance}%
            </p>
            <p className="text-[10px] text-sky-900 font-bold mt-0.5">
              {sessions.length} sesi pertemuan KBM
            </p>
          </div>

          {/* Rata-rata Nilai - Pastel Butter */}
          <div className="bg-[#fef9c3] border-2 border-slate-900 rounded-2xl p-3.5 shadow-[3px_3px_0px_#1e293b]">
            <div className="flex items-center justify-between text-amber-950">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider">Rata-rata Nilai</span>
              <Flame className="w-4 h-4 text-amber-900" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-950 font-mono mt-1">
              {stats.avgGrade}
            </p>
            <p className="text-[10px] text-amber-900 font-bold mt-0.5">
              {stats.evaluatedCount} siswa telah dinilai
            </p>
          </div>

          {/* Kas & Tabungan - Pastel Apricot */}
          <div className="bg-[#ffedd5] border-2 border-slate-900 rounded-2xl p-3.5 shadow-[3px_3px_0px_#1e293b]">
            <div className="flex items-center justify-between text-orange-950">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider">Kas & Tabungan</span>
              <Wallet className="w-4 h-4 text-orange-900" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-950 font-mono mt-1 truncate">
              Rp {stats.totalKasDanTabungan.toLocaleString('id-ID')}
            </p>
            <p className="text-[10px] text-orange-900 font-bold mt-0.5">
              {finances.length} catatan mutasi
            </p>
          </div>
        </div>
      </div>

      {/* 2 Main Analysis Cards: Distribusi Predikat & KKTP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Card 1: Distribusi Predikat Kurikulum Merdeka */}
        <div className="bg-white border-2 border-slate-900 rounded-3xl shadow-[4px_4px_0px_#1e293b] overflow-hidden flex flex-col justify-between">
          <div className="p-4 bg-[#ede9fe] border-b-2 border-slate-900 text-slate-900 flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-black tracking-tight text-indigo-950">
              Distribusi Predikat Kurikulum Merdeka
            </h3>
            <span className="text-[10px] bg-white border border-slate-900 px-2 py-0.5 rounded-full font-mono font-bold text-slate-900 shadow-[1px_1px_0px_#1e293b]">
              N = {stats.evaluatedCount} Siswa
            </span>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {/* Predikat A */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <span className="w-3 h-3 rounded-full bg-[#6ee7b7] border border-slate-900" />
                  <span>Sangat Baik (A: 90 - 100)</span>
                </span>
                <span className="font-mono text-slate-900">
                  {stats.predA} Siswa ({stats.pctA}%)
                </span>
              </div>
              <div className="w-full bg-[#faf7ee] border-2 border-slate-900 rounded-full h-3 overflow-hidden p-0.5">
                <div
                  className="bg-[#6ee7b7] h-full rounded-full transition-all"
                  style={{ width: `${stats.pctA}%` }}
                />
              </div>
            </div>

            {/* Predikat B */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <span className="w-3 h-3 rounded-full bg-[#7dd3fc] border border-slate-900" />
                  <span>Baik (B: 80 - 89)</span>
                </span>
                <span className="font-mono text-slate-900">
                  {stats.predB} Siswa ({stats.pctB}%)
                </span>
              </div>
              <div className="w-full bg-[#faf7ee] border-2 border-slate-900 rounded-full h-3 overflow-hidden p-0.5">
                <div
                  className="bg-[#7dd3fc] h-full rounded-full transition-all"
                  style={{ width: `${stats.pctB}%` }}
                />
              </div>
            </div>

            {/* Predikat C */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <span className="w-3 h-3 rounded-full bg-[#fde047] border border-slate-900" />
                  <span>Cukup (C: {kkm} - 79)</span>
                </span>
                <span className="font-mono text-slate-900">
                  {stats.predC} Siswa ({stats.pctC}%)
                </span>
              </div>
              <div className="w-full bg-[#faf7ee] border-2 border-slate-900 rounded-full h-3 overflow-hidden p-0.5">
                <div
                  className="bg-[#fde047] h-full rounded-full transition-all"
                  style={{ width: `${stats.pctC}%` }}
                />
              </div>
            </div>

            {/* Predikat D */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <span className="w-3 h-3 rounded-full bg-[#f87171] border border-slate-900" />
                  <span>Perlu Bimbingan (D: &lt; {kkm})</span>
                </span>
                <span className="font-mono text-slate-900">
                  {stats.predD} Siswa ({stats.pctD}%)
                </span>
              </div>
              <div className="w-full bg-[#faf7ee] border-2 border-slate-900 rounded-full h-3 overflow-hidden p-0.5">
                <div
                  className="bg-[#f87171] h-full rounded-full transition-all"
                  style={{ width: `${stats.pctD}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#faf7ee] border-t-2 border-slate-100 flex justify-end">
            <button
              onClick={() => onNavigateTab('penilaian')}
              className="text-xs font-black text-indigo-950 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Buka Buku Nilai</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) */}
        <div className="bg-white border-2 border-slate-900 rounded-3xl shadow-[4px_4px_0px_#1e293b] overflow-hidden flex flex-col justify-between">
          <div className="p-4 bg-[#ccfbf1] border-b-2 border-slate-900 text-slate-900 flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-black tracking-tight text-teal-950">
              Ketercapaian TP (KKTP Standar {kkm})
            </h3>
            <span className="text-[10px] bg-white border border-slate-900 px-2 py-0.5 rounded-full font-mono font-bold text-slate-900 shadow-[1px_1px_0px_#1e293b]">
              STATUS KELULUSAN
            </span>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Tuntas Card */}
              <div className="p-4 rounded-2xl bg-[#dcfce7] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b]">
                <div className="flex items-center gap-1.5 text-emerald-950 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                  <span className="text-xs font-black">Tuntas Belajar</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">
                  {stats.tuntasCount} Siswa
                </div>
                <p className="text-[11px] font-bold text-emerald-900 mt-0.5">
                  {stats.pctTuntas}% dari total murid
                </p>
              </div>

              {/* Remedial Card */}
              <div className="p-4 rounded-2xl bg-[#fee2e2] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b]">
                <div className="flex items-center gap-1.5 text-rose-950 mb-1">
                  <AlertTriangle className="w-4 h-4 text-rose-800" />
                  <span className="text-xs font-black">Perlu Remedial</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">
                  {stats.remedialCount} Siswa
                </div>
                <p className="text-[11px] font-bold text-rose-900 mt-0.5">
                  {stats.pctRemedial}% perlu bimbingan
                </p>
              </div>
            </div>

            {/* KKTP Bar */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>Rasio Tuntas vs Remedial</span>
                <span className="font-mono">{stats.pctTuntas}% Tuntas</span>
              </div>
              <div className="w-full bg-[#fee2e2] border-2 border-slate-900 rounded-full h-4 overflow-hidden p-0.5 flex">
                <div
                  className="bg-[#6ee7b7] h-full rounded-full transition-all"
                  style={{ width: `${stats.pctTuntas}%` }}
                />
              </div>
            </div>

            {/* Note */}
            <div className="p-3 bg-[#faf7ee] border-2 border-slate-900 rounded-2xl text-[11px] text-slate-700 leading-relaxed font-medium">
              💡 Siswa dengan nilai di bawah KKM ({kkm}) otomatis masuk daftar rekomendasi tindak lanjut remedial Kurikulum Merdeka.
            </div>
          </div>

          <div className="p-3 bg-[#faf7ee] border-t-2 border-slate-100 flex justify-end">
            <button
              onClick={() => onNavigateTab('risiko')}
              className="text-xs font-black text-teal-950 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Analisis Prediktif</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Analisis Prediktif / Risk Scoring Teaser Banner */}
      <div className="bg-[#f3e8ff] border-2 border-slate-900 rounded-3xl p-4 sm:p-5 shadow-[4px_4px_0px_#1e293b] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 text-purple-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900">
                Analisis Prediktif Risiko Siswa & Draf Deskripsi Rapor
              </h3>
              <span className="text-[10px] font-mono font-bold bg-white border border-slate-900 text-purple-950 px-2 py-0.2 rounded-md">
                RISK SCORING
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl font-medium">
              Risk scoring berbasis aturan dengan pembobotan multi-fitur (presensi, momentum formatif, dan konsistensi) untuk membantu mendeteksi risiko drop-out atau remedial lebih dini.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('risiko')}
          className="px-4 py-2.5 rounded-2xl bg-white hover:bg-[#faf7ee] active:translate-x-[1px] active:translate-y-[1px] border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] text-xs font-black text-slate-950 flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer"
        >
          <span>Buka Analisis Prediktif</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
