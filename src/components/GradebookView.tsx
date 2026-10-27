import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Flame } from 'lucide-react';
import { Student, GradeRecord, ClassRoom, TeacherProfile, PrintConfig } from '../types';
import { PrintableDocument } from './PrintableDocument';
import { GradebookHeader } from './gradebook/GradebookHeader';
import { GradeRow } from './gradebook/GradeRow';
import { GradeSettingsModal } from './gradebook/GradeSettingsModal';
import { computeClassStats, exportGradesCsv } from './gradebook/gradeCalculations';

interface GradebookViewProps {
  activeClass?: ClassRoom | null;
  students: Student[];
  grades: GradeRecord[];
  onUpdateGrade: (studentId: string, updatedGrade: Partial<GradeRecord>) => void;
  onGenerateAllDescriptions: () => void;
  onSaveToCloud: () => void;
  onOpenParentLink: () => void;
  onOpenClassManagement?: () => void;
  schoolName: string;
  teacher?: TeacherProfile;
  onUpdateClass?: (updatedClass: ClassRoom) => void;
  printConfig?: PrintConfig;
}
export const GradebookView: React.FC<GradebookViewProps> = ({
  activeClass,
  students,
  grades,
  onUpdateGrade,
  onGenerateAllDescriptions,
  onSaveToCloud,
  onOpenParentLink,
  onOpenClassManagement,
  schoolName,
  teacher,
  onUpdateClass,
  printConfig,
}) => {
  const [formatifColumns, setFormatifColumns] = useState<number>(activeClass?.formatifCount || 5);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<'no' | 'az' | 'za'>('az');
  const [editingTpTitle, setEditingTpTitle] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [currentKkm, setCurrentKkm] = useState<number>(activeClass?.kkm || 75);
  const [tpTitles, setTpTitles] = useState<Record<number, string>>(
    () => activeClass?.tpTitles || {}
  );

  useEffect(() => {
    setTpTitles(activeClass?.tpTitles || {});
    setFormatifColumns(activeClass?.formatifCount || 5);
    setCurrentKkm(activeClass?.kkm || 75);
  }, [activeClass?.id, activeClass?.tpTitles, activeClass?.formatifCount, activeClass?.kkm]);

  // Class-specific students (strictly filtered by activeClass.id)
  const classStudents = useMemo(() => {
    if (!activeClass) return [];
    return students.filter((s) => s.classId === activeClass.id);
  }, [students, activeClass?.id]);

  // Map studentId -> GradeRecord
  const gradesMap = useMemo(() => {
    const map = new Map<string, GradeRecord>();
    grades.forEach((g) => map.set(g.studentId, g));
    return map;
  }, [grades]);

  const computedStats = useMemo(
    () => computeClassStats(classStudents, gradesMap, formatifColumns, activeClass?.kkm || 75),
    [classStudents, gradesMap, formatifColumns, activeClass?.kkm]
  );

  // Filter & Sort
  const filteredStudents = useMemo(() => {
    let list = [...classStudents];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => s.nama.toLowerCase().includes(q) || s.nisn.includes(q));
    }
    if (sortMode === 'az') list.sort((a, b) => a.nama.localeCompare(b.nama));
    else if (sortMode === 'za') list.sort((a, b) => b.nama.localeCompare(a.nama));
    else list.sort((a, b) => a.noUrut - b.noUrut);
    return list;
  }, [classStudents, searchQuery, sortMode]);

  const handleExportExcel = () =>
    exportGradesCsv(
      filteredStudents,
      gradesMap,
      formatifColumns,
      activeClass?.kkm || 75,
      activeClass?.nama
    );

  if (!activeClass) {
    return (
      <div className="bg-[#fffdf8] rounded-3xl p-8 border-2 border-slate-900 shadow-[4px_4px_0px_#1e293b] text-center max-w-xl mx-auto my-6">
        <div className="w-14 h-14 rounded-2xl bg-[#6ee7b7] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] mx-auto flex items-center justify-center mb-3">
          <Flame className="w-7 h-7 text-slate-950" />
        </div>
        <h3 className="text-base font-black text-slate-900 mb-1">Belum Ada Rombel / Kelas Aktif</h3>
        <p className="text-xs font-bold text-slate-600 mb-4">
          Silakan buat rombel kelas terlebih dahulu untuk mengisi buku penilaian formatif dan sumatif.
        </p>
        {onOpenClassManagement && (
          <button
            onClick={onOpenClassManagement}
            className="px-4 py-2.5 rounded-2xl bg-[#6ee7b7] hover:bg-[#34d399] border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] font-black text-xs text-slate-950 cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Rombel Pertama</span>
          </button>
        )}
      </div>
    );
  }

  const handleSaveSettings = () => {
    onUpdateClass?.({
      ...activeClass,
      formatifCount: formatifColumns,
      kkm: currentKkm,
      tpTitles,
    });
    setEditingTpTitle(false);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <GradebookHeader
        activeClass={activeClass}
        formatifColumns={formatifColumns}
        onFormatifColumnsChange={setFormatifColumns}
        computedStats={computedStats}
        settingsOpen={editingTpTitle}
        onToggleSettings={() => setEditingTpTitle((open) => !open)}
        onGenerateAllDescriptions={onGenerateAllDescriptions}
        onSaveToCloud={onSaveToCloud}
        onOpenParentLink={onOpenParentLink}
        onPrint={() => setShowPrintModal(true)}
        onExport={handleExportExcel}
      />

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
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={formatifColumns + 8} className="py-10 text-center text-slate-500 font-bold bg-[#faf7ee]/30">
                    <p className="text-sm text-slate-700 font-black">
                      {searchQuery ? 'Tidak ada siswa yang sesuai pencarian' : 'Belum Ada Murid Terdaftar di Kelas Ini'}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {searchQuery
                        ? 'Coba kata kunci pencarian lain'
                        : 'Buka tab "Data Murid" untuk mendaftarkan siswa ke kelas ini.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                <GradeRow
                  key={student.id}
                  student={student}
                  displayNo={idx + 1}
                  grade={gradesMap.get(student.id)}
                  formatifColumns={formatifColumns}
                  kkm={activeClass.kkm || 75}
                  onUpdateGrade={onUpdateGrade}
                />
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {editingTpTitle && (
        <GradeSettingsModal
          activeClass={activeClass}
          formatifColumns={formatifColumns}
          onFormatifColumnsChange={setFormatifColumns}
          currentKkm={currentKkm}
          onKkmChange={setCurrentKkm}
          tpTitles={tpTitles}
          onTpTitlesChange={setTpTitles}
          onClose={() => setEditingTpTitle(false)}
          onSave={handleSaveSettings}
        />
      )}

      {/* Formal Printable Document */}
      <PrintableDocument
        type="gradebook"
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        activeClass={activeClass}
        teacher={teacher}
        schoolName={schoolName}
        printConfig={printConfig}
        students={students}
        grades={grades}
      />
    </div>
  );
};
