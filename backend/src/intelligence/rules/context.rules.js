// ============================================
// PayFlux AI - Context Rules
// backend/src/intelligence/rules/context.rules.js
// ============================================
// Flags based on time-of-day and environmental context.

const name = 'context_rules';

/**
 * Evaluate context-based rules.
 * @param {object} context - { amount, userMetadata, timestamp }
 * @returns {Array<{ rule, message, severity }>}
 */
function evaluate(context) {
  const flags = [];
  const { amount, timestamp } = context;
  const amountRupees = amount / 100;

  // Get IST hour (UTC + 5:30)
  const utcHour = new Date(timestamp).getUTCHours();
  const utcMinute = new Date(timestamp).getUTCMinutes();
  const istHour = (utcHour + 5 + Math.floor((utcMinute + 30) / 60)) % 24;

  // Rule 1: Late-night high-value transaction (12 AM - 5 AM IST)
  if (istHour >= 0 && istHour < 5 && amountRupees > 5000) {
    flags.push({
      rule: 'late_night_high_value',
      message: `High-value payment (₹${amountRupees.toLocaleString()}) at ${istHour}:00 IST`,
      severity: 'warning',
    });
  }

  // Rule 2: Any transaction in deep night (2 AM - 4 AM IST)
  if (istHour >= 2 && istHour < 4) {
    flags.push({
      rule: 'deep_night_transaction',
      message: `Transaction at unusual hour (${istHour}:00 IST)`,
      severity: 'info',
    });
  }

  // Rule 3: Weekend high-value transaction (> ₹50,000)
  const dayOfWeek = new Date(timestamp).getDay(); // 0 = Sunday, 6 = Saturday
  if ((dayOfWeek === 0 || dayOfWeek === 6) && amountRupees > 50000) {
    flags.push({
      rule: 'weekend_high_value',
      message: `High-value payment on weekend (₹${amountRupees.toLocaleString()})`,
      severity: 'info',
    });
  }

  return flags;
}

module.exports = { name, evaluate };
