/**
 * ClearDataModal.jsx
 * Confirmation modal for wiping all localStorage data.
 */
import { DatabaseZap, X, AlertTriangle } from 'lucide-react';

export default function ClearDataModal({ count, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" role="alertdialog" aria-modal="true">
      <div className="glass rounded-2xl border border-amber-500/20 w-full max-w-sm scale-in">

        <div className="flex flex-col items-center pt-7 pb-4 px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center mb-4">
            <DatabaseZap size={24} className="text-amber-400" />
          </div>
          <h2 className="text-[15px] font-bold text-white mb-1.5">Reset Semua Data?</h2>
          <p className="text-[13px] text-slate-400 leading-relaxed">
            Semua <strong className="text-amber-300">{count} catatan usaha</strong> akan dihapus permanen dari perangkat ini.
            Data tidak dapat dipulihkan.
          </p>
        </div>

        <div className="flex gap-3 px-5 pb-5">
          <button
            id="btn-cancel-clear"
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium text-slate-300 border border-white/[0.1] hover:text-white hover:border-white/[0.2] transition-all"
          >
            <X size={14} />
            Batal
          </button>
          <button
            id="btn-confirm-clear"
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-amber-500 hover:bg-amber-400 text-white transition-all"
          >
            <AlertTriangle size={14} />
            Reset Semua
          </button>
        </div>
      </div>
    </div>
  );
}
