/**
 * regression_test.mjs
 * Full regression test suite for UMK Calculator.
 * Run: node regression_test.mjs
 *
 * Suite 1: Original normative formula assertions
 * Suite 2: Addendum #1 — Rincian Manual (toggle ON/OFF)
 * Suite 3: Addendum #2 — Frequency selector conversions
 */

import { calculateRecord, convertToAnnual, getConversionFormula, convertToDaily, resolveWorkers, convertHarvestToAnnual, migrateLegacyNelayanInputs, computeAutoFillPengeluaran } from './src/utils/calculations.js';

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
  assert('Pendapatan Tahunan', r.totalPendapatanTahunan, 180_000_000);
  assert('Pengeluaran Tahunan', r.totalPengeluaranTahunan, 0);
  assert('Hasil Usaha Bersih', r.totalHasilUsaha, 180_000_000);
  assert('Pendapatan/Bulan', r.pendapatanPerBulan, 15_000_000);
  assertEqual('isDetailPengeluaranActive = true', r.bps.isDetailPengeluaranActive, true);
}

{
  const r = calculateRecord({
    id: 't2', categoryId: 'kelapa_per3bulan',
    inputs: { jumlah_pohon: '30', custom_exp_pct: '30' }
  }, []);
  console.log('\nKBLI 01262 - Buah Kelapa (30 pohon):');
  assert('Pendapatan Tahunan', r.totalPendapatanTahunan, 6_000_000);
  assert('Pengeluaran Tahunan', r.totalPengeluaranTahunan, 0);
  assert('Hasil Usaha Bersih', r.totalHasilUsaha, 6_000_000);
  assert('Pendapatan/Bulan', r.pendapatanPerBulan, 500_000);
}

{
  const r = calculateRecord({
    id: 't3', categoryId: 'industri_kopra',
    inputs: { berat_kopra: '400', custom_exp_pct: '30' }
  }, []);
  console.log('\nKBLI 10411 - Kopra (400kg):');
  assert('Pendapatan Tahunan', r.totalPendapatanTahunan, 4_800_000);
  assert('Pengeluaran Tahunan', r.totalPengeluaranTahunan, 0);
  assert('Hasil Usaha Bersih', r.totalHasilUsaha, 4_800_000);
  assert('Pendapatan/Bulan', r.pendapatanPerBulan, 400_000);
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
  assert('Pendapatan Tahunan', r.totalPendapatanTahunan, 36_000_000);
  assert('Pengeluaran 0', r.totalPengeluaranTahunan, 0);
  assert('Hasil Usaha Bersih', r.totalHasilUsaha, 36_000_000);
  assert('Pendapatan/Bulan', r.pendapatanPerBulan, 3_000_000);
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
  assert('Pendapatan Tahunan tidak berubah', r.totalPendapatanTahunan, 36_000_000);
  assert('26f = 1.100.000', r.totalPengeluaranTahunan, 1_100_000);
  assert('Hasil Usaha Bersih', r.totalHasilUsaha, 34_900_000);
  assert('Pendapatan/Bulan ≈ 2.908.333', r.pendapatanPerBulan, 2_908_333.33, 1);
  assertEqual('isDetailPengeluaranActive', r.bps.isDetailPengeluaranActive, true);
}

{
  // Toggle OFF is overridden to true
  const r = calculateRecord({ id: 'n3', categoryId: 'nelayan_tangkap', inputs: {
    ...baseNelayanInputs,
    use_detail_pengeluaran: false,
    biaya_upah: '600000', biaya_produksi: '300000',
    biaya_operasional: '150000', biaya_non_operasional: '50000'
  }}, []);
  console.log('\nnelayan_tangkap — toggle OFF kembali:');
  assert('Pengeluaran tetap manual (overridden)', r.totalPengeluaranTahunan, 1_100_000);
  assert('Laba bersih tetap manual (overridden)', r.totalHasilUsaha, 34_900_000);
  assertEqual('isDetailPengeluaranActive = true', r.bps.isDetailPengeluaranActive, true);
}

// ─────────────────────────────────────────────────────────────────────────
// SUITE 3: Addendum #2 — Frequency selector conversions
// ─────────────────────────────────────────────────────────────────────────
console.log('\n══ SUITE 3: Addendum #2 — Frequency Selector ══\n');

// 3.1 Unit tests for convertToAnnual()
console.log('3.1 convertToAnnual() unit tests:');
assert('tahunan ×1 (500k)', convertToAnnual(500_000, 'tahunan', 30), 500_000);
assert('bulanan ×12 (500k)', convertToAnnual(500_000, 'bulanan', 30), 6_000_000);
assert('mingguan ×48 (100k)', convertToAnnual(100_000, 'mingguan', 30), 4_800_000);
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
  // Pendapatan: 500.000 × 30 × 12 = 180.000.000
  assert('Pendapatan tidak berubah', r.totalPendapatanTahunan, 180_000_000);
  assert('Hasil Usaha Bersih', r.totalHasilUsaha, 180_000_000 - 8_400_000);
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
console.log('\n3.5 Konversi per Minggu (100k × 48 = 4.800.000):');
{
  const r = calculateRecord({ id: 'k4', categoryId: 'kuliner_rumah_makan', inputs: {
    pemasukan_harian: '500000',
    custom_rev_pct: '60', custom_exp_pct: '40', custom_days: '30',
    use_detail_pengeluaran: true,
    biaya_non_operasional: '100000', biaya_non_operasional_freq: 'mingguan'
  }}, []);
  assert('26e mingguan 100k × 48 = 4.800.000', r.totalPengeluaranTahunan, 4_800_000);
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
  assert('Laba bersih tetap 34.900.000', r.totalHasilUsaha, 34_900_000);
}

// 3.7 getConversionFormula() unit tests
console.log('\n3.7 getConversionFormula() unit tests:');
assertEqual('tahunan → null', getConversionFormula(500_000, 'tahunan', 30), null);
assertEqual('bulanan formula', getConversionFormula(200_000, 'bulanan', 30), '200.000 × 12 bulan');
assertEqual('mingguan formula', getConversionFormula(100_000, 'mingguan', 30), '100.000 × 4 minggu × 12 bulan');
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
// satuan=1, pemasukan_harian=150000, koef=100%, hari=30
// → totalPendapatan = 1 × 150000 × 30 × 12 = 54.000.000
console.log('\n4.2 Non-regresi Opsi A (existing data tanpa income_method):');
{
  const r = calculateRecord({ id: 'a7-1', categoryId: 'nelayan_tangkap', inputs: {
    satuan_kg: '1', pemasukan_harian: '150000',
    custom_rev_pct: '10', custom_exp_pct: '30', custom_days: '30'
    // income_method intentionally absent → should default to 'volume_harga'
  }}, []);
  assert('Pendapatan Tahunan = 54.000.000', r.totalPendapatanTahunan, 54_000_000);
  assert('Pengeluaran Tahunan = 0', r.totalPengeluaranTahunan, 0);
  assert('Hasil Usaha Bersih = 54.000.000', r.totalHasilUsaha, 54_000_000);
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
  assert('Pendapatan Tahunan = 54.000.000', r.totalPendapatanTahunan, 54_000_000);
  assert('Hasil Usaha Bersih = 54.000.000', r.totalHasilUsaha, 54_000_000);
}

