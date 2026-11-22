export function getApiBaseUrl(): string {
  // If an external backend is explicitly defined in environment, use it
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  // Otherwise use Next.js built-in API routes (works seamlessly on Vercel)
  return "/api";
}
