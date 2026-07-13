/**
 * dataUtils.js
 * Core utility — formulas, color logic, export, ID generator, seed data.
 *
 * FORMULA REFERENCE (matches spreadsheet columns C–I):
 *   C  = target
 *   D  = progres1  (Submitted Jumlah)
 *   E  = D/C*100   (% Submitted)
 *   F  = progres2  (Approved Jumlah)
 *   G  = F/C*100   (% Approved)
 *   H  = E+G       (Total % Progress)
 *   I  = draft
 */
import * as XLSX from 'xlsx';

// ── Per-entry calculations ──────────────────────────────────────

/**
 * Calculate all derived % values for a single entry.
 * @param {{ target, progres1, progres2 }} entry
 * @returns {{ pctSubmitted, pctApproved, totalPct }}
 */
export function calcEntry(entry) {
  const C = Number(entry.target)   || 0;
  const D = Number(entry.progres1) || 0;
  const F = Number(entry.progres2) || 0;

  const pctSubmitted = C > 0 ? (D / C) * 100 : 0;  // E = D/C*100
  const pctApproved  = C > 0 ? (F / C) * 100 : 0;  // G = F/C*100
  const totalPct     = pctSubmitted + pctApproved;   // H = E+G

  return { pctSubmitted, pctApproved, totalPct };
}

// ── Global totals row ───────────────────────────────────────────

/**
 * Calculate the bottom "Total Akumulasi Global" row.
 * @param {Array} entries
 * @returns {{
 *   sumTarget, sumSubmitted, sumApproved, sumDraft,
 *   globalPctSubmitted, globalPctApproved, globalTotalPct
 * }}
 */
export function calcGlobalTotals(entries) {
  const sumTarget    = entries.reduce((s, e) => s + (Number(e.target)   || 0), 0);
  const sumSubmitted = entries.reduce((s, e) => s + (Number(e.progres1) || 0), 0);
  const sumApproved  = entries.reduce((s, e) => s + (Number(e.progres2) || 0), 0);
  const sumDraft     = entries.reduce((s, e) => s + (Number(e.draft)    || 0), 0);

  // Global % = (SUM numerator / SUM denominator) * 100
  const globalPctSubmitted = sumTarget > 0 ? (sumSubmitted / sumTarget) * 100 : 0;
  const globalPctApproved  = sumTarget > 0 ? (sumApproved  / sumTarget) * 100 : 0;
  const globalTotalPct     = globalPctSubmitted + globalPctApproved;

  return { sumTarget, sumSubmitted, sumApproved, sumDraft, globalPctSubmitted, globalPctApproved, globalTotalPct };
}

// ── Color / status helpers ──────────────────────────────────────

/**
 * 4-level threshold based on Total % Progress (H column).
 *   < 30%   → 'red'
 *   30–49%  → 'orange'
 *   50–79%  → 'amber'
 *   ≥ 80%   → 'green'
 */
export function getStatusTier(totalPct) {
  if (totalPct >= 80) return 'green';
  if (totalPct >= 50) return 'amber';
  if (totalPct >= 30) return 'orange';
  return 'red';
}

export function getStatusLabel(totalPct) {
  if (totalPct >= 80) return 'On Track ✓';
  if (totalPct >= 50) return 'In Progress';
  if (totalPct >= 30) return 'Perlu Akselerasi';
  return 'Butuh Perhatian';
}

/** Tailwind class map per tier */
export function getTierClasses(tier) {
  const map = {
    green: {
      badge:    'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      bar:      'bg-gradient-to-r from-emerald-500 to-green-400',
      text:     'text-emerald-400',
      rowAccent:'border-l-emerald-500',
      glow:     'shadow-emerald-500/20',
    },
    amber: {
      badge:    'bg-amber-500/15 text-amber-400 border border-amber-500/30',
      bar:      'bg-gradient-to-r from-amber-500 to-yellow-400',
      text:     'text-amber-400',
      rowAccent:'border-l-amber-500',
      glow:     'shadow-amber-500/20',
    },
    orange: {
      badge:    'bg-orange-500/15 text-orange-400 border border-orange-500/30',
      bar:      'bg-gradient-to-r from-orange-500 to-amber-400',
      text:     'text-orange-400',
      rowAccent:'border-l-orange-500',
      glow:     'shadow-orange-500/20',
    },
    red: {
      badge:    'bg-rose-500/15 text-rose-400 border border-rose-500/30',
      bar:      'bg-gradient-to-r from-rose-600 to-rose-400',
      text:     'text-rose-400',
      rowAccent:'border-l-rose-500',
      glow:     'shadow-rose-500/20',
    },
  };
  return map[tier] ?? map.red;
}

