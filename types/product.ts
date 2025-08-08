import { Category } from "./category";
import { ProductIngredient } from "./ingredient";

export interface Product {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  description: string;
  imageUrl: string | null;
  isRecommended: boolean;
  restaurantId: string;
  category: Category;
  productIngredients?: ProductIngredient[];
  // distributor: any | null;
}

export interface ProductsResponse {
  data: Product[];
  total: number;
}