import React, { useState, useMemo } from 'react';
import {
  Cloud,
  Sliders,
  Flame,
  FileSpreadsheet,
  Printer,
  Share2,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Check,
} from 'lucide-react';
import { Student, GradeRecord, ClassRoom, TeacherProfile } from '../types';
import { PrintableDocument } from './PrintableDocument';

interface GradebookViewProps {
  activeClass: ClassRoom;
  students: Student[];
  grades: GradeRecord[];
  onUpdateGrade: (studentId: string, updatedGrade: Partial<GradeRecord>) => void;
  onGenerateAllDescriptions: () => void;
  onSaveToCloud: () => void;
  onOpenParentLink: () => void;
  schoolName: string;
  teacher?: TeacherProfile;
  onUpdateClass?: (updatedClass: ClassRoom) => void;
}

export const GradebookView: React.FC<GradebookViewProps> = ({
  activeClass,
  students,
  grades,
  onUpdateGrade,
  onGenerateAllDescriptions,
  onSaveToCloud,
  onOpenParentLink,
  schoolName,
  teacher = {
    name: 'Hendra Setiawan, S. Pd.',
    email: 'hendrasetiawan72@guru.smk.belajar.id',
    nip: '19870415 201201 1 003',
    school: 'Hadir!',
    handle: '@hndx07',
  },
  onUpdateClass,
}) => {
  const [formatifColumns, setFormatifColumns] = useState<number>(activeClass.formatifCount || 5);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<'no' | 'az' | 'za'>('az');
  const [editingTpTitle, setEditingTpTitle] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [currentKkm, setCurrentKkm] = useState<number>(activeClass.kkm || 75);
  const [tpTitles, setTpTitles] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem(`hndx_tp_titles_${activeClass.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Map studentId -> GradeRecord
  const gradesMap = useMemo(() => {
    const map = new Map<string, GradeRecord>();
    grades.forEach((g) => map.set(g.studentId, g));
    return map;
  }, [grades]);

  // Compute final grade, sumatif, and predikat for each student
  const computedStats = useMemo(() => {
    let totalScoreSum = 0;
    let studentsWithScores = 0;
    let tuntasCount = 0;
    const kkm = activeClass.kkm || 75;

    students.forEach((s) => {
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
  }, [students, gradesMap, formatifColumns, activeClass.kkm]);

  // Predicate Helper according to Kurikulum Merdeka
  const getPredikat = (score: number, kkm: number) => {
    if (score >= 90) return { letter: 'A', text: 'Sangat Baik', bg: 'bg-[#bbf7d0] text-emerald-950 border-slate-900' };
    if (score >= 80) return { letter: 'B', text: 'Baik', bg: 'bg-[#bae6fd] text-sky-950 border-slate-900' };
    if (score >= kkm) return { letter: 'C', text: 'Cukup', bg: 'bg-[#fef08a] text-amber-950 border-slate-900' };
    return { letter: 'D', text: 'Perlu Bimbingan', bg: 'bg-[#fecdd3] text-rose-950 border-slate-900' };
  };

  // Filter & Sort
  const filteredStudents = useMemo(() => {
    let list = [...students];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => s.nama.toLowerCase().includes(q) || s.nisn.includes(q));
    }
    if (sortMode === 'az') {
      list.sort((a, b) => a.nama.localeCompare(b.nama));
    } else if (sortMode === 'za') {
      list.sort((a, b) => b.nama.localeCompare(a.nama));
    } else {
      list.sort((a, b) => a.noUrut - b.noUrut);
    }
    return list;
  }, [students, searchQuery, sortMode]);

  const handleFormatifChange = (studentId: string, tpIndex: number, valStr: string) => {
    const val = valStr === '' ? null : Math.min(100, Math.max(0, Number(valStr)));
    const existing = gradesMap.get(studentId);
    const newFormatif = [...(existing?.formatif || Array(formatifColumns).fill(null))];
    newFormatif[tpIndex] = val;

    onUpdateGrade(studentId, {
      formatif: newFormatif,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleExportExcel = () => {
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
      const pred = getPredikat(finalScore, activeClass.kkm);

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
    link.setAttribute('download', `Penilaian_Merdeka_${activeClass.nama}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Header Card - Vintage Postmodern Neobrutalist */}
      <div className="bg-[#fffdf8] rounded-3xl p-4 sm:p-6 border-2 border-slate-900 shadow-[4px_4px_0px_#1e293b] relative overflow-hidden">
        {/* Retro Corner Stamp with Fire */}
        <div className="absolute top-0 right-0 bg-[#fef9c3] border-b-2 border-l-2 border-slate-900 px-3 py-1 rounded-bl-2xl text-[10px] font-mono font-bold text-amber-950 flex items-center gap-1 shadow-xs">
          <Flame className="w-3 h-3 text-orange-600 fill-orange-500" />
          <span>BUKU PENILAIAN</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 sm:pt-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-slate-600 mb-1.5 flex-wrap">
              <span className="bg-[#e0f2fe] text-sky-950 px-2.5 py-0.5 rounded-full border-2 border-slate-900 font-mono text-[11px] shadow-[1.5px_1.5px_0px_#1e293b]">
                {activeClass.nama}
              </span>
              <span>•</span>
              <span className="font-mono text-emerald-950 bg-[#dcfce7] px-2.5 py-0.5 rounded-full border border-slate-900 font-bold shadow-[1px_1px_0px_#1e293b]">
                KKM: {activeClass.kkm}
              </span>
              <span>•</span>
              <span className="text-emerald-800 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Tersimpan di Supabase
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Buku Penilaian Murid (Kurikulum Merdeka)
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              Matriks asesmen formatif (TP), STS, SAS, dan otomasi narasi capaian kompetensi rapor.
            </p>
          </div>

          {/* Action Button Strip - Colorful Soft Pastel */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              onClick={onSaveToCloud}
              className="px-3.5 py-2 rounded-2xl bg-[#a7f3d0] hover:bg-[#6ee7b7] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-slate-950 text-xs sm:text-sm font-black flex items-center gap-2 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] transition-all cursor-pointer"
            >
              <Cloud className="w-4 h-4 text-emerald-950" />
              <span>Simpan Cloud</span>
            </button>

            <button
              onClick={() => setEditingTpTitle(!editingTpTitle)}
              className="px-3.5 py-2 rounded-2xl bg-[#e0f2fe] hover:bg-[#bae6fd] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-sky-950 text-xs sm:text-sm font-black flex items-center gap-1.5 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] transition-all cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-sky-900" />
              <span>Atur Kolom TP</span>
            </button>

            <button
              onClick={onGenerateAllDescriptions}
              className="px-3.5 py-2 rounded-2xl bg-[#ede9fe] hover:bg-[#ddd6fe] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-indigo-950 text-xs sm:text-sm font-black flex items-center gap-2 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] transition-all cursor-pointer"
            >
              <Flame className="w-4 h-4 text-orange-600 fill-orange-500" />
              <span>Deskripsi Merdeka</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="px-3 py-2 rounded-2xl bg-[#fef9c3] hover:bg-[#fde047] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-amber-950 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-900" />
              <span>Ekspor Excel</span>
            </button>

            <button
              onClick={() => setShowPrintModal(true)}
              className="px-3 py-2 rounded-2xl bg-[#fee2e2] hover:bg-[#fca5a5] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-rose-950 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
              title="Cetak Kertas Nilai Formal A4 Putih"
            >
              <Printer className="w-3.5 h-3.5 text-rose-900" />
              <span>Kertas Cetak</span>
            </button>

            <button
              onClick={onOpenParentLink}
              className="px-3 py-2 rounded-2xl bg-[#ffedd5] hover:bg-[#fed7aa] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-orange-950 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-orange-900" />
              <span>Link Publik</span>
            </button>
          </div>
        </div>

        {/* Formative Column Selector & Metrics Banner */}
        <div className="mt-4 pt-4 border-t-2 border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-black text-slate-800">
              Tampilkan Kolom Formatif:
            </span>
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b]">
              {[3, 5, 8, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => setFormatifColumns(num)}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    formatifColumns === num
                      ? 'bg-[#dcfce7] border border-slate-900 text-slate-950 shadow-[1px_1px_0px_#1e293b]'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {num} TP
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {/* Rata-rata Kelas Card */}
            <div className="px-3 py-1.5 rounded-2xl bg-[#fef9c3] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center gap-2">
              <span className="text-[11px] font-bold text-amber-950">Rata-rata:</span>
              <span className="text-base font-black text-slate-900 font-mono">
                {computedStats.classAverage}
              </span>
            </div>

            {/* Ketuntasan KKM Card */}
            <div className="px-3 py-1.5 rounded-2xl bg-[#dcfce7] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-950">Ketuntasan:</span>
              <span className="text-xs font-black text-emerald-950 font-mono">
                {computedStats.tuntasCount} / {computedStats.studentsWithScores} Murid ({computedStats.tuntasPercent}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grade Matrix Table - Vintage Postmodern Neobrutalist */}
      <div className="bg-white border-2 border-slate-900 rounded-3xl shadow-[4px_4px_0px_#1e293b] overflow-hidden">
        {/* Table Filter Top Bar */}
        <div className="p-4 border-b-2 border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fffdf8]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-900 animate-pulse" />
            <span className="text-xs font-bold text-slate-700">
              Geser tabel secara horizontal untuk mengisi kolom Formatif, STS, dan SAS
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari murid..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-2xl bg-[#faf7ee] border-2 border-slate-900 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:shadow-[2px_2px_0px_#0d9488]"
              />
            </div>

            <div className="flex items-center bg-white p-1 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] shrink-0 gap-1">
              <button
                onClick={() => setSortMode('no')}
                className={`px-2.5 py-1 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  sortMode === 'no' ? 'bg-[#dcfce7] text-slate-900 border border-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                No Urut
              </button>
              <button
                onClick={() => setSortMode('az')}
                className={`px-2.5 py-1 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  sortMode === 'az' ? 'bg-[#e0f2fe] text-slate-900 border border-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                A-Z
              </button>
              <button
                onClick={() => setSortMode('za')}
                className={`px-2.5 py-1 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  sortMode === 'za' ? 'bg-[#ede9fe] text-slate-900 border border-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Z-A
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Matrix */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#faf7ee] text-slate-900 font-black text-[11px] tracking-wider uppercase border-b-2 border-slate-900">
                <th className="py-3 px-3 w-10 text-center sticky left-0 bg-[#faf7ee] z-10 border-r-2 border-slate-900">NO</th>
                <th className="py-3 px-4 min-w-[190px] sticky left-10 bg-[#faf7ee] z-10 border-r-2 border-slate-900">NAMA MURID</th>
                {Array.from({ length: formatifColumns }, (_, i) => {
                  const tpNum = i + 1;
                  const label = tpTitles[tpNum] || `TP ${tpNum}`;
                  return (
                    <th key={i} className="py-2.5 px-2 w-16 text-center border-l-2 border-slate-200" title={label}>
                      <div>F-{tpNum}</div>
                      <div className="text-[9px] text-slate-500 font-mono truncate max-w-[60px] mx-auto">
                        {label}
                      </div>
                    </th>
                  );
                })}
                <th className="py-2.5 px-2 w-16 text-center border-l-2 border-slate-900 bg-[#fef9c3]">
                  STS
                </th>
                <th className="py-2.5 px-2 w-16 text-center border-l-2 border-slate-900 bg-[#fef9c3]">
                  SAS
                </th>
                <th className="py-2.5 px-2 w-16 text-center border-l-2 border-slate-900 bg-[#e0f2fe]">
                  TOTAL
                </th>
                <th className="py-2.5 px-2 w-18 text-center border-l-2 border-slate-900 bg-[#dcfce7]">
                  AKHIR
                </th>
                <th className="py-2.5 px-3 w-24 text-center border-l-2 border-slate-900 bg-[#ede9fe]">
                  PREDIKAT
                </th>
                <th className="py-2.5 px-4 min-w-[280px] border-l-2 border-slate-900">
                  CATATAN CAPAIAN KOMPETENSI MERDEKA
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {filteredStudents.map((student, idx) => {
                const g = gradesMap.get(student.id);
                const formatifArr = g?.formatif || Array(formatifColumns).fill(null);

                // Calculations
                const validFormatif = formatifArr.slice(0, formatifColumns).filter((v): v is number => v !== null && !isNaN(v));
                const formatifAvg = validFormatif.length > 0
                  ? validFormatif.reduce((a, b) => a + b, 0) / validFormatif.length
                  : 0;
                const sts = g?.sts ?? (validFormatif.length > 0 ? formatifAvg : null);
                const sas = g?.sas ?? (validFormatif.length > 0 ? formatifAvg : null);

                const hasAnyScore = validFormatif.length > 0 || sts !== null || sas !== null;
                const totalSum = hasAnyScore ? Math.round(((sts || 0) + (sas || 0)) / 2) : '-';
                const finalGrade = hasAnyScore
                  ? Math.round((formatifAvg * 0.5) + ((sts || formatifAvg) * 0.25) + ((sas || formatifAvg) * 0.25))
                  : null;

                const predikat = finalGrade !== null ? getPredikat(finalGrade, activeClass.kkm) : null;

                return (
                  <tr key={student.id} className="hover:bg-[#faf7ee]/60 transition-colors group">
                    <td className="py-2.5 px-3 text-center text-slate-600 font-mono font-bold sticky left-0 bg-white group-hover:bg-[#faf7ee] z-10 border-r-2 border-slate-900">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-4 font-black text-slate-900 sticky left-10 bg-white group-hover:bg-[#faf7ee] z-10 border-r-2 border-slate-900">
                      <div className="truncate max-w-[170px]">{student.nama}</div>
                      <div className="text-[10px] text-slate-500 font-mono font-medium">
                        NISN: {student.nisn}
                      </div>
                    </td>

                    {/* Formative Cells */}
                    {Array.from({ length: formatifColumns }, (_, tpIdx) => {
                      const val = formatifArr[tpIdx];
                      return (
                        <td key={tpIdx} className="py-2 px-1 text-center border-l-2 border-slate-200">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="-"
                            value={val !== null && val !== undefined ? val : ''}
                            onChange={(e) => handleFormatifChange(student.id, tpIdx, e.target.value)}
                            className="w-12 py-1 text-center font-mono font-bold text-xs rounded-xl border-2 border-slate-900 bg-[#faf7ee] focus:bg-white focus:outline-none focus:shadow-[2px_2px_0px_#0d9488] transition-all"
                          />
                        </td>
                      );
                    })}

                    {/* STS */}
                    <td className="py-2 px-1 text-center border-l-2 border-slate-900 bg-[#fef9c3]/30">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="-"
                        value={g?.sts !== null && g?.sts !== undefined ? g.sts : ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : Number(e.target.value);
                          onUpdateGrade(student.id, { sts: val, updatedAt: new Date().toISOString() });
                        }}
                        className="w-12 py-1 text-center font-mono font-black text-xs rounded-xl border-2 border-slate-900 bg-white focus:outline-none focus:shadow-[2px_2px_0px_#0d9488]"
                      />
                    </td>

                    {/* SAS */}
                    <td className="py-2 px-1 text-center border-l-2 border-slate-900 bg-[#fef9c3]/30">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="-"
                        value={g?.sas !== null && g?.sas !== undefined ? g.sas : ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : Number(e.target.value);
                          onUpdateGrade(student.id, { sas: val, updatedAt: new Date().toISOString() });
                        }}
                        className="w-12 py-1 text-center font-mono font-black text-xs rounded-xl border-2 border-slate-900 bg-white focus:outline-none focus:shadow-[2px_2px_0px_#0d9488]"
                      />
                    </td>

                    {/* TOTAL SUM */}
                    <td className="py-2.5 px-2 text-center border-l-2 border-slate-900 font-mono font-black text-sky-950 bg-[#e0f2fe]/40">
                      {totalSum}
                    </td>

                    {/* NILAI AKHIR */}
                    <td className="py-2.5 px-2 text-center border-l-2 border-slate-900 font-mono font-black text-xs text-emerald-950 bg-[#dcfce7]/50">
                      {finalGrade !== null ? finalGrade : '-'}
                    </td>

                    {/* PREDIKAT */}
                    <td className="py-2.5 px-3 text-center border-l-2 border-slate-900 bg-[#ede9fe]/30">
                      {predikat ? (
                        <div className={`inline-flex flex-col items-center justify-center px-2 py-0.5 rounded-xl border-2 shadow-[1.5px_1.5px_0px_#1e293b] text-[10px] font-black ${predikat.bg}`}>
                          <span>{predikat.letter}</span>
                          <span className="text-[8px] font-bold">{predikat.text}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono">-</span>
                      )}
                    </td>

                    {/* CATATAN CAPAIAN KOMPETENSI */}
                    <td className="py-2 px-4 border-l-2 border-slate-900">
                      <textarea
                        rows={2}
                        placeholder="Deskripsi pencapaian kompetensi siswa..."
                        value={g?.deskripsi || ''}
                        onChange={(e) => onUpdateGrade(student.id, { deskripsi: e.target.value })}
                        className="w-full text-[11px] p-2 rounded-xl border-2 border-slate-900 bg-[#faf7ee] focus:bg-white focus:outline-none focus:shadow-[2px_2px_0px_#0d9488] resize-none text-slate-900 font-medium leading-tight"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Pengaturan Kolom TP & KKM */}
      {editingTpTitle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#fffdf8] w-full max-w-xl rounded-3xl border-3 border-slate-900 shadow-[8px_8px_0px_#1e293b] flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-white border-b-2 border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#e0f2fe] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center justify-center text-sky-950 font-black shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Atur Kolom TP & Bobot Penilaian
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">
                    Sesuaikan jumlah kolom formatif, label capaian per TP, dan standar KKM kelas {activeClass.nama}.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingTpTitle(false)}
                className="p-2 rounded-2xl bg-[#fee2e2] hover:bg-[#fca5a5] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-rose-950 cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {/* Jumlah Kolom Formatif */}
              <div className="p-3.5 rounded-2xl bg-white border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] space-y-2">
                <label className="text-xs font-black text-slate-800 block">
                  Jumlah Kolom Formatif (Tujuan Pembelajaran):
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[3, 4, 5, 6, 8, 10, 12].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFormatifColumns(num)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 border-slate-900 transition-all cursor-pointer ${
                        formatifColumns === num
                          ? 'bg-[#dcfce7] text-slate-950 shadow-[2px_2px_0px_#1e293b]'
                          : 'bg-white hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {num} Kolom
                    </button>
                  ))}
                </div>
              </div>

              {/* KKM Setting */}
              <div className="p-3.5 rounded-2xl bg-white border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center justify-between gap-3">
                <div>
                  <label className="text-xs font-black text-slate-800 block">
                    KKM / Kriteria Ketercapaian:
                  </label>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Standar ketuntasan minimal untuk mata pelajaran {activeClass.mapel}.
                  </p>
                </div>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={currentKkm}
                  onChange={(e) => setCurrentKkm(Number(e.target.value))}
                  className="w-20 px-3 py-1.5 rounded-xl bg-[#faf7ee] border-2 border-slate-900 text-center text-sm font-black text-slate-900 font-mono focus:outline-none focus:bg-white"
                />
              </div>

              {/* Custom Titles per TP */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800">
                    Label & Deskripsi Capaian per TP (Formatif 1 s/d {formatifColumns}):
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Opsional</span>
                </div>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {Array.from({ length: formatifColumns }, (_, i) => {
                    const tpNum = i + 1;
                    return (
                      <div key={tpNum} className="flex items-center gap-2">
                        <span className="w-14 px-2 py-1.5 rounded-xl bg-[#ede9fe] border-2 border-slate-900 text-center text-xs font-black font-mono text-indigo-950 shrink-0">
                          TP {tpNum}
                        </span>
                        <input
                          type="text"
                          value={tpTitles[tpNum] || ''}
                          placeholder={`Contoh: Capaian Pembelajaran Materi ${tpNum}`}
                          onChange={(e) => {
                            const updated = { ...tpTitles, [tpNum]: e.target.value };
                            setTpTitles(updated);
                          }}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-white border-2 border-slate-900 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t-2 border-slate-900 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setEditingTpTitle(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 text-xs font-black text-slate-800 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.setItem(`hndx_tp_titles_${activeClass.id}`, JSON.stringify(tpTitles));
                  } catch (e) {
                    console.warn(e);
                  }
                  if (onUpdateClass) {
                    onUpdateClass({
                      ...activeClass,
                      formatifCount: formatifColumns,
                      kkm: currentKkm,
                    });
                  }
                  setEditingTpTitle(false);
                }}
                className="px-5 py-2 rounded-xl bg-[#6ee7b7] hover:bg-[#34d399] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-xs font-black text-slate-950 cursor-pointer"
              >
                Simpan & Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formal Printable Document */}
      <PrintableDocument
        type="gradebook"
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        activeClass={activeClass}
        teacher={teacher}
        schoolName={schoolName}
        students={students}
        grades={grades}
      />
    </div>
  );
};