// 4.4 Opsi B — per Hari, harus identik dengan Opsi A secara matematis
// pemasukan_langsung=150000 /hari, koef=100%, hari=30
// basis harian = 150000, totalPendapatan = 150000 × 30 × 12 = 54.000.000
console.log('\n4.4 Opsi B per Hari — harus SAMA dengan Opsi A:');
{
  const r = calculateRecord({ id: 'a7-3', categoryId: 'nelayan_tangkap', inputs: {
    income_method: 'nilai_langsung',
    pemasukan_langsung: '150000', pemasukan_langsung_freq: 'harian',
    custom_rev_pct: '10', custom_exp_pct: '30', custom_days: '30'
  }}, []);
  assert('Pendapatan Tahunan = 54.000.000 (konsisten Opsi A)', r.totalPendapatanTahunan, 54_000_000);
  assert('Pengeluaran Tahunan = 0', r.totalPengeluaranTahunan, 0);
  assert('Hasil Usaha Bersih = 54.000.000', r.totalHasilUsaha, 54_000_000);
  assertEqual('income_method meta = nilai_langsung', r.meta.income_method, 'nilai_langsung');
}

// 4.5 Opsi B — per Bulan, konversi bulanan → harian benar
// pemasukan_langsung=4.500.000 /bulan, hari=30
// basis harian = 4.500.000 ÷ 30 = 150.000/hari
// totalPendapatan = 150000 × 30 × 12 = 54.000.000
console.log('\n4.5 Opsi B per Bulan — konversi bulanan→harian:');
{
  const r = calculateRecord({ id: 'a7-4', categoryId: 'nelayan_tangkap', inputs: {
    income_method: 'nilai_langsung',
    pemasukan_langsung: '4500000', pemasukan_langsung_freq: 'bulanan',
    custom_rev_pct: '10', custom_exp_pct: '30', custom_days: '30'
  }}, []);
  assert('Basis harian derived = 150.000', r.meta.pendapatanHarianDerived, 150_000);
  assert('Pendapatan Tahunan = 54.000.000', r.totalPendapatanTahunan, 54_000_000);
  assert('Hasil Usaha Bersih = 54.000.000', r.totalHasilUsaha, 54_000_000);
}

// 4.6 Opsi B — per Minggu
// pemasukan_langsung=1.050.000 /minggu → factor = 48
// totalPendapatan = 1.050.000 × 48 = 50.400.000
// basis harian derived = (1.050.000 × 48) ÷ (30 × 12) = 140.000
console.log('\n4.6 Opsi B per Minggu — konversi mingguan→harian:');
{
  const r = calculateRecord({ id: 'a7-5', categoryId: 'nelayan_tangkap', inputs: {
    income_method: 'nilai_langsung',
    pemasukan_langsung: '1050000', pemasukan_langsung_freq: 'mingguan',
    custom_rev_pct: '10', custom_exp_pct: '30', custom_days: '30'
  }}, []);
  assert('Basis harian derived ≈ 140.000', r.meta.pendapatanHarianDerived, 140_000);
  assert('Pendapatan Tahunan = 50.400.000', r.totalPendapatanTahunan, 50_400_000);
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
  assert('Pendapatan Tahunan = 54.000.000', r.totalPendapatanTahunan, 54_000_000);
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
  // 2 × 100000 × 30 × 12 = 72.000.000
  assert('Pendapatan Tahunan = 72.000.000', r.totalPendapatanTahunan, 72_000_000);
  assert('Hasil Usaha Bersih = 72.000.000', r.totalHasilUsaha, 72_000_000);
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
  assert('Opsi A aktif: 2×100k×30×12 = 72.000.000', rA.totalPendapatanTahunan, 72_000_000);

  // Now switch to Opsi B — same record inputs but method changed
  const rB = calculateRecord({ id: 'a7-8b', categoryId: 'nelayan_tangkap', inputs: {
    ...inputsBothFilled, income_method: 'nilai_langsung'
  }}, []);
  // 250000/hari × 30 × 12 = 90.000.000
  assert('Opsi B aktif: 250k/hari→90.000.000', rB.totalPendapatanTahunan, 90_000_000);

  // Switch back to Opsi A — Opsi A fields must still work
  const rABack = calculateRecord({ id: 'a7-8c', categoryId: 'nelayan_tangkap', inputs: {
    ...inputsBothFilled, income_method: 'volume_harga'
  }}, []);
  assert('Kembali Opsi A: masih 72.000.000 (tidak ter-reset)', rABack.totalPendapatanTahunan, 72_000_000);
}

// 4.10 Verifikasi Addendum #15 (Test Cases dari user)
// Koefisien = 100%, Hari Kerja = 20, Nilai = 75.000
console.log('\n4.10 Verifikasi Addendum #15 (Test Cases dari user):');
{
  // A. per Hari: 75.000 × (20 × 12) = 18.000.000
  const rHari = calculateRecord({ id: 'a15-hari', categoryId: 'nelayan_tangkap', inputs: {
    income_method: 'nilai_langsung',
    pemasukan_langsung: '75000', pemasukan_langsung_freq: 'harian',
    custom_rev_pct: '10', custom_days: '20'
  }}, []);
  assert('per Hari: 75.000 × 20 × 12 = 18.000.000', rHari.totalPendapatanTahunan, 18_000_000);

  // B. per Minggu: 75.000 × 48 = 3.600.000
  const rMinggu = calculateRecord({ id: 'a15-minggu', categoryId: 'nelayan_tangkap', inputs: {
    income_method: 'nilai_langsung',
    pemasukan_langsung: '75000', pemasukan_langsung_freq: 'mingguan',
    custom_rev_pct: '10', custom_days: '20'
  }}, []);
  assert('per Minggu: 75.000 × 48 = 3.600.000', rMinggu.totalPendapatanTahunan, 3_600_000);

  // C. per Bulan: 75.000 × 12 = 900.000
  const rBulan = calculateRecord({ id: 'a15-bulan', categoryId: 'nelayan_tangkap', inputs: {
    income_method: 'nilai_langsung',
    pemasukan_langsung: '75000', pemasukan_langsung_freq: 'bulanan',
    custom_rev_pct: '10', custom_days: '20'
  }}, []);
  assert('per Bulan: 75.000 × 12 = 900.000', rBulan.totalPendapatanTahunan, 900_000);

  // D. per Tahun: 75.000 × 1 = 75.000
  const rTahun = calculateRecord({ id: 'a15-tahun', categoryId: 'nelayan_tangkap', inputs: {
    income_method: 'nilai_langsung',
    pemasukan_langsung: '75000', pemasukan_langsung_freq: 'tahunan',
    custom_rev_pct: '10', custom_days: '20'
  }}, []);
  assert('per Tahun: 75.000 × 1 = 75.000', rTahun.totalPendapatanTahunan, 75_000);
}

// ─────────────────────────────────────────────────────────────────────────
// SUITE 5: Addendum #8 — Pekerja Dibayar / Tidak Dibayar + Wage Estimation
// ─────────────────────────────────────────────────────────────────────────
console.log('\n══ SUITE 5: Addendum #8 — Pekerja Dibayar / Tidak Dibayar ══\n');

// 5.1 resolveWorkers() — new-format keys
console.log('5.1 resolveWorkers() — new-format keys:');
{
  const w = resolveWorkers({
    pekerja_dibayar_l: '3', pekerja_dibayar_p: '1',
    pekerja_tidak_dibayar_l: '1', pekerja_tidak_dibayar_p: '0'
  });
  assert('dibayarL = 3', w.dibayarL, 3);
  assert('dibayarP = 1', w.dibayarP, 1);
  assert('tidakDibayarL = 1', w.tidakDibayarL, 1);
  assert('tidakDibayarP = 0', w.tidakDibayarP, 0);
  assert('totalDibayar = 4', w.totalDibayar, 4);
  assert('totalTidakDibayar = 1', w.totalTidakDibayar, 1);
  assert('pekerjaL = 4 (3+1)', w.pekerjaL, 4);
  assert('pekerjaP = 1 (1+0)', w.pekerjaP, 1);
  assert('total = 5', w.total, 5);
}

