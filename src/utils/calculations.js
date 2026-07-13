/**
 * calculations.js
 * Core financial calculation engine for UMK Revenue Calculator.
 * Implements exact normative coefficient formulas as specified.
 * All intermediate values preserve full floating-point precision.
 */

// ═══════════════════════════════════════════════════════════
// CATEGORY DEFINITIONS (metadata & config)
// ═══════════════════════════════════════════════════════════

export const CATEGORIES = [
  {
    id: 'kios_campuran',
    name: 'Kios Campuran',
    icon: 'Store',
    color: 'indigo',
    description: 'Toko / kios serba ada dengan pendapatan harian',
    fields: [
      { key: 'pemasukan_harian', label: 'Pendapatan Kotor Harian', placeholder: '500000', suffix: '/hari' }
    ],
    note: 'Koefisien normatif 10% · Faktor pengeluaran 30%'
  },
  {
    id: 'kuliner_rumah_makan',
    name: 'Usaha Kuliner / Rumah Makan',
    icon: 'UtensilsCrossed',
    color: 'amber',
    description: 'Restoran, warung makan, atau usaha kuliner lainnya',
    fields: [
      { key: 'pemasukan_harian', label: 'Pendapatan Kotor Harian', placeholder: '1000000', suffix: '/hari' }
    ],
    note: 'Koefisien normatif 60% · Faktor pengeluaran 40%'
  },
  {
    id: 'perkebunan_tahunan',
    name: 'Perkebunan & Pertanian Tahunan',
    icon: 'Sprout',
    color: 'emerald',
    description: 'Hasil perkebunan dan pertanian tahunan langsung',
    fields: [
      { key: 'total_pendapatan_tahunan', label: 'Total Pendapatan Tahunan', placeholder: '12000000', suffix: '/tahun' }
    ],
    note: 'Input langsung pendapatan tahunan · Faktor pengeluaran 30%'
  },
  {
    id: 'kelapa_per3bulan',
    name: 'Perkebunan Kelapa Per 3 Bulan',
    icon: 'TreePalm',
    color: 'cyan',
    description: 'Kebun kelapa dengan panen per 3 bulan (4x setahun)',
    fields: [
      { key: 'jumlah_pohon', label: 'Jumlah Pohon Kelapa', placeholder: '30', suffix: 'pohon', defaultValue: 30 }
    ],
    note: 'Harga: 25 buah/pohon × Rp 2.000 · 4 panen/tahun · Pengeluaran 30%',
    hasDualMode: true
  },
  {
    id: 'industri_kopra',
    name: 'Industri Kelapa (Kopra)',
    icon: 'Package',
    color: 'orange',
    description: 'Pengolahan kelapa menjadi kopra',
    fields: [
      { key: 'berat_kopra', label: 'Berat Kopra Per Panen (Kg)', placeholder: '400', suffix: 'kg', defaultValue: 400 }
    ],
    note: 'Harga: (berat ÷ 5) × Rp 15.000 · 4 panen/tahun · Pengeluaran 30%',
    hasDualMode: true
  },
  {
    id: 'tempurung',
    name: 'Tempurung Kelapa',
    icon: 'Shell',
    color: 'brown',
    description: 'Penjualan tempurung kelapa per satuan kotak',
    fields: [
      { key: 'berat_tempurung', label: 'Berat Tempurung (Kg)', placeholder: '90', suffix: 'kg', defaultValue: 90 }
    ],
    note: 'Harga: (berat ÷ 10) × Rp 5.000 · Pengeluaran 10%'
  },
  {
    id: 'arang_tempurung',
    name: 'Tempurung → Arang',
    icon: 'Flame',
    color: 'rose',
    description: 'Tempurung kelapa diolah menjadi arang (nilai tambah)',
    fields: [
      { key: 'berat_tempurung', label: 'Berat Tempurung Dasar (Kg)', placeholder: '90', suffix: 'kg', defaultValue: 90 },
      { key: 'link_tempurung', label: 'Gunakan Nilai Tempurung Kategori 6', type: 'boolean', defaultValue: false }
    ],
    note: 'Nilai Harian = Nilai Box Tempurung + Rp 13.500 · Pengeluaran 10%'
  },
  {
    id: 'nelayan_tangkap',
    name: 'Nelayan Tangkap Ikan',
    icon: 'Fish',
    color: 'blue',
    description: 'Penangkapan ikan setiap hari, dihitung per unit tangkapan',
    fields: [
      { key: 'satuan_kg', label: 'Satuan Tangkapan (Kg)', placeholder: '1', suffix: 'kg/hari', defaultValue: 1 },
      { key: 'pemasukan_harian', label: 'Nilai Per Satuan (Rp)', placeholder: '150000', suffix: '/satuan' }
    ],
    note: 'Koefisien normatif 10% · Faktor pengeluaran 30% · Setiap hari'
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
 * Default: Rev = 10% | Exp = 30%
 */
export function calcKiosCampuran(inputs = {}) {
  const ph = parseFloat(inputs.pemasukan_harian) || 0;
  const revPct = getRevPct(inputs, 10);
  const expPct = getExpPct(inputs, 30);

  const totalPendapatan = ph * 30 * 12 * (revPct / 100);
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
    meta: { koefisien: `${revPct}%`, faktorPengeluaran: `${expPct}%`, pemasukan_harian: ph }
  };
}

/**
 * Category 2: Usaha Kuliner / Rumah Makan
 * Default: Rev = 60% | Exp = 40%
 */
export function calcKuliner(inputs = {}) {
  const ph = parseFloat(inputs.pemasukan_harian) || 0;
  const revPct = getRevPct(inputs, 60);
  const expPct = getExpPct(inputs, 40);

  const totalPendapatan = ph * 30 * 12 * (revPct / 100);
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
    meta: { koefisien: `${revPct}%`, faktorPengeluaran: `${expPct}%`, pemasukan_harian: ph }
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
 * Default: Rev = 10% | Exp = 30%
 */
export function calcNelayan(inputs = {}) {
  const satuan = parseFloat(inputs.satuan_kg) || 0;
  const ph = parseFloat(inputs.pemasukan_harian) || 0;
  const revPct = getRevPct(inputs, 10);
  const expPct = getExpPct(inputs, 30);

  const totalPendapatan = satuan * ph * 30 * 12 * (revPct / 100);
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
      catatan: 'Menangkap ikan setiap hari'
    }
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

  switch (categoryId) {
    case 'kios_campuran':
      return calcKiosCampuran(inputs);
    case 'kuliner_rumah_makan':
      return calcKuliner(inputs);
    case 'perkebunan_tahunan':
      return calcPerkebunanTahunan(inputs);
    case 'kelapa_per3bulan':
      return calcKelapaPerTigaBulan(inputs);
    case 'industri_kopra':
      return calcKopra(inputs);
    case 'tempurung':
      return calcTempurung(inputs);
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
      return calcArangTempurung(inputs, linkedBox);
    }
    case 'nelayan_tangkap':
      return calcNelayan(inputs);
    default:
      return {
        totalPendapatanTahunan: 0,
        totalPengeluaranTahunan: 0,
        totalHasilUsaha: 0,
        pendapatanPerBulan: 0,
        perPanen: null,
        setahun: null,
        meta: {}
      };
  }
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
