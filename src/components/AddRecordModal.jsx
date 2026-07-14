/**
 * AddRecordModal.jsx  — Addendum #4 version
 * ──────────────────────────────────────────
 * A simplified category picker: shows only sector/sub-sector titles (no predefined KBLI cards).
 * Clicking a row immediately creates a new record and closes the modal.
 *
 * Formula assignment logic (Addendum #4, Bagian 3):
 *   • 1 formula in group  → auto-assign it
 *   • >1 formulas          → assign default (first); RecordCard shows "Jenis Kalkulasi" dropdown
 *   • 0 formulas (empty)   → assign 'generik_harian' (Generic Template)
 *
 * New record default name: "Usaha <SubSector/Sector> Baru"
 * Sector context stored in record as subSectorGroupKey so RecordCard can render badge/dropdown.
 *
 * Search: partial match on sector/sub-sector labels only.
 */
import { useState, useMemo } from 'react';
import {
  X, Search,
  Leaf, ShoppingCart, Factory, Utensils, Fish,
  ChevronRight,
} from 'lucide-react';
import { CATEGORIES, FORMULA_GROUPS } from '../utils/calculations';
import { SECTOR_TAXONOMY } from '../utils/sectorTaxonomy';

// ── Sector icon map ───────────────────────────────────────────────────────────
const SECTOR_ICON_MAP = { Leaf, ShoppingCart, Factory, Utensils };

