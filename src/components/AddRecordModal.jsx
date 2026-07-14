/**
 * AddRecordModal.jsx
 * Modal for creating a new business record.
 *
 * Step 1: Pick category.
 *   • Grouped view: Sector → (Sub-sector if applicable) → KBLI cards.
 *   • Empty sub-sectors are HIDDEN in this modal (unlike sidebar which shows them).
 *     Rationale: modal is for SELECTING an available formula — if no KBLI exists
 *     for a sub-sector, there is nothing to select.
 *   • Live search: flattens all groups into a single results list while query is active.
 *
 * Step 2: Name the business record.
 */
import { useState, useMemo } from 'react';
import {
  X, Plus, Store, UtensilsCrossed, Sprout, TreePalm,
  Package, Gem, Flame, Fish,
  Leaf, ShoppingCart, Factory, Utensils,
  ChevronRight, Search,
} from 'lucide-react';
import { CATEGORIES } from '../utils/calculations';
import { SECTOR_TAXONOMY } from '../utils/sectorTaxonomy';

// ── Icon maps ─────────────────────────────────────────────────────────────────
const CATEGORY_ICON_MAP = {
  Store, UtensilsCrossed, Sprout, TreePalm,
  Package, Gem, Flame, Fish,
  Shell: Gem,
};

const SECTOR_ICON_MAP = { Leaf, ShoppingCart, Factory, Utensils };

// ── Color maps (unchanged per-KBLI styling) ───────────────────────────────────
const COLOR_BG = {
  indigo:  'bg-indigo-500/15 border-indigo-500/25 hover:bg-indigo-500/25',
  amber:   'bg-amber-500/15  border-amber-500/25  hover:bg-amber-500/25',
  emerald: 'bg-emerald-500/15 border-emerald-500/25 hover:bg-emerald-500/25',
  cyan:    'bg-cyan-500/15   border-cyan-500/25   hover:bg-cyan-500/25',
  orange:  'bg-orange-500/15 border-orange-500/25 hover:bg-orange-500/25',
  brown:   'bg-amber-800/15  border-amber-800/25  hover:bg-amber-800/25',
  rose:    'bg-rose-500/15   border-rose-500/25   hover:bg-rose-500/25',
  blue:    'bg-blue-500/15   border-blue-500/25   hover:bg-blue-500/25',
};

const COLOR_ICON = {
  indigo:  'text-indigo-400', amber:  'text-amber-400',  emerald: 'text-emerald-400',
  cyan:    'text-cyan-400',   orange: 'text-orange-400', brown:   'text-amber-700',
  rose:    'text-rose-400',   blue:   'text-blue-400',
};

