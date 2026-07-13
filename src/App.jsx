/**
 * App.jsx
 * Root SPA component for UMK Revenue Calculator.
 * Manages global state, routing, and modal orchestration.
 */
import { useState, useCallback, useMemo } from 'react';
import {
  Plus, Trash2, DatabaseZap, Search, SortAsc,
  LayoutDashboard, FileText, ChevronRight, Inbox
} from 'lucide-react';

import AppHeader       from './components/AppHeader';
import DashboardStats  from './components/DashboardStats';
import CategorySidebar from './components/CategorySidebar';
import RecordCard      from './components/RecordCard';
import AddRecordModal  from './components/AddRecordModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import ClearDataModal  from './components/ClearDataModal';
import PrintReport     from './components/PrintReport';
import { useUMKStore } from './hooks/useUMKStore';
import { CATEGORIES }  from './utils/calculations';

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const { records, addRecord, updateRecord, updateInput, deleteRecord, clearAll, duplicateRecord } = useUMKStore();

  // ── UI State ──────────────────────────────────────────────────────────────
  const [activeCategory, setActiveCategory]   = useState(null); // null = show all
  const [showAddModal,   setShowAddModal]      = useState(false);
  const [deleteTarget,   setDeleteTarget]      = useState(null); // record id
  const [showClearModal, setShowClearModal]    = useState(false);
  const [searchQuery,    setSearchQuery]       = useState('');

  // ── Derived Data ──────────────────────────────────────────────────────────

  /** Filter records by active category and search query */
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchCat = activeCategory ? r.categoryId === activeCategory : true;
      const matchSearch = searchQuery.trim()
        ? r.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchCat && matchSearch;
    });
  }, [records, activeCategory, searchQuery]);

  const activeCategory_obj = useMemo(
    () => CATEGORIES.find(c => c.id === activeCategory),
    [activeCategory]
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAddConfirm = useCallback((categoryId, name, defaultInputs) => {
    addRecord(categoryId, name, defaultInputs);
  }, [addRecord]);

  const handleUpdateRecord = useCallback((id, updates) => {
    updateRecord(id, updates);
  }, [updateRecord]);

  const handleDeleteRequest = useCallback((id) => {
    setDeleteTarget(id);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      deleteRecord(deleteTarget);
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteRecord]);

  const handleClearAll = useCallback(() => {
    clearAll();
    setShowClearModal(false);
  }, [clearAll]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const deleteTargetRecord = useMemo(
    () => records.find(r => r.id === deleteTarget),
    [records, deleteTarget]
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full bg-surface-900 flex flex-col overflow-x-hidden">

      {/* ── Ambient blobs (decorative) ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-48 -left-48 w-[500px] h-[500px] bg-indigo-700/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-violet-700/6 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-cyan-700/5 rounded-full blur-3xl" />
      </div>

      {/* ── Sticky Header ── */}
      <AppHeader onPrint={handlePrint} />

      {/* ── Main Content ── */}
      <main className="flex-1 w-full max-w-screen-2xl mx-auto px-3 sm:px-5 py-4 flex flex-col gap-4">

        {/* ① Dashboard KPI strip */}
        <section aria-label="Ringkasan Dashboard">
          <DashboardStats records={records} />
        </section>

        {/* ② Category navigation + content area */}
        <div className="flex flex-col md:flex-row w-full gap-4 items-start">

          {/* Sidebar — desktop only (hidden on mobile) */}
          <aside className="no-print hidden md:block shrink-0">
            <CategorySidebar
              activeCategory={activeCategory}
              onSelect={(id) => setActiveCategory(prev => prev === id ? null : id)}
              records={records}
              variant="sidebar"
            />
          </aside>

          {/* ── Right column: mobile tabs + toolbar + record list ── */}
          <div className="w-full flex-1 flex flex-col gap-3">

            {/* Mobile category tabs — only visible below md breakpoint */}
            <div className="md:hidden">
              <CategorySidebar
                activeCategory={activeCategory}
                onSelect={(id) => setActiveCategory(prev => prev === id ? null : id)}
                records={records}
                variant="tabs"
              />
            </div>

            {/* ── Toolbar ── */}
            <div className="no-print glass rounded-2xl border border-white/[0.06] px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">

              {/* Page title / breadcrumb */}
              <div className="flex items-center gap-2">
                <LayoutDashboard size={14} className="text-slate-500" />
                <span className="text-[12px] text-slate-500">Semua Usaha</span>
                {activeCategory_obj && (
                  <>
                    <ChevronRight size={12} className="text-slate-600" />
                    <span className="text-[12px] text-indigo-400 font-medium">{activeCategory_obj.name}</span>
                  </>
                )}
              </div>

              {/* Actions container */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                {/* Search */}
                <div className="relative w-full sm:w-auto">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    id="input-search"
                    type="text"
                    placeholder="Cari usaha..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-[12px] rounded-xl bg-surface-700 border border-white/[0.07] text-slate-200 placeholder:text-slate-600 w-full sm:w-48"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {/* Clear all button */}
                  {records.length > 0 && (
                    <button
                      id="btn-clear-all"
                      onClick={() => setShowClearModal(true)}
                      className="tooltip flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] text-slate-400 hover:text-amber-400 border border-white/[0.07] hover:border-amber-500/30 hover:bg-amber-500/5 transition-all flex-1 sm:flex-initial"
                      data-tip="Hapus semua data"
                    >
                      <DatabaseZap size={13} />
                      <span>Reset</span>
                    </button>
                  )}

                  {/* Add record CTA */}
                  <button
                    id="btn-add-record"
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-1.5 rounded-xl text-[12px] font-semibold bg-indigo-500 hover:bg-indigo-400 text-white transition-all shadow-lg shadow-indigo-900/30 flex-1 sm:flex-initial"
                  >
                    <Plus size={14} />
                    <span>Tambah Usaha</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ── Record list ── */}
            <div className="flex flex-col gap-3">
              {filteredRecords.length === 0 ? (
                /* Empty state */
                <div className="w-full glass rounded-2xl border border-white/[0.06] flex flex-col items-center justify-center py-12 px-6 text-center fade-in-up">
                  <div className="w-16 h-16 rounded-2xl bg-surface-700/50 flex items-center justify-center mb-4">
                    <Inbox size={28} className="text-slate-500" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-slate-300 mb-1.5">
                    {searchQuery ? 'Tidak Ditemukan' : 'Belum Ada Catatan Usaha'}
                  </h3>
                  <p className="text-[13px] text-slate-500 max-w-xs leading-relaxed mb-5">
                    {searchQuery
                      ? `Tidak ada catatan yang cocok dengan "${searchQuery}".`
                      : 'Mulai dengan menambahkan catatan usaha pertama Anda. Pilih kategori dan masukkan data pendapatan.'}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-indigo-500 hover:bg-indigo-400 text-white transition-all"
                    >
                      <Plus size={15} />
                      Tambah Usaha Pertama
                    </button>
                  )}
                </div>
              ) : (
                filteredRecords.map((record) => (
                  <RecordCard
                    key={record.id}
                    record={record}
                    allRecords={records}
                    onUpdate={handleUpdateRecord}
                    onDelete={handleDeleteRequest}
                    onDuplicate={duplicateRecord}
                  />
                ))
              )}
            </div>

            {/* Record count footer */}
            {filteredRecords.length > 0 && (
              <p className="text-center text-[10px] text-slate-600 pb-2 no-print">
                Menampilkan {filteredRecords.length} dari {records.length} catatan ·
                Data tersimpan otomatis di perangkat ini
              </p>
            )}
          </div>
        </div>
      </main>

      {/* ── Modals ── */}
      {showAddModal && (
        <AddRecordModal
          onConfirm={handleAddConfirm}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {deleteTarget && deleteTargetRecord && (
        <DeleteConfirmModal
          recordName={deleteTargetRecord.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {showClearModal && (
        <ClearDataModal
          count={records.length}
          onConfirm={handleClearAll}
          onCancel={() => setShowClearModal(false)}
        />
      )}

      {/* ── Print Report (hidden, shown on print) ── */}
      <PrintReport records={records} />
    </div>
  );
}
