import React, { useState } from 'react';
import {
  Building,
  Image as ImageIcon,
  CheckCircle2,
  Printer,
  RotateCcw,
  Save,
  GraduationCap,
} from 'lucide-react';
import { PrintConfig, TeacherProfile, ClassRoom } from '../types';
import {
  DEFAULT_PRINT_CONFIG,
  parseLogoEmbed,
  savePrintConfig,
  TUT_WURI_LOGO_SVG,
  SMK_BISA_LOGO_SVG,
  GARUDA_LOGO_SVG,
  APP_LOGO_URL,
} from '../utils/printConfig';
import { PrintableDocumentType } from './PrintableDocument';
import { KopSuratTab } from './print/KopSuratTab';
import { LogoEmbedTab, LogoPreset } from './print/LogoEmbedTab';
import { PejabatTab } from './print/PejabatTab';
import { PrintCenterTab } from './print/PrintCenterTab';
import { LetterheadPreview } from './print/LetterheadPreview';
import { PrintPreviewHost } from './print/PrintPreviewHost';

interface PrintConfigManualEditorProps {
  teacher: TeacherProfile;
  schoolName: string;
  classes: ClassRoom[];
  activeClass: ClassRoom;
  printConfig: PrintConfig;
  onUpdatePrintConfig: (config: PrintConfig) => void;
  onShowToast: (title: string, desc: string) => void;
}

export const PrintConfigManualEditor: React.FC<PrintConfigManualEditorProps> = ({
  teacher,
  schoolName,
  classes,
  activeClass,
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

  const handleInputChange = (field: keyof PrintConfig, value: PrintConfig[keyof PrintConfig]) => {
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

  const handlePresetLogo = (type: LogoPreset) => {
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

      {activeSubTab === 'kop' && <KopSuratTab formData={formData} onChange={handleInputChange} />}

      {activeSubTab === 'logo' && (
        <LogoEmbedTab
          formData={formData}
          parsedLogo={parsedLogo}
          onChange={handleInputChange}
          onPreset={handlePresetLogo}
        />
      )}

      {activeSubTab === 'pejabat' && <PejabatTab formData={formData} onChange={handleInputChange} />}

      {activeSubTab === 'integrasi' && (
        <PrintCenterTab
          classes={classes}
          currentClass={currentPrintClass}
          selectedClassId={selectedClassId}
          onSelectClass={setSelectedClassId}
          selectedDocType={selectedDocType}
          onSelectDocType={setSelectedDocType}
          onOpenPreview={() => {
            // Simpan dulu agar dokumen memakai konfigurasi terbaru
            handleSave();
            setShowPreviewModal(true);
          }}
        />
      )}

      <LetterheadPreview formData={formData} parsedLogo={parsedLogo} teacher={teacher} />

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


      {/* Dokumen cetak terintegrasi: data kelas dimuat lazy, hanya saat pratinjau dibuka */}
      {showPreviewModal && (
        <PrintPreviewHost
          type={selectedDocType}
          cls={currentPrintClass}
          teacher={teacher}
          printConfig={formData}
          onClose={() => setShowPreviewModal(false)}
        />
      )}
    </div>
  );
};
