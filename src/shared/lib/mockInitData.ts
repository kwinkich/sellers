/**
 * Utility to generate mock Telegram initData for testing user switching
 * Based on the Node.js script provided
 */

interface MockInitDataParams {
  botToken: string;
  tgId: number;
  username: string;
  firstName?: string;
  lastName?: string;
  authDateSec?: number;
}

/**
 * Generates a mock initData string for testing purposes
 * This mimics the Telegram WebApp initData format with proper HMAC-SHA256
 */
export async function generateMockInitData({
  botToken,
  tgId,
  username,
  firstName = "Test",
  lastName = "User",
  authDateSec = Math.floor(Date.now() / 1000),
}: MockInitDataParams): Promise<string> {
  const params = new URLSearchParams();
  const userObj = {
    id: Number(tgId),
    username: username,
    first_name: firstName,
    last_name: lastName,
  };

  params.set("user", JSON.stringify(userObj));
  params.set("auth_date", String(authDateSec));

  const pairs = [];
  for (const [k, v] of params) {
    if (k !== "hash") {
      pairs.push(`${k}=${v}`);
    }
  }
  pairs.sort();
  const dataCheckString = pairs.join("\n");

  // Generate proper HMAC-SHA256 hash
  const hash = await generateHMACHash(botToken, dataCheckString);
  params.set("hash", hash);

  return params.toString();
}

/**
 * Synchronous version that uses a fallback for environments without Web Crypto API
 * This is a simplified implementation that should work in most cases
 */
export function generateMockInitDataSync({
  botToken,
  tgId,
  username,
  firstName = "Test",
  lastName = "User",
  authDateSec = Math.floor(Date.now() / 1000),
}: MockInitDataParams): string {
  const params = new URLSearchParams();
  const userObj = {
    id: Number(tgId),
    username: username,
    first_name: firstName,
    last_name: lastName,
  };

  params.set("user", JSON.stringify(userObj));
  params.set("auth_date", String(authDateSec));

  const pairs = [];
  for (const [k, v] of params) {
    if (k !== "hash") {
      pairs.push(`${k}=${v}`);
    }
  }
  pairs.sort();
  const dataCheckString = pairs.join("\n");

  // For now, we'll generate a simple hash - in production you might want to use a proper HMAC implementation
  const hash = generateSimpleHash(botToken, dataCheckString);
  params.set("hash", hash);

  return params.toString();
}

/**
 * Generate proper HMAC-SHA256 hash using Web Crypto API
 * This matches the Node.js crypto implementation from your script
 */
async function generateHMACHash(
  botToken: string,
  dataCheckString: string
): Promise<string> {
  try {
    // Step 1: Create secret key from 'WebAppData' + botToken
    const encoder = new TextEncoder();
    const webAppDataKey = encoder.encode("WebAppData");
    const botTokenData = encoder.encode(botToken);

    // Import the 'WebAppData' key for HMAC
    const key = await crypto.subtle.importKey(
      "raw",
      webAppDataKey,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    // Sign the bot token with 'WebAppData' key to get the secret
    const secretBuffer = await crypto.subtle.sign("HMAC", key, botTokenData);

    // Step 2: Use the secret to sign the dataCheckString
    const secretKey = await crypto.subtle.importKey(
      "raw",
      secretBuffer,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const dataBuffer = encoder.encode(dataCheckString);
    const signature = await crypto.subtle.sign("HMAC", secretKey, dataBuffer);

    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(signature));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch (error) {
    console.error("Error generating HMAC hash:", error);
    // Fallback to simple hash if Web Crypto API fails
    return generateSimpleHash(botToken, dataCheckString);
  }
}

/**
 * Simple hash function for fallback
 * Note: This is not cryptographically secure, only for development/testing
 * For production use, implement proper HMAC-SHA256
 */
function generateSimpleHash(botToken: string, data: string): string {
  let hash = 0;
  const str = botToken + data;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}
