/**
 * InputForm.jsx
 * Reactive input form for a single UMK business category.
 * Renders the correct fields per category, validates inputs,
 * and updates localStorage in real-time.
 */
import { useState } from 'react';
import { AlertCircle, Link2, Link2Off } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
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
function BooleanField({ field, value, onChange, _linkedRecords = [] }) {
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
            <p className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/25 rounded-lg px-3 py-2">
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

      {/* Dynamic percentage + days settings section */}
      {(() => {
        // Determine which controls to show for each category
        const hasDailyModifier = ['kios_campuran', 'kuliner_rumah_makan', 'nelayan_tangkap'].includes(categoryId);
        const hasRevenueModifier = hasDailyModifier; // same set currently

        let defaultRevPct = 10;
        let defaultExpPct = 30;
        if (categoryId === 'kios_campuran')       { defaultRevPct = 10;  defaultExpPct = 30; }
        else if (categoryId === 'kuliner_rumah_makan') { defaultRevPct = 60; defaultExpPct = 40; }
        else if (categoryId === 'tempurung' || categoryId === 'arang_tempurung') { defaultExpPct = 10; }

        // Days helpers — only relevant for daily categories
        const rawDays = inputs.custom_days;
        const displayDays = (rawDays !== undefined && rawDays !== '') ? rawDays : 30;

        return (
          <div className="mt-2 pt-4 border-t border-white/[0.06] space-y-3.5">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              Koefisien &amp; Parameter Kustom
            </p>

            {/* Revenue Modifier */}
            {hasRevenueModifier && (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="input-custom-rev-pct" className="text-[12px] font-medium text-slate-300">
                    Koefisien Pendapatan (%)
                  </label>
                  <span className="text-[11px] font-semibold font-mono text-indigo-300 bg-indigo-500/15 px-1.5 py-0.5 rounded">
                    {inputs.custom_rev_pct !== undefined && inputs.custom_rev_pct !== '' ? inputs.custom_rev_pct : defaultRevPct}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="range-custom-rev-pct"
                    type="range" min="0" max="100"
                    value={inputs.custom_rev_pct !== undefined && inputs.custom_rev_pct !== '' ? inputs.custom_rev_pct : defaultRevPct}
                    onChange={e => onInputChange('custom_rev_pct', e.target.value)}
                    className="flex-1 accent-indigo-500 h-1.5 bg-surface-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    id="input-custom-rev-pct"
                    type="number" min="0" max="100"
                    value={inputs.custom_rev_pct !== undefined ? inputs.custom_rev_pct : ''}
                    placeholder={String(defaultRevPct)}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '') { onInputChange('custom_rev_pct', ''); }
                      else { onInputChange('custom_rev_pct', String(Math.min(100, Math.max(0, parseInt(val) || 0)))); }
                    }}
                    className="w-16 rounded-lg border border-white/[0.08] bg-surface-700 text-slate-100 text-[12px] font-mono py-1 text-center"
                  />
                </div>
              </div>
            )}

            {/* Expense Modifier */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="input-custom-exp-pct" className="text-[12px] font-medium text-slate-300">
                  Persentase Pengeluaran (%)
                </label>
                <span className="text-[11px] font-semibold font-mono text-indigo-300 bg-indigo-500/15 px-1.5 py-0.5 rounded">
                  {inputs.custom_exp_pct !== undefined && inputs.custom_exp_pct !== '' ? inputs.custom_exp_pct : defaultExpPct}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="range-custom-exp-pct"
                  type="range" min="0" max="100"
                  value={inputs.custom_exp_pct !== undefined && inputs.custom_exp_pct !== '' ? inputs.custom_exp_pct : defaultExpPct}
                  onChange={e => onInputChange('custom_exp_pct', e.target.value)}
                  className="flex-1 accent-indigo-500 h-1.5 bg-surface-800 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  id="input-custom-exp-pct"
                  type="number" min="0" max="100"
                  value={inputs.custom_exp_pct !== undefined ? inputs.custom_exp_pct : ''}
                  placeholder={String(defaultExpPct)}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '') { onInputChange('custom_exp_pct', ''); }
                    else { onInputChange('custom_exp_pct', String(Math.min(100, Math.max(0, parseInt(val) || 0)))); }
                  }}
                  className="w-16 rounded-lg border border-white/[0.08] bg-surface-700 text-slate-100 text-[12px] font-mono py-1 text-center"
                />
              </div>
            </div>

            {/* ── Hari Kerja slider — only for daily-income categories ── */}
            {hasDailyModifier && (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="input-custom-days" className="text-[12px] font-medium text-slate-300">
                    Jumlah Hari Kerja / Bulan
                  </label>
                  <span className="text-[11px] font-semibold font-mono text-cyan-300 bg-cyan-500/15 px-1.5 py-0.5 rounded">
                    {displayDays} hari
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="range-custom-days"
                    type="range" min="1" max="31"
                    value={displayDays}
                    onChange={e => onInputChange('custom_days', e.target.value)}
                    className="flex-1 accent-cyan-500 h-1.5 bg-surface-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    id="input-custom-days"
                    type="number" min="1" max="31"
                    value={rawDays !== undefined ? rawDays : ''}
                    placeholder="30"
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '') { onInputChange('custom_days', ''); }
                      else { onInputChange('custom_days', String(Math.min(31, Math.max(1, parseInt(val) || 1)))); }
                    }}
                    className="w-16 rounded-lg border border-white/[0.08] bg-surface-700 text-slate-100 text-[12px] font-mono py-1 text-center"
                  />
                </div>
                {/* Tick marks for visual reference */}
                <div className="flex justify-between text-[10px] text-slate-600 px-0.5 select-none">
                  <span>1</span><span>8</span><span>15</span><span>22</span><span>31</span>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Category note — dynamic for daily-income categories */}
      <div className="text-[11px] text-slate-500 bg-surface-800/50 border border-white/[0.04] rounded-xl px-3 py-2.5 leading-relaxed">
        <span className="text-slate-400 font-medium">Formula: </span>
        {['kios_campuran', 'kuliner_rumah_makan', 'nelayan_tangkap'].includes(categoryId)
          ? (() => {
              const days = (inputs.custom_days !== undefined && inputs.custom_days !== '') ? inputs.custom_days : 30;
              const revPct = (inputs.custom_rev_pct !== undefined && inputs.custom_rev_pct !== '')
                ? inputs.custom_rev_pct
                : (categoryId === 'kuliner_rumah_makan' ? 60 : 10);
              const expPct = (inputs.custom_exp_pct !== undefined && inputs.custom_exp_pct !== '')
                ? inputs.custom_exp_pct
                : (categoryId === 'kuliner_rumah_makan' ? 40 : 30);
              return `Pemasukan × ${days} Hari × 12 Bulan × ${revPct}% koefisien · Pengeluaran ${expPct}%`;
            })()
          : category.note
        }
      </div>
    </div>
  );
}
