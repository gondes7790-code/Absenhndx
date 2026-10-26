import React from 'react';
import { LogOut } from 'lucide-react';

export const LogoutCard: React.FC<{ onRequestLogout: () => void }> = ({ onRequestLogout }) => (
      <div className="bg-[#fff1f2] border-2 border-slate-900 rounded-3xl p-6 shadow-[4px_4px_0px_#1e293b]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#fee2e2] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center justify-center shrink-0">
              <LogOut className="w-6 h-6 text-rose-800" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  Sesi Pendidik Aktif
                </h3>
                <span className="bg-rose-900 text-white text-[10px] font-mono px-2 py-0.2 rounded-full font-bold">
                  LOG OUT
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-lg font-medium leading-relaxed">
                Keluar akan mengakhiri sesi login pengajar di peramban ini. Seluruh database nilai, presensi, dan jurnal tetap tersimpan aman di Cloud Supabase (PostgreSQL & RLS).
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => onRequestLogout()}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#fb7185] hover:bg-[#f43f5e] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] font-black text-white text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar Akun (Log Out)</span>
            </button>
          </div>
        </div>
      </div>
);
