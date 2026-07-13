/**
 * EntryRow.jsx — Compact single-row design with separated columns.
 * Matches 10-column structure:
 * No | Nama Target | Target | Submitted Jumlah | Submitted % | Approved Jumlah | Approved % | Total % Progress | Draf | Aksi
 */
import { useState, useRef, useCallback } from 'react';
import { Pencil, Trash2, RotateCcw } from 'lucide-react';
import { calcEntry, getStatusTier, getStatusLabel, getTierClasses } from '../utils/dataUtils';

const INC_STEPS = [1, 5, 10];

/* ── Inline quantity editor/display with sub-buttons ── */
function QuantitySubCell({ fieldKey, value, onIncrement, onSetValue, cellId, incColor = 'primary' }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState('');
  const inputRef  = useRef(null);

  function openEdit() {
    setDraft(String(value));
    setEditing(true);
    setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 30);
  }
  function commit() {
    const n = parseInt(draft, 10);
    if (!isNaN(n) && n >= 0) onSetValue(fieldKey, n);
    setEditing(false);
  }
  function handleKey(e) {
    if (e.key === 'Enter')  commit();
    if (e.key === 'Escape') setEditing(false);
  }
  function handleInc(step) {
    onIncrement(fieldKey, step);
    const el = document.getElementById(cellId);
    if (el) { el.classList.remove('count-up'); void el.offsetWidth; el.classList.add('count-up'); }
  }

  const btnCls = incColor === 'violet'
    ? 'bg-violet-700/60 hover:bg-violet-500 text-white'
    : incColor === 'amber'
    ? 'bg-amber-700/60 hover:bg-amber-600 text-white'
    : 'bg-primary-700/60 hover:bg-primary-500 text-white';

  return (
    <div className="flex flex-col items-center gap-0.5 justify-center">
      {editing ? (
        <input
          ref={inputRef}
          type="number"
          min={0}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKey}
          className="w-14 text-center px-1 py-0.5 rounded bg-surface-600 border border-primary-500/60
                     text-white text-xs font-mono focus:outline-none"
        />
      ) : (
        <button
          id={cellId}
          onClick={openEdit}
          title="Klik untuk edit manual"
          className="text-xs font-bold text-white font-mono hover:text-primary-300 transition-colors cursor-text count-up leading-none"
        >
          {Number(value).toLocaleString('id-ID')}
        </button>
      )}

      {/* Mini buttons */}
      <div className="flex gap-0.5 mt-0.5">
        {INC_STEPS.map(step => (
          <button
            key={step}
            onClick={() => handleInc(step)}
            className={`text-[9px] px-1 py-0.5 rounded font-semibold transition-colors leading-none ${btnCls}`}
          >
            +{step}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function EntryRow({ entry, index, onIncrement, onSetValue, onEdit, onDelete, onReset }) {
  const rowRef = useRef(null);

  const { pctSubmitted, pctApproved, totalPct } = calcEntry(entry);
  const tier  = getStatusTier(totalPct);
  const label = getStatusLabel(totalPct);
  const cls   = getTierClasses(tier);

  const triggerFlash = useCallback(() => {
    if (!rowRef.current) return;
    rowRef.current.classList.add('row-highlight');
    setTimeout(() => rowRef.current?.classList.remove('row-highlight'), 1100);
  }, []);

  function handleInc(field, step) { triggerFlash(); onIncrement(entry.id, field, step); }
  function handleSet(field, val)  { triggerFlash(); onSetValue(entry.id, field, val);  }

  const barW = Math.min(totalPct / 2, 100);
  const tdBase = 'px-2 py-1.5 border border-slate-700/50 align-middle text-center';

  return (
    <tr
      ref={rowRef}
      className={`hover:bg-white/[0.02] transition-colors group border-l-[3px] ${cls.rowAccent}`}
    >
      {/* 1. NO */}
      <td className={`${tdBase} w-10 text-xs text-slate-500 font-mono`}>
        {index + 1}
      </td>

      {/* 2. NAMA TARGET / KEGIATAN */}
      <td className={`${tdBase} text-left min-w-[150px]`}>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-white leading-snug">{entry.name}</span>
          <span className={`badge w-fit text-[8px] px-1 py-0.2 ${cls.badge}`}>{label}</span>
        </div>
      </td>

      {/* 3. TARGET (C) */}
      <td className={`${tdBase} w-20`}>
        <span className="text-xs font-semibold text-slate-300 font-mono">
          {Number(entry.target).toLocaleString('id-ID')}
        </span>
      </td>

      {/* 4. SUBMITTED - Jumlah (D) */}
      <td className={`${tdBase} w-24`}>
        <QuantitySubCell
          fieldKey="progres1"
          value={entry.progres1}
          onIncrement={handleInc}
          onSetValue={handleSet}
          cellId={`sub-val-${entry.id}`}
          incColor="primary"
        />
      </td>

      {/* 5. SUBMITTED - % (E) */}
      <td className={`${tdBase} w-20 text-xs text-slate-300 font-mono`}>
        {pctSubmitted.toFixed(2)}%
      </td>

      {/* 6. APPROVED - Jumlah (F) */}
      <td className={`${tdBase} w-24`}>
        <QuantitySubCell
          fieldKey="progres2"
          value={entry.progres2}
          onIncrement={handleInc}
          onSetValue={handleSet}
          cellId={`app-val-${entry.id}`}
          incColor="violet"
        />
      </td>

      {/* 7. APPROVED - % (G) */}
      <td className={`${tdBase} w-20 text-xs text-slate-300 font-mono`}>
        {pctApproved.toFixed(2)}%
      </td>

      {/* 8. TOTAL % PROGRESS (H = E + G) */}
      <td className={`${tdBase} w-28`}>
        <div className="flex flex-col items-center gap-1">
          <span className={`text-xs font-bold font-mono ${cls.text}`}>
            {totalPct.toFixed(2)}%
          </span>
          <div className="w-full max-w-[70px] h-1.5 bg-surface-600 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full progress-fill ${cls.bar}`}
              style={{ width: `${barW}%` }}
            />
          </div>
        </div>
      </td>

      {/* 9. DRAF (I) */}
      <td className={`${tdBase} w-24`}>
        <QuantitySubCell
          fieldKey="draft"
          value={entry.draft}
          onIncrement={handleInc}
          onSetValue={handleSet}
          cellId={`drf-val-${entry.id}`}
          incColor="amber"
        />
      </td>

      {/* 10. AKSI */}
      <td className="px-1 py-1.5 text-center align-middle w-20 border border-slate-700/50">
        <div className="flex gap-0.5 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            id={`edit-${entry.id}`}
            onClick={() => onEdit(entry)}
            className="p-1 rounded text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
            title="Edit"
          >
            <Pencil size={12} />
          </button>
          <button
            id={`reset-${entry.id}`}
            onClick={() => onReset(entry.id)}
            className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
            title="Reset"
          >
            <RotateCcw size={12} />
          </button>
          <button
            id={`del-${entry.id}`}
            onClick={() => onDelete(entry)}
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Hapus"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </td>
    </tr>
  );
}
