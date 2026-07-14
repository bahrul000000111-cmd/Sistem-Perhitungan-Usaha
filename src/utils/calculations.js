/**
 * calculations.js
 * Core financial calculation engine for UMK Revenue Calculator.
 * Implements exact normative coefficient formulas as specified.
 * All intermediate values preserve full floating-point precision.
 */

// ═══════════════════════════════════════════════════════════
// CATEGORY DEFINITIONS (metadata & config)
// ═══════════════════════════════════════════════════════════

/**
 * FORMULA_GROUPS — maps sector/sub-sector slugs to an ORDERED list of categoryIds.
 * Used by Addendum #4 modal & RecordCard "Jenis Kalkulasi" dropdown.
 * First entry = default formula for that group.
 * PURE DISPLAY METADATA — not read by any computeFn.
 */
export const FORMULA_GROUPS = {
  // Sub-sectors of Pertanian with multiple formulas:
  'perkebunan':          ['perkebunan_tahunan', 'kelapa_per3bulan'],
  // Flat sectors with multiple formulas:
  'perdagangan':         ['kios_campuran', 'tempurung'],
  'industri-pengolahan': ['industri_kopra', 'arang_tempurung'],
  // Sub-sectors / sectors with exactly 1 formula (auto-assign, no dropdown needed):
  'perikanan':                  ['nelayan_tangkap'],
  'akomodasi-makan-minum':      ['kuliner_rumah_makan'],
  // Empty sub-sectors → Generic Template:
  'peternakan':  ['generik_harian'],
  'hortikultura':['generik_harian'],
  'pangan':      ['generik_harian'],
  'kehutanan':   ['generik_harian'],
};

