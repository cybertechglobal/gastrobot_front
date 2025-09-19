import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NotificationData {
  id: string;
  type: 'order' | 'reservation';
  title: string;
  body: string;
  data?: any;
  timestamp: number;
  read: boolean;
  restaurantId: string;
}

interface NotificationState {
  notifications: NotificationData[];
  unreadCount: number;
  isTabFocused: boolean;
  soundEnabled: boolean;
  addNotification: (notification: Omit<NotificationData, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void; // Dodato
  setTabFocused: (focused: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  getUnreadByType: (type: 'order' | 'reservation') => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isTabFocused: true,
      soundEnabled: true,

      addNotification: (notificationData) => {
        const notification: NotificationData = {
          ...notificationData,
          id: `${notificationData.type}-${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          read: false,
        };

        set((state) => ({
          notifications: [notification, ...state.notifications.slice(0, 49)],
          unreadCount: state.unreadCount + 1,
        }));
      },

      markAsRead: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          if (!notification || notification.read) return state;

          return {
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          };
        }),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),

      removeNotification: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          const wasUnread = notification && !notification.read;

          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount,
          };
        }),

      clearAll: () => set({
        notifications: [],
        unreadCount: 0,
      }),

      setTabFocused: (focused) => set({ isTabFocused: focused }),

      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),

      getUnreadByType: (type) => {
        const { notifications } = get();
        return notifications.filter((n) => n.type === type && !n.read).length;
      },
    }),
    {
      name: 'notification-store',
      partialize: (state) => ({ 
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        soundEnabled: state.soundEnabled
      }),
    }
  )
);