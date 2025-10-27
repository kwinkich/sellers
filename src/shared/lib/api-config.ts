/**
 * Centralized API configuration utility
 * Provides consistent API URL generation across the application
 */

interface ApiConfig {
  baseUrl: string;
  apiPrefix: string;
  fullApiUrl: string;
  timeout: number;
  retry: {
    limit: number;
    methods: string[];
    statusCodes: number[];
    backoffLimit: number;
  };
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
 * Get timeout from environment variables with fallback
 */
function getTimeout(): number {
  const timeout = import.meta.env.VITE_API_TIMEOUT;
  return timeout ? parseInt(timeout, 10) : 30000; // 30 seconds default
}

/**
 * Get retry configuration from environment variables with fallback
 */
function getRetryConfig() {
  const retryLimit = import.meta.env.VITE_API_RETRY_LIMIT;
  const retryBackoffLimit = import.meta.env.VITE_API_RETRY_BACKOFF_LIMIT;

  return {
    limit: retryLimit ? parseInt(retryLimit, 10) : 3,
    methods: ["get", "put", "head", "delete", "options", "trace"],
    statusCodes: [408, 413, 429, 500, 502, 503, 504, 521, 522, 524],
    backoffLimit: retryBackoffLimit ? parseInt(retryBackoffLimit, 10) : 10000, // 10 seconds max
  };
}

/**
 * Get complete API configuration
 */
function getApiConfig(): ApiConfig {
  return {
    baseUrl: getBaseUrl(),
    apiPrefix: getApiPrefix(),
    fullApiUrl: getFullApiUrl(),
    timeout: getTimeout(),
    retry: getRetryConfig(),
  };
}

export {
  getBaseUrl,
  getApiPrefix,
  getFullApiUrl,
  getApiOrigin,
  getApiPrefixForPath,
  getApiConfig,
  getTimeout,
  getRetryConfig,
  type ApiConfig,
};
