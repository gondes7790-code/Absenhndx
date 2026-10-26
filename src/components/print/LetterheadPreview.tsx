import React from 'react';
import { PrintConfig, TeacherProfile } from '../../types';
import { svgToDataUrl, parseLogoEmbed, TUT_WURI_LOGO_SVG } from '../../utils/printConfig';

interface LetterheadPreviewProps {
  formData: PrintConfig;
  parsedLogo: ReturnType<typeof parseLogoEmbed>;
  teacher: TeacherProfile;
}

/** Pratinjau kop surat resmi & tanda tangan (hanya tampilan, tidak mengubah data). */
export const LetterheadPreview: React.FC<LetterheadPreviewProps> = ({ formData, parsedLogo, teacher }) => (
    <div className="mt-6 p-4 sm:p-6 rounded-2xl bg-[#ffffff] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <span>👁️ Pratinjau Kop Surat Resmi & Tanda Tangan:</span>
        </span>
        <span className="text-[10px] font-mono text-slate-500">
          {formData.borderStyle.toUpperCase()} BORDER • A4 READY
        </span>
      </div>

      {/* Scaled-down letterhead preview sheet */}
      <div className="bg-white border border-slate-300 p-4 sm:p-6 rounded font-serif text-black text-center shadow-xs">
        <div
          className={`pb-3 mb-3 text-center ${
            formData.borderStyle === 'solid'
              ? 'border-b-2 border-black'
              : formData.borderStyle === 'thick'
              ? 'border-b-4 border-black'
              : 'border-b-4 border-double border-black'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            {/* Left Logo Slot */}
            <div className="w-14 h-14 shrink-0 flex items-center justify-center">
              {formData.logoPosition === 'left' ? (
                parsedLogo.type === 'svg' ? (
                  <img
                    src={svgToDataUrl(parsedLogo.content)}
                    alt="Logo Sekolah"
                    className="w-12 h-12 object-contain"
                  />
                ) : parsedLogo.type === 'img' && parsedLogo.content ? (
                  <img
                    src={parsedLogo.content}
                    alt="Logo Sekolah"
                    className="max-w-[48px] max-h-[48px] object-contain"
                  />
                ) : (
                  <img
                    src={TUT_WURI_LOGO_SVG}
                    alt="Logo Tut Wuri"
                    className="max-w-[44px] max-h-[44px] object-contain"
                  />
                )
              ) : formData.showTutWuriLogo ? (
                <img
                  src={TUT_WURI_LOGO_SVG}
                  alt="Tut Wuri"
                  className="max-w-[48px] max-h-[48px] object-contain"
                />
              ) : (
                <div className="w-4 shrink-0" />
              )}
            </div>

            {/* Text */}
            <div className="flex-1 text-center px-2">
              <h3 className="text-[11px] sm:text-xs font-bold tracking-wider uppercase leading-tight font-serif text-black">
                {formData.dinasHeader}
              </h3>
              {formData.dinasSubHeader ? (
                <h4 className="text-[10px] font-bold tracking-wide uppercase leading-tight font-serif text-black mt-0.5">
                  {formData.dinasSubHeader}
                </h4>
              ) : null}
              <h1 className="text-sm sm:text-lg font-black tracking-wide uppercase leading-tight font-serif text-black mt-0.5">
                {formData.schoolName}
              </h1>
              {formData.unitSubHeader ? (
                <p className="text-[9px] font-bold tracking-wide uppercase leading-tight font-serif text-black mt-0.5">
                  {formData.unitSubHeader}
                </p>
              ) : null}
              <p className="text-[9px] text-black font-normal leading-tight font-serif mt-0.5">
                {formData.address}
              </p>
              <p className="text-[8.5px] text-black font-normal leading-tight font-serif">
                {formData.phone} • {formData.emailWeb}
              </p>
            </div>

            {/* Right Logo Slot */}
            <div className="w-14 h-14 shrink-0 flex items-center justify-center">
              {formData.logoPosition === 'right' || formData.logoPosition === 'both' ? (
                parsedLogo.type === 'svg' ? (
                  <img
                    src={svgToDataUrl(parsedLogo.content)}
                    alt="Logo Sekolah"
                    className="w-12 h-12 object-contain"
                  />
                ) : parsedLogo.type === 'img' && parsedLogo.content ? (
                  <img
                    src={parsedLogo.content}
                    alt="Logo Sekolah"
                    className="max-w-[48px] max-h-[48px] object-contain"
                  />
                ) : (
                  <img
                    src={TUT_WURI_LOGO_SVG}
                    alt="Logo Tut Wuri"
                    className="max-w-[44px] max-h-[44px] object-contain"
                  />
                )
              ) : formData.logoPosition === 'left' && formData.showTutWuriLogo ? (
                <img
                  src={TUT_WURI_LOGO_SVG}
                  alt="Logo Tut Wuri"
                  className="max-w-[44px] max-h-[44px] object-contain"
                />
              ) : (
                <div className="w-4 shrink-0" />
              )}
            </div>
          </div>
        </div>

        {/* Quick Mock Signatures */}
        <div className="grid grid-cols-2 gap-4 text-[10px] text-center pt-2">
          <div>
            <p className="font-semibold">Mengetahui,</p>
            <p className="font-bold">Kepala Sekolah {formData.schoolName}</p>
            <div className="h-6" />
            <p className="font-bold underline uppercase">{formData.principalName}</p>
            <p className="text-[9px] font-mono">NIP. {formData.principalNip}</p>
          </div>
          <div>
            <p className="font-semibold">
              {formData.documentCity},{' '}
              {formData.customDateText ||
                new Date().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
            </p>
            <p className="font-bold">Guru Mata Pelajaran</p>
            <div className="h-6" />
            <p className="font-bold underline uppercase">{teacher.name}</p>
            <p className="text-[9px] font-mono">NIP. {teacher.nip}</p>
          </div>
        </div>
      </div>
    </div>
);
