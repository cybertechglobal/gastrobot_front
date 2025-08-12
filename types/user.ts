// types/userRelations.ts

export interface UserDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  firstname: string;
  lastname: string;
  profileImageUrl: string | null;
  email: string;
  isVerified: boolean;
  verificationToken: string | null;
  phoneNumber?: string;
}

export interface RestaurantUser {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  role: UserRole;
  user: UserDetail;
}

export interface RestaurantUsersResponse {
  data: RestaurantUser[];
  total: number;
  page: number;
  limit: number;
}

export type UserRole = 'waiter' | 'manager' | 'chef' | 'root' | undefined;
