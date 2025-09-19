import { apiRequest } from '../client';
import { getTodayEndUTC, getYesterdayStartUTC } from '../utils/utils';
import { NotificationResponse } from '@/types/notifications';

interface FetchNotificationsParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export async function fetchNotifications({
  page = 1,
  limit = 20,
  startDate = getYesterdayStartUTC(),
  endDate = getTodayEndUTC(),
}: FetchNotificationsParams = {}): Promise<NotificationResponse> {
  return apiRequest<NotificationResponse>('notifications', 'GET', undefined, {
    isProtected: true,
    params: {
      page,
      limit,
      startDate,
      endDate,
    },
  });
}

export const markNotificationAsRead = async (id: string): Promise<any> => {
  return apiRequest<any[]>(`notifications/${id}`, 'PATCH', undefined, {
    isProtected: true,
  });
};

export const markAllNotificationsAsRead = async (): Promise<any> => {
  return apiRequest<any[]>(`notifications`, 'PATCH', undefined, {
    isProtected: true,
  });
};