// 5.2 resolveWorkers() — backward compat (legacy pekerja_l/p → all dibayar)
console.log('\n5.2 resolveWorkers() — backward compat (legacy keys):');
{
  const w = resolveWorkers({ pekerja_l: '2', pekerja_p: '1' });
  assert('totalDibayar = 3 (all from legacy)', w.totalDibayar, 3);
  assert('totalTidakDibayar = 0 (none in legacy)', w.totalTidakDibayar, 0);
  assert('total = 3', w.total, 3);
  assert('pekerjaL = 2', w.pekerjaL, 2);
  assert('pekerjaP = 1', w.pekerjaP, 1);
}

// 5.3 resolveWorkers() — empty
console.log('\n5.3 resolveWorkers() — empty inputs:');
{
  const w = resolveWorkers({});
  assert('total = 0 (empty)', w.total, 0);
  assert('totalDibayar = 0', w.totalDibayar, 0);
  assert('totalTidakDibayar = 0', w.totalTidakDibayar, 0);
}

// 5.4 calculateRecord().bps — new keys: badge totalPekerja = 5
console.log('\n5.4 calculateRecord bps.totalPekerja = Dibayar + TidakDibayar:');
{
  const r = calculateRecord({ id: 'a8-1', categoryId: 'kios_campuran', inputs: {
    pemasukan_harian: '500000', custom_rev_pct: '10', custom_exp_pct: '30', custom_days: '30',
    pekerja_dibayar_l: '3', pekerja_dibayar_p: '1',
    pekerja_tidak_dibayar_l: '1', pekerja_tidak_dibayar_p: '0'
  }}, []);
  assert('bps.totalPekerja = 5', r.bps.totalPekerja, 5);
  assert('bps.totalPekerjaDibayar = 4', r.bps.totalPekerjaDibayar, 4);
  assert('bps.totalPekerjaTidakDibayar = 1', r.bps.totalPekerjaTidakDibayar, 1);
  assert('bps.pekerjaL = 4', r.bps.pekerjaL, 4);
  assert('bps.pekerjaP = 1', r.bps.pekerjaP, 1);
  // Income calculation: 500k * 30 * 12 = 180.000.000
  assert('Pendapatan Tahunan = 180.000.000', r.totalPendapatanTahunan, 180_000_000);
}

// 5.5 calculateRecord().bps — backward compat: legacy pekerja_l/p → totalPekerja same as before
console.log('\n5.5 Backward compat — legacy pekerja_l=2, pekerja_p=1 → total=3:');
{
  const r = calculateRecord({ id: 'a8-2', categoryId: 'kios_campuran', inputs: {
    pemasukan_harian: '500000', custom_rev_pct: '10', custom_exp_pct: '30', custom_days: '30',
    pekerja_l: '2', pekerja_p: '1'   // legacy format
  }}, []);
  assert('bps.totalPekerja = 3 (legacy)', r.bps.totalPekerja, 3);
  assert('bps.totalPekerjaDibayar = 3 (all legacy → dibayar)', r.bps.totalPekerjaDibayar, 3);
  assert('bps.totalPekerjaTidakDibayar = 0 (none)', r.bps.totalPekerjaTidakDibayar, 0);
  assert('Pendapatan Tahunan = 180.000.000', r.totalPendapatanTahunan, 180_000_000);
}

// 5.6 Wage estimation math: 4 pekerja dibayar × Rp1.500.000/bln × 12 = Rp72.000.000
console.log('\n5.6 Estimasi upah: 4 × 1.500.000 × 12 = 72.000.000:');
{
  const totalDibayar = 4;
  const rataUpah     = 1_500_000;
  const estimasi     = totalDibayar * rataUpah * 12;
  assert('Estimasi = 72.000.000', estimasi, 72_000_000);
}

// 5.7 Rincian Manual + Terapkan ke 26a simulation
console.log('\n5.7 Terapkan ke 26a → 26f → seluruh turunan:');
{
  const r = calculateRecord({ id: 'a8-3', categoryId: 'kios_campuran', inputs: {
    pemasukan_harian: '150000',
    custom_rev_pct: '10', custom_exp_pct: '30', custom_days: '30',
    pekerja_dibayar_l: '3', pekerja_dibayar_p: '1',
    rata_upah_per_pekerja: '1500000',
    use_detail_pengeluaran: true,
    biaya_upah: '72000000', biaya_upah_freq: 'tahunan',
    biaya_produksi: '0', biaya_operasional: '0', biaya_non_operasional: '0'
  }}, []);
  // Pendapatan: 150k × 30 × 12 = 54.000.000
  assert('Pendapatan Tahunan = 54.000.000', r.totalPendapatanTahunan, 54_000_000);
  // 26f = 72.000.000
  assert('26f = 72.000.000', r.totalPengeluaranTahunan, 72_000_000);
  assert('Hasil Usaha Bersih = -18.000.000', r.totalHasilUsaha, -18_000_000);
  assert('Pendapatan/Bulan = -1.500.000', r.pendapatanPerBulan, -1_500_000);
}

// 5.8 Manual override biaya_upah tidak otomatis direset oleh sistem
console.log('\n5.8 Manual override biaya_upah = 80.000.000 tetap 80m (bukan 72m):');
{
  const r = calculateRecord({ id: 'a8-4', categoryId: 'kios_campuran', inputs: {
    pemasukan_harian: '150000',
    custom_rev_pct: '10', custom_exp_pct: '30', custom_days: '30',
    pekerja_dibayar_l: '4',
    use_detail_pengeluaran: true,
    biaya_upah: '80000000', biaya_upah_freq: 'tahunan'
  }}, []);
  assert('26a = 80.000.000 (manual, tidak berubah)', r.totalPengeluaranTahunan, 80_000_000);
}

// 5.9 Non-regresi: penambahan data pekerja tidak mengubah formula pendapatan
console.log('\n5.9 Non-regresi: data pekerja tidak ubah formula pendapatan:');
{
  const base = { pemasukan_harian: '150000', custom_rev_pct: '10', custom_exp_pct: '30', custom_days: '30' };
  const rBefore = calculateRecord({ id: 'a8-5a', categoryId: 'kios_campuran', inputs: base }, []);
  const rAfter  = calculateRecord({ id: 'a8-5b', categoryId: 'kios_campuran', inputs: {
    ...base, pekerja_dibayar_l: '5', pekerja_dibayar_p: '2', pekerja_tidak_dibayar_l: '1'
  }}, []);
  assert('Pendapatan Tahunan sebelum = sesudah', rBefore.totalPendapatanTahunan, rAfter.totalPendapatanTahunan);
  assert('Pengeluaran sebelum = sesudah (normatif)', rBefore.totalPengeluaranTahunan, rAfter.totalPengeluaranTahunan);
}

// ─────────────────────────────────────────────────────────────────────────
// SUITE 6: Addendum #9 — Harvest Period Selector (Perkebunan M2)
// ─────────────────────────────────────────────────────────────────────────
console.log('\n══ SUITE 6: Addendum #9 — Harvest Period Selector (Perkebunan) ══\n');

// 6.1 convertHarvestToAnnual() unit tests
console.log('6.1 convertHarvestToAnnual() unit tests:');
assert('per 12 Bulan (×1, default)',   convertHarvestToAnnual(12_000_000, 12),  12_000_000);
assert('per 1 Bulan (×12)',           convertHarvestToAnnual(1_000_000,  1),   12_000_000);
assert('per 2 Bulan (×6)',            convertHarvestToAnnual(2_000_000,  2),   12_000_000);
assert('per 3 Bulan (×4)',            convertHarvestToAnnual(12_000_000, 3),   48_000_000);
assert('per 4 Bulan (×3)',            convertHarvestToAnnual(4_000_000,  4),   12_000_000);
assert('per 6 Bulan (×2)',            convertHarvestToAnnual(5_000_000,  6),   10_000_000);
assert('per 5 Bulan (×2.4, presisi)', convertHarvestToAnnual(5_000_000,  5),   12_000_000);
assert('per 11 Bulan (presisi)',      convertHarvestToAnnual(11_000_000, 11),  12_000_000);
assert('undefined period → ×1',      convertHarvestToAnnual(12_000_000, undefined), 12_000_000);
assert('null period → ×1',           convertHarvestToAnnual(12_000_000, null),      12_000_000);

