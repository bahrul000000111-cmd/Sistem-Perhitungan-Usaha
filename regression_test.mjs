/**
 * regression_test.mjs
 * Full regression test suite for UMK Calculator.
 * Run: node regression_test.mjs
 *
 * Suite 1: Original normative formula assertions
 * Suite 2: Addendum #1 — Rincian Manual (toggle ON/OFF)
 * Suite 3: Addendum #2 — Frequency selector conversions
 */

import { calculateRecord, convertToAnnual, getConversionFormula, convertToDaily } from './src/utils/calculations.js';

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
// SUITE 4: Addendum #7 — Income Method Selector (Perikanan / nelayan_tangkap)
// ─────────────────────────────────────────────────────────────────────────
console.log('\n══ SUITE 4: Addendum #7 — Income Method Selector (Perikanan) ══\n');

// 4.1 convertToDaily() unit tests
console.log('4.1 convertToDaily() unit tests:');
assert('harian → langsung (150k)', convertToDaily(150_000, 'harian', 30), 150_000);
assert('mingguan ÷7 (1.050.000 ÷ 7)', convertToDaily(1_050_000, 'mingguan', 30), 150_000);
assert('bulanan ÷30 (4.500.000 ÷ 30)', convertToDaily(4_500_000, 'bulanan', 30), 150_000);
assert('tahunan ÷12÷30 (54.000.000 ÷12÷30)', convertToDaily(54_000_000, 'tahunan', 30), 150_000);
assert('null freq → harian (÷1)', convertToDaily(300_000, null, 30), 300_000);
assert('undefined freq → harian (÷1)', convertToDaily(300_000, undefined, 30), 300_000);

// 4.2 Non-regresi Opsi A (default — tidak ada income_method di inputs)
// satuan=1, pemasukan_harian=150000, koef=10%, hari=30
// → totalPendapatan = 1 × 150000 × 30 × 12 × 10% = 5.400.000
console.log('\n4.2 Non-regresi Opsi A (existing data tanpa income_method):');
{
  const r = calculateRecord({ id: 'a7-1', categoryId: 'nelayan_tangkap', inputs: {
    satuan_kg: '1', pemasukan_harian: '150000',
    custom_rev_pct: '10', custom_exp_pct: '30', custom_days: '30'
    // income_method intentionally absent → should default to 'volume_harga'
  }}, []);
  assert('Pendapatan Tahunan = 5.400.000', r.totalPendapatanTahunan, 5_400_000);
  assert('Pengeluaran Tahunan = 1.620.000', r.totalPengeluaranTahunan, 1_620_000);
  assert('Hasil Usaha Bersih = 3.780.000', r.totalHasilUsaha, 3_780_000);
  assertEqual('income_method meta = volume_harga', r.meta.income_method, 'volume_harga');
}

// 4.3 Opsi A explicit (income_method = 'volume_harga')
// identik dengan 4.2 tapi income_method di-set eksplisit
console.log('\n4.3 Opsi A explicit (income_method = volume_harga):');
{
  const r = calculateRecord({ id: 'a7-2', categoryId: 'nelayan_tangkap', inputs: {
    income_method: 'volume_harga',
    satuan_kg: '1', pemasukan_harian: '150000',
    custom_rev_pct: '10', custom_exp_pct: '30', custom_days: '30'
  }}, []);
  assert('Pendapatan Tahunan = 5.400.000', r.totalPendapatanTahunan, 5_400_000);
  assert('Hasil Usaha Bersih = 3.780.000', r.totalHasilUsaha, 3_780_000);
}

// 4.4 Opsi B — per Hari, harus identik dengan Opsi A secara matematis
// pemasukan_langsung=150000 /hari, koef=10%, hari=30
// basis harian = 150000, totalPendapatan = 150000 × 30 × 12 × 10% = 5.400.000
console.log('\n4.4 Opsi B per Hari — harus SAMA dengan Opsi A:');
{
  const r = calculateRecord({ id: 'a7-3', categoryId: 'nelayan_tangkap', inputs: {
    income_method: 'nilai_langsung',
    pemasukan_langsung: '150000', pemasukan_langsung_freq: 'harian',
    custom_rev_pct: '10', custom_exp_pct: '30', custom_days: '30'
  }}, []);
  assert('Pendapatan Tahunan = 5.400.000 (konsisten Opsi A)', r.totalPendapatanTahunan, 5_400_000);
  assert('Pengeluaran Tahunan = 1.620.000', r.totalPengeluaranTahunan, 1_620_000);
  assert('Hasil Usaha Bersih = 3.780.000', r.totalHasilUsaha, 3_780_000);
  assertEqual('income_method meta = nilai_langsung', r.meta.income_method, 'nilai_langsung');
}

