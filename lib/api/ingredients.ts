import { FetchOptions } from '@/types/global';
import { apiRequest } from '../client';
import { IngredientsResponse, ProductIngredient } from '@/types/ingredient';

export async function fetchIngredients(
  options: FetchOptions & { isProtected?: boolean } = {}
): Promise<IngredientsResponse> {
  return apiRequest('v1/ingredients', 'GET', undefined, {
    ...options,
    isProtected: true,
  });
}

export async function fetchRestaurantIngredients(
  restaurantId: string,
  options: FetchOptions & { isProtected?: boolean } = {}
): Promise<IngredientsResponse> {
  return apiRequest(
    `v1/restaurants/${restaurantId}/ingredients`,
    'GET',
    undefined,
    {
      ...options,
      isProtected: true,
    }
  );
}

export async function fetchProductIngredients(
  restaurantId: string,
  productId: string,
  options: FetchOptions & { isProtected?: boolean } = {}
): Promise<ProductIngredient[]> {
  return apiRequest(
    `v1/restaurants/${restaurantId}/products/${productId}/ingredients`,
    'GET',
    undefined,
    {
      ...options,
      isProtected: true,
    }
  );
}

export async function createIngredient(data: any) {
  return apiRequest('v1/ingredients', 'POST', data, { isProtected: true });
}

export async function updateIngredient(id: string, data: any) {
  return apiRequest(`v1/ingredients/${id}`, 'PUT', data, {
    isProtected: true,
  });
}

export async function deleteIngredient(id: string) {
  return apiRequest(`v1/ingredients/${id}`, 'DELETE', undefined, {
    isProtected: true,
  });
}

export async function createProductIngredient(
  restaurantId: string,
  productId: string,
  ingredientId: string,
  data: any
) {
  return apiRequest(
    `v1/restaurants/${restaurantId}/products/${productId}/ingredients/${ingredientId}`,
    'POST',
    data,
    {
      isProtected: true,
    }
  );
}

export async function deleteProductIngredient(
  restaurantId: string,
  productId: string,
  ingredientId: string
) {
  return apiRequest(
    `v1/restaurants/${restaurantId}/products/${productId}/ingredients/${ingredientId}`,
    'DELETE',
    undefined,
    {
      isProtected: true,
    }
  );
}

export async function updateProductIngredient(
  restaurantId: string,
  productId: string,
  ingredientId: string,
  data: any
) {
  return apiRequest(
    `v1/restaurants/${restaurantId}/products/${productId}/ingredients/${ingredientId}`,
    'PUT',
    data,
    {
      isProtected: true,
    }
  );
}