// 6.2 Non-regresi — default (period = 12 Bulan), hasil identik sebelum fitur
// Input 12.000.000, period 12, Pengeluaran 0
// → Tahunan = 12.000.000, Pengeluaran = 0, Bersih = 12.000.000, /Bulan = 1.000.000
console.log('\n6.2 Non-regresi — period 12 Bulan (default), hasil identik:');
{
  const r = calculateRecord({ id: 'a9-1', categoryId: 'perkebunan_tahunan', inputs: {
    total_pendapatan_tahunan: '12000000', custom_exp_pct: '30'
    // harvest_period_bulan absent → defaults to 12
  }}, []);
  assert('Pendapatan Tahunan = 12.000.000', r.totalPendapatanTahunan, 12_000_000);
  assert('Pengeluaran 0', r.totalPengeluaranTahunan, 0);
  assert('Hasil Usaha Bersih = 12.000.000', r.totalHasilUsaha, 12_000_000);
  assert('Pendapatan/Bulan = 1.000.000', r.pendapatanPerBulan, 1_000_000);
}

// 6.2b Same record but period explicitly set to '12'
console.log('\n6.2b Explicit period=12, identik dengan tidak ada period:');
{
  const r = calculateRecord({ id: 'a9-2', categoryId: 'perkebunan_tahunan', inputs: {
    total_pendapatan_tahunan: '12000000', harvest_period_bulan: '12', custom_exp_pct: '30'
  }}, []);
  assert('Pendapatan Tahunan = 12.000.000', r.totalPendapatanTahunan, 12_000_000);
  assert('Hasil Usaha Bersih = 12.000.000', r.totalHasilUsaha, 12_000_000);
}

// 6.3 Uji periode panen 3 bulan
// Input 12.000.000/panen, period=3 → Tahunan = 12m × (12÷3) = 48.000.000
console.log('\n6.3 Period 3 Bulan — konversi ×4:');
{
  const r = calculateRecord({ id: 'a9-3', categoryId: 'perkebunan_tahunan', inputs: {
    total_pendapatan_tahunan: '12000000', harvest_period_bulan: '3', custom_exp_pct: '30'
  }}, []);
  assert('Pendapatan Tahunan = 48.000.000', r.totalPendapatanTahunan, 48_000_000);
  assert('Pengeluaran 0', r.totalPengeluaranTahunan, 0);
  assert('Hasil Usaha Bersih = 48.000.000', r.totalHasilUsaha, 48_000_000);
  assert('Pendapatan/Bulan = 4.000.000', r.pendapatanPerBulan, 4_000_000);
}

// 6.4 Uji periode panen 6 bulan
// Input 5.000.000/panen, period=6 → Tahunan = 5m × 2 = 10.000.000
console.log('\n6.4 Period 6 Bulan — konversi ×2:');
{
  const r = calculateRecord({ id: 'a9-4', categoryId: 'perkebunan_tahunan', inputs: {
    total_pendapatan_tahunan: '5000000', harvest_period_bulan: '6', custom_exp_pct: '30'
  }}, []);
  assert('Pendapatan Tahunan = 10.000.000', r.totalPendapatanTahunan, 10_000_000);
  assert('Pengeluaran 0', r.totalPengeluaranTahunan, 0);
  assert('Hasil Usaha Bersih = 10.000.000', r.totalHasilUsaha, 10_000_000);
  assert('Pendapatan/Bulan = 833.333', r.pendapatanPerBulan, 833_333.33, 1);
}

// 6.5 Uji periode panen 5 bulan (pecahan — 12÷5 = 2.4, presisi penuh)
// Input 5.000.000/panen, period=5 → Tahunan = 5m × 2.4 = 12.000.000
console.log('\n6.5 Period 5 Bulan — faktor pecahan ×2.4 (presisi penuh):');
{
  const r = calculateRecord({ id: 'a9-5', categoryId: 'perkebunan_tahunan', inputs: {
    total_pendapatan_tahunan: '5000000', harvest_period_bulan: '5', custom_exp_pct: '30'
  }}, []);
  assert('Pendapatan Tahunan = 12.000.000 (5m × 2.4)', r.totalPendapatanTahunan, 12_000_000);
  assert('Pengeluaran 0', r.totalPengeluaranTahunan, 0);
  assert('Hasil Usaha Bersih = 12.000.000', r.totalHasilUsaha, 12_000_000);
}

// 6.6 Period 1 bulan (×12)
console.log('\n6.6 Period 1 Bulan — konversi ×12:');
{
  const r = calculateRecord({ id: 'a9-6', categoryId: 'perkebunan_tahunan', inputs: {
    total_pendapatan_tahunan: '1000000', harvest_period_bulan: '1', custom_exp_pct: '30'
  }}, []);
  assert('Pendapatan Tahunan = 12.000.000', r.totalPendapatanTahunan, 12_000_000);
  assert('Hasil Usaha Bersih = 12.000.000', r.totalHasilUsaha, 12_000_000);
}

// 6.7 State preservation — mengganti period tidak mengubah rawValue
// (di level kalkulasi: rawValue (total_pendapatan_tahunan) tidak ter-reset oleh pergantian period)
console.log('\n6.7 Ganti period — raw value tidak berubah, hanya faktor yang berubah:');
{
  const rawValue = '12000000';
  const r3 = calculateRecord({ id: 'a9-7a', categoryId: 'perkebunan_tahunan', inputs: {
    total_pendapatan_tahunan: rawValue, harvest_period_bulan: '3', custom_exp_pct: '30'
  }}, []);
  const r6 = calculateRecord({ id: 'a9-7b', categoryId: 'perkebunan_tahunan', inputs: {
    total_pendapatan_tahunan: rawValue, harvest_period_bulan: '6', custom_exp_pct: '30'
  }}, []);
  // rawValue same, different results — proving period changes don't reset rawValue
  assert('r3.meta.rawPendapatan = 12.000.000 (tidak berubah)', r3.meta.rawPendapatan, 12_000_000);
  assert('r6.meta.rawPendapatan = 12.000.000 (tidak berubah)', r6.meta.rawPendapatan, 12_000_000);
  assert('r3.meta.periodBulan = 3', r3.meta.periodBulan, 3);
  assert('r6.meta.periodBulan = 6', r6.meta.periodBulan, 6);
  // Annual values differ due to period
  assert('r3.totalPendapatan = 48.000.000 (3 bulan)', r3.totalPendapatanTahunan, 48_000_000);
  assert('r6.totalPendapatan = 24.000.000 (6 bulan)', r6.totalPendapatanTahunan, 24_000_000);
}

// 6.8 Non-regresi: kategori lain (bukan perkebunan_tahunan) TIDAK terpengaruh
console.log('\n6.8 Non-regresi: kategori kios_campuran tidak terpengaruh:');
{
  const r = calculateRecord({ id: 'a9-8', categoryId: 'kios_campuran', inputs: {
    pemasukan_harian: '500000', custom_rev_pct: '10', custom_exp_pct: '30', custom_days: '30'
  }}, []);
  assert('Kios Campuran Pendapatan = 180.000.000', r.totalPendapatanTahunan, 180_000_000);
  assert('Kios Campuran Pengeluaran = 0', r.totalPengeluaranTahunan, 0);
  assert('Kios Campuran Bersih = 180.000.000', r.totalHasilUsaha, 180_000_000);
}

// ══ SUITE 7: Addendum #12 — Wage Auto-Sync Integration & Mathematical Aggregation ══
console.log('\n══ SUITE 7: Addendum #12 — Wage Auto-Sync Integration & Mathematical Aggregation ══\n');

