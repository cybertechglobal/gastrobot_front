import React, { useEffect, useRef } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReviewCard } from './ReviewCard';
import { Review } from '@/types/review';

interface ReviewsListProps {
  reviews: Review[];
  restaurantId?: string;
  entity?: string;
  onApproveReview?: (reviewId: string) => void;
  isApproving?: boolean;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({
  reviews,
  restaurantId = undefined,
  entity = undefined,
  onApproveReview,
  isApproving = false,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}) => {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fetchNextPage || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (reviews.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Još uvek nema recenzija.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          restaurantId={restaurantId}
          entity={entity}
          onApprove={onApproveReview}
          isApproving={isApproving}
        />
      ))}

      {/* Infinite Scroll Trigger */}
      {fetchNextPage && (
        <>
          <div
            ref={observerTarget}
            className="h-10 flex items-center justify-center"
          >
            {isFetchingNextPage && (
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            )}
          </div>

          {/* Manual Load More Button (backup) */}
          {hasNextPage && !isFetchingNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => fetchNextPage()}
                variant="outline"
                className="w-full max-w-xs"
              >
                Učitaj još recenzija
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
