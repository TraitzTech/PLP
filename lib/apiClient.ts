import axios, { AxiosError } from "axios";
import { getToken, clearToken } from "@/lib/authToken";

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    withCredentials: true,
    withXSRFToken: true
});

apiClient.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            (config.headers = config.headers || {}).Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<any>) => {
        const status = error.response?.status;
        if (status === 401) {
            // Token invalid/expired
            clearToken();
        }
        const message = (error.response?.data as any)?.message || error.message || "Unknown error";
        return Promise.reject({
            status,
            message,
            data: error.response?.data,
        });
    }
);

export default apiClient;

// Separate client for non-API routes (like Sanctum CSRF)
export const sanctumClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL?.replace('/api', ''), // Remove /api from base URL
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    withCredentials: true,
});