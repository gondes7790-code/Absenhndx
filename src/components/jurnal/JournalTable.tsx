import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { JournalEntry } from '../../types';

interface JournalTableProps {
  filteredJournals: JournalEntry[];
  onEdit: (journal: JournalEntry) => void;
  onDeleteJournal?: (id: string) => void;
}

/** Tabel utama Jurnal Mengajar. */
export const JournalTable: React.FC<JournalTableProps> = ({ filteredJournals, onEdit, onDeleteJournal }) => (
  <div className="bg-white border-2 border-slate-900 rounded-3xl shadow-[4px_4px_0px_#1e293b] overflow-hidden">
    <div className="p-4 border-b-2 border-slate-100 flex items-center justify-between bg-[#fffdf8]">
      <h3 className="text-sm sm:text-base font-black text-slate-900">
        Daftar Agenda Pembelajaran Terjadwal ({filteredJournals.length} Pertemuan)
      </h3>
      <span className="text-xs font-mono font-bold bg-[#dcfce7] border border-slate-900 px-2.5 py-0.5 rounded-full text-emerald-950 shadow-[1px_1px_0px_#1e293b]">
        EDIT MANUAL AKTIF
      </span>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-[#faf7ee] text-slate-900 font-black text-[11px] tracking-wider uppercase border-b-2 border-slate-900">
            <th className="py-3 px-3 w-10 text-center">NO</th>
            <th className="py-3 px-3 w-28">TANGGAL</th>
            <th className="py-3 px-3 min-w-[150px] max-w-[200px]">KELAS & SESI</th>
            <th className="py-3 px-3 w-28 whitespace-nowrap">JAM KBM</th>
            <th className="py-3 px-4 min-w-[280px]">MATERI & KEGIATAN TP MERDEKA</th>
            <th className="py-3 px-4 min-w-[200px]">CATATAN PRESENSI SISWA</th>
            <th className="py-3 px-3 min-w-[100px] text-center whitespace-nowrap">AKSI EDIT</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-slate-100">
          {filteredJournals.map((j, idx) => (
            <tr key={j.id} className="hover:bg-[#faf7ee]/60 transition-colors group">
              <td className="py-3 px-3 text-center text-slate-600 font-mono font-bold whitespace-nowrap">
                {idx + 1}
              </td>
              <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                {j.tanggal}
              </td>
              <td className="py-3 px-3 min-w-[150px] max-w-[200px]">
                <div className="w-full max-w-[185px] overflow-hidden">
                  <span className="font-black text-slate-900 block truncate" title={j.className}>
                    {j.className}
                  </span>
                  <span
                    className="inline-block mt-1 text-[10px] font-bold text-emerald-950 bg-[#dcfce7] px-2 py-0.5 rounded-md border border-slate-900 max-w-full truncate align-middle shadow-[0.5px_0.5px_0px_#1e293b]"
                    title={`Pertemuan Ke-${j.pertemuanKe}`}
                  >
                    Ke-{j.pertemuanKe}
                  </span>
                </div>
              </td>
              <td className="py-3 px-3 text-slate-600 font-mono font-medium">
                {j.jamPelajaran}
              </td>
              <td className="py-3 px-4 text-slate-900 font-medium leading-relaxed">
                {j.materiKegiatan}
              </td>
              <td className="py-3 px-4 text-slate-600 italic">
                {j.absensiCatatan}
              </td>
              <td className="py-3 px-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => onEdit(j)}
                    className="p-1.5 rounded-xl bg-[#e0f2fe] hover:bg-[#bae6fd] text-sky-950 border border-slate-900 shadow-[1px_1px_0px_#1e293b] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                    title="Edit Manual Agenda Mengajar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {onDeleteJournal && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus catatan agenda pertemuan Ke-${j.pertemuanKe} kelas ${j.className}?`)) {
                          onDeleteJournal(j.id);
                        }
                      }}
                      className="p-1.5 rounded-xl bg-[#fee2e2] hover:bg-[#fca5a5] text-rose-950 border border-slate-900 shadow-[1px_1px_0px_#1e293b] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                      title="Hapus Agenda"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
