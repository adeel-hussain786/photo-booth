// Central API base URL. In development it falls back to the local backend;
// in production set VITE_API_URL (e.g. https://api.yoursite.com) at build time.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Convenience builder so callers write apiUrl("/api/...") instead of string
// concatenation everywhere.
export function apiUrl(path) {
  return `${API_URL}${path}`;
}
