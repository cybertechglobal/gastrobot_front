/* eslint-disable @typescript-eslint/no-unused-vars */
// auth.ts
import NextAuth, { CredentialsSignin } from 'next-auth';
import { login } from './lib/api/auth';
import Credentials from 'next-auth/providers/credentials';
import { type DefaultSession } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { UserRole } from './types/user';

export enum Role {
  rooot = 'root',
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
    expires: string;
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
      email?: string;
      role?: Role | string;
      isVerified?: boolean;
      bearerToken?: string;
      refreshToken?: string;

      restaurantUsers: {
        id?: string;
        role?: string;
        restaurantId?: string;
      }[];
    };
  }
}

class InvalidLoginError extends CredentialsSignin {
  code = 'Invalid identifier or password';
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
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      // If we're using credentials, we've already verified user
      if (account?.provider === 'credentials' && user?.error) {
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
      console.log(session);
      console.log('TRIGEEEEEER', trigger);
      console.log('TRIGEEEEEER', user);

      if (trigger === 'update' && session) {
        console.log('UPDATING: Old token:', token.user?.bearerToken);
        console.log('UPDATING: New token:', session?.bearerToken);

        return {
          ...token,
          user: {
            ...token.user,
            bearerToken: session?.bearerToken,
            restaurantUsers: token.user?.restaurantUsers || [],
          },
        } as JWT;
      }

      if (user) {
        const { accessToken, refreshToken, error, image, name, ...restUser } =
          user;

        const { emailVerified, ...filteredUser } = restUser as any;

        token.user = {
          ...filteredUser,
          bearerToken: accessToken,
          refreshToken: refreshToken,
          restaurantUsers: filteredUser.restaurantUsers || [],
        };
      }

      console.log(token);

      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user as any;
      }

      console.log('SESIJA:AAAAA ', session, token);
      return session;
    },
  },
});
