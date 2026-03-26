import { createHmac } from "crypto";

/**
 * Base44 Session Bridge
 *
 * Creates/logs in a Base44 user account that mirrors the Clerk identity.
 * Uses HMAC-SHA256 to generate a deterministic password from the Clerk
 * user ID — the user never sees or needs this password.
 */

const BRIDGE_SECRET = process.env.BRIDGE_SECRET!;
const BASE44_APP_ID = process.env.BASE44_APP_ID!;
const BASE44_APP_URL = process.env.NEXT_PUBLIC_BASE44_APP_URL!;

/**
 * Generate a deterministic password for a Clerk user.
 * Same Clerk user ID always produces the same password.
 */
export function generateBridgePassword(clerkUserId: string): string {
  return createHmac("sha256", BRIDGE_SECRET)
    .update(clerkUserId)
    .digest("hex");
}

/**
 * Bridge a Clerk user into Base44.
 *
 * Strategy:
 * 1. Try to login with email + deterministic password
 * 2. If login fails (user doesn't exist), register first, then login
 * 3. Return the Base44 access token
 *
 * NOTE: Base44 SDK behavior may vary. This implementation uses the
 * REST API approach as a fallback since the SDK's auth module may not
 * support programmatic login (base44.auth.redirectToLogin is the
 * standard approach). We use direct API calls instead.
 */
export async function bridgeToBase44(
  email: string,
  clerkUserId: string,
  firstName?: string,
  lastName?: string
): Promise<{ token: string; isNewAccount: boolean }> {
  const password = generateBridgePassword(clerkUserId);

  // First, try to login (existing user)
  try {
    const loginResult = await base44Login(email, password);
    return { token: loginResult.token, isNewAccount: false };
  } catch {
    // User doesn't exist in Base44 — register them
  }

  // Register new user in Base44
  try {
    const registerResult = await base44Register(email, password, firstName, lastName);
    return { token: registerResult.token, isNewAccount: true };
  } catch (registerError) {
    // If registration also fails, the user might already exist with a
    // different password (e.g., they signed up directly on Base44 before).
    // Try one more login attempt as a safety net.
    try {
      const retryLogin = await base44Login(email, password);
      return { token: retryLogin.token, isNewAccount: false };
    } catch {
      throw new Error(
        `Bridge failed for ${email}: Could not login or register. ` +
        `Register error: ${registerError instanceof Error ? registerError.message : "unknown"}`
      );
    }
  }
}

/**
 * Base44 login via REST API
 *
 * IMPORTANT: Base44's exact API endpoints may vary by app configuration.
 * The @base44/sdk primarily uses redirectToLogin() for browser-based auth.
 * This server-side approach calls the underlying REST endpoints directly.
 *
 * If these endpoints don't work, the fallback is URL-parameter passing:
 * redirect user to Base44 app with a signed token in the URL.
 */
async function base44Login(
  email: string,
  password: string
): Promise<{ token: string }> {
  const response = await fetch(
    `https://app.base44.com/api/apps/${BASE44_APP_ID}/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Base44 login failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return { token: data.access_token || data.token };
}

async function base44Register(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
): Promise<{ token: string }> {
  const response = await fetch(
    `https://app.base44.com/api/apps/${BASE44_APP_ID}/auth/register`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        first_name: firstName || "",
        last_name: lastName || "",
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Base44 register failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return { token: data.access_token || data.token };
}

/**
 * Get the Base44 app URL for redirect after successful bridge.
 */
export function getBase44RedirectUrl(token?: string): string {
  // If cookie sharing works (.ai-rise.co.il domain), just redirect
  if (!token) return BASE44_APP_URL;

  // Fallback: pass token as URL parameter
  const separator = BASE44_APP_URL.includes("?") ? "&" : "?";
  return `${BASE44_APP_URL}${separator}auth_token=${token}`;
}
