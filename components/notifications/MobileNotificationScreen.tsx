// components/MobileNotificationScreen.tsx
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { srLatn } from 'date-fns/locale';
import { useCallback } from 'react';
import { NotificationItem } from '@/types/notifications';
import { formatNotificationBody } from '@/lib/utils/notification';
import * as React from 'react';

interface MobileNotificationScreenProps {
  notifications: NotificationItem[];
  isLoading: boolean;
  unreadCount: number;
  onClose: () => void;
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: NotificationItem) => void;
  onLoadMore: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

export function MobileNotificationScreen({
  notifications,
  isLoading,
  unreadCount,
  onClose,
  onMarkAllAsRead,
  onNotificationClick,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
}: MobileNotificationScreenProps) {
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

      // Ranije učitavanje (threshold 50px)
      if (
        scrollHeight - scrollTop <= clientHeight + 50 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        // console.debug('Mobile: Loading more notifications...');
        onLoadMore();
      }
    },
    [hasNextPage, isFetchingNextPage, onLoadMore]
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-background flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Notifikacije"
    >
      {/* Header (sticky na mob.) */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Zatvori"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold truncate">Notifikacije</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-1 min-w-5 h-5 text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>

        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            disabled={isLoading}
            className="text-xs"
          >
            Označi sve
          </Button>
        )}
      </div>

      {/* Content */}
      <div
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
        onScroll={handleScroll}
        // iOS momentum scroll
        style={{ WebkitOverflowScrolling: 'touch' as any }}
      >
        {isLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-sm text-muted-foreground">Učitavam...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-sm text-muted-foreground">
              Nema notifikacija
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                  !notification.isSeen ? 'bg-muted/30' : ''
                }`}
                onClick={() => onNotificationClick(notification)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ')
                    onNotificationClick(notification);
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm truncate">
                        {notification.title}
                      </span>
                      {!notification.isSeen && (
                        <span
                          className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"
                          aria-label="Nepročitano"
                        />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {formatNotificationBody(notification.body)}
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
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isFetchingNextPage && (
              <div className="p-4 text-center">
                <div className="text-sm text-muted-foreground">
                  Učitavam više...
                </div>
              </div>
            )}

            {/* No more items indicator */}
            {!hasNextPage && notifications.length > 0 && (
              <div className="p-4 text-center">
                <div className="text-xs text-muted-foreground">
                  Nema više notifikacija
                </div>
              </div>
            )}

            {/* Debug info - ukloni u produkciji */}
            {/* <div className="p-4 text-center text-xs text-muted-foreground">
              Učitano: {notifications.length} | Ima još:{' '}
              {hasNextPage ? 'Da' : 'Ne'} | Učitava:{' '}
              {isFetchingNextPage ? 'Da' : 'Ne'}
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
}
