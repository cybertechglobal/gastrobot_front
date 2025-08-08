import { Menu } from '@/types/menu';
import { apiRequest } from '../client';

export async function fetchMenus(restaurantId: string): Promise<Menu[]> {
  return apiRequest(`v1/restaurants/${restaurantId}/menus`, 'GET', undefined, {
    isProtected: true,
  });
}

export async function fetchMenuById(
  restaurantId: string,
  menuId: string
): Promise<Menu> {
  return apiRequest(
    `v1/restaurants/${restaurantId}/menus/${menuId}`,
    'GET',
    undefined,
    { isProtected: true }
  );
}

export async function createMenu(restaurantId: string, data: any) {
  return apiRequest(`v1/restaurants/${restaurantId}/menus`, 'POST', data, {
    isProtected: true,
  });
}

export async function updateMenu(
  restaurantId: string,
  menuId: string,
  data: any
) {
  return apiRequest(
    `v1/restaurants/${restaurantId}/menus/${menuId}`,
    'PUT',
    data,
    {
      isProtected: true,
    }
  );
}

export async function deleteMenu(restaurantId: string, menuId: string) {
  return apiRequest(
    `v1/restaurants/${restaurantId}/menus/${menuId}`,
    'DELETE',
    undefined,
    {
      isProtected: true,
    }
  );
}

export async function createMenuItem(
  restaurantId: string,
  menuId: string,
  data: any
) {
  return apiRequest(
    `v1/restaurants/${restaurantId}/menus/${menuId}/menu-items`,
    'POST',
    data,
    {
      isProtected: true,
    }
  );
}

export async function updateMenuItem(
  restaurantId: string,
  menuId: string,
  menuItemId: string,
  data: any
) {
  return apiRequest(
    `v1/restaurants/${restaurantId}/menus/${menuId}/menu-items/${menuItemId}`,
    'PUT',
    data,
    {
      isProtected: true,
    }
  );
}

export async function removeMenuItem(
  restaurantId: string,
  menuId: string,
  menuItemId: string | undefined
) {
  return apiRequest(
    `v1/restaurants/${restaurantId}/menus/${menuId}/menu-items/${menuItemId}`,
    'DELETE',
    undefined,
    {
      isProtected: true,
    }
  );
}
