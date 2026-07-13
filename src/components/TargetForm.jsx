/**
 * TargetForm.jsx
 * Modal / slide-in panel to Add or Edit a target entry.
 */
import { useState, useEffect, useRef } from 'react';
import { X, Plus, Save } from 'lucide-react';
import { generateId } from '../utils/dataUtils';

const emptyForm = { name: '', target: '', progres1: '', progres2: '', draft: '' };

export default function TargetForm({ editEntry, onSave, onClose }) {
  const [form, setForm] = useState(emptyForm);
  const nameRef = useRef(null);

  // Pre-fill form if editing
  useEffect(() => {
    if (editEntry) {
      setForm({
        name:     editEntry.name     ?? '',
        target:   editEntry.target   ?? '',
        progres1: editEntry.progres1 ?? '',
        progres2: editEntry.progres2 ?? '',
        draft:    editEntry.draft    ?? '',
      });
    } else {
      setForm(emptyForm);
    }
    setTimeout(() => nameRef.current?.focus(), 60);
  }, [editEntry]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const entry = {
      id:       editEntry?.id ?? generateId(),
      name:     form.name.trim(),
      target:   Number(form.target)   || 0,
      progres1: Number(form.progres1) || 0,
      progres2: Number(form.progres2) || 0,
      draft:    Number(form.draft)    || 0,
    };
    onSave(entry);
    onClose();
  }

  const isEdit = !!editEntry;

  const fields = [
    { key: 'name',     label: 'Nama Target / Kegiatan', type: 'text',   placeholder: 'Contoh: PPL - Ahmad Fauzi', required: true },
    { key: 'target',   label: 'Target Utama (Prelist)', type: 'number', placeholder: '0', required: true },
    { key: 'progres1', label: 'Progres 1 — Submitted',  type: 'number', placeholder: '0' },
    { key: 'progres2', label: 'Progres 2 — Approved',   type: 'number', placeholder: '0' },
    { key: 'draft',    label: 'Draft (Belum Submit)',    type: 'number', placeholder: '0' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass rounded-2xl w-full max-w-md fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-500/20 text-primary-400">
              {isEdit ? <Save size={18} /> : <Plus size={18} />}
            </div>
            <h2 className="font-bold text-lg text-white">
              {isEdit ? 'Edit Target' : 'Tambah Target Baru'}
            </h2>
          </div>
          <button
            id="close-form-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {fields.map(f => (
            <div key={f.key} className="space-y-1.5">
              <label htmlFor={`form-${f.key}`} className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {f.label}
                {f.required && <span className="text-rose-400 ml-1">*</span>}
              </label>
              <input
                ref={f.key === 'name' ? nameRef : undefined}
                id={`form-${f.key}`}
                name={f.key}
                type={f.type}
                min={f.type === 'number' ? 0 : undefined}
                value={form[f.key]}
                onChange={handleChange}
                required={f.required}
                placeholder={f.placeholder}
                className="
                  w-full px-4 py-2.5 rounded-xl
                  bg-surface-600 border border-white/10
                  text-white placeholder-slate-500
                  text-sm transition-all
                  focus:border-primary-500/60
                "
              />
            </div>
          ))}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              id="cancel-form-btn"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              id="submit-form-btn"
              className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isEdit ? <><Save size={14} /> Simpan Perubahan</> : <><Plus size={14} /> Tambah Target</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
