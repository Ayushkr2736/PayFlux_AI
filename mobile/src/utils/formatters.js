// ============================================
// PayFlux AI - Formatters
// mobile/src/utils/formatters.js
// ============================================
// Currency, date, and number formatting utilities.

/**
 * Format amount from paise to INR display string.
 * @param {number} paise - Amount in paise
 * @returns {string} e.g., "₹1,234.56"
 */
export function formatCurrency(paise) {
  const rupees = paise / 100;
  return `₹${rupees.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format a date to a readable string.
 * @param {string|Date} date
 * @returns {string} e.g., "18 Apr 2026, 5:30 PM"
 */
export function formatDate(date) {
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format relative time (e.g., "2 min ago", "3 hours ago").
 * @param {string|Date} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

/**
 * Truncate a string with ellipsis.
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
export function truncate(str, maxLen = 30) {
  if (!str) return '';
  return str.length > maxLen ? `${str.slice(0, maxLen)}...` : str;
}
