'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ChefHat, Store, ArrowLeft, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function MenuNotFound() {
  const router = useRouter();
  const params = useParams();
  const [mounted, setMounted] = useState(false);

  const restaurantId = params?.id as string;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGoBack = () => {
    // Check if there's meaningful history within the app
    if (
      document.referrer &&
      document.referrer.includes(window.location.origin)
    ) {
      // Check if referrer is not login page
      if (
        !document.referrer.includes('/login') &&
        !document.referrer.includes('/auth')
      ) {
        router.back();
      } else {
        router.push('/restaurants');
      }
    } else {
      // No internal referrer, go to restaurants page
      router.push('/restaurants');
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-[calc(100vh-68px)] bg-gradient-to-br from-orange-50/50 via-background to-red-50/30 dark:from-orange-950/20 dark:via-background dark:to-red-950/20 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl mx-auto text-center space-y-8">
        {/* Animated Menu Icon */}
        <div className="relative">
          <div className="text-[100px] md:text-[140px] font-bold text-muted-foreground/10 select-none leading-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* <MenuSquare className="w-20 h-20 md:w-24 md:h-24 text-orange-500 animate-pulse" /> */}
              {/* <div className="absolute -top-2 -right-2">
                <Badge
                  variant="destructive"
                  className="text-xs px-2 py-1 animate-bounce"
                >
                  Missing
                </Badge>
              </div> */}
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="border-0 shadow-2xl bg-card/90 backdrop-blur-sm">
          <CardContent className="p-5 md:p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <ChefHat className="w-6 h-6 text-orange-500" />
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Menu Not Found
                </h1>
                <ChefHat className="w-6 h-6 text-orange-500" />
              </div>

              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Sorry, this menu doesn&apos;t exist or may have been removed. The
                restaurant might have updated their offerings.
              </p>

              {/* {restaurantId && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 max-w-md mx-auto">
                  <Store className="w-4 h-4" />
                  <span>
                    Restaurant ID:{' '}
                    <code className="font-mono">{restaurantId}</code>
                  </span>
                </div>
              )} */}
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6 justify-center">
              {restaurantId ? (
                <Button asChild size="sm" className="h-12 font-semibold">
                  <Link
                    href={`/restaurants/${restaurantId}`}
                    className="flex items-center gap-2"
                  >
                    <Store className="w-5 h-5" />
                    View Restaurant
                  </Link>
                </Button>
              ) : (
                <Button asChild size="sm" className="h-12 font-semibold">
                  <Link href="/restaurants" className="flex items-center gap-2">
                    <Store className="w-5 h-5" />
                    All Restaurants
                  </Link>
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleGoBack}
                className="h-12 font-semibold"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Go Back
              </Button>

              <Button
                variant="outline"
                size="sm"
                asChild
                className="h-12 font-semibold"
              >
                <Link href="/" className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Home
                </Link>
              </Button>
            </div>

            {/* Helpful Suggestions */}
            <div className="pt-8 border-t border-border/50 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
                  <ChefHat className="w-5 h-5 text-orange-500" />
                  What you can do instead
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-muted/30 rounded-lg p-4 text-left">
                    <h4 className="font-semibold mb-2">Check the URL</h4>
                    <p className="text-muted-foreground">
                      Make sure the restaurant and menu IDs are correct in the
                      URL
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 text-left">
                    <h4 className="font-semibold mb-2">
                      Browse Available Menus
                    </h4>
                    <p className="text-muted-foreground">
                      Visit the restaurant page to see all available menus
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Refresh Option */}
            <div className="pt-4 border-t border-border/30">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.reload()}
                className="text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-1">
          <p className="text-sm text-muted-foreground/80">
            Menu ID not found • Restaurant may have updated their offerings
          </p>
          <p className="text-xs text-muted-foreground/60 font-mono">
            ERROR_404_MENU_NOT_FOUND
          </p>
        </div>
      </div>
    </div>
  );
}
