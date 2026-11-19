/**
 * RIFQ Muslim - API client.
 * One shared backend for Android, iOS and the web build.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';

function resolveBase() {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return String(fromEnv).replace(/\/+$/, '');
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
    return ''; // same origin as the served web bundle
  }
  const hostUri =
    Constants?.expoConfig?.hostUri ||
    Constants?.expoGoConfig?.debuggerHost ||
    Constants?.manifest?.debuggerHost ||
    '';
  if (hostUri) {
    const host = String(hostUri).split(':')[0];
    return `http://${host}:3000`;
  }
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  return 'http://localhost:3000';
}

export const API_BASE = resolveBase();

let authToken = null;
export function setAuthToken(token) {
  authToken = token || null;
}
export function getAuthToken() {
  return authToken;
}

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export async function request(path, { method = 'GET', body, timeoutMs = 12000, auth = true } = {}) {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && authToken) headers.Authorization = `Bearer ${authToken}`;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller ? controller.signal : undefined
    });
    const text = await res.text();
    let payload = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = { raw: text };
    }
    if (!res.ok) {
      throw new ApiError((payload && (payload.message || payload.error)) || `HTTP ${res.status}`, res.status, payload);
    }
    return payload;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.name === 'AbortError') throw new ApiError('The request timed out. Check your connection and try again.', 0, null);
    throw new ApiError('Cannot reach the RIFQ Muslim server. Check your connection.', 0, null);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export const api = {
  health: () => request('/api/health', { auth: false }),

  register: (email, password, name) => request('/api/auth/register', { method: 'POST', body: { email, password, name }, auth: false }),
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  me: () => request('/api/auth/me'),
  updateProfile: (patch) => request('/api/auth/me', { method: 'PATCH', body: patch }),
  changePassword: (currentPassword, newPassword) =>
    request('/api/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } }),
  forgotPassword: (email) => request('/api/auth/forgot', { method: 'POST', body: { email }, auth: false }),
  resetPassword: (email, code, password) => request('/api/auth/reset', { method: 'POST', body: { email, code, password }, auth: false }),
  deleteAccount: () => request('/api/auth/me', { method: 'DELETE' }),

  syncSnapshot: () => request('/api/data'),
  syncCollection: (name) => request(`/api/data/${name}`),
  pushCollection: (name, items, version) => request(`/api/data/${name}`, { method: 'PUT', body: { items, version } }),
  pushBulk: (collections) => request('/api/data/bulk', { method: 'POST', body: { collections } }),

  surahs: () => request('/api/quran/surahs', { auth: false }),
  surah: (n) => request(`/api/quran/surah/${n}`, { auth: false }),
  dataset: (name) => request(`/api/content/${name}`, { auth: false }),
  countries: () => request('/api/content/countries', { auth: false }),

  reverseGeocode: (lat, lon, lang) => request(`/api/location/reverse?lat=${lat}&lon=${lon}&lang=${lang || 'en'}`, { auth: false }),
  searchPlaces: (q, lang) => request(`/api/location/search?q=${encodeURIComponent(q)}&lang=${lang || 'en'}`, { auth: false }),
  mosques: (lat, lon, radius) => request(`/api/places/mosques?lat=${lat}&lon=${lon}&radius=${radius || 5000}`, { auth: false }),

  adminStats: () => request('/api/admin/stats'),
  adminUsers: (q) => request(`/api/admin/users${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  adminUpdateUser: (id, patch) => request(`/api/admin/users/${id}`, { method: 'PATCH', body: patch }),
  adminDeleteUser: (id) => request(`/api/admin/users/${id}`, { method: 'DELETE' })
};
