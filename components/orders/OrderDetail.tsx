// components/OrderDetail.tsx
'use client';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Check,
  X,
  Clock,
  Phone,
  RefreshCw,
  UtensilsCrossed,
  MessageSquare,
  Loader2,
  Calendar,
} from 'lucide-react';
import { Order, OrderItem } from '@/types/order';
import { formatTimeInParts } from '@/lib/utils/utils';
import { getStatusBadge } from '@/lib/utils/getStatusBadge';
import { getUrgencyIndicator } from '@/lib/utils/getUrgencyIndicator';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface OrderDetailProps {
  order: Order | null;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  canEdit: boolean;
  adminNote?: string;
  onAdminNoteChange?: (note: string) => void;
  onConfirmOrder?: () => void;
  onRejectOrder?: () => void;
  isUpdating?: boolean;
}

const OrderDetail: React.FC<OrderDetailProps> = ({
  order,
  isOpen,
  isLoading,
  error,
  onClose,
  canEdit,
  adminNote = '',
  onAdminNoteChange,
  onConfirmOrder,
  onRejectOrder,
  isUpdating = false,
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const countTotalSum = (items: OrderItem[]) => {
    if (!items || !items.length) return 0;
    return items.reduce((acc, item) => {
      return acc + item.quantity * (item.menuItem?.price ?? 0);
    }, 0);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Učitavanje porudžbine...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
              <X className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h3 className="font-medium">Greška pri učitavanju</h3>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
            <Button onClick={onClose} variant="outline" size="sm">
              Zatvori
            </Button>
          </div>
        </div>
      );
    }

    if (!order) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Porudžbina nije pronađena</p>
            <Button onClick={onClose} variant="outline" size="sm">
              Zatvori
            </Button>
          </div>
        </div>
      );
    }

    const { dayPart, timePart } = formatTimeInParts(order.createdAt);
    const isPending = order.status === 'pending';

    return (
      <div className="space-y-6 pb-6 px-3">
        {/* Header with urgency indicator */}
        <div className="relative">
          {isPending && getUrgencyIndicator(order.createdAt)}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                {order.reservation ? (
                  <>
                    <h2 className="text-xl font-semibold flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Porudžbina za rezervaciju
                    </h2>
                    <Badge
                      variant="secondary"
                      className="text-sm font-mono mt-1"
                    >
                      #{order.reservation.reservationNumber}
                    </Badge>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold flex items-center">
                      <UtensilsCrossed className="w-5 h-5 mr-2" />
                      Sto {order.tableNum}
                    </h2>
                    <Badge
                      variant="secondary"
                      className="text-sm font-mono mt-1"
                    >
                      #{order.orderNumber}
                    </Badge>
                  </>
                )}
              </div>
              {getStatusBadge(order.status)}
            </div>

            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-1" />
              Poručeno: {dayPart} u {timePart}
            </div>
          </div>
        </div>

        {/* Reservation Info Banner */}
        {order.reservation && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Ova porudžbina je vezana za rezervaciju{' '}
              <span className="font-semibold">
                #{order.reservation.reservationNumber}
              </span>
              . Status će se automatski promeniti kada se rezervacija potvrdi
              ili odbije.
            </p>
          </div>
        )}

        {/* Customer Info */}
        {order.user && (
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <Label className="text-sm font-medium">Informacije o gostu:</Label>
            <div className="space-y-1">
              <div className="font-medium">
                {order.user.firstname} {order.user.lastname}
              </div>
              <div className="text-sm text-muted-foreground flex items-center">
                <span className="w-4 text-center mr-2">@</span>
                {order.user.email}
              </div>
              {order.user.phoneNumber && (
                <div className="text-sm text-muted-foreground flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {order.user.phoneNumber}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-3">
          <Label className="text-sm font-medium">Stavke porudžbine:</Label>
          <div className="space-y-2">
            {order.orderItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <span className="text-sm">
                  {item.quantity}x {item.menuItem?.product?.name}
                </span>
                <span className="text-sm font-medium">
                  {item.menuItem.price} RSD
                </span>
              </div>
            ))}
            <Separator className="my-3" />
            <div className="flex justify-between items-center font-medium text-lg">
              <span>Ukupno:</span>
              <span>{countTotalSum(order.orderItems)} RSD</span>
            </div>
          </div>
        </div>

        {/* Special Requests */}
        {order.note && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <Label className="text-sm font-medium mb-2 block">
              Posebni zahtevi:
            </Label>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {order.note}
            </p>
          </div>
        )}

        {/* Rejection Note (for processed orders) */}
        {order.rejectionNote && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <Label className="text-sm font-medium mb-2 flex items-center">
              <MessageSquare className="w-4 h-4 mr-1" />
              {canEdit ? 'Vaša napomena:' : 'Manager napomena:'}
            </Label>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {order.rejectionNote}
            </p>
          </div>
        )}

        {/* Admin Note Input - Only for pending orders and managers */}
        {canEdit && isPending && onAdminNoteChange && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Poruka za gosta ukoliko se zahtev odbija (opciono):
            </Label>
            <Textarea
              value={adminNote}
              onChange={(e) => onAdminNoteChange(e.target.value)}
              placeholder="Dodaj poruku koja će biti poslata gostu..."
              rows={3}
              className="resize-none"
            />
          </div>
        )}

        {/* Action Buttons - Only for pending orders and managers */}
        {canEdit && isPending && onConfirmOrder && onRejectOrder && (
          <div className="flex space-x-3 pt-4">
            <Button
              onClick={onConfirmOrder}
              disabled={isUpdating}
              className="flex-1"
              size="lg"
            >
              {isUpdating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Prihvati
            </Button>
            <Button
              onClick={onRejectOrder}
              disabled={isUpdating}
              variant="destructive"
              className="flex-1"
              size="lg"
            >
              {isUpdating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              Odbij
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (isDesktop) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-[500px] overflow-y-auto">
          <SheetHeader className="pb-6">
            <SheetTitle>Detalji porudžbine</SheetTitle>
            <SheetDescription>
              Pregled i upravljanje porudžbinom
            </SheetDescription>
          </SheetHeader>
          {renderContent()}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="pb-6">
          <DrawerTitle>Detalji porudžbine</DrawerTitle>
          <DrawerDescription>
            Pregled i upravljanje porudžbinom
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 overflow-y-auto">{renderContent()}</div>
      </DrawerContent>
    </Drawer>
  );
};

export default OrderDetail;
