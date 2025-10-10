'use client';
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ReviewsStats } from './ReviewsStats';
import { ReviewsList } from './ReviewsList';
import { useReviews } from '@/hooks/query/useReviews';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReviewsPopupProps {
  entityId: string;
  entityType: string;
  restaurantId: string;
  averageRating: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewsPopup: React.FC<ReviewsPopupProps> = ({
  entityId,
  entityType,
  restaurantId,
  averageRating,
  isOpen,
  onClose,
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const {
    reviews,
    isLoading,
    error,
    approveReview,
    isApproving,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useReviews({
    entityId,
    entityType,
    isOpen,
  });

  const Content = (
    <div className="space-y-6">
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-white/60 rounded-lg"></div>
          <div className="h-32 bg-white/60 rounded-lg"></div>
          <div className="h-32 bg-white/60 rounded-lg"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 py-8">
          Greška pri učitavanju recenzija. Molimo pokušajte ponovo.
        </div>
      ) : (
        <>
          <ReviewsStats
            totalReviews={reviews?.length || 0}
            averageRating={averageRating}
          />

          <ReviewsList
            reviews={reviews}
            restaurantId={restaurantId}
            entity="product"
            onApproveReview={approveReview}
            isApproving={isApproving}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        </>
      )}
    </div>
  );

  // Desktop - Dialog
  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl bg-clip-text">
              Recenzije Proizvoda
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">{Content}</div>
        </DialogContent>
      </Dialog>
    );
  }

  // Mobile - Full Screen sa animacijom odozdo
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/80 animate-in fade-in-0 duration-200"
        onClick={onClose}
      />

      {/* Content Panel */}
      <div className="fixed inset-x-0 bottom-0 top-0 z-50 bg-background animate-in slide-in-from-bottom duration-450">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-semibold">Recenzije Proizvoda</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-64px)] p-4">{Content}</div>
      </div>
    </>
  );
};
