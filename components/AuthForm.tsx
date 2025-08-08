'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/public/logo.svg';
import { ModeToggle } from './ModeToggle';
import { useMutation } from '@tanstack/react-query';
import { resendVerification } from '@/lib/api/users';
import { Eye, Mail } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email je obavezan').email('Invalid email format'),
  password: z.string().min(6, 'Lozinka mora biti minimum 6 karaktera'),
});
type LoginFormData = z.infer<typeof loginSchema>;

// Role-based default routes
const ROLE_ROUTES = {
  root: '/restaurants',
  waiter: '/orders',
  manager: '/my-restaurant',
} as const;

const useResendVerification = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      return resendVerification({ email });
    },
  });
};

export default function AuthForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [isEmailNotVerified, setIsEmailNotVerified] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const resendVerificationMutation = useResendVerification();

  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/restaurants';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

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
    setError('');
    setIsEmailNotVerified(false);

    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      callbackUrl,
      redirect: false,
    });

    if (!result?.ok || result?.error) {
      // Proveri da li je greška 403 (nepotvržen email)
      if (result?.status === 403 || result?.code === 'EmailNotVerified') {
        setIsEmailNotVerified(true);
        setUserEmail(data.email);
        setError(
          'Vaš email nije potvrđen. Molimo proverite svoj inbox ili pošaljite novu verifikaciju.'
        );
      } else {
        setError(result?.code || 'Došlo je do greške prilikom prijavljivanja');
      }
    }
  };

  const handleResendVerification = () => {
    resendVerificationMutation.mutate(userEmail, {
      onSuccess: () => {
        setError('');
      },
      onError: (error) => {
        setError(error.message);
      },
    });
  };

  // Komponenta za prikaz verifikacije
  const EmailVerificationPrompt = () => (
    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4 space-y-3">
      <div className="flex items-center space-x-2">
        <Mail className="text-orange-600 dark:text-orange-400" size={20} />
        <h3 className="font-medium text-orange-800 dark:text-orange-300">
          Email nije potvrđen
        </h3>
      </div>

      <p className="text-sm text-orange-700 dark:text-orange-400">
        Molimo proverite svoj email i kliknite na link za potvrdu. Ako niste
        dobili email, možete poslati novi.
      </p>

      <div className="flex flex-col space-y-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleResendVerification}
          disabled={
            resendVerificationMutation.isPending ||
            resendVerificationMutation.isSuccess
          }
          className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-900/30"
        >
          {resendVerificationMutation.isPending
            ? 'Šalje se...'
            : resendVerificationMutation.isSuccess
            ? 'Verifikacija poslata!'
            : 'Pošalji novu verifikaciju'}
        </Button>

        {resendVerificationMutation.isSuccess && (
          <p className="text-xs text-green-600 dark:text-green-400">
            ✓ Verifikacioni email je uspešno poslat na {userEmail}
          </p>
        )}

        {resendVerificationMutation.isError && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {resendVerificationMutation.error?.message}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-sm rounded-2xl p-8 space-y-8 sm:shadow-lg">
      <div className="flex justify-center">
        <Image src={logo} alt="logo" width={150} priority />
      </div>

      {/* --- Title --- */}
      <h1 className="text-3xl font-bold text-black dark:text-white">
        Dobrodosli!
      </h1>

      {/* --- Email Verification Prompt --- */}
      {isEmailNotVerified && <EmailVerificationPrompt />}

      {/* --- Form --- */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1">
          <Label
            htmlFor="email"
            className="text-sm text-gray-700 dark:text-slate-400"
          >
            Email adresa
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Email adresa"
            autoComplete="email"
            {...register('email')}
            className="
                bg-transparent 
                border-b border-gray-300 dark:border-slate-700 
                placeholder-gray-400 dark:placeholder-slate-500 
                text-black dark:text-white 
                focus:ring-0 focus:border-indigo-500
              "
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="relative space-y-1">
          <Label
            htmlFor="password"
            className="text-sm text-gray-700 dark:text-slate-400"
          >
            Lozinka
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Lozinka"
              autoComplete="current-password"
              {...register('password')}
              className="
                bg-transparent 
                border-b border-gray-300 dark:border-slate-700 
                placeholder-gray-400 dark:placeholder-slate-500 
                text-black dark:text-white 
                focus:ring-0 focus:border-indigo-500
                pr-10
              "
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400"
            >
              <Eye size={18} />
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={remember}
              onCheckedChange={(checked) => setRemember(checked === true)}
              className="border-gray-300 dark:border-slate-700"
            />
            <Label
              htmlFor="remember"
              className="text-sm text-black dark:text-white"
            >
              Zapamti me
            </Label>
          </div>
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Zaboravljena lozinka?
          </Link>
        </div>

        {/* Error message (osim za verifikaciju) */}
        {error && !isEmailNotVerified && (
          <p className="text-sm my-5 text-destructive">{error}</p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          className="w-full bg-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Prijavljivanje...' : 'Prijavi se'}
        </Button>
      </form>

      {/* --- Sign up link --- */}
      <p className="text-center text-sm text-gray-400 dark:text-slate-500">
        Nemas nalog?{' '}
        <Link href="/signup" className="text-primary hover:underline">
          Registruj se
        </Link>
      </p>

      <ModeToggle />
    </div>
  );
}
