// A few includes() checks cover the vast majority of real browser UAs — not worth a heavy UA
// parsing library for a settings screen. Falls back to the raw string for anything unrecognized
// (this dev account's own session list includes plenty of curl/PostmanRuntime test entries).
export function parseUserAgent(ua: string): string {
  const os = ua.includes("Windows") ? "Windows" : ua.includes("Mac OS") ? "macOS" : ua.includes("Android") ? "Android" : ua.includes("iPhone") || ua.includes("iPad") ? "iOS" : ua.includes("Linux") ? "Linux" : null;

  const browser = ua.includes("Edg/") ? "Edge" : ua.includes("Chrome/") ? "Chrome" : ua.includes("Firefox/") ? "Firefox" : ua.includes("Safari/") && !ua.includes("Chrome") ? "Safari" : null;

  if (browser && os) return `${browser} on ${os}`;
  if (browser) return browser;
  if (ua.startsWith("curl/")) return "API client (curl)";
  if (ua.startsWith("PostmanRuntime/")) return "API client (Postman)";
  return ua;
}

export function isMobileUserAgent(ua: string): boolean {
  return /iPhone|iPad|Android/.test(ua);
}
