import React, { useState } from 'react';
import { ReviewsPopup } from './ReviewsPopup';

interface ReviewsPopupTriggerProps {
  entityId: string;
  entityType: string;
  restaurantId: string;
  averageRating: number;
  children: React.ReactNode;
}

export const ReviewsPopupTrigger: React.FC<ReviewsPopupTriggerProps> = ({
  entityId,
  entityType,
  restaurantId,
  averageRating,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex cursor-pointer" onClick={() => setIsOpen(true)}>
        {children}
      </div>

      <ReviewsPopup
        entityId={entityId}
        entityType={entityType}
        restaurantId={restaurantId}
        averageRating={averageRating}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};
