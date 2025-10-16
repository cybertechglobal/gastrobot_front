/* eslint-disable @typescript-eslint/no-unused-vars */
// auth.ts
import NextAuth, { CredentialsSignin } from 'next-auth';
import { login } from './lib/api/auth';
import Credentials from 'next-auth/providers/credentials';
import { type DefaultSession } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { UserRole } from './types/user';
import { jwtDecode } from 'jwt-decode';
import { getBaseUrl } from './lib/api';
import { redirect } from 'next/navigation';

interface DecodedToken {
  exp?: number;
  [key: string]: any;
}

async function refreshAccessToken(token: any) {
  console.log('REFRESHING TOKEN');
  try {
    const response = await fetch(`${getBaseUrl()}/auth/refresh`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: token.refreshToken,
      }),
    });

    if (!response.ok) {
      console.log('ISTEKO JE REFRESH TOKEN');

      return {
        ...token,
        error: 'RefreshTokenError',
        bearerToken: undefined,
        bearerTokenExpires: 0,
      };
    }

    const data = await response.json();
    console.log('NOV TOKEN JEE: ', data.accessToken);
    return {
      ...token,
      bearerToken: data.accessToken,
      refreshToken: data.refreshToken,
      error: undefined,
    };
  } catch (error) {
    console.error('Error refreshing token:', error);
    return {
      ...token,
      error: 'RefreshTokenError',
      bearerToken: undefined,
      bearerTokenExpires: 0,
    };
  }
}

export enum Role {
  root = 'root',
  manager = 'manager',
  waiter = 'waiter',
}

declare module 'next-auth' {
  interface User {
    id?: string;
    createdAt?: string;
    firstname?: string;
    lastname?: string;
    profileImageUrl?: string;
    email?: string;
    role?: Role | string;
    isVerified?: boolean;
    bearerToken?: string;
    refreshToken?: string;
    accessToken?: string; // Keep for initial login response
    restaurantUsers: {
      id?: string;
      role?: UserRole;
      restaurantId?: string;
    }[];

    error?: string;
  }

  interface Session {
    user: {
      id?: string;
      createdAt?: string;
      firstname?: string;
      lastname?: string;
      profileImageUrl?: string;
      email?: string;
      phoneNumber?: string;
      role?: Role | string;
      isVerified?: boolean;
      bearerToken?: string;
      refreshToken?: string;

      restaurantUsers: {
        id?: string;
        role?: UserRole;
        restaurantId?: string; // Also made optional for consistency
      }[];
    } & DefaultSession['user'];
    bearerToken?: string;
    refreshToken?: string;
    expires: string;
    error?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user?: {
      id?: string;
      createdAt?: string;
      firstname?: string;
      lastname?: string;
      profileImageUrl?: string;
      phoneNumber?: string;
      email?: string;
      role?: Role | string;
      isVerified?: boolean;

      restaurantUsers: {
        id?: string;
        role?: string;
        restaurantId?: string;
      }[];
    };
    bearerToken?: string;
    refreshToken?: string;
    bearerTokenExpires?: number;
    error?: string;
  }
}

class InvalidLoginError extends CredentialsSignin {
  code = 'Invalid identifier or password';
  constructor(message: string) {
    super(message);
    this.code = message;
  }
}

class UserRoleNotAllowedError extends CredentialsSignin {
  code = 'UserRoleNotAllowed';
  constructor(message: string) {
    super(message);
    this.code = message;
  }
}

export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      id: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return { error: 'Neispravni podaci. Molimo pokusajte ponovo.' };
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          const response = await login(email, password);
          const { user, accessToken, refreshToken } = response;

          const userRole = user.restaurantUsers?.[0]?.role;
          if (userRole === 'user' || !user.restaurantUsers.length) {
            return {
              error: 'UserRoleNotAllowed',
            };
          }

          return {
            ...user,
            accessToken,
            refreshToken,
          };
        } catch (err: unknown) {
          let error = '';

          if (err && typeof err === 'object' && 'status' in err) {
            const errorWithStatus = err as { status: number };
            switch (errorWithStatus.status) {
              case 401:
                error = 'Neispravni podaci. Molimo pokusajte ponovo.';
                break;
              case 403:
                error = 'EmailNotVerified';
                break;
              default:
                error = 'Neispravni podaci. Molimo pokusajte ponovo.';
            }
          } else {
            error = 'Neispravni podaci. Molimo pokusajte ponovo.';
          }

          return { error: error };
        }
      },
    }),
  ],
  // IZMENA: Koristiti NEXTAUTH_SECRET umesto AUTH_SECRET
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  // DODAJ: trustHost za Netlify
  trustHost: true,
  callbacks: {
    async signIn({ user, account }) {
      // If we're using credentials, we've already verified user
      if (account?.provider === 'credentials' && user?.error) {
        if (user.error === 'UserRoleNotAllowed') {
          throw new UserRoleNotAllowedError(user.error);
        }
        throw new InvalidLoginError(user.error);
      }

      if (account?.provider === 'credentials' && !user.error) return true;

      // For Google (or any OAuth) we do a backend check
      const res = await fetch('https://devapirestobot.brrm.eu/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          provider: account?.provider,
        }),
      });

      return res.ok;
    },
    async jwt({ token, user, session, trigger }): Promise<JWT> {
      // console.log(session);
      // console.log('TRIGEEEEEER', trigger);
      // console.log('TRIGEEEEEER', user);

      console.log('unstablee ', trigger);
      console.log('unstablee ', session);
      if (trigger === 'update' && session?.user) {
        return {
          ...token,
          user: {
            ...token.user,
            firstname: session.user.firstname,
            lastname: session.user.lastname,
            phoneNumber: session.user.phoneNumber,
            ...(session?.user?.profileImageUrl && {
              profileImageUrl: session.user.profileImageUrl,
            }),
          },
        } as JWT;
      }

      if (token?.bearerToken) {
        const decodedToken = jwtDecode(token.bearerToken);
        console.log('decoded ', decodedToken);

        token.bearerTokenExpires = (decodedToken?.exp || 0) * 1000;
      }

      if (user && !user.error) {
        const { accessToken, refreshToken, error, image, name, ...restUser } =
          user;

        const { emailVerified, ...filteredUser } = restUser as any;

        return {
          ...token,
          bearerToken: accessToken,
          refreshToken: refreshToken,
          user: {
            ...filteredUser,
            restaurantUsers: filteredUser.restaurantUsers || [],
          },
        };
      }

      console.log('ovo je TOKEN ', token);
      // Check if token needs refresh
      const now = Date.now();
      const tokenExpires = token.bearerTokenExpires || 0;

      console.log('Token expiry check:', {
        now: new Date(now).toISOString(),
        expires: new Date(tokenExpires).toISOString(),
        needsRefresh: now >= tokenExpires,
      });

      // If token is still valid, return as is
      if (now < tokenExpires) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token.error) {
        session.error = token.error;
      }

      if (token) {
        session.user = token.user as any;
        session.bearerToken = token.bearerToken;
        session.refreshToken = token.refreshToken;
      }

      console.log('SESIJA:AAAAA ', session, token);
      return session;
    },
  },
});
