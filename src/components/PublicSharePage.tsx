import { useEffect, useState } from 'react';
import { fetchPublicShare, PublicShareData, TOKEN_PATTERN } from '../services/publicShareService';

type LoadState =
  | { status: 'loading' }
  | { status: 'invalid' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: PublicShareData };

const STATUS_META: Record<string, { label: string; bg: string }> = {
  H: { label: 'Hadir', bg: 'bg-[#dcfce7]' },
  S: { label: 'Sakit', bg: 'bg-[#e0f2fe]' },
  I: { label: 'Izin', bg: 'bg-[#fef9c3]' },
  A: { label: 'Alpa', bg: 'bg-[#fee2e2]' },
  D: { label: 'Dispen', bg: 'bg-[#ede9fe]' },
};

const BOX = 'bg-white border-2 border-slate-900 rounded-3xl shadow-[3px_3px_0px_#1e293b]';

function fmtDate(value: string): string {
  const d = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

const rupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

function setRobotsNoIndex() {
  let meta = document.querySelector('meta[name="robots"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', 'noindex, nofollow, noarchive');
}

function Message({ title, body, onRetry }: { title: string; body: string; onRetry?: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className={`${BOX} max-w-sm w-full p-6 text-center`}>
        <h1 className="text-base font-black text-slate-900">{title}</h1>
        <p className="text-xs font-medium text-slate-600 mt-2 leading-relaxed">{body}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 rounded-2xl bg-[#a7f3d0] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] text-xs font-black text-slate-950 cursor-pointer"
          >
            Coba Lagi
          </button>
        )}
      </div>
    </div>
  );
}

function AttendanceSection({ att }: { att: NonNullable<PublicShareData['attendance']> }) {
  const [showAll, setShowAll] = useState(false);
  const percent = att.total > 0 ? Math.round((att.summary.H / att.total) * 100) : 0;
  const rows = showAll ? att.recent : att.recent.slice(0, 8);

  return (
    <section className={`${BOX} p-4 space-y-3`}>
      <h2 className="text-sm font-black text-slate-900">Kehadiran</h2>
      <div className="flex items-end gap-3">
        <span className="text-4xl font-black text-slate-900 leading-none">{percent}%</span>
        <span className="text-xs font-bold text-slate-600 pb-1">
          hadir dari {att.total} pertemuan
        </span>
      </div>
      <div className="grid grid-cols-5 gap-1.5 text-center">
        {(['H', 'S', 'I', 'A', 'D'] as const).map((k) => (
          <div key={k} className={`${STATUS_META[k].bg} border-2 border-slate-900 rounded-xl py-1.5`}>
            <div className="text-base font-black text-slate-900 leading-tight">{att.summary[k]}</div>
            <div className="text-[10px] font-bold text-slate-700">{STATUS_META[k].label}</div>
          </div>
        ))}
      </div>
      {att.recent.length === 0 ? (
        <p className="text-xs font-medium text-slate-500">Belum ada data presensi.</p>
      ) : (
        <ul className="divide-y divide-slate-100 text-xs">
          {rows.map((r, i) => (
            <li key={`${r.tanggal}-${r.pertemuan_ke}-${i}`} className="flex items-center justify-between gap-2 py-1.5">
              <span className="font-bold text-slate-700">
                Pertemuan {r.pertemuan_ke} • {fmtDate(r.tanggal)}
              </span>
              <span
                className={`${STATUS_META[r.status]?.bg || 'bg-slate-100'} border border-slate-900 rounded-lg px-2 py-0.5 font-black text-slate-900`}
              >
                {STATUS_META[r.status]?.label || r.status}
              </span>
            </li>
          ))}
        </ul>
      )}
      {att.recent.length > 8 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="text-xs font-black text-sky-800 underline cursor-pointer"
        >
          {showAll ? 'Tampilkan lebih sedikit' : `Tampilkan semua (${att.recent.length})`}
        </button>
      )}
    </section>
  );
}

function GradesSection({
  grades,
  kkm,
}: {
  grades: NonNullable<PublicShareData['grades']>;
  kkm: number;
}) {
  const formatif = (grades.formatif || []).filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));
  const avg = formatif.length ? formatif.reduce((a, b) => a + b, 0) / formatif.length : 0;
  const sts = grades.sts ?? avg;
  const sas = grades.sas ?? avg;
  const finalScore = Math.round(avg * 0.5 + sts * 0.25 + sas * 0.25);
  const tuntas = finalScore >= kkm;

  return (
    <section className={`${BOX} p-4 space-y-3`}>
      <h2 className="text-sm font-black text-slate-900">Nilai</h2>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-4xl font-black text-slate-900 leading-none">{finalScore}</div>
          <div className="text-[11px] font-bold text-slate-500 mt-1">Nilai akhir • KKM {kkm}</div>
        </div>
        <span
          className={`${tuntas ? 'bg-[#dcfce7]' : 'bg-[#fee2e2]'} border-2 border-slate-900 rounded-xl px-3 py-1 text-xs font-black text-slate-900`}
        >
          {tuntas ? 'Tuntas' : 'Belum Tuntas'}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
        {[
          ['Rata-rata Formatif', Math.round(avg)],
          ['STS', Math.round(sts)],
          ['SAS', Math.round(sas)],
        ].map(([label, value]) => (
          <div key={label as string} className="bg-[#faf7ee] border-2 border-slate-900 rounded-xl py-1.5">
            <div className="text-base font-black text-slate-900">{value}</div>
            <div className="text-[10px] font-bold text-slate-600">{label}</div>
          </div>
        ))}
      </div>
      {grades.deskripsi && (
        <p className="text-xs font-medium text-slate-700 leading-relaxed">{grades.deskripsi}</p>
      )}
    </section>
  );
}

