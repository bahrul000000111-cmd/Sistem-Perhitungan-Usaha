/**
 * CategorySidebar.jsx
 * Navigation sidebar with 2-level grouped category hierarchy:
 *   Tingkat 1 → Sector     (collapsible, aggregated badge)
 *   Tingkat 2 → Sub-sector (collapsible; empty sub-sectors still shown with CTA)
 *   Tingkat 3 → KBLI item  (individual category button)
 *
 * Collapse/expand state persisted per key in localStorage.
 * Default state rules:
 *   • Sectors WITH records → expanded by default
 *   • Sectors WITHOUT records but with KBLI definitions → collapsed by default
 *   • Empty sub-sectors (no KBLI defined) → collapsed, clickable, shows empty state + CTA
 *
 * Mobile: collapses to grouped <optgroup> dropdown (unchanged behaviour).
 */
import { useState, useCallback } from 'react';
import {
  Store, UtensilsCrossed, Sprout, TreePalm,
  Package, Gem, Flame, Fish,
  Leaf, ShoppingCart, Factory, Utensils,
  ChevronDown, ChevronRight, Plus,
} from 'lucide-react';
import { CATEGORIES } from '../utils/calculations';
import { SECTOR_TAXONOMY } from '../utils/sectorTaxonomy';

// ── Icon maps ──────────────────────────────────────────────────────────────────
const CATEGORY_ICON_MAP = {
  Store, UtensilsCrossed, Sprout, TreePalm,
  Package, Gem, Flame, Fish,
  Shell: Gem,
};

const SECTOR_ICON_MAP = { Leaf, ShoppingCart, Factory, Utensils };

// ── Color variants per KBLI category (unchanged) ────────────────────────────
const COLOR_VARIANTS = {
  indigo: { dot: 'bg-indigo-400',  tag: 'text-indigo-300 bg-indigo-500/10'  },
  amber:  { dot: 'bg-amber-400',   tag: 'text-amber-300  bg-amber-500/10'   },
  emerald:{ dot: 'bg-emerald-400', tag: 'text-emerald-300 bg-emerald-500/10'},
  cyan:   { dot: 'bg-cyan-400',    tag: 'text-cyan-300   bg-cyan-500/10'    },
  orange: { dot: 'bg-amber-500',   tag: 'text-amber-200  bg-amber-600/10'   },
  brown:  { dot: 'bg-amber-700',   tag: 'text-amber-200  bg-amber-800/10'   },
  rose:   { dot: 'bg-rose-400',    tag: 'text-rose-300   bg-rose-500/10'    },
  blue:   { dot: 'bg-blue-400',    tag: 'text-blue-300   bg-blue-500/10'    },
};

// ── localStorage persistence ───────────────────────────────────────────────────
const LS_KEY = 'umk_sidebar_collapse';

