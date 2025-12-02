// types/menu.ts

import { AddonGroup } from './addon';
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
  combo: Combobox;
  menuItemAddons: MenuItemAddons[];
}
export interface Combobox {
  id: string;
  name: string;
  products?: Product[];
  imageUrl: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface MenuItemAddons {
  id: string;
  createdAt: string;
  updatedAt: string;
  addonGroup: AddonGroup;
}

/**
 * Alias for an array of menus
 */
export type Menus = Menu[];