export const CATEGORIES = [
  {
    id: 'kios_campuran',
    name: 'KBLI 47112 - Toko Kelontong / Kios Campuran',
    icon: 'Store',
    color: 'indigo',
    description: 'Perdagangan Eceran Kelontong & Kebutuhan Sehari-hari',
    kbliSection: 'G',
    sectorId: 'perdagangan',
    // ── Mechanism metadata (Addendum #5) ────────────────────────────────
    mechGroup: 'M1',
    mechLabel: 'Pendapatan Harian/Berkala × Koefisien Margin',
    mechSubtext: 'Cocok untuk usaha dagang dengan omzet harian & margin keuntungan relatif tetap — mis. warung, kios, toko, pedagang pasar, dan sejenisnya.',
    fields: [
      { key: 'pemasukan_harian', label: 'Pendapatan Kotor Harian', placeholder: '500000', suffix: '/hari' }
    ],
    note: 'Koefisien normatif 10% · Faktor pengeluaran 30%'
  },
  {
    id: 'kuliner_rumah_makan',
    name: 'KBLI 56101 - Restoran dan Rumah Makan',
    icon: 'UtensilsCrossed',
    color: 'amber',
    description: 'Penyediaan Akomodasi & Makan Minum',
    kbliSection: 'I',
    sectorId: 'akomodasi-makan-minum',
    mechGroup: 'M1',
    mechLabel: 'Pendapatan Harian/Berkala × Koefisien Margin (Kuliner)',
    mechSubtext: 'Cocok untuk usaha makan-minum dengan omzet harian & koefisien pendapatan lebih tinggi — mis. warung makan, café, katering, usaha jajanan, dan sejenisnya.',
    fields: [
      { key: 'pemasukan_harian', label: 'Pendapatan Kotor Harian', placeholder: '1000000', suffix: '/hari' }
    ],
    note: 'Koefisien normatif 60% · Faktor pengeluaran 40%'
  },
  {
    id: 'perkebunan_tahunan',
    name: 'KBLI 01200 - Perkebunan Tanaman Tahunan',
    icon: 'Sprout',
    color: 'emerald',
    description: 'Perkebunan Tanaman Tahunan (input pendapatan langsung)',
    kbliSection: 'A',
    sectorId: 'pertanian-kehutanan-perikanan',
    subSectorId: 'perkebunan',
    mechGroup: 'M2',
    mechLabel: 'Input Pendapatan Langsung (Tahunan)',
    mechSubtext: 'Cocok bila Anda sudah tahu total pendapatan tahunan usaha secara langsung — mis. kebun campuran, tanaman tahunan lain, usaha dengan pencatatan tahunan sederhana, dan sejenisnya.',
    fields: [
      { key: 'total_pendapatan_tahunan', label: 'Total Pendapatan Tahunan', placeholder: '12000000', suffix: '/tahun' }
    ],
    note: 'Input langsung pendapatan tahunan · Faktor pengeluaran 30%'
  },
  {
    id: 'kelapa_per3bulan',
    name: 'KBLI 01262 - Perkebunan Buah Kelapa',
    icon: 'TreePalm',
    color: 'cyan',
    description: 'Perkebunan Buah Kelapa · Panen 4×/tahun',
    kbliSection: 'A',
    sectorId: 'pertanian-kehutanan-perikanan',
    subSectorId: 'perkebunan',
    mechGroup: 'M3',
    mechLabel: 'Volume Panen × Harga Satuan (per Pohon/Tanaman)',
    mechSubtext: 'Cocok untuk usaha dengan jumlah pohon/tanaman tertentu & hasil panen berkala — mis. kelapa, buah-buahan, tanaman keras lain, dan sejenisnya.',
    hasDualMode: true,
    fields: [
      { key: 'jumlah_pohon', label: 'Jumlah Pohon / Tanaman', placeholder: '30', suffix: 'pohon', defaultValue: 30 }
    ],
    note: 'Harga: 25 buah/pohon × Rp 2.000 · 4 panen/tahun · Pengeluaran 30%'
  },
  {
    id: 'industri_kopra',
    name: 'KBLI 10411 - Industri Pengolahan Kopra',
    icon: 'Package',
    color: 'orange',
    description: 'Industri Pengolahan Hasil Kelapa (Kopra)',
    kbliSection: 'C',
    sectorId: 'industri-pengolahan',
    mechGroup: 'M3',
    mechLabel: 'Volume/Berat Produksi × Harga Satuan (per Siklus Produksi)',
    mechSubtext: 'Cocok untuk usaha pengolahan dengan hasil produksi terukur berat/volume per siklus — mis. hasil olahan pertanian, produk olahan rumahan, pengolahan bahan mentah, dan sejenisnya.',
    hasDualMode: true,
    fields: [
      { key: 'berat_kopra', label: 'Berat Hasil Produksi Per Siklus (Kg)', placeholder: '400', suffix: 'kg', defaultValue: 400 }
    ],
    note: 'Harga: (berat ÷ 5) × Rp 15.000 · 4 siklus/tahun · Pengeluaran 30%'
  },
  {
    id: 'tempurung',
    name: 'KBLI 46696 - Perdagangan Hasil Sampingan (Tempurung)',
    icon: 'Shell',
    color: 'brown',
    description: 'Perdagangan Besar Bahan Sisa & Hasil Sampingan',
    kbliSection: 'G',
    sectorId: 'perdagangan',
    mechGroup: 'M3-batch',
    mechLabel: 'Volume/Berat Barang × Harga Satuan (per Batch/Pengiriman)',
    mechSubtext: 'Cocok untuk usaha dagang barang curah/sisa produksi yang dijual per batch atau pengiriman — mis. hasil sampingan, bahan sisa industri, komoditas curah, dan sejenisnya.',
    fields: [
      { key: 'berat_tempurung', label: 'Berat Barang per Batch (Kg)', placeholder: '90', suffix: 'kg', defaultValue: 90 }
    ],
    note: 'Harga: (berat ÷ 10) × Rp 5.000 · Pengeluaran 10%'
  },
  {
    id: 'arang_tempurung',
    name: 'KBLI 20114 - Industri Arang Tempurung Kelapa',
    icon: 'Flame',
    color: 'rose',
    description: 'Industri Pengolahan — Nilai Tambah dari Tempurung Kelapa',
    kbliSection: 'C',
    sectorId: 'industri-pengolahan',
    mechGroup: 'M3-batch+',
    mechLabel: 'Volume/Berat Bahan Baku × Harga Satuan + Nilai Tambah Pengolahan (per Batch)',
    mechSubtext: 'Cocok untuk usaha pengolahan lanjutan yang menambah nilai dari bahan baku per batch — mis. produk olahan turunan, bahan jadi dari bahan mentah, dan sejenisnya.',
    fields: [
      { key: 'berat_tempurung', label: 'Berat Bahan Baku per Batch (Kg)', placeholder: '90', suffix: 'kg', defaultValue: 90 },
      { key: 'link_tempurung', label: 'Gunakan Nilai Tempurung Kategori 6', type: 'boolean', defaultValue: false }
    ],
    note: 'Nilai Batch = Nilai Bahan Baku + Nilai Tambah Tetap · Pengeluaran 10%'
  },
  {
    id: 'nelayan_tangkap',
    name: 'KBLI 03111 - Penangkapan Ikan di Laut',
    icon: 'Fish',
    color: 'blue',
    description: 'Perikanan Tangkap Laut — Harian',
    kbliSection: 'A',
    sectorId: 'pertanian-kehutanan-perikanan',
    subSectorId: 'perikanan',
    mechGroup: 'M1-kuantitas',
    mechLabel: 'Kuantitas Tangkapan × Harga Satuan × Koefisien (Harian)',
    mechSubtext: 'Cocok untuk usaha berbasis volume tangkapan/panen harian dengan harga satuan per unit — mis. usaha perikanan, pengumpul hasil alam harian, dan sejenisnya.',
    fields: [
      { key: 'satuan_kg', label: 'Satuan Tangkapan (Kg)', placeholder: '1', suffix: 'kg/hari', defaultValue: 1 },
      { key: 'pemasukan_harian', label: 'Nilai Per Satuan (Rp)', placeholder: '150000', suffix: '/satuan' }
    ],
    note: 'Koefisien normatif 10% · Faktor pengeluaran 30% · Setiap hari'
  },
  {
    // ── Generic Template ────────────────────────────────────────────────────
    // Used for sub-sectors with no registered KBLI formula yet.
    // Pattern mirrors kios_campuran (daily income × coefficient × days × 12 − expense%).
    // Default coefficient: 20% (neutral/generic vs sector-calibrated 10%/60%/10%).
    // IMPORTANT: This entry is intentionally NOT assigned to any sectorId/subSectorId
    // in the taxonomy — the sector context is preserved in record.subSectorGroupKey instead.
    id: 'generik_harian',
    name: 'Kalkulasi Generik Harian',
    icon: 'BarChart2',
    color: 'slate',
    description: 'Template fleksibel — sesuaikan koefisien sesuai jenis usaha Anda',
    kbliSection: null,
    sectorId: null,
    subSectorId: null,
    isGeneric: true,
    fields: [
      { key: 'pemasukan_harian', label: 'Pendapatan Kotor (per periode)', placeholder: '500000', suffix: '/periode' }
    ],
    note: 'Menggunakan kalkulasi generik — sesuaikan koefisien sesuai jenis usaha Anda'
  }
];

