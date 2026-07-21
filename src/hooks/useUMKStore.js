/**
 * useUMKStore.js
 * Custom hook: centralized state management for the UMK Calculator.
 * Persists all records to localStorage and provides CRUD actions.
 */
import { useState, useCallback, useEffect } from 'react';
import { 
  migrateLegacyNelayanInputs,
  migrateLegacyBagiHasilInputs,
  migrateLegacyPerkebunanInputs,
  migrateLegacyIndustriInputs 
} from '../utils/calculations';

const STORAGE_KEY = 'umk_records_v1';

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateId() {
  return `umk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    
    // Migrate legacy records
    let modified = false;
    const migrated = parsed.map(record => {
      if (!record.inputs) record.inputs = {};
      if (!record.inputs.calculation_method) {
        record.inputs.calculation_method = 'PENCATATAN_RIIL';
        modified = true;
      }
      
      const beforeStr = JSON.stringify(record.inputs);
      let migratedInputs = record.inputs;
      
      if (record.categoryId === 'nelayan_tangkap') {
        migratedInputs = migrateLegacyBagiHasilInputs(migratedInputs);
        migratedInputs = migrateLegacyNelayanInputs(migratedInputs);
      } else if (record.categoryId === 'perkebunan_tahunan') {
        migratedInputs = migrateLegacyPerkebunanInputs(migratedInputs);
      } else if (record.categoryId === 'industri_kopra') {
        migratedInputs = migrateLegacyIndustriInputs(migratedInputs);
      }
      
      if (JSON.stringify(migratedInputs) !== beforeStr) {
        record.inputs = migratedInputs;
        modified = true;
      }
      return record;
    });

    if (modified) {
      saveToStorage(migrated);
    }
    return migrated;
  } catch {
    return [];
  }
}

function saveToStorage(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('localStorage write error:', err);
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useUMKStore() {
  const [records, setRecordsState] = useState(loadFromStorage);

  // Persist to localStorage on every state change
  const setRecords = useCallback((updater) => {
    setRecordsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveToStorage(next);
      return next;
    });
  }, []);

  // Sync on mount in case storage was changed in another tab
  useEffect(() => {
    const handleStorageEvent = (e) => {
      if (e.key === STORAGE_KEY) {
        setRecordsState(loadFromStorage());
      }
    };
    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  // ── CRUD actions ────────────────────────────────────────────────────────

  /** Add a new business record */
  const addRecord = useCallback((categoryId, name, inputs = {}) => {
    const newRecord = {
      id: generateId(),
      categoryId,
      name: name || `Usaha ${Date.now()}`,
      inputs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setRecords(prev => [newRecord, ...prev]);
    return newRecord.id;
  }, [setRecords]);

  /** Update inputs for an existing record */
  const updateRecord = useCallback((id, updatesOrFn) => {
    setRecords(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        const resolvedUpdates = typeof updatesOrFn === 'function' ? updatesOrFn(r) : updatesOrFn;
        return { ...r, ...resolvedUpdates, updatedAt: new Date().toISOString() };
      })
    );
  }, [setRecords]);

  /** Update a single input field on a record (real-time reactive) */
  const updateInput = useCallback((id, field, value) => {
    setRecords(prev =>
      prev.map(r =>
        r.id === id
          ? { ...r, inputs: { ...r.inputs, [field]: value }, updatedAt: new Date().toISOString() }
          : r
      )
    );
  }, [setRecords]);

  /** Delete a record by ID */
  const deleteRecord = useCallback((id) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  }, [setRecords]);

  /** Reset all records (wipe localStorage) */
  const clearAll = useCallback(() => {
    setRecords([]);
  }, [setRecords]);

  /** Duplicate an existing record */
  const duplicateRecord = useCallback((id) => {
    setRecords(prev => {
      const source = prev.find(r => r.id === id);
      if (!source) return prev;
      const copy = {
        ...source,
        id: generateId(),
        name: `${source.name} (Salinan)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return [copy, ...prev];
    });
  }, [setRecords]);

  return {
    records,
    addRecord,
    updateRecord,
    updateInput,
    deleteRecord,
    clearAll,
    duplicateRecord
  };
}
