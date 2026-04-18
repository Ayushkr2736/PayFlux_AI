// ============================================
// PayFlux AI - Auth Routes
// backend/src/routes/auth.routes.js
// ============================================
// POST /api/auth/register  — Register new user
// POST /api/auth/login     — Login & get token
// GET  /api/auth/me        — Get profile (protected)
// PUT  /api/auth/me        — Update profile (protected)

const express = require('express');
const { register, login, getProfile, updateProfile } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

// --- Public Routes ---

router.post(
  '/register',
  validate({
    name: { required: true, type: 'string', minLength: 2 },
    email: { required: true, type: 'string', match: /^\S+@\S+\.\S+$/ },
    password: { required: true, type: 'string', minLength: 6 },
  }),
  register
);

router.post(
  '/login',
  validate({
    email: { required: true, type: 'string' },
    password: { required: true, type: 'string' },
  }),
  login
);

// --- Protected Routes ---

router.get('/me', authenticate, getProfile);
router.put('/me', authenticate, updateProfile);

module.exports = router;
