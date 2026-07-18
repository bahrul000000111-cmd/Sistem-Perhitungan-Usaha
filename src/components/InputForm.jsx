/**
 * InputForm.jsx
 * Reactive input form for a UMK business category.
 * Renders standardized fields per category, validates inputs,
 * and displays an optional BPS SE2026-L data section.
 */
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { AlertCircle, Link2, Link2Off, Info, ChevronDown, ChevronUp, Users, Calendar, DollarSign, Globe, Building2, X } from 'lucide-react';
import { formatRupiah, formatNumberWithDots } from '../utils/formatters';
import { CATEGORIES, getConversionFormula, convertToAnnual, convertToDaily, convertHarvestToAnnual, calculateRecord } from '../utils/calculations';
import { KOEFISIEN_GUIDE_DATA } from '../utils/koefisienGuideData';


/**
 * HarvestPeriodSelector — Addendum #9
 * Reusable component that pairs a CurrencyInput with a harvest-period dropdown (1–12 months).
 * Converts per-period input to annual basis via convertHarvestToAnnual() and shows a live hint.
 * Default period = 12 months for full backward compatibility.
 *
 * Props:
 *   id              - HTML id for the input
 *   label           - Field label text
 *   value           - Raw per-period value (string)
 *   onValueChange   - Called with new raw value string when input changes
 *   periodValue     - Current period in months (number or string, default 12)
 *   onPeriodChange  - Called with new period (string) when dropdown changes
 *   placeholder     - Input placeholder
 */
