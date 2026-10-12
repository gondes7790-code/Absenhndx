import React, { useState } from 'react';
import {
  Database,
  ShieldCheck,
  Copy,
  Check,
  Download,
  Server,
  Key,
  X,
  Code,
  Lock,
  Sparkles,
} from 'lucide-react';
import { SUPABASE_SQL_SCHEMA, getStoredSupabaseConfig, saveStoredSupabaseConfig, SupabaseConfig } from '../services/supabaseService';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadBackup: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onDownloadBackup,
}) => {
  const [config, setConfig] = useState<SupabaseConfig>(getStoredSupabaseConfig());
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'schema' | 'config'>('schema');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredSupabaseConfig(config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-3xl w-full flex flex-col max-h-[90vh] shadow-[8px_8px_0px_#1e293b] border-3 border-slate-900 overflow-hidden">
        {/* Header - Vintage Postmodern Neobrutalist */}
        <div className="p-4 sm:p-5 bg-[#faf7ee] border-b-2 border-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#dcfce7] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center justify-center shrink-0">
              <Database className="w-5 h-5 text-emerald-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base text-slate-900">
                  Supabase PostgreSQL Cloud & RLS
                </h3>
                <span className="text-[10px] bg-[#dcfce7] text-emerald-950 border border-slate-900 px-2 py-0.5 rounded-full font-mono font-bold shadow-[1px_1px_0px_#1e293b]">
                  RLS AKTIF
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                Dikembangkan oleh @hndx07 • Skema Database Relasional dengan Row Level Security
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#fee2e2] border border-slate-900 text-rose-950 hover:bg-[#fca5a5] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="bg-[#fffdf8] px-4 pt-2.5 flex items-center justify-between border-b-2 border-slate-900">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('schema')}
              className={`px-3 py-2 text-xs font-black rounded-t-xl transition-all cursor-pointer border-t-2 border-x-2 border-slate-900 ${
                activeTab === 'schema'
                  ? 'bg-white text-slate-900 shadow-[2px_-2px_0px_#1e293b]'
                  : 'bg-[#faf7ee] text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code className="w-3.5 h-3.5 inline mr-1 text-emerald-700" />
              Skema Tabel & RLS (SQL)
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`px-3 py-2 text-xs font-black rounded-t-xl transition-all cursor-pointer border-t-2 border-x-2 border-slate-900 ${
                activeTab === 'config'
                  ? 'bg-white text-slate-900 shadow-[2px_-2px_0px_#1e293b]'
                  : 'bg-[#faf7ee] text-slate-600 hover:text-slate-900'
              }`}
            >
              <Server className="w-3.5 h-3.5 inline mr-1 text-indigo-700" />
              Konfigurasi Koneksi API
            </button>
          </div>

          {activeTab === 'schema' && (
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 mb-1.5 rounded-xl bg-[#a7f3d0] hover:bg-[#6ee7b7] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-900" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Seluruh SQL'}</span>
            </button>
          )}
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-white">
          {activeTab === 'schema' ? (
            <div className="space-y-4">
              <div className="bg-[#dcfce7] border-2 border-slate-900 p-3.5 rounded-2xl flex items-start gap-3 shadow-[2px_2px_0px_#1e293b]">
                <ShieldCheck className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 leading-relaxed font-medium">
                  <strong>Keamanan Row Level Security (RLS):</strong> Setiap baris pada tabel kelas, presensi, penilaian, jurnal, dan tabungan dikunci dengan kebijakan <code className="bg-white border border-slate-900 px-1.5 py-0.2 rounded font-mono font-bold">auth.uid() = user_id</code>. Pendidik hanya bisa mengakses data kelasnya sendiri.
                </div>
              </div>

              <div className="relative">
                <pre className="bg-slate-950 text-[#6ee7b7] p-4 rounded-2xl text-[11px] font-mono leading-relaxed overflow-x-auto max-h-[50vh] border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b]">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div className="bg-[#ede9fe] border-2 border-slate-900 p-3.5 rounded-2xl flex items-start gap-3 shadow-[2px_2px_0px_#1e293b]">
                <Lock className="w-5 h-5 text-indigo-800 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-950 leading-relaxed font-medium">
                  Aplikasi telah dilengkapi adapter sinkronisasi real-time. Anda dapat menghubungkannya langsung ke URL dan Anon Key proyek Supabase milik Anda.
                </div>
              </div>

              {saveSuccess && (
                <div className="bg-[#dcfce7] border-2 border-slate-900 text-emerald-950 p-3 rounded-2xl font-bold flex items-center gap-2 shadow-[2px_2px_0px_#1e293b]">
                  <Check className="w-4 h-4 text-emerald-800" />
                  <span>Konfigurasi Supabase berhasil disimpan!</span>
                </div>
              )}

              <div>
                <label className="block font-black text-slate-800 mb-1.5">
                  SUPABASE PROJECT URL
                </label>
                <input
                  type="text"
                  value={config.url}
                  onChange={(e) => setConfig({ ...config, url: e.target.value })}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-mono font-bold text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-black text-slate-800 mb-1.5">
                  SUPABASE ANON PUBLIC API KEY
                </label>
                <input
                  type="password"
                  value={config.anonKey}
                  onChange={(e) => setConfig({ ...config, anonKey: e.target.value })}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-mono font-bold text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">
                  Status: Terhubung via RLS Adapter PostgreSQL
                </span>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-[#a7f3d0] hover:bg-[#6ee7b7] border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] font-black text-slate-950 cursor-pointer"
                >
                  Simpan Kredensial
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#faf7ee] border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-600 font-medium">
            Dikembangkan oleh <strong>@hndx07</strong> • Mendukung PostgreSQL 15+
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onDownloadBackup}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-xs font-bold text-slate-900 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Backup JSON</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-[#fee2e2] hover:bg-[#fca5a5] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-xs font-black text-rose-950 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
