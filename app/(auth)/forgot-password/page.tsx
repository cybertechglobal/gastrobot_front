'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { forgotPassword } from '@/lib/api/auth';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email je obavezan').email('Nevalidan email format'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      setEmailSent(true);
      toast.success('Email za resetovanje lozinke je poslat!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    setSubmittedEmail(data.email);
    mutation.mutate(data.email);
  };

  if (emailSent) {
    return (
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Proverite svoj email
          </h1>

          <p className="text-gray-600 dark:text-slate-400">
            Poslali smo link za resetovanje lozinke na:
          </p>

          <p className="font-medium text-gray-900 dark:text-white">
            {submittedEmail}
          </p>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => mutation.mutate(submittedEmail)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Šalje se...' : 'Pošalji ponovo'}
          </Button>

          <Link href="/login" className="block">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Nazad na prijavu
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 space-y-6">
      <div className="space-y-2">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Nazad na prijavu
        </Link>

        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Zaboravili ste lozinku?
        </h1>

        <p className="text-gray-600 dark:text-slate-400">
          Unesite vašu email adresu i poslaćemo vam link za resetovanje lozinke.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm text-gray-700 dark:text-slate-400"
          >
            Email adresa
          </Label>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
            <Input
              id="email"
              type="email"
              placeholder="vas.email@primer.com"
              autoComplete="email"
              {...register('email')}
              className="pl-10 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"
            />
          </div>

          {errors.email && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-primary uppercase"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Šalje se...' : 'Pošalji'}
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
