import { Product } from './product';
import { Restaurant } from './restaurant';

export interface Reviewable {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  noOfReviews: number;
  averageRating: number;
  restaurant?: Restaurant;
  product?: Product
}

export interface Review {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  rating: number;
  comment: string;
  approved: boolean;
  reviewable: Reviewable;
}

export interface ReviewResponse {
  data: Review[];
  pagination: {
    totalCount: number;
    hasNextPage: boolean;
  };
}
