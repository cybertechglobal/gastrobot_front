// components/ReservationDetailOverlay.tsx
'use client';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
  Users,
  Calendar,
  Home,
  TreePine,
  MessageSquare,
  Loader2,
  UtensilsCrossed,
} from 'lucide-react';
import { Reservation } from '@/types/reservation';
import { Region } from '@/types/region';
import { formatTime, formatTimeInParts } from '@/lib/utils/utils';
import { getStatusBadge } from '@/lib/utils/getStatusBadge';
import { getUrgencyIndicator } from '@/lib/utils/getUrgencyIndicator';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface ReservationDetailOverlayProps {
  reservation: Reservation | null;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  canEdit: boolean;
  adminNote?: string;
  onAdminNoteChange?: (note: string) => void;
  onConfirmReservation?: () => void;
  onRejectReservation?: () => void;
  isUpdating?: boolean;
  onOpenOrder?: (orderId: string) => void;
}

const ReservationDetailOverlay: React.FC<ReservationDetailOverlayProps> = ({
  reservation,
  isOpen,
  isLoading,
  error,
  onClose,
  canEdit,
  adminNote = '',
  onAdminNoteChange,
  onConfirmReservation,
  onRejectReservation,
  isUpdating = false,
  onOpenOrder,
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const getLocationIcon = (location: string) => {
    return location === 'outside' ? (
      <TreePine className="w-4 h-4 text-muted-foreground" />
    ) : (
      <Home className="w-4 h-4 text-muted-foreground" />
    );
  };

  const getLocationText = (region: Region) => {
    return `${region.title}`;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Učitavanje rezervacije...</p>
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

    if (!reservation) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Rezervacija nije pronađena</p>
            <Button onClick={onClose} variant="outline" size="sm">
              Zatvori
            </Button>
          </div>
        </div>
      );
    }

    const { full } = formatTimeInParts(reservation.reservationStart);
    const isPending = reservation.status === 'pending';

    return (
      <div className="space-y-6 px-3 pb-6">
        {/* Header with urgency indicator */}
        <div className="relative">
          {isPending && getUrgencyIndicator(reservation.createdAt)}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {reservation.user.firstname} {reservation.user.lastname}
                </h2>
                <Badge variant="secondary" className="text-sm font-mono mt-1">
                  #{reservation.reservationNumber}
                </Badge>
              </div>
              {getStatusBadge(reservation.status)}
            </div>

            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-1" />
              Zahtev poslat: {formatTime(new Date(reservation.createdAt))}
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <Label className="text-sm font-medium">Informacije o gostu:</Label>
          <div className="space-y-1">
            <div className="font-medium">
              {reservation.user.firstname} {reservation.user.lastname}
            </div>
            <div className="text-sm text-muted-foreground flex items-center">
              <span className="w-4 text-center mr-2">@</span>
              {reservation.user.email}
            </div>
            {reservation.user.phoneNumber && (
              <div className="text-sm text-muted-foreground flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                {reservation.user.phoneNumber}
              </div>
            )}
          </div>
        </div>

        {/* Reservation Details */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-3">
          <Label className="text-sm font-medium">Detalji rezervacije:</Label>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Datum i vreme:
              </span>
              <span className="font-medium">{full}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Broj osoba:
              </span>
              <span className="font-medium">{reservation.peopleCount}</span>
            </div>
            {reservation.region && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center">
                  {getLocationIcon(reservation.region?.area)}
                  <span className="ml-2">Lokacija:</span>
                </span>
                <span className="font-medium">
                  {getLocationText(reservation.region)}
                </span>
              </div>
            )}
            {reservation.assignedTableName && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Dodeljen sto:
                </span>
                <Badge variant="outline" className="font-medium">
                  Sto {reservation.assignedTableName}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Special Requests */}
        {reservation.additionalInfo && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <Label className="text-sm font-medium mb-2 block">
              Posebni zahtevi:
            </Label>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {reservation.additionalInfo}
            </p>
          </div>
        )}

        {/* Admin Messages (for processed reservations) */}
        {(reservation.confirmedMessage || reservation.rejectionReason) && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <Label className="text-sm font-medium mb-2 flex items-center">
              <MessageSquare className="w-4 h-4 mr-1" />
              {canEdit ? 'Vaša napomena:' : 'Manager napomena:'}
            </Label>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {reservation.confirmedMessage || reservation.rejectionReason}
            </p>
          </div>
        )}

        {/* Order Information */}
        {reservation.order && onOpenOrder && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center text-blue-900 dark:text-blue-100">
                <UtensilsCrossed className="w-4 h-4 mr-2" />
                Rezervacija sadrži narudžbinu
              </Label>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Gost je unapred naručio hranu za ovu rezervaciju.
              </p>
              {isPending && (
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-700 p-3 rounded-md">
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Kada potvrdite rezervaciju, narudžbina će automatski biti
                    potvrđena.
                  </p>
                </div>
              )}
              <Button
                onClick={() => onOpenOrder(reservation.order!.id)}
                variant="outline"
                size="sm"
                className="w-full border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30"
              >
                Prikaži naručene proizvode
              </Button>
            </div>
          </div>
        )}

        {/* Admin Note Input - Only for pending reservations and managers */}
        {canEdit && isPending && onAdminNoteChange && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Poruka za gosta (opciono):
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

        {/* Action Buttons - Only for pending reservations and managers */}
        {canEdit &&
          isPending &&
          onConfirmReservation &&
          onRejectReservation && (
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={onConfirmReservation}
                disabled={isUpdating}
                className="flex-1"
                size="lg"
              >
                {isUpdating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Potvrdi
              </Button>
              <Button
                onClick={onRejectReservation}
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
            <SheetTitle>Detalji rezervacije</SheetTitle>
            <SheetDescription>
              Pregled i upravljanje rezervacijom
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
          <DrawerTitle>Detalji rezervacije</DrawerTitle>
          <DrawerDescription>
            Pregled i upravljanje rezervacijom
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 overflow-y-auto">{renderContent()}</div>
      </DrawerContent>
    </Drawer>
  );
};

export default ReservationDetailOverlay;
