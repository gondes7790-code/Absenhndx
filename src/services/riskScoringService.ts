import { Student, AttendanceRecord, GradeRecord, RiskPrediction, ClassRoom } from '../types';

/**
 * Risk Scoring / Analisis Prediktif siswa.
 *
 * Murni heuristik di sisi klien (kombinasi berbobot + fungsi sigmoid) — BUKAN
 * model machine learning / deep learning dan tidak dilatih dari data apa pun.
 * Skor dipakai sebagai alat bantu untuk memprioritaskan perhatian guru terhadap
 * risiko remedial dan putus sekolah, serta menyusun draf deskripsi capaian
 * Kurikulum Merdeka yang tetap perlu ditinjau guru.
 */

export interface RiskWeights {
  w_attendance: number;
  w_alpa_penalty: number;
  w_grade_gap: number;
  w_momentum: number;
  w_variance: number;
  bias: number;
}

// Bobot heuristik untuk klasifikasi risiko siswa SMA/SMK (ditetapkan manual)
const DEFAULT_WEIGHTS: RiskWeights = {
  w_attendance: -0.35,      // High attendance reduces risk
  w_alpa_penalty: 0.30,     // Unexcused absences strongly increase risk
  w_grade_gap: -0.40,       // Higher score above KKM reduces risk
  w_momentum: -0.15,        // Positive trend reduces risk
  w_variance: 0.10,         // High score variance indicates instability
  bias: 0.50,
};

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

