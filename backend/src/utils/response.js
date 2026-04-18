// ============================================
// PayFlux AI - Standard API Response Helpers
// backend/src/utils/response.js
// ============================================
// Ensures all API responses follow a consistent envelope format:
// { success: bool, data: {}, message: '', error: '' }

/**
 * Send a success response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (default 200)
 * @param {string} message - Human-readable message
 * @param {object} data - Response payload
 */
function sendSuccess(res, statusCode = 200, message = 'Success', data = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Send an error response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {string} message - Human-readable error message
 * @param {object} errors - Detailed error info (validation, etc.)
 */
function sendError(res, statusCode = 500, message = 'Internal Server Error', errors = null) {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}

module.exports = { sendSuccess, sendError };
