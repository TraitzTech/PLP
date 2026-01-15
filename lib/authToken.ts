let memoryToken: string | null = null;

export function setToken(token: string) {
  if (typeof window !== "undefined" && window?.localStorage) {
    window.localStorage.setItem("token", token);
    console.log("✓ Token saved to localStorage");
  } else {
    memoryToken = token;
    console.log("✓ Token saved to memory (SSR mode)");
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined" && window?.localStorage) {
    const token = window.localStorage.getItem("token");
    console.log("Token from localStorage:", token ? "Present" : "Missing");
    return token;
  }
  console.log("Token from memory:", memoryToken ? "Present" : "Missing");
  return memoryToken;
}

export function clearToken() {
  if (typeof window !== "undefined" && window?.localStorage) {
    window.localStorage.removeItem("token");
    console.log("✓ Token removed from localStorage");
  }
  memoryToken = null;
}

/**
 * Generate a temporary token for testing
 * Use this if backend is not returning tokens
 */
export function setTemporaryToken(userEmail: string) {
  const tempToken = `temp_${userEmail}_${Date.now()}`;
  setToken(tempToken);
  console.log("⚠️ Temporary token set for testing:", tempToken);
  return tempToken;
}

