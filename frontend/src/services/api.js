import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor (if you need auth headers later)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
let isLoggingOut = false;
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isLoggingOut) {
      isLoggingOut = true;

      // Clear storage + notify app
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("auth-logout"));

      // Redirect once
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
