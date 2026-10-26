import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Trash2 } from 'lucide-react';
import { AttendanceStatus, Student } from '../../types';

const KETERANGAN_DEBOUNCE_MS = 500;

interface StudentAttendanceRowProps {
  student: Student;
  displayNo: number;
  status: AttendanceStatus | '';
  keterangan: string;
  onUpdateRecord: (studentId: string, status: AttendanceStatus, keterangan?: string) => void;
  onOpenWhatsAppModal: (student?: Student) => void;
  onDeleteStudent?: (studentId: string) => void;
}

/**
 * Satu baris presensi murid. Dibungkus React.memo: mengetuk status satu murid
 * tidak lagi merender ulang seluruh tabel. Catatan keterangan di-debounce agar
 * tiap ketikan tidak memicu penulisan ke database.
 */
export const StudentAttendanceRow = React.memo(function StudentAttendanceRow({
  student,
  displayNo,
  status: currentStatus,
  keterangan,
  onUpdateRecord,
  onOpenWhatsAppModal,
  onDeleteStudent,
}: StudentAttendanceRowProps) {
  const [currentKet, setCurrentKet] = useState(keterangan);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const live = useRef({ status: currentStatus, ket: keterangan, onUpdateRecord, id: student.id });
  live.current.status = currentStatus;
  live.current.onUpdateRecord = onUpdateRecord;
  live.current.id = student.id;

  // Sinkronkan dari data hanya bila tidak ada ketikan yang menunggu disimpan.
  useEffect(() => {
    if (timerRef.current === null) {
      setCurrentKet(keterangan);
      live.current.ket = keterangan;
    }
  }, [keterangan]);

  const commit = () => {
    const { status, ket, id, onUpdateRecord: update } = live.current;
    if (status) update(id, status, ket);
  };

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const pickStatus = (next: AttendanceStatus) => {
    clearTimer();
    live.current.onUpdateRecord(live.current.id, next, live.current.ket);
  };

  const handleKetChange = (value: string) => {
    if (!live.current.status) return; // keterangan hanya berlaku setelah status dipilih
    setCurrentKet(value);
    live.current.ket = value;
    clearTimer();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      commit();
    }, KETERANGAN_DEBOUNCE_MS);
  };

  const flushKet = () => {
    if (timerRef.current !== null) {
      clearTimer();
      commit();
    }
  };

  // Simpan ketikan yang tertunda bila baris dilepas (mis. pindah tab).
  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        clearTimer();
        commit();
      }
    },
    []
  );

  return (
        <tr key={student.id} className="hover:bg-[#faf7ee]/60 transition-colors group">
          <td className="py-3 px-3 text-center text-slate-600 font-mono font-bold whitespace-nowrap">
            {displayNo}
          </td>
          <td className="py-3 px-4 min-w-[180px]">
            <div className="font-black text-slate-900 group-hover:text-emerald-800 transition-colors flex items-center gap-1.5 flex-wrap">
              <span className="break-words">{student.nama}</span>
              {currentStatus === '' && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                  Kosong
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 font-mono font-medium">
              NISN: {student.nisn}
            </div>
          </td>
          <td className="py-3 px-2 text-center whitespace-nowrap">
            <span className="inline-block w-6 h-6 rounded-xl bg-[#faf7ee] text-slate-900 font-black text-xs leading-6 text-center border-2 border-slate-900 shadow-[1px_1px_0px_#1e293b]">
              {student.gender}
            </span>
          </td>
          <td className="py-3 px-3 text-center whitespace-nowrap min-w-[230px]">
            {/* H S I A D Toggle Buttons */}
            <div className="inline-flex items-center justify-center gap-1 p-1 bg-[#faf7ee] rounded-xl border border-slate-900 shadow-[1px_1px_0px_#1e293b] whitespace-nowrap">
              {/* H */}
              <button
                onClick={() => pickStatus('H')}
                className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg text-xs font-black transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                  currentStatus === 'H'
                    ? 'bg-[#6ee7b7] text-slate-950 border border-slate-900 shadow-[1px_1px_0px_#1e293b]'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
                title="Hadir"
              >
                H
              </button>

              {/* S */}
              <button
                onClick={() => pickStatus('S')}
                className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg text-xs font-black transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                  currentStatus === 'S'
                    ? 'bg-[#fde047] text-amber-950 border border-slate-900 shadow-[1px_1px_0px_#1e293b]'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
                title="Sakit"
              >
                S
              </button>

              {/* I */}
              <button
                onClick={() => pickStatus('I')}
                className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg text-xs font-black transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                  currentStatus === 'I'
                    ? 'bg-[#fdba74] text-orange-950 border border-slate-900 shadow-[1px_1px_0px_#1e293b]'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
                title="Izin"
              >
                I
              </button>

              {/* A */}
              <button
                onClick={() => pickStatus('A')}
                className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg text-xs font-black transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                  currentStatus === 'A'
                    ? 'bg-[#f87171] text-white border border-slate-900 shadow-[1px_1px_0px_#1e293b]'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
                title="Alfa (Tanpa Keterangan)"
              >
                A
              </button>

              {/* D */}
              <button
                onClick={() => pickStatus('D')}
                className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg text-xs font-black transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                  currentStatus === 'D'
                    ? 'bg-[#c084fc] text-white border border-slate-900 shadow-[1px_1px_0px_#1e293b]'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
                title="Dispensasi"
              >
                D
              </button>
            </div>
          </td>
          <td className="py-3 px-3 min-w-[180px] max-w-[250px]">
            <div className="w-full">
              <input
                type="text"
                placeholder="Catatan izin/keterangan..."
                value={currentKet}
                onChange={(e) => handleKetChange(e.target.value)}
                onBlur={flushKet}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-900 bg-[#faf7ee] text-slate-900 font-bold focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </td>
          <td className="py-3 px-3 text-center whitespace-nowrap min-w-[135px]">
            <div className="flex items-center justify-center gap-1.5">
              <button
                onClick={() => onOpenWhatsAppModal(student)}
                className="px-2.5 py-1.5 rounded-xl bg-[#dcfce7] hover:bg-[#bbf7d0] text-emerald-950 border border-slate-900 shadow-[1px_1px_0px_#1e293b] text-xs font-black flex items-center gap-1 transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
                title="Kirim pesan WA ke Wali Murid"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WA</span>
              </button>
              {onDeleteStudent && (
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        `Hapus murid "${student.nama}" (Nomor Absen ${displayNo}) dari kelas? Nomor absen setelahnya akan otomatis diganti berurutan (misalnya nomor 17 menjadi 16).`
                      )
                    ) {
                      onDeleteStudent(student.id);
                    }
                  }}
                  className="p-1.5 rounded-xl bg-[#fee2e2] hover:bg-[#fca5a5] text-rose-950 border border-slate-900 shadow-[1px_1px_0px_#1e293b] transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
                  title="Hapus Siswa (Nomor Absen Otomatis Diganti)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </td>
        </tr>
  );
});
