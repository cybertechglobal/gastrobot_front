import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function RestaurantSkeleton() {
  return (
    <div className="w-full p-3 sm:p-7 space-y-8">
      {/* Restaurant Header */}
      <div className="flex items-start gap-4 mb-8">
        {/* Restaurant Icon */}
        <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />

        <div className="flex-1 space-y-3">
          {/* Restaurant Name */}
          <div className="flex items-center gap-2">
            <Skeleton className="w-3 h-3 rounded-full" /> {/* Green dot */}
            <Skeleton className="h-8 w-80" />
          </div>

          {/* Location */}
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4" /> {/* Location icon */}
            <Skeleton className="h-4 w-48" />
          </div>

          {/* Description */}
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Action Button */}
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>

      {/* Management Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1 - Osnovni podaci */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center gap-2 pt-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="w-4 h-4" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2 - Proizvodi */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center gap-2 pt-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="w-4 h-4" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3 - Jelovnik */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center gap-2 pt-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="w-4 h-4" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4 - Korisnici */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center gap-2 pt-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="w-4 h-4" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 5 - Podešavanja */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center gap-2 pt-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="w-4 h-4" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Extra card for better grid layout */}
        <Card className="bg-card/50 border-border/50 md:col-span-2 lg:col-span-1">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center gap-2 pt-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="w-4 h-4" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
