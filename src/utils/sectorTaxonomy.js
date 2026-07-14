/**
 * sectorTaxonomy.js
 * Sector & sub-sector taxonomy for UMK business categories.
 * ─────────────────────────────────────────────────────────
 * PURE DISPLAY METADATA — these constants are used solely for
 * grouping/rendering in the UI (sidebar & add-record modal).
 * No calculation logic (computeFn, coefficients, formulas)
 * reads from this file. Safe to extend without touching calculations.js.
 *
 * Structure follows official KBLI (BPS) Section & Division codes:
 *   Tingkat 1 → Section  (Kategori A, C, G, I …)
 *   Tingkat 2 → Division (2-digit prefix of KBLI code, e.g. "012", "03")
 */

/**
 * @typedef {Object} SubSector
 * @property {string} subSectorId   - URL-friendly slug, e.g. "perkebunan"
 * @property {string} subSectorName - Human-readable label, e.g. "Perkebunan"
 * @property {string} divisionCode  - 2-3 digit KBLI Division prefix, e.g. "012"
 */

/**
 * @typedef {Object} SectorTaxonomy
 * @property {string}       sectorId      - URL-friendly slug, e.g. "pertanian-kehutanan-perikanan"
 * @property {string}       sectorName    - Full human-readable name
 * @property {string}       sectorLetter  - Official KBLI Section letter, e.g. "A"
 * @property {string}       icon          - Lucide icon component name for this sector
 * @property {SubSector[]|undefined} subSectors - Optional; only present when sector needs Tingkat-2 grouping
 */

/** @type {SectorTaxonomy[]} */
export const SECTOR_TAXONOMY = [
  {
    sectorId: 'pertanian-kehutanan-perikanan',
    sectorName: 'Pertanian, Kehutanan & Perikanan',
    sectorLetter: 'A',
    icon: 'Leaf',
    subSectors: [
      {
        subSectorId: 'tanaman-pangan',
        subSectorName: 'Tanaman Pangan',
        divisionCode: '011',
      },
      {
        subSectorId: 'perkebunan',
        subSectorName: 'Perkebunan',
        divisionCode: '012',
      },
      {
        subSectorId: 'hortikultura',
        subSectorName: 'Hortikultura',
        divisionCode: '013',
      },
      {
        subSectorId: 'peternakan',
        subSectorName: 'Peternakan',
        divisionCode: '014',
      },
      {
        subSectorId: 'kehutanan',
        subSectorName: 'Kehutanan',
        divisionCode: '02',
      },
      {
        subSectorId: 'perikanan',
        subSectorName: 'Perikanan',
        divisionCode: '03',
      },
    ],
  },
  {
    sectorId: 'perdagangan',
    sectorName: 'Perdagangan',
    sectorLetter: 'G',
    icon: 'ShoppingCart',
    // No sub-sectors yet; subSectors intentionally omitted for flat rendering.
    // Add subSectors array here when Perdagangan categories grow significantly.
  },
  {
    sectorId: 'industri-pengolahan',
    sectorName: 'Industri Pengolahan',
    sectorLetter: 'C',
    icon: 'Factory',
    // No sub-sectors yet.
  },
  {
    sectorId: 'akomodasi-makan-minum',
    sectorName: 'Penyediaan Akomodasi & Makan Minum',
    sectorLetter: 'I',
    icon: 'Utensils',
    // No sub-sectors yet.
  },
  // ── Placeholder slots for future sectors ─────────────────────────────
  // Uncomment and fill in when new sectors (Jasa, Konstruksi, etc.) are added:
  // {
  //   sectorId: 'jasa',
  //   sectorName: 'Jasa',
  //   sectorLetter: 'N',
  //   icon: 'Briefcase',
  // },
];

/**
 * Quick-lookup map: sectorId → SectorTaxonomy
 * @type {Map<string, SectorTaxonomy>}
 */
export const SECTOR_MAP = new Map(SECTOR_TAXONOMY.map((s) => [s.sectorId, s]));

/**
 * Quick-lookup map: subSectorId → SubSector
 * Useful for resolving a subSectorId without knowing its parent sector.
 * @type {Map<string, SubSector & { sectorId: string }>}
 */
export const SUB_SECTOR_MAP = new Map(
  SECTOR_TAXONOMY.flatMap((s) =>
    (s.subSectors || []).map((ss) => [ss.subSectorId, { ...ss, sectorId: s.sectorId }])
  )
);