function SavingsSection({ savings }: { savings: NonNullable<PublicShareData['savings']> }) {
  return (
    <section className={`${BOX} p-4 space-y-3`}>
      <h2 className="text-sm font-black text-slate-900">Tabungan</h2>
      <div>
        <div className="text-3xl font-black text-slate-900 leading-none">{rupiah(savings.saldo)}</div>
        <div className="text-[11px] font-bold text-slate-500 mt-1">Saldo saat ini</div>
      </div>
      {savings.recent.length === 0 ? (
        <p className="text-xs font-medium text-slate-500">Belum ada transaksi.</p>
      ) : (
        <ul className="divide-y divide-slate-100 text-xs">
          {savings.recent.map((t, i) => (
            <li key={`${t.tanggal}-${i}`} className="flex items-center justify-between gap-2 py-1.5">
              <span className="min-w-0">
                <span className="block font-bold text-slate-800 truncate">{t.keterangan}</span>
                <span className="block text-[10px] text-slate-500 font-medium">{fmtDate(t.tanggal)}</span>
              </span>
              <span className={`font-black shrink-0 ${t.tipe === 'Pemasukan' ? 'text-emerald-800' : 'text-rose-800'}`}>
                {t.tipe === 'Pemasukan' ? '+' : '-'}
                {rupiah(t.nominal)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function PublicSharePage({ token }: { token: string }) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    document.title = 'Portal Wali Murid - Hadir!';
    setRobotsNoIndex();
  }, []);

  useEffect(() => {
    // Format salah: tidak perlu menghubungi server sama sekali
    if (!TOKEN_PATTERN.test(token)) {
      setState({ status: 'invalid' });
      return;
    }
    let cancelled = false;
    setState({ status: 'loading' });
    fetchPublicShare(token)
      .then((data) => {
        if (!cancelled) setState(data ? { status: 'ready', data } : { status: 'invalid' });
      })
      .catch((err: Error) => {
        if (!cancelled) setState({ status: 'error', message: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, [token, attempt]);

  if (state.status === 'loading') {
    return <Message title="Memuat data..." body="Mohon tunggu sebentar." />;
  }
  if (state.status === 'invalid') {
    return (
      <Message
        title="Tautan tidak dapat dibuka"
        body="Tautan ini tidak valid, sudah kedaluwarsa, atau telah dicabut oleh guru. Silakan minta tautan baru kepada guru."
      />
    );
  }
  if (state.status === 'error') {
    return (
      <Message
        title="Gagal memuat data"
        body={state.message}
        onRetry={() => setAttempt((n) => n + 1)}
      />
    );
  }

  const d = state.data;
  return (
    <main className="min-h-screen px-3 py-5 sm:py-8">
      <div className="max-w-xl mx-auto space-y-3.5">
        <header className={`${BOX} p-4`}>
          <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
            Portal Wali Murid • {d.school || 'Hadir!'}
          </div>
          <h1 className="text-xl font-black text-slate-900 mt-1 leading-tight">{d.student.nama}</h1>
          <p className="text-xs font-bold text-slate-600 mt-1">
            {d.class.nama} • {d.class.mapel} • {d.class.tahun_ajaran} ({d.class.semester})
          </p>
          {d.teacher && <p className="text-xs font-medium text-slate-500 mt-0.5">Guru: {d.teacher}</p>}
        </header>

        {d.attendance && <AttendanceSection att={d.attendance} />}
        {d.scopes.includes('nilai') &&
          (d.grades ? (
            <GradesSection grades={d.grades} kkm={Number(d.class.kkm) || 75} />
          ) : (
            <section className={`${BOX} p-4`}>
              <h2 className="text-sm font-black text-slate-900">Nilai</h2>
              <p className="text-xs font-medium text-slate-500 mt-1">Nilai belum diinput oleh guru.</p>
            </section>
          ))}
        {d.savings && <SavingsSection savings={d.savings} />}

        <footer className="text-center text-[11px] font-medium text-slate-500 px-4 pb-4 leading-relaxed">
          Halaman ini hanya dapat dibaca dan berlaku sampai {fmtDate(d.expires_at)}.
          <br />
          Tautan bersifat pribadi, mohon tidak dibagikan kepada pihak lain.
        </footer>
      </div>
    </main>
  );
}