// ── Export helpers ──────────────────────────────────────────────

export function exportToCSV(entries) {
  const headers = [
    'No', 'Nama Target / Kegiatan', 'Target (C)',
    'Submitted Jumlah (D)', '% Submitted (E=D/C*100)',
    'Approved Jumlah (F)',  '% Approved (G=F/C*100)',
    'Total % Progress (H=E+G)', 'Draft (I)',
  ];

  const rows = entries.map((e, i) => {
    const { pctSubmitted, pctApproved, totalPct } = calcEntry(e);
    return [
      i + 1, e.name, e.target,
      e.progres1, pctSubmitted.toFixed(2) + '%',
      e.progres2, pctApproved.toFixed(2)  + '%',
      totalPct.toFixed(2) + '%',
      e.draft,
    ];
  });

  // Append global total row
  const g = calcGlobalTotals(entries);
  rows.push([
    'TOTAL', '', g.sumTarget,
    g.sumSubmitted, g.globalPctSubmitted.toFixed(2) + '%',
    g.sumApproved,  g.globalPctApproved.toFixed(2)  + '%',
    g.globalTotalPct.toFixed(2) + '%',
    g.sumDraft,
  ]);

  const csv = [headers, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `monitoring_progres_${dateStamp()}.csv`);
}

export function exportToXLSX(entries) {
  const rows = entries.map((e, i) => {
    const { pctSubmitted, pctApproved, totalPct } = calcEntry(e);
    return {
      'No':                       i + 1,
      'Nama Target / Kegiatan':   e.name,
      'Target (C)':               Number(e.target),
      'Submitted Jumlah (D)':     Number(e.progres1),
      '% Submitted E=D/C*100':    parseFloat(pctSubmitted.toFixed(2)),
      'Approved Jumlah (F)':      Number(e.progres2),
      '% Approved G=F/C*100':     parseFloat(pctApproved.toFixed(2)),
      'Total % Progress H=E+G':   parseFloat(totalPct.toFixed(2)),
      'Draft (I)':                Number(e.draft),
      'Status':                   getStatusLabel(totalPct),
    };
  });

  // Global total row
  const g = calcGlobalTotals(entries);
  rows.push({
    'No': '',
    'Nama Target / Kegiatan': 'TOTAL AKUMULASI GLOBAL',
    'Target (C)':             g.sumTarget,
    'Submitted Jumlah (D)':   g.sumSubmitted,
    '% Submitted E=D/C*100':  parseFloat(g.globalPctSubmitted.toFixed(2)),
    'Approved Jumlah (F)':    g.sumApproved,
    '% Approved G=F/C*100':   parseFloat(g.globalPctApproved.toFixed(2)),
    'Total % Progress H=E+G': parseFloat(g.globalTotalPct.toFixed(2)),
    'Draft (I)':              g.sumDraft,
    'Status':                 '',
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Monitoring Progres');
  ws['!cols'] = [
    { wch: 4 }, { wch: 28 }, { wch: 12 }, { wch: 18 }, { wch: 20 },
    { wch: 16 }, { wch: 20 }, { wch: 22 }, { wch: 10 }, { wch: 20 },
  ];
  XLSX.writeFile(wb, `monitoring_progres_${dateStamp()}.xlsx`);
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10).replace(/-/g, '');
}

// ── ID generator ────────────────────────────────────────────────
export function generateId() {
  return `e_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

// ── Seed data (matches Excel data exactly) ──────────────────────
export const SEED_DATA = [
  { id: generateId(), name: 'Shinta Bella',       target: 692, progres1:  16, progres2: 245, draft:  1 },
  { id: generateId(), name: 'Ria Ariska',          target: 935, progres1:  29, progres2: 337, draft:  0 },
  { id: generateId(), name: 'Shinta Yunita Sari',  target: 629, progres1:  30, progres2: 190, draft:  0 },
  { id: generateId(), name: 'Maya Oktaviani',      target: 768, progres1:  41, progres2: 172, draft: 12 },
  { id: generateId(), name: 'Sherly Widyawati',    target: 714, progres1:  69, progres2: 236, draft:  3 },
  { id: generateId(), name: 'Amanda Saputri',      target: 795, progres1:  92, progres2: 322, draft: 12 },
];
