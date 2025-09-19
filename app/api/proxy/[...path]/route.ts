// // import { NextRequest, NextResponse } from 'next/server';
// // import { ApiError } from '@/lib/error';
// // import { getBaseUrl } from '@/lib/api';
// // import { auth } from '@/auth';
// // import { NextAuthRequest } from 'next-auth';

// // async function handler(
// //   req: NextAuthRequest,
// //   context: { params: Promise<{ path: string[] }> }
// // ) {
// //   const method = req.method;
// //   const { path } = await context.params;
// //   const pathString = path?.join('/') || '';

// //   // Validate path
// //   if (!pathString) {
// //     return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
// //   }

// //   console.log('AUTH SESSION', req.auth);

// //   // Check authentication using req.auth (provided by auth wrapper)
// //   if (!req.auth) {
// //     return NextResponse.json(
// //       { error: 'Unauthorized: No auth token provided' },
// //       { status: 401 }
// //     );
// //   }

// //   const token = req.auth.bearerToken;

// //   if (!token) {
// //     return NextResponse.json(
// //       { error: 'Unauthorized: No bearer token in session' },
// //       { status: 401 }
// //     );
// //   }

// //   // Construct backend URL
// //   const { search } = new URL(req.url);
// //   const backendUrl = `${getBaseUrl()}/${pathString}${search}`;

// //   // Forward only allowed headers
// //   const incomingHeaders = new Headers(req.headers);
// //   const allowedHeaders = ['content-type', 'Accept', 'Authorization'];
// //   const forwardedHeaders: Record<string, string> = {};

// //   incomingHeaders.forEach((value, key) => {
// //     if (allowedHeaders.includes(key)) {
// //       forwardedHeaders[key] = value;
// //     }
// //   });

// //   // Inject Authorization token from session
// //   if (token && !forwardedHeaders['Authorization']) {
// //     forwardedHeaders['Authorization'] = `Bearer ${token}`;
// //   }

// //   // Handle body
// //   let data: any = undefined;
// //   const contentType = forwardedHeaders['content-type'] || '';

// //   if (['POST', 'PUT', 'PATCH'].includes(method)) {
// //     if (contentType.startsWith('multipart/form-data')) {
// //       data = await req.formData();
// //     } else {
// //       try {
// //         data = await req.json();
// //         if (data != null && Object.keys(data).length > 0) {
// //           forwardedHeaders['content-type'] = 'application/json';
// //         } else {
// //           delete forwardedHeaders['content-type'];
// //         }
// //       } catch {
// //         delete forwardedHeaders['content-type'];
// //       }
// //     }
// //   }

// //   // Add timeout with AbortController
// //   const controller = new AbortController();
// //   const timeoutId = setTimeout(() => controller.abort(), 30000); // 10s timeout

// //   try {
// //     const res = await fetch(backendUrl, {
// //       method,
// //       headers: forwardedHeaders,
// //       body: data
// //         ? data instanceof FormData
// //           ? data
// //           : JSON.stringify(data)
// //         : undefined,
// //       cache: 'no-store', // ! OVO SREDITI DA MOZE BILO STA
// //       signal: controller.signal,
// //     });

// //     clearTimeout(timeoutId);

// //     if (!res.ok) {
// //       const error = await ApiError.fromResponse(res);
// //       console.error('Proxy RES.OK Error:', error);
// //       return NextResponse.json(
// //         { error: error.message, details: error.details },
// //         { status: error.status }
// //       );
// //     }

// //     return NextResponse.json(await res.json(), { status: res.status });
// //   } catch (err) {
// //     clearTimeout(timeoutId);

// //     if (process.env.NODE_ENV !== 'production') {
// //       console.error('Proxy CATCH Error:', err);
// //     }

// //     const error =
// //       err instanceof ApiError ? err : ApiError.fromNetworkError(err);
// //     return NextResponse.json(
// //       { error: error.message, details: error.details },
// //       { status: error.status }
// //     );
// //   }
// // }

// // // Wrap each HTTP method with auth
// // export const GET = auth(handler);
// // export const POST = auth(handler);
// // export const PUT = auth(handler);
// // export const PATCH = auth(handler);
// // export const DELETE = auth(handler);

// import { NextResponse } from 'next/server';
// import { ApiError } from '@/lib/error';
// import { getBaseUrl } from '@/lib/api';
// import { auth, unstable_update } from '@/auth';
// import { NextAuthRequest } from 'next-auth';

// async function refreshAccessToken(refreshToken: string) {
//   try {
//     const response = await fetch(`${getBaseUrl()}/auth/refresh`, {
//       method: 'POST',
//       headers: {
//         'content-type': 'application/json',
//       },
//       body: JSON.stringify({
//         refreshToken: refreshToken,
//       }),
//     });

