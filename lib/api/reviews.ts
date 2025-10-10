import { ReviewResponse } from '@/types/review';
import { apiRequest } from '../client';
import { FetchOptions } from '@/types/global';

export async function fetchAllReviews(
  options: FetchOptions & { isProtected?: boolean } = {}
): Promise<ReviewResponse> {
  return apiRequest('reviews', 'GET', undefined, {
    isProtected: true,
    ...options,
  });
}

export async function fetchReviews(
  entityId: string,
  entityType: string,
  options: FetchOptions & { isProtected?: boolean } = {}
): Promise<ReviewResponse> {
  return apiRequest(`reviews/${entityId}/${entityType}`, 'GET', undefined, {
    ...options,
    isProtected: true,
  });
}

export async function deleteReview(entityId: string) {
  return apiRequest(`reviews/${entityId}`, 'DELETE', undefined, {
    isProtected: true,
  });
}

export async function approveReview(reviewId: string) {
  return apiRequest(`reviews/approve/${reviewId}`, 'PATCH', undefined, {
    isProtected: true,
  });
}