// 7.1 Kasus utama dari prompt: Pekerja Dibayar = 3, Rata-rata Upah/bulan = Rp1.820.000, 26b harian = 50.000 (26 hari), 26c/d/e = 0
// Total pendapatan = 150.000.000
console.log('7.1 Kasus utama: Pekerja Dibayar = 3, Rata-rata Upah = 1.820.000, 26b harian = 50.000 (26 hari):');
{
  const r = calculateRecord({
    id: 'a12-1',
    categoryId: 'nelayan_tangkap',
    inputs: {
      income_method: 'nilai_langsung',
      pemasukan_langsung: '150000000',
      pemasukan_langsung_freq: 'tahunan',
      custom_days: '26',
      
      // Pekerja Dibayar (3 orang)
      pekerja_dibayar_l: '2',
      pekerja_dibayar_p: '1',
      pekerja_tidak_dibayar_l: '1', // tidak dibayar, shouldn't affect wage estimation
      rata_upah_per_pekerja: '1820000',
      
      use_detail_pengeluaran: true,
      
      biaya_produksi: '50000',
      biaya_produksi_freq: 'harian',
      biaya_hpp: '0',
      biaya_hpp_freq: 'tahunan',
      biaya_operasional: '0',
      biaya_operasional_freq: 'tahunan',
      biaya_non_operasional: '0',
      biaya_non_operasional_freq: 'tahunan'
    }
  }, []);

  // 26a = 3 * 1.820.000 * 12 = 65.520.000
  // 26b = 50.000 * 26 * 12 = 15.600.000
  // 26f = 65.520.000 + 15.600.000 = 81.120.000
  // Hasil Usaha Bersih = 150.000.000 - 81.120.000 = 68.880.000
  // Pendapatan per Bulan = 68.880.000 / 12 = 5.740.000
  assert('Total Pendapatan Tahunan = Rp150.000.000', r.totalPendapatanTahunan, 150_000_000);
  assert('Total Pengeluaran Tahunan (26f) = Rp81.120.000', r.totalPengeluaranTahunan, 81_120_000);
  assert('Total Hasil Usaha Bersih = Rp68.880.000', r.totalHasilUsaha, 68_880_000);
  assert('Pendapatan per Bulan = Rp5.740.000', r.pendapatanPerBulan, 5_740_000);
}

// 7.2 Reaktivitas: Ubah Rata-rata Upah/bulan dari 1.820.000 jadi 2.000.000 (pekerja tetap 3)
console.log('\n7.2 Reaktivitas: Rata-rata Upah menjadi 2.000.000:');
{
  const r = calculateRecord({
    id: 'a12-2',
    categoryId: 'nelayan_tangkap',
    inputs: {
      income_method: 'nilai_langsung',
      pemasukan_langsung: '150000000',
      pemasukan_langsung_freq: 'tahunan',
      custom_days: '26',
      
      // Pekerja Dibayar (3 orang)
      pekerja_dibayar_l: '2',
      pekerja_dibayar_p: '1',
      rata_upah_per_pekerja: '2000000',
      
      use_detail_pengeluaran: true,
      
      biaya_produksi: '50000',
      biaya_produksi_freq: 'harian',
      biaya_hpp: '0',
      biaya_hpp_freq: 'tahunan',
      biaya_operasional: '0',
      biaya_operasional_freq: 'tahunan',
      biaya_non_operasional: '0',
      biaya_non_operasional_freq: 'tahunan'
    }
  }, []);

  // 26a = 3 * 2.000.000 * 12 = 72.000.000
  // 26b = 50.000 * 26 * 12 = 15.600.000
  // 26f = 72.000.000 + 15.600.000 = 87.600.000
  // Hasil Usaha Bersih = 150.000.000 - 87.600.000 = 62.400.000
  // Pendapatan per Bulan = 62.400.000 / 12 = 5.200.000
  assert('Total Pengeluaran Tahunan (26f) = Rp87.600.000', r.totalPengeluaranTahunan, 87_600_000);
  assert('Total Hasil Usaha Bersih = Rp62.400.000', r.totalHasilUsaha, 62_400_000);
  assert('Pendapatan per Bulan = Rp5.200.000', r.pendapatanPerBulan, 5_200_000);
}

console.log('\n7.3 Reaktivitas: Rata-rata Upah di PENCATATAN_RIIL mode (tanpa biaya_upah diisi):');
{
  const r = calculateRecord({
    id: 'a12-3',
    categoryId: 'nelayan_tangkap',
    inputs: {
      calculation_method: 'PENCATATAN_RIIL',
      income_method: 'nilai_langsung',
      pemasukan_langsung: '150000000',
      pemasukan_langsung_freq: 'tahunan',
      custom_days: '26',
      
      // Pekerja Dibayar (3 orang)
      pekerja_dibayar_l: '2',
      pekerja_dibayar_p: '1',
      rata_upah_per_pekerja: '1820000',
      
      use_detail_pengeluaran: true,
      
      biaya_produksi: '50000',
      biaya_produksi_freq: 'harian',
      biaya_hpp: '0',
      biaya_hpp_freq: 'tahunan',
      biaya_operasional: '0',
      biaya_operasional_freq: 'tahunan',
      biaya_non_operasional: '0',
      biaya_non_operasional_freq: 'tahunan'
    }
  }, []);

  // 26a = 3 * 1.820.000 * 12 = 65.520.000 (auto-synced)
  // 26b = 50.000 * 26 * 12 = 15.600.000
  // total = 65.520.000 + 15.600.000 = 81.120.000
  assert('Total Pengeluaran Tahunan (26f) = Rp81.120.000', r.totalPengeluaranTahunan, 81_120_000);
}

console.log('\n7.4 Reaktivitas: Manual Override 26a (dengan 26a_touched: true):');
{
  const r = calculateRecord({
    id: 'a12-4',
    categoryId: 'nelayan_tangkap',
    inputs: {
      calculation_method: 'PENCATATAN_RIIL',
      income_method: 'nilai_langsung',
      pemasukan_langsung: '150000000',
      pemasukan_langsung_freq: 'tahunan',
      custom_days: '26',
      
      // Pekerja Dibayar (3 orang) but manual override active
      pekerja_dibayar_l: '2',
      pekerja_dibayar_p: '1',
      rata_upah_per_pekerja: '1820000',
      '26a_touched': true,
      biaya_upah: '10000000',
      biaya_upah_freq: 'tahunan',
      
      use_detail_pengeluaran: true,
      
      biaya_produksi: '50000',
      biaya_produksi_freq: 'harian',
      biaya_hpp: '0',
      biaya_hpp_freq: 'tahunan',
      biaya_operasional: '0',
      biaya_operasional_freq: 'tahunan',
      biaya_non_operasional: '0',
      biaya_non_operasional_freq: 'tahunan'
    }
  }, []);

  // 26a = 10.000.000 (manual, not overridden by auto-sync because 26a_touched is true)
  // 26b = 50.000 * 26 * 12 = 15.600.000
  // total = 10.000.000 + 15.600.000 = 25.600.000
  assert('Total Pengeluaran Tahunan (26f) = Rp25.600.000', r.totalPengeluaranTahunan, 25_600_000);
}

// ─────────────────────────────────────────────────────────────────────────
// SUITE 8: Addendum #13 — Weekly Conversion Factor & Calculations
// ─────────────────────────────────────────────────────────────────────────
console.log('\n══ SUITE 8: Addendum #13 — Weekly Conversion Factor Revisions ══\n');

{
  // 8.1 Weekly conversion factor in convertToAnnual
  // expected base annual = 500.000 * 48 = 24.000.000
  assert('Weekly value (500k) annualised = 24.000.000', convertToAnnual(500_000, 'mingguan', 30), 24_000_000);
}

