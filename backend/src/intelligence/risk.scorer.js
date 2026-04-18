// ============================================
// PayFlux AI - Risk Scorer
// backend/src/intelligence/risk.scorer.js
// ============================================
// Computes a 0-100 risk score from rule flags
// and maps it to a risk level bucket.

/**
 * Severity weights for risk calculation.
 */
const SEVERITY_WEIGHTS = {
  info: 5,
  warning: 20,
  critical: 40,
};

/**
 * Calculate composite risk score from flags and context.
 *
 * @param {Array<{ rule, message, severity }>} flags
 * @param {object} context - { isNewUser, amount, userMetadata }
 * @returns {{ riskScore: number, riskLevel: string }}
 */
function calculateRisk(flags, context) {
  let score = 0;

  // Base score from flags
  for (const flag of flags) {
    score += SEVERITY_WEIGHTS[flag.severity] || 5;
  }

  // New user bonus risk (no history to validate against)
  if (context.isNewUser) {
    score += 10;
  }

  // Cap at 100
  score = Math.min(score, 100);

  // Map to risk level
  const riskLevel = getRiskLevel(score);

  return { riskScore: score, riskLevel };
}

/**
 * Map numeric score to risk level.
 */
function getRiskLevel(score) {
  if (score <= 20) return 'low';
  if (score <= 50) return 'medium';
  if (score <= 75) return 'high';
  return 'critical';
}

module.exports = { calculateRisk };
