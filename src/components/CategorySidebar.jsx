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

export default function CategorySidebar({ activeCategory, onSelect, records, variant }) {
  // Count records per category
  const countMap = {};
  records.forEach(r => { countMap[r.categoryId] = (countMap[r.categoryId] || 0) + 1; });

  // ── Shared item renderer helpers ─────────────────────────────
  const SidebarItems = () => (
    <>
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
            <span className="flex-1 truncate text-[12.5px] flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                count > 0 ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-slate-600'
              }`} />
              {cat.name}
            </span>
            {count > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${colors.tag}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </>
  );

  const TabItems = () => (
    <div className="flex flex-col gap-2 w-full">
      {/* Modern dropdown selector only visible on mobile screens */}
      <div className="block md:hidden w-full">
        <select
          id="mobile-category-select"
          value={activeCategory || ""}
          onChange={(e) => onSelect(e.target.value === "" ? null : e.target.value)}
          className="w-full px-3.5 py-2.5 bg-surface-800 border border-white/[0.08] text-slate-200 rounded-xl text-[12.5px] outline-none font-medium focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right_14px_center] bg-no-repeat"
        >
          <option value="" className="bg-surface-800 text-slate-200">Semua Kategori Usaha</option>
          {CATEGORIES.map(cat => (
            <option key={cat.id} value={cat.id} className="bg-surface-800 text-slate-200">
              {cat.name} {countMap[cat.id] ? `(${countMap[cat.id]})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Horizontal scrolling tabs with smooth fading mask on the right */}
      <div className="relative w-full overflow-hidden">
        <div className="w-full overflow-x-auto pb-1.5 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
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
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11.5px] font-medium whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      : 'bg-surface-800 text-slate-400 border-white/[0.05] hover:text-slate-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    count > 0 ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-slate-600'
                  }`} />
                  <Icon size={12} />
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
        {/* Transparent fading mask overlay */}
        <div className="absolute right-0 top-0 bottom-1.5 w-12 bg-gradient-to-l from-surface-900 to-transparent pointer-events-none" />
      </div>
    </div>
  );

  // ── Render by variant ────────────────────────────────────────
  if (variant === 'sidebar') {
    return (
      <div className="glass rounded-2xl border border-white/[0.06] p-3 w-64 flex flex-col gap-1">
        <SidebarItems />
      </div>
    );
  }

  if (variant === 'tabs') {
    return <TabItems />;
  }

  // Fallback: both (legacy usage — not used by App.jsx anymore)
  return (
    <>
      <aside className="no-print hidden md:flex flex-col gap-1 w-64 shrink-0">
        <div className="glass rounded-2xl border border-white/[0.06] p-3">
          <SidebarItems />
        </div>
      </aside>
      <div className="no-print md:hidden w-full">
        <TabItems />
      </div>
    </>
  );
}
