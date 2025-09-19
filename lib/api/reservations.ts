import { FetchOptions } from '@/types/global';
import { apiRequest } from '../client';
import { Reservation, ReservationResponse } from '@/types/reservation';

export async function fetchRestaurantReservations(
  id: string,
  options: FetchOptions & { isProtected?: boolean } = {}
): Promise<ReservationResponse> {
  return apiRequest<ReservationResponse>(
    `v1/restaurants/${id}/reservations`,
    'GET',
    undefined,
    {
      ...options,
      isProtected: true,
    }
  );
}

export async function fetchRestaurantReservationById(
  reservationId: string
): Promise<Reservation> {
  return apiRequest<Reservation>(
    `reservations/${reservationId}`,
    'GET',
    undefined,
    {
      isProtected: true,
    }
  );
}

export async function createReservation(id: string, data: any) {
  return apiRequest(`v1/restaurants/${id}/reservations`, 'POST', data, {
    isProtected: true,
  });
}

export async function rejectReservation(
  id: string,
  reservationId: string,
  data: any
) {
  return apiRequest(
    `v1/restaurants/${id}/reservations/${reservationId}/reject`,
    'PUT',
    data,
    { isProtected: true }
  );
}

export async function confirmReservation(
  id: string,
  reservationId: string,
  data: any
) {
  return apiRequest(
    `v1/restaurants/${id}/reservations/${reservationId}/manual-confirm`,
    'PUT',
    data,
    { isProtected: true }
  );
}
