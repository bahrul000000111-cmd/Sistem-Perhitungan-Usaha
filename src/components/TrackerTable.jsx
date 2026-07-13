/**
 * TrackerTable.jsx
 * Main tracker table — double-deck grouped header structure.
 *
 * Column Layout:
 * 1. NO (rowspan 2)
 * 2. NAMA TARGET / KEGIATAN (rowspan 2)
 * 3. TARGET (rowspan 2)
 * 4. SUBMITTED (colspan 2) -> Sub columns: Jumlah / %
 * 5. APPROVED (colspan 2) -> Sub columns: Jumlah / %
 * 6. TOTAL % PROGRESS (rowspan 2)
 * 7. DRAF (rowspan 2)
 * 8. AKSI (rowspan 2)
 *
 * All formula notation is clean and removed from UI text.
 */
import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import EntryRow from './EntryRow';
import { calcGlobalTotals, getStatusTier, getTierClasses } from '../utils/dataUtils';

/** Styled cells for TotalsRow with sticky bottom positioning */
function TotalCell({ children, className = '' }) {
  return (
    <td className={`px-2 py-1.5 text-center font-mono font-bold text-xs sticky bottom-0 bg-surface-800/95 backdrop-blur-sm z-10 border border-slate-700/50 border-t-2 border-t-slate-500 last:border-r-0 ${className}`}>
      {children}
    </td>
  );
}

function TotalsRow({ entries }) {
  const g    = calcGlobalTotals(entries);
  const tier = getStatusTier(g.globalTotalPct);
  const cls  = getTierClasses(tier);

  return (
    <tr className="shadow-[0_-3px_10px_rgba(0,0,0,0.55)]">
      {/* 1. No */}
      <td className="px-2 py-1.5 sticky bottom-0 bg-surface-800/95 backdrop-blur-sm z-10 border border-slate-700/50 border-t-2 border-t-slate-500" />

      {/* 2. Label */}
      <td className="px-2 py-1.5 text-left sticky bottom-0 bg-surface-800/95 backdrop-blur-sm z-10 border border-slate-700/50 border-t-2 border-t-slate-500">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider leading-none">
            Total Akumulasi
          </span>
          <span className="text-[8px] text-slate-400 leading-none">Global</span>
        </div>
      </td>

      {/* 3. Target total */}
      <TotalCell className="text-white">
        {g.sumTarget.toLocaleString('id-ID')}
      </TotalCell>

      {/* 4. Submitted Jumlah */}
      <TotalCell className="text-blue-300">
        {g.sumSubmitted.toLocaleString('id-ID')}
      </TotalCell>

      {/* 5. Submitted % */}
      <TotalCell className="text-blue-400">
        {g.globalPctSubmitted.toFixed(2)}%
      </TotalCell>

      {/* 6. Approved Jumlah */}
      <TotalCell className="text-violet-300">
        {g.sumApproved.toLocaleString('id-ID')}
      </TotalCell>

      {/* 7. Approved % */}
      <TotalCell className="text-violet-400">
        {g.globalPctApproved.toFixed(2)}%
      </TotalCell>

      {/* 8. Total % Progress */}
      <TotalCell>
        <div className="flex flex-col items-center gap-0.5">
          <span className={`font-extrabold ${cls.text}`}>
            {g.globalTotalPct.toFixed(2)}%
          </span>
          <div className="w-12 h-1 bg-surface-600 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full progress-fill ${cls.bar}`}
              style={{ width: `${Math.min(g.globalTotalPct / 2, 100)}%` }}
            />
          </div>
        </div>
      </TotalCell>

      {/* 9. Draft total */}
      <TotalCell className="text-amber-300">
        {g.sumDraft.toLocaleString('id-ID')}
      </TotalCell>

      {/* 10. Actions placeholder */}
      <td className="px-2 py-1.5 sticky bottom-0 bg-surface-800/95 backdrop-blur-sm z-10 border border-slate-700/50 border-t-2 border-t-slate-500" />
    </tr>
  );
}

