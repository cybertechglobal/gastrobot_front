'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Home,
  RefreshCw,
  Bug,
  Copy,
  CheckCircle,
} from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Log error to monitoring service
    console.error('Global Error:', error);
  }, [error]);

  const copyErrorDetails = async () => {
    const errorDetails = `
      Error: ${error.message}
      Digest: ${error.digest || 'N/A'}
      Timestamp: ${new Date().toISOString()}
      URL: ${window.location.href}
      User Agent: ${navigator.userAgent}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorDetails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  if (!mounted) return null;

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-[calc(100vh-68px)] bg-gradient-to-br from-red-50/50 via-background to-orange-50/30 dark:from-red-950/20 dark:via-background dark:to-orange-950/20 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl mx-auto text-center space-y-8">
        {/* Animated Error Icon */}
        <div className="relative">
          <div className="text-[100px] md:text-[140px] font-bold text-muted-foreground/10 select-none leading-none">
            500
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <AlertTriangle className="w-20 h-20 md:w-24 md:h-24 text-red-500 animate-pulse" />
              <div className="absolute -top-2 -right-2">
                <Badge
                  variant="destructive"
                  className="text-xs px-2 py-1 animate-bounce"
                >
                  Error
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="border-0 shadow-2xl bg-card/90 backdrop-blur-sm">
          <CardContent className="p-8 md:p-12 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Bug className="w-6 h-6 text-red-500" />
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Something Went Wrong
                </h1>
                <Bug className="w-6 h-6 text-red-500" />
              </div>

              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                We encountered an unexpected error while processing your
                request.
              </p>

              {error.digest && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 max-w-md mx-auto">
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    Error ID: <code className="font-mono">{error.digest}</code>
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
              <Button onClick={reset} size="lg" className="h-14 font-semibold">
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => window.location.reload()}
                className="h-14 font-semibold"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Reload Page
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => (window.location.href = '/')}
                className="h-14 font-semibold"
              >
                <Home className="w-5 h-5 mr-2" />
                Go Home
              </Button>
            </div>

            {/* Error Details (Development Only) */}
            {isDevelopment && (
              <div className="pt-8 border-t border-border/50 space-y-4">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
                  <Bug className="w-5 h-5" />
                  Development Error Details
                </h3>
                <div className="bg-muted/50 rounded-lg p-4 text-left max-w-full overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">Error Message:</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyErrorDetails}
                      className="h-8"
                    >
                      {copied ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="text-xs text-muted-foreground bg-background/50 rounded p-3 overflow-x-auto whitespace-pre-wrap break-words">
                    {error.message}
                  </pre>
                </div>
              </div>
            )}

            {/* Help Section */}
            <div className="pt-8 border-t border-border/30 space-y-4">
              <h3 className="text-lg font-semibold mb-4">What you can do:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-muted/30 rounded-lg p-4 text-left">
                  <h4 className="font-semibold mb-2">Temporary Issue</h4>
                  <p className="text-muted-foreground">
                    Try refreshing the page or waiting a few minutes before
                    trying again
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 text-left">
                  <h4 className="font-semibold mb-2">Still Having Issues?</h4>
                  <p className="text-muted-foreground">
                    Contact our support team with the error ID above for
                    assistance
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            {/* <div className="pt-4 border-t border-border/30">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  (window.location.href =
                    'mailto:support@yourapp.com?subject=Error Report&body=' +
                    encodeURIComponent(
                      `Error ID: ${error.digest || 'N/A'}\nURL: ${
                        window.location.href
                      }\nError: ${error.message}`
                    ))
                }
                className="text-muted-foreground hover:text-foreground"
              >
                <Mail className="w-4 h-4 mr-2" />
                Report This Error
              </Button>
            </div> */}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-1">
          <p className="text-sm text-muted-foreground/80">
            We apologize for the inconvenience
          </p>
          <p className="text-xs text-muted-foreground/60 font-mono">
            ERROR_500_INTERNAL_SERVER_ERROR
          </p>
        </div>
      </div>
    </div>
  );
}

// 'use client';

// export default function Error({
//   error,
//   reset,
// }: {
//   error: Error;
//   reset: () => void;
// }) {
//   const isApiError = (err: any): err is { status: number; message: string } =>
//     typeof err.status === 'number';

//   const message = isApiError(error)
//     ? `Error ${error.status}: ${error.message}`
//     : 'An unexpected error occurred';

//   return (
//     <div style={{ padding: '20px', textAlign: 'center' }}>
//       <h1>Error</h1>
//       <p>{message}</p>
//       <button onClick={reset}>Try Again</button>
//     </div>
//   );
// }
