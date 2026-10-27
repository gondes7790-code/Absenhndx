import React from 'react';
import { BookOpen, Database, GraduationCap, Users, Flame } from 'lucide-react';
import { ClassRoom, TeacherProfile } from '../../types';
import { summarizeFase } from '../../utils/fase';

interface ProfileSummaryColumnProps {
  teacher: TeacherProfile;
  classes: ClassRoom[];
  totalStudents: number;
}

/** Kartu identitas pendidik, metrik singkat, dan kredit pengembang. */
export const ProfileSummaryColumn: React.FC<ProfileSummaryColumnProps> = ({
  teacher,
  classes,
  totalStudents,
}) => (
  <>
      {/* Postmodern Identity ID Card */}
      <div className="bg-[#ffffff] border-2 border-slate-900 rounded-3xl p-6 shadow-[4px_4px_0px_#1e293b] relative">
        <div className="flex flex-col items-center text-center">
          {/* Eclectic Rounded Avatar Badge */}
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-3xl bg-[#dcfce7] border-3 border-slate-900 shadow-[4px_4px_0px_#1e293b] flex items-center justify-center text-3xl font-black text-emerald-950">
              {teacher.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#fef9c3] border-2 border-slate-900 p-1.5 rounded-xl shadow-[2px_2px_0px_#1e293b]">
              <GraduationCap className="w-4 h-4 text-amber-900" />
            </div>
          </div>

          {/* Name & Official Titles */}
          <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
            {teacher.name}
          </h2>
          <p className="text-xs font-bold text-emerald-800 bg-[#dcfce7] border border-slate-900 px-3 py-0.5 rounded-full mt-1.5 shadow-[1.5px_1.5px_0px_#1e293b]">
            {teacher.jabatan || 'Guru Produktif Kejuruan'}
          </p>
          <p className="text-xs text-slate-600 mt-2 font-mono">
            {teacher.email}
          </p>

          {/* Badges strip */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
            <span className="text-[10px] font-bold font-mono bg-[#ede9fe] text-indigo-950 border border-slate-900 px-2 py-0.5 rounded-lg shadow-[1px_1px_0px_#1e293b]">
              NIP: {teacher.nip}
            </span>
            {teacher.nuptk && (
              <span className="text-[10px] font-bold font-mono bg-[#e0f2fe] text-sky-950 border border-slate-900 px-2 py-0.5 rounded-lg shadow-[1px_1px_0px_#1e293b]">
                NUPTK: {teacher.nuptk}
              </span>
            )}
          </div>

          {/* Bio snippet */}
          <div className="mt-4 p-3 bg-[#faf7ee] border-2 border-slate-900 rounded-2xl text-left shadow-[2px_2px_0px_#1e293b] w-full">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
              Catatan Pendidik / Visi:
            </span>
            <p className="text-xs text-slate-700 italic leading-relaxed">
              "{teacher.bio || 'Mendidik dengan hati, mengajar dengan bukti, menginspirasi dengan inovasi Kurikulum Merdeka.'}"
            </p>
          </div>
        </div>

        {/* Verification and Status Pill */}
        <div className="mt-5 pt-4 border-t-2 border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-900 animate-pulse" />
            <span className="font-bold text-slate-800">Status Akun:</span>
          </div>
          <span className="bg-[#bbf7d0] border border-slate-900 px-2.5 py-0.5 rounded-full font-black text-emerald-950 text-[11px] shadow-[1px_1px_0px_#1e293b]">
            Pendidik Aktif
          </span>
        </div>
      </div>

      {/* Quick Metrics in Pastel Neobrutalist Cards */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Metric 1: Rombel */}
        <div className="bg-[#fef9c3] border-2 border-slate-900 rounded-2xl p-3.5 shadow-[3px_3px_0px_#1e293b]">
          <div className="flex items-center justify-between mb-1.5">
            <BookOpen className="w-4 h-4 text-amber-800" />
            <span className="text-[10px] font-mono font-bold bg-white border border-slate-900 px-1.5 py-0.2 rounded-md">
              ROMBEL
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{classes.length} Kelas</div>
          <p className="text-[11px] font-medium text-amber-900 mt-0.5">Rombongan Belajar Diampu</p>
        </div>

        {/* Metric 2: Murid */}
        <div className="bg-[#e0f2fe] border-2 border-slate-900 rounded-2xl p-3.5 shadow-[3px_3px_0px_#1e293b]">
          <div className="flex items-center justify-between mb-1.5">
            <Users className="w-4 h-4 text-sky-800" />
            <span className="text-[10px] font-mono font-bold bg-white border border-slate-900 px-1.5 py-0.2 rounded-md">
              MURID
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalStudents} Siswa</div>
          <p className="text-[11px] font-medium text-sky-900 mt-0.5">Terdaftar Dalam Database</p>
        </div>

        {/* Metric 3: Kurikulum */}
        <div className="bg-[#ede9fe] border-2 border-slate-900 rounded-2xl p-3.5 shadow-[3px_3px_0px_#1e293b]">
          <div className="flex items-center justify-between mb-1.5">
            <Flame className="w-4 h-4 text-indigo-800" />
            <span className="text-[10px] font-mono font-bold bg-white border border-slate-900 px-1.5 py-0.2 rounded-md">
              {summarizeFase(classes.map((c) => c.tingkat))}
            </span>
          </div>
          <div className="text-xl font-black text-slate-900">Merdeka</div>
          <p className="text-[11px] font-medium text-indigo-900 mt-0.5">Asesmen Formatif & TP</p>
        </div>

        {/* Metric 4: Supabase RLS */}
        <div className="bg-[#dcfce7] border-2 border-slate-900 rounded-2xl p-3.5 shadow-[3px_3px_0px_#1e293b]">
          <div className="flex items-center justify-between mb-1.5">
            <Database className="w-4 h-4 text-emerald-800" />
            <span className="text-[10px] font-mono font-bold bg-white border border-slate-900 px-1.5 py-0.2 rounded-md">
              POSTGRES
            </span>
          </div>
          <div className="text-xl font-black text-emerald-950">RLS Aktif</div>
          <p className="text-[11px] font-medium text-emerald-900 mt-0.5">Row Level Security Cloud</p>
        </div>
      </div>

      {/* Developer Credit Postmodern Card */}
      <div className="bg-[#faf7ee] border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_#1e293b]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-mono font-black text-sm shrink-0">
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">
              Pengembang Aplikasi Sistem:
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="bg-slate-900 text-[#6ee7b7] text-xs font-mono font-black px-2 py-0.5 rounded-lg">
                {teacher.handle}
              </span>
              <span className="text-[11px] text-slate-600 font-medium">
                Kurikulum Merdeka 2026/2027
              </span>
            </div>
          </div>
        </div>
      </div>
  </>
);
