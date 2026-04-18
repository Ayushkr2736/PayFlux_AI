// ============================================
// PayFlux AI - API Service (Axios Instance)
// mobile/src/services/api.service.js
// ============================================
// Configured Axios instance with auth interceptor,
// error normalization, and token injection.

import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';
import { getItem } from '../utils/storage';

// Create Axios instance with defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request Interceptor: Inject auth token ---
api.interceptors.request.use(
  async (config) => {
    const token = await getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor: Normalize errors ---
api.interceptors.response.use(
  (response) => response.data, // Unwrap data envelope
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Network error. Please try again.';

    const normalizedError = {
      message,
      status: error.response?.status || 0,
      data: error.response?.data || null,
      isNetworkError: !error.response, // true if no response (offline, timeout)
    };

    return Promise.reject(normalizedError);
  }
);

export default api;
