/**
 * RecordCard.jsx
 * A single business record card with input form and live calculation results.
 * Supports inline editing, delete, and duplicate actions.
 */
import { useState, useMemo } from 'react';
import {
  Trash2, Copy, ChevronDown, ChevronUp,
  Edit3, Check, X, Clock, Store
} from 'lucide-react';
import InputForm from './InputForm';
import ResultCard from './ResultCard';
import { calculateRecord } from '../utils/calculations';
import { CATEGORIES } from '../utils/calculations';
import { formatDate } from '../utils/formatters';

const ICON_COLORS = {
  indigo:  'from-indigo-600  to-indigo-500',
  amber:   'from-amber-600   to-amber-500',
  emerald: 'from-emerald-600 to-emerald-500',
  cyan:    'from-cyan-600    to-cyan-500',
  orange:  'from-orange-600  to-orange-500',
  brown:   'from-amber-800   to-amber-700',
  rose:    'from-rose-600    to-rose-500',
  blue:    'from-blue-600    to-blue-500'
};

export default function RecordCard({ record, allRecords, onUpdate, onDelete, onDuplicate }) {
  const [expanded, setExpanded] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(record.name);

  const category = CATEGORIES.find(c => c.id === record.categoryId);
  const gradClass = ICON_COLORS[category?.color] || ICON_COLORS.indigo;

  // Real-time calculation — memoize for performance
  const result = useMemo(
    () => calculateRecord(record, allRecords),
    [record, allRecords]
  );

  const hasDualMode = Boolean(category?.hasDualMode);

  // ── Handlers ────────────────────────────────────────────────

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

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="record-card glass rounded-2xl border border-white/[0.07] overflow-hidden fade-in-up">

      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">

        {/* Category icon */}
        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${gradClass} flex items-center justify-center shrink-0 shadow-lg`}>
          <Store size={14} className="text-white" />
        </div>

        {/* Name (editable) */}
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
              <button onClick={saveName} className="text-emerald-400 hover:text-emerald-300">
                <Check size={14} />
              </button>
              <button onClick={cancelName} className="text-slate-500 hover:text-slate-300">
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-semibold text-slate-100 truncate">{record.name}</p>
              <button
                id={`btn-rename-${record.id}`}
                onClick={() => { setDraftName(record.name); setEditingName(true); }}
                className="text-slate-600 hover:text-slate-300 transition-colors shrink-0"
              >
                <Edit3 size={11} />
              </button>
            </div>
          )}
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <div className="flex items-center gap-1 shrink-0">
              <Clock size={9} className="text-slate-600" />
              <p className="text-[10px] text-slate-600">{formatDate(record.updatedAt)}</p>
            </div>
            {result.bps && result.bps.totalPekerja > 0 && (
              <span
                className="tooltip text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center gap-1 select-none cursor-pointer"
                data-tip={`Pekerja L: ${result.bps.pekerjaL} | P: ${result.bps.pekerjaP}`}
              >
                👥 {result.bps.totalPekerja} Pekerja
              </span>
            )}
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

      {/* Card body — input + result */}
      {expanded && (
        <div className="p-4 grid md:grid-cols-2 gap-4">
          {/* Input form (left) */}
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Input Data Usaha</p>
            <InputForm
              categoryId={record.categoryId}
              inputs={record.inputs}
              onInputChange={handleInputChange}
              records={allRecords}
            />
          </div>

          {/* Results (right) */}
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Estimasi Pendapatan</p>
            <ResultCard result={result} hasDualMode={hasDualMode} />
          </div>
        </div>
      )}
    </div>
  );
}
