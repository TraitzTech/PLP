import apiClient from "@/lib/apiClient";

export const propertyService = {
    getAll: async () => {
        const { data } = await apiClient.get("/properties");
        return data;
    },

    getById: async (id: string | number) => {
        const { data } = await apiClient.get(`/properties/${id}`);
        return data;
    },

    create: async (propertyData: any) => {
        const { data } = await apiClient.post("/properties", propertyData);
        return data;
    },

    update: async (id: string | number, propertyData: any) => {
        const { data } = await apiClient.put(`/properties/${id}`, propertyData);
        return data;
    },

    delete: async (id: string | number) => {
        const { data } = await apiClient.delete(`/properties/${id}`);
        return data;
    },
};
