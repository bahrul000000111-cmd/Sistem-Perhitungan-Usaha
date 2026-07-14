/**
 * regression_test.mjs
 * Regression test suite for UMK Calculator calculations.
 * Run: node regression_test.mjs
 *
 * Tests:
 * 1. Original normative formula assertions (from initial plan)
 * 2. Addendum Bagian 3: nelayan_tangkap with rincian mode ON and OFF toggle
 */

import { calculateRecord } from './src/utils/calculations.js';

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
    console.log(`         Expected: ${expected}`);
    console.log(`         Actual:   ${actual}`);
    fail++;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Regression Suite 1: Original normative formulas
// ─────────────────────────────────────────────────────────────────────────
console.log('\n══ SUITE 1: Original Normative Formula Regressions ══\n');

{
  const record = {
    id: 'test1', categoryId: 'kios_campuran',
    inputs: { pemasukan_harian: '500000', custom_days: '30', custom_rev_pct: '10', custom_exp_pct: '30' }
  };
  const r = calculateRecord(record, []);
  console.log('KBLI 47112 - Kios Campuran (Rp500k/hari, 30 hari, 10%, 30%):');
  assert('Total Pendapatan Tahunan', r.totalPendapatanTahunan, 18_000_000);
  assert('Total Pengeluaran Tahunan', r.totalPengeluaranTahunan, 5_400_000);
  assert('Total Hasil Usaha Bersih', r.totalHasilUsaha, 12_600_000);
  assert('Pendapatan Per Bulan', r.pendapatanPerBulan, 1_050_000);
  assertEqual('isDetailPengeluaranActive', r.bps.isDetailPengeluaranActive, false);
}

{
  const record = {
    id: 'test2', categoryId: 'kelapa_per3bulan',
    inputs: { jumlah_pohon: '30', custom_exp_pct: '30' }
  };
  const r = calculateRecord(record, []);
  console.log('\nKBLI 01262 - Buah Kelapa (30 pohon, 30%):');
  assert('Total Pendapatan Tahunan', r.totalPendapatanTahunan, 6_000_000);
  assert('Total Pengeluaran Tahunan', r.totalPengeluaranTahunan, 1_800_000);
  assert('Total Hasil Usaha Bersih', r.totalHasilUsaha, 4_200_000);
  assert('Pendapatan Per Bulan', r.pendapatanPerBulan, 350_000);
}

{
  const record = {
    id: 'test3', categoryId: 'industri_kopra',
    inputs: { berat_kopra: '400', custom_exp_pct: '30' }
  };
  const r = calculateRecord(record, []);
  console.log('\nKBLI 10411 - Kopra (400kg, 30%):');
  assert('Total Pendapatan Tahunan', r.totalPendapatanTahunan, 4_800_000);
  assert('Total Pengeluaran Tahunan', r.totalPengeluaranTahunan, 1_440_000);
  assert('Total Hasil Usaha Bersih', r.totalHasilUsaha, 3_360_000);
  assert('Pendapatan Per Bulan', r.pendapatanPerBulan, 280_000);
}

// ─────────────────────────────────────────────────────────────────────────
// Regression Suite 2: Addendum Bagian 3 — Rincian Manual (toggle ON/OFF)
// Case: KBLI nelayan_tangkap (03111)
// ─────────────────────────────────────────────────────────────────────────
console.log('\n══ SUITE 2: Addendum Bagian 3 — Rincian Manual Pengeluaran ══\n');

const baseNelayanInputs = {
  satuan_kg: '1',
  pemasukan_harian: '100000',
  custom_rev_pct: '10',
  custom_days: '30',
  custom_exp_pct: '30'
};

{
  const record = { id: 'test_nelayan_off', categoryId: 'nelayan_tangkap', inputs: { ...baseNelayanInputs } };
  const r = calculateRecord(record, []);
  console.log('nelayan_tangkap — mode NORMATIF (toggle OFF):');
  assert('Total Pendapatan Tahunan', r.totalPendapatanTahunan, 3_600_000);
  assert('Total Pengeluaran Normatif 30%', r.totalPengeluaranTahunan, 1_080_000);
  assert('Total Hasil Usaha Bersih', r.totalHasilUsaha, 2_520_000);
  assert('Pendapatan Per Bulan', r.pendapatanPerBulan, 210_000);
  assertEqual('isDetailPengeluaranActive', r.bps.isDetailPengeluaranActive, false);
}

