import axios from "axios";

const TOKEN_KEY = "verdict_token";

/**
 * Shared Axios instance for all API communication.
 * baseURL defaults to same-origin (proxied to the backend in dev, or set
 * VITE_API_URL to the deployed backend URL in production).
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
});

// Attach the JWT bearer token to every request when present.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Normalize an Axios error into a readable message. */
export function apiError(err, fallback = "Something went wrong.") {
  return err?.response?.data?.error || err?.message || fallback;
}

export { TOKEN_KEY };