// ── Sub-sector emoji icons (decorative) ──────────────────────────────────────
const SUBSECTOR_ICONS = {
  perikanan:    '🐟',
  peternakan:   '🐄',
  hortikultura: '🥬',
  perkebunan:   '🌴',
  pangan:       '🌾',
  kehutanan:    '🌲',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Given a groupKey (subSectorId or sectorId), return the first formula categoryId.
 * Falls back to 'generik_harian' if no mapping found.
 */
function resolveDefaultCategoryId(groupKey) {
  const formulas = FORMULA_GROUPS[groupKey];
  if (!formulas || formulas.length === 0) return 'generik_harian';
  return formulas[0];
}

/**
 * Build the default record name for a newly created record.
 * e.g. "Usaha Perikanan Baru", "Usaha Perdagangan Baru"
 */
function defaultRecordName(label) {
  return `Usaha ${label} Baru`;
}

/**
 * Get default inputs for a category (honour defaultValue fields).
 */
function getDefaultInputs(categoryId) {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  if (!cat) return {};
  const inputs = {};
  cat.fields.forEach(f => {
    if (f.defaultValue !== undefined) inputs[f.key] = f.defaultValue;
  });
  return inputs;
}

// ── Flat list item builder for search results ─────────────────────────────────
function buildAllItems() {
  const items = [];
  SECTOR_TAXONOMY.forEach(sector => {
    if (sector.subSectors) {
      // Pertanian: each sub-sector is a separate clickable row
      sector.subSectors.forEach(ss => {
        items.push({
          type: 'subsector',
          groupKey: ss.subSectorId,
          label: ss.subSectorName,
          sectorLabel: sector.sectorName,
          icon: SUBSECTOR_ICONS[ss.subSectorId] || '📁',
          sectorLetter: sector.sectorLetter,
        });
      });
    } else {
      // Flat sector: the sector itself is the clickable row
      items.push({
        type: 'sector',
        groupKey: sector.sectorId,
        label: sector.sectorName,
        sectorLabel: sector.sectorName,
        icon: null,      // will use Lucide icon
        lucideIcon: sector.icon,
        sectorLetter: sector.sectorLetter,
      });
    }
  });
  return items;
}

const ALL_ITEMS = buildAllItems();

// ── Row component ─────────────────────────────────────────────────────────────
function CategoryRow({ item, onSelect }) {
  const SectorIcon = item.lucideIcon ? SECTOR_ICON_MAP[item.lucideIcon] : null;
  const formulas    = FORMULA_GROUPS[item.groupKey] || [];
  const isGeneric   = formulas.length === 0 || formulas[0] === 'generik_harian';
  const isMulti     = formulas.length > 1;

  return (
    <button
      id={`pick-${item.groupKey}`}
      onClick={() => onSelect(item)}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left hover:bg-surface-700/60 active:bg-surface-700/80 transition-colors group min-h-[44px]"
    >
      {/* Icon */}
      <div className="w-7 h-7 rounded-lg bg-surface-600/50 flex items-center justify-center shrink-0 text-base group-hover:bg-surface-600/80 transition-colors">
        {SectorIcon
          ? <SectorIcon size={14} className="text-slate-400" />
          : <span>{item.icon}</span>
        }
      </div>

      {/* Label */}
      <span className="flex-1 text-[13px] font-medium text-slate-200 group-hover:text-white transition-colors truncate">
        {item.label}
      </span>

      {/* Metadata badges */}
      <div className="flex items-center gap-1.5 shrink-0">
        {isGeneric && (
          <span className="text-[9.5px] font-medium px-1.5 py-0.5 rounded-md bg-slate-600/40 text-slate-500">
            generik
          </span>
        )}
        {isMulti && (
          <span className="text-[9.5px] font-medium px-1.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400">
            {formulas.length} formula
          </span>
        )}
        <span className="text-[9.5px] text-slate-600">Kat. {item.sectorLetter}</span>
        <ChevronRight size={12} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
      </div>
    </button>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function AddRecordModal({ onConfirm, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items by search query (partial match on label + sectorLabel)
  const visibleItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null; // null = show grouped view
    return ALL_ITEMS.filter(
      item =>
        item.label.toLowerCase().includes(q) ||
        item.sectorLabel.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSelect = (item) => {
    const categoryId = resolveDefaultCategoryId(item.groupKey);
    const name       = defaultRecordName(item.label);
    const inputs     = getDefaultInputs(categoryId);
    // subSectorGroupKey: stored on record so RecordCard knows which badge/dropdown to show
    onConfirm(categoryId, name, { ...inputs, _groupKey: item.groupKey });
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Tambah Usaha Baru">
      <div className="glass rounded-xl border border-white/[0.1] w-full max-w-sm max-h-[85vh] flex flex-col overflow-hidden scale-in mx-4">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] shrink-0">
          <div>
            <h2 className="text-[15px] font-bold text-white">Tambah Usaha Baru</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Pilih kategori usaha</p>
          </div>
          <button
            id="btn-close-modal"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-surface-600 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-3 pb-2 shrink-0">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              id="modal-category-search"
              type="text"
              placeholder="Cari kategori usaha..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-[12px] rounded-xl bg-surface-700/80 border border-white/[0.07] text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none transition-colors"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                aria-label="Hapus pencarian"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="px-3 pb-3 overflow-y-auto flex-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          {visibleItems !== null ? (
            /* Search mode: flat filtered list */
            visibleItems.length > 0 ? (
              <div className="flex flex-col gap-0.5 pt-1">
                {visibleItems.map(item => (
                  <CategoryRow key={item.groupKey} item={item} onSelect={handleSelect} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                <Search size={22} className="text-slate-600" />
                <p className="text-[12px] text-slate-500">Tidak ada kategori yang cocok</p>
                <p className="text-[11px] text-slate-600">dengan &ldquo;{searchQuery}&rdquo;</p>
              </div>
            )
          ) : (
            /* Grouped view */
            SECTOR_TAXONOMY.map(sector => {
              const SectorIcon = SECTOR_ICON_MAP[sector.icon];
              return (
                <div key={sector.sectorId} className="pt-2">
                  {sector.subSectors ? (
                    /* Sector with sub-sectors (Pertanian): header label + sub-rows */
                    <>
                      {/* Non-clickable sector header */}
                      <div className="flex items-center gap-2 px-3 py-1.5 mb-0.5">
                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                          {SectorIcon && <SectorIcon size={12} className="text-slate-500" />}
                        </div>
                        <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-widest truncate">
                          {sector.sectorName}
                        </span>
                        <div className="flex-1 h-px bg-white/[0.05]" />
                        <span className="text-[9.5px] text-slate-600 shrink-0">Kat. {sector.sectorLetter}</span>
                      </div>
                      {/* Sub-sector rows (indented) */}
                      <div className="pl-4 flex flex-col gap-0.5">
                        {sector.subSectors.map(ss => {
                          const item = {
                            type: 'subsector',
                            groupKey: ss.subSectorId,
                            label: ss.subSectorName,
                            sectorLabel: sector.sectorName,
                            icon: SUBSECTOR_ICONS[ss.subSectorId] || '📁',
                            lucideIcon: null,
                            sectorLetter: sector.sectorLetter,
                          };
                          return <CategoryRow key={ss.subSectorId} item={item} onSelect={handleSelect} />;
                        })}
                      </div>
                    </>
                  ) : (
                    /* Flat sector: single clickable row */
                    <CategoryRow
                      item={{
                        type: 'sector',
                        groupKey: sector.sectorId,
                        label: sector.sectorName,
                        sectorLabel: sector.sectorName,
                        icon: null,
                        lucideIcon: sector.icon,
                        sectorLetter: sector.sectorLetter,
                      }}
                      onSelect={handleSelect}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer hint */}
        <div className="px-5 py-2.5 border-t border-white/[0.05] shrink-0">
          <p className="text-[10px] text-slate-600 text-center">
            Klik kategori untuk membuat catatan usaha baru · Nama bisa diubah setelah dibuat
          </p>
        </div>
      </div>
    </div>
  );
}