// ─────────────────────────────────────────────────────────────────────────────
// Individual KBLI category card (style unchanged from original)
// ─────────────────────────────────────────────────────────────────────────────
function CategoryCard({ cat, onSelect }) {
  const Icon    = CATEGORY_ICON_MAP[cat.icon] || Store;
  const bgClass = COLOR_BG[cat.color]         || COLOR_BG.indigo;
  const icClass = COLOR_ICON[cat.color]       || COLOR_ICON.indigo;

  return (
    <button
      id={`select-cat-${cat.id}`}
      onClick={() => onSelect(cat)}
      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${bgClass}`}
    >
      <div className="w-9 h-9 rounded-xl bg-surface-800/50 flex items-center justify-center shrink-0">
        <Icon size={17} className={icClass} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-slate-200">{cat.name}</p>
        <p className="text-[11px] text-slate-500 truncate">{cat.description}</p>
      </div>
      <ChevronRight size={14} className="text-slate-500 shrink-0" />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-sector block (only rendered when it has ≥1 KBLI — empty ones are hidden)
// ─────────────────────────────────────────────────────────────────────────────
function SubSectorBlock({ subSector, cats, onSelect }) {
  // Empty sub-sectors are completely hidden in the modal
  if (cats.length === 0) return null;

  return (
    <div className="mb-2">
      <p className="text-[10.5px] font-medium text-slate-500 uppercase tracking-wider px-1 mb-1.5 flex items-center gap-1">
        <ChevronRight size={10} className="text-slate-500" />
        {subSector.subSectorName}
      </p>
      <div className="flex flex-col gap-1.5">
        {cats.map(cat => (
          <CategoryCard key={cat.id} cat={cat} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sector block
// - For sectors WITHOUT sub-sectors: renders KBLI cards directly.
// - For "Pertanian" (with sub-sectors): renders only non-empty sub-sector blocks.
// - If a sector has no available KBLI at all, the entire block is hidden.
// ─────────────────────────────────────────────────────────────────────────────
function SectorBlock({ sector, cats, onSelect }) {
  const SectorIcon = SECTOR_ICON_MAP[sector.icon] || Leaf;

  // If no KBLI in this sector at all, skip rendering (nothing to select)
  if (cats.length === 0) return null;

  return (
    <div className="mb-4">
      {/* Sector header — non-clickable separator */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 shrink-0">
          <SectorIcon size={13} className="text-slate-500" />
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {sector.sectorName}
          </p>
        </div>
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span className="text-[10px] text-slate-600 shrink-0">Kat. {sector.sectorLetter}</span>
      </div>

      {sector.subSectors ? (
        // Pertanian: render filled sub-sector blocks only
        <div className="pl-1">
          {sector.subSectors.map(ss => {
            const ssCats = cats.filter(c => c.subSectorId === ss.subSectorId);
            return (
              <SubSectorBlock
                key={ss.subSectorId}
                subSector={ss}
                cats={ssCats}
                onSelect={onSelect}
              />
            );
          })}
        </div>
      ) : (
        // Flat sectors: render cards directly
        <div className="flex flex-col gap-1.5">
          {cats.map(cat => (
            <CategoryCard key={cat.id} cat={cat} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main modal
// ─────────────────────────────────────────────────────────────────────────────
export default function AddRecordModal({ onConfirm, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [name, setName]   = useState('');
  const [step, setStep]   = useState(1); // 1 = pick category, 2 = name it
  const [searchQuery, setSearchQuery] = useState('');

  // Search mode: filtered flat list; null = show grouped view
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    return CATEGORIES.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setName(cat.name);
    setStep(2);
  };

  const handleCreate = () => {
    if (!selectedCategory) return;
    const defaultInputs = {};
    selectedCategory.fields.forEach(f => {
      if (f.defaultValue !== undefined) defaultInputs[f.key] = f.defaultValue;
    });
    onConfirm(selectedCategory.id, name.trim() || selectedCategory.name, defaultInputs);
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Tambah Usaha Baru">
      <div className="glass rounded-xl border border-white/[0.1] w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden scale-in mx-4">

        {/* ── Modal header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] shrink-0">
          <div>
            <h2 className="text-[15px] font-bold text-white">Tambah Usaha Baru</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {step === 1 ? 'Pilih kategori usaha' : `Kategori: ${selectedCategory?.name}`}
            </p>
          </div>
          <button
            id="btn-close-modal"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-surface-600 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Step 1: Category selection ───────────────────────────── */}
        {step === 1 && (
          <>
            {/* Search bar */}
            <div className="px-4 pt-3 pb-2 shrink-0 border-b border-white/[0.05]">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  id="modal-category-search"
                  type="text"
                  placeholder="Cari kategori usaha..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-8 py-2 text-[12px] rounded-xl bg-surface-700/80 border border-white/[0.07] text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none transition-colors"
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

            {/* Category list */}
            <div className="p-4 overflow-y-auto flex-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
              {filteredCategories !== null ? (
                /* Search mode: flat list */
                filteredCategories.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {filteredCategories.map(cat => (
                      <CategoryCard key={cat.id} cat={cat} onSelect={handleSelectCategory} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                    <Search size={24} className="text-slate-600" />
                    <p className="text-[13px] text-slate-500">Tidak ada kategori yang cocok</p>
                    <p className="text-[11px] text-slate-600">dengan &ldquo;{searchQuery}&rdquo;</p>
                  </div>
                )
              ) : (
                /* Grouped mode: Sector → (Sub-sector) → KBLI cards */
                SECTOR_TAXONOMY.map(sector => {
                  const sectorCats = CATEGORIES.filter(c => c.sectorId === sector.sectorId);
                  return (
                    <SectorBlock
                      key={sector.sectorId}
                      sector={sector}
                      cats={sectorCats}
                      onSelect={handleSelectCategory}
                    />
                  );
                })
              )}
            </div>
          </>
        )}

        {/* ── Step 2: Name the record ──────────────────────────────── */}
        {step === 2 && selectedCategory && (
          <div className="p-5 flex flex-col gap-4 overflow-y-auto flex-1">
            <div>
              <label className="block text-[12px] font-medium text-slate-300 mb-1.5">
                Nama Usaha / Catatan
              </label>
              <input
                id="input-record-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
                placeholder={selectedCategory.name}
                className="w-full rounded-xl border border-white/[0.1] bg-surface-700 text-slate-100 text-[13px] px-4 py-3 focus:border-indigo-500/50 transition-all"
                autoFocus
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Beri nama spesifik, mis: &ldquo;Warung Pak Budi&rdquo; atau &ldquo;Kios Berkah&rdquo;
              </p>
            </div>

            <div className="flex gap-3 mt-auto">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-slate-400 border border-white/[0.08] hover:text-slate-200 hover:border-white/[0.15] transition-all"
              >
                ← Kembali
              </button>
              <button
                id="btn-create-record"
                onClick={handleCreate}
                disabled={!name.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-indigo-500 hover:bg-indigo-400 text-white transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                <Plus size={15} />
                Buat Catatan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
