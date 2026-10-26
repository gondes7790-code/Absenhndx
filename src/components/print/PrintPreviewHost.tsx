import React from 'react';
import { ClassRoom, PrintConfig, TeacherProfile } from '../../types';
import { PrintableDocument, PrintableDocumentType } from '../PrintableDocument';
import { usePrintDocumentData } from '../../hooks/usePrintData';

interface PrintPreviewHostProps {
  type: PrintableDocumentType;
  cls: ClassRoom;
  teacher: TeacherProfile;
  printConfig: PrintConfig;
  onClose: () => void;
}

/**
 * Memuat data lengkap SATU kelas (lazy) lalu menampilkan dokumen cetak.
 * Komponen ini hanya dipasang ketika pratinjau dibuka, sehingga membuka tab
 * Profil tidak lagi memicu fetch seluruh data kelas.
 */
export const PrintPreviewHost: React.FC<PrintPreviewHostProps> = ({
  type,
  cls,
  teacher,
  printConfig,
  onClose,
}) => {
  const data = usePrintDocumentData(cls, true);

  return (
    <PrintableDocument
      type={type}
      isOpen
      onClose={onClose}
      activeClass={cls}
      teacher={teacher}
      schoolName={printConfig.schoolName}
      printConfig={printConfig}
      students={data.students}
      sessions={data.sessions}
      session={data.sessions[0]}
      attendanceRecords={data.attendanceRecords}
      grades={data.grades}
      journals={data.journals}
      financeTransactions={data.finances}
    />
  );
};