function HarvestPeriodSelector({ id, label, value, onValueChange, periodValue, onPeriodChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  const rawNum    = parseFloat(value) || 0;
  const period    = Math.max(1, Math.min(12, parseInt(periodValue) || 12));
  const annualVal = convertHarvestToAnnual(rawNum, period);
  const factor    = 12 / period;

  // Only show conversion hint when period != 12 and there is a non-zero value
  const showHint = period !== 12 && rawNum > 0;

  // Generate hint text: = Rp X /tahun (Y × 12 ÷ N bulan)
  const hintText = showHint
    ? `= ${formatRupiah(annualVal)} /tahun (${formatRupiah(rawNum)} × 12 ÷ ${period} bulan)`
    : null;

  const PERIOD_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[12.5px] font-semibold text-slate-300">
        {label}
      </label>
      <div className="flex gap-2 items-stretch">
        {/* Value input */}
        <CurrencyInput
          id={id}
          value={value}
          onChange={onValueChange}
          placeholder={placeholder || '12000000'}
          hideLabel={true}
          className="relative flex-1"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {/* Live Rp preview when not focused and period=12 (no extra hint needed) */}
        {!focused && !showHint && rawNum > 0 && (
          <div className="absolute left-3 -bottom-5 text-[10.5px] text-indigo-300/70 font-mono pointer-events-none select-none">
            ≈ {formatRupiah(rawNum)}
          </div>
        )}


        {/* Period dropdown */}
        <div className="relative shrink-0">
          <select
            id={`${id}-period`}
            value={String(period)}
            onChange={e => onPeriodChange(e.target.value)}
            className="h-full rounded-xl border border-white/[0.08] bg-surface-700 text-slate-200 text-[11.5px] font-semibold pl-2.5 pr-7 py-2.5 outline-none focus:border-indigo-500/50 appearance-none cursor-pointer min-w-[112px]"
          >
            {PERIOD_OPTIONS.map(n => (
              <option key={n} value={String(n)}>
                per {n} Bulan
              </option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Conversion hint row — shown when period != 12 and value > 0 */}
      {hintText && (
        <div className="flex items-center gap-1.5 text-[10.5px] text-emerald-400/80 bg-emerald-500/6 border border-emerald-500/15 rounded-lg px-2.5 py-1.5 font-mono leading-relaxed fade-in-up">
          <span className="shrink-0">🔄</span>
          <span>{hintText}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Reusable currency input with live Rp preview, tooltip support,
 * and real-time thousand separator (dots) formatting with cursor preservation.
 */
function CurrencyInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  tooltip,
  readOnly,
  hideLabel,
  className,
  onFocus,
  onBlur
}) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const cursorDigitsRef = useRef(0);
  const lastKeyRef = useRef('');

  // Clean value for number parsing
  const cleanVal = String(value ?? '').replace(/\D/g, '');
  const numVal = parseFloat(cleanVal) || 0;
  const showPreview = !focused && numVal > 0 && !hideLabel;

  const handleKeyDown = (e) => {
    lastKeyRef.current = e.key;
  };

  const handleInputChange = (e) => {
    if (readOnly) return;
    const input = e.target;
    const val = input.value;
    const prevDisplayed = formatNumberWithDots(value);
    const selStart = input.selectionStart;

    let raw = val.replace(/\D/g, '');
    const prevRaw = String(value ?? '').replace(/\D/g, '');

    // Check if user deleted a dot
    if (val.length < prevDisplayed.length && raw.length === prevRaw.length) {
      let digitsToLeft = 0;
      for (let i = 0; i < selStart; i++) {
        if (/\d/.test(prevDisplayed[i])) {
          digitsToLeft++;
        }
      }

      if (lastKeyRef.current === 'Delete') {
        if (digitsToLeft < raw.length) {
          raw = raw.slice(0, digitsToLeft) + raw.slice(digitsToLeft + 1);
          cursorDigitsRef.current = digitsToLeft;
        } else {
          cursorDigitsRef.current = digitsToLeft;
        }
      } else {
        if (digitsToLeft > 0) {
          raw = raw.slice(0, digitsToLeft - 1) + raw.slice(digitsToLeft);
          cursorDigitsRef.current = digitsToLeft - 1;
        } else {
          cursorDigitsRef.current = 0;
        }
      }
    } else {
      let digitsToLeft = 0;
      for (let i = 0; i < selStart; i++) {
        if (/\d/.test(val[i])) {
          digitsToLeft++;
        }
      }
      cursorDigitsRef.current = digitsToLeft;
    }

    onChange(raw);
  };

  useLayoutEffect(() => {
    if (!inputRef.current || document.activeElement !== inputRef.current) return;
    const input = inputRef.current;
    const val = input.value;

    let digitsCount = 0;
    let newSel = 0;
    for (let i = 0; i <= val.length; i++) {
      newSel = i;
      if (digitsCount === cursorDigitsRef.current) {
        break;
      }
      if (/\d/.test(val[i])) {
        digitsCount++;
      }
    }
    input.setSelectionRange(newSel, newSel);
  }, [value]);

  const displayedText = formatNumberWithDots(value);

  return (
    <div className={className || "flex flex-col gap-1.5"}>
      {!hideLabel && (
        <div className="flex items-center gap-1.5">
          <label htmlFor={id} className="text-[12.5px] font-semibold text-slate-300">
            {label}
          </label>
          {tooltip && (
            <div className="tooltip cursor-pointer text-slate-500 hover:text-slate-300" data-tip={tooltip}>
              <Info size={13} />
            </div>
          )}
        </div>
      )}

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[12.5px] text-slate-400 font-mono select-none">
          Rp
        </div>
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="numeric"
          value={displayedText}
          placeholder={placeholder || '0'}
          readOnly={readOnly}
          onFocus={(e) => {
            setFocused(true);
            if (onFocus) onFocus(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            if (onBlur) onBlur(e);
          }}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          className={`w-full rounded-xl border text-[13px] font-mono py-2.5 pl-9 pr-3 transition-all placeholder:text-slate-600 outline-none ${
            readOnly
              ? 'border-emerald-500/25 bg-emerald-500/6 text-emerald-200 cursor-default select-none'
              : 'border-white/[0.08] bg-surface-700 text-slate-100 hover:border-white/[0.12] focus:border-indigo-500/50'
          }`}
        />
      </div>
      {showPreview && (
        <p className="text-[11px] text-indigo-300 font-mono pl-1 fade-in-up">
          ≈ {formatRupiah(numVal)}
        </p>
      )}
    </div>
  );
}


/**
 * Reusable unit input for raw units (kg, pohon, etc.).
 */
function UnitInput({ id, label, value, onChange, placeholder, suffix, tooltip }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <label htmlFor={id} className="text-[12.5px] font-semibold text-slate-300">
          {label}
        </label>
        {tooltip && (
          <div className="tooltip cursor-pointer text-slate-500 hover:text-slate-300" data-tip={tooltip}>
            <Info size={13} />
          </div>
        )}
      </div>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min="0"
          value={value}
          placeholder={placeholder || '0'}
          onChange={e => {
            const raw = e.target.value.replace(/[^0-9.]/g, '');
            onChange(raw);
          }}
          className="w-full rounded-xl border border-white/[0.08] bg-surface-700 text-slate-100 text-[13px] font-mono py-2.5 pl-3 pr-16 transition-all placeholder:text-slate-600 hover:border-white/[0.12] focus:border-indigo-500/50 outline-none"
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11.5px] text-slate-500 font-semibold select-none whitespace-nowrap font-sans">
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Reusable percentage modifier slider linked with number input.
 */
function PercentSlider({ id, label, value, onChange, defaultValue, tooltip, onOpenGuide }) {
  const displayValue = (value !== undefined && value !== '') ? value : defaultValue;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5 flex-wrap">
          <label htmlFor={id} className="text-[12px] font-medium text-slate-300">
            {label}
          </label>
          {tooltip && (
            <div className="tooltip cursor-pointer text-slate-500 hover:text-slate-300 animate-fade-in" data-tip={tooltip}>
              <Info size={13} />
            </div>
          )}
          {onOpenGuide && (
            <button
              id={`btn-guide-${id}`}
              type="button"
              onClick={onOpenGuide}
              className="flex items-center gap-0.5 text-[9.5px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-1.5 py-0.5 rounded transition-all cursor-pointer select-none"
              title="Lihat Panduan Koefisien Donggala"
            >
              <span>💡 Panduan</span>
            </button>
          )}
        </div>
        <span className="text-[11px] font-semibold font-mono text-indigo-300 bg-indigo-500/15 px-1.5 py-0.5 rounded">
          {displayValue}%
        </span>
      </div>
      <div className="flex items-center gap-3">
        <input
          id={`range-${id}`}
          type="range" min="0" max="100"
          value={displayValue}
          onChange={e => onChange(e.target.value)}
          className="flex-1 accent-indigo-500 h-1.5 bg-surface-800 rounded-lg appearance-none cursor-pointer"
        />
        <input
          id={id}
          type="number" min="0" max="100"
          value={value !== undefined ? value : ''}
          placeholder={String(defaultValue)}
          onChange={e => {
            const val = e.target.value;
            if (val === '') { onChange(''); }
            else { onChange(String(Math.min(100, Math.max(0, parseInt(val) || 0)))); }
          }}
          className="w-16 rounded-lg border border-white/[0.08] bg-surface-700 text-slate-100 text-[12px] font-mono py-1 text-center"
        />
      </div>
    </div>
  );
}

/**
 * Boolean toggle field.
 */
function BooleanField({ field, value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[12px] font-semibold text-slate-300">{field.label}</label>
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
        <div className="text-[11px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-2 leading-relaxed">
          Nilai Box Tempurung akan diambil dari kategori Tempurung Kelapa secara otomatis
        </div>
      )}
    </div>
  );
}

/**
 * ExpenseField — CurrencyInput with a frequency selector (Harian/Mingguan/Bulanan/Tahunan).
 * Shows a real-time helper text "= Rp X /tahun (rumus)" whenever frequency ≠ 'tahunan'.
 * Backward compatible: missing frequency key defaults to 'tahunan'.
 */
const FREQ_OPTIONS = [
  { key: 'tahunan',  label: 'per Tahun', short: '/thn' },
  { key: 'bulanan',  label: 'per Bulan', short: '/bln' },
  { key: 'mingguan', label: 'per Minggu', short: '/mgg' },
  { key: 'harian',   label: 'per Hari',  short: '/hr'  }
];

// Frequency options for income-side (Addendum #7 Opsi B) — same keys, different order
// (harian first since that is the natural default for Opsi B)
const INCOME_FREQ_OPTIONS = [
  { key: 'harian',   label: 'per Hari',   short: '/hr'  },
  { key: 'mingguan', label: 'per Minggu', short: '/mgg' },
  { key: 'bulanan',  label: 'per Bulan',  short: '/bln' },
  { key: 'tahunan',  label: 'per Tahun',  short: '/thn' },
];

/**
 * IncomeMethodSelector — generic segmented control for choosing between two income-input methods.
 * Reusable via props config; currently wired for nelayan_tangkap but can be used in any M1 category.
 *
 * Props:
 *   value         {string}   — current method key ('volume_harga' | 'nilai_langsung')
 *   onChange      {Function} — (newMethodKey: string) => void
 *   options       {Array}    — [{ key, label, icon? }] — exactly 2 options
 *   tooltip       {string}   — info tooltip text
 */
function IncomeMethodSelector({ value, onChange, options, tooltip }) {
  return (
    <div className="flex flex-col gap-2 mb-1">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
          Metode Input Pendapatan
        </span>
        {tooltip && (
          <div className="tooltip cursor-pointer text-slate-500 hover:text-slate-300" data-tip={tooltip}>
            <Info size={12} />
          </div>
        )}
      </div>
      <div className="flex rounded-xl border border-white/[0.08] overflow-hidden bg-surface-800/40" role="group">
        {options.map((opt, idx) => {
          const isActive = value === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              id={`income-method-${opt.key}`}
              onClick={() => onChange(opt.key)}
              className={[
                'flex-1 px-3 py-2 text-[11.5px] font-semibold transition-all text-center leading-tight',
                idx === 0 ? '' : 'border-l border-white/[0.07]',
                isActive
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              ].join(' ')}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ExpenseField({ id, label, value, freq, daysPerMonth, onValueChange, onFreqChange, tooltip, showHpp, readOnly, autoModeBadge, autoModeRemark, hideFreqSelector, customBadge, customRemark }) {
  const [focused, setFocused] = useState(false);
  const numVal  = parseFloat(value) || 0;
  const freqKey = freq || 'tahunan';
  const annualVal = convertToAnnual(numVal, freqKey, daysPerMonth);
  const formula   = getConversionFormula(numVal, freqKey, daysPerMonth);
  const isDailyHint = freqKey === 'harian';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 flex-wrap">
        <label htmlFor={id} className="text-[12.5px] font-semibold text-slate-300 flex-1">
          {label}
        </label>
        {/* Addendum #10: auto-mode badge / custom badge */}
        {customBadge ? (
          customBadge
        ) : autoModeBadge ? (
          <span className="flex items-center gap-1 text-[9.5px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
            🔄 Otomatis dari data pekerja
          </span>
        ) : null}
        {tooltip && (
          <div className="tooltip cursor-pointer text-slate-500 hover:text-slate-300" data-tip={tooltip}>
            <Info size={13} />
          </div>
        )}
      </div>

      {/* Input row: Rp input + frequency selector side-by-side */}
      <div className="flex gap-2 items-stretch">
        {/* Currency input */}
        <CurrencyInput
          id={id}
          value={value}
          onChange={onValueChange}
          placeholder="0"
          readOnly={readOnly}
          hideLabel={true}
          className="relative flex-1"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {/* Frequency selector */}
        {!hideFreqSelector && (
          <div className="relative shrink-0">
            <select
              id={`${id}-freq`}
              value={freqKey}
              onChange={e => onFreqChange(e.target.value)}
              className="h-full rounded-xl border border-white/[0.08] bg-surface-700 text-[11.5px] font-semibold text-indigo-300 px-2.5 pr-7 appearance-none cursor-pointer outline-none hover:border-indigo-500/30 focus:border-indigo-500/50 transition-all"
              style={{ minWidth: '90px' }}
            >
              {FREQ_OPTIONS.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
            {/* Dropdown chevron overlay */}
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"/>
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Conversion helper text — only shown when frequency ≠ tahunan */}
      {!hideFreqSelector && freqKey !== 'tahunan' && (
        <div className="flex items-center gap-1.5 pl-1">
          <span className="text-[10.5px] font-semibold text-emerald-300 font-mono tabular-nums">
            = {formatRupiah(annualVal)} /tahun
          </span>
          {formula && (
            <span className="text-[9.5px] text-slate-500">({formula})</span>
          )}
          {isDailyHint && (
            <span
              className="tooltip text-slate-600 hover:text-slate-400 cursor-pointer"
              data-tip={`Menggunakan ${daysPerMonth} hari kerja/bulan dari parameter form. Ubah slider Hari Kerja di atas untuk menyesuaikan.`}
            >
              <Info size={10} />
            </span>
          )}
        </div>
      )}
      {/* Addendum #10: auto-mode remark row */}
      {customRemark ? (
        <p className="text-[10px] text-emerald-400/80 font-mono pl-1 leading-relaxed">{customRemark}</p>
      ) : autoModeRemark ? (
        <p className="text-[10px] text-emerald-400/70 font-mono pl-1 leading-relaxed">{autoModeRemark}</p>
      ) : null}
    </div>
  );
}

/**
 * Addendum #13 — Bagian 4: Auto-proportion config per category.
 * Each category maps to an expense group with field weights from Total Anggaran Pengeluaran.
 * 26a is ALWAYS excluded (handled by wage auto-sync from Addendum #10).
 * 26e is ALWAYS excluded (manual/optional in all groups).
 *
 * Groups:
 *   'perdagangan'       → 26c (HPP) 70%, 26d (Operasional) 30%
 *   'pertanian_perikanan' → 26b (Produksi) 65%, 26d (Operasional) 35%
 *   'industri'          → 26b (Produksi) 65%, 26d (Operasional) 35%
 *   'kuliner'           → 26b (Produksi) 60%, 26d (Operasional) 40%
 */
const PROPORTION_CONFIG = {
  kios_campuran:         { group: 'perdagangan',   biaya_hpp: 0.70, biaya_operasional: 0.30 },
  tempurung:             { group: 'perdagangan',   biaya_hpp: 0.70, biaya_operasional: 0.30 },
  kuliner_rumah_makan:   { group: 'kuliner',       biaya_produksi: 0.60, biaya_operasional: 0.40 },
  nelayan_tangkap:       { group: 'pertanian',     biaya_produksi: 0.65, biaya_operasional: 0.35 },
  perkebunan_tahunan:    { group: 'pertanian',     biaya_produksi: 0.65, biaya_operasional: 0.35 },
  kelapa_per3bulan:      { group: 'pertanian',     biaya_produksi: 0.65, biaya_operasional: 0.35 },
  industri_kopra:        { group: 'industri',      biaya_produksi: 0.65, biaya_operasional: 0.35 },
  arang_tempurung:       { group: 'industri',      biaya_produksi: 0.65, biaya_operasional: 0.35 },
  generik_harian:        { group: 'pertanian',     biaya_produksi: 0.65, biaya_operasional: 0.35 },
};

// Fields eligible for auto-proportion (26a and 26e are always excluded)
const PROPORTION_FIELDS = ['biaya_produksi', 'biaya_hpp', 'biaya_operasional'];

// Key suffix used to mark a field as "still in auto mode" vs "manually overridden"
// Stored in inputs as e.g. biaya_produksi_auto_proportion = true
const AUTO_FLAG_SUFFIX = '_auto_proportion';

export default function InputForm({ categoryId, inputs, onInputChange, records }) {

  const [showBps, setShowBps] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const guideRef = useRef(null);

  // Close guide drawer when clicking outside, excluding form elements and sliders
  useEffect(() => {
    function handleClickOutside(event) {
      if (guideRef.current && !guideRef.current.contains(event.target)) {
        const isClickingFormInput =
          event.target.closest('input') ||
          event.target.closest('select') ||
          event.target.closest('button') ||
          event.target.closest('.tooltip');
        if (!isClickingFormInput) {
          setIsGuideOpen(false);
        }
      }
    }
    if (isGuideOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isGuideOpen]);

  const category = CATEGORIES.find(c => c.id === categoryId);
  if (!category) return null;

  const tempurungRecords = records.filter(r => r.categoryId === 'tempurung');

  const isNelayan = categoryId === 'nelayan_tangkap';
  const incomeMethod = inputs.income_method || 'nilai_langsung';

  // ── Addendum #10: Wage auto-sync — compute at top level for useEffect ────
  const _hasNewWorkerKeys =
    inputs.pekerja_dibayar_l !== undefined || inputs.pekerja_dibayar_p !== undefined ||
    inputs.pekerja_tidak_dibayar_l !== undefined || inputs.pekerja_tidak_dibayar_p !== undefined;
  const _dibayarL = parseInt(_hasNewWorkerKeys ? inputs.pekerja_dibayar_l : inputs.pekerja_l) || 0;
  const _dibayarP = parseInt(_hasNewWorkerKeys ? inputs.pekerja_dibayar_p : inputs.pekerja_p) || 0;
  const totalPekerjaDibayar = _dibayarL + _dibayarP;

  const isBagiHasilMode = isNelayan && (incomeMethod === 'bagi_hasil' || (incomeMethod === 'volume_harga' && totalPekerjaDibayar >= 2));

  // Determine modifiers config
  const hasDailyModifier = ['kios_campuran', 'kuliner_rumah_makan', 'nelayan_tangkap', 'generik_harian'].includes(categoryId);
  const hasRevenueModifier = !isBagiHasilMode;

  let defaultRevPct = 100;
  let defaultExpPct = 30;
  if (categoryId === 'kios_campuran')           { defaultRevPct = 10;  defaultExpPct = 30; }
  else if (categoryId === 'kuliner_rumah_makan') { defaultRevPct = 60;  defaultExpPct = 40; }
  else if (categoryId === 'generik_harian')      { defaultRevPct = 20;  defaultExpPct = 30; }
  else if (categoryId === 'nelayan_tangkap')     { defaultRevPct = 10;  defaultExpPct = 30; }
  else if (categoryId === 'tempurung' || categoryId === 'arang_tempurung') { defaultRevPct = 100; defaultExpPct = 10; }

  const rawDays = inputs.custom_days;
  const displayDays = (rawDays !== undefined && rawDays !== '') ? rawDays : 30;
  const daysNum = Number(displayDays);

  // Normalize use_detail_pengeluaran toggle
  const rawToggle = inputs.use_detail_pengeluaran;
  const isDetailPengeluaranActive = rawToggle === true || rawToggle === 1 || rawToggle === 'true' || isBagiHasilMode;

  const rataUpahPerPekerja  = parseFloat(inputs.rata_upah_per_pekerja) || 0;
  const estimasiUpahTahunan = totalPekerjaDibayar * rataUpahPerPekerja * 12;
  // Auto-mode is active when: rata_upah is filled AND dibayar > 0 AND rincian toggle is on
  const isWageAutoMode = rataUpahPerPekerja > 0 && totalPekerjaDibayar > 0 && isDetailPengeluaranActive && !isBagiHasilMode;

  // Auto-sync 26a whenever the auto-mode inputs change
  useEffect(() => {
    if (isWageAutoMode) {
      onInputChange({
        biaya_upah: String(estimasiUpahTahunan),
        biaya_upah_freq: 'tahunan'
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWageAutoMode, totalPekerjaDibayar, rataUpahPerPekerja, estimasiUpahTahunan]);

  // ── Bagi Hasil Kapal (Punggawa-Sawi) calculations for UI ──
  const tripSat = parseFloat(inputs.satuan_kg) || 0;
  const tripPrc = parseFloat(inputs.pemasukan_harian) || 0;
  const tripQty = parseFloat(inputs.custom_days !== undefined && inputs.custom_days !== '' ? inputs.custom_days : 30);

  const tripEs = parseFloat(inputs.biaya_trip_es) || 0;
  const tripBbm = parseFloat(inputs.biaya_trip_bbm) || 0;
  const tripRansum = parseFloat(inputs.biaya_trip_ransum) || 0;
  const tripUmpan = parseFloat(inputs.biaya_trip_umpan) || 0;

  const totalBiayaTrip = tripEs + tripBbm + tripRansum + tripUmpan;
  const totalBiayaTripBulanan = totalBiayaTrip * tripQty;
  const totalBiayaTripTahunan = totalBiayaTripBulanan * 12;

  const kotorBulanan = tripSat * tripPrc * tripQty;
  const shuBulanan = kotorBulanan - totalBiayaTripBulanan;

  const pemilikPct = inputs.bagi_hasil_pemilik !== undefined && inputs.bagi_hasil_pemilik !== '' ? parseFloat(inputs.bagi_hasil_pemilik) : 50;
  const kruPct = 100 - pemilikPct;
  const bagianKruBulanan = shuBulanan * (kruPct / 100);
  const bagianKruTahunan = bagianKruBulanan * 12;

  // Auto-sync 26b and 26a for Bagi Hasil Kapal
  useEffect(() => {
    if (isBagiHasilMode) {
      onInputChange({
        biaya_produksi: String(totalBiayaTripTahunan),
        biaya_produksi_freq: 'tahunan',
        biaya_upah: String(bagianKruTahunan),
        biaya_upah_freq: 'tahunan',
        biaya_operasional: '0',
        biaya_non_operasional: '0'
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBagiHasilMode, totalBiayaTripTahunan, bagianKruTahunan]);
  // ─────────────────────────────────────────────────────────────────────────

  // ── Addendum #13 — Bagian 4: Auto-proportion ─────────────────────────────
  // Compute live annual income (same formula as calculateRecord but simplified for UI)
  const proportionCfg = PROPORTION_CONFIG[categoryId] || null;

  // Use calculateRecord to get the real annual income (most accurate)
  const _liveResult = calculateRecord({ id: '_preview', categoryId, inputs }, records || []);
  const liveAnnualIncome = _liveResult.totalPendapatanTahunan || 0;

  // Expense budget for auto-proportion = totalPendapatanTahunan × expPct%
  const _expPctNum = (() => {
    const v = inputs.custom_exp_pct;
    if (v === undefined || v === '') return defaultExpPct;
    return Math.min(100, Math.max(0, parseFloat(v) || defaultExpPct));
  })();
  const liveExpenseBudget = liveAnnualIncome * (_expPctNum / 100);

  // Auto-proportion effect: fill eligible fields when income is known & rincian active
  useEffect(() => {
    if (!proportionCfg || !isDetailPengeluaranActive || liveExpenseBudget <= 0 || isBagiHasilMode) return;

    const updates = {};
    PROPORTION_FIELDS.forEach(field => {
      const weight = proportionCfg[field];
      if (!weight) return; // This field not in this category's proportion config
      const isAutoMode = inputs[field + AUTO_FLAG_SUFFIX] !== false; // default: auto unless explicitly overridden
      if (!isAutoMode) return; // User manually overrode this field — don't touch it
      const proportionValue = Math.round(liveExpenseBudget * weight);
      updates[field] = String(proportionValue);
      updates[field + '_freq'] = 'tahunan';
      updates[field + AUTO_FLAG_SUFFIX] = true; // mark as auto-filled
    });

    if (Object.keys(updates).length > 0) {
      onInputChange(updates);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDetailPengeluaranActive, liveExpenseBudget, proportionCfg?.group]);
  // ─────────────────────────────────────────────────────────────────────────

  // ── Bagian 4.6: Anomaly check — 26f > totalPendapatanTahunan ─────────────
  const live26fForAnomaly = (() => {
    const dm = Number(displayDays);
    // 26a: use wage auto-mode value if active, else inputs.biaya_upah
    const upah26a = isWageAutoMode
      ? estimasiUpahTahunan
      : convertToAnnual(parseFloat(inputs.biaya_upah) || 0, inputs.biaya_upah_freq, dm);
    return (
      upah26a +
      convertToAnnual(parseFloat(inputs.biaya_produksi) || 0, inputs.biaya_produksi_freq, dm) +
      convertToAnnual(parseFloat(inputs.biaya_hpp) || 0, inputs.biaya_hpp_freq, dm) +
      convertToAnnual(parseFloat(inputs.biaya_operasional) || 0, inputs.biaya_operasional_freq, dm) +
      convertToAnnual(parseFloat(inputs.biaya_non_operasional) || 0, inputs.biaya_non_operasional_freq, dm)
    );
  })();
  const isExpenseOverflow = isDetailPengeluaranActive && liveAnnualIncome > 0 && live26fForAnomaly > liveAnnualIncome;
  // ─────────────────────────────────────────────────────────────────────────

  // ── Addendum #7: Nelayan income method ────────────────────────────────────
  // Dynamic options helper for IncomeMethodSelector to satisfy "dinamis/reusable" requirement
  const getIncomeMethodOptions = () => {
    if (isNelayan) {
      const opts = [];
      opts.push({ key: 'nilai_langsung', label: 'Nilai Pendapatan Langsung' });
      // Addendum #16 / #17 Bagi Hasil Kru/Trip option
      opts.push({ key: 'bagi_hasil',     label: 'Bagi Hasil Kru/Trip' });
      return opts;
    }
    return [];
  };
  const nelayanOptions = getIncomeMethodOptions();

  // For Opsi B: live daily conversion preview
  const opsiB_rawIncome = parseFloat(inputs.pemasukan_langsung) || 0;
  const opsiB_freq      = inputs.pemasukan_langsung_freq || 'harian';
  const opsiB_daily     = convertToDaily(opsiB_rawIncome, opsiB_freq, daysNum);
  const opsiB_freqLabel = INCOME_FREQ_OPTIONS.find(o => o.key === opsiB_freq)?.label || 'per Hari';
  const revPct          = (inputs.custom_rev_pct !== undefined && inputs.custom_rev_pct !== '') ? Number(inputs.custom_rev_pct) : defaultRevPct;
  const getFormulaText = () => {
    const revPctVal = (inputs.custom_rev_pct !== undefined && inputs.custom_rev_pct !== '') ? inputs.custom_rev_pct : defaultRevPct;
    const expPctVal = (inputs.custom_exp_pct !== undefined && inputs.custom_exp_pct !== '') ? inputs.custom_exp_pct : defaultExpPct;

    const total26f =
      (parseFloat(inputs.biaya_upah)            || 0) +
      (parseFloat(inputs.biaya_produksi)        || 0) +
      (parseFloat(inputs.biaya_hpp)             || 0) +
      (parseFloat(inputs.biaya_operasional)     || 0) +
      (parseFloat(inputs.biaya_non_operasional) || 0);

    if (isBagiHasilMode) {
      if (isDetailPengeluaranActive) {
        return `Pendapatan: Hasil Tangkap/Trip × Harga × ${tripQty} Trip/bln × 12 bln · Pengeluaran: Upah Kru (26a) + Operasional Trip (26b) = Rp${total26f.toLocaleString('id-ID')}`;
      }
      return `Pendapatan: Hasil Tangkap/Trip × Harga × ${tripQty} Trip/bln × 12 bln · Pengeluaran: Upah Kru (26a) + Operasional Trip (26b)`;
    }

    let pendapatan;
    if (isNelayan && incomeMethod === 'nilai_langsung') {
      const freqTxt = INCOME_FREQ_OPTIONS.find(o => o.key === opsiB_freq)?.label || 'per Hari';
      let factorDesc = '';
      if (opsiB_freq === 'harian') {
        factorDesc = `${daysNum} Hari × 12 Bulan`;
      } else if (opsiB_freq === 'mingguan') {
        factorDesc = '48 Minggu';
      } else if (opsiB_freq === 'bulanan') {
        factorDesc = '12 Bulan';
      } else if (opsiB_freq === 'tahunan') {
        factorDesc = '1';
      }
      pendapatan = `Pendapatan Kotor (${freqTxt}) × ${factorDesc} × ${revPctVal}% koefisien`;
    } else if (categoryId === 'kios_campuran' || categoryId === 'kuliner_rumah_makan' || categoryId === 'generik_harian') {
      const freq = inputs.pemasukan_harian_freq || 'harian';
      const freqTxt = INCOME_FREQ_OPTIONS.find(o => o.key === freq)?.label || 'per Hari';
      let factorDesc = '';
      if (freq === 'harian') {
        factorDesc = `${daysNum} Hari × 12 Bulan`;
      } else if (freq === 'mingguan') {
        factorDesc = '48 Minggu';
      } else if (freq === 'bulanan') {
        factorDesc = '12 Bulan';
      } else if (freq === 'tahunan') {
        factorDesc = '1';
      }
      pendapatan = `Pendapatan Kotor (${freqTxt}) × ${factorDesc} × ${revPctVal}% koefisien`;
    } else if (categoryId === 'perkebunan_tahunan') {
      pendapatan = `Input langsung pendapatan (per periode) × ${revPctVal}% koefisien`;
    } else if (categoryId === 'kelapa_per3bulan') {
      pendapatan = `Harga: 25 buah/pohon × Rp 2.000 × 4 panen/tahun × ${revPctVal}% koefisien`;
    } else if (categoryId === 'industri_kopra') {
      pendapatan = `Harga: (berat ÷ 5) × Rp 15.000 × 4 siklus/tahun × ${revPctVal}% koefisien`;
    } else if (categoryId === 'tempurung') {
      pendapatan = `Harga: (berat ÷ 10) × Rp 5.000 × ${revPctVal}% koefisien`;
    } else if (categoryId === 'arang_tempurung') {
      pendapatan = `Nilai Batch = (Nilai Bahan Baku + Nilai Tambah Tetap) × ${revPctVal}% koefisien`;
    } else {
      pendapatan = `Pendapatan Kotor × ${revPctVal}% koefisien`;
    }

    if (isDetailPengeluaranActive) {
      return `${pendapatan} · Pengeluaran: Rincian Manual (26f) = Rp${total26f.toLocaleString('id-ID')}`;
    }
    return `${pendapatan} · Faktor pengeluaran ${expPctVal}%`;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── Income Method Selector (Addendum #7 & #17 — hide toggle if <= 1 option available) ── */}
      {isNelayan && nelayanOptions.length > 1 && (
        <IncomeMethodSelector
          value={incomeMethod}
          onChange={v => onInputChange('income_method', v)}
          options={nelayanOptions}
          tooltip="Pilih cara Anda mencatat pendapatan — langsung total pendapatan atau bagi hasil kru/trip."
        />
      )}

      {isNelayan && (
        <>
          {/* Bagi Hasil Kru/Trip fields (shown when method = bagi_hasil or legacy volume_harga with workers >= 2) */}
          {isBagiHasilMode && (
            <>
              <UnitInput
                id="input-satuan-kg"
                label="Satuan Tangkapan (Kg)"
                value={inputs.satuan_kg ?? 1}
                onChange={v => onInputChange('satuan_kg', v)}
                placeholder="1"
                suffix="kg/trip"
              />
              <CurrencyInput
                id="input-pemasukan-harian"
                label="Nilai Per Satuan (Rp)"
                value={inputs.pemasukan_harian ?? ''}
                onChange={v => onInputChange('pemasukan_harian', v)}
                placeholder="150000"
                tooltip="Harga jual per kg hasil tangkapan."
              />

              {/* Jumlah Trip / Bulan slider when in Bagi Hasil mode */}
              {isBagiHasilMode && (
                <div className="flex flex-col gap-1.5 mt-1 border-t border-white/[0.04] pt-3">
                  <div className="flex justify-between items-center">
                    <label htmlFor="input-custom-days-top" className="text-[12px] font-medium text-slate-300">
                      Jumlah Trip / Bulan
                    </label>
                    <span className="text-[11px] font-semibold font-mono text-cyan-300 bg-cyan-500/15 px-1.5 py-0.5 rounded">
                      {displayDays} trip
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      id="range-custom-days-top"
                      type="range" min="1" max="31"
                      value={displayDays}
                      onChange={e => onInputChange('custom_days', e.target.value)}
                      className="flex-1 accent-cyan-500 h-1.5 bg-surface-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <input
                      id="input-custom-days-top-num"
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
                  <div className="flex justify-between text-[9px] text-slate-600 px-0.5 select-none font-medium">
                    <span>1</span><span>8</span><span>15</span><span>22</span><span>31</span>
                  </div>
                </div>
              )}

              {/* TAHAP A Live Calculation Preview (Bagi Hasil Mode) */}
              {isBagiHasilMode && (() => {
                const sat = parseFloat(inputs.satuan_kg) || 0;
                const prc = parseFloat(inputs.pemasukan_harian) || 0;
                const trips = parseFloat(inputs.custom_days !== undefined && inputs.custom_days !== '' ? inputs.custom_days : 30);
                const perTrip = sat * prc;
                const bulanan = perTrip * trips;
                const tahunan = bulanan * 12;
                if (tahunan > 0) {
                  return (
                    <div className="text-[11px] font-mono text-slate-350 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 space-y-1.5 mt-1">
                      <div className="font-bold text-indigo-400 uppercase tracking-wide text-[9px] mb-1">Estimasi Pendapatan Kotor (Tahap A)</div>
                      <div className="flex justify-between"><span>Pendapatan per Trip:</span><span className="font-semibold text-slate-200">{formatRupiah(perTrip)}</span></div>
                      <div className="flex justify-between"><span>Total Pendapatan Kotor Bulanan:</span><span className="font-semibold text-slate-200">{formatRupiah(bulanan)}</span></div>
                      <div className="flex justify-between border-t border-white/5 pt-1.5 mt-1"><span>Total Pendapatan Kotor Tahunan:</span><span className="font-semibold text-emerald-455">{formatRupiah(tahunan)}</span></div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* TAHAP B — BIAYA OPERASIONAL PER TRIP */}
              {isBagiHasilMode && (
                <div className="p-4 rounded-xl bg-surface-800/40 border border-white/[0.06] space-y-3 mt-2">
                  <div className="flex items-center gap-1.5 border-b border-white/5 pb-2 mb-1">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      Tahap B — Biaya Operasional per Trip
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <CurrencyInput
                      id="input-biaya-trip-es"
                      label="Es Balok (Rp)"
                      value={inputs.biaya_trip_es ?? ''}
                      onChange={v => onInputChange('biaya_trip_es', v)}
                      placeholder="300.000"
                    />
                    <CurrencyInput
                      id="input-biaya-trip-bbm"
                      label="BBM/Solar (Rp)"
                      value={inputs.biaya_trip_bbm ?? ''}
                      onChange={v => onInputChange('biaya_trip_bbm', v)}
                      placeholder="800.000"
                    />
                    <CurrencyInput
                      id="input-biaya-trip-ransum"
                      label="Ransum/Makanan Kru (Rp)"
                      value={inputs.biaya_trip_ransum ?? ''}
                      onChange={v => onInputChange('biaya_trip_ransum', v)}
                      placeholder="400.000"
                    />
                    <CurrencyInput
                      id="input-biaya-trip-umpan"
                      label="Umpan (Rp)"
                      value={inputs.biaya_trip_umpan ?? ''}
                      onChange={v => onInputChange('biaya_trip_umpan', v)}
                      placeholder="200.000"
                    />
                  </div>

                  {/* TAHAP B Live Calculation Preview */}
                  {(() => {
                    const es = parseFloat(inputs.biaya_trip_es) || 0;
                    const bbm = parseFloat(inputs.biaya_trip_bbm) || 0;
                    const ransum = parseFloat(inputs.biaya_trip_ransum) || 0;
                    const umpan = parseFloat(inputs.biaya_trip_umpan) || 0;
                    const trips = parseFloat(inputs.custom_days !== undefined && inputs.custom_days !== '' ? inputs.custom_days : 30);
                    const totalTrip = es + bbm + ransum + umpan;
                    const bulanan = totalTrip * trips;
                    const tahunan = bulanan * 12;
                    if (totalTrip > 0) {
                      return (
                        <div className="text-[11px] font-mono text-slate-350 bg-surface-900/40 border border-white/[0.04] rounded-lg p-2.5 mt-2 space-y-1">
                          <div className="flex justify-between"><span>Total Biaya per Trip:</span><span className="font-semibold text-slate-200">{formatRupiah(totalTrip)}</span></div>
                          <div className="flex justify-between"><span>Total Biaya Bulanan:</span><span className="font-semibold text-slate-200">{formatRupiah(bulanan)}</span></div>
                          <div className="flex justify-between border-t border-white/5 pt-1 mt-1"><span>Total Biaya Tahunan (26b):</span><span className="font-semibold text-rose-400">{formatRupiah(tahunan)}</span></div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}

              {/* TAHAP C — PEMBAGIAN HASIL USAHA (SHU) */}
              {isBagiHasilMode && (
                <div className="p-4 rounded-xl bg-surface-800/40 border border-white/[0.06] space-y-3.5 mt-2">
                  <div className="flex items-center gap-1.5 border-b border-white/5 pb-2 mb-1">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      Tahap C — Pembagian Hasil Usaha (SHU)
                    </span>
                  </div>
                  
                  {/* Persentase Slider */}
                  <PercentSlider
                    id="input-bagi-hasil-pemilik"
                    label="Persentase Bagian Pemilik (%)"
                    value={inputs.bagi_hasil_pemilik}
                    onChange={val => onInputChange('bagi_hasil_pemilik', val)}
                    defaultValue={50}
                    tooltip="Persentase Sisa Hasil Usaha (SHU) yang menjadi hak pemilik kapal."
                  />

                  {/* Read-only Kru % */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-slate-400">
                      Persentase Bagian Kru (%)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={`${kruPct}%`}
                      className="w-full rounded-xl border border-white/[0.06] bg-surface-700/50 text-slate-350 text-[12px] font-mono py-2 px-3 outline-none cursor-not-allowed"
                    />
                  </div>

                  {/* Jumlah Kru/ABK info */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-slate-400">
                      Jumlah Kru / ABK (Pekerja Dibayar)
                    </label>
                    <div className="flex items-center justify-between w-full rounded-xl border border-white/[0.06] bg-surface-700/50 text-slate-350 text-[12px] py-2 px-3">
                      <span className="font-semibold text-slate-200">
                        {totalPekerjaDibayar} orang
                      </span>
                      <span className="text-[10px] text-slate-500 italic">
                        (diambil dari data Pekerja Dibayar)
                      </span>
                    </div>
                    <p className="text-[9.5px] text-slate-500 italic mt-0.5">
                      *Ubah jumlah kru di bagian &quot;Pekerja Dibayar&quot; pada Data Pendukung SE2026-L di bawah.
                    </p>
                  </div>

                  {/* TAHAP C Live Calculation Preview */}
                  {(() => {
                    const sat = parseFloat(inputs.satuan_kg) || 0;
                    const prc = parseFloat(inputs.pemasukan_harian) || 0;
                    const trips = parseFloat(inputs.custom_days !== undefined && inputs.custom_days !== '' ? inputs.custom_days : 30);
                    const kotorBulanan = sat * prc * trips;

                    const es = parseFloat(inputs.biaya_trip_es) || 0;
                    const bbm = parseFloat(inputs.biaya_trip_bbm) || 0;
                    const ransum = parseFloat(inputs.biaya_trip_ransum) || 0;
                    const umpan = parseFloat(inputs.biaya_trip_umpan) || 0;
                    const totalTripExp = es + bbm + ransum + umpan;
                    const bulananExp = totalTripExp * trips;

                    const shuBulanan = kotorBulanan - bulananExp;
                    const bagianPemilikBulanan = shuBulanan * (pemilikPct / 100);
                    const bagianKruBulanan = shuBulanan * (kruPct / 100);
                    const bagianPerKruBulanan = totalPekerjaDibayar > 0 ? bagianKruBulanan / totalPekerjaDibayar : 0;
                    const bagianKruTahunan = bagianKruBulanan * 12;

                    if (kotorBulanan > 0 || bulananExp > 0) {
                      return (
                        <div className="text-[11px] font-mono text-slate-300 bg-surface-900/40 border border-white/[0.04] rounded-lg p-2.5 mt-2 space-y-1.5">
                          <div className="flex justify-between"><span>SHU Bersih Bulanan:</span><span className="font-semibold text-slate-205">{formatRupiah(shuBulanan)}</span></div>
                          <div className="flex justify-between"><span>Bagian Pemilik (Bulanan):</span><span className="font-semibold text-indigo-300">{formatRupiah(bagianPemilikBulanan)}</span></div>
                          <div className="flex justify-between"><span>Bagian Total Kru (Bulanan):</span><span className="font-semibold text-emerald-400">{formatRupiah(bagianKruBulanan)}</span></div>
                          {totalPekerjaDibayar > 0 && (
                            <div className="flex justify-between text-[10px] text-slate-400 italic pl-2">
                              <span>Bagian per ABK/Kru (Bulanan):</span>
                              <span>{formatRupiah(bagianPerKruBulanan)}</span>
                            </div>
                          )}
                          <div className="flex justify-between border-t border-white/5 pt-1.5 mt-1"><span>Bagian Total Kru Tahunan (26a):</span><span className="font-semibold text-emerald-450">{formatRupiah(bagianKruTahunan)}</span></div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </>
          )}

          {/* Opsi B fields: Nilai Pendapatan Langsung (shown when method = nilai_langsung) */}
          {incomeMethod === 'nilai_langsung' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <label htmlFor="input-pemasukan-langsung" className="text-[12.5px] font-semibold text-slate-300 flex-1">
                  Pendapatan Kotor
                </label>
                <div className="tooltip cursor-pointer text-slate-500 hover:text-slate-300" data-tip="Masukkan total pendapatan kotor sesuai frekuensi pencatatan Anda (harian/mingguan/bulanan/tahunan).">
                  <Info size={13} />
                </div>
              </div>

              {/* Input row: Rp + frequency selector */}
              <div className="flex gap-2 items-stretch">
                <CurrencyInput
                  id="input-pemasukan-langsung"
                  value={inputs.pemasukan_langsung ?? ''}
                  onChange={val => onInputChange('pemasukan_langsung', val)}
                  placeholder="300000"
                  hideLabel={true}
                  className="relative flex-1"
                />

                {/* Frequency selector */}
                <div className="relative shrink-0">
                  <select
                    id="input-pemasukan-langsung-freq"
                    value={opsiB_freq}
                    onChange={e => onInputChange('pemasukan_langsung_freq', e.target.value)}
                    className="h-full rounded-xl border border-white/[0.08] bg-surface-700 text-[11.5px] font-semibold text-indigo-300 px-2.5 pr-7 appearance-none cursor-pointer outline-none hover:border-indigo-500/30 focus:border-indigo-500/50 transition-all"
                    style={{ minWidth: '90px' }}
                  >
                    {INCOME_FREQ_OPTIONS.map(opt => (
                      <option key={opt.key} value={opt.key}>{opt.label}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Conversion hint / helper (Addendum #15) */}
              {opsiB_rawIncome > 0 && (
                (() => {
                  let factor = 1;
                  if (opsiB_freq === 'harian') {
                    factor = daysNum * 12;
                  } else if (opsiB_freq === 'mingguan') {
                    factor = 48;
                  } else if (opsiB_freq === 'bulanan') {
                    factor = 12;
                  } else if (opsiB_freq === 'tahunan') {
                    factor = 1;
                  }
                  const sebelumKoefisien = opsiB_rawIncome * factor;
                  const kontribusiTotal = sebelumKoefisien * (revPct / 100);
                  return (
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 pl-1 text-[11px] text-slate-400 font-mono tabular-nums leading-relaxed">
                      <span>=</span>
                      <span className="font-semibold text-slate-200">{formatRupiah(sebelumKoefisien)}/tahun</span>
                      <span className="text-slate-500 text-[10px]">(sebelum koefisien)</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-indigo-300">× {revPct}% koefisien</span>
                      <span>=</span>
                      <span className="font-semibold text-emerald-400">{formatRupiah(kontribusiTotal)}</span>
                      <span className="text-slate-500 text-[10px]">kontribusi to Total Pendapatan</span>
                    </div>
                  );
                })()
              )}
            </div>
          )}
        </>
      )}

      {/* ── Main Inputs (non-nelayan, or never rendered for nelayan since fields above handle it) ── */}
      {!isNelayan && category.fields.map((field) => {
        const val = inputs[field.key] ?? (field.defaultValue !== undefined ? field.defaultValue : '');

        if (field.type === 'boolean') {
          return (
            <BooleanField
              key={field.key}
              field={field}
              value={Boolean(val)}
              onChange={onInputChange}
            />
          );
        }

        const isCurrency = ['pemasukan_harian', 'total_pendapatan_tahunan'].includes(field.key);

        // Addendum #9: field with harvestPeriodKey renders the harvest period selector
        if (field.harvestPeriodKey) {
          return (
            <HarvestPeriodSelector
              key={field.key}
              id={`input-${field.key}`}
              label={field.label}
              value={inputs[field.key] ?? ''}
              onValueChange={v => onInputChange(field.key, v)}
              periodValue={inputs[field.harvestPeriodKey] ?? '12'}
              onPeriodChange={v => onInputChange(field.harvestPeriodKey, v)}
              placeholder={field.placeholder}
            />
          );
        }

        if (isCurrency) {
          if (field.key === 'pemasukan_harian') {
            const rawIncome = parseFloat(val) || 0;
            const freq = inputs.pemasukan_harian_freq || 'harian';
            
            return (
              <div key={field.key} className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <label htmlFor="input-pemasukan_harian" className="text-[12.5px] font-semibold text-slate-300 flex-1">
                    {field.label}
                  </label>
                  <div className="tooltip cursor-pointer text-slate-500 hover:text-slate-300" data-tip="Masukkan total pendapatan kotor sesuai frekuensi pencatatan Anda (harian/mingguan/bulanan/tahunan).">
                    <Info size={13} />
                  </div>
                </div>

                <div className="flex gap-2 items-stretch">
                  <CurrencyInput
                    id="input-pemasukan_harian"
                    value={inputs.pemasukan_harian ?? ''}
                    onChange={v => onInputChange('pemasukan_harian', v)}
                    placeholder={field.placeholder}
                    hideLabel={true}
                    className="relative flex-1"
                  />

                  {/* Frequency selector */}
                  <div className="relative shrink-0">
                    <select
                      id="input-pemasukan_harian-freq"
                      value={freq}
                      onChange={e => onInputChange('pemasukan_harian_freq', e.target.value)}
                      className="h-full rounded-xl border border-white/[0.08] bg-surface-700 text-[11.5px] font-semibold text-indigo-300 px-2.5 pr-7 appearance-none cursor-pointer outline-none hover:border-indigo-500/30 focus:border-indigo-500/50 transition-all"
                      style={{ minWidth: '90px' }}
                    >
                      {INCOME_FREQ_OPTIONS.map(opt => (
                        <option key={opt.key} value={opt.key}>{opt.label}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                        <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Conversion hint / helper */}
                {rawIncome > 0 && (
                  (() => {
                    let factor = 1;
                    if (freq === 'harian') {
                      factor = daysNum * 12;
                    } else if (freq === 'mingguan') {
                      factor = 48;
                    } else if (freq === 'bulanan') {
                      factor = 12;
                    } else if (freq === 'tahunan') {
                      factor = 1;
                    }
                    const sebelumKoefisien = rawIncome * factor;
                    const kontribusiTotal = sebelumKoefisien * (revPct / 100);
                    return (
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 pl-1 text-[11px] text-slate-400 font-mono tabular-nums leading-relaxed">
                        <span>=</span>
                        <span className="font-semibold text-slate-200">{formatRupiah(sebelumKoefisien)}/tahun</span>
                        <span className="text-slate-500 text-[10px]">(sebelum koefisien)</span>
                        <span className="text-slate-500">→</span>
                        <span className="text-indigo-300">× {revPct}% koefisien</span>
                        <span>=</span>
                        <span className="font-semibold text-emerald-400">{formatRupiah(kontribusiTotal)}</span>
                        <span className="text-slate-500 text-[10px]">kontribusi to Total Pendapatan</span>
                      </div>
                    );
                  })()
                )}
              </div>
            );
          }

          return (
            <CurrencyInput
              key={field.key}
              id={`input-${field.key}`}
              label={field.label}
              value={val}
              onChange={v => onInputChange(field.key, v)}
              placeholder={field.placeholder}
            />
          );
        }

        return (
          <UnitInput
            key={field.key}
            id={`input-${field.key}`}
            label={field.label}
            value={val}
            onChange={v => onInputChange(field.key, v)}
            placeholder={field.placeholder}
            suffix={field.suffix}
          />
        );
      })
      }

      {/* For nelayan, we also need the linked tempurung selector and arang_tempurung logic below - but nelayan never uses link_tempurung, so this guard is safe */}

      {/* Linked Tempurung Selector for arang_tempurung */}
      {categoryId === 'arang_tempurung' && Boolean(inputs.link_tempurung) && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[12.5px] font-semibold text-slate-300">Pilih Usaha Tempurung</label>
          {tempurungRecords.length === 0 ? (
            <p className="text-[11.5px] text-amber-400 bg-amber-500/10 border border-amber-500/25 rounded-lg px-3 py-2">
              Belum ada catatan Tempurung Kelapa. Buat terlebih dahulu di kategori Tempurung.
            </p>
          ) : (
            <select
              id="select-linked-record"
              value={inputs.linked_record_id || ''}
              onChange={e => onInputChange('linked_record_id', e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-surface-700 text-slate-100 text-[12px] px-3 py-2.5 outline-none focus:border-indigo-500/50"
            >
              <option value="">-- Pilih catatan tempurung --</option>
              {tempurungRecords.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* ── Custom Parameters Section ── */}
      {!isBagiHasilMode && (
        <div className="mt-2 pt-4 border-t border-white/[0.06] space-y-3.5 animate-fade-in">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                Koefisien &amp; Parameter Kustom
              </p>
              <div className="tooltip cursor-pointer text-slate-500 hover:text-slate-300" data-tip="Sesuaikan faktor koefisien pendapatan normatif BPS, faktor pengeluaran usaha, atau hari kerja per bulan.">
                <Info size={12} />
              </div>
            </div>
            {/* Guide Trigger Button */}
            <button
              id="btn-trigger-guide"
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="flex items-center gap-1 text-[10.5px] font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <span>💡 Panduan Koefisien</span>
            </button>
          </div>

          {/* Revenue Modifier */}
          {hasRevenueModifier && (
            <PercentSlider
              id="input-custom-rev-pct"
              label="Koefisien Pendapatan (%)"
              value={inputs.custom_rev_pct}
              onChange={val => onInputChange('custom_rev_pct', val)}
              defaultValue={defaultRevPct}
              tooltip="Faktor proporsi pendapatan kotor yang diakui sebagai output bruto menurut norma sektoral BPS."
              onOpenGuide={() => setIsGuideOpen(true)}
            />
          )}

          {/* Expense Modifier (Hidden if detail expense override is active) */}
          {!isDetailPengeluaranActive ? (
            <PercentSlider
              id="input-custom-exp-pct"
              label="Persentase Pengeluaran (%)"
              value={inputs.custom_exp_pct}
              onChange={val => onInputChange('custom_exp_pct', val)}
              defaultValue={defaultExpPct}
              tooltip="Norma persentase pengeluaran terhadap pendapatan untuk mengestimasi biaya usaha."
            />
          ) : (
            <div className="text-[11.5px] text-slate-400 bg-surface-800/40 border border-white/[0.05] rounded-xl px-3 py-2 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span>Faktor Pengeluaran (%)</span>
                <span className="font-semibold text-indigo-300 bg-indigo-500/15 px-1.5 py-0.5 rounded font-mono">
                  Override Detail Aktif
                </span>
              </div>
            </div>
          )}

          {/* Operational Days (Daily categories only) */}
          {hasDailyModifier && (
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="input-custom-days" className="text-[12px] font-medium text-slate-300">
                  {isNelayan ? 'Jumlah Trip / Bulan' : 'Jumlah Hari Kerja / Bulan'}
                </label>
                <span className="text-[11px] font-semibold font-mono text-cyan-300 bg-cyan-500/15 px-1.5 py-0.5 rounded">
                  {displayDays} {isNelayan ? 'trip' : 'hari'}
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
              <div className="flex justify-between text-[9px] text-slate-600 px-0.5 select-none font-medium">
                <span>1</span><span>8</span><span>15</span><span>22</span><span>31</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── BPS SE2026-L Additive Section ── */}
      <div className="mt-1 pt-3 border-t border-white/[0.06]">
        <button
          type="button"
          onClick={() => setShowBps(v => !v)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-surface-800/40 border border-white/[0.04] text-[12px] font-semibold text-slate-300 hover:text-slate-100 hover:bg-surface-800/70 transition-all outline-none"
        >
          <span className="flex items-center gap-2">
            <Building2 size={13} className="text-indigo-400" />
            Data Pendukung SE2026-L (BPS)
          </span>
          {showBps ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showBps && (
          <div className="mt-3 p-3.5 rounded-xl bg-surface-800/25 border border-white/[0.04] space-y-4 fade-in-up">
            {/* ── Profil Usaha: Tahun Mulai + Pekerja (Addendum #8) ── */}
            {/* Tahun Mulai */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <Calendar size={12} />
                Tahun Mulai Operasi
              </label>
              <input
                type="number"
                placeholder="Contoh: 2020"
                min="1900"
                max="2026"
                value={inputs.tahun_mulai || ''}
                onChange={e => onInputChange('tahun_mulai', e.target.value.replace(/\D/g, ''))}
                className="w-full rounded-xl border border-white/[0.08] bg-surface-700 text-slate-100 text-[12px] font-mono py-2 px-3 outline-none"
              />
            </div>

            {/* Workers Section (Addendum #8) — generic/shared across all categories */}
            {(() => {
              // Derive values from new keys with backward compat (legacy pekerja_l/pekerja_p → Dibayar)
              const hasNewKeys =
                inputs.pekerja_dibayar_l       !== undefined ||
                inputs.pekerja_dibayar_p       !== undefined ||
                inputs.pekerja_tidak_dibayar_l !== undefined ||
                inputs.pekerja_tidak_dibayar_p !== undefined;

              const dibayarL      = parseInt(hasNewKeys ? inputs.pekerja_dibayar_l       : inputs.pekerja_l) || 0;
              const dibayarP      = parseInt(hasNewKeys ? inputs.pekerja_dibayar_p       : inputs.pekerja_p) || 0;
              const tidakDibayarL = parseInt(inputs.pekerja_tidak_dibayar_l) || 0;
              const tidakDibayarP = parseInt(inputs.pekerja_tidak_dibayar_p) || 0;
              const totalDibayar      = dibayarL + dibayarP;
              const totalTidakDibayar = tidakDibayarL + tidakDibayarP;
              const totalPekerja      = totalDibayar + totalTidakDibayar;

              // Hint: usaha aktif tapi belum isi pekerja
              const pendapatanAktif = (() => {
                const ph = parseFloat(inputs.pemasukan_harian) || parseFloat(inputs.pemasukan_langsung)
                  || parseFloat(inputs.total_pendapatan_tahunan) || parseFloat(inputs.satuan_kg);
                return ph > 0;
              })();

              return (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <Users size={12} className="text-slate-400" />
                    <span className="text-[11px] font-semibold text-slate-400">Pekerja</span>
                    <div
                      className="tooltip cursor-pointer text-slate-500 hover:text-slate-300"
                      data-tip="Pekerja dibayar = menerima upah/gaji/imbalan. Pekerja tidak dibayar = pekerja keluarga/sukarela yang membantu usaha tanpa upah tetap. (BPS SE2026-L Rincian 24)"
                    >
                      <Info size={11} />
                    </div>
                  </div>

                  {/* Sub-grup: Dibayar */}
                  <div className="space-y-1">
                    <span className="text-[10.5px] font-semibold text-indigo-300/80">Pekerja Dibayar</span>
                    <div className="flex gap-2 items-center">
                      <input
                        id="input-pekerja-dibayar-l"
                        type="number" min="0" placeholder="L"
                        value={hasNewKeys ? (inputs.pekerja_dibayar_l ?? '') : (inputs.pekerja_l ?? '')}
                        onChange={e => {
                          const v = e.target.value.replace(/\D/g, '');
                          if (!hasNewKeys) {
                            onInputChange({ pekerja_dibayar_l: v, pekerja_l: '' });
                          } else {
                            onInputChange('pekerja_dibayar_l', v);
                          }
                        }}
                        className="w-1/2 rounded-xl border border-white/[0.08] bg-surface-700 text-slate-100 text-[12px] font-mono py-1.5 text-center outline-none focus:border-indigo-500/50"
                        title="Pekerja Dibayar Laki-laki"
                      />
                      <input
                        id="input-pekerja-dibayar-p"
                        type="number" min="0" placeholder="P"
                        value={hasNewKeys ? (inputs.pekerja_dibayar_p ?? '') : (inputs.pekerja_p ?? '')}
                        onChange={e => {
                          const v = e.target.value.replace(/\D/g, '');
                          if (!hasNewKeys) {
                            onInputChange({ pekerja_dibayar_p: v, pekerja_p: '' });
                          } else {
                            onInputChange('pekerja_dibayar_p', v);
                          }
                        }}
                        className="w-1/2 rounded-xl border border-white/[0.08] bg-surface-700 text-slate-100 text-[12px] font-mono py-1.5 text-center outline-none focus:border-indigo-500/50"
                        title="Pekerja Dibayar Perempuan"
                      />
                      <span className="text-[10px] text-indigo-300 font-mono shrink-0 min-w-[50px] text-right">
                        {totalDibayar > 0 ? `= ${totalDibayar}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Sub-grup: Tidak Dibayar */}
                  <div className="space-y-1">
                    <span className="text-[10.5px] font-semibold text-slate-400/70">Pekerja Tidak Dibayar</span>
                    <div className="flex gap-2 items-center">
                      <input
                        id="input-pekerja-tidak-dibayar-l"
                        type="number" min="0" placeholder="L"
                        value={inputs.pekerja_tidak_dibayar_l ?? ''}
                        onChange={e => onInputChange('pekerja_tidak_dibayar_l', e.target.value.replace(/\D/g, ''))}
                        className="w-1/2 rounded-xl border border-white/[0.06] bg-surface-800/60 text-slate-300 text-[12px] font-mono py-1.5 text-center outline-none focus:border-indigo-500/40"
                        title="Pekerja Tidak Dibayar Laki-laki"
                      />
                      <input
                        id="input-pekerja-tidak-dibayar-p"
                        type="number" min="0" placeholder="P"
                        value={inputs.pekerja_tidak_dibayar_p ?? ''}
                        onChange={e => onInputChange('pekerja_tidak_dibayar_p', e.target.value.replace(/\D/g, ''))}
                        className="w-1/2 rounded-xl border border-white/[0.06] bg-surface-800/60 text-slate-300 text-[12px] font-mono py-1.5 text-center outline-none focus:border-indigo-500/40"
                        title="Pekerja Tidak Dibayar Perempuan"
                      />
                      <span className="text-[10px] text-slate-500 font-mono shrink-0 min-w-[50px] text-right">
                        {totalTidakDibayar > 0 ? `= ${totalTidakDibayar}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Total summary bar */}
                  {totalPekerja > 0 && (
                    <div className="flex items-center justify-between px-2.5 py-1.5 bg-indigo-500/8 border border-indigo-500/15 rounded-lg">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pekerja</span>
                      <span className="text-[11px] font-bold text-indigo-300 font-mono">
                        {totalPekerja}
                        {totalDibayar > 0 && totalTidakDibayar > 0 && (
                          <span className="text-[9px] text-slate-500 font-normal ml-1.5">
                            ({totalDibayar} dibayar · {totalTidakDibayar} tidak dibayar)
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Hint: no workers but income exists */}
                  {totalPekerja === 0 && pendapatanAktif && (
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Belum ada pekerja tercatat — isi jika ada, atau biarkan 0 jika usaha dijalankan sendiri (self-employed).
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Pendapatan Lainnya & Online Sales */}
            <div className="space-y-3 pt-1">
              <CurrencyInput
                id="input-pendapatan-lainnya"
                label="Pendapatan Lainnya (27b)"
                value={inputs.pendapatan_lainnya || ''}
                onChange={val => onInputChange('pendapatan_lainnya', val)}
                placeholder="0"
                tooltip="Rincian 27b BPS: Pendapatan dari bunga bank, sewa aset, donasi, subsidi pemerintah."
              />

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                    <Globe size={12} />
                    Porsi Penjualan Online
                  </label>
                  <span className="text-[11.5px] font-semibold font-mono text-cyan-300">
                    {inputs.online_pct || 0}%
                  </span>
                </div>
                <input
                  type="range" min="0" max="100"
                  value={inputs.online_pct || 0}
                  onChange={e => onInputChange('online_pct', e.target.value)}
                  className="w-full accent-cyan-500 h-1 bg-surface-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Aset Usaha */}
            <div className="space-y-3 pt-3 border-t border-white/[0.04]">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Aset Usaha (Rincian 28)</p>
              <div className="grid grid-cols-2 gap-3">
                <CurrencyInput
                  id="input-aset-tanah-bangunan"
                  label="Tanah &amp; Bangunan"
                  value={inputs.aset_tanah_bangunan || ''}
                  onChange={val => onInputChange('aset_tanah_bangunan', val)}
                  placeholder="Nilai Rp"
                  className="flex flex-col gap-1.5"
                />
                <CurrencyInput
                  id="input-aset-lainnya"
                  label="Aset Selain Tanah"
                  value={inputs.aset_lainnya || ''}
                  onChange={val => onInputChange('aset_lainnya', val)}
                  placeholder="Nilai Rp"
                  className="flex flex-col gap-1.5"
                />
              </div>
            </div>

             {/* Rincian Pengeluaran Toggle */}
            <div className="pt-3 border-t border-white/[0.04] space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rincian Pengeluaran</span>
                <label className={`relative inline-flex items-center select-none ${isBagiHasilMode ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                  <input
                    type="checkbox"
                    checked={isDetailPengeluaranActive}
                    disabled={isBagiHasilMode}
                    onChange={e => onInputChange('use_detail_pengeluaran', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-8 h-4 bg-surface-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-500 ${isBagiHasilMode ? 'opacity-50' : ''}`}></div>
                  <span className="ml-2 text-[10px] font-medium text-slate-400">Gunakan Rincian</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Section 4: RINCIAN PENGELUARAN ── */}
      {isDetailPengeluaranActive && (
        <div className="mt-2 pt-4 border-t border-white/[0.06] space-y-4">
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              Rincian Pengeluaran (Rincian 26)
            </p>
          </div>
          <div className="space-y-3.5 pl-2 border-l border-indigo-500/20 fade-in-up">
            {/* 26a — Upah (Addendum #10: auto-syncs from wage widget when rata_upah > 0) */}
            <div className="flex flex-col gap-1.5">
              <ExpenseField
                id="biaya-upah"
                label="Upah, Gaji &amp; Jaminan Sosial (26a)"
                value={inputs.biaya_upah || ''}
                freq={inputs.biaya_upah_freq}
                daysPerMonth={Number(displayDays)}
                onValueChange={val => onInputChange('biaya_upah', val)}
                onFreqChange={freq => onInputChange('biaya_upah_freq', freq)}
                tooltip="Upah pokok, bonus, natura makan/perumahan, iuran BPJS."
                readOnly={isWageAutoMode || isBagiHasilMode}
                autoModeBadge={isWageAutoMode}
                autoModeRemark={
                  isWageAutoMode
                    ? `≈ ${totalPekerjaDibayar} pekerja × ${formatRupiah(rataUpahPerPekerja)}/bln × 12 bln = ${formatRupiah(estimasiUpahTahunan)}`
                    : null
                }
                hideFreqSelector={isBagiHasilMode}
                customBadge={
                  isBagiHasilMode ? (
                    <span className="flex items-center gap-1 text-[9.5px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
                      🔄 Otomatis dari Bagi Hasil Kru (Punggawa-Sawi)
                    </span>
                  ) : null
                }
                customRemark={
                  isBagiHasilMode
                    ? `≈ Bagian Kru (${kruPct}%) dari SHU Bersih Bulanan (${formatRupiah(shuBulanan)}) × 12 bulan = ${formatRupiah(bagianKruTahunan)}`
                    : null
                }
              />

              {/* Wage widget — shown when pekerja dibayar > 0 */}
              {totalPekerjaDibayar > 0 && !isBagiHasilMode && (
                <div className="mt-0.5 pl-2 border-l border-indigo-500/20 space-y-1.5 fade-in-up">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="input-rata-upah" className="text-[10.5px] font-semibold text-slate-400">
                      Rata-rata Upah per Pekerja Dibayar (Rp/bulan)
                      <span className="ml-1 text-slate-600 font-normal">
                        {isWageAutoMode ? '— kosongkan untuk edit 26a manual' : '— isi untuk sinkronisasi otomatis ke 26a'}
                      </span>
                    </label>
                    <CurrencyInput
                      id="input-rata-upah"
                      value={inputs.rata_upah_per_pekerja ?? ''}
                      onChange={val => onInputChange('rata_upah_per_pekerja', val)}
                      placeholder="1500000"
                      hideLabel={true}
                    />
                  </div>
                </div>
              )}

              {totalPekerjaDibayar > 0 && isBagiHasilMode && (
                <p className="text-[10px] text-slate-500 italic pl-2 border-l border-white/5">
                  ℹ️ Rata-rata Upah Pekerja disembunyikan karena upah (26a) menggunakan sistem bagi hasil otomatis dari perhitungan di atas.
                </p>
              )}

              {/* Hint: pekerja DIBAYAR ada tapi biaya_upah masih 0 dan auto-mode off */}
              {(() => {
                if (totalPekerjaDibayar === 0 || parseFloat(inputs.biaya_upah) > 0 || isWageAutoMode || isBagiHasilMode) return null;
                return (
                  <div className="flex items-start gap-1.5 text-[10.5px] text-amber-400 bg-amber-500/8 border border-amber-500/15 rounded-lg px-2.5 py-1.5 leading-relaxed">
                    <span className="shrink-0 mt-0.5">⚠️</span>
                    <span>
                      Usaha ini memiliki {totalPekerjaDibayar} pekerja dibayar — isi Rata-rata Upah di atas untuk sinkronisasi otomatis, atau isi 26a secara manual.
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* ── Expense Overflow Warning — Bagian 4.6 ── */}
            {isExpenseOverflow && (
              <div className="flex items-start gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-[11px] text-red-300 leading-relaxed fade-in-up">
                <span className="shrink-0 text-base">⚠️</span>
                <span>
                  <strong>Biaya pengeluaran lebih besar daripada pendapatan</strong> — Total pengeluaran{' '}
                  <span className="font-mono">{formatRupiah(live26fForAnomaly)}</span> melebihi Pendapatan Tahunan{' '}
                  <span className="font-mono">{formatRupiah(liveAnnualIncome)}</span>. Sesuaikan agar tetap wajar.
                </span>
              </div>
            )}

            {/* 26b — Biaya Produksi */}
            {(() => {
              const fieldKey = 'biaya_produksi';
              const hasProportion = proportionCfg && proportionCfg[fieldKey] && !isBagiHasilMode;
              const isAutoField = hasProportion && inputs[fieldKey + AUTO_FLAG_SUFFIX] !== false;
              const resetToAuto = () => onInputChange({ [fieldKey + AUTO_FLAG_SUFFIX]: true });
              return (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {hasProportion && (
                      isAutoField ? (
                        <span className="text-[9px] font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded-md">
                          🔄 Proporsi Otomatis
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={resetToAuto}
                          className="text-[9px] font-semibold text-slate-400 bg-slate-500/10 border border-slate-500/20 px-1.5 py-0.5 rounded-md hover:text-cyan-300 hover:border-cyan-500/30 transition-all"
                        >
                          ↺ Kembalikan ke Proporsi Otomatis
                        </button>
                      )
                    )}
                  </div>
                  <ExpenseField
                    id="biaya-produksi"
                    label="Biaya Bahan / Produksi (26b)"
                    value={inputs.biaya_produksi || ''}
                    freq={inputs.biaya_produksi_freq}
                    daysPerMonth={Number(displayDays)}
                    onValueChange={val => onInputChange({ biaya_produksi: val, [fieldKey + AUTO_FLAG_SUFFIX]: false })}
                    onFreqChange={freq => onInputChange({ biaya_produksi_freq: freq, [fieldKey + AUTO_FLAG_SUFFIX]: false })}
                    tooltip="Bahan baku, BBM produksi, bahan penolong habis pakai."
                    readOnly={isBagiHasilMode}
                    hideFreqSelector={isBagiHasilMode}
                    customBadge={
                      isBagiHasilMode ? (
                        <span className="flex items-center gap-1 text-[9.5px] font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded-md">
                          🔄 Otomatis dari Biaya Trip
                        </span>
                      ) : null
                    }
                    customRemark={
                      isBagiHasilMode
                        ? `≈ Total Biaya Trip (${formatRupiah(totalBiayaTrip)}) × ${tripQty} trip/bulan × 12 bulan = ${formatRupiah(totalBiayaTripTahunan)}`
                        : null
                    }
                  />
                </div>
              );
            })()}

            {/* 26c — HPP — perdagangan only */}
            {['kios_campuran', 'tempurung', 'arang_tempurung'].includes(categoryId) && (() => {
              const fieldKey = 'biaya_hpp';
              const hasProportion = proportionCfg && proportionCfg[fieldKey];
              const isAutoField = hasProportion && inputs[fieldKey + AUTO_FLAG_SUFFIX] !== false;
              const resetToAuto = () => onInputChange({ [fieldKey + AUTO_FLAG_SUFFIX]: true });
              return (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {hasProportion && (
                      isAutoField ? (
                        <span className="text-[9px] font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded-md">
                          🔄 Proporsi Otomatis
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={resetToAuto}
                          className="text-[9px] font-semibold text-slate-400 bg-slate-500/10 border border-slate-500/20 px-1.5 py-0.5 rounded-md hover:text-cyan-300 hover:border-cyan-500/30 transition-all"
                        >
                          ↺ Kembalikan ke Proporsi Otomatis
                        </button>
                      )
                    )}
                  </div>
                  <ExpenseField
                    id="biaya-hpp"
                    label="Biaya Barang untuk Dijual / HPP (26c)"
                    value={inputs.biaya_hpp || ''}
                    freq={inputs.biaya_hpp_freq}
                    daysPerMonth={Number(displayDays)}
                    onValueChange={val => onInputChange({ biaya_hpp: val, [fieldKey + AUTO_FLAG_SUFFIX]: false })}
                    onFreqChange={freq => onInputChange({ biaya_hpp_freq: freq, [fieldKey + AUTO_FLAG_SUFFIX]: false })}
                    tooltip="Khusus perdagangan: Nilai barang yang dibeli untuk dijual kembali (HPP)."
                  />
                </div>
              );
            })()}

            {/* 26d — Operasional */}
            {!isBagiHasilMode && (() => {
              const fieldKey = 'biaya_operasional';
              const hasProportion = proportionCfg && proportionCfg[fieldKey];
              const isAutoField = hasProportion && inputs[fieldKey + AUTO_FLAG_SUFFIX] !== false;
              const resetToAuto = () => onInputChange({ [fieldKey + AUTO_FLAG_SUFFIX]: true });
              return (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {hasProportion && (
                      isAutoField ? (
                        <span className="text-[9px] font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded-md">
                          🔄 Proporsi Otomatis
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={resetToAuto}
                          className="text-[9px] font-semibold text-slate-400 bg-slate-500/10 border border-slate-500/20 px-1.5 py-0.5 rounded-md hover:text-cyan-300 hover:border-cyan-500/30 transition-all"
                        >
                          ↺ Kembalikan ke Proporsi Otomatis
                        </button>
                      )
                    )}
                  </div>
                  <ExpenseField
                    id="biaya-operasional"
                    label="Biaya Operasional (26d)"
                    value={inputs.biaya_operasional || ''}
                    freq={inputs.biaya_operasional_freq}
                    daysPerMonth={Number(displayDays)}
                    onValueChange={val => onInputChange({ biaya_operasional: val, [fieldKey + AUTO_FLAG_SUFFIX]: false })}
                    onFreqChange={freq => onInputChange({ biaya_operasional_freq: freq, [fieldKey + AUTO_FLAG_SUFFIX]: false })}
                    tooltip="Listrik, air, internet/pulsa, sewa tempat, jasa keuangan, transisi hijau."
                  />
                </div>
              );
            })()}

            {/* 26e — Non-Operasional (always manual) */}
            {!isBagiHasilMode && (
              <ExpenseField
                id="biaya-non-operasional"
                label="Biaya Non-Operasional (26e)"
                value={inputs.biaya_non_operasional || ''}
                freq={inputs.biaya_non_operasional_freq}
                daysPerMonth={Number(displayDays)}
                onValueChange={val => onInputChange('biaya_non_operasional', val)}
                onFreqChange={freq => onInputChange('biaya_non_operasional_freq', freq)}
                tooltip="Bunga pinjaman, donasi, kerugian revaluasi aset, pajak ijin usaha."
              />
            )}

            {/* Live 26f total summary — uses live26fForAnomaly for accuracy with wage auto-mode */}
            {live26fForAnomaly > 0 && (
              <div className={`flex items-center justify-between px-3 py-2 border rounded-xl ${
                isExpenseOverflow
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-indigo-500/10 border-indigo-500/20'
              }`}>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${isExpenseOverflow ? 'text-red-300' : 'text-indigo-300'}`}>
                  Total 26f /tahun
                </span>
                <span className={`text-[12.5px] font-bold font-mono tabular-nums ${isExpenseOverflow ? 'text-red-200' : 'text-indigo-200'}`}>
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(live26fForAnomaly)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}


      {/* ── Formula Footer Note ── */}
      <div className="text-[11px] text-slate-500 bg-surface-800/50 border border-white/[0.04] rounded-xl px-3 py-2.5 leading-relaxed font-sans">
        <span className="text-slate-400 font-semibold">Formula: </span>
        {getFormulaText()}
      </div>

      {/* ── Floating Drawer Panel (Addendum #18) ── */}
      {isGuideOpen && (
        <div
          ref={guideRef}
          id="koefisien-floating-drawer"
          className="fixed right-4 top-20 bottom-4 w-[360px] max-w-[calc(100vw-32px)] glass rounded-2xl border border-white/[0.08] shadow-2xl z-40 flex flex-col overflow-hidden animate-slide-in-right"
          style={{ maxHeight: 'calc(100vh - 120px)' }}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07] bg-surface-800/80 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-base">💡</span>
              <div>
                <h3 className="text-[12.5px] font-bold text-white">Panduan Koefisien</h3>
                <p className="text-[9.5px] text-indigo-400 font-semibold tracking-wide">MASTER GUIDE DONGGALA</p>
              </div>
            </div>
            <button
              id="btn-close-guide"
              type="button"
              onClick={() => setIsGuideOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-surface-700 transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
            {(() => {
              const getGuideKey = () => {
                if (inputs._groupKey) {
                  if (inputs._groupKey.startsWith('jasa-')) return 'jasa';
                  return inputs._groupKey;
                }
                if (categoryId === 'kios_campuran' || categoryId === 'tempurung') return 'perdagangan';
                if (categoryId === 'kuliner_rumah_makan') return 'akomodasi-makan-minum';
                if (categoryId === 'perkebunan_tahunan' || categoryId === 'kelapa_per3bulan') return 'perkebunan';
                if (categoryId === 'industri_kopra' || categoryId === 'arang_tempurung') return 'industri-pengolahan';
                if (categoryId === 'nelayan_tangkap') return 'perikanan';
                return null;
              };
              const guideKey = getGuideKey();
              const guide = KOEFISIEN_GUIDE_DATA[guideKey];

              if (!guide) {
                return (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                    <span className="text-3xl">⚠️</span>
                    <p className="text-[11.5px] text-slate-400 max-w-[240px] leading-relaxed">
                      Panduan koefisien untuk kategori ini belum tersedia. Gunakan penilaian usaha Anda sendiri, atau hubungi admin untuk menambahkan panduan.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3.5">
                  <div className="text-[11px] font-bold text-slate-350 uppercase tracking-widest pl-0.5">
                    {guide.title}
                  </div>
                  {guide.note && (
                    <div className="text-[10px] text-amber-350 bg-amber-500/10 border border-amber-500/15 rounded-xl p-2.5 leading-relaxed font-sans">
                      📌 <strong>Catatan:</strong> {guide.note}
                    </div>
                  )}
                  {guideKey === 'perdagangan' && (
                    <div className="text-[10.5px] text-slate-300 bg-surface-800/80 border border-white/[0.05] rounded-xl p-3 space-y-1.5 leading-relaxed font-sans">
                      <span className="font-bold text-indigo-300">🔍 Cek 3 hal ini untuk menentukan skala toko Anda:</span>
                      <ol className="list-decimal pl-4 space-y-1 text-slate-450">
                        <li>Berapa omzet kotor rata-rata per hari?</li>
                        <li>Berapa orang yang bekerja/menjaga toko (termasuk Anda)?</li>
                        <li>Dari mana Anda kulakan barang — eceran ke pasar, atau langsung ke distributor/pabrik?</li>
                      </ol>
                    </div>
                  )}
                  <div className="flex flex-col gap-3">
                    {guide.levels.map((level, idx) => {
                      const currentVal = parseFloat(inputs.custom_rev_pct !== undefined && inputs.custom_rev_pct !== '' ? inputs.custom_rev_pct : defaultRevPct);
                      const isMatch = currentVal >= level.min && currentVal <= level.max;
                      const isSubsectorMatch = (() => {
                        if (!inputs._groupKey) return false;
                        if (inputs._groupKey === 'jasa-reparasi' && level.name.includes('Reparasi')) return true;
                        if (inputs._groupKey === 'jasa-personal' && level.name.includes('Personal')) return true;
                        if (inputs._groupKey === 'jasa-transportasi' && level.name.includes('Transportasi')) return true;
                        if (inputs._groupKey === 'jasa-konstruksi' && level.name.includes('Konstruksi')) return true;
                        if (inputs._groupKey === 'jasa-profesional' && level.name.includes('Profesional')) return true;
                        return false;
                      })();

                      return (
                        <div
                          key={idx}
                          id={`guide-card-${idx}`}
                          className={`p-3 rounded-xl border transition-all flex flex-col gap-2 ${
                            isMatch
                              ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.15)] animate-fade-in'
                              : 'bg-surface-800/40 border-white/[0.06] hover:bg-surface-800/60'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <div className="flex-1">
                              <h4 className="text-[11px] font-bold text-slate-200">{level.name}</h4>
                              <p className="text-[10.5px] font-mono text-indigo-400 font-bold mt-0.5">
                                Rentang: {level.min}% – {level.max}%
                              </p>
                              {level.alasan && (
                                <p className="text-[10px] text-indigo-300/80 italic mt-1 leading-relaxed pl-0.5 border-l-2 border-indigo-500/35 pl-1.5">
                                  💡 {level.alasan}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 items-end shrink-0">
                              {isMatch && (
                                <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500 text-white select-none">
                                  Cocok
                                </span>
                              )}
                              {isSubsectorMatch && !isMatch && (
                                <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 select-none">
                                  Sub-sektor Anda
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-400 leading-relaxed pl-0.5">
                            {level.guide}
                          </p>

                          <div className="flex gap-2 mt-1">
                            <button
                              id={`btn-apply-range-${idx}`}
                              type="button"
                              onClick={() => {
                                const mid = Math.round((level.min + level.max) / 2);
                                onInputChange('custom_rev_pct', String(mid));
                              }}
                              className="text-[10px] font-bold py-1.5 px-2 rounded-lg bg-surface-700 hover:bg-surface-600 text-slate-200 hover:text-white transition-all cursor-pointer flex-1 text-center border border-white/[0.04] outline-none"
                            >
                              Gunakan Rentang Ini ({Math.round((level.min + level.max) / 2)}%)
                            </button>

                            {level.action && level.action.type === 'activate_bagi_hasil' && (
                              <button
                                id={`btn-guide-activate-bagi-hasil-${idx}`}
                                type="button"
                                onClick={() => {
                                  onInputChange('income_method', 'bagi_hasil');
                                }}
                                className="text-[10px] font-bold py-1.5 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer flex-1 text-center outline-none"
                              >
                                {level.action.label}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Drawer Footer */}
          <div className="px-4 py-2 border-t border-white/[0.05] bg-surface-850 shrink-0">
            <p className="text-[9.5px] text-slate-500 text-center leading-normal">
              Nilai Koefisien Pendapatan (%) dapat disesuaikan secara bebas sesuai kondisi riil usaha di lapangan.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