{
  // 8.2 Weekly expense conversion factor (100k) in calculateRecord
  // expected annual expense = 100k * 48 = 4.800.000
  const r = calculateRecord({
    id: 'a13-2',
    categoryId: 'kios_campuran',
    inputs: {
      pemasukan_harian: '500000', // harian 500k
      custom_days: '30',
      custom_rev_pct: '10',
      custom_exp_pct: '30',
      use_detail_pengeluaran: true,
      biaya_produksi: '100000',
      biaya_produksi_freq: 'mingguan' // 100k * 48 = 4.800.000
    }
  }, []);
  
  assert('Weekly expense (100k) annualised = 4.800.000', r.totalPengeluaranTahunan, 4_800_000);
}

// ─────────────────────────────────────────────────────────────────────────
// SUITE 9: Addendum #16 — Bagi Hasil Kapal (Punggawa-Sawi)
// ─────────────────────────────────────────────────────────────────────────
console.log('\n══ SUITE 9: Addendum #16 — Bagi Hasil Kapal (Punggawa-Sawi) ══\n');
{
  const r = calculateRecord({
    id: 'a16-test',
    categoryId: 'nelayan_tangkap',
    inputs: {
      income_method: 'volume_harga',
      satuan_kg: '5',
      pemasukan_harian: '1000000',
      custom_days: '4',
      biaya_trip_es: '300000',
      biaya_trip_bbm: '800000',
      biaya_trip_ransum: '400000',
      biaya_trip_umpan: '200000',
      bagi_hasil_pemilik: '50',
      pekerja_dibayar_l: '4', // Jumlah Kru = 4
      use_detail_pengeluaran: true
    }
  }, []);

  console.log('Nelayan Tangkap Bagi Hasil Kru/Trip:');
  assert('Total Pendapatan (Tahunan) = Rp240.000.000', r.totalPendapatanTahunan, 240_000_000);
  assert('Total Pengeluaran Tahunan (26f) = Rp160.800.000', r.totalPengeluaranTahunan, 160_800_000);
  assert('Total Hasil Usaha Bersih = Rp79.200.000', r.totalHasilUsaha, 79_200_000);
  assert('Pendapatan Per Bulan = Rp6.600.000', r.pendapatanPerBulan, 6_600_000);
}


// ─────────────────────────────────────────────────────────────────────────
// SUITE 10: Addendum #17 — Fishery Revenue Input Redesign & Migration
// ─────────────────────────────────────────────────────────────────────────
console.log('\n══ SUITE 10: Addendum #17 — Fishery Revenue Input Redesign & Migration ══\n');

// 10.1 Migration of Nelayan Mandiri (workers < 2)
console.log('10.1 Migration of Nelayan Mandiri:');
{
  const legacyInputs = {
    income_method: 'volume_harga',
    satuan_kg: '2',
    pemasukan_harian: '100000',
    custom_rev_pct: '10',
    custom_exp_pct: '30',
    custom_days: '30',
    pekerja_dibayar_l: '0',
    pekerja_dibayar_p: '0'
  };
  
  const migratedInputs = migrateLegacyNelayanInputs(legacyInputs);
  assertEqual('income_method migrated to nilai_langsung', migratedInputs.income_method, 'nilai_langsung');
  assertEqual('pemasukan_langsung is calculated correctly (2 * 100k)', migratedInputs.pemasukan_langsung, '200000');
  assertEqual('pemasukan_langsung_freq is harian', migratedInputs.pemasukan_langsung_freq, 'harian');
  assertEqual('original satuan_kg is preserved', migratedInputs.satuan_kg, '2');
  assertEqual('original pemasukan_harian is preserved', migratedInputs.pemasukan_harian, '100000');

  // Calculate with legacy inputs
  const rLegacy = calculateRecord({ id: 'legacy-mandiri', categoryId: 'nelayan_tangkap', inputs: legacyInputs }, []);
  // Calculate with migrated inputs
  const rMigrated = calculateRecord({ id: 'migrated-mandiri', categoryId: 'nelayan_tangkap', inputs: migratedInputs }, []);

  assert('Legacy and migrated totalPendapatanTahunan are identical', rMigrated.totalPendapatanTahunan, rLegacy.totalPendapatanTahunan);
  assert('Legacy and migrated totalPengeluaranTahunan are identical', rMigrated.totalPengeluaranTahunan, rLegacy.totalPengeluaranTahunan);
  assert('Legacy and migrated totalHasilUsaha are identical', rMigrated.totalHasilUsaha, rLegacy.totalHasilUsaha);
}

// 10.2 Migration of Bagi Hasil Kru/Trip (workers >= 2)
console.log('\n10.2 Migration of Bagi Hasil Kru/Trip:');
{
  const legacyInputs = {
    income_method: 'volume_harga',
    satuan_kg: '5',
    pemasukan_harian: '1000000',
    custom_days: '4',
    pekerja_dibayar_l: '3',
    pekerja_dibayar_p: '1',
    biaya_trip_es: '200000',
    biaya_trip_bbm: '800000',
    biaya_trip_ransum: '300000',
    biaya_trip_umpan: '200000',
    bagi_hasil_pemilik: '50'
  };

  const migratedInputs = migrateLegacyNelayanInputs(legacyInputs);
  assertEqual('income_method migrated to bagi_hasil', migratedInputs.income_method, 'bagi_hasil');
  assertEqual('original satuan_kg is preserved', migratedInputs.satuan_kg, '5');
  assertEqual('original pemasukan_harian is preserved', migratedInputs.pemasukan_harian, '1000000');

  // Calculate with legacy inputs
  const rLegacy = calculateRecord({ id: 'legacy-kru', categoryId: 'nelayan_tangkap', inputs: legacyInputs }, []);
  // Calculate with migrated inputs
  const rMigrated = calculateRecord({ id: 'migrated-kru', categoryId: 'nelayan_tangkap', inputs: migratedInputs }, []);

  assert('Legacy and migrated totalPendapatanTahunan are identical', rMigrated.totalPendapatanTahunan, rLegacy.totalPendapatanTahunan);
  assert('Legacy and migrated totalPengeluaranTahunan are identical', rMigrated.totalPengeluaranTahunan, rLegacy.totalPengeluaranTahunan);
  assert('Legacy and migrated totalHasilUsaha are identical', rMigrated.totalHasilUsaha, rLegacy.totalHasilUsaha);
}


// ─────────────────────────────────────────────────────────────────────────
// SUITE 11: Addendum #19 — Universal Revenue Coefficient for M2/M3
// ─────────────────────────────────────────────────────────────────────────
console.log('\n══ SUITE 11: Addendum #19 — Universal Revenue Coefficient for M2/M3 ══\n');

// 11.1 Usaha Perkebunan (M2) - Default 100%
console.log('11.1 Usaha Perkebunan (M2) - Default 100%:');
{
  const r = calculateRecord({
    id: 'perkebunan-default',
    categoryId: 'perkebunan_tahunan',
    inputs: {
      total_pendapatan_tahunan: '7000000',
      harvest_period_bulan: '12',
      custom_exp_pct: '30'
    }
  }, []);

  assert('Total Pendapatan Kotor/Tahunan = Rp7.000.000', r.totalPendapatanTahunan, 7_000_000);
  assert('Total Pengeluaran Tahunan = 0', r.totalPengeluaranTahunan, 0);
  assert('Total Hasil Usaha Bersih = Rp7.000.000', r.totalHasilUsaha, 7_000_000);
  assert('Pendapatan Per Bulan ≈ Rp583.333', r.pendapatanPerBulan, 583_333.33, 1.0);
}

