/**
 * InputForm.jsx
 * Reactive input form for a single UMK business category.
 * Renders the correct fields per category, validates inputs,
 * and updates localStorage in real-time.
 */
import { useState } from 'react';
import { AlertCircle, Link2, Link2Off } from 'lucide-react';
import { sanitizeNumericInput, formatRupiah } from '../utils/formatters';
import { CATEGORIES } from '../utils/calculations';

/**
 * Single numeric input field with live currency preview.
 */
function NumericField({ field, value, onChange, currencyPreview = false }) {
  const [focused, setFocused] = useState(false);

  const handleChange = (e) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    onChange(field.key, raw);
  };

  const numVal = parseFloat(value) || 0;
  const showPreview = currencyPreview && !focused && numVal > 0;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-medium text-slate-300">
        {field.label}
      </label>
      <div className="relative">
        {/* Rp prefix */}
        {currencyPreview && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-slate-400 font-mono select-none">
            Rp
          </div>
        )}
        <input
          id={`input-${field.key}`}
          type="number"
          inputMode="numeric"
          min="0"
          value={value}
          placeholder={field.placeholder || '0'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={handleChange}
          className={`w-full rounded-xl border border-white/[0.08] bg-surface-700 text-slate-100 text-[13px] font-mono
            py-2.5 pr-16 transition-all placeholder:text-slate-600
            ${currencyPreview ? 'pl-9' : 'pl-3'}
            hover:border-white/[0.12] focus:border-indigo-500/50`}
        />
        {/* Suffix */}
        {field.suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-500 font-medium select-none whitespace-nowrap">
            {field.suffix}
          </div>
        )}
      </div>
      {/* Live currency preview */}
      {showPreview && (
        <p className="text-[11px] text-indigo-300 font-mono pl-1 fade-in-up">
          ≈ {formatRupiah(numVal)}
        </p>
      )}
      {/* Negative / invalid warning */}
      {numVal < 0 && (
        <p className="flex items-center gap-1 text-[11px] text-rose-400">
          <AlertCircle size={11} />
          Nilai tidak boleh negatif
        </p>
      )}
    </div>
  );
}

/**
 * Boolean toggle field (e.g., link_tempurung checkbox).
 */
function BooleanField({ field, value, onChange, linkedRecords = [] }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[12px] font-medium text-slate-300">{field.label}</label>
      <div className="flex items-center gap-3">
        <button
          id={`toggle-${field.key}`}
          type="button"
          onClick={() => onChange(field.key, !value)}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-medium border transition-all ${
            value
              ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
              : 'bg-surface-700 border-white/[0.08] text-slate-400 hover:text-slate-200'
          }`}
        >
          {value ? <Link2 size={13} /> : <Link2Off size={13} />}
          {value ? 'Terhubung (Otomatis)' : 'Input Manual'}
        </button>
      </div>
      {value && (
        <div className="text-[11px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-2">
          Nilai Box Tempurung akan diambil dari kategori Tempurung Kelapa secara otomatis
        </div>
      )}
    </div>
  );
}

export default function InputForm({ categoryId, inputs, onInputChange, records }) {
  const category = CATEGORIES.find(c => c.id === categoryId);
  if (!category) return null;

  // Records from tempurung category (for linking in arang_tempurung)
  const tempurungRecords = records.filter(r => r.categoryId === 'tempurung');

  return (
    <div className="flex flex-col gap-4">
      {category.fields.map((field) => {
        const val = inputs[field.key] ?? (field.defaultValue !== undefined ? field.defaultValue : '');

        if (field.type === 'boolean') {
          return (
            <BooleanField
              key={field.key}
              field={field}
              value={Boolean(val)}
              onChange={onInputChange}
              linkedRecords={tempurungRecords}
            />
          );
        }

        // Standard numeric field; show currency preview for Rp values
        const isCurrencyField = ['pemasukan_harian', 'total_pendapatan_tahunan', 'pemasukan_harian'].includes(field.key);

        return (
          <NumericField
            key={field.key}
            field={field}
            value={val}
            onChange={onInputChange}
            currencyPreview={isCurrencyField}
          />
        );
      })}

      {/* Linked record selector for arang_tempurung */}
      {categoryId === 'arang_tempurung' && Boolean(inputs.link_tempurung) && (
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-medium text-slate-300">Pilih Usaha Tempurung</label>
          {tempurungRecords.length === 0 ? (
            <p className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
              Belum ada catatan Tempurung Kelapa. Buat terlebih dahulu di kategori Tempurung.
            </p>
          ) : (
            <select
              id="select-linked-record"
              value={inputs.linked_record_id || ''}
              onChange={e => onInputChange('linked_record_id', e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-surface-700 text-slate-100 text-[12px] px-3 py-2.5"
            >
              <option value="">-- Pilih catatan tempurung --</option>
              {tempurungRecords.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Category note */}
      <div className="text-[11px] text-slate-500 bg-surface-800/50 border border-white/[0.04] rounded-xl px-3 py-2.5 leading-relaxed">
        <span className="text-slate-400 font-medium">Formula: </span>
        {category.note}
      </div>
    </div>
  );
}
