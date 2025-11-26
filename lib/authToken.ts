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
    return window.localStorage.getItem("token");
  }
  return memoryToken;
}

export function clearToken() {
  if (typeof window !== "undefined" && window?.localStorage) {
    window.localStorage.removeItem("token");
  }
  memoryToken = null;
}