function loadCollapseState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCollapseState(state) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch { /* quota exceeded — silently ignore */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Individual KBLI category button (Tingkat 3)
// ─────────────────────────────────────────────────────────────────────────────
function CategoryItem({ cat, isActive, count, onSelect }) {
  const Icon   = CATEGORY_ICON_MAP[cat.icon] || Store;
  const colors = COLOR_VARIANTS[cat.color]   || COLOR_VARIANTS.indigo;

  return (
    <button
      id={`nav-${cat.id}`}
      onClick={() => onSelect(cat.id)}
      // 44px min-height via py-2 to meet touch-target requirement
      className={`nav-item w-full text-left pl-9 py-2 ${isActive ? 'active' : ''}`}
    >
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
        isActive ? 'bg-indigo-500/20' : 'bg-surface-600/50'
      }`}>
        <Icon size={13} className={isActive ? 'text-indigo-400' : 'text-slate-400'} />
      </div>
      <span className="flex-1 truncate text-[11.5px] flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          count > 0 ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-slate-600'
        }`} />
        {cat.name}
      </span>
      {count > 0 && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${colors.tag}`}>
          {count}
        </span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Sub-sector group (Tingkat 2) — always shown, even when empty
// ─────────────────────────────────────────────────────────────────────────────
function SubSectorGroup({
  subSector, categories, countMap, activeCategory, onSelect,
  collapseState, onToggle, onAddRequest,
}) {
  // KBLI items that belong to this sub-sector
  const subCats       = categories.filter(c => c.subSectorId === subSector.subSectorId);
  const totalCount    = subCats.reduce((sum, c) => sum + (countMap[c.id] || 0), 0);
  const hasKbliDefs   = subCats.length > 0;   // true if any KBLI is defined for this sub-sector
  const isEmpty       = !hasKbliDefs;           // no KBLI registered yet

  // Default expand logic:
  //   • has active records → expanded
  //   • empty sub-sector  → collapsed (clickable, shows CTA when opened)
  const defaultExpanded = totalCount > 0;
  const stateKey = `ss_${subSector.subSectorId}`;
  const isExpanded = collapseState[stateKey] !== undefined
    ? collapseState[stateKey]
    : defaultExpanded;

  return (
    <div className="flex flex-col">
      {/* Sub-sector header — clickable even when empty */}
      <button
        id={`nav-subsector-${subSector.subSectorId}`}
        onClick={() => onToggle(stateKey, !isExpanded)}
        // min 44px touch target via py-2
        className={`flex items-center gap-1.5 px-2 py-2 rounded-lg w-full text-left transition-colors group ${
          isEmpty
            ? 'opacity-50 hover:opacity-70'
            : 'hover:bg-surface-700/40'
        }`}
        aria-expanded={isExpanded}
      >
        {/* Chevron */}
        <span className="shrink-0">
          {isExpanded
            ? <ChevronDown  size={11} className={isEmpty ? 'text-slate-600' : 'text-slate-400'} />
            : <ChevronRight size={11} className={isEmpty ? 'text-slate-600' : 'text-slate-400'} />
          }
        </span>

        {/* Label */}
        <span className={`flex-1 truncate text-[11px] font-medium ${
          isEmpty
            ? 'text-slate-600 group-hover:text-slate-500'
            : 'text-slate-400 group-hover:text-slate-300'
        }`}>
          {subSector.subSectorName}
        </span>

        {/* Badge — "0" for empty, count for filled */}
        <span className={`text-[10px] font-bold px-1 py-0.5 rounded-full shrink-0 ${
          totalCount > 0
            ? 'text-emerald-300 bg-emerald-500/10'
            : 'text-slate-600 bg-slate-700/30'
        }`}>
          {totalCount}
        </span>
      </button>

      {/* Expanded body */}
      {isExpanded && (
        <div className="flex flex-col gap-0.5 mb-0.5">
          {isEmpty ? (
            // Empty state: informational CTA
            <div className="pl-8 pr-2 py-2 flex flex-col gap-1.5">
              <p className="text-[10.5px] text-slate-600 leading-relaxed">
                Belum ada usaha di sub-sektor ini.
              </p>
              <button
                id={`btn-add-${subSector.subSectorId}`}
                onClick={() => onAddRequest()}
                className="flex items-center gap-1 text-[10.5px] text-slate-500 hover:text-indigo-400 transition-colors group/add"
                title="Kategori usaha untuk sub-sektor ini belum tersedia — hubungi admin untuk penambahan"
              >
                <Plus size={10} className="group-hover/add:text-indigo-400" />
                <span>Tambah Usaha</span>
              </button>
            </div>
          ) : (
            // KBLI items
            subCats.map(cat => (
              <CategoryItem
                key={cat.id}
                cat={cat}
                isActive={activeCategory === cat.id}
                count={countMap[cat.id] || 0}
                onSelect={onSelect}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Sector group (Tingkat 1)
// ─────────────────────────────────────────────────────────────────────────────
function SectorGroup({
  sector, categories, countMap, activeCategory, onSelect,
  collapseState, onToggle, onAddRequest,
}) {
  const SectorIcon = SECTOR_ICON_MAP[sector.icon] || Leaf;

  // All KBLI that belong to this sector
  const sectorCats  = categories.filter(c => c.sectorId === sector.sectorId);
  // For flat sectors (no subSectors): direct items only
  const directCats  = sectorCats.filter(c => !c.subSectorId);
  // Total record count for this sector (for aggregated badge)
  const totalCount  = sectorCats.reduce((sum, c) => sum + (countMap[c.id] || 0), 0);

  // Default expand:
  //   • has records → expanded
  //   • no records but has KBLI definitions → collapsed
  const defaultExpanded = totalCount > 0;
  const stateKey = `sec_${sector.sectorId}`;
  const isExpanded = collapseState[stateKey] !== undefined
    ? collapseState[stateKey]
    : defaultExpanded;

  return (
    <div className="flex flex-col gap-0.5">
      {/* Sector header */}
      <button
        id={`nav-sector-${sector.sectorId}`}
        onClick={() => onToggle(stateKey, !isExpanded)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl w-full text-left hover:bg-surface-700/40 transition-colors group"
        aria-expanded={isExpanded}
      >
        <div className="w-5 h-5 rounded-md bg-surface-600/60 flex items-center justify-center shrink-0">
          <SectorIcon size={11} className="text-slate-400" />
        </div>

        <span className="flex-1 truncate text-[11.5px] font-semibold text-slate-300 group-hover:text-slate-100 transition-colors">
          {sector.sectorName}
        </span>

        {/* Aggregated badge */}
        {totalCount > 0 && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-slate-300 bg-slate-500/20 shrink-0">
            {totalCount}
          </span>
        )}

        <span className="text-slate-500 group-hover:text-slate-400 transition-colors shrink-0">
          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
      </button>

      {/* Sector body */}
      {isExpanded && (
        <div className="flex flex-col gap-0.5 ml-1 pl-2 border-l border-white/[0.05]">
          {sector.subSectors ? (
            // Tingkat 2: sub-sector groups
            sector.subSectors.map(ss => (
              <SubSectorGroup
                key={ss.subSectorId}
                subSector={ss}
                categories={sectorCats}
                countMap={countMap}
                activeCategory={activeCategory}
                onSelect={onSelect}
                collapseState={collapseState}
                onToggle={onToggle}
                onAddRequest={onAddRequest}
              />
            ))
          ) : (
            // Flat KBLI list (Perdagangan, Industri, Akomodasi)
            directCats.map(cat => (
              <CategoryItem
                key={cat.id}
                cat={cat}
                isActive={activeCategory === cat.id}
                count={countMap[cat.id] || 0}
                onSelect={onSelect}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────
export default function CategorySidebar({ activeCategory, onSelect, records, variant, onAddRequest }) {
  // countMap: categoryId → number of records
  const countMap = {};
  records.forEach(r => { countMap[r.categoryId] = (countMap[r.categoryId] || 0) + 1; });

  // Collapse state (persisted in localStorage)
  const [collapseState, setCollapseState] = useState(() => loadCollapseState());

  const handleToggle = useCallback((key, value) => {
    setCollapseState(prev => {
      const next = { ...prev, [key]: value };
      saveCollapseState(next);
      return next;
    });
  }, []);

  // Safe add-request callback (open modal)
  const handleAddRequest = useCallback(() => {
    if (typeof onAddRequest === 'function') onAddRequest();
  }, [onAddRequest]);

  // ── Sidebar variant (desktop) ────────────────────────────────────────────
  const SidebarContent = () => (
    <>
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">
        Kategori Usaha
      </p>

      <div className="flex flex-col gap-1">
        {/* "Semua" clear-filter button */}
        <button
          id="nav-all"
          onClick={() => onSelect(null)}
          className={`nav-item w-full text-left ${activeCategory === null ? 'active' : ''}`}
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
            activeCategory === null ? 'bg-indigo-500/20' : 'bg-surface-600/50'
          }`}>
            <Store size={13} className={activeCategory === null ? 'text-indigo-400' : 'text-slate-400'} />
          </div>
          <span className="flex-1 truncate text-[12px] text-slate-300">Semua Kategori</span>
          {records.length > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-slate-300 bg-slate-500/15">
              {records.length}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="border-t border-white/[0.05] my-1" />

        {/* Sector groups */}
        {SECTOR_TAXONOMY.map(sector => (
          <SectorGroup
            key={sector.sectorId}
            sector={sector}
            categories={CATEGORIES}
            countMap={countMap}
            activeCategory={activeCategory}
            onSelect={onSelect}
            collapseState={collapseState}
            onToggle={handleToggle}
            onAddRequest={handleAddRequest}
          />
        ))}
      </div>
    </>
  );

  // ── Tab/mobile variant ───────────────────────────────────────────────────
  const TabItems = () => (
    <div className="flex flex-col gap-2 w-full">
      {/* Grouped dropdown (mobile) */}
      <div className="block md:hidden w-full">
        <select
          id="mobile-category-select"
          value={activeCategory || ''}
          onChange={(e) => onSelect(e.target.value === '' ? null : e.target.value)}
          className="w-full px-3.5 py-2.5 bg-surface-800 border border-white/[0.08] text-slate-200 rounded-xl text-[12.5px] outline-none font-medium focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right_14px_center] bg-no-repeat"
        >
          <option value="" className="bg-surface-800 text-slate-200">Semua Kategori Usaha</option>
          {SECTOR_TAXONOMY.map(sector => (
            <optgroup key={sector.sectorId} label={`── ${sector.sectorName}`}>
              {CATEGORIES.filter(c => c.sectorId === sector.sectorId).map(cat => (
                <option key={cat.id} value={cat.id} className="bg-surface-800 text-slate-200">
                  {cat.name}{countMap[cat.id] ? ` (${countMap[cat.id]})` : ''}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Horizontal scrolling tabs */}
      <div className="relative w-full overflow-hidden">
        <div className="w-full overflow-x-auto pb-1.5 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          <div className="flex gap-2 min-w-max px-1">
            {CATEGORIES.map((cat) => {
              const Icon   = CATEGORY_ICON_MAP[cat.icon] || Store;
              const colors = COLOR_VARIANTS[cat.color]   || COLOR_VARIANTS.indigo;
              const count  = countMap[cat.id] || 0;
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
        <div className="absolute right-0 top-0 bottom-1.5 w-12 bg-gradient-to-l from-surface-900 to-transparent pointer-events-none" />
      </div>
    </div>
  );

  // ── Render by variant ────────────────────────────────────────────────────
  if (variant === 'sidebar') {
    return (
      <div className="glass rounded-2xl border border-white/[0.06] p-3 w-64 flex flex-col gap-1">
        <SidebarContent />
      </div>
    );
  }

  if (variant === 'tabs') {
    return <TabItems />;
  }

  // Fallback (legacy)
  return (
    <>
      <aside className="no-print hidden md:flex flex-col gap-1 w-64 shrink-0">
        <div className="glass rounded-2xl border border-white/[0.06] p-3">
          <SidebarContent />
        </div>
      </aside>
      <div className="no-print md:hidden w-full">
        <TabItems />
      </div>
    </>
  );
}
