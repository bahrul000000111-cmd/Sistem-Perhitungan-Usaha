/**
 * InputForm.jsx
 * Reactive input form for a UMK business category.
 * Renders standardized fields per category, validates inputs,
 * and displays an optional BPS SE2026-L data section.
 */
import { useState } from 'react';
import { AlertCircle, Link2, Link2Off, Info, ChevronDown, ChevronUp, Users, Calendar, DollarSign, Globe, Building2 } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { CATEGORIES } from '../utils/calculations';

/**
 * Reusable currency input with live Rp preview and tooltip support.
 */
function CurrencyInput({ id, label, value, onChange, placeholder, tooltip }) {
  const [focused, setFocused] = useState(false);
  const numVal = parseFloat(value) || 0;
  const showPreview = !focused && numVal > 0;

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
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[12.5px] text-slate-400 font-mono select-none">
          Rp
        </div>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min="0"
          value={value}
          placeholder={placeholder || '0'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={e => {
            const raw = e.target.value.replace(/[^0-9.]/g, '');
            onChange(raw);
          }}
          className="w-full rounded-xl border border-white/[0.08] bg-surface-700 text-slate-100 text-[13px] font-mono py-2.5 pl-9 pr-3 transition-all placeholder:text-slate-600 hover:border-white/[0.12] focus:border-indigo-500/50 outline-none"
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
function PercentSlider({ id, label, value, onChange, defaultValue, tooltip }) {
  const displayValue = (value !== undefined && value !== '') ? value : defaultValue;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <label htmlFor={id} className="text-[12px] font-medium text-slate-300">
            {label}
          </label>
          {tooltip && (
            <div className="tooltip cursor-pointer text-slate-500 hover:text-slate-300" data-tip={tooltip}>
              <Info size={13} />
            </div>
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

export default function InputForm({ categoryId, inputs, onInputChange, records }) {
  const [showBps, setShowBps] = useState(false);

  const category = CATEGORIES.find(c => c.id === categoryId);
  if (!category) return null;

  const tempurungRecords = records.filter(r => r.categoryId === 'tempurung');

  // Determine modifiers config
  const hasDailyModifier = ['kios_campuran', 'kuliner_rumah_makan', 'nelayan_tangkap'].includes(categoryId);
  const hasRevenueModifier = hasDailyModifier;

  let defaultRevPct = 10;
  let defaultExpPct = 30;
  if (categoryId === 'kios_campuran')       { defaultRevPct = 10;  defaultExpPct = 30; }
  else if (categoryId === 'kuliner_rumah_makan') { defaultRevPct = 60; defaultExpPct = 40; }
  else if (categoryId === 'tempurung' || categoryId === 'arang_tempurung') { defaultExpPct = 10; }

  const rawDays = inputs.custom_days;
  const displayDays = (rawDays !== undefined && rawDays !== '') ? rawDays : 30;

  // Normalize use_detail_pengeluaran toggle — same logic as calculateRecord
  const rawToggle = inputs.use_detail_pengeluaran;
  const isDetailPengeluaranActive = rawToggle === true || rawToggle === 1 || rawToggle === 'true';

  return (
    <div className="flex flex-col gap-4">
      {/* ── Main Inputs ── */}
      {category.fields.map((field) => {
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
        if (isCurrency) {
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
      })}

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
      <div className="mt-2 pt-4 border-t border-white/[0.06] space-y-3.5">
        <div className="flex items-center gap-1.5">
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
            Koefisien &amp; Parameter Kustom
          </p>
          <div className="tooltip cursor-pointer text-slate-500 hover:text-slate-300" data-tip="Sesuaikan faktor koefisien pendapatan normatif BPS, faktor pengeluaran usaha, atau hari kerja per bulan.">
            <Info size={12} />
          </div>
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
          <div className="text-[11.5px] text-slate-400 bg-surface-800/40 border border-white/[0.05] rounded-xl px-3 py-2 flex items-center justify-between">
            <span>Faktor Pengeluaran (%)</span>
            <span className="font-semibold text-indigo-300 bg-indigo-500/15 px-1.5 py-0.5 rounded font-mono">
              Override Detail Aktif
            </span>
          </div>
        )}

        {/* Operational Days (Daily categories only) */}
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
            <div className="flex justify-between text-[9px] text-slate-600 px-0.5 select-none font-medium">
              <span>1</span><span>8</span><span>15</span><span>22</span><span>31</span>
            </div>
          </div>
        )}
      </div>

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
            {/* Profil Usaha: Tahun Mulai & Pekerja */}
            <div className="grid grid-cols-2 gap-3">
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

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <Users size={12} />
                  Pekerja (L / P)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="L"
                    min="0"
                    value={inputs.pekerja_l || ''}
                    onChange={e => onInputChange('pekerja_l', e.target.value.replace(/\D/g, ''))}
                    className="w-1/2 rounded-xl border border-white/[0.08] bg-surface-700 text-slate-100 text-[12px] font-mono py-2 text-center outline-none"
                    title="Pekerja Laki-laki"
                  />
                  <input
                    type="number"
                    placeholder="P"
                    min="0"
                    value={inputs.pekerja_p || ''}
                    onChange={e => onInputChange('pekerja_p', e.target.value.replace(/\D/g, ''))}
                    className="w-1/2 rounded-xl border border-white/[0.08] bg-surface-700 text-slate-100 text-[12px] font-mono py-2 text-center outline-none"
                    title="Pekerja Perempuan"
                  />
                </div>
              </div>
            </div>

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
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-400">Tanah &amp; Bangunan</label>
                  <input
                    type="number"
                    placeholder="Nilai Rp"
                    min="0"
                    value={inputs.aset_tanah_bangunan || ''}
                    onChange={e => onInputChange('aset_tanah_bangunan', e.target.value.replace(/\D/g, ''))}
                    className="w-full rounded-xl border border-white/[0.08] bg-surface-700 text-slate-100 text-[12px] font-mono py-2 px-3 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-400">Aset Selain Tanah</label>
                  <input
                    type="number"
                    placeholder="Nilai Rp"
                    min="0"
                    value={inputs.aset_lainnya || ''}
                    onChange={e => onInputChange('aset_lainnya', e.target.value.replace(/\D/g, ''))}
                    className="w-full rounded-xl border border-white/[0.08] bg-surface-700 text-slate-100 text-[12px] font-mono py-2 px-3 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Rincian Pengeluaran Detail (Rincian 26) */}
            <div className="pt-3 border-t border-white/[0.04] space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rincian Pengeluaran</span>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isDetailPengeluaranActive}
                    onChange={e => onInputChange('use_detail_pengeluaran', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-surface-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-500"></div>
                  <span className="ml-2 text-[10px] font-medium text-slate-400">Gunakan Rincian</span>
                </label>
              </div>

              {isDetailPengeluaranActive && (
                <div className="space-y-3.5 pt-1 pl-2 border-l border-indigo-500/20 fade-in-up">
                  {/* 26a — Upah, with hint jika pekerja > 0 tapi biaya_upah = 0 */}
                  <div className="flex flex-col gap-1.5">
                    <CurrencyInput
                      id="biaya-upah"
                      label="Upah, Gaji &amp; Jaminan Sosial (26a)"
                      value={inputs.biaya_upah || ''}
                      onChange={val => onInputChange('biaya_upah', val)}
                      placeholder="0"
                      tooltip="Upah pokok, bonus, natura makan/perumahan, iuran BPJS."
                    />
                    {/* Hint jika pekerja terisi tapi upah kosong */}
                    {((parseInt(inputs.pekerja_l) || 0) + (parseInt(inputs.pekerja_p) || 0)) > 0
                      && !(parseFloat(inputs.biaya_upah) > 0) && (
                      <div className="flex items-start gap-1.5 text-[10.5px] text-amber-400 bg-amber-500/8 border border-amber-500/15 rounded-lg px-2.5 py-1.5 leading-relaxed">
                        <span className="shrink-0 mt-0.5">⚠️</span>
                        <span>
                          Usaha ini memiliki {(parseInt(inputs.pekerja_l) || 0) + (parseInt(inputs.pekerja_p) || 0)} pekerja — pastikan komponen upah/gaji sudah dimasukkan di sini jika relevan.
                        </span>
                      </div>
                    )}
                  </div>
                  <CurrencyInput
                    id="biaya-produksi"
                    label="Biaya Bahan / Produksi (26b)"
                    value={inputs.biaya_produksi || ''}
                    onChange={val => onInputChange('biaya_produksi', val)}
                    placeholder="0"
                    tooltip="Bahan baku, BBM produksi, bahan penolong habis pakai."
                  />
                  {/* 26c — HPP hanya untuk kategori perdagangan */}
                  {['kios_campuran', 'tempurung', 'arang_tempurung'].includes(categoryId) && (
                    <CurrencyInput
                      id="biaya-hpp"
                      label="Biaya Barang untuk Dijual / HPP (26c)"
                      value={inputs.biaya_hpp || ''}
                      onChange={val => onInputChange('biaya_hpp', val)}
                      placeholder="0"
                      tooltip="Khusus perdagangan: Nilai barang yang dibeli untuk dijual kembali (HPP)."
                    />
                  )}
                  <CurrencyInput
                    id="biaya-operasional"
                    label="Biaya Operasional (26d)"
                    value={inputs.biaya_operasional || ''}
                    onChange={val => onInputChange('biaya_operasional', val)}
                    placeholder="0"
                    tooltip="Listrik, air, internet/pulsa, sewa tempat, jasa keuangan, transisi hijau."
                  />
                  <CurrencyInput
                    id="biaya-non-operasional"
                    label="Biaya Non-Operasional (26e)"
                    value={inputs.biaya_non_operasional || ''}
                    onChange={val => onInputChange('biaya_non_operasional', val)}
                    placeholder="0"
                    tooltip="Bunga pinjaman, donasi, kerugian revaluasi aset, pajak ijin usaha."
                  />
                  {/* Live 26f total summary */}
                  {(() => {
                    const total26f =
                      (parseFloat(inputs.biaya_upah)            || 0) +
                      (parseFloat(inputs.biaya_produksi)        || 0) +
                      (parseFloat(inputs.biaya_hpp)             || 0) +
                      (parseFloat(inputs.biaya_operasional)     || 0) +
                      (parseFloat(inputs.biaya_non_operasional) || 0);
                    return total26f > 0 ? (
                      <div className="flex items-center justify-between px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                        <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Total 26f</span>
                        <span className="text-[12.5px] font-bold text-indigo-200 font-mono tabular-nums">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(total26f)}
                        </span>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Formula Footer Note ── */}
      <div className="text-[11px] text-slate-500 bg-surface-800/50 border border-white/[0.04] rounded-xl px-3 py-2.5 leading-relaxed font-sans">
        <span className="text-slate-400 font-semibold">Formula: </span>
        {isDetailPengeluaranActive
          ? (() => {
              // When rincian mode is active, show live 26f total
              const total26f =
                (parseFloat(inputs.biaya_upah)            || 0) +
                (parseFloat(inputs.biaya_produksi)        || 0) +
                (parseFloat(inputs.biaya_hpp)             || 0) +
                (parseFloat(inputs.biaya_operasional)     || 0) +
                (parseFloat(inputs.biaya_non_operasional) || 0);
              const pendapatan = hasDailyModifier
                ? (() => {
                    const days   = (inputs.custom_days    !== undefined && inputs.custom_days    !== '') ? inputs.custom_days    : 30;
                    const revPct = (inputs.custom_rev_pct !== undefined && inputs.custom_rev_pct !== '') ? inputs.custom_rev_pct : (categoryId === 'kuliner_rumah_makan' ? 60 : 10);
                    return `Pemasukan × ${days} Hari × 12 Bulan × ${revPct}% koefisien`;
                  })()
                : category.note.split('·')[0].trim();
              return `${pendapatan} · Pengeluaran: Rincian Manual (26f) = Rp${total26f.toLocaleString('id-ID')}`;
            })()
          : hasDailyModifier
            ? (() => {
                const days   = (inputs.custom_days    !== undefined && inputs.custom_days    !== '') ? inputs.custom_days    : 30;
                const revPct = (inputs.custom_rev_pct !== undefined && inputs.custom_rev_pct !== '') ? inputs.custom_rev_pct : (categoryId === 'kuliner_rumah_makan' ? 60 : 10);
                const expPct = (inputs.custom_exp_pct !== undefined && inputs.custom_exp_pct !== '') ? inputs.custom_exp_pct : (categoryId === 'kuliner_rumah_makan' ? 40 : 30);
                return `Pemasukan × ${days} Hari × 12 Bulan × ${revPct}% koefisien · Pengeluaran ${expPct}%`;
              })()
            : category.note
        }
      </div>
    </div>
  );
}
