import { Table } from "./table";
import { UserDetail } from "./user";

export interface Region {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  title: string;
  area: string;
  restaurantId: string;
  users?: UserDetail[];
  tables?: Table[];
}