import React from 'react';
import { CheckCircle2, Save, User } from 'lucide-react';
import { TeacherProfile } from '../../types';

interface ProfileEditFormProps {
  formData: TeacherProfile;
  isSaved: boolean;
  onChange: (field: keyof TeacherProfile, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

/** Formulir data kepegawaian pendidik (terkontrol; state dipegang ProfileView). */
export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  formData,
  isSaved,
  onChange: handleInputChange,
  onSubmit,
  onReset,
}) => (
      <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 shadow-[4px_4px_0px_#1e293b]">
        <div className="flex items-center justify-between pb-4 border-b-2 border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ede9fe] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-900" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Informasi Biodata Pendidik
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Perbarui informasi nama, NIP, kontak, dan instansi Anda
              </p>
            </div>
          </div>

          {isSaved && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#dcfce7] border-2 border-slate-900 text-xs font-bold text-emerald-950 animate-bounce">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Tersimpan!</span>
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nama Pendidik */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                Nama Lengkap & Gelar *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488] transition-all"
              />
            </div>

            {/* Email Akun Belajar */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                Alamat Email (Akun Belajar) *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488] transition-all"
              />
            </div>

            {/* NIP */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                NIP (Nomor Induk Pegawai)
              </label>
              <input
                type="text"
                value={formData.nip}
                onChange={(e) => handleInputChange('nip', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488] transition-all"
              />
            </div>

            {/* NUPTK */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                NUPTK
              </label>
              <input
                type="text"
                value={formData.nuptk || ''}
                onChange={(e) => handleInputChange('nuptk', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488] transition-all"
              />
            </div>

            {/* Satuan Pendidikan */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                Satuan Pendidikan (Sekolah) *
              </label>
              <input
                type="text"
                required
                value={formData.school}
                onChange={(e) => handleInputChange('school', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488] transition-all"
              />
            </div>

            {/* Mata Pelajaran Utama */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                Mata Pelajaran Utama / Kejuruan
              </label>
              <input
                type="text"
                value={formData.mapelUtama || ''}
                onChange={(e) => handleInputChange('mapelUtama', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488] transition-all"
              />
            </div>

            {/* Nomor Telepon / WhatsApp */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                No. WhatsApp Pendidik
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488] transition-all"
              />
            </div>

            {/* Status Kepegawaian */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                Jabatan / Status Kepegawaian
              </label>
              <input
                type="text"
                value={formData.jabatan || 'Guru Produktif Kejuruan'}
                onChange={(e) => handleInputChange('jabatan', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488] transition-all"
              />
            </div>
          </div>

          {/* Bio / Deskripsi Pendidik */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1.5">
              Bio Singkat / Visi Pembelajaran Merdeka
            </label>
            <textarea
              rows={3}
              value={formData.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#0d9488] transition-all resize-none"
              placeholder="Tuliskan komitmen atau orientasi capaian pembelajaran Anda..."
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onReset()}
              className="px-4 py-2.5 rounded-2xl bg-[#f1f5f9] hover:bg-[#e2e8f0] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-xs font-bold text-slate-700 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            >
              Reset Form
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-[#a7f3d0] hover:bg-[#6ee7b7] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] text-xs font-black text-slate-950 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4 text-emerald-900" />
              <span>Simpan Perubahan Profil</span>
            </button>
          </div>
        </form>
      </div>
);
