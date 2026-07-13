/**
 * AppHeader.jsx
 * Top navigation bar for the UMK Calculator.
 */
import { Store, BarChart3, Cpu } from 'lucide-react';

export default function AppHeader({ onPrint }) {
  return (
    <header className="no-print sticky top-0 z-50 glass border-b border-white/[0.06]">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
            <Store size={16} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-white leading-none">Kalkulator UMK</h1>
            <p className="text-[10px] text-slate-400 mt-0.5">Usaha Mikro Kecil · Koefisien Normatif</p>
          </div>
          <div className="sm:hidden">
            <h1 className="text-sm font-bold text-white">Kalkulator UMK</h1>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 bg-surface-800 px-3 py-1.5 rounded-lg border border-white/[0.05]">
            <Cpu size={12} className="text-indigo-400" />
            <span>Data tersimpan otomatis</span>
          </div>
          <button
            id="btn-print"
            onClick={onPrint}
            className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-surface-700 hover:bg-surface-600 text-slate-300 hover:text-white transition-colors border border-white/[0.06]"
          >
            <BarChart3 size={14} />
            <span className="hidden sm:inline">Laporan</span>
          </button>
        </div>
      </div>
    </header>
  );
}
