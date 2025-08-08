import { FetchOptions } from '@/types/global';
import { apiRequest } from '../client';
import { ProductsResponse } from '@/types/product';

export async function fetchProducts(
  restaurantId: string,
  options: FetchOptions & { isProtected?: boolean } = {}
): Promise<ProductsResponse> {
  return apiRequest(
    `v1/restaurants/${restaurantId}/products`,
    'GET',
    undefined,
    { ...options, isProtected: true }
  );
}

export async function fetchProductById(
  restaurantId: string,
  productId: string
) {
  return apiRequest(
    `v1/restaurants/${restaurantId}/products/${productId}`,
    'GET',
    undefined,
    { isProtected: true }
  );
}

export async function createProduct(restaurantId: string, data: any) {
  return apiRequest(`v1/restaurants/${restaurantId}/products`, 'POST', data, {
    isProtected: true,
  });
}

export async function updateProduct(
  restaurantId: string,
  productId: string,
  data: any
) {
  return apiRequest(
    `v1/restaurants/${restaurantId}/products/${productId}`,
    'PUT',
    data,
    {
      isProtected: true,
    }
  );
}

export async function deleteProduct(
  restaurantId: string,
  productId: string | undefined
) {
  return apiRequest(
    `v1/restaurants/${restaurantId}/products/${productId}`,
    'DELETE',
    undefined,
    {
      isProtected: true,
    }
  );
}
