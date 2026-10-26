import React from 'react';
import {
  ActiveTab,
  PrintConfig,
  Student,
  TeacherProfile,
} from '../types';
import { AttendanceView } from './AttendanceView';
import { MonthlyRecapView } from './MonthlyRecapView';
import { GradebookView } from './GradebookView';
import { StudentManagementView } from './StudentManagementView';
import { JournalView } from './JournalView';
import { FinanceView } from './FinanceView';
import { DashboardView } from './DashboardView';
import { RiskScoringView } from './RiskScoringView';
import { ProfileView } from './ProfileView';
import type { Workspace } from '../hooks/useWorkspace';
import type { useWorkspaceActions } from '../hooks/useWorkspaceActions';
import { useStudentCount } from '../hooks/useStudents';

interface TabContentProps {
  activeTab: ActiveTab;
  onNavigateTab: (tab: ActiveTab) => void;
  workspace: Workspace;
  actions: ReturnType<typeof useWorkspaceActions>;
  teacher: TeacherProfile;
  schoolName: string;
  printConfig: PrintConfig;
  onUpdateTeacher: (updated: TeacherProfile) => void;
  onUpdatePrintConfig: (config: PrintConfig) => void;
  onLogout: () => void;
  onSaveToCloud: () => void;
  onShowToast: (title: string, desc: string) => void;
  onOpenClassManagement: () => void;
  onOpenParentLink: () => void;
  onOpenWhatsApp: (target?: Student) => void;
}

const TabLoading: React.FC = () => (
  <div
    role="status"
    className="bg-[#fffdf8] rounded-3xl p-8 border-2 border-slate-900 shadow-[4px_4px_0px_#1e293b] text-center max-w-xl mx-auto my-6"
  >
    <div className="w-8 h-8 mx-auto mb-3 border-3 border-slate-900 border-t-transparent rounded-full animate-spin" />
    <p className="text-xs font-bold text-slate-600">Memuat data kelas...</p>
  </div>
);

/**
 * Memilih tampilan sesuai tab aktif dan menyalurkan data yang SUDAH dimuat lazy
 * oleh `useWorkspace`. Tidak ada logika bisnis di sini.
 */
