export interface AuthResult {
  user: any;
  authType: "email" | null;
}

/**
 * Check authentication status using email JWT token.
 */
export async function checkAuthStatus(): Promise<AuthResult> {
  const emailToken = localStorage.getItem("auth_token");
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
      localStorage.removeItem("auth_token");
    } catch {
      // Token check failed
    }
  }

  return { user: null, authType: null };
}

/**
 * Perform logout by clearing the JWT token.
 */
export async function performLogout() {
  localStorage.removeItem("auth_token");
}
