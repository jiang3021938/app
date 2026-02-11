// API configuration for runtime
// In production (App Viewer), we need to use relative URLs
// The nginx proxy will handle routing to the backend

export const API_BASE_URL = '';  // Empty string means relative URL, which works with nginx proxy

export function getApiUrl(path: string): string {
  // Always use relative URLs - nginx handles the proxy
  return path.startsWith('/') ? path : `/${path}`;
}