export const TabContent: React.FC<TabContentProps> = ({
  activeTab,
  onNavigateTab,
  workspace,
  actions,
  teacher,
  schoolName,
  printConfig,
  onUpdateTeacher,
  onUpdatePrintConfig,
  onLogout,
  onSaveToCloud,
  onShowToast,
  onOpenClassManagement,
  onOpenParentLink,
  onOpenWhatsApp,
}) => {
  const {
    classes,
    activeClass,
    activeSession,
    selectSession,
    classesApi,
    studentsApi,
    sessionsApi,
    recordsApi,
    gradesApi,
    financesApi,
    journalsApi,
  } = workspace;
  const { students } = studentsApi;
  const { sessions } = sessionsApi;
  const totalStudents = useStudentCount(activeTab === 'profil');

  // Data tab dimuat lazy: tampilkan indikator muat agar tidak sempat terlihat sebagai "data kosong".
  const isTabLoading =
    workspace.isInitialLoading ||
    {
      presensi: studentsApi.isLoading || sessionsApi.isLoading || recordsApi.isSessionLoading,
      rekap: studentsApi.isLoading || sessionsApi.isLoading || recordsApi.isClassLoading,
      penilaian: studentsApi.isLoading || gradesApi.isLoading,
      murid: studentsApi.isLoading,
      jurnal: journalsApi.isLoading,
      keuangan: studentsApi.isLoading || financesApi.isLoading,
      statistik:
        studentsApi.isLoading ||
        sessionsApi.isLoading ||
        recordsApi.isClassLoading ||
        gradesApi.isLoading ||
        financesApi.isLoading,
      risiko: studentsApi.isLoading || recordsApi.isClassLoading || gradesApi.isLoading,
      profil: false,
      supabase: false,
    }[activeTab];

  if (isTabLoading) return <TabLoading />;

  switch (activeTab) {
    case 'presensi':
      return (
        <AttendanceView
          activeClass={activeClass}
          students={students}
          sessions={sessions}
          activeSession={activeSession}
          attendanceRecords={recordsApi.sessionRecords}
          onSelectSession={selectSession}
          onUpdateRecord={actions.updateAttendanceRecord}
          onSetAllHadir={actions.setAllHadir}
          onSaveToCloud={onSaveToCloud}
          onCreateNewSession={actions.createNewSession}
          onUpdateSession={actions.updateSession}
          onDeleteSession={actions.deleteSession}
          onDeleteStudent={studentsApi.deleteStudent}
          onOpenParentLink={onOpenParentLink}
          onOpenWhatsAppModal={onOpenWhatsApp}
          schoolName={schoolName}
          teacher={teacher}
          printConfig={printConfig}
          onOpenClassManagement={onOpenClassManagement}
        />
      );

    case 'rekap':
      return (
        <MonthlyRecapView
          activeClass={activeClass}
          students={students}
          sessions={sessions}
          attendanceRecords={recordsApi.classRecords}
          teacher={teacher}
          schoolName={schoolName}
          printConfig={printConfig}
          onOpenClassManagement={onOpenClassManagement}
        />
      );

    case 'penilaian':
      return (
        <GradebookView
          activeClass={activeClass}
          students={students}
          grades={gradesApi.grades}
          onUpdateGrade={gradesApi.updateGrade}
          onGenerateAllDescriptions={actions.generateAllDescriptions}
          onSaveToCloud={onSaveToCloud}
          onOpenParentLink={onOpenParentLink}
          schoolName={schoolName}
          teacher={teacher}
          onUpdateClass={classesApi.editClass}
          printConfig={printConfig}
          onOpenClassManagement={onOpenClassManagement}
        />
      );

    case 'murid':
      return (
        <StudentManagementView
          activeClass={activeClass}
          students={students}
          onAddStudent={studentsApi.addStudent}
          onEditStudent={studentsApi.editStudent}
          onDeleteStudent={studentsApi.deleteStudent}
          onSaveToCloud={onSaveToCloud}
          schoolName={schoolName}
          onAddStudentsBatch={studentsApi.importStudents}
          onOpenClassManagement={onOpenClassManagement}
        />
      );

    case 'jurnal':
      return (
        <JournalView
          journals={journalsApi.journals}
          classes={classes}
          teacher={teacher}
          onAddJournal={journalsApi.addJournal}
          onUpdateJournal={journalsApi.updateJournal}
          onDeleteJournal={journalsApi.deleteJournal}
          onSaveToCloud={onSaveToCloud}
          schoolName={schoolName}
          onSyncAttendance={actions.syncAllAttendanceToJournals}
          printConfig={printConfig}
        />
      );

    case 'keuangan':
      return (
        <FinanceView
          activeClass={activeClass}
          students={students}
          finances={financesApi.finances}
          teacher={teacher}
          schoolName={schoolName}
          printConfig={printConfig}
          onAddTransaction={financesApi.addTransaction}
          onDeleteTransaction={financesApi.deleteTransaction}
          onSaveToCloud={onSaveToCloud}
          onOpenParentLink={onOpenParentLink}
        />
      );

    case 'statistik':
      return (
        <DashboardView
          activeClass={activeClass}
          students={students}
          sessions={sessions}
          attendanceRecords={recordsApi.classRecords}
          grades={gradesApi.grades}
          finances={financesApi.finances}
          onNavigateTab={onNavigateTab}
          schoolName={schoolName}
        />
      );

    case 'risiko':
      return (
        <RiskScoringView
          activeClass={activeClass}
          students={students}
          attendanceRecords={recordsApi.classRecords}
          grades={gradesApi.grades}
          onApplyDescriptionsToGrades={actions.applyRiskDescriptions}
          onNavigateTab={onNavigateTab}
        />
      );

    case 'profil':
      return (
        <ProfileView
          teacher={teacher}
          schoolName={schoolName}
          classes={classes}
          totalStudents={totalStudents}
          activeClass={activeClass}
          onUpdateTeacher={onUpdateTeacher}
          onLogout={onLogout}
          onShowToast={onShowToast}
          printConfig={printConfig}
          onUpdatePrintConfig={onUpdatePrintConfig}
        />
      );

    default:
      return null;
  }
};
