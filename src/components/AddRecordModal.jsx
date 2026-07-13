/**
 * AddRecordModal.jsx
 * Modal for creating a new business record.
 * Allows selecting a category and naming the business instance.
 */
import { useState } from 'react';
import {
  X, Plus, Store, UtensilsCrossed, Sprout, TreePalm,
  Package, Gem, Flame, Fish, ChevronRight
} from 'lucide-react';
import { CATEGORIES } from '../utils/calculations';

const ICON_MAP = {
  Store, UtensilsCrossed, Sprout, TreePalm,
  Package, Gem, Flame, Fish,
  Shell: Gem
};

const COLOR_BG = {
  indigo:  'bg-indigo-500/15 border-indigo-500/25 hover:bg-indigo-500/25',
  amber:   'bg-amber-500/15  border-amber-500/25  hover:bg-amber-500/25',
  emerald: 'bg-emerald-500/15 border-emerald-500/25 hover:bg-emerald-500/25',
  cyan:    'bg-cyan-500/15   border-cyan-500/25   hover:bg-cyan-500/25',
  orange:  'bg-orange-500/15 border-orange-500/25 hover:bg-orange-500/25',
  brown:   'bg-amber-800/15  border-amber-800/25  hover:bg-amber-800/25',
  rose:    'bg-rose-500/15   border-rose-500/25   hover:bg-rose-500/25',
  blue:    'bg-blue-500/15   border-blue-500/25   hover:bg-blue-500/25'
};

const COLOR_ICON = {
  indigo:  'text-indigo-400', amber: 'text-amber-400', emerald: 'text-emerald-400',
  cyan:    'text-cyan-400',   orange: 'text-orange-400', brown: 'text-amber-700',
  rose:    'text-rose-400',   blue:  'text-blue-400'
};

export default function AddRecordModal({ onConfirm, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [name, setName] = useState('');
  const [step, setStep] = useState(1); // 1: pick category, 2: name it

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setName(cat.name); // pre-fill with category name
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

        {/* Header (sticky at the top) */}
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

        {/* Step 1: Category selection (scrollable) */}
        {step === 1 && (
          <div className="p-4 grid grid-cols-1 gap-2 overflow-y-auto flex-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
            {CATEGORIES.map((cat) => {
              const Icon = ICON_MAP[cat.icon] || Store;
              const bgClass = COLOR_BG[cat.color] || COLOR_BG.indigo;
              const iconClass = COLOR_ICON[cat.color] || COLOR_ICON.indigo;

              return (
                <button
                  key={cat.id}
                  id={`select-cat-${cat.id}`}
                  onClick={() => handleSelectCategory(cat)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${bgClass}`}
                >
                  <div className={`w-9 h-9 rounded-xl bg-surface-800/50 flex items-center justify-center shrink-0`}>
                    <Icon size={17} className={iconClass} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-200">{cat.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{cat.description}</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-500 shrink-0" />
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2: Name the record */}
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
                Beri nama spesifik, mis: "Warung Pak Budi" atau "Kios Berkah"
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