// Helper functions to safely get custom percentages with fallback defaults.
// Empty string or NaN during typing returns 0 to avoid breaking UI.
function getRevPct(inputs, defaultValue) {
  const val = inputs?.custom_rev_pct;
  if (val === undefined) return defaultValue;
  if (val === '' || isNaN(val)) return 0;
  return Math.min(100, Math.max(0, parseFloat(val)));
}

function getExpPct(inputs, defaultValue) {
  const val = inputs?.custom_exp_pct;
  if (val === undefined) return defaultValue;
  if (val === '' || isNaN(val)) return 0;
  return Math.min(100, Math.max(0, parseFloat(val)));
}

// Returns the number of active working days per month (1–31, default 30).
// Used for daily-income categories: Kios Campuran, Kuliner, Nelayan.
function getDays(inputs) {
  const val = inputs?.custom_days;
  if (val === undefined || val === '') return 30;
  const parsed = parseInt(val);
  if (isNaN(parsed)) return 30;
  return Math.min(31, Math.max(1, parsed));
}

/**
 * Convert an expense value to its annual equivalent based on frequency.
 * Frequency keys: 'tahunan' | 'bulanan' | 'mingguan' | 'harian'
 * Missing/unknown frequency defaults to 'tahunan' (×1) for backward compatibility.
 *
 * @param {number} value          - Raw numeric value as entered by user
 * @param {string} frequency      - Frequency key (defaults to 'tahunan')
 * @param {number} daysPerMonth   - Active working days/month from getDays()
 * @returns {number}              - Annualized value
 */
