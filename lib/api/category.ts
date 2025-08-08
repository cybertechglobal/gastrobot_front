import { Category } from '@/types/category';
import { apiRequest } from '../client';

export async function fetchCategories(): Promise<Category[]> {
  const res = await apiRequest('v1/categories', 'GET', undefined, {
    isProtected: true,
  });

  const sorted = res.sort((a: Category, b: Category) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  return sorted;
}

export async function fetchCategoryById(id: string): Promise<Category> {
  return apiRequest(`v1/categories/${id}`, 'GET', undefined, {
    isProtected: true,
  });
}

export async function createCategory(data: Omit<Category, 'id'>) {
  return apiRequest('v1/categories', 'POST', data, { isProtected: true });
}

export async function updateCategory(id: string, data: Omit<Category, 'id'>) {
  return apiRequest(`v1/categories/${id}`, 'PUT', data, { isProtected: true });
}

export async function deleteCategory(id: string) {
  return apiRequest(`v1/categories/${id}`, 'DELETE', undefined, {
    isProtected: true,
  });
}
