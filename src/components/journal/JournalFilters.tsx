import React from 'react';
import { Search } from 'lucide-react';
import { ClassRoom } from '../../types';

interface JournalFiltersProps {
  classes: ClassRoom[];
  filterClass: string;
  onFilterClassChange: (value: string) => void;
  filterMonth: string;
  onFilterMonthChange: (value: string) => void;
  filterSemester: string;
  onFilterSemesterChange: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const JournalFilters: React.FC<JournalFiltersProps> = ({
  classes,
  filterClass,
  onFilterClassChange,
  filterMonth,
  onFilterMonthChange,
  filterSemester,
  onFilterSemesterChange,
  searchQuery,
  onSearchChange,
}) => (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 text-xs">
      <div>
        <label className="block text-[11px] font-bold text-slate-700 mb-1">
          FILTER KELAS
        </label>
        <select
          value={filterClass}
          onChange={(e) => onFilterClassChange(e.target.value)}
          className="w-full px-3 py-1.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold text-slate-900 focus:outline-none"
        >
          <option value="Semua">Semua Kelas</option>
          {classes.map((c) => (
            <option key={c.id} value={c.nama}>{c.nama}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-700 mb-1">
          BULAN KEGIATAN
        </label>
        <select
          value={filterMonth}
          onChange={(e) => onFilterMonthChange(e.target.value)}
          className="w-full px-3 py-1.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold text-slate-900 focus:outline-none"
        >
          <option value="Semua">Semua Bulan</option>
          <option value="10">Oktober 2026</option>
          <option value="09">September 2026</option>
          <option value="08">Agustus 2026</option>
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-700 mb-1">
          SEMESTER
        </label>
        <select
          value={filterSemester}
          onChange={(e) => onFilterSemesterChange(e.target.value)}
          className="w-full px-3 py-1.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold text-slate-900 focus:outline-none"
        >
          <option value="Semua">Semua Semester</option>
          <option value="2026/2027 (Ganjil)">2026/2027 (Ganjil)</option>
          <option value="2026/2027 (Genap)">2026/2027 (Genap)</option>
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-700 mb-1">
          CARI MATERI TP
        </label>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Kata kunci materi..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-slate-900 font-bold focus:outline-none"
          />
        </div>
      </div>
    </div>
);
