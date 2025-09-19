// lib/api/regions.ts
import { FetchOptions } from '@/types/global';
import { apiRequest } from '../client';
import { Region } from '@/types/region';

export type CreateRegionPayload = {
  title: string;
  area: string;
  restaurantId: string;
};

export type UpdateRegionPayload = Partial<CreateRegionPayload>;

export type AssignUserPayload = { regionId: string; userId: string };
export type RemoveUserPayload = { regionId: string; userId: string };

export type AssignTablePayload = { regionId: string; tableId: string };
export type RemoveTablePayload = { regionId: string; tableId: string };

// POST /regions - kreiranje regiona
export async function createRegion(data: CreateRegionPayload): Promise<Region> {
  return apiRequest<Region>('regions', 'POST', data, {
    isProtected: true,
  });
}

// GET /regions - svi regioni
export async function fetchRegions(
  options: FetchOptions & { isProtected?: boolean } = {}
): Promise<Region[]> {
  return apiRequest<Region[]>('regions', 'GET', undefined, {
    ...options,
    isProtected: true,
  });
}

// GET /regions/restaurant/:restaurantId - regioni za jedan restoran
export async function fetchRegionsByRestaurant(
  restaurantId: string,
  options: FetchOptions & { isProtected?: boolean } = {}
): Promise<Region[]> {
  return apiRequest<Region[]>(
    `regions/restaurant/${restaurantId}`,
    'GET',
    undefined,
    { ...options, isProtected: true }
  );
}

// GET /regions/:id - jedan region
export async function fetchRegionById(
  id: string,
  options: FetchOptions & { isProtected?: boolean } = {}
): Promise<Region> {
  return apiRequest<Region>(`regions/${id}`, 'GET', undefined, {
    ...options,
    isProtected: true,
  });
}

// PATCH /regions/:id - update jednog regiona
export async function updateRegion(
  id: string,
  data: UpdateRegionPayload
): Promise<Region> {
  return apiRequest<Region>(`regions/${id}`, 'PATCH', data, {
    isProtected: true,
  });
}

// DELETE /regions/:id - brisanje jednog regiona
export async function deleteRegion(id: string): Promise<void> {
  return apiRequest<void>(`regions/${id}`, 'DELETE', undefined, {
    isProtected: true,
  });
}

// POST /regions/assign-user - dodela korisnika regionu
export async function assignUserToRegion(
  data: AssignUserPayload
): Promise<Region> {
  return apiRequest<Region>('regions/assign-user', 'POST', data, {
    isProtected: true,
  });
}

// DELETE /regions/user/remove-user - uklanjanje korisnika iz regiona
export async function removeUserFromRegion(
  data: RemoveUserPayload
): Promise<Region> {
  // napomena: DELETE sa telom zahteva (backend treba da podrži)
  return apiRequest<Region>('regions/user/remove-user', 'DELETE', data, {
    isProtected: true,
  });
}

// POST /regions/assign-table - dodavanje stola u region
export async function assignTableToRegion(
  data: AssignTablePayload
): Promise<Region> {
  return apiRequest<Region>('regions/assign-table', 'POST', data, {
    isProtected: true,
  });
}

// DELETE /regions/table/remove-table - uklanjanje stola iz regiona
export async function removeTableFromRegion(
  data: RemoveTablePayload
): Promise<Region> {
  // napomena: DELETE sa telom zahteva (backend treba da podrži)
  return apiRequest<Region>('regions/table/remove-table', 'DELETE', data, {
    isProtected: true,
  });
}
