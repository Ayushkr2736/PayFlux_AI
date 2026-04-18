// ============================================
// PayFlux AI - Auth Middleware
// backend/src/middleware/auth.middleware.js
// ============================================
// Verifies JWT from Authorization header and
// attaches decoded user to req.user.

const { verifyToken } = require('../services/auth.service');
const { sendError } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * JWT authentication middleware.
 * Expects header: Authorization: Bearer <token>
 * Sets req.user = { id } on success.
 */
function authenticate(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return sendError(res, 401, 'Access denied. Token format invalid.');
    }

    // Verify and decode token
    const decoded = verifyToken(token);

    // Attach user info to request object
    req.user = { id: decoded.id };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token expired. Please log in again.');
    }
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 401, 'Invalid token. Please log in again.');
    }

    logger.error('Auth middleware error:', error.message);
    return sendError(res, 401, 'Authentication failed.');
  }
}

module.exports = { authenticate };
