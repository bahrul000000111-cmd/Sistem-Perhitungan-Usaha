/**
 * ResultCard.jsx
 * Displays calculated financial results for a single record.
 * Shows revenue, expense, net profit, and monthly income.
 * Supports BPS SE2026-L details (pendapatan lainnya, detail pengeluaran).
 */
import { TrendingUp, TrendingDown, DollarSign, ChevronDown, ChevronUp, Info, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { formatRupiah } from '../utils/formatters';

function ResultRow({ label, value, variant = 'default', indent = false, subtext = null }) {
  const variants = {
    revenue: 'result-row-revenue',
    expense: 'result-row-expense',
    profit:  'result-row-profit',
    monthly: 'result-row-monthly',
    default: ''
  };

  const valueColors = {
    revenue: 'text-indigo-300',
    expense: 'text-rose-300',
    profit:  'text-emerald-300',
    monthly: 'text-amber-300',
    default: 'text-slate-200'
  };

  return (
    <tr className={`${variants[variant]} border-b border-white/[0.04]`}>
      <td className={`py-2.5 pr-4 text-[12px] text-slate-400 ${indent ? 'pl-6' : 'pl-3'}`}>
        <div>{label}</div>
        {subtext && <div className="text-[10px] text-slate-500 mt-0.5 font-sans font-normal">{subtext}</div>}
      </td>
      <td className={`py-2.5 pl-2 pr-3 text-right text-[13px] font-semibold font-mono tabular-nums ${valueColors[variant]}`}>
        {formatRupiah(value)}
      </td>
    </tr>
  );
}

export default function ResultCard({ result, hasDualMode = false }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!result) return null;

  const {
    totalPendapatanTahunan,
    totalPengeluaranTahunan,
    totalHasilUsaha,
    pendapatanPerBulan,
    perPanen,
    setahun,
    meta,
    bps,
    corePendapatanTahunan,
    corePengeluaranTahunan
  } = result;

  // Visual profit ratio
  const profitRatio = totalPendapatanTahunan > 0
    ? (totalHasilUsaha / totalPendapatanTahunan) * 100
    : 0;

  const isLoss = totalHasilUsaha < 0;

  // Calculate equivalent expense % if detail override is active
  // Basis: totalPendapatanTahunan (sudah termasuk 27b) sesuai spesifikasi addendum
  const setaraExpPct = (bps && bps.isDetailPengeluaranActive && totalPendapatanTahunan > 0)
    ? (totalPengeluaranTahunan / totalPendapatanTahunan) * 100
    : null;

  return (
    <div className="glass rounded-xl border border-white/[0.07] overflow-hidden">
      {/* Header gradient banner */}
      <div className="bg-gradient-to-r from-indigo-600/20 via-violet-600/15 to-transparent px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <h3 className="text-[12px] font-semibold text-slate-300 flex items-center gap-2">
            <TrendingUp size={14} className="text-indigo-400" />
            Hasil Perhitungan
          </h3>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-20 bg-surface-600 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full progress-fill ${
                  isLoss
                    ? 'bg-rose-500'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, profitRatio))}%` }}
              />
            </div>
            <span className={`text-[11px] font-mono ${isLoss ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
              {profitRatio.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Main result table — annual summary */}
      <div className="px-1">
        <table className="w-full">
          <tbody>
            {/* If Pendapatan Lainnya is active, display core & other revenue */}
            {bps && bps.pendapatanLainnya > 0 ? (
              <>
                <ResultRow
                  label="Pendapatan Usaha Utama (27a)"
                  value={corePendapatanTahunan}
                  variant="default"
                  indent
                />
                <ResultRow
                  label="Pendapatan Lainnya (27b)"
                  value={bps.pendapatanLainnya}
                  variant="default"
                  indent
                />
                <ResultRow
                  label="Total Pendapatan / Produksi (27c)"
                  value={totalPendapatanTahunan}
                  variant="revenue"
                />
              </>
            ) : (
              <ResultRow
                label="Total Pendapatan (Tahunan)"
                value={totalPendapatanTahunan}
                variant="revenue"
              />
            )}

            {/* Total Expense with detail override footnote */}
            <ResultRow
              label={bps && bps.isDetailPengeluaranActive
                ? 'Total Pengeluaran Tahunan (Dengan Rincian Manual)'
                : 'Total Pengeluaran (Tahunan)'}
              value={totalPengeluaranTahunan}
              variant="expense"
              subtext={
                setaraExpPct !== null
                  ? `Setara dengan ${setaraExpPct.toFixed(1)}% dari Total Pendapatan`
                  : null
              }
            />

            {/* Total Net Profit */}
            <ResultRow
              label="Total Hasil Usaha Bersih"
              value={totalHasilUsaha}
              variant="profit"
            />

            {/* Monthly Net Profit */}
            <ResultRow
              label="Pendapatan Per Bulan"
              value={pendapatanPerBulan}
              variant="monthly"
            />
          </tbody>
        </table>
      </div>

      {/* Loss/Warning Guardrail */}
      {isLoss && (
        <div className="mx-3 my-2 px-3 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] rounded-xl flex items-start gap-2">
          <AlertTriangle size={14} className="text-rose-400 shrink-0 mt-0.5" />
          <span>
            <strong>Perhatian:</strong> Pengeluaran melebihi total pendapatan. Sensus Ekonomi menyarankan verifikasi ulang data pengeluaran Anda.
          </span>
        </div>
      )}

      {/* Bagi Hasil equivalent note (Addendum #16) */}
      {meta && meta.income_method === 'bagi_hasil' && (
        <div className="mx-3 my-2 px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] rounded-xl flex items-start gap-2">
          <Info size={14} className="text-indigo-400 shrink-0 mt-0.5" />
          <span>
            ℹ️ Total Hasil Usaha Bersih ini setara dengan Bagian Pemilik Kapal (setelah bagi hasil kru).
          </span>
        </div>
      )}

      {/* Quick metrics pills */}
      <div className="px-3 py-2 flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2.5 py-1.5">
          <DollarSign size={11} className="text-indigo-400" />
          <span className="text-[11px] text-indigo-300 font-mono">{formatRupiah(totalPendapatanTahunan, true)}/thn</span>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5">
          <TrendingUp size={11} className="text-emerald-400" />
          <span className="text-[11px] text-emerald-300 font-mono">{formatRupiah(pendapatanPerBulan, true)}/bln</span>
        </div>
        <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg px-2.5 py-1.5">
          <TrendingDown size={11} className="text-rose-400" />
          <span className="text-[11px] text-rose-300 font-mono">{formatRupiah(totalPengeluaranTahunan, true)}/thn</span>
        </div>
      </div>

      {/* Dual-mode breakdown (Category 4 & 5) */}
      {hasDualMode && perPanen && setahun && (
        <div className="border-t border-white/[0.06]">
          <button
            onClick={() => setShowDetails(v => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] transition-colors outline-none"
          >
            <span className="flex items-center gap-1.5">
              <Info size={11} />
              Rincian Per Panen &amp; Setahun
            </span>
            {showDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {showDetails && (
            <div className="px-1 pb-2 fade-in-up">
              {/* Per panen */}
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide px-3 pt-2 pb-1">
                Per Panen
              </p>
              <table className="w-full">
                <tbody>
                  <ResultRow label="Pendapatan Per Panen" value={perPanen.totalPendapatan} variant="revenue" indent />
                  <ResultRow label="Pengeluaran Per Panen" value={perPanen.totalPengeluaran} variant="expense" indent />
                  <ResultRow label="Hasil Usaha Per Panen" value={perPanen.totalHasilUsaha} variant="profit" indent />
                  <ResultRow label="Pendapatan Bulanan (Basis Panen)" value={perPanen.pendapatanPerBulanBasisPanen} variant="monthly" indent />
                </tbody>
              </table>

              {/* Setahun */}
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide px-3 pt-3 pb-1">
                Setahun (4 Panen)
              </p>
              <table className="w-full">
                <tbody>
                  <ResultRow label="Total Pendapatan Tahunan" value={setahun.totalPendapatan} variant="revenue" indent />
                  <ResultRow label="Total Pengeluaran Tahunan" value={setahun.totalPengeluaran} variant="expense" indent />
                  <ResultRow label="Total Hasil Usaha Tahunan" value={setahun.totalHasilUsaha} variant="profit" indent />
                  <ResultRow label="Pendapatan Per Bulan (Tahunan)" value={setahun.pendapatanPerBulan} variant="monthly" indent />
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Meta notes */}
      {meta && (meta.koefisien || meta.faktorPengeluaran || meta.catatan || (bps && bps.isDetailPengeluaranActive) || (bps && bps.onlinePct > 0)) && (
        <div className="px-4 py-2.5 border-t border-white/[0.05] flex flex-wrap gap-3 text-[10px] text-slate-500">
          {meta.koefisien && !bps?.isDetailPengeluaranActive && (
            <span>Koefisien: <strong className="text-slate-400">{meta.koefisien}</strong></span>
          )}
          {meta.faktorPengeluaran && !bps?.isDetailPengeluaranActive && (
            <span>Pengeluaran: <strong className="text-slate-400">{meta.faktorPengeluaran}</strong></span>
          )}
          {bps && bps.isDetailPengeluaranActive && (
            <span className="flex items-center gap-1 text-amber-400">
              <strong>Pengeluaran:</strong> Rincian Manual (26f) aktif
            </span>
          )}
          {meta.catatan && <span className="italic">{meta.catatan}</span>}
          {bps && bps.onlinePct > 0 && (
            <span>Online: <strong className="text-cyan-400 font-mono">{bps.onlinePct}%</strong></span>
          )}
        </div>
      )}
    </div>
  );
}
