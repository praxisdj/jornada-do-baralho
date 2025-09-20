import {
  MAX_LIMIT_LENGTH_USERNAME,
  RESERVED_USERNAMES,
} from "@/lib/utils/constants";

export function sanitizeUsername(email: string): string {
  const emailPrefix = email.split("@")[0].toLowerCase().trim();

  // Remove invalid characters (anything except a-z, 0-9, . or _)
  let sanitizedUsername = emailPrefix.replace(/[^a-z0-9._]/g, "");

  // Remove . and _ repeated
  sanitizedUsername = sanitizedUsername
    .replace(/[._]{2,}/g, "_") // Replace __ or .. with _
    .replace(/^[_\.]+/, "") // Remove _ or . at the beginning
    .replace(/[_\.]+$/, ""); // Remove _ or . at the end

  // username limit length is 25 to look good in the frontend
  sanitizedUsername = sanitizedUsername.slice(0, MAX_LIMIT_LENGTH_USERNAME);

  // if username is empty or reserved, generate a random one
  if (!sanitizedUsername || RESERVED_USERNAMES.includes(sanitizedUsername)) {
    const fallbackUsername = `user_${Math.floor(Math.random() * 100000)}`;
    return fallbackUsername;
  }

  return sanitizedUsername;
}
