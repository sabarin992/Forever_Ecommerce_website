import axios from "axios";
import { USER_ACCESS_TOKEN, USER_REFRESH_TOKEN, ADMIN_ACCESS_TOKEN, ADMIN_REFRESH_TOKEN } from "./constants";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ----- User API Instance -----
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});

// Fixed interceptor with proper error handling
api.interceptors.response.use(
  (response) => {
    console.log('interceptor response');
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    console.log('status = ', error?.response?.status);
    
    // Fixed the condition - should be OR not AND
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/token/refresh/")
    ) {
      originalRequest._retry = true;

      try {
        console.log("Refreshing token...");
        // Make sure to use withCredentials for refresh request too
        await api.post("/token/refresh/", { withCredentials: true });

        return api(originalRequest); // Retry original request
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ----- Admin API Instance -----
export const adminApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Fixed the condition here too
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/token/refresh/")
    ) {
      originalRequest._retry = true;
      
      try {
        console.log('access token updated');
        
        // Use adminApi instance for consistency
        await adminApi.post("/token/refresh/", {}, { withCredentials: true });

        return adminApi(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;