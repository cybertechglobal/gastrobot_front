'use client';

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useReviews } from '@/hooks/query/useReviews';
import { ReviewsList } from '@/components/reviews/ReviewsList';

const ReviewsPage = () => {
  const {
    reviews,
    isLoading,
    error,
    approveReview,
    isApproving,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useReviews({ entityType: 'all' });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-primary/20 rounded-lg"></div>
            <div className="h-40 bg-primary/20 rounded-lg"></div>
            <div className="h-40 bg-primary/20 rounded-lg"></div>
            <div className="h-40 bg-primary/20 rounded-lg"></div>
            <div className="h-40 bg-primary/20 rounded-lg"></div>
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
          <h1 className="text-3xl bg-clip-text">Upravljanje recenzijama</h1>
        </div>

        {/* Lista recenzija */}
        <ReviewsList
          reviews={reviews}
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
