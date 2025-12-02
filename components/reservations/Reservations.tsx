'use client';
import React from 'react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Check,
  X,
  Clock,
  Users,
  Calendar,
  Search,
  Home,
  TreePine,
  MessageSquare,
  RefreshCw,
  Phone,
  UtensilsCrossed,
} from 'lucide-react';
import { Reservation } from '@/types/reservation';
import FilterForm from './FilterForm';
import { useReservationManagement } from './useReservationManagement';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/types/user';
import { formatTime, formatTimeInParts } from '@/lib/utils/utils';
import { getStatusBadge } from '@/lib/utils/getStatusBadge';
import { getUrgencyIndicator } from '@/lib/utils/getUrgencyIndicator';
import { Region } from '@/types/region';
import { useReservationDetail } from '@/hooks/useReservationDetails';
import ReservationDetailOverlay from './ReservationDetail';
import { useOrderDetail } from '@/hooks/useOrderDetail';
import OrderDetail from '@/components/orders/OrderDetail';

// Skeleton component for processed reservations
const ProcessedReservationSkeleton = () => (
  <Card className="animate-pulse">
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ReservationDashboard = ({ restaurantId }: { restaurantId?: string }) => {
  const session = useSession();

  const role: UserRole = session?.data?.user?.restaurantUsers[0]?.role;

  const {
    pendingReservations,
    processedReservations,
    stats,
    filters,
    adminNotes,
    isLoading,
    isProcessedLoading,
    error,
    isUpdating,
    handleFiltersChange,
    handleConfirmReservation,
    handleRejectReservation,
    handleAdminNoteChange,
    refetchReservations,
    canEdit,
  } = useReservationManagement({ role, resId: restaurantId });

  const {
    selectedReservation,
    isOpen: isOverlayOpen,
    isLoading: isReservationLoading,
    error: reservationError,
    openReservation,
    closeReservation,
  } = useReservationDetail({
    resId: restaurantId,
  });

  const {
    selectedOrder,
    isOpen: isOrderOverlayOpen,
    isLoading: isOrderLoading,
    error: orderError,
    openOrder,
    closeOrder,
  } = useOrderDetail({
    resId: restaurantId,
  });

  const [overlayAdminNote, setOverlayAdminNote] = useState('');

  const getLocationIcon = (location: string) => {
    return location === 'outside' ? (
      <TreePine className="w-4 h-4 text-muted-foreground" />
    ) : (
      <Home className="w-4 h-4 text-muted-foreground" />
    );
  };

  const getLocationText = (region: Region) => {
    // const area = region.area === 'outside' ? 'Napolju' : 'Unutra';

    return `${region.title}`;
  };

  const handleOverlayConfirmReservation = async () => {
    if (selectedReservation) {
      await handleConfirmReservation(selectedReservation.id);
      closeReservation();
    }
  };

  const handleOverlayRejectReservation = async () => {
    if (selectedReservation) {
      await handleRejectReservation(selectedReservation.id);
      closeReservation();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Učitavanje rezervacija...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
              <X className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle className="text-lg">Greška pri učitavanju</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">{error.message}</p>
          </CardContent>
          <CardFooter className="justify-center">
            <Button onClick={refetchReservations} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Pokušaj ponovo
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const roleInfo = {
    title: 'Lista Rezervacija',
    subtitle: canEdit
      ? 'Upravljaj rezervacijama iz restorana'
      : 'Pregled rezervacija iz restorana',
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {roleInfo.title}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {roleInfo.subtitle}
                </p>
              </div>
            </div>

            {/* Notifications */}
            {/* <Button
              variant="outline"
              onClick={clearNotifications}
              className="relative"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifikacije
              {notifications.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {notifications.length}
                </Badge>
              )}
            </Button> */}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 py-5">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary dark:text-white">
                {stats.totalReservations}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Ukupno rezervacija
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary dark:text-white">
                {stats.totalPending}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Na čekanju
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary dark:text-white">
                {stats.totalConfirmed}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Potvrđeno
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Alert */}
        {/* {notifications.length > 0 && (
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertDescription>
              {notifications[notifications.length - 1]}
            </AlertDescription>
          </Alert>
        )} */}

        {/* Pending Reservations */}
        {pendingReservations.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold tracking-tight">
                Na čekanju ({pendingReservations.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {pendingReservations.map((reservation: Reservation) => {
                const { full } = formatTimeInParts(
                  reservation.reservationStart
                );

                return (
                  <Card
                    key={reservation.id}
                    onClick={() => openReservation(reservation.id)}
                    className="relative cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                  >
                    {getUrgencyIndicator(reservation.createdAt)}

                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">
                            {reservation.user.firstname}{' '}
                            {reservation.user.lastname}
                          </CardTitle>
                          <Badge
                            variant="secondary"
                            className="text-sm font-mono"
                          >
                            #{reservation.reservationNumber}
                          </Badge>
                        </div>
                        {getStatusBadge(reservation.status)}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatTime(new Date(reservation.createdAt))}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Contact Info */}
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <span className="w-4 text-center mr-2">@</span>
                          {reservation.user.email}
                        </div>
                        {reservation.user.phoneNumber && (
                          <div className="flex items-center mt-2">
                            <Phone size="14" />
                            {reservation.user.phoneNumber}
                          </div>
                        )}
                      </div>

                      {/* Reservation Details */}
                      <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Datum:
                          </span>
                          <span className="font-medium">{full}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Osoba:
                          </span>
                          <span className="font-medium flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {reservation.peopleCount}
                          </span>
                        </div>
                        {reservation.region && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              Mesto:
                            </span>
                            <span className="font-medium flex items-center">
                              {getLocationIcon(reservation.region?.area)}
                              <span className="ml-1">
                                {getLocationText(reservation.region)}
                              </span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Special Requests */}
                      {reservation.additionalInfo && (
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <Label className="text-sm font-medium mb-1 block">
                            Posebni zahtevi:
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {reservation.additionalInfo}
                          </p>
                        </div>
                      )}

                      {/* Order Information */}
                      {reservation.order && (
                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium flex items-center text-blue-900 dark:text-blue-100">
                              <UtensilsCrossed className="w-4 h-4 mr-1" />
                              Rezervacija sadrži narudžbinu
                            </Label>
                          </div>
                          <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                            Gost je unapred naručio hranu za ovu rezervaciju.
                          </p>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              openOrder(reservation.order!.id);
                            }}
                            variant="outline"
                            size="sm"
                            className="w-full text-xs border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                          >
                            Prikaži naručene proizvode
                          </Button>
                        </div>
                      )}

                      {/* Admin Note Input - Only for managers */}
                      {canEdit && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Poruka za gosta (opciono):
                          </Label>
                          <Textarea
                            value={adminNotes[reservation.id] || ''}
                            onChange={(e) =>
                              handleAdminNoteChange(
                                reservation.id,
                                e.target.value
                              )
                            }
                            placeholder="Dodaj poruku koja će biti poslata gostu..."
                            rows={2}
                            className="resize-none"
                          />
                        </div>
                      )}
                    </CardContent>

                    {canEdit && (
                      <CardFooter className="flex flex-col space-y-3 pt-4">
                        {reservation.order && (
                          <div className="w-full bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3 rounded-lg text-center">
                            <p className="text-xs text-green-700 dark:text-green-300">
                              Kada potvrdite rezervaciju, narudžbina će
                              automatski biti potvrđena.
                            </p>
                          </div>
                        )}
                        <div className="flex space-x-3 w-full">
                          <Button
                            onClick={() =>
                              handleConfirmReservation(reservation.id)
                            }
                            disabled={isUpdating}
                            className="flex-1"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Potvrdi
                          </Button>
                          <Button
                            onClick={() =>
                              handleRejectReservation(reservation.id)
                            }
                            disabled={isUpdating}
                            variant="destructive"
                            className="flex-1"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Odbij
                          </Button>
                        </div>
                      </CardFooter>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Processed Reservations */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold tracking-tight">
                Obrađene rezervacije ({processedReservations.length})
              </h2>
              <span className="text-sm text-muted-foreground">
                (danas + sutra)
              </span>
            </div>
          </div>

          {/* Filters */}
          <FilterForm
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
          />

          {/* Results Summary */}
          {!isProcessedLoading && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Pronađeno {processedReservations.length} rezervacija</span>
            </div>
          )}

          {/* Processed Reservations List or Skeleton */}
          <div className="space-y-4">
            {isProcessedLoading
              ? // Show skeleton loaders while loading
                [...Array(3)].map((_, index) => (
                  <ProcessedReservationSkeleton key={`skeleton-${index}`} />
                ))
              : // Show actual processed reservations
                processedReservations.map((reservation: Reservation) => {
                  const { dayPart, timePart } = formatTimeInParts(
                    reservation.reservationStart
                  );

                  return (
                    <Card
                      key={reservation.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => openReservation(reservation.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-4">
                            <div>
                              <h3 className="text-lg font-semibold">
                                {reservation.user.firstname}{' '}
                                {reservation.user.lastname}
                              </h3>
                              <Badge
                                variant="secondary"
                                className="text-sm font-mono"
                              >
                                #{reservation.reservationNumber}
                              </Badge>
                              <div className="flex items-center mt-1">
                                <span className="text-sm text-muted-foreground flex items-center">
                                  <span className="w-4 mr-1 text-center">
                                    @
                                  </span>
                                  {reservation.user.email}
                                </span>
                              </div>
                              {reservation.user.phoneNumber && (
                                <div className="flex items-center mt-2">
                                  <Phone size="14" />
                                  {reservation.user.phoneNumber}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {reservation.assignedTableName && (
                              <Badge variant="outline" className="text-sm">
                                Sto {reservation.assignedTableName}
                              </Badge>
                            )}
                            {getStatusBadge(reservation.status)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                          {/* Date & Time */}
                          <div className="flex items-center space-x-3">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{dayPart}</div>
                              <div className="text-sm text-muted-foreground flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {timePart}
                              </div>
                            </div>
                          </div>

                          {/* People */}
                          <div className="flex items-center space-x-3">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {reservation.peopleCount} osoba
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Gosti
                              </div>
                            </div>
                          </div>

                          {/* Location */}
                          {reservation.region && (
                            <div className="flex items-center space-x-3">
                              {getLocationIcon(reservation.region?.area)}
                              <div>
                                <div className="font-medium">
                                  {getLocationText(reservation.region)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Lokacija
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Status time */}
                          <div className="flex items-center space-x-3">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {new Date(
                                  reservation.createdAt
                                ).toLocaleTimeString('sr-RS', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Zahtev poslat
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Special Requests & Admin Note */}
                        {(reservation.additionalInfo ||
                          reservation.confirmedMessage ||
                          reservation.rejectionReason ||
                          reservation.order) && (
                          <>
                            <Separator className="my-4" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {reservation.additionalInfo && (
                                <div className="bg-muted/50 p-3 rounded-lg">
                                  <Label className="text-sm font-medium mb-1 block">
                                    Posebni zahtevi:
                                  </Label>
                                  <p className="text-sm text-muted-foreground">
                                    {reservation.additionalInfo}
                                  </p>
                                </div>
                              )}

                              {(reservation.confirmedMessage ||
                                reservation.rejectionReason) && (
                                <div className="bg-muted/50 p-3 rounded-lg">
                                  <Label className="text-sm font-medium mb-1 flex items-center">
                                    <MessageSquare className="w-4 h-4 mr-1" />
                                    {canEdit
                                      ? 'Vaša napomena:'
                                      : 'Manager napomena:'}
                                  </Label>
                                  <p className="text-sm text-muted-foreground">
                                    {reservation.confirmedMessage ||
                                      reservation.rejectionReason}
                                  </p>
                                </div>
                              )}

                              {reservation.order && (
                                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
                                  <Label className="text-sm font-medium mb-2 flex items-center text-blue-900 dark:text-blue-100">
                                    <UtensilsCrossed className="w-4 h-4 mr-1" />
                                    Narudžbina za rezervaciju
                                  </Label>
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openOrder(reservation.order!.id);
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-xs border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                  >
                                    Prikaži naručene proizvode
                                  </Button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
          </div>
        </div>

        {/* Empty States */}
        {!isProcessedLoading &&
          pendingReservations.length === 0 &&
          processedReservations.length === 0 &&
          !(
            filters.userName ||
            filters.reservationNumber ||
            filters.selectedDate ||
            filters.status !== 'all'
          ) && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Nema rezervacija</h3>
                <p className="text-muted-foreground">
                  Rezervacije će se pojaviti ovde kada stignu.
                </p>
              </CardContent>
            </Card>
          )}

        {!isProcessedLoading &&
          pendingReservations.length === 0 &&
          processedReservations.length > 0 && (
            <Card className="text-center py-6">
              <CardContent>
                <div className="w-12 h-12 mx-auto mb-2 bg-green-400 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-muted-foreground text-white" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Sve rezervacije su obrađene
                </p>
              </CardContent>
            </Card>
          )}

        {!isProcessedLoading &&
          processedReservations.length === 0 &&
          (filters.userName ||
            filters.reservationNumber ||
            filters.selectedDate ||
            filters.status !== 'all') && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-12 h-12 mx-auto mb-2 bg-muted rounded-full flex items-center justify-center">
                  <Search className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Nema rezultata</h3>
              </CardContent>
            </Card>
          )}
      </div>

      <ReservationDetailOverlay
        reservation={selectedReservation}
        isOpen={isOverlayOpen}
        isLoading={isReservationLoading}
        error={reservationError}
        onClose={closeReservation}
        canEdit={canEdit}
        adminNote={overlayAdminNote}
        onAdminNoteChange={setOverlayAdminNote}
        onConfirmReservation={handleOverlayConfirmReservation}
        onRejectReservation={handleOverlayRejectReservation}
        isUpdating={isUpdating}
        onOpenOrder={openOrder}
      />

      <OrderDetail
        order={selectedOrder}
        isOpen={isOrderOverlayOpen}
        isLoading={isOrderLoading}
        error={orderError}
        onClose={closeOrder}
        canEdit={false}
        adminNote=""
        onAdminNoteChange={() => {}}
        onConfirmOrder={() => {}}
        onRejectOrder={() => {}}
        isUpdating={false}
      />
    </div>
  );
};

export default ReservationDashboard;
