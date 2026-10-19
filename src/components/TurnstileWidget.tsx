import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

/**
 * Widget Cloudflare Turnstile (mode explicit render).
 *
 * Alur singkat:
 *  1. Skrip api.js dimuat sekali dari challenges.cloudflare.com.
 *  2. Widget dirender dengan SITE KEY (kunci publik, aman di frontend).
 *  3. Setelah lolos tantangan, Cloudflare mengirim TOKEN lewat callback.
 *  4. Token dikirim ke Supabase Auth sebagai `captchaToken`; Supabase yang
 *     memverifikasi ke Cloudflare memakai SECRET KEY (tersimpan di dashboard
 *     Supabase, tidak pernah ada di kode ini).
 *
 * Token bersifat sekali pakai dan kedaluwarsa ±300 detik, jadi widget harus
 * di-reset setiap kali token dipakai (berhasil maupun gagal).
 */

interface TurnstileRenderOptions {
  sitekey: string;
  action?: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'flexible' | 'compact';
  callback?: (token: string) => void;
  'expired-callback'?: () => void;
  'timeout-callback'?: () => void;
  'error-callback'?: (errorCode?: string) => void;
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no-window'));
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      script.remove();
      reject(new Error('turnstile-script-failed'));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export interface TurnstileHandle {
  /** Minta tantangan baru (wajib dipanggil setelah token dipakai). */
  reset: () => void;
}

interface TurnstileWidgetProps {
  siteKey: string;
  action?: string;
  /** Dipanggil dengan token saat lolos, dan `null` saat token hilang/kedaluwarsa/error. */
  onToken: (token: string | null) => void;
  /** Dipanggil bila widget gagal dimuat atau mengalami error. */
  onError?: (message: string) => void;
}

export const TurnstileWidget = forwardRef<TurnstileHandle, TurnstileWidgetProps>(
  ({ siteKey, action = 'login', onToken, onError }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const onTokenRef = useRef(onToken);
    const onErrorRef = useRef(onError);

    useEffect(() => {
      onTokenRef.current = onToken;
      onErrorRef.current = onError;
    }, [onToken, onError]);

    useImperativeHandle(ref, () => ({
      reset: () => {
        onTokenRef.current(null);
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.reset(widgetIdRef.current);
          } catch {
            // widget sudah dilepas; abaikan
          }
        }
      },
    }));

    useEffect(() => {
      let cancelled = false;

      loadTurnstileScript()
        .then(() => {
          if (cancelled || !containerRef.current || !window.turnstile) return;
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            action,
            theme: 'light',
            size: 'flexible',
            callback: (token) => onTokenRef.current(token),
            'expired-callback': () => onTokenRef.current(null),
            'timeout-callback': () => onTokenRef.current(null),
            'error-callback': (code) => {
              onTokenRef.current(null);
              onErrorRef.current?.(
                `Verifikasi keamanan gagal${code ? ` (kode ${code})` : ''}. Muat ulang halaman lalu coba lagi.`
              );
            },
          });
        })
        .catch(() => {
          if (!cancelled) {
            onTokenRef.current(null);
            onErrorRef.current?.(
              'Verifikasi keamanan tidak dapat dimuat. Periksa koneksi internet atau pemblokir iklan, lalu muat ulang halaman.'
            );
          }
        });

      return () => {
        cancelled = true;
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // abaikan
          }
        }
        widgetIdRef.current = null;
      };
    }, [siteKey, action]);

    return <div ref={containerRef} className="w-full min-h-[65px]" />;
  }
);

TurnstileWidget.displayName = 'TurnstileWidget';
