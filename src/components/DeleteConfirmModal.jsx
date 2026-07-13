/**
 * DeleteConfirmModal.jsx
 * Confirmation dialog before permanently deleting a record.
 */
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmModal({ recordName, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" role="alertdialog" aria-modal="true">
      <div className="glass rounded-2xl border border-rose-500/20 w-full max-w-sm scale-in danger-pulse">

        {/* Icon */}
        <div className="flex flex-col items-center pt-7 pb-4 px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-rose-400" />
          </div>
          <h2 className="text-[15px] font-bold text-white mb-1.5">Hapus Catatan?</h2>
          <p className="text-[13px] text-slate-400 leading-relaxed">
            Anda akan menghapus catatan{' '}
            <strong className="text-rose-300">"{recordName}"</strong>.
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 pb-5">
          <button
            id="btn-cancel-delete"
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium text-slate-300 border border-white/[0.1] hover:text-white hover:border-white/[0.2] transition-all"
          >
            <X size={14} />
            Batal
          </button>
          <button
            id="btn-confirm-delete"
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-rose-500 hover:bg-rose-400 text-white transition-all"
          >
            <Trash2 size={14} />
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
