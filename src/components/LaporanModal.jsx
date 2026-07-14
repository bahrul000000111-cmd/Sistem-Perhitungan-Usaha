/**
 * LaporanModal.jsx
 * Comprehensive BPS SE2026-L Report Dashboard Modal.
 * Displays aggregate statistics, workers distributions, profit margins,
 * and handles Excel/CSV exports using the XLSX library.
 */
import { X, Download, Printer, Users, TrendingUp, DollarSign, BarChart3, Building } from 'lucide-react';
import { useMemo } from 'react';
import * as XLSX from 'xlsx';
import { calculateRecord, CATEGORIES } from '../utils/calculations';
import { formatRupiah, formatDate } from '../utils/formatters';

export default function LaporanModal({ records, onClose }) {
  // Calculate results for all records
  const calculatedRecords = useMemo(() => {
    return records.map(r => {
      const result = calculateRecord(r, records);
      const cat = CATEGORIES.find(c => c.id === r.categoryId);
      return {
        ...r,
        result,
        categoryName: cat ? cat.name : 'N/A'
      };
    });
  }, [records]);

  // Aggregate metrics
  const aggregates = useMemo(() => {
    let totalPekerjaL = 0;
    let totalPekerjaP = 0;
    let totalRevenue = 0;
    let totalExpense = 0;
    let totalNet = 0;
    let totalAset = 0;

    calculatedRecords.forEach(r => {
      if (r.result.bps) {
        totalPekerjaL += r.result.bps.pekerjaL;
        totalPekerjaP += r.result.bps.pekerjaP;
        totalAset += r.result.bps.totalAset;
      }
      totalRevenue += r.result.totalPendapatanTahunan;
      totalExpense += r.result.totalPengeluaranTahunan;
      totalNet += r.result.totalHasilUsaha;
    });

    const totalPekerja = totalPekerjaL + totalPekerjaP;

    return {
      totalPekerja,
      totalPekerjaL,
      totalPekerjaP,
      totalRevenue,
      totalExpense,
      totalNet,
      totalAset
    };
  }, [calculatedRecords]);

  // Handle Export to Excel
  const handleExportExcel = () => {
    if (calculatedRecords.length === 0) return;

    // Map data for spreadsheet export
    const exportData = calculatedRecords.map((r, idx) => ({
      'No': idx + 1,
      'Nama Usaha': r.name,
      'Kategori KBLI': r.categoryName,
      'Tahun Beroperasi': r.result.bps?.tahunMulai || '-',
      'Pekerja Laki-laki': r.result.bps?.pekerjaL || 0,
      'Pekerja Perempuan': r.result.bps?.pekerjaP || 0,
      'Total Pekerja': r.result.bps?.totalPekerja || 0,
      'Pendapatan Inti (Tahunan)': r.result.corePendapatanTahunan || 0,
      'Pendapatan Lainnya (Tahunan)': r.result.bps?.pendapatanLainnya || 0,
      'Total Pendapatan (Tahunan)': r.result.totalPendapatanTahunan || 0,
      'Total Pengeluaran (Tahunan)': r.result.totalPengeluaranTahunan || 0,
      'Hasil Usaha Bersih (Tahunan)': r.result.totalHasilUsaha || 0,
      'Aset Tanah & Bangunan': r.result.bps?.asetTanahBangunan || 0,
      'Aset Selain Tanah': r.result.bps?.asetLainnya || 0,
      'Total Aset Usaha': r.result.bps?.totalAset || 0,
      'Penjualan Online (%)': r.result.bps?.onlinePct || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan UMK BPS");

    // Auto-fit column widths
    const maxLens = {};
    exportData.forEach(row => {
      Object.keys(row).forEach(key => {
        const valStr = String(row[key]);
        maxLens[key] = Math.max(maxLens[key] || key.length, valStr.length);
      });
    });
    worksheet["!cols"] = Object.keys(maxLens).map(key => ({ wch: maxLens[key] + 2 }));

    XLSX.writeFile(workbook, `Laporan_UMK_BPS_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 backdrop-blur-md p-4 no-print fade-in">
      <div className="glass w-full max-w-6xl h-[90vh] rounded-3xl border border-white/[0.08] flex flex-col overflow-hidden shadow-2xl scale-in">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between bg-surface-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <BarChart3 size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-none">Laporan Analisis &amp; Ekspor BPS</h2>
              <p className="text-[11px] text-slate-400 mt-1">Konsolidasi data Usaha Mikro Kecil sesuai metodologi Sensus Ekonomi 2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-surface-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {calculatedRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface-800/50 flex items-center justify-center mb-4 border border-white/[0.03]">
                <BarChart3 size={28} className="text-slate-600" />
              </div>
              <h3 className="text-[14px] font-semibold text-slate-300">Belum Ada Data Untuk Dilaporkan</h3>
              <p className="text-[12px] text-slate-500 max-w-sm mt-1 leading-relaxed">
                Silakan tambahkan catatan usaha dan isi detail parameter/BPS terlebih dahulu untuk menampilkan visualisasi laporan.
              </p>
            </div>
          ) : (
            <>
              {/* Top Cards Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface-800/40 border border-white/[0.04] p-4 rounded-2xl">
                  <div className="flex items-center justify-between text-slate-500 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Hasil Bersih Total</span>
                    <TrendingUp size={14} className="text-emerald-400" />
                  </div>
                  <p className="text-lg font-bold text-emerald-300 font-mono tracking-tight tabular-nums">
                    {formatRupiah(aggregates.totalNet)}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Akumulasi laba bersih tahunan</p>
                </div>

                <div className="bg-surface-800/40 border border-white/[0.04] p-4 rounded-2xl">
                  <div className="flex items-center justify-between text-slate-500 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Output Bruto</span>
                    <DollarSign size={14} className="text-indigo-400" />
                  </div>
                  <p className="text-lg font-bold text-indigo-300 font-mono tracking-tight tabular-nums">
                    {formatRupiah(aggregates.totalRevenue)}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Pendapatan inti + lainnya</p>
                </div>

                <div className="bg-surface-800/40 border border-white/[0.04] p-4 rounded-2xl">
                  <div className="flex items-center justify-between text-slate-500 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Tenaga Kerja</span>
                    <Users size={14} className="text-cyan-400" />
                  </div>
                  <p className="text-lg font-bold text-cyan-300 font-mono tracking-tight">
                    {aggregates.totalPekerja} orang
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {aggregates.totalPekerjaL} Laki-laki · {aggregates.totalPekerjaP} Perempuan
                  </p>
                </div>

                <div className="bg-surface-800/40 border border-white/[0.04] p-4 rounded-2xl">
                  <div className="flex items-center justify-between text-slate-500 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Aset Terdata</span>
                    <Building size={14} className="text-violet-400" />
                  </div>
                  <p className="text-lg font-bold text-violet-300 font-mono tracking-tight tabular-nums">
                    {formatRupiah(aggregates.totalAset)}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Tanah, bangunan, &amp; modal lainnya</p>
                </div>
              </div>

              {/* Graphical Visualizations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visual 1: Profit Margin Comparison */}
                <div className="bg-surface-800/20 border border-white/[0.04] p-5 rounded-2xl flex flex-col gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide">Rasio Profit Margin Bersih</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Efisiensi operasional bersih per unit usaha</p>
                  </div>
                  <div className="space-y-3.5">
                    {calculatedRecords.map(r => {
                      const ratio = r.result.totalPendapatanTahunan > 0
                        ? (r.result.totalHasilUsaha / r.result.totalPendapatanTahunan) * 100
                        : 0;
                      const isLoss = r.result.totalHasilUsaha < 0;
                      return (
                        <div key={r.id} className="space-y-1.5">
                          <div className="flex justify-between text-[11.5px] font-semibold text-slate-300">
                            <span className="truncate max-w-[200px]">{r.name}</span>
                            <span className={isLoss ? 'text-rose-400' : 'text-emerald-400'}>
                              {ratio.toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-surface-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isLoss ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, ratio))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Visual 2: Workers Distribution (Male vs Female) */}
                <div className="bg-surface-800/20 border border-white/[0.04] p-5 rounded-2xl flex flex-col gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide">Struktur Tenaga Kerja BPS</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Distribusi gender pekerja Laki-laki vs Perempuan</p>
                  </div>
                  {aggregates.totalPekerja === 0 ? (
                    <div className="flex-1 flex items-center justify-center py-6 text-[12px] text-slate-600">
                      Pekerja belum diisi pada data pendukung.
                    </div>
                  ) : (
                    <div className="space-y-5 my-auto">
                      {/* Global worker distribution bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-[12px] font-semibold">
                          <span className="text-indigo-400">Laki-laki ({((aggregates.totalPekerjaL / aggregates.totalPekerja) * 100).toFixed(0)}%)</span>
                          <span className="text-rose-400">Perempuan ({((aggregates.totalPekerjaP / aggregates.totalPekerja) * 100).toFixed(0)}%)</span>
                        </div>
                        <div className="h-4 w-full bg-surface-800 rounded-full overflow-hidden flex">
                          <div
                            className="bg-indigo-500 h-full transition-all duration-500"
                            style={{ width: `${(aggregates.totalPekerjaL / aggregates.totalPekerja) * 100}%` }}
                          />
                          <div
                            className="bg-rose-500 h-full transition-all duration-500"
                            style={{ width: `${(aggregates.totalPekerjaP / aggregates.totalPekerja) * 100}%` }}
                          />
                        </div>
                        <p className="text-center text-[11px] text-slate-500 font-semibold mt-1">
                          Total {aggregates.totalPekerja} Pekerja terdata
                        </p>
                      </div>

                      {/* Small list breakdown */}
                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/[0.04]">
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Total Laki-laki</p>
                          <p className="text-xl font-bold text-indigo-300 font-mono mt-0.5">{aggregates.totalPekerjaL}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Total Perempuan</p>
                          <p className="text-xl font-bold text-rose-300 font-mono mt-0.5">{aggregates.totalPekerjaP}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Table List of all records with detailed metrics */}
              <div className="bg-surface-800/20 border border-white/[0.04] rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/[0.04] bg-surface-800/30">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide">Tabel Rekapitulasi Komprehensif</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-surface-800/10 text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-2.5 px-4">Nama Usaha</th>
                        <th className="py-2.5 px-3">Kategori KBLI</th>
                        <th className="py-2.5 px-3 text-center">Pekerja</th>
                        <th className="py-2.5 px-3 text-center">Tahun</th>
                        <th className="py-2.5 px-3 text-right">Pendapatan Inti</th>
                        <th className="py-2.5 px-3 text-right font-semibold">Pend. Lainnya</th>
                        <th className="py-2.5 px-3 text-right">Pendapatan Total</th>
                        <th className="py-2.5 px-3 text-right">Pengeluaran</th>
                        <th className="py-2.5 px-3 text-right">Laba Bersih</th>
                        <th className="py-2.5 px-4 text-right">Aset</th>
                      </tr>
                    </thead>
                    <tbody className="text-[11.5px] divide-y divide-white/[0.03]">
                      {calculatedRecords.map(r => (
                        <tr key={r.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-2.5 px-4 text-white font-semibold truncate max-w-[150px]">{r.name}</td>
                          <td className="py-2.5 px-3 text-slate-400 truncate max-w-[180px]">{r.categoryName}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-slate-300">
                            {r.result.bps?.totalPekerja ? `👥 ${r.result.bps.totalPekerja}` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-slate-300">
                            {r.result.bps?.tahunMulai || '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                            {formatRupiah(r.result.corePendapatanTahunan)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-indigo-300">
                            {r.result.bps?.pendapatanLainnya > 0 ? formatRupiah(r.result.bps.pendapatanLainnya) : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-indigo-200 font-semibold">
                            {formatRupiah(r.result.totalPendapatanTahunan)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-rose-300">
                            {formatRupiah(r.result.totalPengeluaranTahunan)}
                          </td>
                          <td className={`py-2.5 px-3 text-right font-mono font-semibold ${r.result.totalHasilUsaha < 0 ? 'text-rose-400' : 'text-emerald-300'}`}>
                            {formatRupiah(r.result.totalHasilUsaha)}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-violet-300">
                            {r.result.bps?.totalAset ? formatRupiah(r.result.bps.totalAset) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-white/[0.06] bg-surface-900/50 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[10px] text-slate-500">
            * Data diekspor menggunakan pustaka SheetJS format Spreadsheet Excel (.xlsx) standar.
          </p>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              disabled={calculatedRecords.length === 0}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-surface-700 hover:bg-surface-600 rounded-xl border border-white/[0.06] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer size={14} />
              Cetak Dokumen
            </button>
            <button
              onClick={handleExportExcel}
              disabled={calculatedRecords.length === 0}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-400 rounded-xl transition-colors shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={14} />
              Ekspor Spreadsheet (Excel)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
