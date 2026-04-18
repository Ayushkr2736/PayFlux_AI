// ============================================
// PayFlux AI - AsyncStorage Wrappers
// mobile/src/utils/storage.js
// ============================================
// Typed get/set/remove wrappers around AsyncStorage
// with JSON serialization built in.

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Store a value (auto-serializes objects to JSON).
 */
export async function setItem(key, value) {
  try {
    const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Storage SET error [${key}]:`, error);
  }
}

/**
 * Retrieve a value (auto-parses JSON).
 */
export async function getItem(key) {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) return null;

    try {
      return JSON.parse(value);
    } catch {
      return value; // Return raw string if not valid JSON
    }
  } catch (error) {
    console.error(`Storage GET error [${key}]:`, error);
    return null;
  }
}

/**
 * Remove a value by key.
 */
export async function removeItem(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Storage REMOVE error [${key}]:`, error);
  }
}

/**
 * Clear all app storage (use with caution).
 */
export async function clearAll() {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Storage CLEAR error:', error);
  }
}