//     if (!response.ok) {
//       throw new Error('Failed to refresh token');
//     }

//     const data = await response.json();
//     return {
//       accessToken: data.accessToken,
//     };
//   } catch (error) {
//     console.error('Error refreshing access token:', error);
//     return null;
//   }
// }

// async function handler(
//   req: NextAuthRequest,
//   context: { params: Promise<{ path: string[] }> }
// ) {
//   const method = req.method;
//   const { path } = await context.params;
//   const pathString = path?.join('/') || '';

//   // Validate path
//   if (!pathString) {
//     return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
//   }

//   console.log('AUTH SESSION', req.auth);

//   // Check authentication using req.auth (provided by auth wrapper)
//   if (!req.auth) {
//     return NextResponse.json(
//       { error: 'Unauthorized: No auth token provided' },
//       { status: 401 }
//     );
//   }

//   const token = req.auth.bearerToken;
//   const refreshToken = req.auth.refreshToken;

//   if (!token) {
//     return NextResponse.json(
//       { error: 'Unauthorized: No bearer token in session' },
//       { status: 401 }
//     );
//   }

//   // Construct backend URL
//   const { search } = new URL(req.url);
//   const backendUrl = `${getBaseUrl()}/${pathString}${search}`;

//   // Forward only allowed headers
//   const incomingHeaders = new Headers(req.headers);
//   const allowedHeaders = ['content-type', 'Accept', 'Authorization'];
//   const forwardedHeaders: Record<string, string> = {};

//   incomingHeaders.forEach((value, key) => {
//     if (allowedHeaders.includes(key)) {
//       forwardedHeaders[key] = value;
//     }
//   });

//   // Handle body
//   let data: any = undefined;
//   const contentType = forwardedHeaders['content-type'] || '';

//   if (['POST', 'PUT', 'PATCH'].includes(method)) {
//     if (contentType.startsWith('multipart/form-data')) {
//       data = await req.formData();

//       if (data instanceof FormData) {
//         delete forwardedHeaders['content-type'];
//       }
//     } else {
//       try {
//         data = await req.json();
//         if (data != null && Object.keys(data).length > 0) {
//           forwardedHeaders['content-type'] = 'application/json';
//         } else {
//           delete forwardedHeaders['content-type'];
//         }
//       } catch {
//         delete forwardedHeaders['content-type'];
//       }
//     }
//   }

//   // Function to make the actual request
//   const makeRequest = async (
//     authToken: string,
//     isRetry: boolean = false
//   ): Promise<NextResponse> => {
//     // console.log('TTTTTTT', data);
//     // console.log('TTTTTTT', token);
//     // console.error('AUTH STATUS: ', forwardedHeaders);

//     // Inject Authorization token
//     // if (token) {
//     // console.log('dodajemo token:', authToken);
//     forwardedHeaders['Authorization'] = `Bearer ${authToken}`;
//     // }

//     // console.error('PROXY STATUS: ', res.status);
//     // console.error('PROXY STATUS: ', isRetry);
//     // console.error('PROXY STATUS: ', refreshToken);
//     // console.error('AUTH STATUS: ', authToken);
//     // console.error('AUTH STATUS: ', backendUrl);

//     // Add timeout with AbortController
//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), 30000);

//     try {
//       const res = await fetch(backendUrl, {
//         method,
//         headers: forwardedHeaders,
//         body: data
//           ? data instanceof FormData
//             ? data
//             : JSON.stringify(data)
//           : undefined,
//         cache: 'no-store',
//         signal: controller.signal,
//       });

//       clearTimeout(timeoutId);

//       console.log('RES U PROXY ', res.headers, res.status, method);

//       // If we get 401 and haven't tried refreshing yet, attempt token refresh
//       if (res.status === 401 && !isRetry && refreshToken) {
//         console.log('Token expired, attempting to refresh...');

//         const refreshResult = await refreshAccessToken(refreshToken);

//         if (refreshResult) {
//           console.log(
//             'Token refreshed successfully, updating session and retrying...'
//           );

//           console.log('NOVI TOKEN JE: ', refreshResult.accessToken);

//           // await unstable_update({ bearerToken: refreshResult.accessToken });
//           await unstable_update({ bearerToken: refreshResult.accessToken });

//           // Create response with updated session cookie
//           // const response = await makeRequest(refreshResult.accessToken, true);

//           // return response;

//           return await makeRequest(refreshResult.accessToken, true);
//         } else {
//           // Refresh failed, return 401 to trigger client-side logout
//           console.log('Token refresh failed');
//           return NextResponse.json(
//             { error: 'Token refresh failed', shouldLogout: true },
//             { status: 401 }
//           );
//         }
//       }

