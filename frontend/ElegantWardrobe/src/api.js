import axios from "axios";
import { USER_ACCESS_TOKEN, USER_REFRESH_TOKEN, ADMIN_ACCESS_TOKEN, ADMIN_REFRESH_TOKEN } from "./constants";
import { Import } from "lucide-react";
// export const API_BASE_URL = "https://forever.sabarinathem.xyz/api";
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;



// ----- User API Instance -----

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => {
    console.log('interceptor response')
    return response},
  async (error) => {
    const originalRequest = error.config;
    console.log('status = ',error?.response?.status);
    
    if (
      error.response?.status === 401 ||  error.response?.status === 403 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/token/refresh/")
    ) {
      originalRequest._retry = true;

      try {
        console.log("Refreshing token...");
        await api.post("/token/refresh/"); // Use same Axios instance

        return api(originalRequest); // Retry original request
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        // Optionally: redirect to login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);




// ----- Admin API Instance -----

// Create Axios instance
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

    // If 401 Unauthorized AND not already retried
    if (
      error.response?.status === 401 || error.response?.status === 403 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/token/refresh/")
    ) {
      originalRequest._retry = true;
      
      try {
        console.log('access token updated');
        
        // Call refresh endpoint (cookies will be included automatically)
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/token/refresh/`,
          {},
          { withCredentials: true } // ✅ send cookies
        );

        // You don’t need to manually set the token, just retry request
        return adminApi(originalRequest);
      } catch (refreshError) {
        // console.error("Token refresh failed", refreshError);
        // Optionally redirect to login or show error
      }
    }

    return Promise.reject(error);
  }
);


export default api


