'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-68px)] bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto text-center space-y-8">
        {/* Animated 404 Text */}
        <div className="relative">
          <div className="text-[120px] md:text-[160px] font-bold text-muted-foreground/20 select-none leading-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FileQuestion className="w-16 h-16 md:w-20 md:h-20 text-primary animate-pulse" />
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8 md:p-12 space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Page Not Found
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                The page you&apos;re looking for doesn&apos;t exist or has been
                moved to a different location.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button asChild size="lg" className="min-w-[140px]">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Go Home
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => window.history.back()}
                className="min-w-[140px] flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => window.location.reload()}
                className="h-10 text-sm font-medium flex items-center gap-1"
              >
                <FileQuestion className="w-4 h-4" />
                Refresh
              </Button>
            </div>

            {/* Helpful Links */}
            <div className="pt-8 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-4">
                You might be looking for:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="link" size="sm" asChild>
                  <Link href="/restaurants">Restaurants</Link>
                </Button>
                <Button variant="link" size="sm" asChild>
                  <Link href="/menus">Menus</Link>
                </Button>
                <Button variant="link" size="sm" asChild>
                  <Link href="/contact">Contact</Link>
                </Button>
                <Button variant="link" size="sm" asChild>
                  <Link href="/help">Help Center</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Text */}
        <p className="text-xs text-muted-foreground/60">
          Error Code: 404 • Page Not Found
        </p>
      </div>
    </div>
  );
}
