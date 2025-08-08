export interface Pagination {
  page: number;
  limit: number;
}

export interface FetchOptions {
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  mode?: RequestMode;
  cache?: RequestCache;
  params?: Record<string, string | number | boolean>;
  // [key: string]: unknown;
}
