// components/NotificationBell.tsx
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { srLatn } from 'date-fns/locale';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MobileNotificationScreen } from './MobileNotificationScreen';
import { getTodayEndUTC, getYesterdayStartUTC } from '@/lib/utils/utils';
import { NotificationItem } from '@/types/notifications';
import {
  formatNotificationBody,
  formatReservationBody,
} from '@/lib/utils/notification';
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/lib/api/notifications';

export function NotificationBell() {
  const [isMobileScreenOpen, setIsMobileScreenOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const router = useRouter();

  // Detect mobile screen
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Generišemo startDate jednom kada se komponenta mount-uje
  const startDate = useMemo(() => getYesterdayStartUTC(), []);
  const endDate = useMemo(() => getTodayEndUTC(), []);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['notifications', startDate, endDate],
    queryFn: ({ pageParam = 1 }) =>
      fetchNotifications({
        page: pageParam,
        limit: 20,
        startDate,
        endDate,
      }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.pagination.hasNextPage ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  // Flatten sve stranice u jedan niz
  const notifications = data?.pages.flatMap((page) => page.notifications) ?? [];
  const unreadCount = data?.pages[0]?.numberOfUnseenNotifications ?? 0;

  // Desktop scroll handler
  const handleDesktopScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

      // Učitaj više kada je korisnik blizu dna (50px od dna)
      if (
        scrollHeight - scrollTop <= clientHeight + 50 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        // console.log('Loading more notifications...');
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  // Event handlers
  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      refetch();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      refetch();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.isSeen) {
      handleMarkAsRead(notification.id);
    }

    // Close mobile screen
    if (isMobile) {
      setIsMobileScreenOpen(false);
    }

    // Navigate based on type
    if (notification.type === 'order') {
      console.log('Navigate to order:', notification);
      router.push(`/orders?orderId=${notification.entityId}`);
    } else if (notification.type === 'reservation') {
      console.log('Navigate to reservation:', notification);
      router.push(`/reservations?reservationId=${notification.entityId}`);
    }
  };

  const handleBellClick = () => {
    if (isMobile) {
      setIsMobileScreenOpen(true);
    }
  };

  return (
    <>
      {/* Desktop Dropdown */}
      {!isMobile ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 min-w-5 h-5 p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-80" align="end">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifikacije
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="h-auto p-1 text-xs"
                  disabled={isLoading}
                >
                  Označi sve kao pročitano
                </Button>
              )}
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {isLoading && notifications.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">
                Učitavam...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">
                Nema notifikacija
              </div>
            ) : (
              <div
                className="max-h-96 overflow-y-auto"
                onScroll={handleDesktopScroll}
              >
                {notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`flex flex-col items-start space-y-1 p-3 cursor-pointer ${
                      !notification.isSeen ? 'bg-muted/50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-sm">
                        {notification.type === 'order'
                          ? notification.title
                          : 'Nova Rezervacija'}
                      </span>
                      {!notification.isSeen && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.type === 'order'
                        ? formatNotificationBody(notification.body)
                        : formatReservationBody(notification.body)}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {notification.createdAt
                        ? formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                              locale: srLatn,
                            }
                          )
                        : 'Unknown time'}
                    </span>
                  </DropdownMenuItem>
                ))}

                {/* Desktop loading indicator */}
                {isFetchingNextPage && (
                  <div className="p-3 text-center">
                    <div className="text-xs text-muted-foreground">
                      Učitavam više...
                    </div>
                  </div>
                )}

                {/* No more items indicator */}
                {!hasNextPage && notifications.length > 20 && (
                  <div className="p-3 text-center">
                    <div className="text-xs text-muted-foreground">
                      Nema više notifikacija
                    </div>
                  </div>
                )}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        /* Mobile Button */
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={handleBellClick}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 min-w-5 h-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      )}

      {/* Mobile Full-Screen Overlay */}
      {isMobile && isMobileScreenOpen && (
        <MobileNotificationScreen
          notifications={notifications}
          isLoading={isLoading}
          unreadCount={unreadCount}
          onClose={() => setIsMobileScreenOpen(false)}
          onMarkAllAsRead={handleMarkAllAsRead}
          onNotificationClick={handleNotificationClick}
          onLoadMore={fetchNextPage}
          hasNextPage={hasNextPage ?? false}
          isFetchingNextPage={isFetchingNextPage}
        />
      )}
    </>
  );
}