//       if (!res.ok) {
//         const error = await ApiError.fromResponse(res);
//         console.error('Proxy RES.OK Error:', error);
//         return NextResponse.json(
//           { error: error.message, details: error.details },
//           { status: error.status }
//         );
//       }

//       return NextResponse.json(await res.json(), { status: res.status });
//     } catch (err) {
//       clearTimeout(timeoutId);

//       if (process.env.NODE_ENV !== 'production') {
//         console.error('Proxy CATCH Error:', err);
//       }

//       const error =
//         err instanceof ApiError ? err : ApiError.fromNetworkError(err as Error);

//       return NextResponse.json(
//         { error: error.message, details: error.details },
//         { status: error.status }
//       );
//     }
//   };

//   // Make the initial request
//   return makeRequest(token);
// }

// // Wrap each HTTP method with auth
// export const GET = auth(handler);
// export const POST = auth(handler);
// export const PUT = auth(handler);
// export const PATCH = auth(handler);
// export const DELETE = auth(handler);

// import { NextRequest, NextResponse } from 'next/server';
// import { ApiError } from '@/lib/error';
// import { getBaseUrl } from '@/lib/api';
// import { auth } from '@/auth';
// import { NextAuthRequest } from 'next-auth';

// async function handler(
//   req: NextAuthRequest,
//   context: { params: Promise<{ path: string[] }> }
// ) {
//   const method = req.method;
//   const { path } = await context.params;
//   const pathString = path?.join('/') || '';

//   // Validate path
//   if (!pathString) {
//     return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
//   }

//   console.log('AUTH SESSION', req.auth);

//   // Check authentication using req.auth (provided by auth wrapper)
//   if (!req.auth) {
//     return NextResponse.json(
//       { error: 'Unauthorized: No auth token provided' },
//       { status: 401 }
//     );
//   }

//   const token = req.auth.bearerToken;

//   if (!token) {
//     return NextResponse.json(
//       { error: 'Unauthorized: No bearer token in session' },
//       { status: 401 }
//     );
//   }

//   // Construct backend URL
//   const { search } = new URL(req.url);
//   const backendUrl = `${getBaseUrl()}/${pathString}${search}`;

//   // Forward only allowed headers
//   const incomingHeaders = new Headers(req.headers);
//   const allowedHeaders = ['content-type', 'Accept', 'Authorization'];
//   const forwardedHeaders: Record<string, string> = {};

//   incomingHeaders.forEach((value, key) => {
//     if (allowedHeaders.includes(key)) {
//       forwardedHeaders[key] = value;
//     }
//   });

//   // Inject Authorization token from session
//   if (token && !forwardedHeaders['Authorization']) {
//     forwardedHeaders['Authorization'] = `Bearer ${token}`;
//   }

//   // Handle body
//   let data: any = undefined;
//   const contentType = forwardedHeaders['content-type'] || '';

//   if (['POST', 'PUT', 'PATCH'].includes(method)) {
//     if (contentType.startsWith('multipart/form-data')) {
//       data = await req.formData();
//     } else {
//       try {
//         data = await req.json();
//         if (data != null && Object.keys(data).length > 0) {
//           forwardedHeaders['content-type'] = 'application/json';
//         } else {
//           delete forwardedHeaders['content-type'];
//         }
//       } catch {
//         delete forwardedHeaders['content-type'];
//       }
//     }
//   }

//   // Add timeout with AbortController
//   const controller = new AbortController();
//   const timeoutId = setTimeout(() => controller.abort(), 30000); // 10s timeout

//   try {
//     const res = await fetch(backendUrl, {
//       method,
//       headers: forwardedHeaders,
//       body: data
//         ? data instanceof FormData
//           ? data
//           : JSON.stringify(data)
//         : undefined,
//       cache: 'no-store', // ! OVO SREDITI DA MOZE BILO STA
//       signal: controller.signal,
//     });

//     clearTimeout(timeoutId);

//     if (!res.ok) {
//       const error = await ApiError.fromResponse(res);
//       console.error('Proxy RES.OK Error:', error);
//       return NextResponse.json(
//         { error: error.message, details: error.details },
//         { status: error.status }
//       );
//     }

//     return NextResponse.json(await res.json(), { status: res.status });
//   } catch (err) {
//     clearTimeout(timeoutId);

//     if (process.env.NODE_ENV !== 'production') {
//       console.error('Proxy CATCH Error:', err);
//     }

//     const error =
//       err instanceof ApiError ? err : ApiError.fromNetworkError(err);
//     return NextResponse.json(
//       { error: error.message, details: error.details },
//       { status: error.status }
//     );
//   }
// }

// // Wrap each HTTP method with auth
// export const GET = auth(handler);
// export const POST = auth(handler);
// export const PUT = auth(handler);
// export const PATCH = auth(handler);
// export const DELETE = auth(handler);