export default function TrackerTable({ entries, onIncrement, onSetValue, onEdit, onDelete, onReset }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() =>
    query.trim()
      ? entries.filter(e => e.name.toLowerCase().includes(query.toLowerCase()))
      : entries,
    [entries, query]
  );

  return (
    <section className="glass rounded-xl overflow-hidden flex flex-col" aria-label="Tracker Table">

      {/* ── Control bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 border-b border-slate-700/60 bg-surface-800/40">
        <div className="flex items-center gap-2">
          <div className="pulse-dot w-1.5 h-1.5 rounded-full bg-primary-400" />
          <h2 className="font-bold text-white text-xs">Pelacakan Progres Berjenjang</h2>
          <span className="badge bg-surface-500 text-slate-300 border border-white/8 text-[10px] px-1.5 py-0.2">
            {filtered.length} entri
          </span>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-56">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="search-input"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cari nama..."
            className="
              w-full pl-8 pr-7 py-1 rounded-lg
              bg-surface-600 border border-white/10
              text-xs text-white placeholder-slate-500
              focus:border-primary-500/60 transition-all
            "
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* ── Viewport-fit Scrollable Table Container ── */}
      <div className="max-h-[calc(100vh-220px)] overflow-y-auto table-scroll">
        <table className="w-full text-xs border-collapse border border-slate-700/60 divide-y divide-slate-800">
          <thead>
            {/* Row 1: Main headers */}
            <tr className="bg-surface-700/90 border-b border-slate-700/60 sticky top-0 z-20">
              <th
                rowSpan={2}
                className="px-2 py-1.5 text-center font-semibold text-slate-400 uppercase tracking-wider w-10 border border-slate-700/60 bg-surface-700/90"
              >
                No
              </th>
              <th
                rowSpan={2}
                className="px-3 py-1.5 text-left font-semibold text-slate-400 uppercase tracking-wider min-w-[150px] border border-slate-700/60 bg-surface-700/90"
              >
                Nama Target / Kegiatan
              </th>
              <th
                rowSpan={2}
                className="px-2 py-1.5 text-center font-semibold text-slate-400 uppercase tracking-wider w-20 border border-slate-700/60 bg-surface-700/90"
              >
                Target
              </th>
              <th
                colSpan={2}
                className="px-2 py-1 text-center font-semibold text-blue-400 uppercase tracking-wider border border-slate-700/60 bg-surface-700/90"
              >
                Submitted
              </th>
              <th
                colSpan={2}
                className="px-2 py-1 text-center font-semibold text-violet-400 uppercase tracking-wider border border-slate-700/60 bg-surface-700/90"
              >
                Approved
              </th>
              <th
                rowSpan={2}
                className="px-2 py-1.5 text-center font-semibold text-slate-200 uppercase tracking-wider w-28 border border-slate-700/60 bg-surface-700/90"
              >
                Total % Progress
              </th>
              <th
                rowSpan={2}
                className="px-2 py-1.5 text-center font-semibold text-amber-400 uppercase tracking-wider w-24 border border-slate-700/60 bg-surface-700/90"
              >
                Draf
              </th>
              <th
                rowSpan={2}
                className="px-2 py-1.5 text-center font-semibold text-slate-500 uppercase tracking-wider w-20 border border-slate-700/60 bg-surface-700/90"
              >
                Aksi
              </th>
            </tr>

            {/* Row 2: Sub headers */}
            <tr className="bg-surface-700/80 border-b border-slate-700/60 sticky top-[25px] z-20">
              <th className="px-2 py-1 text-center font-semibold text-blue-400/80 border border-slate-700/60 bg-surface-700/80">
                Jumlah
              </th>
              <th className="px-2 py-1 text-center font-semibold text-blue-400/80 border border-slate-700/60 bg-surface-700/80">
                %
              </th>
              <th className="px-2 py-1 text-center font-semibold text-violet-400/80 border border-slate-700/60 bg-surface-700/80">
                Jumlah
              </th>
              <th className="px-2 py-1 text-center font-semibold text-violet-400/80 border border-slate-700/60 bg-surface-700/80">
                %
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-slate-500 bg-surface-900/40">
                  {query
                    ? 'Tidak ada hasil yang cocok.'
                    : 'Belum ada data. Klik "Tambah Target" untuk memulai.'}
                </td>
              </tr>
            ) : (
              filtered.map((entry, idx) => (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  index={idx}
                  onIncrement={onIncrement}
                  onSetValue={onSetValue}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReset={onReset}
                />
              ))
            )}
          </tbody>

          {/* Sticky footer row */}
          {entries.length > 0 && (
            <tfoot>
              <TotalsRow entries={entries} />
            </tfoot>
          )}
        </table>
      </div>

      {/* ── Hint + legend bar ── */}
      <div className="px-3 py-1.5 bg-surface-800/40 border-t border-slate-700/60 flex flex-wrap justify-between items-center gap-1.5">
        <p className="text-[9px] text-slate-500">
          Klik angka untuk edit manual · Hover baris untuk aksi
        </p>
        <div className="flex gap-2 flex-wrap">
          {[
            { dot: 'bg-rose-500',    label: '< 30%' },
            { dot: 'bg-orange-500',  label: '30 – 49%' },
            { dot: 'bg-amber-500',   label: '50 – 79%' },
            { dot: 'bg-emerald-500', label: '≥ 80%' },
          ].map(({ dot, label }) => (
            <div key={label} className="flex items-center gap-1">
              <span className={`w-1 h-1 rounded-full ${dot}`} />
              <span className="text-[9px] text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
