/**
 * Toolbar.jsx
 * Top action bar: Add Target button + Export CSV/XLSX buttons.
 * Optimized compact padding.
 */
import { Plus, Download, FileSpreadsheet } from 'lucide-react';
import { exportToCSV, exportToXLSX } from '../utils/dataUtils';

export default function Toolbar({ entries, onAddClick }) {
  return (
    <div className="flex flex-wrap gap-2 items-center justify-between">
      {/* Left: Add button */}
      <button
        id="add-target-btn"
        onClick={onAddClick}
        className="
          flex items-center gap-1.5 px-3 py-1.5
          bg-primary-600 hover:bg-primary-500
          text-white font-semibold text-xs rounded-lg
          transition-all duration-200 shadow-md shadow-primary-500/20
          hover:shadow-primary-500/35 hover:-translate-y-0.5
        "
      >
        <Plus size={14} />
        Tambah Target
      </button>

      {/* Right: Export buttons */}
      <div className="flex gap-1.5">
        <button
          id="export-csv-btn"
          onClick={() => exportToCSV(entries)}
          disabled={entries.length === 0}
          className="
            flex items-center gap-1.5 px-2.5 py-1.5
            glass border border-white/10 text-slate-300 hover:text-white
            font-medium text-xs rounded-lg
            transition-all hover:border-white/20 hover:bg-white/5
            disabled:opacity-40 disabled:cursor-not-allowed
            tooltip
          "
          data-tip="Export ke CSV"
        >
          <Download size={13} />
          CSV
        </button>
        <button
          id="export-xlsx-btn"
          onClick={() => exportToXLSX(entries)}
          disabled={entries.length === 0}
          className="
            flex items-center gap-1.5 px-2.5 py-1.5
            bg-emerald-600/80 hover:bg-emerald-500 text-white
            font-medium text-xs rounded-lg
            transition-all
            disabled:opacity-40 disabled:cursor-not-allowed
            tooltip
          "
          data-tip="Export ke Excel (.xlsx)"
        >
          <FileSpreadsheet size={13} />
          Excel
        </button>
      </div>
    </div>
  );
}
