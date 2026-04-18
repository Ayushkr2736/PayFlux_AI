// ============================================
// PayFlux AI - Auth Service
// backend/src/services/auth.service.js
// ============================================
// Pure business logic for authentication.
// No knowledge of HTTP — only models and JWT.

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { config } = require('../config/env');
const logger = require('../utils/logger');

/**
 * Register a new user.
 * @param {object} userData - { name, email, phone, password }
 * @returns {{ user, token }}
 */
async function registerUser({ name, email, phone, password }) {
  // Create user (password is hashed by the pre-save hook in User model)
  const user = await User.create({ name, email, phone, password });

  // Generate JWT
  const token = generateToken(user._id);

  return {
    user: user.toJSON(),
    token,
  };
}

/**
 * Authenticate a user by email and password.
 * @param {string} email
 * @param {string} password
 * @returns {{ user, token } | null} null if credentials are invalid
 */
async function loginUser(email, password) {
  // Find user and explicitly select password field (excluded by default)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return null;
  }

  // Compare password using bcrypt
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return null;
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  // Generate JWT
  const token = generateToken(user._id);

  return {
    user: user.toJSON(),
    token,
  };
}

/**
 * Get user by ID (without password).
 * @param {string} userId
 * @returns {object|null}
 */
async function getUserById(userId) {
  return User.findById(userId);
}

/**
 * Update user fields.
 * @param {string} userId
 * @param {object} updates - Allowed fields only
 * @returns {object}
 */
async function updateUser(userId, updates) {
  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });
  return user;
}

/**
 * Generate a JWT token.
 * @param {string} userId
 * @returns {string}
 */
function generateToken(userId) {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

/**
 * Verify and decode a JWT token.
 * @param {string} token
 * @returns {object} decoded payload with { id, iat, exp }
 */
function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  updateUser,
  generateToken,
  verifyToken,
};
