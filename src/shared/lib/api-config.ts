/**
 * Centralized API configuration utility
 * Provides consistent API URL generation across the application
 */

interface ApiConfig {
  baseUrl: string;
  apiPrefix: string;
  fullApiUrl: string;
}

/**
 * Get the base URL from environment variables with fallback
 */
function getBaseUrl(): string {
  return import.meta.env.VITE_BASE_URL || "http://localhost:3000";
}

/**
 * Get the API prefix from environment variables with fallback
 */
function getApiPrefix(): string {
  return import.meta.env.VITE_API_PREFIX || "/api/v1";
}

/**
 * Get the full API URL by combining base URL and API prefix
 */
function getFullApiUrl(): string {
  const baseUrl = getBaseUrl();
  const apiPrefix = getApiPrefix();

  // Ensure baseUrl doesn't end with slash and apiPrefix starts with slash
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");
  const cleanApiPrefix = apiPrefix.startsWith("/")
    ? apiPrefix
    : `/${apiPrefix}`;

  return `${cleanBaseUrl}${cleanApiPrefix}`;
}

/**
 * Get the API origin (protocol + host) for SSE connections
 */
function getApiOrigin(): string {
  const fullApiUrl = getFullApiUrl();

  try {
    return new URL(fullApiUrl).origin;
  } catch {
    // Fallback to current window origin if URL parsing fails
    return window.location.origin;
  }
}

/**
 * Get the API prefix for path manipulation
 */
function getApiPrefixForPath(): string {
  return getApiPrefix();
}

/**
 * Get complete API configuration
 */
function getApiConfig(): ApiConfig {
  return {
    baseUrl: getBaseUrl(),
    apiPrefix: getApiPrefix(),
    fullApiUrl: getFullApiUrl(),
  };
}

export {
  getBaseUrl,
  getApiPrefix,
  getFullApiUrl,
  getApiOrigin,
  getApiPrefixForPath,
  getApiConfig,
  type ApiConfig,
};