export function convertToAnnual(value, frequency, daysPerMonth = 30) {
  const freq = frequency || 'tahunan';
  switch (freq) {
    case 'harian':   return value * daysPerMonth * 12;
    case 'mingguan': return value * 52;
    case 'bulanan':  return value * 12;
    case 'tahunan':
    default:         return value;
  }
}

/**
 * Returns a human-readable conversion formula string for display.
 * Returns null when frequency is 'tahunan' (no conversion needed).
 *
 * @param {number} value
 * @param {string} frequency
 * @param {number} daysPerMonth
 * @returns {string|null}
 */
export function getConversionFormula(value, frequency, daysPerMonth = 30) {
  const freq = frequency || 'tahunan';
  switch (freq) {
    case 'harian':   return `${value.toLocaleString('id-ID')} × ${daysPerMonth} hari × 12 bulan`;
    case 'mingguan': return `${value.toLocaleString('id-ID')} × 52 minggu`;
    case 'bulanan':  return `${value.toLocaleString('id-ID')} × 12 bulan`;
    default:         return null;
  }
}

// ═══════════════════════════════════════════════════════════
// CALCULATION ENGINE — Each category returns a standardized result object
// ═══════════════════════════════════════════════════════════

/**
 * Unified result structure returned by every calculator function.
 * @typedef {Object} CalcResult
 * @property {number} totalPendapatanTahunan   - Annual gross revenue
 * @property {number} totalPengeluaranTahunan  - Annual total expenses
 * @property {number} totalHasilUsaha          - Annual net profit
 * @property {number} pendapatanPerBulan       - Monthly net income
 * @property {Object|null} perPanen            - Harvest-basis breakdown (for dual-mode categories)
 * @property {Object|null} setahun             - Annual-basis breakdown (for dual-mode categories)
 * @property {Object} meta                     - Miscellaneous intermediate values for display
 */

/**
 * Category 1: Kios Campuran
 * Default: Rev = 10% | Exp = 30% | Days = 30
 */
export function calcKiosCampuran(inputs = {}) {
  const ph = parseFloat(inputs.pemasukan_harian) || 0;
  const revPct = getRevPct(inputs, 10);
  const expPct = getExpPct(inputs, 30);
  const days = getDays(inputs);

  const totalPendapatan = ph * days * 12 * (revPct / 100);
  const totalPengeluaran = totalPendapatan * (expPct / 100);
  const totalHasilUsaha = totalPendapatan - totalPengeluaran;
  const pendapatanPerBulan = totalHasilUsaha / 12;

  return {
    totalPendapatanTahunan: totalPendapatan,
    totalPengeluaranTahunan: totalPengeluaran,
    totalHasilUsaha,
    pendapatanPerBulan,
    perPanen: null,
    setahun: null,
    meta: { koefisien: `${revPct}%`, faktorPengeluaran: `${expPct}%`, hariKerja: days, pemasukan_harian: ph }
  };
}

/**
 * Category 2: Usaha Kuliner / Rumah Makan
 * Default: Rev = 60% | Exp = 40% | Days = 30
 */
