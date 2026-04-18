// ============================================
// PayFlux AI - Rules Engine
// backend/src/intelligence/rules.engine.js
// ============================================
// Core engine that runs all rule modules against
// a payment context and collects flags.

const amountRules = require('./rules/amount.rules');
const frequencyRules = require('./rules/frequency.rules');
const contextRules = require('./rules/context.rules');
const logger = require('../utils/logger');

// Registry of all rule modules
const RULE_MODULES = [amountRules, frequencyRules, contextRules];

/**
 * Evaluate all rules against the given payment context.
 * Each rule module returns an array of flag objects.
 *
 * @param {object} context - { userId, amount, userMetadata, timestamp, isNewUser }
 * @returns {Array<{ rule, message, severity }>} Combined flags from all modules
 */
function evaluate(context) {
  const allFlags = [];

  for (const ruleModule of RULE_MODULES) {
    try {
      const flags = ruleModule.evaluate(context);
      if (Array.isArray(flags)) {
        allFlags.push(...flags);
      }
    } catch (error) {
      logger.error(`Rule module error (${ruleModule.name || 'unknown'}):`, error.message);
      // Don't let one broken rule module block the entire analysis
    }
  }

  return allFlags;
}

module.exports = { evaluate };
