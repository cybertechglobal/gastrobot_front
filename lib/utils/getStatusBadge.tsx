import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '@/types/order';
import { ReservationStatus } from '@/types/reservation';
import { JSX } from 'react';

export const getStatusBadge = (
  status: OrderStatus | ReservationStatus
): JSX.Element => {
  const badgeMap = {
    pending: (
      <Badge className="bg-gray-900 text-white font-medium">Na čekanju</Badge>
    ),
    confirmed: (
      <Badge className="bg-green-100 text-green-900 font-medium border border-green-300">
        Prihvaćeno
      </Badge>
    ),
    rejected: (
      <Badge variant="destructive" className="font-medium">
        Odbijeno
      </Badge>
    ),
  };
  return badgeMap[status] || <Badge variant="outline">Nepoznato</Badge>;
};
