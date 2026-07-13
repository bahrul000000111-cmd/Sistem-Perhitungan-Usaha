/**
 * SummaryCards.jsx
 * Top KPI cards and global progress bars — clean labels, no formula notation in UI.
 * Highly compact viewport-fit padding and sizing.
 */
import { useMemo } from 'react';
import { Target, CheckCircle2, TrendingUp, FileText } from 'lucide-react';
import { calcGlobalTotals, getStatusTier, getTierClasses } from '../utils/dataUtils';

/** Single KPI stat card - compact sizing */
function StatCard({ icon: Icon, label, value, sub, tier }) {
  const cls = getTierClasses(tier);
  const bgGlow =
    tier === 'green'  ? 'bg-emerald-400' :
    tier === 'amber'  ? 'bg-amber-400'   :
    tier === 'orange' ? 'bg-orange-400'  : 'bg-rose-400';

  return (
    <div className="glass rounded-xl p-3 flex flex-col gap-2 fade-in-up relative overflow-hidden">
      {/* Ambient glow blob */}
      <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10 blur-xl ${bgGlow}`} />

      <div className="flex items-center justify-between">
        <div className={`p-1.5 rounded-lg ${cls.badge}`}>
          <Icon size={16} />
        </div>
        <span className={`badge ${cls.badge} text-[9px] px-1 py-0.5`}>{sub}</span>
      </div>

      <div>
        <p className="text-slate-400 text-[9px] font-medium uppercase tracking-widest leading-none">{label}</p>
        <p className={`text-xl font-bold mt-1 font-mono count-up tabular-nums ${cls.text} leading-none`}>
          {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
        </p>
      </div>
    </div>
  );
}

/** Progress bar row inside the global progress panel - compact sizing */
function GlobalBar({ label, pct, tier, divisor = 100 }) {
  const cls = getTierClasses(tier);
  const barPct = Math.min((pct / divisor) * 100, 100);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center leading-none">
        <span className="text-[11px] text-slate-300 font-medium">{label}</span>
        <span className={`text-xs font-extrabold font-mono tabular-nums ${cls.text}`}>
          {pct.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 bg-surface-600 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full progress-fill ${cls.bar}`}
          style={{ width: `${barPct}%` }}
        />
      </div>
    </div>
  );
}

export default function SummaryCards({ entries }) {
  const g = useMemo(() => calcGlobalTotals(entries), [entries]);

  const tierSub   = getStatusTier(g.globalPctSubmitted);
  const tierApp   = getStatusTier(g.globalPctApproved);
  const tierTotal = getStatusTier(g.globalTotalPct);

  return (
    <section aria-label="Ringkasan Statistik" className="grid grid-cols-1 lg:grid-cols-3 gap-4">

      {/* ── Left Side: 4 KPI Cards (takes 2 cols on large screen) ── */}
      <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard
          icon={Target}
          label="Total Target"
          value={g.sumTarget}
          sub="Keseluruhan"
          tier="green"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Submitted"
          value={g.sumSubmitted}
          sub={`${g.globalPctSubmitted.toFixed(1)}%`}
          tier={tierSub}
        />
        <StatCard
          icon={CheckCircle2}
          label="Total Approved"
          value={g.sumApproved}
          sub={`${g.globalPctApproved.toFixed(1)}%`}
          tier={tierApp}
        />
        <StatCard
          icon={FileText}
          label="Total Draf"
          value={g.sumDraft}
          sub="Belum submit"
          tier="orange"
        />
      </div>

      {/* ── Right Side: Global Progress Panel (takes 1 col on large screen) ── */}
      <div className="glass rounded-xl p-3 flex flex-col justify-between gap-2.5">
        <div className="flex items-center gap-1.5 leading-none">
          <div className="pulse-dot w-1.5 h-1.5 rounded-full bg-primary-400" />
          <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
            Capaian Progres Global
          </h3>
        </div>

        <div className="space-y-2">
          {/* % Submitted */}
          <GlobalBar
            label="Persentase Submitted"
            pct={g.globalPctSubmitted}
            tier={tierSub}
            divisor={100}
          />

          {/* % Approved */}
          <GlobalBar
            label="Persentase Approved"
            pct={g.globalPctApproved}
            tier={tierApp}
            divisor={100}
          />

          {/* Total % Progress */}
          <div className="pt-1.5 border-t border-slate-700/60">
            <GlobalBar
              label="Total % Progress"
              pct={g.globalTotalPct}
              tier={tierTotal}
              divisor={200}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
