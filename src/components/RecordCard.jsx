/**
 * RecordCard.jsx
 * A single business record card with input form and live calculation results.
 * Supports inline editing, delete, and duplicate actions.
 *
 * Addendum #4 additions:
 *   • Category badge (sub-sector/sector label) in card header for transparency.
 *   • "Jenis Kalkulasi" dropdown for multi-formula categories (Perkebunan, Perdagangan, Industri).
 *     Switching formula changes record.categoryId → triggers re-calculation instantly.
 *     Record name is NOT reset when formula changes.
 *   • Generic template label ("Menggunakan kalkulasi generik...") for generik_harian records.
 */
import { useState, useMemo } from 'react';
import {
  Trash2, Copy, ChevronDown, ChevronUp,
  Edit3, Check, X, Clock, Store, Info,
} from 'lucide-react';
import InputForm from './InputForm';
import ResultCard from './ResultCard';
import { calculateRecord, CATEGORIES, FORMULA_GROUPS } from '../utils/calculations';
import { SECTOR_MAP, SUB_SECTOR_MAP } from '../utils/sectorTaxonomy';
import { formatDate } from '../utils/formatters';

const ICON_COLORS = {
  indigo:  'from-indigo-600  to-indigo-500',
  amber:   'from-amber-600   to-amber-500',
  emerald: 'from-emerald-600 to-emerald-500',
  cyan:    'from-cyan-600    to-cyan-500',
  orange:  'from-orange-600  to-orange-500',
  brown:   'from-amber-800   to-amber-700',
  rose:    'from-rose-600    to-rose-500',
  blue:    'from-blue-600    to-blue-500',
  slate:   'from-slate-600   to-slate-500',   // Generic template
};

// ── Helper: resolve badge label for a record ─────────────────────────────────
function resolveBadge(record) {
  const groupKey = record.inputs?._groupKey;

  // 1. Try sub-sector label from _groupKey
  if (groupKey && SUB_SECTOR_MAP.has(groupKey)) {
    const ss = SUB_SECTOR_MAP.get(groupKey);
    return { label: ss.subSectorName, kind: 'subsector' };
  }

  // 2. Try sector label from _groupKey
  if (groupKey && SECTOR_MAP.has(groupKey)) {
    const sec = SECTOR_MAP.get(groupKey);
    return { label: sec.sectorName, kind: 'sector' };
  }

  // 3. Fall back to category's own sectorId/subSectorId metadata
  const cat = CATEGORIES.find(c => c.id === record.categoryId);
  if (cat?.subSectorId && SUB_SECTOR_MAP.has(cat.subSectorId)) {
    return { label: SUB_SECTOR_MAP.get(cat.subSectorId).subSectorName, kind: 'subsector' };
  }
  if (cat?.sectorId && SECTOR_MAP.has(cat.sectorId)) {
    return { label: SECTOR_MAP.get(cat.sectorId).sectorName, kind: 'sector' };
  }

  return null;
}

// ── Helper: resolve multi-formula dropdown options ────────────────────────────
function resolveFormulaOptions(record) {
  const groupKey = record.inputs?._groupKey;
  if (!groupKey) return null;

  const formulas = FORMULA_GROUPS[groupKey];
  // Show dropdown only if group has >1 non-generic formula options
  if (!formulas || formulas.length <= 1) return null;
  if (formulas.every(id => id === 'generik_harian')) return null;

  return formulas.map(id => {
    const cat = CATEGORIES.find(c => c.id === id);
    return {
      value: id,
      label: cat ? cat.name.replace(/^KBLI \d+ - /, '') : id,
      fullName: cat?.name || id,
    };
  });
}

