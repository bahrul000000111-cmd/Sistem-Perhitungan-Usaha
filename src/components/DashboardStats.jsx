/**
 * DashboardStats.jsx
 * Aggregated dashboard summary cards shown at the top of the app.
 */
import { TrendingUp, Wallet, BarChart2, Building2, ArrowUpRight } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { aggregateStats } from '../utils/calculations';

const STAT_CONFIG = [
  {
    key: 'totalUMK',
    label: 'Total Usaha Terkelola',
    icon: Building2,
    color: 'indigo',
    format: (v) => v.toLocaleString('id-ID'),
    suffix: 'usaha',
    glow: 'glow-indigo'
  },
  {
    key: 'totalRevenue',
    label: 'Total Pendapatan (Tahunan)',
    icon: BarChart2,
    color: 'blue',
    format: (v) => formatRupiah(v, true),
    suffix: '/tahun',
    glow: 'glow-cyan'
  },
  {
    key: 'totalNetAnnual',
    label: 'Total Hasil Usaha Bersih',
    icon: TrendingUp,
    color: 'emerald',
    format: (v) => formatRupiah(v, true),
    suffix: '/tahun',
    glow: 'glow-emerald'
  },
  {
    key: 'avgMonthly',
    label: 'Rata-rata Pendapatan Bulanan',
    icon: Wallet,
    color: 'amber',
    format: (v) => formatRupiah(v, true),
    suffix: '/bulan/usaha',
    glow: 'glow-amber'
  }
];

const COLOR_MAP = {
  indigo:  { bg: 'bg-indigo-500/10',  icon: 'text-indigo-400',  border: 'border-indigo-500/20', val: 'text-indigo-300' },
  blue:    { bg: 'bg-cyan-500/10',    icon: 'text-cyan-400',    border: 'border-cyan-500/20',   val: 'text-cyan-300' },
  emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/20', val: 'text-emerald-300' },
  amber:   { bg: 'bg-amber-500/10',   icon: 'text-amber-400',   border: 'border-amber-500/20',  val: 'text-amber-300' }
};

export default function DashboardStats({ records }) {
  const stats = aggregateStats(records);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {STAT_CONFIG.map((cfg, i) => {
        const c = COLOR_MAP[cfg.color];
        const Icon = cfg.icon;
        const value = stats[cfg.key];

        return (
          <div
            key={cfg.key}
            className={`metric-card glass border ${c.border} fade-in-up`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Icon */}
            <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={c.icon} />
            </div>

            {/* Value */}
            <p className={`text-xl sm:text-2xl font-bold ${c.val} leading-none mb-1 count-up`}>
              {cfg.format(value)}
            </p>

            {/* Label */}
            <p className="text-[11px] text-slate-400 leading-tight">{cfg.label}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">{cfg.suffix}</p>

            {/* Trend indicator (static, decorative) */}
            {value > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight size={12} className={c.icon} />
                <span className={`text-[10px] font-medium ${c.icon}`}>Aktif</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
