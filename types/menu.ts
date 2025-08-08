// types/menu.ts

import { Product } from './product';

export interface Menu {
  id: string;
  name: string;
  categories: Category[];
}

interface Category {
  id: string;
  name: string;
  menuItems: MenuItem[];
}

export interface MenuItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  price: number;
  product: Product;
}

/**
 * Alias for an array of menus
 */
export type Menus = Menu[];
