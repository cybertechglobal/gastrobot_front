export interface NotificationResponse {
  notifications: NotificationItem[];
  pagination: {
    totalCount: number;
    hasNextPage: boolean;
  };
  numberOfUnseenNotifications: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: Array<{
    quantity?: number;
    productName?: string;
    people?: number;
    reservation?: string;
    table?: string;
    time?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  entityId?: string;
  isSeen?: boolean;
  type: string;
}
