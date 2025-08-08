'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store, Plus, Search, Filter, MapPin, Utensils } from 'lucide-react';

interface EmptyRestaurantsStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
  onAddRestaurant?: () => void;
}

export default function EmptyRestaurantsState({
  hasFilters = false,
  onAddRestaurant,
}: EmptyRestaurantsStateProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <Card className="bg-transparent border-0 w-full max-w-md">
          <CardContent className="p-8 text-center space-y-6">
            {/* Search Icon with Filter */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full animate-pulse" />
              <Search className="w-10 h-10 text-primary relative z-10" />
              <div className="absolute -top-1 -right-1">
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  <Filter className="w-3 h-3" />
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Nema rezultata</h3>
              <p className="text-muted-foreground leading-relaxed">
                Nema restorana koji odgovaraju vašim kriterijumima pretrage.
                Pokušajte sa drugačijim filterima.
              </p>
            </div>

            {/* Action Buttons */}
            {/* <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={onClearFilters}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Ukloni filtere
              </Button>

              <Button
                onClick={handleRefresh}
                variant="ghost"
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                Osveži
              </Button>
            </div> */}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-full max-w-2xl text-center space-y-8">
        {/* Animated Illustration */}
        <div className="relative mx-auto w-32 h-32">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full animate-pulse" />
          <div className="absolute inset-4 bg-gradient-to-br from-orange-200 to-red-200 dark:from-orange-800/40 dark:to-red-800/40 rounded-full animate-pulse animation-delay-300" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Store className="w-16 h-16 text-orange-600 dark:text-orange-400" />
          </div>

          {/* Floating elements */}
          <div className="absolute -top-2 -right-2 animate-bounce animation-delay-700">
            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
              <Utensils className="w-3 h-3 text-primary" />
            </div>
          </div>
          <div className="absolute -bottom-2 -left-2 animate-bounce animation-delay-1000">
            <div className="w-6 h-6 bg-secondary/20 rounded-full flex items-center justify-center">
              <MapPin className="w-3 h-3 text-secondary" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">
            Još uvek nema restorana
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Počnite upravljanje vašim restoranima dodavanjem prvog restorana u
            sistem.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
          <Button
            onClick={onAddRestaurant}
            size="lg"
            className="h-12 px-8 font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Dodaj prvi restoran
          </Button>
        </div>
      </div>
    </div>
  );
}
