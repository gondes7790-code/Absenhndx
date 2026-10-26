import React, { useEffect, useState } from 'react';
import { Flame, LogOut } from 'lucide-react';
import { TeacherProfile, ClassRoom, PrintConfig } from '../types';
import { getSavedPrintConfig } from '../utils/printConfig';
import { PrintConfigManualEditor } from './PrintConfigManualEditor';
import { ProfileSummaryColumn } from './profile/ProfileSummaryColumn';
import { ProfileEditForm } from './profile/ProfileEditForm';
import { PasswordCard } from './profile/PasswordCard';
import { LogoutCard } from './profile/LogoutCard';
import { LogoutConfirmModal } from './profile/LogoutConfirmModal';
import { usePasswordChange } from '../hooks/usePasswordChange';

interface ProfileViewProps {
  teacher: TeacherProfile;
  schoolName: string;
  classes: ClassRoom[];
  totalStudents: number;
  onUpdateTeacher: (updated: TeacherProfile) => void;
  onLogout: () => void;
  onShowToast: (title: string, desc: string) => void;
  activeClass?: ClassRoom | null;
  printConfig?: PrintConfig;
  onUpdatePrintConfig?: (config: PrintConfig) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  teacher,
  schoolName,
  classes,
  totalStudents,
  onUpdateTeacher,
  onLogout,
  onShowToast,
  activeClass,
  printConfig,
  onUpdatePrintConfig,
}) => {
  // Konfigurasi kop dokumen cetak
  const [currentPrintConfig, setCurrentPrintConfig] = useState<PrintConfig>(
    () => printConfig || getSavedPrintConfig(schoolName)
  );

  const handlePrintConfigChange = (updated: PrintConfig) => {
    setCurrentPrintConfig(updated);
    onUpdatePrintConfig?.(updated);
  };

  // Form profil (terkontrol); ikut diperbarui bila data profil berubah dari luar
  const [formData, setFormData] = useState<TeacherProfile>({ ...teacher });
  const [isSaved, setIsSaved] = useState(false);
  useEffect(() => {
    setFormData({ ...teacher });
  }, [teacher]);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const passwordForm = usePasswordChange(teacher.email, onShowToast);

  const handleInputChange = (field: keyof TeacherProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Toast sukses/gagal ditampilkan oleh hook penyimpanan profil.
    onUpdateTeacher(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner - Vintage Postmodern Neobrutalist */}
      <div className="bg-[#fffdf8] border-2 border-slate-900 rounded-3xl p-4 sm:p-6 shadow-[4px_4px_0px_#1e293b] relative overflow-hidden">
        {/* Decorative corner tag */}
        <div className="absolute top-0 right-0 bg-[#ede9fe] border-b-2 border-l-2 border-slate-900 px-3.5 py-1.5 rounded-bl-2xl text-[11px] font-mono font-bold text-indigo-950 flex items-center gap-1.5 shadow-sm">
          <Flame className="w-3.5 h-3.5 text-orange-600 fill-orange-500" />
          <span>RUANG PENDIDIK</span>
          <span className="bg-slate-900 text-white px-2 py-0.2 rounded-full text-[10px]">
            {teacher.handle}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 sm:pt-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 mb-1.5">
              <span className="bg-[#fef9c3] text-amber-950 px-2.5 py-0.5 rounded-full border-2 border-slate-900 font-mono text-[11px] shadow-[1.5px_1.5px_0px_#1e293b]">
                IDENTITAS RESMI
              </span>
              <span>•</span>
              <span className="text-slate-600">{schoolName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              Profil Pendidik & Keamanan Akun
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl font-medium">
              Kelola data kepegawaian, verifikasi identitas pengajar Kurikulum Merdeka, serta konfigurasi akses akun Supabase Cloud.
            </p>
          </div>

          {/* Quick Logout Header Trigger */}
          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#fee2e2] hover:bg-[#fca5a5] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] text-xs font-black text-rose-950 flex items-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-700" />
              <span>Keluar (Log Out)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-6">
          <ProfileSummaryColumn teacher={teacher} classes={classes} totalStudents={totalStudents} />
        </div>

        <div className="lg:col-span-7 space-y-6">
          <ProfileEditForm
            formData={formData}
            isSaved={isSaved}
            onChange={handleInputChange}
            onSubmit={handleSaveProfile}
            onReset={() => setFormData({ ...teacher })}
          />

          {/* Edit manual dokumen siap cetak; data kelas dimuat lazy saat pratinjau dibuka */}
          {(activeClass || classes[0]) && (
            <PrintConfigManualEditor
              teacher={formData}
              schoolName={formData.school || schoolName}
              classes={classes}
              activeClass={(activeClass || classes[0]) as ClassRoom}
              printConfig={currentPrintConfig}
              onUpdatePrintConfig={handlePrintConfigChange}
              onShowToast={onShowToast}
            />
          )}

          <PasswordCard form={passwordForm} />
          <LogoutCard onRequestLogout={() => setShowLogoutModal(true)} />
        </div>
      </div>

      {showLogoutModal && (
        <LogoutConfirmModal
          teacher={teacher}
          onCancel={() => setShowLogoutModal(false)}
          onConfirm={() => {
            setShowLogoutModal(false);
            onLogout();
          }}
        />
      )}
    </div>
  );
};
