import apiClient, { sanctumClient } from "@/lib/apiClient";
import { setToken, clearToken } from "@/lib/authToken";
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    VerificationNotificationResponse,
    VerifyEmailResponse,
} from "./types";

// Helper function to get CSRF cookie
async function getCsrfCookie(): Promise<void> {
    await sanctumClient.get("/sanctum/csrf-cookie");
}

export const authService = {
    async login(payload: LoginRequest): Promise<LoginResponse> {
        // Get CSRF cookie first
        await getCsrfCookie();

        const { data } = await apiClient.post<LoginResponse>("/login", payload);
        if (data?.token) setToken(data.token);
        return data;
    },

    async isAuthenticated(): Promise<boolean> {
        if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
            const token = localStorage.getItem("token");
            return !!token;
        }
        return false;
    },

    async logout(): Promise<{ message: "Logged out successfully" }> {
        const { data } = await apiClient.post<{ message: "Logged out successfully" }>("/logout");
        clearToken();
        return data;
    },

    async register(payload: RegisterRequest): Promise<RegisterResponse> {
        // Get CSRF cookie first
        await getCsrfCookie();

        const { data } = await apiClient.post<RegisterResponse>("/register", payload);
        if (data?.token) setToken(data.token);
        return data;
    },

    async sendVerificationEmail(): Promise<VerificationNotificationResponse> {
        const { data } = await apiClient.post<VerificationNotificationResponse>("/email/verification-notification");
        return data;
    },

    async verifyEmail(params: { id: string; hash: string }): Promise<VerifyEmailResponse> {
        const { data } = await apiClient.get<VerifyEmailResponse>(`/verify-email/${params.id}/${params.hash}`);
        return data;
    },

    async forgotPassword(payload: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
        // Get CSRF cookie first
        await getCsrfCookie();

        const { data } = await apiClient.post<ForgotPasswordResponse>("/forgot-password", payload);
        return data;
    },

    async resetPassword(payload: ResetPasswordRequest): Promise<ResetPasswordResponse> {
        // Get CSRF cookie first
        await getCsrfCookie();

        const { data } = await apiClient.post<ResetPasswordResponse>("/reset-password", payload);
        return data;
    },
};