export function calcKuliner(inputs = {}) {
  const ph = parseFloat(inputs.pemasukan_harian) || 0;
  const revPct = getRevPct(inputs, 60);
  const expPct = getExpPct(inputs, 40);
  const days = getDays(inputs);

  const totalPendapatan = ph * days * 12 * (revPct / 100);
  const totalPengeluaran = totalPendapatan * (expPct / 100);
  const totalHasilUsaha = totalPendapatan - totalPengeluaran;
  const pendapatanPerBulan = totalHasilUsaha / 12;

  return {
    totalPendapatanTahunan: totalPendapatan,
    totalPengeluaranTahunan: totalPengeluaran,
    totalHasilUsaha,
    pendapatanPerBulan,
    perPanen: null,
    setahun: null,
    meta: { koefisien: `${revPct}%`, faktorPengeluaran: `${expPct}%`, hariKerja: days, pemasukan_harian: ph }
  };
}

/**
 * Category 3: Perkebunan & Pertanian Tahunan
 * Default: Exp = 30%
 */
export function calcPerkebunanTahunan(inputs = {}) {
  const totalPendapatan = parseFloat(inputs.total_pendapatan_tahunan) || 0;
  const expPct = getExpPct(inputs, 30);

  const totalPengeluaran = totalPendapatan * (expPct / 100);
  const totalHasilUsaha = totalPendapatan - totalPengeluaran;
  const pendapatanPerBulan = totalHasilUsaha / 12;

  return {
    totalPendapatanTahunan: totalPendapatan,
    totalPengeluaranTahunan: totalPengeluaran,
    totalHasilUsaha,
    pendapatanPerBulan,
    perPanen: null,
    setahun: null,
    meta: { faktorPengeluaran: `${expPct}%` }
  };
}

/**
 * Category 4: Perkebunan Kelapa Per 3 Bulan
 * Default: Exp = 30%
 */
export function calcKelapaPerTigaBulan(inputs = {}) {
  const pohon = parseFloat(inputs.jumlah_pohon) || 0;
  const expPct = getExpPct(inputs, 30);

  // Per panen (single harvest)
  const nilaiRevenuePanen = pohon * 25 * 2000;
  const pengeluaranPanen = nilaiRevenuePanen * (expPct / 100);
  const hasilPanen = nilaiRevenuePanen - pengeluaranPanen;
  const pendapatanBulanPanen = hasilPanen / 12; // annualized monthly basis

  // Setahun (4 harvests/year)
  const totalPendapatanTahunan = nilaiRevenuePanen * 4;
  const totalPengeluaranTahunan = pengeluaranPanen * 4;
  const totalHasilUsaha = hasilPanen * 4;
  const pendapatanPerBulan = totalHasilUsaha / 12;

  return {
    totalPendapatanTahunan,
    totalPengeluaranTahunan,
    totalHasilUsaha,
    pendapatanPerBulan,
    perPanen: {
      totalPendapatan: nilaiRevenuePanen,
      totalPengeluaran: pengeluaranPanen,
      totalHasilUsaha: hasilPanen,
      pendapatanPerBulanBasisPanen: pendapatanBulanPanen
    },
    setahun: {
      totalPendapatan: totalPendapatanTahunan,
      totalPengeluaran: totalPengeluaranTahunan,
      totalHasilUsaha,
      pendapatanPerBulan
    },
    meta: { jumlah_pohon: pohon, hargaPerBuah: 2000, buahPerPohon: 25, panenPerTahun: 4, faktorPengeluaran: `${expPct}%` }
  };
}

/**
 * Category 5: Industri Kelapa (Kopra)
 * Default: Exp = 30%
 */
