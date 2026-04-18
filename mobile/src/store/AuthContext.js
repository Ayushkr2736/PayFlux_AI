// ============================================
// PayFlux AI - Auth Context
// mobile/src/store/AuthContext.js
// ============================================
// Manages auth state — user data, token, login/logout.
// Persists token to AsyncStorage for session persistence.

import React, { createContext, useState, useEffect } from 'react';
import { getItem, setItem, removeItem } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import { loginUser, registerUser, getProfile } from '../services/auth.api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // True while checking stored token
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for stored token on app launch
  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await getItem(STORAGE_KEYS.AUTH_TOKEN);
      const storedUser = await getItem(STORAGE_KEYS.USER_DATA);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email, password) {
    const response = await loginUser({ email, password });
    await persistAuth(response.data.token, response.data.user);
    return response;
  }

  async function register(name, email, phone, password) {
    const response = await registerUser({ name, email, phone, password });
    await persistAuth(response.data.token, response.data.user);
    return response;
  }

  async function logout() {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    await removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await removeItem(STORAGE_KEYS.USER_DATA);
  }

  async function refreshProfile() {
    try {
      const response = await getProfile();
      setUser(response.data.user);
      await setItem(STORAGE_KEYS.USER_DATA, response.data.user);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  }

  async function persistAuth(newToken, newUser) {
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
    await setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
    await setItem(STORAGE_KEYS.USER_DATA, newUser);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
