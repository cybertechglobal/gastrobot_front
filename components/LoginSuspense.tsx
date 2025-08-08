// app/(modal)/login/page.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Role-based default routes
const ROLE_ROUTES = {
  root: '/restaurants',
  waiter: '/orders',
  manager: '/my-restaurant',
} as const;

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginSuspense() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Function to close the modal (navigate back)
  const closeModal = () => {
    router.back();
  };

  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user) {
      // Determine redirect URL based on user role
      const userRole = session.user.restaurantUsers[0]
        ?.role as keyof typeof ROLE_ROUTES;

      let redirectUrl = '/restaurants';

      if (callbackUrl) {
        // Use callback URL if provided
        redirectUrl = callbackUrl;
      } else if (userRole && ROLE_ROUTES[userRole]) {
        // Use role-based default route
        redirectUrl = ROLE_ROUTES[userRole];
      }

      router.push(redirectUrl);
    }
  }, [session, status, callbackUrl, router]);

  const onSubmit = async (data: LoginFormData) => {
    // await login(data.email, data.password);

    const result: any = await signIn('credentials', {
      email: data.email,
      password: data.password,
      callbackUrl,
      redirect: true,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      // router.push("/dashboard"); // Redirect after login
    }
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.content}>
        <button onClick={closeModal} style={modalStyles.closeButton}>
          ×
        </button>
        <div className="w-full max-w-md p-6 bg-white rounded-lg">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Login
          </h1>
          {error && (
            <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>
          )}
          <div className="flex flex-col space-y-3 mb-4">
            <button
              onClick={() => signIn('google', { callbackUrl })}
              className="w-full px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 transition"
            >
              Login with Google
            </button>
            <button
              onClick={() => signIn('google', { callbackUrl })}
              className="w-full px-4 py-2 text-white bg-black rounded-md hover:bg-gray-900 transition"
            >
              Login with Apple
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                {...register('email')}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                {...register('password')}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition disabled:bg-gray-400"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="mt-4 text-center text-gray-600">
            Don&apos;t have an account?{' '}
            <a href="/register" className="text-blue-500 hover:underline">
              Sign Up
            </a>
          </p>
          <p className="mt-4 text-center text-gray-600">
            about
            <a href="/about" className="text-blue-500 hover:underline">
              About
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

const modalStyles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    position: 'relative' as const,
    width: '90%',
    maxWidth: '400px',
  },
  closeButton: {
    position: 'absolute' as const,
    top: '0.5rem',
    right: '0.5rem',
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
};
