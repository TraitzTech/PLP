import apiClient from "@/lib/apiClient";
import { getToken } from "@/lib/authToken";

/**
 * Debug authentication setup
 * Call this in your component to check if auth is properly configured
 */
export async function debugAuth() {
  console.log("\n=== AUTHENTICATION DEBUG ===\n");

  // 1. Check if token exists in storage
  const token = getToken();
  console.log("✓ Token in storage:", token ? `Present (${token.length} chars)` : "MISSING");

  if (!token) {
    console.log("❌ ERROR: No token found. User must login first.");
    return;
  }

  // 2. Check token format
  const isValidFormat = token.startsWith("eyJ");
  console.log("✓ Token format valid:", isValidFormat ? "Yes (JWT)" : "No");

  // 3. Try to verify token with backend
  try {
    console.log("\nAttempting to fetch /api/user...");
    const response = await apiClient.get("/user");
    console.log("✓ Authentication successful!");
    console.log("  User:", response.data?.data || response.data);
    return response.data;
  } catch (error: any) {
    console.log("❌ Authentication failed!");
    console.log("  Error:", error?.message);
    console.log("  Status:", error?.status);
    console.log("  Response:", error?.data);
    return null;
  }
}

/**
 * Check if token is being sent in requests
 * Call this then open Network tab in DevTools
 */
export async function checkRequestHeaders() {
  console.log("\n=== CHECKING REQUEST HEADERS ===\n");
  
  const token = getToken();
  
  try {
    // This request should include the token
    const response = await apiClient.get("/listings");
    console.log("✓ Request succeeded");
    return response.data;
  } catch (error) {
    console.log("❌ Request failed - check Network tab for Authorization header");
    throw error;
  }
}

/**
 * Verify agent data is accessible
 */
export async function verifyAgentAccess() {
  console.log("\n=== VERIFYING AGENT ACCESS ===\n");

  try {
    // First get user
    const userRes = await apiClient.get("/user");
    const user = userRes.data?.data || userRes.data;
    
    console.log("✓ Current user:", user?.email);
    console.log("  User type:", user?.user_type);
    
    if (user?.user_type !== "agent") {
      console.log("❌ User is not an agent!");
      return false;
    }

    // Then try to get their listings
    const listingsRes = await apiClient.get("/listings");
    const listings = listingsRes.data?.data || listingsRes.data;
    
    console.log("✓ Agent listings loaded:", Array.isArray(listings) ? listings.length + " items" : "Error");
    return true;
  } catch (error: any) {
    console.log("❌ Failed to verify agent access");
    console.log("  Error:", error?.message);
    return false;
  }
}

/**
 * Manual token injection (for testing)
 * Use this if token storage isn't working
 */
export async function testWithManualToken(token: string) {
  console.log("\n=== TESTING WITH MANUAL TOKEN ===\n");

  try {
    const response = await apiClient.get("/listings", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log("✓ Manual token test successful");
    return response.data;
  } catch (error: any) {
    console.log("❌ Manual token test failed");
    console.log("  Error:", error?.message);
    throw error;
  }
}

/**
 * Log authentication status
 */
export function logAuthStatus() {
  const token = getToken();
  console.log({
    authenticated: !!token,
    tokenLength: token?.length || 0,
    tokenFormat: token?.substring(0, 20) + "...",
    timestamp: new Date().toISOString(),
  });
}
