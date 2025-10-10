import React, { useState } from 'react';
import { Star, Trash, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { srLatn } from 'date-fns/locale';
import { DeleteDialog } from '../DeleteDialog';
import { deleteReview } from '@/lib/api/reviews';
import { useQueryClient } from '@tanstack/react-query';
import { Review } from '@/types/review';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/types/user';
import { cn } from '@/lib/utils/utils';

interface ReviewCardProps {
  review: Review;
  restaurantId?: string;
  entity?: string;
  onApprove?: (reviewId: string) => void;
  isApproving?: boolean;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  restaurantId,
  entity = 'all',
  onApprove,
  isApproving = false,
}) => {
  const queryClient = useQueryClient();
  const session = useSession();
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);

  const role: UserRole = session?.data?.user?.restaurantUsers[0]?.role;
  const isRoot = role === 'root';

  const formatDate = (dateString: string) => {
    return format(dateString, 'dd.MM.yyyy.', { locale: srLatn });
  };

  const handleApprove = () => {
    if (onApprove) {
      onApprove(review.id);
      setIsApproveDialogOpen(false);
    }
  };

  const getDisplayName = () => {
    const { restaurant, product } = review?.reviewable || {};

    return product?.name
      ? `${restaurant?.name}: ${product.name}`
      : restaurant?.name;
  };

  return (
    <Card
      className={cn(
        'hover:shadow-md shadow-none gap-3 py-[20px] min-h-[165px] transition-all duration-300 relative overflow-hidden border-[#bbb]',
        isRoot
          ? review.approved
            ? 'border-l-2 border-l-emerald-400'
            : 'border-l-2'
          : 'border-l-2'
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-[18px] font-[500] text-gray-900 mb-1">
              {getDisplayName()}
            </h3>

            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
              <span className="text-sm font-semibold text-gray-700 ml-1">
                {review.rating}/5
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {formatDate(review.createdAt)}
            </span>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              {/* Approve Button */}
              {isRoot && !review.approved && onApprove && (
                <AlertDialog
                  open={isApproveDialogOpen}
                  onOpenChange={setIsApproveDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isApproving}
                      className="transition-opacity hover:bg-green-50 hover:text-green-600"
                      title="Odobri recenziju"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Odobravanje recenzije</AlertDialogTitle>
                      <AlertDialogDescription>
                        Da li ste sigurni da želite da odobrite ovu recenziju?
                        Nakon odobrenja, recenzija će biti vidljiva svim
                        korisnicima.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Otkaži</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleApprove}
                        disabled={isApproving}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isApproving ? 'Odobravanje...' : 'Odobri'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {isRoot && review.approved && (
                <div className="w-[36px] h-[36px] flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              )}

              {/* Delete Button */}
              {isRoot && (
                <DeleteDialog
                  trigger={
                    <Button
                      className="transition-opacity hover:bg-red-50 hover:text-red-400"
                      variant="ghost"
                      size="icon"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  }
                  description="Ova akcija je nepovratna. Recenzija će biti trajno obrisana iz sistema."
                  successMessage="Recenzija je uspešno obrisana"
                  errorMessage="Greška prilikom brisanja recenzije"
                  mutationOptions={{
                    mutationFn: () => deleteReview(review.id),
                    onSuccess: () => {
                      queryClient.invalidateQueries({
                        queryKey: ['reviews'],
                      });

                      switch (entity) {
                        case 'restaurant':
                          queryClient.invalidateQueries({
                            queryKey: ['restaurants', restaurantId],
                          });
                          break;
                        case 'product':
                          queryClient.invalidateQueries({
                            queryKey: ['products'],
                          });
                          break;
                        default:
                          break;
                      }
                    },
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-gray-700 leading-relaxed text-base">
          {review.comment}
        </p>
        {/* Status Badge */}
        {/* {isRoot && (
          <div className="mb-2">
            {review.approved ? (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Odobreno
              </Badge>
            ) : (
              <Badge variant="secondary">Na čekanju</Badge>
            )}
          </div>
        )} */}
      </CardContent>
    </Card>
  );
};
