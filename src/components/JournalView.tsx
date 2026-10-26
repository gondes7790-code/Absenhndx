import React, { useState, useMemo } from 'react';
import { JournalEntry, ClassRoom, TeacherProfile, PrintConfig } from '../types';
import { PrintableDocument } from './PrintableDocument';
import { JournalHeaderCard } from './journal/JournalHeaderCard';
import { JournalSummaryCards } from './journal/JournalSummaryCards';
import { JournalFilters } from './journal/JournalFilters';
import { JournalTable } from './journal/JournalTable';
import { NewJournalModal } from './journal/NewJournalModal';
import { EditJournalModal } from './journal/EditJournalModal';
import { exportJournalsCsv } from './journal/journalExport';

interface JournalViewProps {
  journals: JournalEntry[];
  classes: ClassRoom[];
  teacher: TeacherProfile;
  onAddJournal: (entry: Omit<JournalEntry, 'id'>) => void;
  onUpdateJournal?: (entry: JournalEntry) => void;
  onDeleteJournal?: (id: string) => void;
  onSaveToCloud: () => void;
  schoolName: string;
  onSyncAttendance?: () => void;
  printConfig?: PrintConfig;
}

export const JournalView: React.FC<JournalViewProps> = ({
  journals,
  classes,
  teacher,
  onAddJournal,
  onUpdateJournal,
  onDeleteJournal,
  onSaveToCloud,
  schoolName,
  onSyncAttendance,
  printConfig,
}) => {
  const [filterClass, setFilterClass] = useState('Semua');
  const [filterMonth, setFilterMonth] = useState('Semua');
  const [filterSemester, setFilterSemester] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState<JournalEntry | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Filtered journals
  const filteredJournals = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return journals.filter((j) => {
      const matchClass = filterClass === 'Semua' || j.className === filterClass;
      const matchSemester = filterSemester === 'Semua' || j.semester === filterSemester;
      const matchSearch =
        searchQuery.trim() === '' ||
        j.materiKegiatan.toLowerCase().includes(q) ||
        j.className.toLowerCase().includes(q) ||
        String(j.pertemuanKe).toLowerCase().includes(q) ||
        `ke-${j.pertemuanKe}`.toLowerCase().includes(q);

      return matchClass && matchSemester && matchSearch;
    });
  }, [journals, filterClass, filterSemester, searchQuery]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <JournalHeaderCard
        schoolName={schoolName}
        filterClass={filterClass}
        onSaveToCloud={onSaveToCloud}
        onSyncAttendance={onSyncAttendance}
        onCreate={() => setIsModalOpen(true)}
        onExportCsv={() => exportJournalsCsv(filteredJournals, teacher.handle)}
        onPrint={() => setShowPrintModal(true)}
      >
        <JournalSummaryCards filteredJournals={filteredJournals} classes={classes} />
        <JournalFilters
          classes={classes}
          filterClass={filterClass}
          onFilterClassChange={setFilterClass}
          filterMonth={filterMonth}
          onFilterMonthChange={setFilterMonth}
          filterSemester={filterSemester}
          onFilterSemesterChange={setFilterSemester}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </JournalHeaderCard>

      {/* Main Table: Jurnal Mengajar */}
      <JournalTable
        filteredJournals={filteredJournals}
        onEdit={setEditingJournal}
        onDeleteJournal={onDeleteJournal}
      />

      {isModalOpen && (
        <NewJournalModal
          classes={classes}
          teacher={teacher}
          onClose={() => setIsModalOpen(false)}
          onAddJournal={onAddJournal}
        />
      )}

      {editingJournal && (
        <EditJournalModal
          journal={editingJournal}
          classes={classes}
          onClose={() => setEditingJournal(null)}
          onUpdateJournal={onUpdateJournal}
          onDeleteJournal={onDeleteJournal}
        />
      )}

      {/* Formal Printable Document */}
      <PrintableDocument
        type="journal"
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        activeClass={classes[0]}
        teacher={teacher}
        schoolName={schoolName}
        printConfig={printConfig}
        journals={filteredJournals}
      />
    </div>
  );
};
