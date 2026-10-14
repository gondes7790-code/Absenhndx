import React, { useState } from 'react';
import {
  FileText,
  Building,
  Image as ImageIcon,
  CheckCircle2,
  Printer,
  Eye,
  RotateCcw,
  Save,
  Sparkles,
  Award,
  Layers,
  GraduationCap,
  Calendar,
  Code,
  Shield,
  HelpCircle,
} from 'lucide-react';
import {
  PrintConfig,
  TeacherProfile,
  ClassRoom,
  Student,
  AttendanceSession,
  AttendanceRecord,
  GradeRecord,
  JournalEntry,
  FinanceTransaction,
} from '../types';
import {
  DEFAULT_PRINT_CONFIG,
  parseLogoEmbed,
  savePrintConfig,
  TUT_WURI_LOGO_SVG,
  SMK_BISA_LOGO_SVG,
  GARUDA_LOGO_SVG,
  APP_LOGO_URL,
} from '../utils/printConfig';
import { PrintableDocument, PrintableDocumentType } from './PrintableDocument';

interface PrintConfigManualEditorProps {
  teacher: TeacherProfile;
  schoolName: string;
  classes: ClassRoom[];
  activeClass: ClassRoom;
  students: Student[];
  sessions: AttendanceSession[];
  attendanceRecords: AttendanceRecord[];
  grades: GradeRecord[];
  journals: JournalEntry[];
  financeTransactions: FinanceTransaction[];
  printConfig: PrintConfig;
  onUpdatePrintConfig: (config: PrintConfig) => void;
  onShowToast: (title: string, desc: string) => void;
}

