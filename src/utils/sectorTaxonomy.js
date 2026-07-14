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
 *   Tingkat 2 → Division (2-3-digit prefix of KBLI code, e.g. "012", "03")
 *
 * Sub-sector ordering within "Pertanian" (as requested):
 *   Perikanan → Peternakan → Hortikultura → Perkebunan → Pangan → Kehutanan
 */

/**
 * @typedef {Object} SubSector
 * @property {string} subSectorId    - Slug, e.g. "perkebunan"
 * @property {string} subSectorName  - Human-readable label
 * @property {string} divisionCode   - 2-3 digit KBLI Division prefix
 * @property {string} icon           - Lucide icon name (for potential future use)
 */

/**
 * @typedef {Object} SectorTaxonomy
 * @property {string}            sectorId      - Slug, e.g. "pertanian-kehutanan-perikanan"
 * @property {string}            sectorName    - Full human-readable name
 * @property {string}            sectorLetter  - Official KBLI Section letter, e.g. "A"
 * @property {string}            icon          - Lucide icon component name
 * @property {SubSector[]|undefined} subSectors - Tingkat 2; omit for flat sectors
 */

/** @type {SectorTaxonomy[]} */
export const SECTOR_TAXONOMY = [
  {
    sectorId: 'pertanian-kehutanan-perikanan',
    sectorName: 'Pertanian, Kehutanan & Perikanan',
    sectorLetter: 'A',
    icon: 'Leaf',
    // Sub-sector order: Perikanan, Peternakan, Hortikultura, Perkebunan, Pangan, Kehutanan
    subSectors: [
      {
        subSectorId: 'perikanan',
        subSectorName: 'Perikanan',
        divisionCode: '03',
        icon: 'Fish',
      },
      {
        subSectorId: 'peternakan',
        subSectorName: 'Peternakan',
        divisionCode: '014',
        icon: 'Beef',
      },
      {
        subSectorId: 'hortikultura',
        subSectorName: 'Hortikultura',
        divisionCode: '013',
        icon: 'Flower2',
      },
      {
        subSectorId: 'perkebunan',
        subSectorName: 'Perkebunan',
        divisionCode: '012',
        icon: 'TreePalm',
      },
      {
        subSectorId: 'pangan',
        subSectorName: 'Pangan',
        divisionCode: '011',
        icon: 'Wheat',
      },
      {
        subSectorId: 'kehutanan',
        subSectorName: 'Kehutanan',
        divisionCode: '02',
        icon: 'Trees',
      },
    ],
  },
  {
    sectorId: 'perdagangan',
    sectorName: 'Perdagangan',
    sectorLetter: 'G',
    icon: 'ShoppingCart',
    // No sub-sectors; add subSectors array if Perdagangan grows significantly.
  },
  {
    sectorId: 'industri-pengolahan',
    sectorName: 'Industri Pengolahan',
    sectorLetter: 'C',
    icon: 'Factory',
    // No sub-sectors.
  },
  {
    sectorId: 'akomodasi-makan-minum',
    sectorName: 'Penyediaan Akomodasi & Makan Minum',
    sectorLetter: 'I',
    icon: 'Utensils',
    // No sub-sectors.
  },
  // ── Placeholder slots for future sectors ──────────────────────────────────
  // Uncomment when new sectors (Jasa, Konstruksi, etc.) are added:
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
 * Quick-lookup map: subSectorId → SubSector (with parent sectorId attached)
 * @type {Map<string, SubSector & { sectorId: string }>}
 */
export const SUB_SECTOR_MAP = new Map(
  SECTOR_TAXONOMY.flatMap((s) =>
    (s.subSectors || []).map((ss) => [ss.subSectorId, { ...ss, sectorId: s.sectorId }])
  )
);
