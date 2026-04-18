// ============================================
// PayFlux AI - Global Error Handler Middleware
// backend/src/middleware/error.middleware.js
// ============================================
// Catches all unhandled errors and returns consistent responses.

const logger = require('../utils/logger');
const { sendError } = require('../utils/response');

/**
 * Global error handling middleware.
 * Must be registered LAST in the Express middleware chain.
 */
function errorHandler(err, req, res, _next) {
  // Log the full error internally
  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // -- Mongoose Validation Error --
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return sendError(res, 400, 'Validation failed', messages);
  }

  // -- Mongoose Duplicate Key Error --
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, 409, `Duplicate value for field: ${field}`);
  }

  // -- Mongoose Cast Error (invalid ObjectId, etc.) --
  if (err.name === 'CastError') {
    return sendError(res, 400, `Invalid ${err.path}: ${err.value}`);
  }

  // -- JWT Errors --
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token. Please log in again.');
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Token expired. Please log in again.');
  }

  // -- Default: Internal Server Error --
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : err.message || 'Internal Server Error';

  return sendError(res, statusCode, message);
}

/**
 * 404 handler — catch all unmatched routes.
 */
function notFoundHandler(req, res) {
  return sendError(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
}

module.exports = { errorHandler, notFoundHandler };
