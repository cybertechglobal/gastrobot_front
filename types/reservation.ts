import { UserDetail } from './user';

export type ReservationStatus = 'pending' | 'confirmed' | 'rejected';
export interface Reservation {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  peopleCount: number;
  reservationStart: string;
  status: ReservationStatus;
  area: 'inside' | 'outside';
  rejectionReason: string | null;
  confirmedMessage: string | null;
  reservationNumber: string;
  additionalInfo: string | null;
  assignedTableName: string | null;
  user: UserDetail;
}

export interface ReservationResponse {
  data: Reservation[];
  total: number;
}