// 4.5 Opsi B — per Bulan, konversi bulanan → harian benar
// pemasukan_langsung=4.500.000 /bulan, hari=30
// basis harian = 4.500.000 ÷ 30 = 150.000/hari
// totalPendapatan = 150000 × 30 × 12 × 10% = 5.400.000
console.log('\n4.5 Opsi B per Bulan — konversi bulanan→harian:');
{
  const r = calculateRecord({ id: 'a7-4', categoryId: 'nelayan_tangkap', inputs: {
    income_method: 'nilai_langsung',
    pemasukan_langsung: '4500000', pemasukan_langsung_freq: 'bulanan',
    custom_rev_pct: '10', custom_exp_pct: '30', custom_days: '30'
  }}, []);
  assert('Basis harian derived = 150.000', r.meta.pendapatanHarianDerived, 150_000);
  assert('Pendapatan Tahunan = 5.400.000', r.totalPendapatanTahunan, 5_400_000);
  assert('Hasil Usaha Bersih = 3.780.000', r.totalHasilUsaha, 3_780_000);
}

// 4.6 Opsi B — per Minggu
// pemasukan_langsung=1.050.000 /minggu → harian = 1.050.000 ÷ 7 = 150.000
console.log('\n4.6 Opsi B per Minggu — konversi mingguan→harian:');
{
  const r = calculateRecord({ id: 'a7-5', categoryId: 'nelayan_tangkap', inputs: {
    income_method: 'nilai_langsung',
    pemasukan_langsung: '1050000', pemasukan_langsung_freq: 'mingguan',
    custom_rev_pct: '10', custom_exp_pct: '30', custom_days: '30'
  }}, []);
  assert('Basis harian derived ≈ 150.000', r.meta.pendapatanHarianDerived, 150_000);
  assert('Pendapatan Tahunan = 5.400.000', r.totalPendapatanTahunan, 5_400_000);
}

// 4.7 Opsi B — per Tahun
// pemasukan_langsung=54.000.000 /tahun → harian = 54.000.000 ÷ 12 ÷ 30 = 150.000
console.log('\n4.7 Opsi B per Tahun — konversi tahunan→harian:');
{
  const r = calculateRecord({ id: 'a7-6', categoryId: 'nelayan_tangkap', inputs: {
    income_method: 'nilai_langsung',
    pemasukan_langsung: '54000000', pemasukan_langsung_freq: 'tahunan',
    custom_rev_pct: '10', custom_exp_pct: '30', custom_days: '30'
  }}, []);
  assert('Basis harian derived = 150.000', r.meta.pendapatanHarianDerived, 150_000);
  assert('Pendapatan Tahunan = 5.400.000', r.totalPendapatanTahunan, 5_400_000);
}

// 4.8 Backward compat — existing data (satuan_kg + pemasukan_harian) tidak berubah
// Membuktikan record existing (tanpa income_method) tetap default ke Opsi A
console.log('\n4.8 Backward compat — record lama (tanpa income_method) tetap Opsi A:');
{
  const r = calculateRecord({ id: 'a7-7', categoryId: 'nelayan_tangkap', inputs: {
    satuan_kg: '2', pemasukan_harian: '100000',
    custom_rev_pct: '10', custom_exp_pct: '30', custom_days: '30'
    // Tidak ada income_method — harus default ke volume_harga
  }}, []);
  // 2 × 100000 × 30 × 12 × 10% = 7.200.000
  assert('Pendapatan Tahunan = 7.200.000', r.totalPendapatanTahunan, 7_200_000);
  assert('Hasil Usaha Bersih = 5.040.000', r.totalHasilUsaha, 5_040_000);
  assertEqual('income_method meta = volume_harga', r.meta.income_method, 'volume_harga');
}

// 4.9 State preservation — both method inputs coexist in same record
// User fills Opsi A, switches to Opsi B (both values in state), switches back → Opsi A still works
console.log('\n4.9 State preservation — kedua method tersimpan, kalkulasi gunakan yang aktif:');
{
  const inputsBothFilled = {
    // Opsi A fields
    income_method: 'volume_harga',  // currently active = Opsi A
    satuan_kg: '2', pemasukan_harian: '100000',
    // Opsi B fields also present (preserved from earlier)
    pemasukan_langsung: '250000', pemasukan_langsung_freq: 'harian',
    custom_rev_pct: '10', custom_exp_pct: '30', custom_days: '30'
  };
  const rA = calculateRecord({ id: 'a7-8a', categoryId: 'nelayan_tangkap', inputs: inputsBothFilled }, []);
  assert('Opsi A aktif: 2×100k×30×12×10% = 7.200.000', rA.totalPendapatanTahunan, 7_200_000);

  // Now switch to Opsi B — same record inputs but method changed
  const rB = calculateRecord({ id: 'a7-8b', categoryId: 'nelayan_tangkap', inputs: {
    ...inputsBothFilled, income_method: 'nilai_langsung'
  }}, []);
  // 250000/hari × 30 × 12 × 10% = 9.000.000
  assert('Opsi B aktif: 250k/hari→9.000.000', rB.totalPendapatanTahunan, 9_000_000);

  // Switch back to Opsi A — Opsi A fields must still work
  const rABack = calculateRecord({ id: 'a7-8c', categoryId: 'nelayan_tangkap', inputs: {
    ...inputsBothFilled, income_method: 'volume_harga'
  }}, []);
  assert('Kembali Opsi A: masih 7.200.000 (tidak ter-reset)', rABack.totalPendapatanTahunan, 7_200_000);
}

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