{
  const rincianInputs = {
    ...baseNelayanInputs,
    use_detail_pengeluaran: true,  // Toggle ON (boolean native)
    biaya_upah: '600000',
    biaya_produksi: '300000',
    biaya_operasional: '150000',
    biaya_non_operasional: '50000'
    // biaya_hpp not applicable for nelayan
  };
  const record = { id: 'test_nelayan_on', categoryId: 'nelayan_tangkap', inputs: rincianInputs };
  const r = calculateRecord(record, []);
  console.log('\nnelayan_tangkap — mode RINCIAN MANUAL (toggle ON, 26a=600k 26b=300k 26d=150k 26e=50k):');
  assert('Total Pendapatan Tahunan (tidak berubah)', r.totalPendapatanTahunan, 3_600_000);
  assert('Total Pengeluaran Rincian (26f = 1.100.000)', r.totalPengeluaranTahunan, 1_100_000);
  assert('Total Hasil Usaha Bersih', r.totalHasilUsaha, 2_500_000);
  assert('Pendapatan Per Bulan (≈ 208.333)', r.pendapatanPerBulan, 208_333, 1);  // toleransi 1 Rp
  assertEqual('isDetailPengeluaranActive', r.bps.isDetailPengeluaranActive, true);
  assertEqual('totalPengeluaranDetail di bps', r.bps.totalPengeluaranDetail, 1_100_000);
  
  // Verify setaraExpPct formula: 1.100.000 / 3.600.000 * 100 ≈ 30.555...%
  const expectedSetaraPct = (1_100_000 / 3_600_000) * 100;
  const actualSetaraPct = (r.totalPengeluaranTahunan / r.totalPendapatanTahunan) * 100;
  assert('Setara Persen dari Total Pendapatan ≈ 30.6%', actualSetaraPct, expectedSetaraPct, 0.01);
}

{
  // Verify toggle OFF does NOT erase rincian data — simulate stored state
  const savedRincianInputs = {
    ...baseNelayanInputs,
    use_detail_pengeluaran: false,  // Toggle OFF again
    biaya_upah: '600000',          // Data masih tersimpan
    biaya_produksi: '300000',
    biaya_operasional: '150000',
    biaya_non_operasional: '50000'
  };
  const record = { id: 'test_nelayan_toggled_off', categoryId: 'nelayan_tangkap', inputs: savedRincianInputs };
  const r = calculateRecord(record, []);
  console.log('\nnelayan_tangkap — toggle OFF kembali (data rincian tetap ada, tapi tidak dipakai):');
  // Should revert to normative
  assert('Total Pengeluaran kembali ke normatif 30%', r.totalPengeluaranTahunan, 1_080_000);
  assert('Laba bersih kembali ke 2.520.000', r.totalHasilUsaha, 2_520_000);
  assertEqual('isDetailPengeluaranActive = false', r.bps.isDetailPengeluaranActive, false);
  // Data rincian masih ada di inputs (tidak dihapus) — confirm via totalPengeluaranDetail = 0 saat OFF
  assertEqual('totalPengeluaranDetail = 0 saat OFF', r.bps.totalPengeluaranDetail, 0);
  // Tapi biaya_upah di inputs masih 600000 (tidak dihapus)
  assertEqual('biaya_upah tetap tersimpan di inputs', savedRincianInputs.biaya_upah, '600000');
}

{
  // Test toggle via string 'true' (dari JSON parse edge case)
  const stringToggleInputs = {
    ...baseNelayanInputs,
    use_detail_pengeluaran: 'true',  // String, bukan boolean native
    biaya_upah: '600000',
    biaya_produksi: '300000',
    biaya_operasional: '150000',
    biaya_non_operasional: '50000'
  };
  const record = { id: 'test_string_toggle', categoryId: 'nelayan_tangkap', inputs: stringToggleInputs };
  const r = calculateRecord(record, []);
  console.log('\nEdge case: use_detail_pengeluaran = "true" (string):');
  assert('Masih aktif dengan string toggle', r.totalPengeluaranTahunan, 1_100_000);
  assertEqual('isDetailPengeluaranActive = true', r.bps.isDetailPengeluaranActive, true);
}

// ─────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────
console.log(`\n══ HASIL: ${pass} lulus, ${fail} gagal ══`);
if (fail === 0) {
  console.log('✅ Semua regression test LULUS. Formula normatif dan rincian manual berfungsi dengan benar.');
} else {
  console.log('❌ Ada regression test yang GAGAL. Periksa diff di atas.');
  process.exit(1);
}