// 11.2 Usaha Perkebunan (M2) - Custom 70%
console.log('\n11.2 Usaha Perkebunan (M2) - Custom 70%:');
{
  const r = calculateRecord({
    id: 'perkebunan-custom',
    categoryId: 'perkebunan_tahunan',
    inputs: {
      total_pendapatan_tahunan: '7000000',
      harvest_period_bulan: '12',
      custom_rev_pct: '70',
      custom_exp_pct: '30'
    }
  }, []);

  assert('Total Pendapatan Tahunan = Rp7.000.000', r.totalPendapatanTahunan, 7_000_000);
  assert('Total Pengeluaran Tahunan = 0', r.totalPengeluaranTahunan, 0);
  assert('Total Hasil Usaha Bersih = Rp7.000.000', r.totalHasilUsaha, 7_000_000);
  assert('Pendapatan Per Bulan ≈ Rp583.333', r.pendapatanPerBulan, 583_333.33, 1.0);
}

// 11.3 Usaha M3 (Kelapa) - Default 100%
console.log('\n11.3 Usaha M3 (Kelapa) - Default 100%:');
{
  const r = calculateRecord({
    id: 'kelapa-default',
    categoryId: 'kelapa_per3bulan',
    inputs: {
      jumlah_pohon: '30',
      custom_exp_pct: '30'
    }
  }, []);

  assert('Total Pendapatan Tahunan = Rp6.000.000', r.totalPendapatanTahunan, 6_000_000);
  assert('Total Hasil Usaha Bersih = Rp6.000.000', r.totalHasilUsaha, 6_000_000);
  assert('Pendapatan Per Bulan = Rp500.000', r.pendapatanPerBulan, 500_000);
}

// 11.4 Usaha M3 (Kelapa) - Custom 80%
console.log('\n11.4 Usaha M3 (Kelapa) - Custom 80%:');
{
  const r = calculateRecord({
    id: 'kelapa-custom',
    categoryId: 'kelapa_per3bulan',
    inputs: {
      jumlah_pohon: '30',
      custom_rev_pct: '80',
      custom_exp_pct: '30'
    }
  }, []);

  assert('Total Pendapatan Tahunan = Rp6.000.000', r.totalPendapatanTahunan, 6_000_000);
  assert('Total Pengeluaran Tahunan = 0', r.totalPengeluaranTahunan, 0);
  assert('Total Hasil Usaha Bersih = Rp6.000.000', r.totalHasilUsaha, 6_000_000);
  assert('Pendapatan Per Bulan = Rp500.000', r.pendapatanPerBulan, 500_000);
}

// ─────────────────────────────────────────────────────────────────────────
// SUITE 12: Addendum #20 — Standardizing M1 Revenue Input Frequency
// ─────────────────────────────────────────────────────────────────────────
console.log('\n══ SUITE 12: Addendum #20 — Standardizing M1 Revenue Input Frequency ══\n');

// 12.1 M1 Category (Kios Campuran) - Harian (default)
// 1.000.000 × 26 hari × 12 bulan = 312.000.000
console.log('12.1 Kios Campuran - Harian:');
{
  const r = calculateRecord({
    id: 'kios-harian',
    categoryId: 'kios_campuran',
    inputs: {
      pemasukan_harian: '1000000',
      pemasukan_harian_freq: 'harian',
      custom_days: '26',
      custom_rev_pct: '10',
      custom_exp_pct: '30'
    }
  }, []);

  assert('Total Pendapatan Tahunan = Rp312.000.000', r.totalPendapatanTahunan, 312_000_000);
  assert('Total Hasil Usaha Bersih = Rp312.000.000', r.totalHasilUsaha, 312_000_000);
}

// 12.2 M1 Category (Kios Campuran) - Mingguan
// 5.000.000 × 48 minggu = 240.000.000
console.log('\n12.2 Kios Campuran - Mingguan:');
{
  const r = calculateRecord({
    id: 'kios-mingguan',
    categoryId: 'kios_campuran',
    inputs: {
      pemasukan_harian: '5000000',
      pemasukan_harian_freq: 'mingguan',
      custom_days: '26',
      custom_rev_pct: '10',
      custom_exp_pct: '30'
    }
  }, []);

  assert('Total Pendapatan Tahunan = Rp240.000.000', r.totalPendapatanTahunan, 240_000_000);
  assert('Total Hasil Usaha Bersih = Rp240.000.000', r.totalHasilUsaha, 240_000_000);
}

// 12.3 M1 Category (Restoran/Kuliner) - Bulanan
// 20.000.000 × 12 bulan = 240.000.000
console.log('\n12.3 Kuliner/Restoran - Bulanan:');
{
  const r = calculateRecord({
    id: 'kuliner-bulanan',
    categoryId: 'kuliner_rumah_makan',
    inputs: {
      pemasukan_harian: '20000000',
      pemasukan_harian_freq: 'bulanan',
      custom_days: '30',
      custom_rev_pct: '60',
      custom_exp_pct: '40'
    }
  }, []);

  assert('Total Pendapatan Tahunan = Rp240.000.000', r.totalPendapatanTahunan, 240_000_000);
  assert('Total Hasil Usaha Bersih = Rp240.000.000', r.totalHasilUsaha, 240_000_000);
}

// 12.4 M1 Category (Restoran/Kuliner) - Tahunan
// 500.000.000 × 1 = 500.000.000
console.log('\n12.4 Kuliner/Restoran - Tahunan:');
{
  const r = calculateRecord({
    id: 'kuliner-tahunan',
    categoryId: 'kuliner_rumah_makan',
    inputs: {
      pemasukan_harian: '500000000',
      pemasukan_harian_freq: 'tahunan',
      custom_days: '30',
      custom_rev_pct: '60',
      custom_exp_pct: '40'
    }
  }, []);

  assert('Total Pendapatan Tahunan = Rp500.000.000', r.totalPendapatanTahunan, 500_000_000);
  assert('Total Hasil Usaha Bersih = Rp500.000.000', r.totalHasilUsaha, 500_000_000);
}

// 12.5 Backward compatibility (existing data defaults to "harian")
// 1.000.000 × 26 hari × 12 bulan = 312.000.000
console.log('\n12.5 Kios Campuran - Backward compatibility:');
{
  const r = calculateRecord({
    id: 'kios-legacy',
    categoryId: 'kios_campuran',
    inputs: {
      pemasukan_harian: '1000000',
      // pemasukan_harian_freq is absent, should default to harian
      custom_days: '26',
      custom_rev_pct: '10',
      custom_exp_pct: '30'
    }
  }, []);

  assert('Total Pendapatan Tahunan = Rp312.000.000', r.totalPendapatanTahunan, 312_000_000);
}


// ─────────────────────────────────────────────────────────────────────────
// SUITE 13: Addendum #23 — Jasa Calculations & Guidelines
// ─────────────────────────────────────────────────────────────────────────
console.log('\n══ SUITE 13: Addendum #23 — Jasa Calculations & Guidelines ══\n');

// 13.1 Jasa Reparasi & Teknis (Bengkel)
// 500.000 * 26 * 12 = 156.000.000
console.log('13.1 Jasa Reparasi & Teknis:');
{
  const r = calculateRecord({
    id: 'jasa-reparasi-test',
    categoryId: 'generik_harian',
    inputs: {
      pemasukan_harian: '500000',
      pemasukan_harian_freq: 'harian',
      custom_days: '26',
      custom_rev_pct: '30',
      custom_exp_pct: '30',
      _groupKey: 'jasa-reparasi'
    }
  }, []);

  assert('Total Pendapatan Tahunan = Rp156.000.000', r.totalPendapatanTahunan, 156_000_000);
  assert('Total Pengeluaran Tahunan = 0', r.totalPengeluaranTahunan, 0);
  assert('Total Hasil Usaha Bersih = Rp156.000.000', r.totalHasilUsaha, 156_000_000);
}

