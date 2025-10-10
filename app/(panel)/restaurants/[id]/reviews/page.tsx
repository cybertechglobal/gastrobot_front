'use client';

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useReviews } from '@/hooks/query/useReviews';
import { ReviewsStats } from '@/components/reviews/ReviewsStats';
import { ReviewsList } from '@/components/reviews/ReviewsList';
import { useParams } from 'next/navigation';
import { useRestaurant } from '@/hooks/query/useRestaurant';

const ReviewsPage = () => {
  const params = useParams();
  const restaurantId = params.id as string;

  const {
    reviews,
    totalCount,
    isLoading,
    error,
    approveReview,
    isApproving,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useReviews({
    entityId: restaurantId,
    entityType: 'restaurant',
  });

  const { data, isLoading: isLoadingRestaurant } = useRestaurant({
    restaurantId,
    enabled: !!restaurantId,
  });

  const averageRating = data?.reviewable?.averageRating || 0.0;

  if (isLoading || isLoadingRestaurant) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-white/60 rounded-lg"></div>
            <div className="h-48 bg-white/60 rounded-lg"></div>
            <div className="h-48 bg-white/60 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>
              Greška pri učitavanju recenzija. Molimo pokušajte ponovo.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl bg-clip-text">{data?.name} - Recenzije</h1>
        </div>

        {/* Statistika */}
        <ReviewsStats totalReviews={totalCount} averageRating={averageRating} />

        {/* Lista recenzija */}
        <ReviewsList
          reviews={reviews}
          restaurantId={restaurantId}
          entity="restaurant"
          onApproveReview={approveReview}
          isApproving={isApproving}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      </div>
    </div>
  );
};

export default ReviewsPage;