export function calcKopra(inputs = {}) {
  const berat = parseFloat(inputs.berat_kopra) || 0;
  const expPct = getExpPct(inputs, 30);

  // Per panen
  const nilaiRevenuePanen = (berat / 5) * 15000;
  const pengeluaranPanen = nilaiRevenuePanen * (expPct / 100);
  const hasilPanen = nilaiRevenuePanen - pengeluaranPanen;
  const pendapatanBulanPanen = hasilPanen / 12;

  // Setahun (4 panen)
  const totalPendapatanTahunan = nilaiRevenuePanen * 4;
  const totalPengeluaranTahunan = pengeluaranPanen * 4;
  const totalHasilUsaha = hasilPanen * 4;
  const pendapatanPerBulan = totalHasilUsaha / 12;

  return {
    totalPendapatanTahunan,
    totalPengeluaranTahunan,
    totalHasilUsaha,
    pendapatanPerBulan,
    perPanen: {
      totalPendapatan: nilaiRevenuePanen,
      totalPengeluaran: pengeluaranPanen,
      totalHasilUsaha: hasilPanen,
      pendapatanPerBulanBasisPanen: pendapatanBulanPanen
    },
    setahun: {
      totalPendapatan: totalPendapatanTahunan,
      totalPengeluaran: totalPengeluaranTahunan,
      totalHasilUsaha,
      pendapatanPerBulan
    },
    meta: { berat_kopra: berat, hargaPerUnit: 15000, unitPer5Kg: berat / 5, panenPerTahun: 4, faktorPengeluaran: `${expPct}%` }
  };
}

/**
 * Category 6: Tempurung Kelapa
 * Default: Exp = 10%
 */
export function calcTempurung(inputs = {}) {
  const berat = parseFloat(inputs.berat_tempurung) || 0;
  const expPct = getExpPct(inputs, 10);

  const nilaiHarianBox = (berat / 10) * 5000;
  const totalPendapatan = nilaiHarianBox;
  const totalPengeluaran = totalPendapatan * (expPct / 100);
  const totalHasilUsaha = totalPendapatan - totalPengeluaran;
  const pendapatanPerBulan = totalHasilUsaha / 12;

  return {
    totalPendapatanTahunan: totalPendapatan,
    totalPengeluaranTahunan: totalPengeluaran,
    totalHasilUsaha,
    pendapatanPerBulan,
    perPanen: null,
    setahun: null,
    meta: { nilaiHarianBox, berat_tempurung: berat, faktorPengeluaran: `${expPct}%` }
  };
}

/**
 * Category 7: Tempurung → Arang
 * Default: Exp = 10%
 */
export function calcArangTempurung(inputs = {}, linkedNilaiHarianBox = null) {
  let nilaiHarianBox;
  const expPct = getExpPct(inputs, 10);

  if (inputs.link_tempurung && linkedNilaiHarianBox !== null) {
    nilaiHarianBox = linkedNilaiHarianBox;
  } else {
    const berat = parseFloat(inputs.berat_tempurung) || 0;
    nilaiHarianBox = (berat / 10) * 5000;
  }

  const nilaiHarianArang = nilaiHarianBox + 13500;
  const totalPendapatan = nilaiHarianArang;
  const totalPengeluaran = totalPendapatan * (expPct / 100);
  const totalHasilUsaha = totalPendapatan - totalPengeluaran;
  const pendapatanPerBulan = totalHasilUsaha / 12;

  return {
    totalPendapatanTahunan: totalPendapatan,
    totalPengeluaranTahunan: totalPengeluaran,
    totalHasilUsaha,
    pendapatanPerBulan,
    perPanen: null,
    setahun: null,
    meta: { nilaiHarianBox, nilaiHarianArang, tambahan: 13500, faktorPengeluaran: `${expPct}%` }
  };
}

/**
 * Category 8: Nelayan Tangkap Ikan
 * Default: Rev = 10% | Exp = 30% | Days = 30
 */
export function calcNelayan(inputs = {}) {
  const satuan = parseFloat(inputs.satuan_kg) || 0;
  const ph = parseFloat(inputs.pemasukan_harian) || 0;
  const revPct = getRevPct(inputs, 10);
  const expPct = getExpPct(inputs, 30);
  const days = getDays(inputs);

  const totalPendapatan = satuan * ph * days * 12 * (revPct / 100);
  const totalPengeluaran = totalPendapatan * (expPct / 100);
  const totalHasilUsaha = totalPendapatan - totalPengeluaran;
  const pendapatanPerBulan = totalHasilUsaha / 12;

  return {
    totalPendapatanTahunan: totalPendapatan,
    totalPengeluaranTahunan: totalPengeluaran,
    totalHasilUsaha,
    pendapatanPerBulan,
    perPanen: null,
    setahun: null,
    meta: {
      satuan_kg: satuan, pemasukan_harian: ph,
      koefisien: `${revPct}%`, faktorPengeluaran: `${expPct}%`,
      hariKerja: days,
      catatan: 'Menangkap ikan setiap hari'
    }
  };
}

