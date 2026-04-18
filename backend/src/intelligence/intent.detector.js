// ============================================
// PayFlux AI - Intent Detector
// backend/src/intelligence/intent.detector.js
// ============================================
// Classifies the likely purpose of a payment
// using rule-based heuristics on amount patterns.

/**
 * Detect the likely intent category for a payment.
 *
 * @param {object} context - { amount, userMetadata, timestamp }
 * @returns {string} Intent category enum value
 */
function detectIntent(context) {
  const { amount, userMetadata } = context;
  const amountRupees = amount / 100;

  // --- Micro payments: < ₹50 ---
  if (amountRupees < 50) {
    return 'micro_payment';
  }

  // --- Subscription detection ---
  // If user has made payments of similar amounts before,
  // and this matches their average closely, it's likely recurring
  if (userMetadata.totalTransactions >= 3) {
    const avgRupees = userMetadata.avgTransactionAmount / 100;
    const variance = Math.abs(amountRupees - avgRupees) / avgRupees;

    // Within 10% of average = likely subscription/recurring
    if (variance < 0.1) {
      return 'subscription';
    }
  }

  // --- Common bill payment amounts (multiples of 100, round numbers) ---
  if (amountRupees >= 100 && amountRupees <= 10000 && amountRupees % 100 === 0) {
    return 'bill_payment';
  }

  // --- High value purchase: > ₹25,000 ---
  if (amountRupees > 25000) {
    return 'high_value_purchase';
  }

  // --- Recurring transfer detection ---
  // If user frequently transacts and amount is in their typical range
  if (
    userMetadata.totalTransactions >= 5 &&
    userMetadata.lastTransactionAt
  ) {
    const daysSinceLastTx =
      (Date.now() - new Date(userMetadata.lastTransactionAt).getTime()) / (1000 * 60 * 60 * 24);

    // Transacted within last 7 days = likely recurring pattern
    if (daysSinceLastTx < 7) {
      return 'recurring_transfer';
    }
  }

  // --- Default: one-time purchase ---
  return 'one_time_purchase';
}

module.exports = { detectIntent };
