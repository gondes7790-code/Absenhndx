import React, { useMemo, useState } from 'react';
import {
  ClassRoom,
  JournalEntry,
  PrintConfig,
  TeacherProfile,
} from '../types';
import { JournalHeaderCard } from './journal/JournalHeaderCard';
import { JournalSummaryCards } from './journal/JournalSummaryCard';
import { JournalFilters } from './journal/JournalFilters';
import { JournalTable } from './journal/JournalTable';
import { NewJournalModal } from './journal/NewJournalModal';
import { EditJournalModal } from './journal/EditJournalModal';
import { exportJournalsCsv } from './journal/jounalExport';
import { PrintableDocument } from './PrintableDocument';

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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState<JournalEntry | null>(null);
  const [showPrint, setShowPrint] = useState(false);

  const filteredJournals = useMemo(() => {
    return (journals || [])
      .filter((j) => {
        if (filterClass !== 'Semua' && j.className !== filterClass) return false;
        if (filterSemester !== 'Semua' && j.semester !== filterSemester) return false;
        if (filterMonth !== 'Semua') {
          const m = (j.tanggal || '').split('-')[1];
          if (m !== filterMonth) return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const hay = `${j.materiKegiatan || ''} ${j.mapel || ''} ${j.className || ''}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const d = (b.tanggal || '').localeCompare(a.tanggal || '');
        if (d !== 0) return d;
        return Number(b.pertemuanKe) - Number(a.pertemuanKe);
      });
  }, [journals, filterClass, filterMonth, filterSemester, searchQuery]);

  const handleExportCsv = () => {
    exportJournalsCsv(filteredJournals, teacher?.name || teacher?.handle || 'guru');
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      <JournalHeaderCard
        schoolName={schoolName}
        filterClass={filterClass}
        onSaveToCloud={onSaveToCloud}
        onSyncAttendance={onSyncAttendance}
        onCreate={() => setIsCreateOpen(true)}
        onExportCsv={handleExportCsv}
        onPrint={() => setShowPrint(true)}
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

      <JournalTable
        filteredJournals={filteredJournals}
        onEdit={(j) => setEditingJournal(j)}
        onDeleteJournal={onDeleteJournal}
      />

      {isCreateOpen && (
        <NewJournalModal
          classes={classes}
          teacher={teacher}
          onClose={() => setIsCreateOpen(false)}
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

      {showPrint && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_#1e293b] max-w-4xl w-full max-h-[90vh] overflow-auto relative">
            <button
              type="button"
              onClick={() => setShowPrint(false)}
              className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-xl bg-slate-100 border-2 border-slate-900 text-xs font-black"
            >
              Tutup
            </button>
            <PrintableDocument
              type="jurnal"
              journals={filteredJournals}
              teacher={teacher}
              printConfig={printConfig}
              schoolName={schoolName}
            />
          </div>
        </div>
      )}
    </div>
  );
};
