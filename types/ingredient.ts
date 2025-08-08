export interface Ingredient {
  id: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  name: string;
  restaurantId?: string | null;
}

export interface IngredientsResponse {
  data: Ingredient[];
  total: number;
}

export interface ProductIngredient {
  id: string
  ingredient: Ingredient;
  quantity: number;
  unit: string;
}