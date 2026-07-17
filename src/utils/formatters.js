/**
 * formatters.js
 * Utility functions for number formatting and currency display.
 * All monetary values use Indonesian Rupiah (Rp) format.
 */

/**
 * Format a number as Indonesian Rupiah currency string.
 * Example: 1500000 → "Rp 1.500.000"
 * @param {number} value - The numeric value to format
 * @param {boolean} compact - If true, use compact notation (e.g. "Rp 1,5 Jt")
 * @returns {string} Formatted currency string
 */
export function formatRupiah(value, compact = false) {
  if (value === null || value === undefined || isNaN(value)) return 'Rp 0';
  const num = Math.round(value);

  if (compact) {
    if (Math.abs(num) >= 1_000_000_000) {
      return `Rp ${(num / 1_000_000_000).toFixed(1).replace('.', ',')} M`;
    }
    if (Math.abs(num) >= 1_000_000) {
      return `Rp ${(num / 1_000_000).toFixed(1).replace('.', ',')} Jt`;
    }
    if (Math.abs(num) >= 1_000) {
      return `Rp ${(num / 1_000).toFixed(0)} Rb`;
    }
  }

  return 'Rp ' + num.toLocaleString('id-ID');
}

/**
 * Format a plain number with thousands separator (no currency prefix).
 * @param {number} value
 * @returns {string}
 */
export function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return Math.round(value).toLocaleString('id-ID');
}

/**
 * Format a digit string (or number) with thousands separator (dots, Indonesian standard).
 * Safe for in-progress typing (handles empty string, preserves leading digits).
 * @param {string|number} val
 * @returns {string}
 */
export function formatNumberWithDots(val) {
  if (val === undefined || val === null || val === '') return '';
  const raw = String(val).replace(/\D/g, '');
  if (!raw) return '';
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}


/**
 * Parse a formatted Rupiah string back to a raw number.
 * "Rp 1.500.000" → 1500000
 * @param {string} str
 * @returns {number}
 */
export function parseRupiah(str) {
  if (!str) return 0;
  return parseFloat(str.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
}

/**
 * Sanitize numeric input: clamp to >= 0, parse float.
 * @param {string|number} val
 * @returns {number}
 */
export function sanitizeNumericInput(val) {
  const parsed = parseFloat(String(val).replace(/[^0-9.]/g, ''));
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
}

/**
 * Format a date string to Indonesian locale.
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
}
