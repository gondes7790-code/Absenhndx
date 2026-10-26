import React, { Suspense, lazy, useCallback, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Drawer } from './components/Drawer';
import { TabContent } from './components/TabContent';
import { LoginView } from './components/LoginView';
import { SupabaseModal } from './components/SupabaseModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { ParentPortalModal } from './components/ParentPortalModal';
import { ClassManagementModal } from './components/ClassManagementModal';
import { AuthLoadingScreen } from './components/AuthLoadingScreen';
import { Footer } from './components/Footer';

import { ActiveTab, ClassRoom, Student } from './types';
import { useAuth } from './contexts/AuthContext';
import { useToast } from './contexts/ToastContext';
import { useAuthFlow } from './hooks/useAuthFlow';
import { usePublicToken } from './hooks/usePublicToken';
import { usePrintSettings } from './hooks/usePrintSettings';
import { useTeacherProfile } from './hooks/useTeacherProfile';
import { useWorkspace } from './hooks/useWorkspace';
import { useWorkspaceActions } from './hooks/useWorkspaceActions';

// Halaman publik (?p=token) dimuat terpisah agar tidak membebani bundle aplikasi guru.
const PublicSharePage = lazy(() =>
  import('./components/PublicSharePage').then((m) => ({ default: m.PublicSharePage }))
);

type TeacherProfileApi = ReturnType<typeof useTeacherProfile>;
type PrintSettingsApi = ReturnType<typeof usePrintSettings>;

export default function App() {
  // SECURITY: hanya token-based public share (?p=64hex). Mode lama ?portal=... dinonaktifkan.
  const publicToken = usePublicToken();

  if (publicToken) {
    return (
      <Suspense fallback={<AuthLoadingScreen title="Memuat Tautan..." subtitle="Menyiapkan halaman wali murid" />}>
        <PublicSharePage token={publicToken} />
      </Suspense>
    );
  }
  return <TeacherApp />;
}

/** Gerbang autentikasi: loading → login/demo → aplikasi. */
function TeacherApp() {
  const { isAuthenticated, isLoading, isDemoMode } = useAuth();
  const { handleLoginSuccess, handleDemoLogin, handleLogout } = useAuthFlow();
  const profileApi = useTeacherProfile();
  const printSettings = usePrintSettings(profileApi.remoteSchool);

  if (isLoading) return <AuthLoadingScreen />;

  if (!isAuthenticated) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        onDemoLogin={handleDemoLogin}
        schoolName={printSettings.schoolName}
      />
    );
  }

  return (
    <AuthenticatedApp
      isDemoMode={isDemoMode}
      profileApi={profileApi}
      printSettings={printSettings}
      onLogout={handleLogout}
    />
  );
}

interface AuthenticatedAppProps {
  isDemoMode: boolean;
  profileApi: TeacherProfileApi;
  printSettings: PrintSettingsApi;
  onLogout: () => void;
}

