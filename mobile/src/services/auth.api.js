// ============================================
// PayFlux AI - Auth API Client
// mobile/src/services/auth.api.js
// ============================================
// API calls for authentication endpoints.

import api from './api.service';

/**
 * Register a new user.
 * @param {{ name, email, phone, password }} data
 * @returns {{ user, token }}
 */
export async function registerUser(data) {
  return api.post('/auth/register', data);
}

/**
 * Login with email and password.
 * @param {{ email, password }} credentials
 * @returns {{ user, token }}
 */
export async function loginUser(credentials) {
  return api.post('/auth/login', credentials);
}

/**
 * Get current user profile.
 * @returns {{ user }}
 */
export async function getProfile() {
  return api.get('/auth/me');
}

/**
 * Update user profile.
 * @param {{ name?, phone? }} updates
 * @returns {{ user }}
 */
export async function updateProfile(updates) {
  return api.put('/auth/me', updates);
}
