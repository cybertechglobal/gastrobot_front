// app/reset-password/reset-password-form.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { resetPassword } from '@/lib/api/auth';

const resetPasswordSchema = z
  .object({
    password: z.string(),
    confirmPassword: z.string().min(1, 'Potvrdite vašu lozinku'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Lozinke se ne poklapaju',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');

    if (!tokenFromUrl) {
      setTokenError('Token nije pronađen. Link možda nije validan.');
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const mutation = useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      resetPassword(token, password),
    onSuccess: () => {
      toast.success('Lozinka je uspešno promenjena!');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Token nije validan');
      return;
    }
    mutation.mutate({ token, password: data.password });
  };

  // Invalid token screen
  if (tokenError) {
    return (
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Nevažeći Link
          </h1>

          <p className="text-gray-600 dark:text-slate-400">{tokenError}</p>

          <p className="text-sm text-gray-500 dark:text-slate-500">
            Link za resetovanje lozinke nije validan.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/login" className="block">
            <Button variant="outline" className="w-full uppercase">
              Nazad na prijavu
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Success screen after password reset
  if (mutation.isSuccess) {
    return (
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Lozinka promenjena!
          </h1>

          <p className="text-gray-600 dark:text-slate-400">
            Vaša lozinka je uspešno promenjena. Možete se sada prijaviti sa
            novom lozinkom.
          </p>
        </div>

        <Link href="/login" className="block uppercase">
          <Button className="w-full bg-primary">prijavi se</Button>
        </Link>
      </div>
    );
  }

  // Main reset password form
  return (
    <div className="w-full max-w-md p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Resetujte lozinku
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm text-gray-700 dark:text-slate-400"
          >
            Nova lozinka
          </Label>

          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Unesite novu lozinku"
              autoComplete="new-password"
              {...register('password')}
              className="pr-10 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {errors.password && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-sm text-gray-700 dark:text-slate-400"
          >
            Potvrdite lozinku
          </Label>

          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Potvrdite novu lozinku"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className="pr-10 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {errors.confirmPassword && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-primary uppercase"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Čuva se...' : 'Promeni lozinku'}
        </Button>
      </form>

      <div className="text-center text-sm text-gray-500 dark:text-slate-500">
        Setili ste se lozinke?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Prijavite se
        </Link>
      </div>
    </div>
  );
}
