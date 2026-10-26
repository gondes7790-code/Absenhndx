import React from 'react';
import { AlertTriangle, LogOut, ShieldCheck } from 'lucide-react';
import { TeacherProfile } from '../../types';

interface LogoutConfirmModalProps {
  teacher: TeacherProfile;
  onCancel: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  teacher,
  onCancel,
  onConfirm,
}) => (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="w-full max-w-md bg-white border-3 border-slate-900 rounded-3xl p-6 shadow-[6px_6px_0px_#1e293b] relative animate-in zoom-in-95 duration-200">
          {/* Header tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fef9c3] border-2 border-slate-900 text-[10px] font-mono font-bold text-slate-900 shadow-[1.5px_1.5px_0px_#1e293b] mb-4">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>KONFIRMASI LOG OUT</span>
          </div>

          <h3 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
            Yakin Ingin Keluar dari Sesi Pendidik?
          </h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Anda akan diarahkan kembali ke halaman masuk (Login). Anda dapat masuk kembali kapan saja menggunakan email <strong>{teacher.email}</strong>.
          </p>

          <div className="mt-5 p-3 rounded-2xl bg-[#faf7ee] border-2 border-slate-900 text-xs text-slate-700 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Semua data presensi dan nilai tersimpan di Supabase Cloud.</span>
          </div>

          {/* Modal Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-2xl bg-[#f1f5f9] hover:bg-[#e2e8f0] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-xs font-bold text-slate-800 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-5 py-2.5 rounded-2xl bg-[#f43f5e] hover:bg-[#e11d48] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] text-xs font-black text-white flex items-center gap-2 cursor-pointer transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Ya, Keluar Akun</span>
            </button>
          </div>
        </div>
      </div>
);
