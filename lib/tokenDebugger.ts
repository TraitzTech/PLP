/**
 * Interactive Token Debugger
 * Use this to diagnose auth token issues
 */

export function inspectLoginResponse() {
  console.log("\n=== LOGIN RESPONSE INSPECTOR ===\n");
  
  // Check what's in localStorage after login
  console.log("Local Storage Contents:");
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    
    if (key === 'token') {
      console.log(`✓ ${key}:`, value?.substring(0, 40) + "...");
    } else if (key?.includes('user')) {
      console.log(`✓ ${key}: [user object]`);
    } else {
      console.log(`  ${key}:`, value?.substring(0, 40) + "...");
    }
  }
  
  const hasToken = !!localStorage.getItem('token');
  console.log("\n✓ Token stored:", hasToken ? "YES ✅" : "NO ❌");
  
  if (!hasToken) {
    console.log("\n⚠️ PROBLEM: Token was not stored!");
    console.log("This means the backend did not return it in login response.");
    console.log("\nPossible causes:");
    console.log("1. Backend not calling createToken()");
    console.log("2. Backend not including 'token' in response");
    console.log("3. Response structure different than expected");
  }
}

export function testTokenUsage() {
  console.log("\n=== TESTING TOKEN USAGE ===\n");
  
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log("❌ No token found. Cannot test.");
    return false;
  }
  
  console.log("✓ Token found:", token.substring(0, 30) + "...");
  
  // Simulate request with token
  console.log("\nSimulating request with token...");
  console.log("Authorization header would be:", `Bearer ${token.substring(0, 30)}...`);
  
  return true;
}

export async function manuallySetToken(customToken: string) {
  console.log("⚠️ Setting custom token for testing...");
  localStorage.setItem('token', customToken);
  console.log("✓ Custom token set:", customToken.substring(0, 30) + "...");
  console.log("Now try to load agent dashboard to test if auth works");
}

export function compareResponses() {
  console.log("\n=== EXPECTED VS ACTUAL ===\n");
  
  console.log("EXPECTED backend login response:");
  console.log({
    status: "success",
    token: "1|XXXXXXXXXXXXXX...",
    user: {
      id: "019b99e1-530e-73b2-bb54-a56434be99c3",
      name: "Admin User",
      email: "admin@gmail.com",
      user_type: "admin"
    }
  });
  
  console.log("\nACTUAL response received (add console logs in authService.ts)");
  console.log("Open browser console during login to see actual response");
}

/**
 * Extract auth state for debugging
 */
export function getAuthState() {
  return {
    tokenPresent: !!localStorage.getItem('token'),
    tokenLength: localStorage.getItem('token')?.length || 0,
    userPresent: !!localStorage.getItem('user'),
    userEmail: JSON.parse(localStorage.getItem('user') || '{}')?.email,
    timestamp: new Date().toISOString(),
    allKeys: Object.keys(localStorage)
  };
}

export function printAuthState() {
  const state = getAuthState();
  console.table(state);
}
