// ============================================
// PayFlux AI - Frequency Rules
// backend/src/intelligence/rules/frequency.rules.js
// ============================================
// Flags unusual transaction frequency patterns.

const name = 'frequency_rules';

/**
 * Evaluate frequency-based rules.
 * @param {object} context - { amount, userMetadata, timestamp, isNewUser }
 * @returns {Array<{ rule, message, severity }>}
 */
function evaluate(context) {
  const flags = [];
  const { userMetadata, timestamp, isNewUser } = context;

  // Skip frequency checks for new users (no history)
  if (isNewUser || !userMetadata.lastTransactionAt) {
    return flags;
  }

  const lastTxTime = new Date(userMetadata.lastTransactionAt).getTime();
  const now = new Date(timestamp).getTime();
  const minutesSinceLastTx = (now - lastTxTime) / (1000 * 60);
  const hoursSinceLastTx = minutesSinceLastTx / 60;

  // Rule 1: Rapid-fire transactions (< 2 minutes apart)
  if (minutesSinceLastTx < 2) {
    flags.push({
      rule: 'rapid_fire_transaction',
      message: `Transaction attempted ${Math.round(minutesSinceLastTx * 60)}s after last payment`,
      severity: 'critical',
    });
  }

  // Rule 2: Burst pattern (< 5 minutes apart)
  if (minutesSinceLastTx >= 2 && minutesSinceLastTx < 5) {
    flags.push({
      rule: 'burst_transaction',
      message: `Transaction ${Math.round(minutesSinceLastTx)}min after last payment`,
      severity: 'warning',
    });
  }

  // Rule 3: High daily transaction count indicator
  // If user has many transactions and last one was recent,
  // they might be on a spending spree
  if (userMetadata.totalTransactions > 10 && hoursSinceLastTx < 1) {
    flags.push({
      rule: 'high_frequency_user',
      message: 'Multiple transactions within the last hour from a high-volume user',
      severity: 'info',
    });
  }

  // Rule 4: Dormant account suddenly active
  // No transactions for 30+ days, then a sudden payment
  const daysSinceLastTx = hoursSinceLastTx / 24;
  if (daysSinceLastTx > 30 && userMetadata.totalTransactions >= 3) {
    flags.push({
      rule: 'dormant_account_reactivation',
      message: `Account dormant for ${Math.round(daysSinceLastTx)} days, now active`,
      severity: 'warning',
    });
  }

  return flags;
}

module.exports = { name, evaluate };
