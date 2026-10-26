import React from 'react';

export const AuthLoadingScreen: React.FC<{ title?: string; subtitle?: string }> = ({
  title = 'Memeriksa Sesi Masuk...',
  subtitle = 'Menghubungkan ke Supabase Cloud',
}) => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-[#faf7ee]">
    <div className="bg-white border-3 border-slate-900 rounded-3xl p-8 shadow-[6px_6px_0px_#1e293b] flex flex-col items-center gap-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#6ee7b7] border-2 border-slate-900 flex items-center justify-center shadow-[2px_2px_0px_#1e293b]">
        <div className="w-6 h-6 border-3 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
      <div>
        <h3 className="font-black text-slate-900 text-sm">{title}</h3>
        <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>
      </div>
    </div>
  </div>
);
