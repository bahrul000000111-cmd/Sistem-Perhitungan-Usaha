/**
 * PrintReport.jsx
 * Print-only report layout. Rendered off-screen and shown via window.print().
 * Contains a full summary of all records with calculations and BPS SE2026-L details.
 */
import { calculateRecord, CATEGORIES } from '../utils/calculations';
import { formatRupiah, formatDate } from '../utils/formatters';
import { aggregateStats } from '../utils/calculations';

export default function PrintReport({ records }) {
  const stats = aggregateStats(records);

  return (
    <div className="print-only" style={{ display: 'none' }} id="print-report">
      <style>{`
        @media print {
          #print-report { display: block !important; }
          body > #root > * { display: none; }
          body > #root > #print-wrapper { display: block; }
        }
      `}</style>

      <div className="p-8 max-w-4xl mx-auto font-sans text-black">

        {/* Cover header */}
        <div className="text-center border-b-2 border-blue-800 pb-6 mb-6">
          <h1 className="text-2xl font-bold text-blue-900">LAPORAN PERHITUNGAN PENDAPATAN UMK</h1>
          <p className="text-sm text-gray-600 mt-1">Usaha Mikro Kecil — Berdasarkan Koefisien Normatif Pemerintah &amp; Metodologi BPS SE2026-L</p>
          <p className="text-xs text-gray-500 mt-2">Tanggal Cetak: {formatDate(new Date())}</p>
        </div>

        {/* Summary statistics */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="border border-gray-200 rounded p-4">
            <p className="text-xs text-gray-500 uppercase font-semibold">Total Usaha Terkelola</p>
            <p className="text-2xl font-bold text-blue-800">{stats.totalUMK} Usaha</p>
          </div>
          <div className="border border-gray-200 rounded p-4">
            <p className="text-xs text-gray-500 uppercase font-semibold">Total Hasil Usaha Bersih (Tahunan)</p>
            <p className="text-2xl font-bold text-green-700">{formatRupiah(stats.totalNetAnnual)}</p>
          </div>
          <div className="border border-gray-200 rounded p-4">
            <p className="text-xs text-gray-500 uppercase font-semibold">Total Pendapatan Kotor (Tahunan)</p>
            <p className="text-xl font-bold text-indigo-700">{formatRupiah(stats.totalRevenue)}</p>
          </div>
          <div className="border border-gray-200 rounded p-4">
            <p className="text-xs text-gray-500 uppercase font-semibold">Rata-rata Pendapatan Per Bulan/Usaha</p>
            <p className="text-xl font-bold text-amber-700">{formatRupiah(stats.avgMonthly)}</p>
          </div>
        </div>

        {/* Per-record detail table */}
        <h2 className="text-lg font-bold text-blue-900 mb-3 border-b border-gray-300 pb-2">
          Rincian Per Catatan Usaha
        </h2>

        {records.map((record, idx) => {
          const result = calculateRecord(record, records);
          const category = CATEGORIES.find(c => c.id === record.categoryId);
          const bps = result.bps;

          return (
            <div key={record.id} className="mb-6 border border-gray-200 rounded p-4" style={{ pageBreakInside: 'avoid' }}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-[14px] text-gray-900">{idx + 1}. {record.name}</h3>
                  <p className="text-[11px] text-gray-500">{category?.name} · {formatDate(record.updatedAt)}</p>
                  
                  {/* BPS metadata profile in print layout */}
                  {bps && (bps.tahunMulai || bps.totalPekerja > 0) && (
                    <div className="flex gap-3 text-[10px] text-gray-600 mt-1">
                      {bps.tahunMulai && <span>Mulai Operasi: <strong>{bps.tahunMulai}</strong></span>}
                      {bps.totalPekerja > 0 && (
                        <span>Tenaga Kerja: <strong>{bps.totalPekerja} orang</strong> (L: {bps.pekerjaL}, P: {bps.pekerjaP})</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Pendapatan / Bulan</p>
                  <p className="text-[16px] font-bold text-amber-700">{formatRupiah(result.pendapatanPerBulan)}</p>
                </div>
              </div>

              <table className="w-full text-[12px] border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-200 px-3 py-1.5 text-left font-semibold">Komponen Perhitungan</th>
                    <th className="border border-gray-200 px-3 py-1.5 text-right font-semibold">Nilai (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Core vs Other revenues if present */}
                  {bps && bps.pendapatanLainnya > 0 ? (
                    <>
                      <tr>
                        <td className="border border-gray-200 px-3 py-1.5 text-gray-700 pl-6">Pendapatan Usaha Utama (27a)</td>
                        <td className="border border-gray-200 px-3 py-1.5 text-right font-mono">{formatRupiah(result.corePendapatanTahunan)}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 px-3 py-1.5 text-gray-700 pl-6">Pendapatan Lainnya (27b)</td>
                        <td className="border border-gray-200 px-3 py-1.5 text-right font-mono">{formatRupiah(bps.pendapatanLainnya)}</td>
                      </tr>
                      <tr className="bg-blue-50/50">
                        <td className="border border-gray-200 px-3 py-1.5 text-blue-800 font-semibold">Total Pendapatan (27c)</td>
                        <td className="border border-gray-200 px-3 py-1.5 text-right font-mono font-semibold text-blue-900">{formatRupiah(result.totalPendapatanTahunan)}</td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td className="border border-gray-200 px-3 py-1.5 text-blue-800">Total Pendapatan (Tahunan)</td>
                      <td className="border border-gray-200 px-3 py-1.5 text-right font-mono">{formatRupiah(result.totalPendapatanTahunan)}</td>
                    </tr>
                  )}

                  {/* Standard or detailed expenditures */}
                  {bps && bps.isDetailPengeluaranActive ? (
                    <>
                      <tr>
                        <td className="border border-gray-200 px-3 py-1.5 text-gray-700 pl-6">Upah, Gaji &amp; Jaminan Sosial (26a)</td>
                        <td className="border border-gray-200 px-3 py-1.5 text-right font-mono">{formatRupiah(parseFloat(record.inputs.biaya_upah) || 0)}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 px-3 py-1.5 text-gray-700 pl-6">Biaya Bahan / Produksi (26b)</td>
                        <td className="border border-gray-200 px-3 py-1.5 text-right font-mono">{formatRupiah(parseFloat(record.inputs.biaya_produksi) || 0)}</td>
                      </tr>
                      {['kios_campuran', 'tempurung'].includes(record.categoryId) && (
                        <tr>
                          <td className="border border-gray-200 px-3 py-1.5 text-gray-700 pl-6">Biaya Barang untuk Dijual / HPP (26c)</td>
                          <td className="border border-gray-200 px-3 py-1.5 text-right font-mono">{formatRupiah(parseFloat(record.inputs.biaya_hpp) || 0)}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="border border-gray-200 px-3 py-1.5 text-gray-700 pl-6">Biaya Operasional (26d)</td>
                        <td className="border border-gray-200 px-3 py-1.5 text-right font-mono">{formatRupiah(parseFloat(record.inputs.biaya_operasional) || 0)}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 px-3 py-1.5 text-gray-700 pl-6">Biaya Non-Operasional (26e)</td>
                        <td className="border border-gray-200 px-3 py-1.5 text-right font-mono">{formatRupiah(parseFloat(record.inputs.biaya_non_operasional) || 0)}</td>
                      </tr>
                      <tr className="bg-red-50/50">
                        <td className="border border-gray-200 px-3 py-1.5 text-red-700 font-semibold">Total Pengeluaran BPS (26f)</td>
                        <td className="border border-gray-200 px-3 py-1.5 text-right font-mono font-semibold text-red-900">{formatRupiah(result.totalPengeluaranTahunan)}</td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td className="border border-gray-200 px-3 py-1.5 text-red-700">Total Pengeluaran (Tahunan)</td>
                      <td className="border border-gray-200 px-3 py-1.5 text-right font-mono">{formatRupiah(result.totalPengeluaranTahunan)}</td>
                    </tr>
                  )}

                  {/* Net Profit & Monthly Net Profit */}
                  <tr className="bg-green-50">
                    <td className="border border-gray-200 px-3 py-1.5 font-semibold text-green-800">Total Hasil Usaha Bersih</td>
                    <td className="border border-gray-200 px-3 py-1.5 text-right font-mono font-bold text-green-700">{formatRupiah(result.totalHasilUsaha)}</td>
                  </tr>
                  <tr className="bg-amber-50">
                    <td className="border border-gray-200 px-3 py-1.5 font-semibold text-amber-800">Pendapatan Per Bulan</td>
                    <td className="border border-gray-200 px-3 py-1.5 text-right font-mono font-bold text-amber-700">{formatRupiah(result.pendapatanPerBulan)}</td>
                  </tr>

                  {/* Total Asset row if present */}
                  {bps && bps.totalAset > 0 && (
                    <tr className="bg-purple-50">
                      <td className="border border-gray-200 px-3 py-1.5 text-purple-800 pl-6">Total Aset Terdaftar (28)</td>
                      <td className="border border-gray-200 px-3 py-1.5 text-right font-mono text-purple-900">{formatRupiah(bps.totalAset)}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Formula & BPS Note */}
              <p className="text-[9px] text-gray-400 mt-2">
                * Formula: {category?.note} 
                {bps && bps.onlinePct > 0 ? ` · Porsi Penjualan Online: ${bps.onlinePct}%` : ''}
              </p>
            </div>
          );
        })}

        {/* Footer */}
        <div className="border-t border-gray-300 pt-4 text-center text-[10px] text-gray-400">
          Dokumen ini dibuat secara otomatis oleh Aplikasi Kalkulator UMK ·
          Koefisien normatif berdasarkan standar perhitungan pemerintah ·
          {formatDate(new Date())}
        </div>
      </div>
    </div>
  );
}
