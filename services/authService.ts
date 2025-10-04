import apiClient from "@/lib/apiClient";

export const authService = {
    login: async (email: string, password: string) => {
        const { data } = await apiClient.post("/login", { email, password });
        return data;
    },

    register: async (userData: { name: string; email: string; password: string }) => {
        const { data } = await apiClient.post("/register", userData);
        return data;
    },

    getProfile: async () => {
        const { data } = await apiClient.get("/profile");
        return data;
    },
};
