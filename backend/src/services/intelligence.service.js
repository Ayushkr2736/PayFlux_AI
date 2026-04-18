// ============================================
// PayFlux AI - Intelligence Service
// backend/src/services/intelligence.service.js
// ============================================
// Orchestrates the rule-based intelligence engine.
// Called before payment creation (pre-analysis)
// and after payment capture (post-analysis).

const rulesEngine = require('../intelligence/rules.engine');
const intentDetector = require('../intelligence/intent.detector');
const riskScorer = require('../intelligence/risk.scorer');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Run pre-payment intelligence analysis.
 * Called before creating a Razorpay order to detect
 * risky or unusual payments.
 *
 * @param {string} userId
 * @param {number} amount - in paise
 * @returns {{ intentCategory, riskScore, riskLevel, flags, suggestedAction }}
 */
async function analyzePrePayment(userId, amount) {
  try {
    // Fetch user with payment metadata
    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`Intelligence: user ${userId} not found, defaulting to low risk`);
      return getDefaultAnalysis();
    }

    // Build context for rule engine
    const context = {
      userId,
      amount,
      userMetadata: user.metadata,
      timestamp: new Date(),
      isNewUser: user.metadata.totalTransactions === 0,
    };

    // Run all rules
    const flags = rulesEngine.evaluate(context);

    // Detect intent category
    const intentCategory = intentDetector.detectIntent(context);

    // Calculate composite risk score
    const { riskScore, riskLevel } = riskScorer.calculateRisk(flags, context);

    // Determine suggested action based on risk level
    const suggestedAction = getSuggestedAction(riskLevel);

    const analysis = {
      intentCategory,
      riskScore,
      riskLevel,
      flags,
      suggestedAction,
    };

    logger.info(`Pre-payment analysis for user ${userId}:`, {
      amount: amount / 100,
      riskScore,
      riskLevel,
      intentCategory,
      flagCount: flags.length,
    });

    return analysis;
  } catch (error) {
    logger.error('Intelligence analysis failed, defaulting to safe:', error.message);
    return getDefaultAnalysis();
  }
}

/**
 * Process post-payment intelligence updates.
 * Updates user metadata after a successful payment capture.
 *
 * @param {object} payment - Payment document
 */
async function processPostPayment(payment) {
  try {
    const user = await User.findById(payment.userId);
    if (!user) return;

    // Update user payment metadata
    await user.updatePaymentMetadata(
      payment.amount,
      payment.method,
      payment.intelligence?.intentCategory
    );

    // Re-evaluate user risk profile based on updated metadata
    const riskProfile = evaluateUserRiskProfile(user.metadata);
    user.metadata.riskProfile = riskProfile;
    await user.save();

    logger.info(`Post-payment metadata updated for user ${payment.userId}`, {
      totalTransactions: user.metadata.totalTransactions,
      riskProfile,
    });
  } catch (error) {
    logger.error('Post-payment processing failed:', error.message);
  }
}

/**
 * Determine suggested action from risk level.
 */
function getSuggestedAction(riskLevel) {
  const actions = {
    low: 'auto_approve',
    medium: 'auto_approve',
    high: 'review',
    critical: 'block',
  };
  return actions[riskLevel] || 'auto_approve';
}

/**
 * Evaluate overall user risk profile from their history.
 */
function evaluateUserRiskProfile(metadata) {
  if (metadata.totalTransactions < 3) return 'unknown';
  if (metadata.totalTransactions >= 20 && metadata.avgTransactionAmount < 500000) return 'low';
  if (metadata.avgTransactionAmount > 1000000) return 'high';
  return 'medium';
}

/**
 * Default safe analysis when intelligence can't run.
 */
function getDefaultAnalysis() {
  return {
    intentCategory: 'unknown',
    riskScore: 0,
    riskLevel: 'low',
    flags: [],
    suggestedAction: 'auto_approve',
  };
}

module.exports = {
  analyzePrePayment,
  processPostPayment,
};
