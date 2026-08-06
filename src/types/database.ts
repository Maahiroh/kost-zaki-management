export type RoomStatus = 'Kosong' | 'Terisi';

export interface Room {
  id: string;
  room_number: string;
  status: RoomStatus;
  price_monthly: number;
  floor?: number;
  type?: string;
  facilities?: string[];
  created_at?: string;
}

export interface Tenant {
  id: string;
  room_id: string;
  name: string;
  whatsapp_number: string;
  entry_date?: string; // ISO string TIMESTAMPTZ (Tanggal Masuk Check-in)
  expiry_date: string; // ISO string TIMESTAMPTZ
  created_at?: string;
  room?: Room;
}

export interface PaymentLog {
  id: string;
  tenant_id: string;
  payment_date: string; // ISO string TIMESTAMPTZ
  duration_months: number;
  amount?: number;
  created_at?: string;
  tenant?: Tenant;
}

export type ActivityType = 'pembayaran' | 'check_in' | 'check_out';

export interface ActivityLog {
  id: string;
  type: ActivityType;
  tenant_name: string;
  room_number: string;
  date: string; // ISO string
  amount?: number;
  duration_months?: number;
  notes?: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  url: string;
  category?: string;
  created_at: string;
}
