export const API_URL =
  (typeof window !== "undefined"
    ? (window as any).__NEXT_PUBLIC_API_URL
    : undefined) ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:1337";

export const STRAPI_URL = API_URL;

export function getAuthHeaders(): HeadersInit {
  if (typeof window !== "undefined") {
    const jwt = localStorage.getItem("jwt");
    return jwt ? { Authorization: `Bearer ${jwt}` } : {};
  }
  return {};
}
