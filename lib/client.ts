import { FetchOptions } from '@/types/global';
import { ApiError } from './error';
import { getBaseUrl } from './api';
import { signoutWithCleanup } from './utils/cleanupUtils';
export class SessionExpiredError extends Error {
  constructor(message: string = 'Session expired') {
    super(message);
    this.name = 'SessionExpiredError';
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  data?: any,
  options: FetchOptions & { isProtected?: boolean } = {}
): Promise<T> {
  // Determine base URL (public routes use backend, protected routes use Next.js app)
  let baseUrl: string;
  if (options.isProtected) {
    // For protected routes, use the Next.js app's base URL
    if (typeof window !== 'undefined') {
      // Client-side: Use the browser's origin
      baseUrl = window.location.origin;
    } else {
      // Server-side: Use NEXT_PUBLIC_APP_URL or default to localhost
      baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '');

      if (!baseUrl) {
        throw new Error(
          'NEXT_PUBLIC_APP_URL environment variable is not set for server-side requests'
        );
      }
    }
    baseUrl = `${baseUrl}/api/proxy`;
  } else {
    // For public routes, use the backend URL
    baseUrl = getBaseUrl();
  }

  const params = options.params ?? {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const filteredEntries = Object.entries(params).filter(([_, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== '';
  });

  const queryParams = new URLSearchParams();

  for (const [key, value] of filteredEntries) {
    if (Array.isArray(value)) {
      for (const v of value) {
        queryParams.append(key, String(v));
      }
    } else {
      queryParams.append(key, String(value));
    }
  }

  const queryString = queryParams.toString() ? `?${queryParams}` : '';
  const url = `${baseUrl}/${endpoint}${queryString}`;

  // console.log('UUURRRLLL', url);

  // Handle cookies differently for server vs client
  let cookieHeader = '';
  if (options.isProtected && typeof window === 'undefined') {
    // Server-side: dynamically import cookies
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    cookieHeader = cookieStore.toString();
  }

  // Prepare headers
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...options.headers,
  };

  // Add cookies for server-side protected requests
  if (cookieHeader) {
    headers['Cookie'] = cookieHeader;
  }

  const isFormData = data instanceof FormData;
  if (isFormData) {
    delete headers['content-type']; // Let browser set it with boundary
  }

  // Add timeout with AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
      credentials: options.isProtected ? 'include' : 'omit',
      cache: options.cache ?? 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      // console.log(options.isProtected);
      // console.log('STATUUUS', res.status);

      // Check if the proxy tells us to logout (refresh failed) - CLONE FIRST
      if (res.status === 401 && options.isProtected) {
        try {
          // Clone the response BEFORE consuming it
          const clonedRes = res.clone();
          const errorBody = await clonedRes.json();

          console.log(errorBody);

          if (errorBody.shouldLogout) {
            console.log('Token refresh failed, signing out user...');
            if (typeof window !== 'undefined') {
              // Client-side: Sign out and redirect
              try {
                // await signOut({
                //   redirect: true,
                //   callbackUrl: '/login?error=SessionExpired',
                // });

                await signoutWithCleanup({
                  redirect: true,
                  callbackUrl: '/login?error=SessionExpired',
                });
              } catch (error) {
                console.error('Error during signOut:', error);
                window.location.href = '/login?error=SessionExpired';
              }

              throw new SessionExpiredError(
                'Authentication failed - redirecting to login'
              );
            } else {
              throw new SessionExpiredError('SERVER_SIDE_SESSION_EXPIRED');
            }
          }
        } catch (e) {
          if (e instanceof SessionExpiredError) {
            throw e;
          }
          // If we can't parse the error body, just proceed with normal error handling
        }
      }

      // Now create the error from the original response
      const error = await ApiError.fromResponse(res);

      // if (error.status === 404) {
      //   return 'error 404' as T;
      // }

      console.log('API Error:', error);
      throw error;
    }

    const dataa = await res.json();
    // console.log('DATAAAAAAAA', dataa);

    return dataa;
  } catch (err) {
    clearTimeout(timeoutId);

    if (
      process.env.NODE_ENV !== 'production' &&
      !(err instanceof SessionExpiredError)
    ) {
      console.error('API Request Error:', err);
    }

    if (err instanceof ApiError) {
      throw err;
    } else if (err instanceof Error) {
      throw ApiError.fromNetworkError(err);
    } else {
      // Handle cases where err might not be an Error object
      throw ApiError.fromNetworkError(new Error(String(err)));
    }
  }
}
