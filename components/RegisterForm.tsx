'use client';

import { useEffect, useState } from 'react';
import SocialButton from '../components/SocialButton';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { IoEyeOutline } from 'react-icons/io5';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z.string(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);

  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (session) {
      router.push(callbackUrl);
    }
  }, [session, status, callbackUrl, router]);

  const onSubmit = async (data: LoginFormData) => {
    // await login(data.email, data.password);

    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      callbackUrl,
      redirect: false,
    });

    console.log(result);

    if (result?.error) {
    } else {
      // router.push("/dashboard"); // Redirect after login
    }
  };

  return (
    <div className="w-full max-w-sm rounded-md">
      {/* <div className="flex justify-start gap-8 mb-6 text-sm font-medium">
        <span className="border-b-2 border-blue-600 pb-1 text-blue-600 cursor-pointer">
          LOGIN
        </span>
        <span className="text-gray-700 cursor-pointer hover:text-black">
          REGISTER
        </span>
      </div> */}

      <h2 className="text-lg font-semibold mb-5">Create your account</h2>

      <form className="space-y-4 text-black" onSubmit={handleSubmit(onSubmit)}>
        <div className="text-black">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Username
          </label>
          <input
            type="text"
            {...register('username')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="text-black">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email address
          </label>
          <input
            type="email"
            {...register('email')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="relative">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 pr-10"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-[36px] text-gray-500"
          >
            <IoEyeOutline size={18} />
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-medium"
        >
          {isSubmitting ? 'Logging in...' : 'Register'}
        </button>

        <div className="flex items-center gap-4 my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="text-gray-400 text-sm">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <SocialButton
          onClick={() => signIn('google', { callbackUrl })}
          icon={<FcGoogle />}
          text="Sign in with Google"
        />
        <SocialButton
          onClick={() => signIn('google', { callbackUrl })}
          icon={<FaApple />}
          text="Sign in with Apple"
        />
      </form>
    </div>
  );
}
