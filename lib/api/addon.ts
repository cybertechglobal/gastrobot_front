import { apiRequest } from '../client';
import { AddonGroup } from '@/types/addon';

export async function fetchAddonGroups(
  restaurantId: string
): Promise<AddonGroup[]> {
  return apiRequest(
    `addon-groups/restaurant/${restaurantId}`,
    'GET',
    undefined,
    {
      isProtected: true,
    }
  );
}

export async function fetchAddonGroupById(
  addonGroupId: string
): Promise<AddonGroup> {
  return apiRequest(`addon-groups/${addonGroupId}`, 'GET', undefined, {
    isProtected: true,
  });
}

export async function createAddonGroup(restaurantId: string, data: any) {
  return apiRequest(`addon-groups/restaurant/${restaurantId}`, 'POST', data, {
    isProtected: true,
  });
}

export async function updateAddonGroup(addonGroupId: string, data: any) {
  return apiRequest(`addon-groups/${addonGroupId}`, 'PATCH', data, {
    isProtected: true,
  });
}

export async function deleteAddonGroup(addonGroupId: string | undefined) {
  return apiRequest(`addon-groups/${addonGroupId}`, 'DELETE', undefined, {
    isProtected: true,
  });
}

export async function assignAddonGroupToMenuItem(
  addonGroupId: string,
  menuItemId: string,
  data: any
) {
  return apiRequest(
    `addon-groups/${addonGroupId}/menu-item/${menuItemId}`,
    'POST',
    data,
    {
      isProtected: true,
    }
  );
}

export async function unassignAddonGroupFromMenuItem(
  addonGroupId: string,
  menuItemId: string
) {
  return apiRequest(
    `addon-groups/${addonGroupId}/menu-item/${menuItemId}`,
    'DELETE',
    undefined,
    {
      isProtected: true,
    }
  );
}

export async function createAddonOption(addonGroupId: string, data: any) {
  return apiRequest(`addon-options/addon-group/${addonGroupId}`, 'POST', data, {
    isProtected: true,
  });
}

export async function updateAddonOption(addonOptionId: string, data: any) {
  return apiRequest(`addon-options/${addonOptionId}`, 'PATCH', data, {
    isProtected: true,
  });
}