import { NextResponse } from 'next/server';
import { ApiError } from '@/lib/error';
import { getBaseUrl } from '@/lib/api';
import { auth } from '@/auth';
import { NextAuthRequest } from 'next-auth';

async function handler(
  req: NextAuthRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const method = req.method;
  const { path } = await context.params;
  const pathString = path?.join('/') || '';

  // Validate path
  if (!pathString) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  console.log('AUTH SESSION', req.auth);

  // Check authentication using req.auth (provided by auth wrapper)
  if (!req.auth) {
    return NextResponse.json(
      { error: 'Unauthorized: No auth token provided' },
      { status: 401 }
    );
  }

  if (
    req.auth.error === 'RefreshTokenError' ||
    req.auth.error === 'NoRefreshToken'
  ) {
    console.log('Session has refresh error, triggering logout');
    return NextResponse.json(
      {
        error: 'Session expired. Please login again.',
        shouldLogout: true,
        message: 'Vaša sesija je istekla. Molimo ulogujte se ponovo.',
      },
      { status: 401 }
    );
  }

  const token = req.auth.bearerToken;

  if (!token) {
    return NextResponse.json(
      {
        error: 'Unauthorized: No bearer token in session',
        shouldLogout: true,
        message: 'Vaša sesija je istekla. Molimo ulogujte se ponovo.',
      },
      { status: 401 }
    );
  }

  // Construct backend URL
  const { search } = new URL(req.url);
  const backendUrl = `${getBaseUrl()}/${pathString}${search}`;

  // Forward only allowed headers
  const incomingHeaders = new Headers(req.headers);
  const allowedHeaders = ['content-type', 'accept', 'authorization'];
  const forwardedHeaders: Record<string, string> = {};

  incomingHeaders.forEach((value, key) => {
    if (allowedHeaders.includes(key.toLowerCase())) {
      forwardedHeaders[key] = value;
    }
  });

  // Handle body
  let data: any = undefined;
  const contentType = forwardedHeaders['content-type'] || '';

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    if (contentType.startsWith('multipart/form-data')) {
      data = await req.formData();

      if (data instanceof FormData) {
        delete forwardedHeaders['content-type'];
      }
    } else {
      try {
        data = await req.json();
        if (data != null && Object.keys(data).length > 0) {
          forwardedHeaders['content-type'] = 'application/json';
        } else {
          delete forwardedHeaders['content-type'];
        }
      } catch {
        delete forwardedHeaders['content-type'];
      }
    }
  }

  // Function to make the actual request
  const makeRequest = async (authToken: string): Promise<NextResponse> => {
    // console.log('TTTTTTT', data);
    // console.log('TTTTTTT', token);
    // console.error('AUTH STATUS: ', forwardedHeaders);

    // Inject Authorization token
    // if (token) {
    // console.log('dodajemo token:', authToken);
    forwardedHeaders['Authorization'] = `Bearer ${authToken}`;
    // }

    // console.error('PROXY STATUS: ', res.status);
    // console.error('PROXY STATUS: ', isRetry);
    // console.error('PROXY STATUS: ', refreshToken);
    // console.error('AUTH STATUS: ', authToken);
    // console.error('AUTH STATUS: ', backendUrl);

    // Add timeout with AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(backendUrl, {
        method,
        headers: forwardedHeaders,
        body: data
          ? data instanceof FormData
            ? data
            : JSON.stringify(data)
          : undefined,
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('RES U PROXY ', res.headers, res.status, method);

      if (res.status === 401) {
        console.log('Backend returned 401 - session invalid');
        return NextResponse.json(
          {
            error: 'Session expired. Please login again.',
            shouldLogout: true,
            message: 'Vaša sesija je istekla. Molimo ulogujte se ponovo.',
          },
          { status: 401 }
        );
      }

      if (!res.ok) {
        const error = await ApiError.fromResponse(res);
        console.error('Proxy RES.OK Error:', error);
        return NextResponse.json(
          { error: error.message, details: error.details },
          { status: error.status }
        );
      }

      try {
        const jsonData = await res.json();
        return NextResponse.json(jsonData, { status: res.status });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (parseError) {
        return NextResponse.json({}, { status: res.status });
      }
    } catch (err) {
      clearTimeout(timeoutId);

      if (process.env.NODE_ENV !== 'production') {
        console.error('Proxy CATCH Error:', err);
      }

      const error =
        err instanceof ApiError ? err : ApiError.fromNetworkError(err as Error);

      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.status }
      );
    }
  };

  // Make the initial request
  return makeRequest(token);
}

// Wrap each HTTP method with auth
export const GET = auth(handler);
export const POST = auth(handler);
export const PUT = auth(handler);
export const PATCH = auth(handler);
export const DELETE = auth(handler);
