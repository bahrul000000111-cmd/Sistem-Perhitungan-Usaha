/**
 * useLocalStorage.js
 * Custom hook that syncs state with localStorage automatically.
 */
import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (e) {
      console.warn('localStorage write failed:', e);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