/** Layout utama: hanya mengatur tab aktif, modal, dan menghubungkan hook ke tampilan. */
function AuthenticatedApp({ isDemoMode, profileApi, printSettings, onLogout }: AuthenticatedAppProps) {
  const { showToast } = useToast();
  const { userId } = useAuth();
  const { teacher } = profileApi;
  const { printConfig, schoolName } = printSettings;

  const [activeTab, setActiveTab] = useState<ActiveTab>('presensi');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [targetStudentWA, setTargetStudentWA] = useState<Student | undefined>(undefined);
  const [isParentPortalOpen, setIsParentPortalOpen] = useState(false);

  const workspace = useWorkspace({
    activeTab,
    parentPortalOpen: isParentPortalOpen,
    whatsAppOpen: isWhatsAppModalOpen,
  });
  const actions = useWorkspaceActions({
    workspace,
    teacherName: teacher.name,
    schoolName,
    onNavigate: setActiveTab,
  });

  const { classes, activeClass, activeSession, selectClass, classesApi, studentsApi, recordsApi } =
    workspace;

  const openClassManagement = useCallback(() => setIsClassModalOpen(true), []);
  const openParentLink = useCallback(() => setIsParentPortalOpen(true), []);
  const openWhatsApp = useCallback((target?: Student) => {
    setTargetStudentWA(target);
    setIsWhatsAppModalOpen(true);
  }, []);

  const saveToCloudNotice = useCallback(
    () =>
      showToast(
        'Tersimpan di Cloud Supabase',
        'Data berhasil disinkronisasi ke PostgreSQL dengan Row Level Security.'
      ),
    [showToast]
  );

  const switchToNextClass = () => {
    if (!activeClass || classes.length === 0) return;
    const next = classes[(classes.findIndex((c) => c.id === activeClass.id) + 1) % classes.length];
    selectClass(next);
    showToast('Kelas Berganti', `Sekarang melihat data ${next.nama}`);
  };

  const addClass = async (input: Omit<ClassRoom, 'id'>) => {
    const created = await classesApi.addClass(input);
    if (created) selectClass(created);
  };

  const updateTeacher = async (updated: Parameters<TeacherProfileApi['updateTeacher']>[0]) => {
    const saved = await profileApi.updateTeacher(updated);
    if (saved?.school) printSettings.setSchoolName(saved.school);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7ee] font-sans selection:bg-[#6ee7b7] selection:text-slate-950">
      {isDemoMode && (
        <div className="bg-[#fef9c3] border-b-2 border-slate-900 px-4 py-2 text-center text-xs font-black text-amber-950 flex items-center justify-center gap-2 shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span>
            Mode Simulasi: berjalan dengan data contoh lokal dan tidak terhubung ke Supabase Cloud.
          </span>
        </div>
      )}

      <Navbar
        onOpenDrawer={() => setIsDrawerOpen(true)}
        classes={classes}
        activeClass={activeClass}
        onSelectClass={selectClass}
        onOpenClassManagement={openClassManagement}
      />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeClass={activeClass}
        onSwitchClass={switchToNextClass}
        onOpenClassManagement={openClassManagement}
        onRefreshData={actions.refreshData}
        onDownloadBackup={actions.downloadBackup}
        teacher={teacher}
        schoolName={schoolName}
        onLogout={onLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-12">
        <TabContent
          activeTab={activeTab}
          onNavigateTab={setActiveTab}
          workspace={workspace}
          actions={actions}
          teacher={teacher}
          schoolName={schoolName}
          printConfig={printConfig}
          onUpdateTeacher={updateTeacher}
          onUpdatePrintConfig={printSettings.updatePrintConfig}
          onLogout={onLogout}
          onSaveToCloud={saveToCloudNotice}
          onShowToast={showToast}
          onOpenClassManagement={openClassManagement}
          onOpenParentLink={openParentLink}
          onOpenWhatsApp={openWhatsApp}
        />
      </main>

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onDownloadBackup={actions.downloadBackup}
      />

      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => {
          setIsWhatsAppModalOpen(false);
          setTargetStudentWA(undefined);
        }}
        activeClass={activeClass}
        activeSession={activeSession}
        students={studentsApi.students}
        attendanceRecords={recordsApi.sessionRecords}
        targetStudent={targetStudentWA}
        teacher={teacher}
        schoolName={schoolName}
      />

      <ParentPortalModal
        isOpen={isParentPortalOpen}
        onClose={() => setIsParentPortalOpen(false)}
        activeClass={activeClass}
        students={studentsApi.students}
        attendanceRecords={recordsApi.classRecords}
        grades={workspace.gradesApi.grades}
        finances={workspace.financesApi.finances}
        teacher={teacher}
        schoolName={schoolName}
        userId={userId}
        isDemoMode={isDemoMode}
        // Portal penuh lama dinonaktifkan — hanya tautan token (?p=) yang aman
        onOpenFullPublicPortal={() => {
          setIsParentPortalOpen(false);
          showToast(
            'Portal Publik Aman',
            'Gunakan tautan token (?p=...) yang dibuat dari modal ini. Mode ?portal= sudah dinonaktifkan.'
          );
        }}
      />

      <ClassManagementModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        classes={classes}
        activeClass={activeClass}
        onSelectClass={selectClass}
        onAddClass={addClass}
        onEditClass={classesApi.editClass}
        onDeleteClass={classesApi.deleteClass}
      />

      <Footer />
    </div>
  );
}
