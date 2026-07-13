/**
 * CategorySidebar.jsx
 * Navigation sidebar listing all 8 UMK business categories.
 * Collapses to horizontal scrollable tabs on mobile.
 */
import {
  Store, UtensilsCrossed, Sprout, TreePalm,
  Package, Gem, Flame, Fish, Plus
} from 'lucide-react';
import { CATEGORIES } from '../utils/calculations';

// Map category id → Lucide icon component
const ICON_MAP = {
  Store, UtensilsCrossed, Sprout, TreePalm,
  Package, Gem, Flame, Fish,
  Shell: Gem  // Shell not in this Lucide version; mapped to Gem
};

// Color variants per category
const COLOR_VARIANTS = {
  indigo: { dot: 'bg-indigo-400', tag: 'text-indigo-300 bg-indigo-500/10' },
  amber:  { dot: 'bg-amber-400',  tag: 'text-amber-300  bg-amber-500/10'  },
  emerald:{ dot: 'bg-emerald-400',tag: 'text-emerald-300 bg-emerald-500/10'},
  cyan:   { dot: 'bg-cyan-400',   tag: 'text-cyan-300   bg-cyan-500/10'   },
  orange: { dot: 'bg-amber-500',  tag: 'text-amber-200  bg-amber-600/10'  },
  brown:  { dot: 'bg-amber-700',  tag: 'text-amber-200  bg-amber-800/10'  },
  rose:   { dot: 'bg-rose-400',   tag: 'text-rose-300   bg-rose-500/10'   },
  blue:   { dot: 'bg-blue-400',   tag: 'text-blue-300   bg-blue-500/10'   }
};

export default function CategorySidebar({ activeCategory, onSelect, records }) {
  // Count records per category
  const countMap = {};
  records.forEach(r => { countMap[r.categoryId] = (countMap[r.categoryId] || 0) + 1; });

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="no-print hidden lg:flex flex-col gap-1 w-64 shrink-0">
        <div className="glass rounded-2xl border border-white/[0.06] p-3">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">
            Kategori Usaha
          </p>

          {CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Store;
            const colors = COLOR_VARIANTS[cat.color] || COLOR_VARIANTS.indigo;
            const count = countMap[cat.id] || 0;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                id={`nav-${cat.id}`}
                onClick={() => onSelect(cat.id)}
                className={`nav-item w-full text-left ${isActive ? 'active' : ''}`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-indigo-500/20' : 'bg-surface-600/50'
                }`}>
                  <Icon size={13} className={isActive ? 'text-indigo-400' : 'text-slate-400'} />
                </div>
                <span className="flex-1 truncate text-[12.5px]">{cat.name}</span>
                {count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${colors.tag}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── MOBILE HORIZONTAL TABS ── */}
      <div className="no-print lg:hidden w-full overflow-x-auto pb-1">
        <div className="flex gap-2 min-w-max px-1">
          {CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Store;
            const colors = COLOR_VARIANTS[cat.color] || COLOR_VARIANTS.indigo;
            const count = countMap[cat.id] || 0;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                id={`tab-${cat.id}`}
                onClick={() => onSelect(cat.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    : 'bg-surface-800 text-slate-400 border-white/[0.05] hover:text-slate-200'
                }`}
              >
                <Icon size={13} />
                <span>{cat.name}</span>
                {count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${colors.tag}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