export function computeRiskScore(
  student: Student,
  classroom: ClassRoom,
  attendances: AttendanceRecord[],
  gradeRecord?: GradeRecord
): RiskPrediction {
  const kkm = classroom.kkm || 75;

  // 1. Feature Extraction: Attendance Dynamics
  const studentAttendances = attendances.filter((a) => a.studentId === student.id);
  const totalSessions = studentAttendances.length;
  
  const hadirCount = studentAttendances.filter((a) => a.status === 'H').length;
  const sakitCount = studentAttendances.filter((a) => a.status === 'S').length;
  const izinCount = studentAttendances.filter((a) => a.status === 'I').length;
  const alpaCount = studentAttendances.filter((a) => a.status === 'A').length;

  const attendanceRate = totalSessions > 0 ? (hadirCount / totalSessions) : 0.95;
  const alpaRate = totalSessions > 0 ? (alpaCount / totalSessions) : 0;

  // 2. Feature Extraction: Grade Trajectory & Formative Momentum
  const validGrades = gradeRecord?.formatif?.filter((g): g is number => g !== null && !isNaN(g)) || [];
  const meanGrade = validGrades.length > 0
    ? validGrades.reduce((a, b) => a + b, 0) / validGrades.length
    : 75;

  // Formatif momentum (first vs last)
  let momentum = 0;
  if (validGrades.length >= 2) {
    momentum = (validGrades[validGrades.length - 1] - validGrades[0]) / 100;
  }

  // Variance calculation
  let variance = 0;
  if (validGrades.length >= 2) {
    const sumSqDiff = validGrades.reduce((acc, val) => acc + Math.pow(val - meanGrade, 2), 0);
    variance = Math.sqrt(sumSqDiff / validGrades.length) / 50; // normalized
  }

  // Normalized grade gap to KKM
  const gradeGap = (meanGrade - kkm) / 100;

  // 3. Skor linear berbobot (input z)
  const z =
    DEFAULT_WEIGHTS.bias +
    (attendanceRate * DEFAULT_WEIGHTS.w_attendance) +
    (alpaRate * 3.0 * DEFAULT_WEIGHTS.w_alpa_penalty) +
    (gradeGap * DEFAULT_WEIGHTS.w_grade_gap) +
    (momentum * DEFAULT_WEIGHTS.w_momentum) +
    (variance * DEFAULT_WEIGHTS.w_variance);

  // Normalisasi ke 0-1 lewat sigmoid
  const rawActivation = sigmoid(z * 3.5);
  const riskScore = Math.min(100, Math.max(0, Math.round(rawActivation * 100)));

  // Risk Level Classification
  let riskLevel: 'Aman' | 'Rendah' | 'Sedang' | 'Tinggi' = 'Aman';
  if (riskScore >= 70) riskLevel = 'Tinggi';
  else if (riskScore >= 45) riskLevel = 'Sedang';
  else if (riskScore >= 25) riskLevel = 'Rendah';

  // Specific risk percentages
  const dropoutRiskPercent = Math.min(95, Math.max(2, Math.round((alpaCount * 18) + ((1 - attendanceRate) * 40) + (riskScore * 0.25))));
  const remedialRiskPercent = meanGrade < kkm
    ? Math.min(99, Math.max(70, Math.round(75 + ((kkm - meanGrade) * 1.5))))
    : Math.min(45, Math.max(5, Math.round((kkm - meanGrade) * 1.2 + 20)));

  // Predicted Final Grade
  const sts = gradeRecord?.sts ?? meanGrade;
  const sas = gradeRecord?.sas ?? meanGrade;
  const weightedEstimate = (meanGrade * 0.5) + (sts * 0.25) + (sas * 0.25);
  const predictedFinalGrade = Math.round(weightedEstimate * (0.95 + (attendanceRate * 0.05)));

  // Identifying key risk/strength factors
  const keyFactors: string[] = [];
  if (alpaCount > 0) {
    keyFactors.push(`Tercatat ${alpaCount} kali Alpa (tanpa keterangan resmi) yang memicu penalti kehadiran.`);
  }
  if (sakitCount + izinCount >= 3) {
    keyFactors.push(`Akumulasi izin/sakit (${sakitCount + izinCount} kali) berpotensi memutus kontinuitas materi bengkel.`);
  }
  if (meanGrade < kkm) {
    keyFactors.push(`Rata-rata asesmen formatif (${meanGrade.toFixed(1)}) saat ini berada di bawah KKM (${kkm}).`);
  } else {
    keyFactors.push(`Pencapaian formatif konsisten melampaui KKM (${meanGrade.toFixed(1)} / ${kkm}).`);
  }
  if (momentum < -0.05) {
    keyFactors.push('Terdeteksi penurunan tren nilai (momentum negatif) pada asesmen formatif terakhir.');
  } else if (momentum > 0.05) {
    keyFactors.push('Menunjukkan progres peningkatan skor (momentum positif) secara konsisten.');
  }

  // Recommended pedagogical action
  let suggestedAction = '';
  if (riskLevel === 'Tinggi') {
    suggestedAction = 'Intervensi Dini: Lakukan pemanggilan wali murid via WhatsApp / tatap muka dan jadwalkan klinik remedial intensif untuk TP 1 - TP 5.';
  } else if (riskLevel === 'Sedang') {
    suggestedAction = 'Pemantauan Terarah: Berikan tutor sebaya pada sesi praktikum dan pantau komitmen presensi 2 pekan ke depan.';
  } else if (riskLevel === 'Rendah') {
    suggestedAction = 'Bimbingan Standar: Berikan feedback berkala pada lembar kerja dan pertahankan motivasi belajar.';
  } else {
    suggestedAction = 'Pengayaan: Rekomendasikan proyek mandiri lanjutan atau peran sebagai koordinator bengkel/kelompok.';
  }

  // Generate automated Kurikulum Merdeka Competency Description
  let autoReportDescription = '';
  if (meanGrade >= 88) {
    autoReportDescription = `Menunjukkan penguasaan yang SANGAT BAIK dan konsisten dalam seluruh Tujuan Pembelajaran (TP 1 - TP 5) serta menunjukkan etos kerja bengkel yang prima.`;
  } else if (meanGrade >= kkm) {
    autoReportDescription = `Menunjukkan penguasaan yang BAIK dalam ketercapaian TP utama, perlu peningkatan dan ketelitian lanjutan pada pengujian sumatif akhir.`;
  } else {
    autoReportDescription = `Perlu bimbingan dan pendampingan intensif (remedial) dalam memahami konsep dasar kejuruan dan pemenuhan ketuntasan kriteria ketercapaian tujuan pembelajaran (KKTP).`;
  }

  return {
    studentId: student.id,
    studentName: student.nama,
    nisn: student.nisn,
    riskScore,
    riskLevel,
    predictedFinalGrade,
    predictedAttendanceRate: Math.round(attendanceRate * 100),
    dropoutRiskPercent,
    remedialRiskPercent,
    featureWeights: {
      attendanceConsistency: Number((attendanceRate * 100).toFixed(1)),
      formatifMomentum: Number((momentum * 100).toFixed(1)),
      varianceRisk: Number((variance * 100).toFixed(1)),
      unexcusedAbsencePenalty: alpaCount * 15,
    },
    keyFactors,
    suggestedAction,
    autoReportDescription: `${student.nama} ${autoReportDescription}`,
  };
}
