export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "CryptoTrader Pro";

export const APP_LOGO =
  import.meta.env.VITE_APP_LOGO ||
  "https://placehold.co/128x128/E1E7EF/1F2937?text=CryptoTrader";

/**
 * Get local login page URL
 * Using Supabase Auth instead of external OAuth
 * Updated: 2025-11-17
 */
export const getLoginUrl = (): string => {
  return "/login";
};

// Verify this file is loaded
console.log("[const.ts] Loaded - version 2025-11-17");