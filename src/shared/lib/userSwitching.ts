/**
 * Utilities for user switching functionality
 */

/**
 * Get the list of allowed usernames for user switching from environment variables
 */
export function getAllowedUsernames(): string[] {
  const allowedUsernames = import.meta.env.VITE_ALLOWED_USER_SWITCHING_USERS;
  if (!allowedUsernames) {
    return [];
  }

  // Split by comma and trim whitespace
  return allowedUsernames
    .split(",")
    .map((username: string) => username.trim())
    .filter(Boolean);
}

/**
 * Get the bot token from environment variables
 */
export function getBotToken(): string {
  return import.meta.env.VITE_TELEGRAM_BOT_TOKEN || "";
}

/**
 * Check if the current user is allowed to switch accounts
 */
export function canUserSwitchAccounts(currentUsername: string): boolean {
  const allowedUsernames = getAllowedUsernames();
  return allowedUsernames.includes(currentUsername);
}

/**
 * Check if user switching is enabled (has required environment variables)
 */
export function isUserSwitchingEnabled(): boolean {
  const allowedUsernames = getAllowedUsernames();
  const botToken = getBotToken();
  return allowedUsernames.length > 0 && !!botToken;
}
