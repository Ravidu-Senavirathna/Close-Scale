/**
 * Axios client configured for the Close-Scale API.
 *
 * - Uses withCredentials to send HttpOnly cookies with every request.
 * - Automatically refreshes the access token on a 401 response and
 *   retries the original request once.
 * - Redirects to /login if the refresh also fails (session expired).
 */

import axios from "axios";
import type { AxiosRequestConfig } from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Crucial for sending cookies
});

// Track whether we are already refreshing to prevent parallel refresh loops
let isRefreshing = false;
let failedQueue: Array<{
  resolve: () => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// ── Response interceptor — silent token refresh on 401 ──────────────────────
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: AxiosRequestConfig & { _retry?: boolean } =
      error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request until the current refresh completes
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // This will automatically send the HttpOnly refresh_token cookie
        // and if successful, the response will set the new access_token cookie
        await axios.post(`${BASE_URL}/api/auth/token/refresh/`, {}, {
          withCredentials: true 
        });
        
        processQueue(null);
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
