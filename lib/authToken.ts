let memoryToken: string | null = null;

export function setToken(token: string) {
  if (typeof window !== "undefined" && window?.localStorage) {
    window.localStorage.setItem("token", token);
  } else {
    memoryToken = token;
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined" && window?.localStorage) {
    const token = window.localStorage.getItem("token");
    return token;
  }
  return memoryToken;
}

export function clearToken() {
  if (typeof window !== "undefined" && window?.localStorage) {
    window.localStorage.removeItem("token");
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
  return tempToken;
}

