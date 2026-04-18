// ============================================
// PayFlux AI - Validation Middleware
// backend/src/middleware/validate.middleware.js
// ============================================
// Lightweight request validation without heavy libraries.
// Validates body fields against simple rule objects.

const { sendError } = require('../utils/response');

/**
 * Creates a validation middleware from a rules object.
 *
 * Usage:
 *   validate({
 *     email: { required: true, type: 'string', match: /^\S+@\S+\.\S+$/ },
 *     amount: { required: true, type: 'number', min: 100 },
 *   })
 *
 * @param {object} rules - Field validation rules
 * @returns {Function} Express middleware
 */
function validate(rules) {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rule] of Object.entries(rules)) {
      const value = req.body[field];

      // Required check
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      // Skip further checks if field is optional and not provided
      if (value === undefined || value === null) continue;

      // Type check
      if (rule.type && typeof value !== rule.type) {
        errors.push(`${field} must be of type ${rule.type}`);
        continue;
      }

      // Min value (for numbers)
      if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
        errors.push(`${field} must be at least ${rule.min}`);
      }

      // Max value (for numbers)
      if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
        errors.push(`${field} must be at most ${rule.max}`);
      }

      // Min length (for strings)
      if (rule.minLength !== undefined && typeof value === 'string' && value.length < rule.minLength) {
        errors.push(`${field} must be at least ${rule.minLength} characters`);
      }

      // Max length (for strings)
      if (rule.maxLength !== undefined && typeof value === 'string' && value.length > rule.maxLength) {
        errors.push(`${field} must be at most ${rule.maxLength} characters`);
      }

      // Regex match
      if (rule.match && typeof value === 'string' && !rule.match.test(value)) {
        errors.push(`${field} format is invalid`);
      }

      // Enum check
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rule.enum.join(', ')}`);
      }
    }

    if (errors.length > 0) {
      return sendError(res, 400, 'Validation failed', errors);
    }

    next();
  };
}

module.exports = { validate };
