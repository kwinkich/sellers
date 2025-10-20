/**
 * JWT utility functions for token validation
 */

/**
 * Extract expiration time from JWT token in milliseconds
 * @param token JWT token string
 * @returns Expiration time in milliseconds, or 0 if invalid/expired
 */
export function getJwtExpMs(token?: string | null): number {
  if (!token) return 0;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 || 0;
  } catch {
    return 0;
  }
}

/**
 * Check if a JWT token is valid (not expired)
 * @param token JWT token string
 * @param skewMs Time skew in milliseconds to account for clock differences (default: 30 seconds)
 * @returns true if token is valid and not expired
 */
export function isJwtValid(
  token?: string | null,
  skewMs: number = 30_000
): boolean {
  if (!token) return false;

  const expMs = getJwtExpMs(token);
  if (expMs === 0) return false;

  return Date.now() < expMs - skewMs;
}
