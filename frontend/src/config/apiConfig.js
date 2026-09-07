/**
 * Centralized API & Environment Configuration
 * 
 * Future backend developers can update the base URL via .env (VITE_API_BASE_URL)
 * without needing to modify individual services or UI components.
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  TIMEOUT_MS: 15000,
  HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  // When true or when backend is unreachable, services automatically fallback to in-memory mock data
  USE_MOCK_FALLBACK: true,
};
