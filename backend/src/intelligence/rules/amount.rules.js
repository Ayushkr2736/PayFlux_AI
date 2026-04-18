// ============================================
// PayFlux AI - Amount Rules
// backend/src/intelligence/rules/amount.rules.js
// ============================================
// Flags unusual amounts relative to user history.

const name = 'amount_rules';

/**
 * Evaluate amount-based rules.
 * @param {object} context - { amount, userMetadata, isNewUser }
 * @returns {Array<{ rule, message, severity }>}
 */
function evaluate(context) {
  const flags = [];
  const { amount, userMetadata, isNewUser } = context;
  const amountRupees = amount / 100;

  // Rule 1: Very high single payment (> ₹1,00,000)
  if (amountRupees > 100000) {
    flags.push({
      rule: 'very_high_amount',
      message: `Payment of ₹${amountRupees.toLocaleString()} exceeds ₹1,00,000 threshold`,
      severity: 'critical',
    });
  }

  // Rule 2: Amount significantly above user average (> 5x)
  if (!isNewUser && userMetadata.avgTransactionAmount > 0) {
    const avgRupees = userMetadata.avgTransactionAmount / 100;
    const multiplier = amountRupees / avgRupees;

    if (multiplier > 5) {
      flags.push({
        rule: 'unusual_amount_spike',
        message: `Amount is ${multiplier.toFixed(1)}x the user's average (₹${avgRupees.toFixed(0)})`,
        severity: 'warning',
      });
    } else if (multiplier > 10) {
      flags.push({
        rule: 'extreme_amount_spike',
        message: `Amount is ${multiplier.toFixed(1)}x the user's average — possible fraud`,
        severity: 'critical',
      });
    }
  }

  // Rule 3: Suspiciously round large amounts (potential money laundering flag)
  if (amountRupees >= 50000 && amountRupees % 10000 === 0) {
    flags.push({
      rule: 'round_large_amount',
      message: `Large round amount of ₹${amountRupees.toLocaleString()} detected`,
      severity: 'info',
    });
  }

  // Rule 4: First-time user with high amount (> ₹10,000)
  if (isNewUser && amountRupees > 10000) {
    flags.push({
      rule: 'new_user_high_amount',
      message: `New user attempting ₹${amountRupees.toLocaleString()} payment`,
      severity: 'warning',
    });
  }

  // Rule 5: Extremely small amount (potential testing/probing)
  if (amountRupees < 2 && !isNewUser) {
    flags.push({
      rule: 'probe_amount',
      message: 'Very small amount — possible card testing',
      severity: 'warning',
    });
  }

  return flags;
}

module.exports = { name, evaluate };
