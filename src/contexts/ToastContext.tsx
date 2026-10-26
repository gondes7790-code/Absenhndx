import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { setQueryErrorHandler } from '../lib/queryClient';

type ShowToast = (title: string, desc: string) => void;

interface ToastContextValue {
  showToast: ShowToast;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TOAST_DURATION_MS = 3200;

/**
 * Satu-satunya tempat notifikasi toast. Hook data (mutation/query) memakai
 * `useToast()` sehingga App.tsx tidak perlu meneruskan `showToast` ke mana-mana.
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback<ShowToast>((title, desc) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ title, desc });
    timerRef.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  // Error dari useQuery (lewat QueryCache.onError) ikut tampil sebagai toast.
  useEffect(() => {
    setQueryErrorHandler(showToast);
    return () => {
      setQueryErrorHandler(null);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [showToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#ffffff] text-slate-900 px-4 py-3 rounded-2xl shadow-[4px_4px_0px_#1e293b] border-2 border-slate-900 flex items-start gap-3 animate-in slide-in-from-top duration-200">
          <div className="p-1 rounded-xl bg-[#dcfce7] border border-slate-900 text-emerald-900 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black">{toast.title}</h4>
            <p className="text-[11px] text-slate-600 mt-0.5 font-medium">{toast.desc}</p>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
