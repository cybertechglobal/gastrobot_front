export interface Table {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  capacity: number;
  restaurantId: string;
  regionId: string;
}