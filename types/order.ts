import { Combobox } from './menu';
import { Product } from './product';
import { Restaurant } from './restaurant';
import { UserDetail } from './user';
import { Reservation } from './reservation';

export interface OrdersResponse {
  data: Order[];
  total: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'rejected';

export interface Order {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  tableNum: string;
  status: OrderStatus;
  restaurant: Restaurant;
  orderItems: OrderItem[];
  totalPrice: string;
  phoneNumber: string | null;
  longitude: number | null;
  latitude: number | null;
  rejectionNote: string | null;
  note: string | null;
  orderNumber: string | null;
  user: UserDetail | null;
  reservation: Reservation | null;
}

export interface OrderItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  quantity: number;
  additionalInfo: string | null;
  menuItem: MenuItem;
}

export interface MenuItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  price: number;
  product: Product;
  combo: Combobox;
}
