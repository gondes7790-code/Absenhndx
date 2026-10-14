import React, { useState, useMemo } from 'react';
import {
  Wallet,
  PiggyBank,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Cloud,
  Share2,
  Trash2,
  Receipt,
  CheckCircle2,
  X,
  CreditCard,
  Flame,
  Printer,
} from 'lucide-react';
import { FinanceTransaction, Student, ClassRoom, TeacherProfile, PrintConfig } from '../types';
import { PrintableDocument } from './PrintableDocument';

interface FinanceViewProps {
  activeClass: ClassRoom;
  students: Student[];
  finances: FinanceTransaction[];
  teacher: TeacherProfile;
  schoolName?: string;
  printConfig?: PrintConfig;
  onAddTransaction: (tx: Omit<FinanceTransaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onSaveToCloud: () => void;
  onOpenParentLink: () => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  activeClass,
  students,
  finances,
  teacher,
  schoolName = 'SMK Merdeka Indonesia',
  printConfig,
  onAddTransaction,
  onDeleteTransaction,
  onSaveToCloud,
  onOpenParentLink,
}) => {
  const [activeTab, setActiveTab] = useState<'kas' | 'tabungan'>('kas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Modal form states
  const [txType, setTxType] = useState<'Pemasukan' | 'Pengeluaran'>('Pemasukan');
  const [txCategory, setTxCategory] = useState<'Kas Kelas' | 'Tabungan Siswa'>('Kas Kelas');
  const [txKeterangan, setTxKeterangan] = useState('');
  const [txNominal, setTxNominal] = useState('');
  const [txStudentId, setTxStudentId] = useState('');

  // Calculations
  const metrics = useMemo(() => {
    let kasMasuk = 0;
    let kasKeluar = 0;
    let tabunganTotal = 0;

    finances.forEach((tx) => {
      if (tx.kategori === 'Kas Kelas') {
        if (tx.tipe === 'Pemasukan') kasMasuk += tx.nominal;
        else kasKeluar += tx.nominal;
      } else {
        if (tx.tipe === 'Pemasukan') tabunganTotal += tx.nominal;
        else tabunganTotal -= tx.nominal;
      }
    });

    const saldoKas = kasMasuk - kasKeluar;
    const totalMutasi = finances.length;

    return { saldoKas, kasMasuk, kasKeluar, tabunganTotal, totalMutasi };
  }, [finances]);

  // Tabungan per student
  const studentSavings = useMemo(() => {
    const map = new Map<string, number>();
    students.forEach((s) => map.set(s.id, 0));

    finances
      .filter((t) => t.kategori === 'Tabungan Siswa' && t.studentId)
      .forEach((t) => {
        const cur = map.get(t.studentId!) || 0;
        if (t.tipe === 'Pemasukan') map.set(t.studentId!, cur + t.nominal);
        else map.set(t.studentId!, cur - t.nominal);
      });

    return students.map((s) => ({
      student: s,
      saldo: map.get(s.id) || 0,
    }));
  }, [students, finances]);

  // Filtered transactions for table
  const filteredTransactions = useMemo(() => {
    if (activeTab === 'kas') {
      return finances.filter((t) => t.kategori === 'Kas Kelas');
    }
    return finances.filter((t) => t.kategori === 'Tabungan Siswa');
  }, [finances, activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nom = Number(txNominal);
    if (!nom || nom <= 0 || !txKeterangan.trim()) return;

    let studentName = undefined;
    if (txCategory === 'Tabungan Siswa' && txStudentId) {
      const std = students.find((s) => s.id === txStudentId);
      studentName = std?.nama;
    }

    onAddTransaction({
      tanggal: new Date().toISOString().split('T')[0],
      classId: activeClass.id,
      tipe: txType,
      kategori: txCategory,
      keterangan: txKeterangan,
      nominal: nom,
      pencatat: teacher.name,
      studentId: txCategory === 'Tabungan Siswa' ? txStudentId : undefined,
      studentName,
    });

    setIsModalOpen(false);
    setTxKeterangan('');
    setTxNominal('');
    setTxStudentId('');
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Header Card - Vintage Postmodern Neobrutalist */}
      <div className="bg-[#fffdf8] rounded-3xl p-4 sm:p-6 border-2 border-slate-900 shadow-[4px_4px_0px_#1e293b] relative overflow-hidden">
        {/* Retro Corner Stamp with Fire */}
        <div className="absolute top-0 right-0 bg-[#ffe4e6] border-b-2 border-l-2 border-slate-900 px-3 py-1 rounded-bl-2xl text-[10px] font-mono font-bold text-rose-950 flex items-center gap-1 shadow-xs">
          <Flame className="w-3 h-3 text-orange-600 fill-orange-500" />
          <span>PEMBUKUAN KELAS</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 sm:pt-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-slate-600 mb-1.5 flex-wrap">
              <span className="bg-[#fef9c3] text-amber-950 px-2.5 py-0.5 rounded-full border-2 border-slate-900 font-mono text-[11px] shadow-[1.5px_1.5px_0px_#1e293b]">
                {activeClass.nama}
              </span>
              <span>•</span>
              <span className="font-bold text-slate-700">Transparansi Keuangan</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Tabungan Murid & Kas Kelas
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              Pencatatan pembukuan uang kas kelas serta tabungan mandiri murid
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => setShowPrintModal(true)}
              className="px-3.5 py-2 rounded-2xl bg-[#e0f2fe] hover:bg-[#bae6fd] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-sky-950 text-xs sm:text-sm font-black flex items-center gap-2 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] transition-all cursor-pointer"
              title="Cetak Buku Kas / Laporan Keuangan format resmi A4 putih"
            >
              <Printer className="w-4 h-4 text-sky-900" />
              <span>Cetak Laporan</span>
            </button>
            <button
              onClick={onSaveToCloud}
              className="px-3.5 py-2 rounded-2xl bg-[#a7f3d0] hover:bg-[#6ee7b7] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-slate-950 text-xs sm:text-sm font-black flex items-center gap-2 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] transition-all cursor-pointer"
            >
              <Cloud className="w-4 h-4 text-emerald-950" />
              <span>Simpan ke Cloud</span>
            </button>
            <button
              onClick={onOpenParentLink}
              className="px-3.5 py-2 rounded-2xl bg-[#ede9fe] hover:bg-[#ddd6fe] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-indigo-950 border-2 border-slate-900 shadow-[2.5px_2.5px_0px_#1e293b] text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-indigo-900" />
              <span>Link Publik Wali</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-[#fef9c3] hover:bg-[#fde047] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-amber-950 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-900" />
              <span>Catat Transaksi</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards Grid in Pastel Neobrutalism */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mt-6 pt-5 border-t-2 border-slate-100">
          {/* Card 1: Saldo Kas - Pastel Sky */}
          <div className="bg-[#e0f2fe] rounded-2xl p-4 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-sky-950 uppercase tracking-wider">
                SALDO KAS KELAS
              </span>
              <div className="p-2 rounded-xl bg-white border border-slate-900 text-sky-950 shadow-[1px_1px_0px_#1e293b]">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-mono tracking-tight">
                Rp {metrics.saldoKas.toLocaleString('id-ID')}
              </h2>
              <div className="flex items-center gap-3 mt-2 text-[11px] font-bold text-slate-700">
                <span className="text-emerald-800 flex items-center gap-0.5">
                  <ArrowDownLeft className="w-3.5 h-3.5" /> Masuk: Rp {metrics.kasMasuk.toLocaleString('id-ID')}
                </span>
                <span className="text-rose-800 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" /> Keluar: Rp {metrics.kasKeluar.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Tabungan Murid - Pastel Mint */}
          <div className="bg-[#dcfce7] rounded-2xl p-4 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-emerald-950 uppercase tracking-wider">
                TOTAL TABUNGAN MURID
              </span>
              <div className="p-2 rounded-xl bg-white border border-slate-900 text-emerald-950 shadow-[1px_1px_0px_#1e293b]">
                <PiggyBank className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono tracking-tight">
                Rp {metrics.tabunganTotal.toLocaleString('id-ID')}
              </h2>
              <p className="text-[11px] text-emerald-900 font-bold mt-2">
                Terdistribusi dalam {students.length} murid terdaftar
              </p>
            </div>
          </div>

          {/* Card 3: Total Mutasi - Pastel Apricot */}
          <div className="bg-[#ffedd5] rounded-2xl p-4 border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-orange-950 uppercase tracking-wider">
                TOTAL MUTASI TRANSAKSI
              </span>
              <div className="p-2 rounded-xl bg-white border border-slate-900 text-orange-950 shadow-[1px_1px_0px_#1e293b]">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-mono tracking-tight">
                {metrics.totalMutasi} Transaksi
              </h2>
              <p className="text-[11px] text-orange-900 font-bold mt-2">
                Tercatat resmi dalam pembukuan kelas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Table */}
      <div className="bg-white border-2 border-slate-900 rounded-3xl shadow-[4px_4px_0px_#1e293b] overflow-hidden">
        {/* Navigation Tabs */}
        <div className="p-4 border-b-2 border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fffdf8]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('kas')}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer border-2 border-slate-900 ${
                activeTab === 'kas'
                  ? 'bg-[#e0f2fe] text-slate-950 shadow-[2.5px_2.5px_0px_#1e293b]'
                  : 'bg-white hover:bg-[#faf7ee] text-slate-700'
              }`}
            >
              Buku Mutasi Kas Kelas
            </button>
            <button
              onClick={() => setActiveTab('tabungan')}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer border-2 border-slate-900 ${
                activeTab === 'tabungan'
                  ? 'bg-[#dcfce7] text-slate-950 shadow-[2.5px_2.5px_0px_#1e293b]'
                  : 'bg-white hover:bg-[#faf7ee] text-slate-700'
              }`}
            >
              Rekap Saldo Tabungan Siswa
            </button>
          </div>

          <span className="text-xs font-bold text-slate-500">
            {activeTab === 'kas' ? `${filteredTransactions.length} transaksi kas` : `${students.length} buku tabungan siswa`}
          </span>
        </div>

        {/* Content based on Active Tab */}
        {activeTab === 'kas' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#faf7ee] text-slate-900 font-black text-[11px] tracking-wider uppercase border-b-2 border-slate-900">
                  <th className="py-3 px-3 w-10 text-center">NO</th>
                  <th className="py-3 px-3 w-28">TANGGAL</th>
                  <th className="py-3 px-3 w-24 text-center">TIPE</th>
                  <th className="py-3 px-4 min-w-[240px]">KETERANGAN PENGGUNAAN</th>
                  <th className="py-3 px-4 w-36 text-right">NOMINAL</th>
                  <th className="py-3 px-3 w-32">PENCATAT</th>
                  <th className="py-3 px-2 w-16 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100">
                {filteredTransactions.map((tx, idx) => (
                  <tr key={tx.id} className="hover:bg-[#faf7ee]/60 transition-colors">
                    <td className="py-3 px-3 text-center text-slate-600 font-mono font-bold">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {tx.tanggal}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-black shadow-[1px_1px_0px_#1e293b] ${
                          tx.tipe === 'Pemasukan'
                            ? 'bg-[#dcfce7] text-emerald-950 border-slate-900'
                            : 'bg-[#fee2e2] text-rose-950 border-slate-900'
                        }`}
                      >
                        {tx.tipe}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {tx.keterangan}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-black ${
                        tx.tipe === 'Pemasukan' ? 'text-emerald-800' : 'text-rose-800'
                      }`}
                    >
                      {tx.tipe === 'Pemasukan' ? '+' : '-'} Rp {tx.nominal.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {tx.pencatat}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1.5 rounded-xl bg-[#fee2e2] hover:bg-[#fca5a5] text-rose-950 border border-slate-900 shadow-[1px_1px_0px_#1e293b] transition-all cursor-pointer"
                        title="Hapus Transaksi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#faf7ee] text-slate-900 font-black text-[11px] tracking-wider uppercase border-b-2 border-slate-900">
                  <th className="py-3 px-3 w-10 text-center">NO</th>
                  <th className="py-3 px-3 w-28">NISN</th>
                  <th className="py-3 px-4 min-w-[200px]">NAMA MURID</th>
                  <th className="py-3 px-3 w-16 text-center">L/P</th>
                  <th className="py-3 px-4 w-44 text-right">TOTAL SALDO TABUNGAN</th>
                  <th className="py-3 px-4 w-32 text-center">STATUS BUKU</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100">
                {studentSavings.map((s, idx) => (
                  <tr key={s.student.id} className="hover:bg-[#faf7ee]/60 transition-colors">
                    <td className="py-3 px-3 text-center text-slate-600 font-mono font-bold">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-slate-500">
                      {s.student.nisn}
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900">
                      {s.student.nama}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-block w-6 h-6 rounded-xl bg-[#faf7ee] text-slate-900 font-black text-xs leading-6 text-center border-2 border-slate-900 shadow-[1px_1px_0px_#1e293b]">
                        {s.student.gender}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-emerald-950 text-sm">
                      Rp {s.saldo.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-[#dcfce7] border border-slate-900 text-emerald-950 px-2 py-0.5 rounded-full text-[10px] font-black shadow-[1px_1px_0px_#1e293b]">
                        Aktif
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Catat Transaksi Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border-3 border-slate-900 rounded-3xl p-6 shadow-[6px_6px_0px_#1e293b] relative animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-900">
                Catat Transaksi Keuangan Baru
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-[#fee2e2] border border-slate-900 text-rose-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Kategori Pembukuan
                  </label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value as 'Kas Kelas' | 'Tabungan Siswa')}
                    className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold focus:bg-white focus:outline-none"
                  >
                    <option value="Kas Kelas">Kas Kelas</option>
                    <option value="Tabungan Siswa">Tabungan Siswa</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Jenis Mutasi
                  </label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as 'Pemasukan' | 'Pengeluaran')}
                    className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold focus:bg-white focus:outline-none"
                  >
                    <option value="Pemasukan">Pemasukan (+)</option>
                    <option value="Pengeluaran">Pengeluaran (-)</option>
                  </select>
                </div>
              </div>

              {txCategory === 'Tabungan Siswa' && (
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Pilih Murid Pemilik Tabungan
                  </label>
                  <select
                    value={txStudentId}
                    onChange={(e) => setTxStudentId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold focus:bg-white focus:outline-none"
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.noUrut}. {s.nama} ({s.nisn})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nominal (Rupiah) *
                </label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  required
                  placeholder="Contoh: 25000"
                  value={txNominal}
                  onChange={(e) => setTxNominal(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-mono font-bold focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Keterangan / Keperluan Transaksi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Iuran kas mingguan / Pembelian spidol"
                  value={txKeterangan}
                  onChange={(e) => setTxKeterangan(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl border-2 border-slate-900 bg-[#faf7ee] font-bold focus:bg-white focus:outline-none"
                />
              </div>

              <div className="mt-5 pt-3 border-t-2 border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#f1f5f9] border-2 border-slate-900 font-bold text-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#a7f3d0] hover:bg-[#6ee7b7] border-2 border-slate-900 shadow-[2px_2px_0px_#1e293b] font-black text-slate-950 cursor-pointer"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Formal Printable Document */}
      <PrintableDocument
        type="finance"
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        activeClass={activeClass}
        teacher={teacher}
        schoolName={schoolName}
        printConfig={printConfig}
        students={students}
        financeTransactions={finances}
      />
    </div>
  );
};
