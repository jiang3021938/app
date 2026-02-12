import { createClient } from "@metagptx/web-sdk";

const client = createClient();

export interface AuthResult {
  user: any;
  authType: "email" | "atoms" | null;
}

/**
 * Check authentication status by trying email JWT first, then Atoms Cloud.
 * This ensures users logged in via either method are recognized across all pages.
 */
export async function checkAuthStatus(): Promise<AuthResult> {
  // First check for email JWT token
  const emailToken = localStorage.getItem("token");
  if (emailToken) {
    try {
      const response = await fetch("/api/v1/email-auth/me", {
        headers: { Authorization: `Bearer ${emailToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          return { user: data.user, authType: "email" };
        }
      }
      // Token invalid, remove it
      localStorage.removeItem("token");
    } catch {
      // Token check failed, continue to Atoms Cloud
    }
  }

  // Then check Atoms Cloud auth
  try {
    const response = await client.auth.me();
    if (response.data) {
      return { user: response.data, authType: "atoms" };
    }
  } catch {
    // Atoms Cloud auth failed
  }

  return { user: null, authType: null };
}

/**
 * Perform logout for the given auth type, cleaning up both auth methods.
 */
export async function performLogout(authType: "email" | "atoms" | null) {
  // Always clear email JWT if present
  localStorage.removeItem("token");

  // If atoms auth, also logout from atoms
  if (authType === "atoms") {
    try {
      await client.auth.logout();
    } catch {
      // Ignore logout errors
    }
  }
}
