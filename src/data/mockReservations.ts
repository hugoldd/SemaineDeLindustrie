export interface Reservation {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  date: string;
  time: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  type: string;
  registrationType: 'individual' | 'group';
  studentCount?: number;
  qrCode?: string;
  instructions?: string;
}

export const mockReservations: Reservation[] = [];
