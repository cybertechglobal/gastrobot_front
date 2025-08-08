'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { verify } from '@/lib/api/users';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const {
    data: verificationResult,
    isLoading,
    isError,
    error,
    isSuccess,
    refetch,
  } = useQuery({
    queryKey: ['verify-email', token],
    queryFn: () => verify({ params: { token: token! } }),
    enabled: !!token,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const handleGoToLogin = () => {
    router.replace('/login');
  };

  const handleResendEmail = () => {
    // Ovde možete implementirati logiku za ponovno slanje email-a
    console.log('Ponovno slanje email-a...');
  };

  const handleRetry = () => {
    refetch();
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center w-full justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <CardTitle className="text-2xl">Nevažeći link</CardTitle>
            <CardDescription>
              Link za verifikaciju nije valjan ili je istekao.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Molimo vas da proverite da li ste kliknuli ili kopirali
                kompletan link iz email-a.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col space-y-2">
              <Button onClick={handleResendEmail} variant="outline">
                Pošalji ponovo email
              </Button>
              <Button onClick={handleGoToLogin} variant="default">
                Idi na prijavu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center w-full py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {isSuccess ? (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <CardTitle className="text-2xl text-green-700">
                Email verifikovan!
              </CardTitle>
              <CardDescription>
                Vaš email je uspešno verifikovan. Sada možete da se prijavite.
              </CardDescription>
            </>
          ) : isError ? (
            <>
              <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <CardTitle className="text-2xl text-red-700">
                Verifikacija neuspešna
              </CardTitle>
              <CardDescription>
                Došlo je do greške prilikom verifikacije vašeg email-a.
              </CardDescription>
            </>
          ) : isLoading ? (
            <>
              <Loader2 className="mx-auto h-12 w-12 text-blue-500 mb-4 animate-spin" />
              <CardTitle className="text-2xl">Verifikujem email...</CardTitle>
              <CardDescription>
                Molimo vas sačekajte dok verifikujemo vaš email.
              </CardDescription>
            </>
          ) : (
            <>
              <Mail className="mx-auto h-12 w-12 text-blue-500 mb-4" />
              <CardTitle className="text-2xl">Verifikacija email-a</CardTitle>
              <CardDescription>
                Priprema za verifikaciju vašeg email-a.
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {error?.message || 'Došlo je do neočekivane greške.'}
              </AlertDescription>
            </Alert>
          )}

          {isSuccess && verificationResult && (
            <Alert>
              <AlertDescription className="text-green-700">
                {verificationResult.message || 'Email je uspešno verifikovan!'}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col space-y-2">
            {isSuccess && (
              <Button onClick={handleGoToLogin} className="w-full">
                Idi na prijavu
              </Button>
            )}

            {isError && (
              <>
                <Button
                  onClick={handleRetry}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Pokušavam ponovo...
                    </>
                  ) : (
                    'Pokušaj ponovo'
                  )}
                </Button>
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full"
                >
                  Pošalji ponovo email
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center w-full py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Loader2 className="mx-auto h-12 w-12 text-blue-500 mb-4 animate-spin" />
          <CardTitle className="text-2xl">Učitavam...</CardTitle>
          <CardDescription>
            Molimo vas sačekajte dok se stranica učitava.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