/**
 * Category 9 (Generic): Kalkulasi Generik Harian
 * Reuses kiosCampuran pattern with neutral defaults: Rev = 20% | Exp = 30% | Days = 30.
 * Used for sub-sectors without a registered BPS normative formula.
 * The "pendapatan harian" field supports the frequency selector from Addendum #2.
 */
export function calcGeneric(inputs = {}) {
  const ph = parseFloat(inputs.pemasukan_harian) || 0;
  const revPct = getRevPct(inputs, 20);   // neutral default (vs. 10% Kios, 60% Kuliner)
  const expPct = getExpPct(inputs, 30);
  const days = getDays(inputs);

  const totalPendapatan = ph * days * 12 * (revPct / 100);
  const totalPengeluaran = totalPendapatan * (expPct / 100);
  const totalHasilUsaha = totalPendapatan - totalPengeluaran;
  const pendapatanPerBulan = totalHasilUsaha / 12;

  return {
    totalPendapatanTahunan: totalPendapatan,
    totalPengeluaranTahunan: totalPengeluaran,
    totalHasilUsaha,
    pendapatanPerBulan,
    perPanen: null,
    setahun: null,
    meta: { koefisien: `${revPct}%`, faktorPengeluaran: `${expPct}%`, hariKerja: days, pemasukan_harian: ph, isGeneric: true }
  };
}

// ═══════════════════════════════════════════════════════════
// DISPATCHER — route to the correct calculator by category ID
// ═══════════════════════════════════════════════════════════

/**
 * Calculate result for a given record.
 * @param {Object} record - A business record with categoryId and inputs
 * @param {Object[]} allRecords - All records (needed for linked categories)
 * @returns {CalcResult}
 */
