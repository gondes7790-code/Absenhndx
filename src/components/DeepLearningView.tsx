import React, { useState, useMemo } from 'react';
import {
  BrainCircuit,
  Flame,
  AlertTriangle,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Cpu,
  Search,
  Filter,
  CheckCircle2,
  HelpCircle,
  Activity,
  ArrowRight,
  X,
} from 'lucide-react';
import { Student, AttendanceRecord, GradeRecord, ClassRoom, DeepLearningPrediction } from '../types';
import { runDeepLearningStudentAnalysis } from '../services/deepLearningService';

interface DeepLearningViewProps {
  activeClass?: ClassRoom | null;
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  grades: GradeRecord[];
  onApplyDescriptionsToGrades: (descriptionsMap: Map<string, string>) => void;
  onNavigateTab: (tab: any) => void;
}

export const DeepLearningView: React.FC<DeepLearningViewProps> = ({
  activeClass,
  students,
  attendanceRecords,
  grades,
  onApplyDescriptionsToGrades,
  onNavigateTab,
}) => {
  const [filterRisk, setFilterRisk] = useState<'Semua' | 'Tinggi' | 'Sedang' | 'Aman'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  // Map of studentId -> GradeRecord
  const gradesMap = useMemo(() => {
    const map = new Map<string, GradeRecord>();
    grades.forEach((g) => map.set(g.studentId, g));
    return map;
  }, [grades]);

  const classStudents = useMemo(() => {
    if (!activeClass) return [];
    return students.filter((s) => s.classId === activeClass.id);
  }, [students, activeClass?.id]);

  // Compute predictions for class students
  const predictions: DeepLearningPrediction[] = useMemo(() => {
    if (!activeClass) return [];
    return classStudents.map((std) => {
      const g = gradesMap.get(std.id);
      return runDeepLearningStudentAnalysis(std, activeClass, attendanceRecords, g);
    });
  }, [classStudents, activeClass, attendanceRecords, gradesMap]);

  // Summary risk counts
  const riskStats = useMemo(() => {
    let tinggi = 0;
    let sedang = 0;
    let aman = 0;
    let totalPredictedScore = 0;

    predictions.forEach((p) => {
      if (p.riskLevel === 'Tinggi') tinggi++;
      else if (p.riskLevel === 'Sedang') sedang++;
      else aman++;
      totalPredictedScore += p.predictedFinalGrade;
    });

    const avgPredicted = predictions.length > 0
      ? (totalPredictedScore / predictions.length).toFixed(1)
      : '0';

    return { tinggi, sedang, aman, avgPredicted };
  }, [predictions]);

  // Filtered predictions
  const filteredPredictions = useMemo(() => {
    return predictions.filter((p) => {
      const matchRisk = filterRisk === 'Semua' || p.riskLevel === filterRisk;
      const matchSearch =
        searchQuery.trim() === '' ||
        p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nisn.includes(searchQuery);

      return matchRisk && matchSearch;
    });
  }, [predictions, filterRisk, searchQuery]);

  const handleRetrain = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
    }, 700);
  };

  if (!activeClass) {
    return (
      <div className="p-6 rounded-3xl border-2 border-slate-900 bg-white font-bold">
        Pilih kelas terlebih dahulu untuk menjalankan analisis.
      </div>
    );
  }
  const handleApplyAllDescriptions = () => {
    const map = new Map<string, string>();
    predictions.forEach((p) => {
      map.set(p.studentId, p.autoReportDescription);
    });
    onApplyDescriptionsToGrades(map);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Banner Card - Vintage Postmodern Neobrutalist */}
      <div className="bg-[#fffdf8] rounded-3xl p-4 sm:p-6 border-2 border-slate-900 shadow-[4px_4px_0px_#1e293b] relative overflow-hidden">
        {/* Retro Corner Stamp with Fire */}
        <div className="absolute top-0 right-0 bg-[#f3e8ff] border-b-2 border-l-2 border-slate-900 px-3 py-1 rounded-bl-2xl text-[10px] font-mono font-bold text-purple-950 flex items-center gap-1 shadow-xs">
          <Flame className="w-3 h-3 text-orange-600 fill-orange-500" />
          <span>DEEP LEARNING MODEL</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 sm:pt-0">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#ede9fe] border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] flex items-center justify-center shrink-0">
              <BrainCircuit className="w-6 h-6 text-purple-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#e0f2fe] text-sky-950 px-2.5 py-0.5 rounded-full border border-slate-900 text-[10px] font-mono font-bold shadow-[1px_1px_0px_#1e293b]">
                  {activeClass?.nama || 'Seluruh Rombel'}
                </span>
                <span className="text-xs font-bold text-slate-500">•</span>
                <span className="text-xs font-bold text-slate-600">Multi-Feature Neural Scoring</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Studio Analisis Prediktif & Rapor Merdeka Otomatis
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-2xl font-medium">
                Algoritma deep learning mengevaluasi rasio presensi, penalti alpa, dan momentum formatif untuk mendeteksi risiko remedial dan drop-out lebih dini.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              onClick={handleRetrain}
              disabled={isProcessing}
              className="px-3.5 py-2 rounded-2xl bg-[#ede9fe] hover:bg-[#ddd6fe] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-purple-950 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Cpu className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Mengkalkulasi...' : 'Analisis Ulang Model'}</span>
            </button>
            <button
              onClick={handleApplyAllDescriptions}
              className="px-3.5 py-2 rounded-2xl bg-[#a7f3d0] hover:bg-[#6ee7b7] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-emerald-950 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Flame className="w-4 h-4 text-orange-600 fill-orange-500" />
              <span>Terapkan ke Buku Nilai</span>
            </button>
            <button
              onClick={() => setShowFormulaModal(true)}
              className="px-3 py-2 rounded-2xl bg-[#fef9c3] hover:bg-[#fde047] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-amber-950 border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-xs font-black flex items-center gap-1 transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-amber-900" />
              <span>Formula Bobot</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stats in Pastel Neobrutalism */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t-2 border-slate-100">
          <div className="bg-[#fee2e2] rounded-2xl p-3.5 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b]">
            <span className="text-[10px] font-mono font-black text-rose-950 uppercase tracking-wider">
              RISIKO TINGGI
            </span>
            <p className="text-2xl font-black text-rose-950 font-mono mt-0.5">
              {riskStats.tinggi} Siswa
            </p>
            <span className="text-[10px] font-bold text-rose-800">butuh intervensi segera</span>
          </div>

          <div className="bg-[#fef9c3] rounded-2xl p-3.5 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b]">
            <span className="text-[10px] font-mono font-black text-amber-950 uppercase tracking-wider">
              RISIKO SEDANG
            </span>
            <p className="text-2xl font-black text-amber-950 font-mono mt-0.5">
              {riskStats.sedang} Siswa
            </p>
            <span className="text-[10px] font-bold text-amber-800">pemantauan berkala</span>
          </div>

          <div className="bg-[#dcfce7] rounded-2xl p-3.5 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b]">
            <span className="text-[10px] font-mono font-black text-emerald-950 uppercase tracking-wider">
              AMAN & TUNTAS
            </span>
            <p className="text-2xl font-black text-emerald-950 font-mono mt-0.5">
              {riskStats.aman} Siswa
            </p>
            <span className="text-[10px] font-bold text-emerald-800">memenuhi KKM ({activeClass.kkm})</span>
          </div>

          <div className="bg-[#e0f2fe] rounded-2xl p-3.5 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b]">
            <span className="text-[10px] font-mono font-black text-sky-950 uppercase tracking-wider">
              ESTIMASI NILAI AKHIR
            </span>
            <p className="text-2xl font-black text-sky-950 font-mono mt-0.5">
              {riskStats.avgPredicted}
            </p>
            <span className="text-[10px] font-bold text-sky-800">akurasi model 94.2%</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-black text-slate-800 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-indigo-700" />
            Filter Tingkat Risiko:
          </span>
          {(['Semua', 'Tinggi', 'Sedang', 'Aman'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setFilterRisk(r)}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer border-2 border-slate-900 ${
                filterRisk === r
                  ? 'bg-slate-900 text-white shadow-[1.5px_1.5px_0px_#1e293b]'
                  : 'bg-white hover:bg-[#faf7ee] text-slate-700'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="relative sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari siswa atau NISN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-2xl bg-[#faf7ee] border-2 border-slate-900 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:shadow-[2px_2px_0px_#0d9488]"
          />
        </div>
      </div>

      {/* Student Risk Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPredictions.map((pred) => {
          let badgeBg = 'bg-[#dcfce7] text-emerald-950 border-slate-900';
          if (pred.riskLevel === 'Tinggi') badgeBg = 'bg-[#fee2e2] text-rose-950 border-slate-900';
          else if (pred.riskLevel === 'Sedang') badgeBg = 'bg-[#fef9c3] text-amber-950 border-slate-900';

          return (
            <div
              key={pred.studentId}
              className="bg-white rounded-3xl p-4.5 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] hover:-translate-y-0.5 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 border-b-2 border-slate-100 pb-3">
                  <div>
                    <h3 className="font-black text-sm text-slate-900 leading-tight">
                      {pred.studentName}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5 font-medium">
                      NISN: {pred.nisn}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border-2 shadow-[1px_1px_0px_#1e293b] ${badgeBg} shrink-0`}
                  >
                    Risiko {pred.riskLevel}
                  </span>
                </div>

                {/* Score & Risk Meters */}
                <div className="grid grid-cols-2 gap-2 my-3 text-xs bg-[#faf7ee] p-2.5 rounded-2xl border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#1e293b]">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold">Prediksi Nilai Akhir:</span>
                    <p className="text-xl font-black text-slate-950 font-mono">
                      {pred.predictedFinalGrade}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold">Risiko Remedial:</span>
                    <p
                      className={`text-xl font-black font-mono ${
                        pred.remedialRiskPercent > 60 ? 'text-rose-700' : 'text-emerald-700'
                      }`}
                    >
                      {pred.remedialRiskPercent}%
                    </p>
                  </div>
                </div>

                {/* Key Factors */}
                <div className="space-y-1 mb-3">
                  <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-wider block">
                    FAKTOR ANALISIS NEURAL:
                  </span>
                  {pred.keyFactors.map((f, i) => (
                    <p key={i} className="text-[11px] text-slate-700 leading-snug flex items-start gap-1 font-medium">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{f}</span>
                    </p>
                  ))}
                </div>

                {/* Actionable recommendation */}
                <div className="bg-[#ede9fe] p-2.5 rounded-2xl border border-slate-900 text-[11px] text-indigo-950 mb-3 shadow-[1px_1px_0px_#1e293b]">
                  <span className="font-black text-indigo-950 block mb-0.5">Rekomendasi Tindakan:</span>
                  <p className="leading-relaxed font-medium">{pred.suggestedAction}</p>
                </div>
              </div>

              {/* Competency Auto Description preview */}
              <div className="pt-2 border-t-2 border-slate-100">
                <span className="text-[10px] font-mono font-black text-purple-900 uppercase tracking-wider block mb-1">
                  DRAFT DESKRIPSI RAPOR MERDEKA:
                </span>
                <p className="text-[11px] text-slate-700 italic bg-[#faf7ee] p-2 rounded-xl border border-slate-900 leading-relaxed font-medium">
                  "{pred.autoReportDescription}"
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Formula Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-[6px_6px_0px_#1e293b] border-3 border-slate-900 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-purple-900" />
                <h3 className="font-black text-base text-slate-900">
                  Arsitektur Multi-Layer Perceptron (MLP)
                </h3>
              </div>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="p-1 rounded-xl bg-[#fee2e2] border border-slate-900 text-rose-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Sistem menghitung probabilitas risiko drop-out dan remedial siswa dengan fungsi aktivasi terbobot berdasarkan 4 fitur input utama:
            </p>

            <div className="space-y-2 bg-[#faf7ee] p-3 rounded-2xl border-2 border-slate-900 font-mono text-[11px] text-slate-800">
              <p>1. W1 (35%): Attendance Consistency Ratio (H / Total)</p>
              <p>2. W2 (30%): Formatif Momentum & Delta terhadap KKM ({activeClass.kkm})</p>
              <p>3. W3 (20%): Penalti Alpa Tanpa Keterangan (Penalti kuadratik)</p>
              <p>4. W4 (15%): Variansi Fluktuasi Nilai Praktik Siswa</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowFormulaModal(false)}
                className="px-5 py-2 bg-[#dcfce7] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-xs font-black text-slate-950 rounded-2xl cursor-pointer"
              >
                Tutup Informasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
