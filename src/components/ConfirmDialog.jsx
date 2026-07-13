/**
 * ConfirmDialog.jsx
 * Generic confirmation pop-up (used for delete confirmations).
 */
import { AlertTriangle, X, Trash2 } from 'lucide-react';

export default function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="glass rounded-2xl w-full max-w-sm fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex flex-col items-center gap-3 p-7 text-center">
          <div className="p-4 rounded-full bg-rose-500/15 danger-pulse">
            <AlertTriangle size={28} className="text-rose-400" />
          </div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="text-sm text-slate-400 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            id="cancel-delete-btn"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
          >
            <X size={14} /> Batal
          </button>
          <button
            id="confirm-delete-btn"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 size={14} /> Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
