// ============================================
// PayFlux AI - Auth Controller
// backend/src/controllers/auth.controller.js
// ============================================
// Handles HTTP layer for authentication.
// Parses requests, calls auth service, sends responses.

const authService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * POST /api/auth/register
 * Register a new user account.
 */
async function register(req, res, next) {
  try {
    const { name, email, phone, password } = req.body;

    const result = await authService.registerUser({ name, email, phone, password });

    logger.info(`New user registered: ${email}`);
    return sendSuccess(res, 201, 'User registered successfully', {
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    // Handle duplicate email gracefully
    if (error.code === 11000) {
      return sendError(res, 409, 'Email already registered');
    }
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser(email, password);

    if (!result) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // Update last login timestamp
    logger.info(`User logged in: ${email}`);
    return sendSuccess(res, 200, 'Login successful', {
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Get current authenticated user's profile.
 * Requires auth middleware (req.user is set).
 */
async function getProfile(req, res, next) {
  try {
    const user = await authService.getUserById(req.user.id);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    return sendSuccess(res, 200, 'Profile fetched', { user });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/auth/me
 * Update current user's profile fields.
 */
async function updateProfile(req, res, next) {
  try {
    const allowedFields = ['name', 'phone'];
    const updates = {};

    // Only pick allowed fields from body
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await authService.updateUser(req.user.id, updates);

    return sendSuccess(res, 200, 'Profile updated', { user });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, getProfile, updateProfile };