export const PrintConfigManualEditor: React.FC<PrintConfigManualEditorProps> = ({
  teacher,
  schoolName,
  classes,
  activeClass,
  students,
  sessions,
  attendanceRecords,
  grades,
  journals,
  financeTransactions,
  printConfig,
  onUpdatePrintConfig,
  onShowToast,
}) => {
  // Local edit form state initialized from printConfig
  const [formData, setFormData] = useState<PrintConfig>({ ...printConfig });
  const [activeSubTab, setActiveSubTab] = useState<'kop' | 'logo' | 'pejabat' | 'integrasi'>('kop');
  const [isSaved, setIsSaved] = useState(false);

  // Selected document to preview/print from the integrated hub
  const [selectedDocType, setSelectedDocType] = useState<PrintableDocumentType>('attendance');
  const [selectedClassId, setSelectedClassId] = useState<string>(activeClass.id);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Parse logo in real-time
  const parsedLogo = parseLogoEmbed(formData.logoEmbedCode);

  const handleInputChange = (field: keyof PrintConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    savePrintConfig(formData);
    onUpdatePrintConfig(formData);
    setIsSaved(true);
    onShowToast(
      'Kop & Dokumen Siap Cetak Diperbarui',
      'Identitas kop surat resmi, logo embed, dan nama kepala sekolah berhasil disimpan dan disinkronkan ke seluruh dokumen cetak.'
    );
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetToDefault = () => {
    const resetCfg = {
      ...DEFAULT_PRINT_CONFIG,
      schoolName: schoolName || DEFAULT_PRINT_CONFIG.schoolName,
    };
    setFormData(resetCfg);
    savePrintConfig(resetCfg);
    onUpdatePrintConfig(resetCfg);
    onShowToast('Pengaturan Direset', 'Kop surat dan tanda tangan dikembalikan ke format standar dinas.');
  };

  const handlePresetLogo = (type: 'tutwuri' | 'smkbisa' | 'garuda' | 'applogo' | 'empty') => {
    if (type === 'applogo') {
      handleInputChange('logoEmbedCode', APP_LOGO_URL);
      onShowToast('Preset Logo Dimuat', 'Logo Resmi Hadir! berhasil disematkan.');
    } else if (type === 'tutwuri') {
      handleInputChange('logoEmbedCode', TUT_WURI_LOGO_SVG);
      onShowToast('Preset Logo Dimuat', 'Logo Tut Wuri Handayani berhasil disematkan.');
    } else if (type === 'smkbisa') {
      handleInputChange('logoEmbedCode', SMK_BISA_LOGO_SVG);
      onShowToast('Preset Logo Dimuat', 'Logo SMK BISA Hebat berhasil disematkan.');
    } else if (type === 'garuda') {
      handleInputChange('logoEmbedCode', GARUDA_LOGO_SVG);
      onShowToast('Preset Logo Dimuat', 'Lambang Garuda Pancasila berhasil disematkan.');
    } else {
      handleInputChange('logoEmbedCode', '');
      onShowToast('Logo Dikosongkan', 'Kode embed logo sekolah dibersihkan.');
    }
  };

  // Determine current class object for integrated printing
  const currentPrintClass = classes.find((c) => c.id === selectedClassId) || activeClass;

  // Filter students for the selected class if applicable
  const classStudents = students.filter(
    (s) => !s.classId || s.classId === currentPrintClass.id
  );

  return (
    <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 shadow-[4px_4px_0px_#1e293b]">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-slate-100 mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#fef9c3] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center justify-center text-xl shrink-0">
            🖨️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Edit Manual Dokumen Siap Cetak & Kop Surat
              </h3>
              <span className="bg-[#dcfce7] text-emerald-950 border border-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-[1px_1px_0px_#1e293b]">
                Universal Sync
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Kustomisasi kop surat dinas, embed kode logo sekolah, pejabat kepala sekolah, dan integrasi cetak semua dokumen
            </p>
          </div>
        </div>

        {isSaved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#dcfce7] border-2 border-slate-900 text-xs font-black text-emerald-950 animate-bounce self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Tersimpan & Terintegrasi!</span>
          </div>
        )}
      </div>

      {/* Sub-Tabs / Mode Navigation */}
      <div className="flex flex-wrap items-center gap-2 mb-6 p-1.5 bg-[#faf7ee] rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b]">
        <button
          type="button"
          onClick={() => setActiveSubTab('kop')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 border-2 transition-all cursor-pointer ${
            activeSubTab === 'kop'
              ? 'bg-[#ede9fe] text-indigo-950 border-slate-900 shadow-[2px_2px_0px_#1e293b]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>1. Identitas Kop Surat</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('logo')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 border-2 transition-all cursor-pointer ${
            activeSubTab === 'logo'
              ? 'bg-[#dcfce7] text-emerald-950 border-slate-900 shadow-[2px_2px_0px_#1e293b]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>2. Embed Logo Sekolah</span>
          {parsedLogo.type !== 'none' && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('pejabat')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 border-2 transition-all cursor-pointer ${
            activeSubTab === 'pejabat'
              ? 'bg-[#fee2e2] text-rose-950 border-slate-900 shadow-[2px_2px_0px_#1e293b]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>3. Kepala Sekolah & Titimangsa</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('integrasi')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 border-2 transition-all cursor-pointer ${
            activeSubTab === 'integrasi'
              ? 'bg-[#fef9c3] text-amber-950 border-slate-900 shadow-[2px_2px_0px_#1e293b]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Printer className="w-3.5 h-3.5 text-amber-800" />
          <span>4. Pusat Cetak Universal</span>
        </button>
      </div>

      {/* Tab Content 1: Identitas Kop Surat */}
      {activeSubTab === 'kop' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                Baris 1: Instansi Induk / Pemerintah Daerah *
              </label>
              <input
                type="text"
                value={formData.dinasHeader}
                onChange={(e) => handleInputChange('dinasHeader', e.target.value)}
                placeholder="Contoh: PEMERINTAH DAERAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA"
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                Baris 2: Dinas Pendidikan / Bidang Kejuruan
              </label>
              <input
                type="text"
                value={formData.dinasSubHeader}
                onChange={(e) => handleInputChange('dinasSubHeader', e.target.value)}
                placeholder="Contoh: DINAS PENDIDIKAN DAN KEBUDAYAAN"
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                Baris 3: Nama Satuan Pendidikan (Nama Sekolah Utama) *
              </label>
              <input
                type="text"
                required
                value={formData.schoolName}
                onChange={(e) => handleInputChange('schoolName', e.target.value)}
                placeholder="Contoh: SMK MERDEKA INDONESIA"
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#fef9c3] text-sm font-black text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                Baris 4: Program Keahlian / Sub Judul Dokumen
              </label>
              <input
                type="text"
                value={formData.unitSubHeader || ''}
                onChange={(e) => handleInputChange('unitSubHeader', e.target.value)}
                placeholder="Contoh: SISTEM MANAJEMEN PRESENSI & KURIKULUM MERDEKA INDONESIA"
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                Alamat Lengkap Satuan Pendidikan *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Contoh: Jl. Merdeka Belajar No. 45, Kompleks Pendidikan Kejuruan Terpadu"
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                Kontak Telepon / Fax Sekolah
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Contoh: Telp. (021) 7890123 / Fax. (021) 7890124"
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                Alamat Email & Website / Portal Resmi
              </label>
              <input
                type="text"
                value={formData.emailWeb}
                onChange={(e) => handleInputChange('emailWeb', e.target.value)}
                placeholder="Contoh: info@smkmerdeka.sch.id • https://hadir.app"
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                Gaya Garis Pembatas Kop Surat
              </label>
              <select
                value={formData.borderStyle}
                onChange={(e) =>
                  handleInputChange('borderStyle', e.target.value as 'double' | 'solid' | 'thick')
                }
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488]"
              >
                <option value="double">Garis Ganda Dinas Standar (Double Border 3px)</option>
                <option value="thick">Garis Tunggal Tebal (Thick Solid 4px)</option>
                <option value="solid">Garis Tunggal Halus (Solid 2px)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Embed Logo Sekolah */}
      {activeSubTab === 'logo' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="p-4 rounded-2xl bg-[#eff6ff] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b]">
            <div className="flex items-start gap-3">
              <Code className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-950 font-medium">
                <span className="font-bold">Mekanisme Embed Logo Sekolah:</span> Masukkan tag kode
                embed HTML seperti <code className="bg-white px-1.5 py-0.5 rounded border border-slate-900 font-mono text-[11px]">&lt;img src="https://..." /&gt;</code>, kode vektor <code className="bg-white px-1.5 py-0.5 rounded border border-slate-900 font-mono text-[11px]">&lt;svg&gt;...&lt;/svg&gt;</code>, ataupun tautan URL gambar langsung (<code className="bg-white px-1.5 py-0.5 rounded border border-slate-900 font-mono text-[11px]">https://...</code> atau base64). Logo akan langsung tampil secara otomatis pada kotak pratinjau di bawah.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Input Kode Embed (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>Kode Embed Logo Sekolah / URL Gambar</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Langsung tampil otomatis saat dimasukkan
                  </span>
                </label>
                <textarea
                  rows={4}
                  value={formData.logoEmbedCode}
                  onChange={(e) => handleInputChange('logoEmbedCode', e.target.value)}
                  placeholder="Paste kode embed logo di sini (cth: <img src='https://...' /> atau URL https://... atau <svg>...</svg>)"
                  className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488] resize-none"
                />
              </div>

              {/* Quick Presets */}
              <div>
                <span className="text-[11px] font-black text-slate-700 block mb-1.5">
                  Preset Lambang Pendidikan Siap Pakai (1 Klik):
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handlePresetLogo('applogo')}
                    className="px-2.5 py-1.5 rounded-xl bg-[#dcfce7] hover:bg-[#bbf7d0] border-2 border-slate-900 text-[11px] font-black text-emerald-950 shadow-[1.5px_1.5px_0px_#1e293b] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
                  >
                    <img src={APP_LOGO_URL} alt="Logo" className="w-4 h-4 object-contain" />
                    <span>Logo Resmi Hadir!</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePresetLogo('tutwuri')}
                    className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border-2 border-slate-900 text-[11px] font-bold text-slate-900 shadow-[1.5px_1.5px_0px_#1e293b] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🏛️ Tut Wuri Handayani</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePresetLogo('smkbisa')}
                    className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border-2 border-slate-900 text-[11px] font-bold text-slate-900 shadow-[1.5px_1.5px_0px_#1e293b] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
                  >
                    <span>⚡ SMK BISA Hebat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePresetLogo('garuda')}
                    className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border-2 border-slate-900 text-[11px] font-bold text-slate-900 shadow-[1.5px_1.5px_0px_#1e293b] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🦅 Garuda Pancasila</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePresetLogo('empty')}
                    className="px-2.5 py-1.5 rounded-xl bg-[#fee2e2] hover:bg-[#fca5a5] border-2 border-slate-900 text-[11px] font-bold text-rose-950 shadow-[1.5px_1.5px_0px_#1e293b] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🧹 Kosongkan Logo</span>
                  </button>
                </div>
              </div>

              {/* Logo Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Posisi Logo Sekolah
                  </label>
                  <select
                    value={formData.logoPosition}
                    onChange={(e) =>
                      handleInputChange('logoPosition', e.target.value as 'left' | 'right' | 'both')
                    }
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900"
                  >
                    <option value="right">Sisi Kanan Kop Surat (Standar)</option>
                    <option value="left">Sisi Kiri Kop Surat</option>
                    <option value="both">Kedua Sisi (Kiri & Kanan)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="showTutWuri"
                    checked={formData.showTutWuriLogo}
                    onChange={(e) => handleInputChange('showTutWuriLogo', e.target.checked)}
                    className="w-4 h-4 rounded border-2 border-slate-900 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="showTutWuri" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Tampilkan Logo Tut Wuri di Sisi Kiri
                  </label>
                </div>
              </div>
            </div>

            {/* Live Preview Logo Box (5 cols) */}
            <div className="lg:col-span-5 bg-[#faf7ee] border-2 border-slate-900 rounded-2xl p-4 shadow-[2px_2px_0px_#1e293b] flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 mb-3 block">
                Pratinjau Hasil Embed Logo
              </span>

              <div className="w-28 h-28 rounded-2xl bg-white border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center justify-center p-2 overflow-hidden mb-3">
                {parsedLogo.type === 'svg' ? (
                  <div
                    className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                    dangerouslySetInnerHTML={{ __html: parsedLogo.content }}
                  />
                ) : parsedLogo.type === 'img' && parsedLogo.content ? (
                  <img
                    src={parsedLogo.content}
                    alt="Pratinjau Logo"
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-center p-2 text-slate-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 stroke-1" />
                    <span className="text-[10px]">Logo Kosong</span>
                  </div>
                )}
              </div>

              {parsedLogo.type !== 'none' ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#dcfce7] border border-slate-900 text-[10px] font-black text-emerald-950 shadow-[1px_1px_0px_#1e293b]">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  <span>Kode Logo Terdeteksi ({parsedLogo.type.toUpperCase()})</span>
                </div>
              ) : (
                <span className="text-[10px] text-slate-500 font-medium">
                  Menggunakan lambang resmi Tut Wuri Handayani secara otomatis
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Kepala Sekolah & Titimangsa */}
      {activeSubTab === 'pejabat' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                Nama Lengkap Kepala Sekolah & Gelar *
              </label>
              <input
                type="text"
                required
                value={formData.principalName}
                onChange={(e) => handleInputChange('principalName', e.target.value)}
                placeholder="Contoh: Drs. H. Mulyadi, M.Pd."
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#fee2e2] text-xs font-black text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                NIP Kepala Sekolah *
              </label>
              <input
                type="text"
                required
                value={formData.principalNip}
                onChange={(e) => handleInputChange('principalNip', e.target.value)}
                placeholder="Contoh: 19680512 199403 1 004"
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                Kota Pembuatan Dokumen (Titimangsa) *
              </label>
              <input
                type="text"
                value={formData.documentCity}
                onChange={(e) => handleInputChange('documentCity', e.target.value)}
                placeholder="Contoh: Jakarta"
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                Kustomisasi Tanggal Dokumen (Opsional)
              </label>
              <input
                type="text"
                value={formData.customDateText || ''}
                onChange={(e) => handleInputChange('customDateText', e.target.value)}
                placeholder="Kosongkan untuk tanggal hari ini otomatis"
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                Catatan Kaki Dokumen Resmi (Footer Note)
              </label>
              <input
                type="text"
                value={formData.footerNote}
                onChange={(e) => handleInputChange('footerNote', e.target.value)}
                placeholder="Dokumen Sah Digital - Dicetak melalui Hadir! Platform Kurikulum Merdeka"
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 4: Pusat Cetak Dokumen Terintegrasi ("Integrasikan semua dokumen siap cetak pada edit manual ini") */}
      {activeSubTab === 'integrasi' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-4 rounded-2xl bg-[#fef9c3] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b]">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-900" />
                <span className="text-xs font-black text-amber-950">
                  Pusat Integrasi Dokumen Siap Cetak (A4 Full Putih)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-700">Pilih Kelas:</span>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="px-2.5 py-1 rounded-xl bg-white border border-slate-900 text-xs font-bold text-slate-900 shadow-xs"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nama} ({c.mapel})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Cards for each document type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* 1. Presensi Pertemuan */}
            <div
              onClick={() => setSelectedDocType('attendance')}
              className={`p-4 rounded-2xl border-2 border-slate-900 cursor-pointer transition-all ${
                selectedDocType === 'attendance'
                  ? 'bg-[#dcfce7] shadow-[3px_3px_0px_#1e293b] scale-[1.01]'
                  : 'bg-white hover:bg-slate-50 shadow-[1.5px_1.5px_0px_#1e293b]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">📄</span>
                <span className="text-[10px] font-mono font-bold bg-white border border-slate-900 px-1.5 py-0.5 rounded-md">
                  ABSENSI
                </span>
              </div>
              <h4 className="text-xs font-black text-slate-900">
                Daftar Hadir Siswa Tatap Muka
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Presensi pertemuan per sesi dengan keterangan H/S/I/A/D.
              </p>
            </div>

            {/* 2. Rekap Bulanan */}
            <div
              onClick={() => setSelectedDocType('recap')}
              className={`p-4 rounded-2xl border-2 border-slate-900 cursor-pointer transition-all ${
                selectedDocType === 'recap'
                  ? 'bg-[#e0f2fe] shadow-[3px_3px_0px_#1e293b] scale-[1.01]'
                  : 'bg-white hover:bg-slate-50 shadow-[1.5px_1.5px_0px_#1e293b]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">📊</span>
                <span className="text-[10px] font-mono font-bold bg-white border border-slate-900 px-1.5 py-0.5 rounded-md">
                  REKAP
                </span>
              </div>
              <h4 className="text-xs font-black text-slate-900">
                Rekapitulasi Presensi Bulanan
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Akumulasi kehadiran, persentase %, dan predikat pembinaan.
              </p>
            </div>

            {/* 3. Buku Nilai */}
            <div
              onClick={() => setSelectedDocType('gradebook')}
              className={`p-4 rounded-2xl border-2 border-slate-900 cursor-pointer transition-all ${
                selectedDocType === 'gradebook'
                  ? 'bg-[#ede9fe] shadow-[3px_3px_0px_#1e293b] scale-[1.01]'
                  : 'bg-white hover:bg-slate-50 shadow-[1.5px_1.5px_0px_#1e293b]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">🏆</span>
                <span className="text-[10px] font-mono font-bold bg-white border border-slate-900 px-1.5 py-0.5 rounded-md">
                  NILAI
                </span>
              </div>
              <h4 className="text-xs font-black text-slate-900">
                Buku Daftar Nilai & Capaian TP
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Leger asesmen formatif TP, STS, SAS, dan nilai rapor akhir.
              </p>
            </div>

            {/* 4. Jurnal Mengajar */}
            <div
              onClick={() => setSelectedDocType('journal')}
              className={`p-4 rounded-2xl border-2 border-slate-900 cursor-pointer transition-all ${
                selectedDocType === 'journal'
                  ? 'bg-[#fef9c3] shadow-[3px_3px_0px_#1e293b] scale-[1.01]'
                  : 'bg-white hover:bg-slate-50 shadow-[1.5px_1.5px_0px_#1e293b]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">📖</span>
                <span className="text-[10px] font-mono font-bold bg-white border border-slate-900 px-1.5 py-0.5 rounded-md">
                  AGENDA
                </span>
              </div>
              <h4 className="text-xs font-black text-slate-900">
                Buku Agenda & Jurnal Guru
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Jurnal harian pembelajaran, materi kegiatan, dan jam tatap muka.
              </p>
            </div>

            {/* 5. Kas & Tabungan */}
            <div
              onClick={() => setSelectedDocType('finance')}
              className={`p-4 rounded-2xl border-2 border-slate-900 cursor-pointer transition-all ${
                selectedDocType === 'finance'
                  ? 'bg-[#fee2e2] shadow-[3px_3px_0px_#1e293b] scale-[1.01]'
                  : 'bg-white hover:bg-slate-50 shadow-[1.5px_1.5px_0px_#1e293b]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">💰</span>
                <span className="text-[10px] font-mono font-bold bg-white border border-slate-900 px-1.5 py-0.5 rounded-md">
                  KEUANGAN
                </span>
              </div>
              <h4 className="text-xs font-black text-slate-900">
                Rekapitulasi Kas & Tabungan Siswa
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Laporan kas kelas dan saldo tabungan siswa terverifikasi.
              </p>
            </div>
          </div>

          {/* Action to preview or print chosen doc */}
          <div className="p-4 rounded-2xl bg-[#faf7ee] border-2 border-slate-900 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs font-bold text-slate-900">
                Dokumen Terpilih:{' '}
                <span className="font-black underline uppercase">
                  {selectedDocType === 'attendance'
                    ? 'Daftar Hadir Tatap Muka'
                    : selectedDocType === 'recap'
                    ? 'Rekapitulasi Presensi Bulanan'
                    : selectedDocType === 'gradebook'
                    ? 'Buku Nilai & Capaian TP'
                    : selectedDocType === 'journal'
                    ? 'Agenda & Jurnal Harian Mengajar'
                    : 'Rekapitulasi Kas & Tabungan'}
                </span>
              </p>
              <p className="text-[11px] text-slate-600">
                Kelas: {currentPrintClass.nama} • Kop & Pengesahan Mengikuti Konfigurasi Di Atas
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                // Ensure current edits are saved first so document uses them
                handleSave();
                setShowPreviewModal(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-[#a7f3d0] hover:bg-[#6ee7b7] text-slate-950 font-black text-xs border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-2"
            >
              <Eye className="w-4 h-4 text-emerald-900" />
              <span>Buka Pratinjau Kertas Siap Cetak (A4 Putih)</span>
            </button>
          </div>
        </div>
      )}

      {/* Live Preview Box of the Letterhead (Pratinjau Kop Surat Resmi) */}
      <div className="mt-6 p-4 sm:p-6 rounded-2xl bg-[#ffffff] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <span>👁️ Pratinjau Kop Surat Resmi & Tanda Tangan:</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {formData.borderStyle.toUpperCase()} BORDER • A4 READY
          </span>
        </div>

        {/* Scaled-down letterhead preview sheet */}
        <div className="bg-white border border-slate-300 p-4 sm:p-6 rounded font-serif text-black text-center shadow-xs">
          <div
            className={`pb-3 mb-3 text-center ${
              formData.borderStyle === 'solid'
                ? 'border-b-2 border-black'
                : formData.borderStyle === 'thick'
                ? 'border-b-4 border-black'
                : 'border-b-4 border-double border-black'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              {/* Left Logo Slot */}
              <div className="w-14 h-14 shrink-0 flex items-center justify-center">
                {formData.logoPosition === 'left' ? (
                  parsedLogo.type === 'svg' ? (
                    <div
                      className="w-12 h-12 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: parsedLogo.content }}
                    />
                  ) : parsedLogo.type === 'img' && parsedLogo.content ? (
                    <img
                      src={parsedLogo.content}
                      alt="Logo Sekolah"
                      className="max-w-[48px] max-h-[48px] object-contain"
                    />
                  ) : (
                    <img
                      src={TUT_WURI_LOGO_SVG}
                      alt="Logo Tut Wuri"
                      className="max-w-[44px] max-h-[44px] object-contain"
                    />
                  )
                ) : formData.showTutWuriLogo ? (
                  <img
                    src={TUT_WURI_LOGO_SVG}
                    alt="Tut Wuri"
                    className="max-w-[48px] max-h-[48px] object-contain"
                  />
                ) : (
                  <div className="w-4 shrink-0" />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 text-center px-2">
                <h3 className="text-[11px] sm:text-xs font-bold tracking-wider uppercase leading-tight font-serif text-black">
                  {formData.dinasHeader}
                </h3>
                {formData.dinasSubHeader ? (
                  <h4 className="text-[10px] font-bold tracking-wide uppercase leading-tight font-serif text-black mt-0.5">
                    {formData.dinasSubHeader}
                  </h4>
                ) : null}
                <h1 className="text-sm sm:text-lg font-black tracking-wide uppercase leading-tight font-serif text-black mt-0.5">
                  {formData.schoolName}
                </h1>
                {formData.unitSubHeader ? (
                  <p className="text-[9px] font-bold tracking-wide uppercase leading-tight font-serif text-black mt-0.5">
                    {formData.unitSubHeader}
                  </p>
                ) : null}
                <p className="text-[9px] text-black font-normal leading-tight font-serif mt-0.5">
                  {formData.address}
                </p>
                <p className="text-[8.5px] text-black font-normal leading-tight font-serif">
                  {formData.phone} • {formData.emailWeb}
                </p>
              </div>

              {/* Right Logo Slot */}
              <div className="w-14 h-14 shrink-0 flex items-center justify-center">
                {formData.logoPosition === 'right' || formData.logoPosition === 'both' ? (
                  parsedLogo.type === 'svg' ? (
                    <div
                      className="w-12 h-12 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: parsedLogo.content }}
                    />
                  ) : parsedLogo.type === 'img' && parsedLogo.content ? (
                    <img
                      src={parsedLogo.content}
                      alt="Logo Sekolah"
                      className="max-w-[48px] max-h-[48px] object-contain"
                    />
                  ) : (
                    <img
                      src={TUT_WURI_LOGO_SVG}
                      alt="Logo Tut Wuri"
                      className="max-w-[44px] max-h-[44px] object-contain"
                    />
                  )
                ) : formData.logoPosition === 'left' && formData.showTutWuriLogo ? (
                  <img
                    src={TUT_WURI_LOGO_SVG}
                    alt="Logo Tut Wuri"
                    className="max-w-[44px] max-h-[44px] object-contain"
                  />
                ) : (
                  <div className="w-4 shrink-0" />
                )}
              </div>
            </div>
          </div>

          {/* Quick Mock Signatures */}
          <div className="grid grid-cols-2 gap-4 text-[10px] text-center pt-2">
            <div>
              <p className="font-semibold">Mengetahui,</p>
              <p className="font-bold">Kepala Sekolah {formData.schoolName}</p>
              <div className="h-6" />
              <p className="font-bold underline uppercase">{formData.principalName}</p>
              <p className="text-[9px] font-mono">NIP. {formData.principalNip}</p>
            </div>
            <div>
              <p className="font-semibold">
                {formData.documentCity},{' '}
                {formData.customDateText ||
                  new Date().toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
              </p>
              <p className="font-bold">Guru Mata Pelajaran</p>
              <div className="h-6" />
              <p className="font-bold underline uppercase">{teacher.name}</p>
              <p className="text-[9px] font-mono">NIP. {teacher.nip}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Save & Reset Actions Strip */}
      <div className="pt-6 mt-6 border-t-2 border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleResetToDefault}
          className="px-4 py-2.5 rounded-2xl bg-[#f1f5f9] hover:bg-[#e2e8f0] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-xs font-bold text-slate-700 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
          <span>Reset ke Standar Dinas</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSave()}
            className="px-6 py-2.5 rounded-2xl bg-[#a7f3d0] hover:bg-[#6ee7b7] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] text-xs font-black text-slate-950 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4 text-emerald-950" />
            <span>Simpan Pengaturan Kop & Dokumen</span>
          </button>
        </div>
      </div>

      {/* Integrated Printable Document Modal */}
      {showPreviewModal && (
        <PrintableDocument
          type={selectedDocType}
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          activeClass={currentPrintClass}
          teacher={teacher}
          schoolName={formData.schoolName}
          printConfig={formData}
          students={classStudents}
          sessions={sessions}
          session={sessions[0]}
          attendanceRecords={attendanceRecords}
          grades={grades}
          journals={journals}
          financeTransactions={financeTransactions}
        />
      )}
    </div>
  );
};
