/**
 * regression_test.mjs
 * Full regression test suite for UMK Calculator.
 * Run: node regression_test.mjs
 *
 * Suite 1: Original normative formula assertions
 * Suite 2: Addendum #1 — Rincian Manual (toggle ON/OFF)
 * Suite 3: Addendum #2 — Frequency selector conversions
 */

import { calculateRecord, convertToAnnual, getConversionFormula } from './src/utils/calculations.js';

let pass = 0;
let fail = 0;

function assert(label, actual, expected, tolerance = 0.01) {
  const diff = Math.abs(actual - expected);
  const ok = diff <= tolerance;
  if (ok) {
    console.log(`  ✅ PASS: ${label}`);
    pass++;
  } else {
    console.log(`  ❌ FAIL: ${label}`);
    console.log(`         Expected: ${expected.toLocaleString('id-ID')}`);
    console.log(`         Actual:   ${actual.toLocaleString('id-ID')}`);
    console.log(`         Diff:     ${diff.toLocaleString('id-ID')}`);
    fail++;
  }
}

function assertEqual(label, actual, expected) {
  if (actual === expected) {
    console.log(`  ✅ PASS: ${label}`);
    pass++;
  } else {
    console.log(`  ❌ FAIL: ${label}`);
    console.log(`         Expected: ${JSON.stringify(expected)}`);
    console.log(`         Actual:   ${JSON.stringify(actual)}`);
    fail++;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// SUITE 1: Original normative formula regressions
// ─────────────────────────────────────────────────────────────────────────
console.log('\n══ SUITE 1: Normative Formula Regressions ══\n');

{
  const r = calculateRecord({
    id: 't1', categoryId: 'kios_campuran',
    inputs: { pemasukan_harian: '500000', custom_days: '30', custom_rev_pct: '10', custom_exp_pct: '30' }
  }, []);
  console.log('KBLI 47112 - Kios Campuran:');
  assert('Pendapatan Tahunan', r.totalPendapatanTahunan, 18_000_000);
  assert('Pengeluaran Tahunan', r.totalPengeluaranTahunan, 5_400_000);
  assert('Hasil Usaha Bersih', r.totalHasilUsaha, 12_600_000);
  assert('Pendapatan/Bulan', r.pendapatanPerBulan, 1_050_000);
  assertEqual('isDetailPengeluaranActive = false', r.bps.isDetailPengeluaranActive, false);
}

{
  const r = calculateRecord({
    id: 't2', categoryId: 'kelapa_per3bulan',
    inputs: { jumlah_pohon: '30', custom_exp_pct: '30' }
  }, []);
  console.log('\nKBLI 01262 - Buah Kelapa (30 pohon):');
  assert('Pendapatan Tahunan', r.totalPendapatanTahunan, 6_000_000);
  assert('Pengeluaran Tahunan', r.totalPengeluaranTahunan, 1_800_000);
  assert('Hasil Usaha Bersih', r.totalHasilUsaha, 4_200_000);
  assert('Pendapatan/Bulan', r.pendapatanPerBulan, 350_000);
}

{
  const r = calculateRecord({
    id: 't3', categoryId: 'industri_kopra',
    inputs: { berat_kopra: '400', custom_exp_pct: '30' }
  }, []);
  console.log('\nKBLI 10411 - Kopra (400kg):');
  assert('Pendapatan Tahunan', r.totalPendapatanTahunan, 4_800_000);
  assert('Pengeluaran Tahunan', r.totalPengeluaranTahunan, 1_440_000);
  assert('Hasil Usaha Bersih', r.totalHasilUsaha, 3_360_000);
  assert('Pendapatan/Bulan', r.pendapatanPerBulan, 280_000);
}

// ─────────────────────────────────────────────────────────────────────────
// SUITE 2: Addendum #1 — Rincian Manual toggle ON/OFF
// ─────────────────────────────────────────────────────────────────────────
console.log('\n══ SUITE 2: Addendum #1 — Rincian Manual ══\n');

const baseNelayanInputs = {
  satuan_kg: '1', pemasukan_harian: '100000',
  custom_rev_pct: '10', custom_days: '30', custom_exp_pct: '30'
};

{
  const r = calculateRecord({ id: 'n1', categoryId: 'nelayan_tangkap', inputs: { ...baseNelayanInputs } }, []);
  console.log('nelayan_tangkap — NORMATIF (toggle OFF):');
  assert('Pendapatan Tahunan', r.totalPendapatanTahunan, 3_600_000);
  assert('Pengeluaran 30%', r.totalPengeluaranTahunan, 1_080_000);
  assert('Hasil Usaha Bersih', r.totalHasilUsaha, 2_520_000);
  assert('Pendapatan/Bulan', r.pendapatanPerBulan, 210_000);
}

{
  const r = calculateRecord({ id: 'n2', categoryId: 'nelayan_tangkap', inputs: {
    ...baseNelayanInputs,
    use_detail_pengeluaran: true,
    biaya_upah: '600000', biaya_produksi: '300000',
    biaya_operasional: '150000', biaya_non_operasional: '50000'
    // All freq keys absent → defaults to 'tahunan' (×1)
  }}, []);
  console.log('\nnelayan_tangkap — RINCIAN MANUAL (tahunan, no freq keys):');
  assert('Pendapatan Tahunan tidak berubah', r.totalPendapatanTahunan, 3_600_000);
  assert('26f = 1.100.000', r.totalPengeluaranTahunan, 1_100_000);
  assert('Hasil Usaha Bersih', r.totalHasilUsaha, 2_500_000);
  assert('Pendapatan/Bulan ≈ 208.333', r.pendapatanPerBulan, 208_333, 1);
  assertEqual('isDetailPengeluaranActive', r.bps.isDetailPengeluaranActive, true);
}

{
  // Toggle OFF — data preserved, normative restored
  const r = calculateRecord({ id: 'n3', categoryId: 'nelayan_tangkap', inputs: {
    ...baseNelayanInputs,
    use_detail_pengeluaran: false,
    biaya_upah: '600000', biaya_produksi: '300000',
    biaya_operasional: '150000', biaya_non_operasional: '50000'
  }}, []);
  console.log('\nnelayan_tangkap — toggle OFF kembali:');
  assert('Pengeluaran kembali normatif', r.totalPengeluaranTahunan, 1_080_000);
  assert('Laba bersih kembali 2.520.000', r.totalHasilUsaha, 2_520_000);
  assertEqual('isDetailPengeluaranActive = false', r.bps.isDetailPengeluaranActive, false);
}

// ─────────────────────────────────────────────────────────────────────────
// SUITE 3: Addendum #2 — Frequency selector conversions
// ─────────────────────────────────────────────────────────────────────────
console.log('\n══ SUITE 3: Addendum #2 — Frequency Selector ══\n');

// 3.1 Unit tests for convertToAnnual()
console.log('3.1 convertToAnnual() unit tests:');
assert('tahunan ×1 (500k)', convertToAnnual(500_000, 'tahunan', 30), 500_000);
assert('bulanan ×12 (500k)', convertToAnnual(500_000, 'bulanan', 30), 6_000_000);
assert('mingguan ×52 (100k)', convertToAnnual(100_000, 'mingguan', 30), 5_200_000);
assert('harian ×30×12 (50k, 30 hari)', convertToAnnual(50_000, 'harian', 30), 18_000_000);
assert('harian ×25×12 (50k, 25 hari)', convertToAnnual(50_000, 'harian', 25), 15_000_000);
assert('null freq → tahunan ×1', convertToAnnual(200_000, null, 30), 200_000);
assert('undefined freq → tahunan ×1', convertToAnnual(200_000, undefined, 30), 200_000);

// 3.2 Kasus Bagian 3 — kuliner_rumah_makan dengan frekuensi bulanan
console.log('\n3.2 Kasus prompt Bagian 3 — KBLI 56101 (Restoran), 26b+26d bulanan:');
{
  const r = calculateRecord({ id: 'k1', categoryId: 'kuliner_rumah_makan', inputs: {
    pemasukan_harian: '500000',
    custom_rev_pct: '60', custom_exp_pct: '40', custom_days: '30',
    use_detail_pengeluaran: true,
    biaya_upah: '0',           biaya_upah_freq: 'tahunan',
    biaya_produksi: '200000',  biaya_produksi_freq: 'bulanan',  // × 12 = 2.400.000
    biaya_operasional: '500000', biaya_operasional_freq: 'bulanan', // × 12 = 6.000.000
    biaya_non_operasional: '0', biaya_non_operasional_freq: 'tahunan'
  }}, []);
  assert('26f total = 8.400.000', r.totalPengeluaranTahunan, 8_400_000);
  assertEqual('isDetailPengeluaranActive', r.bps.isDetailPengeluaranActive, true);
  // Pendapatan: 500.000 × 30 × 12 × 60% = 108.000.000
  assert('Pendapatan tidak berubah', r.totalPendapatanTahunan, 108_000_000);
  assert('Hasil Usaha Bersih', r.totalHasilUsaha, 108_000_000 - 8_400_000);
  // Footer 26f total check
  assert('totalPengeluaranDetail = 8.400.000', r.bps.totalPengeluaranDetail, 8_400_000);
}

// 3.3 Kasus per Hari dengan custom_days berbeda (25 hari)
console.log('\n3.3 Konversi per Hari dengan custom_days = 25:');
{
  const r = calculateRecord({ id: 'k2', categoryId: 'kuliner_rumah_makan', inputs: {
    pemasukan_harian: '500000',
    custom_rev_pct: '60', custom_exp_pct: '40', custom_days: '25',
    use_detail_pengeluaran: true,
    biaya_produksi: '50000', biaya_produksi_freq: 'harian'  // 50k × 25 × 12 = 15.000.000
  }}, []);
  assert('26b harian 50k × 25 × 12 = 15.000.000', r.totalPengeluaranTahunan, 15_000_000);
}

// 3.4 custom_days berubah dari 25 → 30 (reaktivitas per Hari)
console.log('\n3.4 Reaktivitas per Hari: custom_days 25 → 30:');
{
  const r30 = calculateRecord({ id: 'k3', categoryId: 'kuliner_rumah_makan', inputs: {
    pemasukan_harian: '500000',
    custom_rev_pct: '60', custom_exp_pct: '40', custom_days: '30',
    use_detail_pengeluaran: true,
    biaya_produksi: '50000', biaya_produksi_freq: 'harian'  // 50k × 30 × 12 = 18.000.000
  }}, []);
  assert('26b harian 50k × 30 × 12 = 18.000.000', r30.totalPengeluaranTahunan, 18_000_000);
}

// 3.5 Kasus per Minggu
console.log('\n3.5 Konversi per Minggu (100k × 52 = 5.200.000):');
{
  const r = calculateRecord({ id: 'k4', categoryId: 'kuliner_rumah_makan', inputs: {
    pemasukan_harian: '500000',
    custom_rev_pct: '60', custom_exp_pct: '40', custom_days: '30',
    use_detail_pengeluaran: true,
    biaya_non_operasional: '100000', biaya_non_operasional_freq: 'mingguan'
  }}, []);
  assert('26e mingguan 100k × 52 = 5.200.000', r.totalPengeluaranTahunan, 5_200_000);
}

// 3.6 Backward compatibility — data lama tanpa freq keys
console.log('\n3.6 Backward compatibility — data lama tanpa freq keys:');
{
  const oldData = { id: 'old', categoryId: 'nelayan_tangkap', inputs: {
    ...baseNelayanInputs,
    use_detail_pengeluaran: true,
    // Data lama: hanya nilai, tanpa _freq keys
    biaya_upah: '600000', biaya_produksi: '300000',
    biaya_operasional: '150000', biaya_non_operasional: '50000'
  }};
  const r = calculateRecord(oldData, []);
  // Tanpa freq key → default 'tahunan' → ×1 → sama seperti sebelum fitur ini
  assert('26f tetap 1.100.000 (backward compat)', r.totalPengeluaranTahunan, 1_100_000);
  assert('Laba bersih tetap 2.500.000', r.totalHasilUsaha, 2_500_000);
}

// 3.7 getConversionFormula() unit tests
console.log('\n3.7 getConversionFormula() unit tests:');
assertEqual('tahunan → null', getConversionFormula(500_000, 'tahunan', 30), null);
assertEqual('bulanan formula', getConversionFormula(200_000, 'bulanan', 30), '200.000 × 12 bulan');
assertEqual('mingguan formula', getConversionFormula(100_000, 'mingguan', 30), '100.000 × 52 minggu');
assertEqual('harian formula 25 hari', getConversionFormula(50_000, 'harian', 25), '50.000 × 25 hari × 12 bulan');

// ─────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────
console.log(`\n══ HASIL: ${pass} lulus, ${fail} gagal ══`);
if (fail === 0) {
  console.log('✅ Semua regression test LULUS.');
} else {
  console.log('❌ Ada regression test GAGAL.');
  process.exit(1);
}
