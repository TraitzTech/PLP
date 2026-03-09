import axios, { AxiosError } from "axios";
import { getToken, clearToken } from "@/lib/authToken";

const resolvedBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const apiClient = axios.create({
    baseURL: resolvedBaseUrl,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    // Use pure Bearer token auth for API calls; do NOT send cookies or XSRF tokens
    withCredentials: false,
    withXSRFToken: false
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
        const responseData = error.response?.data as any;
        if (status === 401 || (status === 403 && responseData?.code === "AGENT_APPROVAL_REQUIRED")) {
            // Token invalid/expired
            clearToken();
        }
        const message = responseData?.message || error.message || "Unknown error";
        return Promise.reject({
            status,
            code: responseData?.code,
            message,
            data: responseData,
        });
    }
);

export default apiClient;

// Separate client for non-API routes (like Sanctum CSRF)
export const sanctumClient = axios.create({
    baseURL: resolvedBaseUrl.replace('/api', ''), // Remove /api from base URL
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    withCredentials: true,
});
