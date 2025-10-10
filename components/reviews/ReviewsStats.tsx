import React from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ReviewsStatsProps {
  totalReviews: number;
  averageRating: number;
}

export const ReviewsStats: React.FC<ReviewsStatsProps> = ({
  totalReviews,
  averageRating,
}) => {
  return (
    <Card className="border-0 shadow-xl">
      <CardContent className="pt-1">
        <div className="flex items-center justify-around">
          <div className="text-center">
            <div className="text-4xl text-primary font-bold mb-1">{totalReviews}</div>
            <div className="text-sm">Ukupno recenzija</div>
          </div>
          <div className="h-12 w-px bg-primary/40"></div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
              <span className="text-4xl text-primary font-bold">{averageRating}</span>
            </div>
            <div className="text-sm">Prosečna ocena</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