// 13.2 Jasa Personal & Kebersihan (Salon)
// 300.000 * 30 * 12 = 108.000.000
console.log('\n13.2 Jasa Personal & Kebersihan:');
{
  const r = calculateRecord({
    id: 'jasa-personal-test',
    categoryId: 'generik_harian',
    inputs: {
      pemasukan_harian: '300000',
      pemasukan_harian_freq: 'harian',
      custom_days: '30',
      custom_rev_pct: '50',
      custom_exp_pct: '30',
      _groupKey: 'jasa-personal'
    }
  }, []);

  assert('Total Pendapatan Tahunan = Rp108.000.000', r.totalPendapatanTahunan, 108_000_000);
  assert('Total Hasil Usaha Bersih = Rp108.000.000', r.totalHasilUsaha, 108_000_000);
}

// 13.3 Jasa Transportasi & Angkutan (Ojek)
// 200.000 * 26 * 12 = 62.400.000
console.log('\n13.3 Jasa Transportasi & Angkutan:');
{
  const r = calculateRecord({
    id: 'jasa-transportasi-test',
    categoryId: 'generik_harian',
    inputs: {
      pemasukan_harian: '200000',
      pemasukan_harian_freq: 'harian',
      custom_days: '26',
      custom_rev_pct: '25',
      custom_exp_pct: '30',
      _groupKey: 'jasa-transportasi'
    }
  }, []);

  assert('Total Pendapatan Tahunan = Rp62.400.000', r.totalPendapatanTahunan, 62_400_000);
  assert('Total Hasil Usaha Bersih = Rp62.400.000', r.totalHasilUsaha, 62_400_000);
}


// ══ SUITE 14: Addendum — Pencatatan Riil (Real Accounting Mode) ══
console.log('\n══ SUITE 14: Addendum — Pencatatan Riil (Real Accounting Mode) ══');

// 14.1 Kios Campuran - Pencatatan Riil (Omzet - Pengeluaran Nyata)
console.log('\n14.1 Kios Campuran - Pencatatan Riil (Omzet - Pengeluaran Nyata):');
{
  const r = calculateRecord({
    id: 'kios-riil-test',
    categoryId: 'kios_campuran',
    inputs: {
      pemasukan_harian: '1000000',
      pemasukan_harian_freq: 'harian',
      custom_days: '26',
      custom_rev_pct: '10', // should be overridden to 100
      calculation_method: 'PENCATATAN_RIIL',
      
      biaya_upah: '1000000',
      biaya_upah_freq: 'bulanan',
      
      biaya_hpp: '15000000',
      biaya_hpp_freq: 'bulanan',
      biaya_hpp_auto_proportion: true, // should be overridden to false
      
      biaya_operasional: '2000000',
      biaya_operasional_freq: 'bulanan',
      biaya_operasional_auto_proportion: true // should be overridden to false
    }
  }, []);

  assert('Total Pendapatan Tahunan (100% Coefficient) = Rp312.000.000', r.totalPendapatanTahunan, 312_000_000);
  assert('Total Pengeluaran Tahunan (Manual 26a+26c+26d) = Rp216.000.000', r.totalPengeluaranTahunan, 216_000_000);
  assert('Total Hasil Usaha Bersih = Rp96.000.000', r.totalHasilUsaha, 96_000_000);
  assert('Pendapatan per Bulan = Rp8.000.000', r.pendapatanPerBulan, 8_000_000);
}

// ─────────────────────────────────────────────────────────────────────────
// SUITE 15: Addendum #8 — Auto-Isi Estimasi 26b/26c/26d Berbasis Profil Sektor
// ─────────────────────────────────────────────────────────────────────────
console.log('\n══ SUITE 15: Auto-Isi Estimasi per Profil Sektor ══\n');

// 15.1 Profil Perdagangan (kios_campuran) — HPP dominan, identik pola screenshot
{
  const auto = computeAutoFillPengeluaran({
    categoryId: 'kios_campuran',
    totalPendapatanTahunan: 2_160_000_000,
    expPctNormatif: 3.0,
  });
  assert('26b (Produksi) = 0 untuk profil Perdagangan', auto.biaya_produksi, 0);
  assert('26c (HPP) = 45.360.000 (70% dari 64.800.000)', auto.biaya_hpp, 45_360_000);
  assert('26d (Operasional) = 19.440.000 (30% dari 64.800.000)', auto.biaya_operasional, 19_440_000);
}

// 15.2 Profil Produksi (kuliner_rumah_makan) — Bahan/Produksi dominan
{
  const auto = computeAutoFillPengeluaran({
    categoryId: 'kuliner_rumah_makan',
    totalPendapatanTahunan: 108_000_000,
    expPctNormatif: 10, // contoh angka normatif sektor kuliner
  });
  const totalNormatif = 108_000_000 * 0.10; // 10.800.000
  assert('26b (Produksi) dominan = 65% dari total normatif', auto.biaya_produksi, Math.round(totalNormatif * 0.65));
  assert('26c (HPP) = 20% dari total normatif', auto.biaya_hpp, Math.round(totalNormatif * 0.20));
  assert('26d (Operasional) = 15% dari total normatif', auto.biaya_operasional, Math.round(totalNormatif * 0.15));
}

// 15.3 Non-regresi — 26a & 26e TIDAK pernah muncul di hasil computeAutoFillPengeluaran
{
  const auto = computeAutoFillPengeluaran({
    categoryId: 'kios_campuran', totalPendapatanTahunan: 100_000_000, expPctNormatif: 5,
  });
  assertEqual('biaya_upah tidak ada di hasil auto-isi', auto.biaya_upah, undefined);
  assertEqual('biaya_non_operasional tidak ada di hasil auto-isi', auto.biaya_non_operasional, undefined);
}

// ══ SUITE 16: Addendum — Top-Down & Bottom-Up Budget Allocation ══
console.log('\n══ SUITE 16: Addendum — Top-Down & Bottom-Up Budget Allocation ══');

// 16.1 Kios Campuran: HPP, Operasional, Non-operasional auto-proportion (disabled/ignored)
{
  const r = calculateRecord({
    id: 'td1',
    categoryId: 'kios_campuran',
    inputs: {
      calculation_method: 'PENCATATAN_RIIL',
      pemasukan_harian: '1000000',
      custom_days: '30',
      custom_rev_pct: '100',
      custom_exp_pct: '30',
      use_detail_pengeluaran: true,
      biaya_upah: '8000000',
      biaya_upah_freq: 'tahunan',
    }
  }, []);

  assert('Target Budget (total manual) = 8.000.000', r.bps.totalPengeluaranDetail, 8_000_000);
  assert('26a (Upah) = 8.000.000', r.bps.detailValues.upah, 8_000_000);
  assert('26c (HPP) = 0', r.bps.detailValues.hpp, 0);
  assert('26d (Operasional) = 0', r.bps.detailValues.oper, 0);
  assert('26e (Non-operasional) = 0', r.bps.detailValues.nonOper, 0);
  assert('26b (Produksi) = 0', r.bps.detailValues.prod, 0);
}

// 16.2 Kuliner: manual budgeting for all fields (no proportions)
{
  const r = calculateRecord({
    id: 'td2',
    categoryId: 'kuliner_rumah_makan',
    inputs: {
      calculation_method: 'PENCATATAN_RIIL',
      pemasukan_harian: '500000',
      custom_days: '30',
      custom_rev_pct: '100',
      custom_exp_pct: '40',
      use_detail_pengeluaran: true,
      biaya_upah: '12000000',
      biaya_upah_freq: 'tahunan',
      biaya_operasional: '20000000',
      biaya_operasional_freq: 'tahunan',
    }
  }, []);

  assert('Target Budget (total manual) = 32.000.000', r.bps.totalPengeluaranDetail, 32_000_000);
  assert('26a (Upah) = 12.000.000', r.bps.detailValues.upah, 12_000_000);
  assert('26d (Operasional manual) = 20.000.000', r.bps.detailValues.oper, 20_000_000);
  assert('26b (Produksi) = 0', r.bps.detailValues.prod, 0);
  assert('26e (Non-operasional) = 0', r.bps.detailValues.nonOper, 0);
  assert('26c (HPP) = 0', r.bps.detailValues.hpp, 0);
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
