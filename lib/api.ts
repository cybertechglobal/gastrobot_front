export function getBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_EXTERNAL_BACKEND_URL;
  if (!baseUrl) {
    throw new Error('EXTERNAL_BACKEND_URL environment variable is not set');
  }
  return baseUrl;
}
