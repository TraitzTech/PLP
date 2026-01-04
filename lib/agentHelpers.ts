import apiClient from "@/lib/apiClient";
import { User } from "@/services/types";

/**
 * Get current user information from the API
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await apiClient.get<{ data: User }>("/user");
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    return null;
  }
}

/**
 * Check if the current user is an agent and if their account is approved
 */
export async function isAgentApproved(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user || user.user_type !== "agent") {
      return false;
    }

    // Fetch agent details
    const agentResponse = await apiClient.get(`/manage-agents/user/${user.id}`);
    const agent = agentResponse.data?.data;
    
    return agent?.status === "approved";
  } catch (error) {
    console.error("Failed to check agent approval status:", error);
    return false;
  }
}

/**
 * Get the current agent's approval status
 */
export async function getAgentStatus() {
  try {
    const user = await getCurrentUser();
    if (!user || user.user_type !== "agent") {
      return null;
    }

    const agentResponse = await apiClient.get(`/manage-agents/user/${user.id}`);
    return agentResponse.data?.data?.status || null;
  } catch (error) {
    console.error("Failed to get agent status:", error);
    return null;
  }
}