// ── Main component ────────────────────────────────────────────────────────────
export default function RecordCard({ record, allRecords, onUpdate, onDelete, onDuplicate }) {
  const [expanded,    setExpanded]    = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [draftName,   setDraftName]   = useState(record.name);

  const category    = CATEGORIES.find(c => c.id === record.categoryId);
  const gradClass   = ICON_COLORS[category?.color] || ICON_COLORS.indigo;
  const hasDualMode = Boolean(category?.hasDualMode);
  const isGeneric   = record.categoryId === 'generik_harian';

  const badge          = useMemo(() => resolveBadge(record),          [record]);
  const formulaOptions = useMemo(() => resolveFormulaOptions(record), [record]);

  // Real-time calculation
  const result = useMemo(
    () => calculateRecord(record, allRecords),
    [record, allRecords]
  );

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleInputChange = (field, value) => {
    onUpdate(record.id, { inputs: { ...record.inputs, [field]: value } });
  };

  const saveName = () => {
    const trimmed = draftName.trim();
    if (trimmed) onUpdate(record.id, { name: trimmed });
    setEditingName(false);
  };

  const cancelName = () => {
    setDraftName(record.name);
    setEditingName(false);
  };

  /** Switch formula (categoryId) — keeps name & other inputs, resets only formula-specific keys */
  const handleFormulaChange = (newCategoryId) => {
    if (newCategoryId === record.categoryId) return;
    const newCat = CATEGORIES.find(c => c.id === newCategoryId);
    if (!newCat) return;

    // Build fresh inputs for the new formula (preserve _groupKey + BPS additive fields)
    const bpsKeys = [
      'pekerja_l', 'pekerja_p', 'tahun_mulai', 'pendapatan_lainnya',
      'online_pct', 'aset_tanah_bangunan', 'aset_lainnya',
      'use_detail_pengeluaran', 'biaya_upah', 'biaya_upah_freq',
      'biaya_produksi', 'biaya_produksi_freq', 'biaya_hpp', 'biaya_hpp_freq',
      'biaya_operasional', 'biaya_operasional_freq',
      'biaya_non_operasional', 'biaya_non_operasional_freq',
      'custom_rev_pct', 'custom_exp_pct', 'custom_days',
      '_groupKey',
    ];

    const preserved = {};
    bpsKeys.forEach(k => {
      if (record.inputs[k] !== undefined) preserved[k] = record.inputs[k];
    });

    const newDefaults = {};
    newCat.fields.forEach(f => {
      if (f.defaultValue !== undefined) newDefaults[f.key] = f.defaultValue;
    });

    onUpdate(record.id, {
      categoryId: newCategoryId,
      inputs: { ...newDefaults, ...preserved },
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="record-card glass rounded-2xl border border-white/[0.07] overflow-hidden fade-in-up">

      {/* ── Card header ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">

        {/* Category icon */}
        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${gradClass} flex items-center justify-center shrink-0 shadow-lg`}>
          <Store size={14} className="text-white" />
        </div>

        {/* Name (editable) + badges */}
        <div className="flex-1 min-w-0">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                id={`name-input-${record.id}`}
                type="text"
                value={draftName}
                onChange={e => setDraftName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') cancelName(); }}
                className="flex-1 text-[13px] font-semibold bg-surface-700 border border-indigo-500/40 rounded-lg px-2 py-1 text-slate-100 outline-none"
                autoFocus
              />
              <button onClick={saveName}   className="text-emerald-400 hover:text-emerald-300"><Check size={14} /></button>
              <button onClick={cancelName} className="text-slate-500  hover:text-slate-300"><X size={14} /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-semibold text-slate-100 truncate">{record.name}</p>
              <button
                id={`btn-rename-${record.id}`}
                onClick={() => { setDraftName(record.name); setEditingName(true); }}
                className="text-slate-600 hover:text-slate-300 transition-colors shrink-0"
                aria-label="Ubah nama"
              >
                <Edit3 size={11} />
              </button>
            </div>
          )}

          {/* Sub-row: timestamp + badges */}
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {/* Timestamp */}
            <div className="flex items-center gap-1 shrink-0">
              <Clock size={9} className="text-slate-600" />
              <p className="text-[10px] text-slate-600">{formatDate(record.updatedAt)}</p>
            </div>

            {/* Category/sub-sector badge (Addendum #4) */}
            {badge && (
              <span
                className="tooltip text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-500/10 border border-slate-500/20 text-slate-400 flex items-center gap-0.5 select-none cursor-default"
                data-tip={category ? `Formula: ${category.name}` : 'Kalkulasi generik'}
              >
                {badge.label}
              </span>
            )}

            {/* Generic notice badge */}
            {isGeneric && (
              <span className="tooltip text-[9.5px] font-medium px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-0.5 select-none cursor-default"
                data-tip="Menggunakan kalkulasi generik — sesuaikan koefisien sesuai jenis usaha Anda">
                <Info size={9} />
                generik
              </span>
            )}

            {/* Workers badge */}
            {result.bps && result.bps.totalPekerja > 0 && (
              <span
                className="tooltip text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center gap-1 select-none cursor-pointer"
                data-tip={`Pekerja L: ${result.bps.pekerjaL} | P: ${result.bps.pekerjaP}`}
              >
                👥 {result.bps.totalPekerja} Pekerja
              </span>
            )}

            {/* Year badge */}
            {result.bps && result.bps.tahunMulai && (
              <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center gap-1 select-none">
                📅 Sejak {result.bps.tahunMulai}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            id={`btn-duplicate-${record.id}`}
            onClick={() => onDuplicate(record.id)}
            className="tooltip w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
            data-tip="Duplikasi"
          >
            <Copy size={13} />
          </button>
          <button
            id={`btn-delete-${record.id}`}
            onClick={() => onDelete(record.id)}
            className="tooltip w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
            data-tip="Hapus"
          >
            <Trash2 size={13} />
          </button>
          <button
            id={`btn-toggle-${record.id}`}
            onClick={() => setExpanded(v => !v)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-200 hover:bg-surface-600 transition-all"
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* ── "Jenis Kalkulasi" dropdown (multi-formula categories) ─────────── */}
      {expanded && formulaOptions && (
        <div className="px-4 py-2.5 border-b border-white/[0.04] flex items-center gap-2 bg-surface-800/20">
          <span className="text-[11px] font-medium text-slate-500 shrink-0">Jenis Kalkulasi:</span>
          <select
            id={`select-formula-${record.id}`}
            value={record.categoryId}
            onChange={e => handleFormulaChange(e.target.value)}
            className="flex-1 rounded-lg border border-white/[0.08] bg-surface-700 text-slate-200 text-[11.5px] px-2.5 py-1.5 outline-none focus:border-indigo-500/40 transition-colors cursor-pointer"
          >
            {formulaOptions.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-surface-800">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ── Generic template notice ───────────────────────────────────────── */}
      {expanded && isGeneric && (
        <div className="px-4 py-2 border-b border-white/[0.04] bg-amber-500/5">
          <p className="text-[10.5px] text-amber-400/80 flex items-center gap-1.5">
            <Info size={11} className="shrink-0" />
            Menggunakan kalkulasi generik — sesuaikan koefisien sesuai jenis usaha Anda
          </p>
        </div>
      )}

      {/* ── Card body ─────────────────────────────────────────────────────── */}
      {expanded && (
        <div className="p-4 grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Input Data Usaha</p>
            <InputForm
              categoryId={record.categoryId}
              inputs={record.inputs}
              onInputChange={handleInputChange}
              records={allRecords}
            />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Estimasi Pendapatan</p>
            <ResultCard result={result} hasDualMode={hasDualMode} />
          </div>
        </div>
      )}
    </div>
  );
}
