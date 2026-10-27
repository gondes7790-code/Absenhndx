import React, { useState, useMemo } from 'react';
import {
  X,
  FileSpreadsheet,
  ClipboardPaste,
  Upload,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Users,
  ArrowRight,
  Trash2,
  Flame,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student, ClassRoom } from '../types';

interface StudentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeClass: ClassRoom;
  existingCount: number;
  onImportStudents: (
    newStudents: Omit<Student, 'id' | 'noUrut'>[],
    mode: 'append' | 'replace'
  ) => void;
}

interface ParsedStudentRow {
  nisn: string;
  nama: string;
  gender: 'L' | 'P';
  kontakOrtu: string;
  catatan: string;
  originalRowNumber: number;
}

export const StudentImportModal: React.FC<StudentImportModalProps> = ({
  isOpen,
  onClose,
  activeClass,
  existingCount,
  onImportStudents,
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [rawText, setRawText] = useState('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Helper to normalize gender
  const parseGender = (raw: string): 'L' | 'P' => {
    const val = raw.trim().toUpperCase();
    if (val.startsWith('P') || val.includes('PEREMPUAN') || val.includes('WANITA') || val === 'F') {
      return 'P';
    }
    return 'L'; // Default to L
  };

  // Helper to extract NISN or generate fallback
  const cleanNisn = (raw: string, index: number): string => {
    const digitsOnly = raw.replace(/\D/g, '');
    if (digitsOnly.length >= 8 && digitsOnly.length <= 12) {
      return digitsOnly;
    }
    // Fallback standard 10-digit NISN format
    return `00${(10000000 + index).toString()}`;
  };

  // Helper to parse rows of 2D string matrix
  const parseMatrixToStudents = (matrix: string[][]): ParsedStudentRow[] => {
    if (!matrix || matrix.length === 0) return [];

    // Filter out completely empty rows
    const nonEmptyRows = matrix.filter((row) =>
      row.some((cell) => cell !== undefined && cell !== null && cell.toString().trim() !== '')
    );

    if (nonEmptyRows.length === 0) return [];

    // Check if first row is a header row
    const firstRowJoined = nonEmptyRows[0].map((c) => (c || '').toString().toLowerCase()).join(' ');
    const isHeader =
      firstRowJoined.includes('nama') ||
      firstRowJoined.includes('nisn') ||
      firstRowJoined.includes('gender') ||
      firstRowJoined.includes('jk') ||
      firstRowJoined.includes('no') ||
      firstRowJoined.includes('peserta didik');

    let colNisn = -1;
    let colNama = -1;
    let colGender = -1;
    let colKontak = -1;
    let colCatatan = -1;

    let dataRows = nonEmptyRows;

    if (isHeader) {
      const headerRow = nonEmptyRows[0].map((c) => (c || '').toString().toLowerCase().trim());
      headerRow.forEach((h, idx) => {
        if (h.includes('nisn') || h.includes('induk')) colNisn = idx;
        else if (h.includes('nama') || h.includes('siswa') || h.includes('murid')) colNama = idx;
        else if (h.includes('jk') || h.includes('gender') || h.includes('kelamin') || h === 'l/p') colGender = idx;
        else if (h.includes('hp') || h.includes('wa') || h.includes('kontak') || h.includes('telepon')) colKontak = idx;
        else if (h.includes('catatan') || h.includes('ket')) colCatatan = idx;
      });
      dataRows = nonEmptyRows.slice(1);
    }

    const parsed: ParsedStudentRow[] = [];

    dataRows.forEach((row, rowIdx) => {
      // Clean cells
      const cells = row.map((c) => (c !== undefined && c !== null ? c.toString().trim() : ''));
      if (cells.every((c) => c === '')) return;

      let nama = '';
      let nisn = '';
      let gender: 'L' | 'P' = 'L';
      let kontak = '';
      let catatan = '';

      if (isHeader && colNama >= 0) {
        nama = cells[colNama] || '';
        nisn = colNisn >= 0 ? cells[colNisn] || '' : '';
        gender = colGender >= 0 ? parseGender(cells[colGender] || '') : 'L';
        kontak = colKontak >= 0 ? cells[colKontak] || '' : '';
        catatan = colCatatan >= 0 ? cells[colCatatan] || '' : '';
      } else {
        // Heuristic detection based on position and pattern
        // Typically Excel lists have:
        // Case A: [No, NISN, Nama, L/P, Kontak...]
        // Case B: [NISN, Nama, L/P...]
        // Case C: [Nama, L/P...]
        // Case D: [No, Nama, L/P...]
        let foundNamaIdx = -1;
        let foundNisnIdx = -1;
        let foundGenderIdx = -1;
        let foundKontakIdx = -1;

        cells.forEach((cell, idx) => {
          const digits = cell.replace(/\D/g, '');
          const upper = cell.toUpperCase();

          // Check for No Urut (1, 2, 3...)
          if (/^\d{1,3}$/.test(cell) && idx === 0) {
            return;
          }

          // Check for NISN (8 to 12 digits)
          if (digits.length >= 8 && digits.length <= 12 && foundNisnIdx === -1) {
            foundNisnIdx = idx;
            return;
          }

          // Check for Phone (e.g. 08... or +62...)
          if ((digits.startsWith('08') || digits.startsWith('62')) && digits.length >= 9 && foundKontakIdx === -1) {
            foundKontakIdx = idx;
            return;
          }

          // Check for Gender (L, P, Laki, Perempuan)
          if ((upper === 'L' || upper === 'P' || upper === 'LAKI-LAKI' || upper === 'PEREMPUAN') && foundGenderIdx === -1) {
            foundGenderIdx = idx;
            return;
          }

          // Otherwise, if it has letters and longer than 2 chars, it could be Name
          if (/[a-zA-Z]/.test(cell) && cell.length > 2 && foundNamaIdx === -1) {
            foundNamaIdx = idx;
          }
        });

        nama = foundNamaIdx >= 0 ? cells[foundNamaIdx] : cells[1] || cells[0] || '';
        nisn = foundNisnIdx >= 0 ? cells[foundNisnIdx] : '';
        gender = foundGenderIdx >= 0 ? parseGender(cells[foundGenderIdx]) : 'L';
        kontak = foundKontakIdx >= 0 ? cells[foundKontakIdx] : '';
      }

      // If name is just numbers or empty, skip
      if (!nama || /^\d+$/.test(nama)) return;

      parsed.push({
        nama,
        nisn: cleanNisn(nisn, rowIdx + 1),
        gender,
        kontakOrtu: kontak || '0812-3456-7890',
        catatan,
        originalRowNumber: rowIdx + (isHeader ? 2 : 1),
      });
    });

    return parsed;
  };

  // Parser for Copas Text (TSV from Excel, CSV, or spaces)
  const parsedStudents = useMemo(() => {
    if (!rawText.trim()) return [];

    try {
      // Split lines
      const lines = rawText.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const matrix: string[][] = [];

      lines.forEach((line) => {
        // Detect delimiter: Tab (\t) is standard for Excel copas, otherwise comma or semicolon
        if (line.includes('\t')) {
          matrix.push(line.split('\t'));
        } else if (line.includes(';')) {
          matrix.push(line.split(';'));
        } else if (line.includes(',')) {
          // simple CSV split considering quotes
          matrix.push(line.split(','));
        } else {
          // space separated
          matrix.push(line.split(/\s{2,}/));
        }
      });

      return parseMatrixToStudents(matrix);
    } catch (e) {
      console.error(e);
      return [];
    }
  }, [rawText]);

  // Handler for Excel file (.xlsx, .xls, .csv)
  const handleFileUpload = (file: File) => {
    setErrorMsg(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) return;

        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonMatrix = XLSX.utils.sheet_to_json<string[]>(worksheet, {
          header: 1,
          defval: '',
        });

        // Convert matrix to TSV string so user can also inspect and edit in textarea if they want
        const tsv = jsonMatrix
          .map((row) => (Array.isArray(row) ? row.join('\t') : ''))
          .join('\n');

        setRawText(tsv);
        setActiveTab('paste'); // Switch to preview & editor
      } catch (err) {
        console.error(err);
        setErrorMsg('Gagal membaca file Excel. Pastikan format file .xlsx, .xls, atau .csv valid.');
      }
    };

    reader.onerror = () => {
      setErrorMsg('Terjadi kesalahan saat membaca file.');
    };

    reader.readAsBinaryString(file);
  };

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Handle Submit Import
  const handleCommitImport = () => {
    if (parsedStudents.length === 0) {
      setErrorMsg('Belum ada data murid yang berhasil dikenali. Silakan salin data dari Excel terlebih dahulu.');
      return;
    }

    const payload = parsedStudents.map((s) => ({
      nisn: s.nisn,
      nama: s.nama,
      gender: s.gender,
      classId: activeClass.id,
      kontakOrtu: s.kontakOrtu,
      catatan: s.catatan || 'Diimpor dari Excel',
    }));

    onImportStudents(payload, importMode);
    onClose();
  };

  // Sample Template
  const handleInsertSample = () => {
    const sample = `No\tNISN\tNama Murid\tL/P\tKontak Ortu\tCatatan
1\t0051234561\tAhmad Fajar Prasetyo\tL\t081234567890\tSiswa Aktif
2\t0051234562\tAnisa Rahmawati\tP\t081345678901\tPengurus Kelas
3\t0051234563\tBagus Dimas Saputra\tL\t081456789012\t-
4\t0051234564\tCantika Putri Maharani\tP\t081567890123\t-
5\t0051234565\tDoni Irawan\tL\t081678901234\t-`;
    setRawText(sample);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#fffdf8] w-full max-w-3xl rounded-3xl border-3 border-slate-900 shadow-[8px_8px_0px_#1e293b] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 bg-white border-b-2 border-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#dcfce7] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center justify-center text-emerald-950 font-black shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Impor Data Murid dari Excel
                </h2>
                <span className="text-[10px] font-mono font-bold bg-[#e0f2fe] text-sky-950 border border-slate-900 px-2 py-0.5 rounded-full shadow-[1px_1px_0px_#1e293b]">
                  {activeClass.nama}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Bisa copas langsung dari Microsoft Excel / Google Sheets atau unggah file .xlsx/.csv
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-[#fee2e2] hover:bg-[#fca5a5] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-rose-950 transition-all cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab Selector: Copas Langsung vs Unggah File */}
        <div className="px-4 sm:px-6 pt-3 bg-[#faf7ee] border-b-2 border-slate-200 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('paste')}
              className={`px-3.5 py-2 rounded-t-2xl font-black text-xs border-2 border-b-0 border-slate-900 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'paste'
                  ? 'bg-white text-slate-950 shadow-[0_-2px_0px_#1e293b]'
                  : 'bg-[#faf7ee] hover:bg-slate-200 text-slate-600'
              }`}
            >
              <ClipboardPaste className="w-4 h-4 text-emerald-800" />
              <span>Copas Langsung (Excel / Sheets)</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3.5 py-2 rounded-t-2xl font-black text-xs border-2 border-b-0 border-slate-900 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-white text-slate-950 shadow-[0_-2px_0px_#1e293b]'
                  : 'bg-[#faf7ee] hover:bg-slate-200 text-slate-600'
              }`}
            >
              <Upload className="w-4 h-4 text-sky-800" />
              <span>Unggah File (.xlsx / .csv)</span>
            </button>
          </div>

          <button
            onClick={handleInsertSample}
            className="text-[11px] font-bold text-indigo-900 hover:text-indigo-950 underline flex items-center gap-1 py-1 cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-indigo-600" />
            <span>Masukkan Contoh Format</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-[#fee2e2] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center gap-2.5 text-xs font-bold text-rose-950">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-black text-slate-800 flex items-center gap-1.5">
                  <span>Tempelkan (Paste) Baris Tabel dari Excel di Sini:</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    (Pilih tabel di Excel → Ctrl+C → klik kolom ini → Ctrl+V)
                  </span>
                </label>
                {rawText && (
                  <button
                    onClick={() => {
                      setRawText('');
                      setFileName(null);
                    }}
                    className="text-[11px] text-rose-700 hover:text-rose-900 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Bersihkan
                  </button>
                )}
              </div>

              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Contoh kolom yang disalin dari Excel:&#10;NISN	Nama Siswa	L/P	Kontak Ortu&#10;0051234561	Ahmad Fajar Prasetyo	L	081234567890&#10;0051234562	Anisa Rahmawati	P	081345678901&#10;0051234563	Bagus Dimas Saputra	L	081456789012"
                rows={6}
                className="w-full p-3.5 rounded-2xl bg-white border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 leading-relaxed"
              />
            </div>
          )}

          {activeTab === 'upload' && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`p-6 sm:p-8 rounded-3xl border-3 border-dashed transition-all text-center flex flex-col items-center justify-center gap-3 cursor-pointer ${
                isDragging
                  ? 'border-emerald-600 bg-[#ecfdf5]'
                  : 'border-slate-900 bg-white hover:bg-[#faf7ee]'
              }`}
              onClick={() => {
                const input = document.getElementById('excel-file-input') as HTMLInputElement;
                input?.click();
              }}
            >
              <input
                id="excel-file-input"
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <div className="w-14 h-14 rounded-2xl bg-[#dcfce7] border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] flex items-center justify-center text-emerald-950">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">
                  {fileName ? `File terpilih: ${fileName}` : 'Tarik & Letakkan file Excel di sini'}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Mendukung format .xlsx, .xls, dan .csv (Otomatis membaca sheet pertama)
                </p>
              </div>
              <button
                type="button"
                className="px-4 py-2 rounded-2xl bg-[#e0f2fe] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-xs font-black text-sky-950"
              >
                Pilih File dari Komputer
              </button>
            </div>
          )}

          {/* Live Preview & Verification */}
          {parsedStudents.length > 0 && (
            <div className="space-y-3 pt-2 border-t-2 border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-black text-slate-900">
                    Pratinjau Hasil Parser: {parsedStudents.length} Murid Ditemukan
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono">
                  <span className="bg-[#e0f2fe] text-sky-950 border border-slate-900 px-2 py-0.5 rounded-lg font-bold">
                    L: {parsedStudents.filter((s) => s.gender === 'L').length}
                  </span>
                  <span className="bg-[#fce7f3] text-pink-950 border border-slate-900 px-2 py-0.5 rounded-lg font-bold">
                    P: {parsedStudents.filter((s) => s.gender === 'P').length}
                  </span>
                </div>
              </div>

              {/* Table Preview */}
              <div className="max-h-48 overflow-y-auto rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] bg-white text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#faf7ee] text-slate-900 font-black text-[11px] border-b-2 border-slate-900 sticky top-0">
                    <tr>
                      <th className="py-2 px-3 text-center w-10">No</th>
                      <th className="py-2 px-3">NISN</th>
                      <th className="py-2 px-3">Nama Siswa</th>
                      <th className="py-2 px-2 text-center w-14">L/P</th>
                      <th className="py-2 px-3">Kontak Ortu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedStudents.slice(0, 10).map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-1.5 px-3 text-center font-mono font-bold">{idx + 1}</td>
                        <td className="py-1.5 px-3 font-mono">{s.nisn}</td>
                        <td className="py-1.5 px-3 font-bold text-slate-900">{s.nama}</td>
                        <td className="py-1.5 px-2 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded font-mono font-black text-[10px] ${
                              s.gender === 'L' ? 'bg-[#e0f2fe] text-sky-950' : 'bg-[#fce7f3] text-pink-950'
                            }`}
                          >
                            {s.gender}
                          </span>
                        </td>
                        <td className="py-1.5 px-3 text-slate-600 font-mono text-[11px]">{s.kontakOrtu}</td>
                      </tr>
                    ))}
                    {parsedStudents.length > 10 && (
                      <tr className="bg-[#f8fafc]">
                        <td colSpan={5} className="py-2 px-3 text-center text-slate-500 font-medium italic">
                          ... dan {parsedStudents.length - 10} murid lainnya siap diimpor.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mode Selection */}
              <div className="p-3 rounded-2xl bg-[#fffdf8] border-2 border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-black text-slate-900">Metode Penggabungan Data:</p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Saat ini kelas {activeClass.nama} memiliki {existingCount} murid terdaftar.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setImportMode('append')}
                    className={`px-3 py-1.5 rounded-xl border-2 border-slate-900 text-xs font-black transition-all cursor-pointer ${
                      importMode === 'append'
                        ? 'bg-[#dcfce7] text-slate-950 shadow-[2px_2px_0px_#1e293b]'
                        : 'bg-white text-slate-600'
                    }`}
                  >
                    Tambahkan (Append)
                  </button>
                  <button
                    onClick={() => setImportMode('replace')}
                    className={`px-3 py-1.5 rounded-xl border-2 border-slate-900 text-xs font-black transition-all cursor-pointer ${
                      importMode === 'replace'
                        ? 'bg-[#fee2e2] text-rose-950 shadow-[2px_2px_0px_#1e293b]'
                        : 'bg-white text-slate-600'
                    }`}
                  >
                    Ganti Seluruh Murid
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t-2 border-slate-900 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 border-2 border-slate-900 text-slate-900 text-xs font-black transition-all cursor-pointer"
          >
            Batal
          </button>

          <button
            onClick={handleCommitImport}
            disabled={parsedStudents.length === 0}
            className={`px-5 py-2.5 rounded-2xl border-2 border-slate-900 text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
              parsedStudents.length > 0
                ? 'bg-[#6ee7b7] hover:bg-[#34d399] text-slate-950 shadow-[3px_3px_0px_#1e293b] active:translate-x-[2px] active:translate-y-[2px]'
                : 'bg-slate-200 text-slate-400 border-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Impor {parsedStudents.length > 0 ? `${parsedStudents.length} Murid` : 'Data'} Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
