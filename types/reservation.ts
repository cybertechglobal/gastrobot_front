import { UserDetail } from './user';

export interface Reservation {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  peopleCount: number;
  reservationStart: string;
  status: 'pending' | 'confirmed' | 'rejected';
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
