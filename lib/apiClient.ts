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

        const extractMessage = (): string => {
            if (typeof responseData?.message === "string" && responseData.message.trim().length > 0) {
                return responseData.message;
            }

            const rawErrors = responseData?.errors;

            if (Array.isArray(rawErrors) && rawErrors.length > 0) {
                const first = rawErrors.find((item) => typeof item === "string" && item.trim().length > 0);
                if (first) return first;
            }

            if (rawErrors && typeof rawErrors === "object") {
                for (const value of Object.values(rawErrors)) {
                    if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
                        return value[0];
                    }
                    if (typeof value === "string" && value.trim().length > 0) {
                        return value;
                    }
                }
            }

            if (status === 401) return "You are not authorized. Please sign in and try again.";
            if (status === 403) return "You do not have permission to perform this action.";
            if (status === 404) return "The requested resource was not found.";
            if (status === 422) return "Please check your input and try again.";
            if (status && status >= 500) return "Server error. Please try again shortly.";

            return error.message || "Unknown error";
        };

        if (status === 401 || (status === 403 && responseData?.code === "AGENT_APPROVAL_REQUIRED")) {
            // Token invalid/expired
            clearToken();
        }

        const message = extractMessage();

        return Promise.reject({
            status,
            code: responseData?.code,
            message,
            data: responseData,
            errors: responseData?.errors,
            response: {
                status,
                data: responseData,
            },
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