export function calculateRecord(record, allRecords = []) {
  const { categoryId, inputs = {} } = record;
  let result;

  switch (categoryId) {
    case 'kios_campuran':
      result = calcKiosCampuran(inputs);
      break;
    case 'kuliner_rumah_makan':
      result = calcKuliner(inputs);
      break;
    case 'perkebunan_tahunan':
      result = calcPerkebunanTahunan(inputs);
      break;
    case 'kelapa_per3bulan':
      result = calcKelapaPerTigaBulan(inputs);
      break;
    case 'industri_kopra':
      result = calcKopra(inputs);
      break;
    case 'tempurung':
      result = calcTempurung(inputs);
      break;
    case 'arang_tempurung': {
      // Find linked tempurung record's nilaiHarianBox if link_tempurung is true
      let linkedBox = null;
      if (inputs.link_tempurung) {
        const linkedRecord = allRecords.find(r => r.id === inputs.linked_record_id);
        if (linkedRecord && linkedRecord.categoryId === 'tempurung') {
          const tempResult = calcTempurung(linkedRecord.inputs);
          linkedBox = tempResult.meta.nilaiHarianBox;
        }
      }
      result = calcArangTempurung(inputs, linkedBox);
      break;
    }
    case 'nelayan_tangkap':
      result = calcNelayan(inputs);
      break;
    case 'generik_harian':
      result = calcGeneric(inputs);
      break;
    default:
      result = {
        totalPendapatanTahunan: 0,
        totalPengeluaranTahunan: 0,
        totalHasilUsaha: 0,
        pendapatanPerBulan: 0,
        perPanen: null,
        setahun: null,
        meta: {}
      };
  }

  // ── Apply BPS SE2026-L Additive Layer ──
  const pekerjaL = parseInt(inputs.pekerja_l) || 0;
  const pekerjaP = parseInt(inputs.pekerja_p) || 0;
  const totalPekerja = pekerjaL + pekerjaP;
  const tahunMulai = inputs.tahun_mulai ? parseInt(inputs.tahun_mulai) : null;

  // Pendapatan Lainnya
  const pendapatanLainnya = parseFloat(inputs.pendapatan_lainnya) || 0;
  const totalPendapatanCore = result.totalPendapatanTahunan;
  const totalPendapatanAll = totalPendapatanCore + pendapatanLainnya;

  // Pengeluaran Detail Override
  // Guard: use_detail_pengeluaran can be boolean (runtime) or string (edge case) — normalize it
  let totalPengeluaran = result.totalPengeluaranTahunan;
  const rawToggle = inputs.use_detail_pengeluaran;
  const isDetailPengeluaranActive = rawToggle === true || rawToggle === 1 || rawToggle === 'true';
  
  let totalPengeluaranDetail = 0;
  if (isDetailPengeluaranActive) {
    // getDays reads custom_days from inputs (same as income side), fallback 30
    const daysPerMonth = getDays(inputs);

    const upah    = convertToAnnual(parseFloat(inputs.biaya_upah)            || 0, inputs.biaya_upah_freq,           daysPerMonth);
    const prod    = convertToAnnual(parseFloat(inputs.biaya_produksi)        || 0, inputs.biaya_produksi_freq,       daysPerMonth);
    const hpp     = convertToAnnual(parseFloat(inputs.biaya_hpp)             || 0, inputs.biaya_hpp_freq,            daysPerMonth);
    const oper    = convertToAnnual(parseFloat(inputs.biaya_operasional)     || 0, inputs.biaya_operasional_freq,    daysPerMonth);
    const nonOper = convertToAnnual(parseFloat(inputs.biaya_non_operasional) || 0, inputs.biaya_non_operasional_freq, daysPerMonth);
    totalPengeluaranDetail = upah + prod + hpp + oper + nonOper;
    totalPengeluaran = totalPengeluaranDetail;
  }

  // Final Net Profit calculations
  const totalHasilUsaha = totalPendapatanAll - totalPengeluaran;
  const pendapatanPerBulan = totalHasilUsaha / 12;

  // Aset
  const asetTanahBangunan = parseFloat(inputs.aset_tanah_bangunan) || 0;
  const asetLainnya = parseFloat(inputs.aset_lainnya) || 0;
  const totalAset = asetTanahBangunan + asetLainnya;

  return {
    ...result,
    totalPekerja,
    bps: {
      totalPekerja,
      pekerjaL,
      pekerjaP,
      tahunMulai,
      pendapatanLainnya,
      isDetailPengeluaranActive,
      totalPengeluaranDetail,
      onlinePct: parseFloat(inputs.online_pct) || 0,
      asetTanahBangunan,
      asetLainnya,
      totalAset
    },
    totalPendapatanTahunan: totalPendapatanAll,
    totalPengeluaranTahunan: totalPengeluaran,
    totalHasilUsaha,
    pendapatanPerBulan,
    // Original values for display
    corePendapatanTahunan: totalPendapatanCore,
    corePengeluaranTahunan: result.totalPengeluaranTahunan
  };
}

/**
 * Aggregate dashboard statistics from all records.
 * @param {Object[]} records
 * @returns {{ totalUMK: number, totalNetAnnual: number, avgMonthly: number, totalRevenue: number, totalExpense: number }}
 */
export function aggregateStats(records) {
  if (!records || records.length === 0) {
    return { totalUMK: 0, totalNetAnnual: 0, avgMonthly: 0, totalRevenue: 0, totalExpense: 0 };
  }

  let totalNetAnnual = 0;
  let totalRevenue = 0;
  let totalExpense = 0;

  records.forEach(record => {
    const result = calculateRecord(record, records);
    totalNetAnnual += result.totalHasilUsaha;
    totalRevenue += result.totalPendapatanTahunan;
    totalExpense += result.totalPengeluaranTahunan;
  });

  return {
    totalUMK: records.length,
    totalNetAnnual,
    avgMonthly: records.length > 0 ? totalNetAnnual / 12 / records.length : 0,
    totalRevenue,
    totalExpense
  };
}
