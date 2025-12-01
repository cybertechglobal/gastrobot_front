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
  clearAll: () => void; // Dodato
  setTabFocused: (focused: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      isTabFocused: true,
      soundEnabled: true,

      clearAll: () =>
        set({
          notifications: [],
          unreadCount: 0,
        }),

      setTabFocused: (focused) => set({ isTabFocused: focused }),

      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
    }),
    {
      name: 'notification-store',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        soundEnabled: state.soundEnabled,
      }),
    }
  )
);
