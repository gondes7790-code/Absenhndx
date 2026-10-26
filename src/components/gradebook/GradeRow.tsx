import React from 'react';
import { GradeRecord, Student } from '../../types';
import { getPredikat } from './gradeCalculations';

interface GradeRowProps {
  student: Student;
  displayNo: number;
  grade: GradeRecord | undefined;
  formatifColumns: number;
  kkm: number;
  onUpdateGrade: (studentId: string, updatedGrade: Partial<GradeRecord>) => void;
}

/** Satu baris matriks nilai murid (React.memo: hanya baris yang datanya berubah yang dirender ulang). */
export const GradeRow = React.memo(function GradeRow({
  student,
  displayNo,
  grade,
  formatifColumns,
  kkm,
  onUpdateGrade,
}: GradeRowProps) {
  const g = grade;
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

  const predikat = finalGrade !== null ? getPredikat(finalGrade, kkm) : null;

  const handleFormatifChange = (tpIndex: number, valStr: string) => {
    const val = valStr === '' ? null : Math.min(100, Math.max(0, Number(valStr)));
    const newFormatif = [...(g?.formatif || Array(formatifColumns).fill(null))];
    newFormatif[tpIndex] = val;
    onUpdateGrade(student.id, { formatif: newFormatif, updatedAt: new Date().toISOString() });
  };

  return (
      <tr key={student.id} className="hover:bg-[#faf7ee]/60 transition-colors group">
        <td className="py-2.5 px-3 text-center text-slate-600 font-mono font-bold sticky left-0 bg-white group-hover:bg-[#faf7ee] z-10 border-r-2 border-slate-900">
          {displayNo}
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
                onChange={(e) => handleFormatifChange(tpIdx, e.target.value)}
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
});
