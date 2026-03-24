import apiClient from "@/lib/apiClient";
import type {
  AgentRegistrationRequest,
  AgentRegistrationResponse,
  AgentCreateRequest,
  AgentCreateResponse,
  AgentListResponse,
  PendingAgentListResponse,
  AgentShowResponse,
  PendingAgentShowResponse,
  AgentUpdateRequest,
  AgentUpdateResponse,
  AgentDeleteResponse,
  AgentStatusUpdateResponse,
  Agent,
} from "./types";

const BASE_URL = "/manage-agents";
const PENDING_URL = "/pending-agents";
const REGISTER_URL = "/agents/register";

/**
 * Convert request object to FormData for multipart/form-data
 */
function createFormData(data: Record<string, any>): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === "boolean") {
        formData.append(key, value ? "1" : "0");
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, item);
        });
      } else {
        formData.append(key, String(value));
      }
    }
  });

  return formData;
}

export const agentService = {
  /**
   * Register as an agent (public endpoint)
   */
  async registerAgent(
    data: AgentRegistrationRequest
  ): Promise<AgentRegistrationResponse> {
    try {
      const formData = createFormData({
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        phone: data.phone,
        gender: data.gender,
        user_type: "agent",
        bio: data.bio || null,
        id_card_num: data.id_card_num,
        country: data.country,
        region: data.region,
        city: data.city,
        address: data.address,
        profile_photo: data.profile_photo || null,
        id_image_front: data.id_image_front,
        id_image_back: data.id_image_back,
      });

      const response = await apiClient.post<AgentRegistrationResponse>(
        REGISTER_URL,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to register agent:", error);
      throw error;
    }
  },

  /**
   * Get all agents (admin)
   * Returns array of agents directly
   */
  async getAllAgents(params?: {
    per_page?: number;
    page?: number;
    search?: string;
  }): Promise<Agent[]> {
    try {
      const response = await apiClient.get<AgentListResponse>(BASE_URL, {
        params,
      });
      
      // Handle the response structure: { status: "success", data: Agent[] }
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      // If data is directly an array
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Fallback
      return [];
    } catch (error) {
      console.error("Failed to fetch agents:", error);
      throw error;
    }
  },

  /**
   * Get pending agents only (admin)
   */
  async getPendingAgents(): Promise<Agent[]> {
    try {
      const response = await apiClient.get<PendingAgentListResponse>(
        PENDING_URL
      );
      
      // Handle response structure
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error("Failed to fetch pending agents:", error);
      throw error;
    }
  },

  /**
   * Get a specific agent
   */
  async getAgent(id: string | number): Promise<Agent> {
    try {
      const response = await apiClient.get<AgentShowResponse>(
        `${BASE_URL}/${id}`
      );
      
      // Handle response structure
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      return response.data as Agent;
    } catch (error) {
      console.error(`Failed to fetch agent ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get a specific pending agent
   */
  async getPendingAgent(id: string | number): Promise<Agent> {
    try {
      const response = await apiClient.get<PendingAgentShowResponse>(
        `${PENDING_URL}/${id}`
      );
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      return response.data as Agent;
    } catch (error) {
      console.error(`Failed to fetch pending agent ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create an agent (admin)
   */
  async createAgent(
    data: AgentCreateRequest
  ): Promise<AgentCreateResponse> {
    try {
      const formData = createFormData({
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        phone: data.phone,
        gender: data.gender,
        user_type: "agent",
        bio: data.bio || null,
        id_card_num: data.id_card_num,
        country: data.country,
        region: data.region,
        city: data.city,
        address: data.address,
        profile_photo: data.profile_photo || null,
        id_image_front: data.id_image_front,
        id_image_back: data.id_image_back,
        status: data.status || "pending",
      });

      const response = await apiClient.post<AgentCreateResponse>(
        BASE_URL,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to create agent:", error);
      throw error;
    }
  },

  /**
   * Update an agent (admin)
   */
  async updateAgent(
    id: string | number,
    data: AgentUpdateRequest
  ): Promise<AgentUpdateResponse> {
    try {
      const formData = createFormData(data);
      // Method override is more reliable than multipart PUT on some production proxies.
      formData.append("_method", "PUT");

      const response = await apiClient.post<AgentUpdateResponse>(
        `${BASE_URL}/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update agent ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete an agent (admin)
   */
  async deleteAgent(id: string | number): Promise<AgentDeleteResponse> {
    try {
      const response = await apiClient.delete<AgentDeleteResponse>(
        `${BASE_URL}/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to delete agent ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update agent status (admin)
   */
  async updateAgentStatus(
    id: string | number,
    status: "pending" | "approved" | "rejected",
    reason?: string
  ): Promise<AgentStatusUpdateResponse> {
    try {
      const response = await apiClient.patch<AgentStatusUpdateResponse>(
        `${BASE_URL}/${id}/status`,
        { status, reason }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update agent status for ${id}:`, error);
      throw error;
    }
  },
};
