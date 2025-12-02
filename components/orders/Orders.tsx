'use client';
import React, { useState } from 'react';
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
  Phone,
  Calendar,
  RefreshCw,
  ShoppingCart,
  UtensilsCrossed,
  MessageSquare,
} from 'lucide-react';
import OrderFilterForm from './OrderFilterForm';
import { useOrderManagement } from './useOrderManagement';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/types/user';
import { Order, OrderItem } from '@/types/order';
import ProcessedOrdersSkeleton from './ProcessedOrdersSkeleton';
import { formatTime, formatTimeInParts } from '@/lib/utils/utils';
import { getStatusBadge } from '@/lib/utils/getStatusBadge';
import { getUrgencyIndicator } from '@/lib/utils/getUrgencyIndicator';
import { useOrderDetail } from '@/hooks/useOrderDetail';
import OrderDetail from './OrderDetail';

const OrderDashboard = ({ restaurantId }: { restaurantId?: string }) => {
  const session = useSession();

  const role: UserRole = session?.data?.user?.restaurantUsers[0]?.role;

  const {
    pendingOrders,
    processedOrders,
    stats,
    filters,
    adminNotes,
    isLoading,
    isProcessedLoading,
    error,
    isUpdating,
    handleFiltersChange,
    handleConfirmOrder,
    handleRejectOrder,
    handleAdminNoteChange,
    refetchOrders,
    canEdit,
  } = useOrderManagement({ role, resId: restaurantId });

  const {
    selectedOrder,
    isOpen: isOverlayOpen,
    isLoading: isOrderLoading,
    error: orderError,
    openOrder,
    closeOrder,
  } = useOrderDetail({
    resId: restaurantId,
  });

  const [overlayAdminNote, setOverlayAdminNote] = useState('');

  const handleOverlayConfirmOrder = async () => {
    if (selectedOrder) {
      await handleConfirmOrder(selectedOrder.id);
      closeOrder();
    }
  };

  const handleOverlayRejectOrder = async () => {
    if (selectedOrder) {
      await handleRejectOrder(selectedOrder.id);
      closeOrder();
    }
  };

  const countTotalSum = (items: OrderItem[]) => {
    if (!items || !items.length) return 0;

    const sum = items.reduce((acc, item) => {
      return acc + item.quantity * (item.menuItem?.price ?? 0);
    }, 0);

    return sum;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Učitavanje porudžbina...</p>
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
            <Button onClick={refetchOrders} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Pokušaj ponovo
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const roleInfo = {
    title: 'Lista Porudžbina',
    subtitle: canEdit
      ? 'Upravljaj porudžbinama iz restorana'
      : 'Pregled porudžbina iz restorana',
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-primary-foreground" />
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
            {/* <Button variant="outline" className="relative">
              <Bell className="w-4 h-4 mr-2" />
              Notifikacije
              {pendingOrders.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {pendingOrders.length}
                </Badge>
              )}
            </Button> */}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-8 py-5">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalOrders}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Ukupno porudžbina
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalPending}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Na čekanju
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalConfirmed}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Prihvaćeno
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalRejected}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Odbijeno
              </div>
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        {pendingOrders.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold tracking-tight">
                Na čekanju ({pendingOrders.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {pendingOrders.map((order: Order) => {
                return (
                  <Card
                    key={order.id}
                    onClick={() => openOrder(order.id)}
                    className="cursor-pointer relative hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                  >
                    {getUrgencyIndicator(order.createdAt)}

                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          {order.reservation ? (
                            <>
                              <CardTitle className="text-lg flex items-center">
                                <Calendar className="w-5 h-5 mr-2" />
                                Porudžbina za rezervaciju
                              </CardTitle>
                              <Badge
                                variant="secondary"
                                className="text-sm font-mono"
                              >
                                #{order.reservation.reservationNumber}
                              </Badge>
                            </>
                          ) : (
                            <>
                              <CardTitle className="text-lg flex items-center">
                                <UtensilsCrossed className="w-5 h-5 mr-2" />
                                Sto {order.tableNum}
                              </CardTitle>
                              <Badge
                                variant="secondary"
                                className="text-sm font-mono"
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
                        {formatTime(new Date(order.createdAt))}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Contact Info */}
                      <div className="text-sm text-muted-foreground">
                        {order.user ? (
                          <>
                            <div className="font-medium text-foreground">
                              {order?.user.firstname} {order.user.lastname}
                            </div>
                            <div className="flex items-center">
                              <span className="w-4 text-center mr-2">@</span>
                              {order.user.email}
                            </div>
                            {order.user.phoneNumber && (
                              <div className="flex items-center mt-2">
                                <Phone size="14" />
                                <span className="ml-2">
                                  {order.user.phoneNumber}
                                </span>
                              </div>
                            )}
                          </>
                        ) : null}
                      </div>

                      {/* Order Items */}
                      <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                        <Label className="text-sm font-medium">Stavke:</Label>
                        {order.orderItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm">
                              {item.quantity}x{' '}
                              {item.menuItem.product?.name ||
                                item.menuItem.combo?.name}
                            </span>
                            <span className="text-sm font-medium">
                              {item.menuItem.price} RSD
                            </span>
                          </div>
                        ))}
                        <Separator className="my-2" />
                        <div className="flex justify-between items-center font-medium">
                          <span>Ukupno:</span>
                          <span className="text-lg">
                            {countTotalSum(order.orderItems)} RSD
                          </span>
                        </div>
                      </div>

                      {/* Special Requests */}
                      {order.note && (
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <Label className="text-sm font-medium mb-1 block">
                            Posebni zahtevi:
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {order.note}
                          </p>
                        </div>
                      )}

                      {/* Admin Note Input - Only for managers and non-reservation orders */}
                      {canEdit && !order.reservation && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Poruka za gosta ukoliko se zahtev odbija (opciono):
                          </Label>
                          <Textarea
                            value={adminNotes[order.id] || ''}
                            onChange={(e) =>
                              handleAdminNoteChange(order.id, e.target.value)
                            }
                            placeholder="Dodaj poruku koja će biti poslata gostu..."
                            rows={2}
                            className="resize-none"
                          />
                        </div>
                      )}
                    </CardContent>

                    {order.reservation ? (
                      <CardFooter className="pt-4">
                        <div className="w-full bg-muted/50 p-4 rounded-lg text-center">
                          <p className="text-sm text-muted-foreground">
                            Status ove porudžbine će se automatski promeniti
                            kada se rezervacija potvrdi ili odbije.
                          </p>
                        </div>
                      </CardFooter>
                    ) : (
                      canEdit && (
                        <CardFooter className="flex space-x-3 pt-4">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConfirmOrder(order.id);
                            }}
                            disabled={isUpdating}
                            className="flex-1"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Prihvati
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRejectOrder(order.id);
                            }}
                            disabled={isUpdating}
                            variant="destructive"
                            className="flex-1"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Odbij
                          </Button>
                        </CardFooter>
                      )
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Processed Orders */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold tracking-tight">
                Obrađene porudžbine ({processedOrders.length})
              </h2>
            </div>
          </div>

          {/* Filters */}
          <OrderFilterForm
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
          />

          {/* Results Summary */}
          {!isProcessedLoading && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Pronađeno {processedOrders.length} porudžbina</span>
            </div>
          )}

          {/* Processed Orders List or Skeleton */}
          <div className="space-y-4">
            {isProcessedLoading
              ? // Show skeleton loaders while loading
                [...Array(3)].map((_, index) => (
                  <ProcessedOrdersSkeleton key={`skeleton-${index}`} />
                ))
              : // Show actual processed orders
                processedOrders.map((order: Order) => {
                  const { dayPart, timePart } = formatTimeInParts(
                    order.createdAt
                  );

                  return (
                    <Card
                      key={order.id}
                      onClick={() => openOrder(order.id)}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-4">
                            <div>
                              {order.reservation ? (
                                <>
                                  <h3 className="text-lg font-semibold flex items-center">
                                    <Calendar className="w-5 h-5 mr-2" />
                                    Porudžbina za rezervaciju
                                  </h3>
                                  <Badge
                                    variant="secondary"
                                    className="text-sm font-mono"
                                  >
                                    #{order.reservation.reservationNumber}
                                  </Badge>
                                </>
                              ) : (
                                <>
                                  <h3 className="text-lg font-semibold flex items-center">
                                    <UtensilsCrossed className="w-5 h-5 mr-2" />
                                    Sto {order.tableNum}
                                  </h3>
                                  <Badge
                                    variant="secondary"
                                    className="text-sm font-mono"
                                  >
                                    #{order.orderNumber}
                                  </Badge>
                                </>
                              )}
                              {order.user ? (
                                <>
                                  <div className="flex items-center mt-1">
                                    <span className="text-sm text-muted-foreground">
                                      {order.user.firstname}{' '}
                                      {order.user.lastname}
                                    </span>
                                  </div>
                                  {order.user.phoneNumber && (
                                    <div className="flex items-center mt-1">
                                      <Phone className="w-4 h-4 mr-1" />
                                      <span className="text-sm text-muted-foreground">
                                        {order.user.phoneNumber}
                                      </span>
                                    </div>
                                  )}
                                </>
                              ) : null}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="text-sm">
                              {countTotalSum(order.orderItems)} RSD
                            </Badge>
                            {getStatusBadge(order.status)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                          {/* Order Items */}
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <Label className="text-sm font-medium mb-2 block">
                              Stavke porudžbine:
                            </Label>
                            <div className="space-y-1">
                              {order.orderItems.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex justify-between text-sm"
                                >
                                  <span>
                                    {item.quantity}x{' '}
                                    {item.menuItem.product?.name ||
                                      item.menuItem.combo?.name}
                                  </span>
                                  <span>{item.menuItem.price} RSD</span>
                                </div>
                              ))}
                              <Separator className="my-2" />
                              <div className="flex justify-between font-medium">
                                <span>Ukupno:</span>
                                <span>
                                  {countTotalSum(order.orderItems)} RSD
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Special Requests & Admin Note */}
                          <div className="space-y-3">
                            {order.note && (
                              <div className="bg-muted/50 p-3 rounded-lg">
                                <Label className="text-sm font-medium mb-1 block">
                                  Posebni zahtevi:
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  {order.note}
                                </p>
                              </div>
                            )}

                            {order.rejectionNote && (
                              <div className="bg-muted/50 p-3 rounded-lg">
                                <Label className="text-sm font-medium mb-1 flex items-center">
                                  <MessageSquare className="w-4 h-4 mr-1" />
                                  {canEdit
                                    ? 'Vaša napomena:'
                                    : 'Manager napomena:'}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  {order.rejectionNote}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>
                            Poručeno: {dayPart} u {timePart}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
          </div>
        </div>

        {/* Empty States */}
        {!isProcessedLoading &&
          pendingOrders.length === 0 &&
          processedOrders.length === 0 &&
          !(
            filters.orderNumber ||
            filters.tableNum ||
            filters.selectedDate ||
            filters.status !== 'all'
          ) && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Nema porudžbina</h3>
                <p className="text-muted-foreground">
                  Porudžbine će se pojaviti ovde kada stignu.
                </p>
              </CardContent>
            </Card>
          )}

        {!isProcessedLoading &&
          pendingOrders.length === 0 &&
          processedOrders.length > 0 && (
            <Card className="text-center py-6">
              <CardContent>
                <div className="w-12 h-12 mx-auto mb-2 bg-green-400 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-muted-foreground text-white" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Sve porudžbine su obrađene
                </p>
              </CardContent>
            </Card>
          )}

        {!isProcessedLoading &&
          processedOrders.length === 0 &&
          (filters.orderNumber ||
            filters.tableNum ||
            filters.selectedDate ||
            filters.status !== 'all') && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-12 h-12 mx-auto mb-2 bg-muted rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Nema rezultata</h3>
                <p className="text-muted-foreground">
                  Pokušajte sa drugim filterima.
                </p>
              </CardContent>
            </Card>
          )}
      </div>

      <OrderDetail
        order={selectedOrder}
        isOpen={isOverlayOpen}
        isLoading={isOrderLoading}
        error={orderError}
        onClose={closeOrder}
        canEdit={canEdit}
        adminNote={overlayAdminNote}
        onAdminNoteChange={setOverlayAdminNote}
        onConfirmOrder={handleOverlayConfirmOrder}
        onRejectOrder={handleOverlayRejectOrder}
        isUpdating={isUpdating}
      />
    </div>
  );
};

export default OrderDashboard;
