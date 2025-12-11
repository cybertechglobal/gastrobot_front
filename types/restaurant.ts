import { Reviewable } from "./review";

export interface WorkingHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface Location {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  address: string;
  city: string;
  country: string;
  zipCode: string;
  lat: number;
  lng: number;
}

export interface Restaurant {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  workingHours: WorkingHours;
  description: string;
  logoUrl: string;
  backgroundImageUrl: string;
  status: 'active' | 'inactive';
  email: string;
  phoneNumber: string;
  location: Location;
  reviewable: Reviewable
}

export type CreateRestaurant = {
  name: string;
  description: string;
  email?: string;
  phoneNumber?: string;
  locationId: string;
  workingHours: Record<
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday',
    string
  >;
};

export interface RestaurantFilters {
  name: string;
  location?: string;
  city?: string;
  status?: string;
}

export interface RestaurantsResponse {
  data: Restaurant[];
  total: number;
}
