export type VehicleStatus = 'available' | 'soon' | 'rented';
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface BookingOption {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface CompanyInfo {
  description: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
}

export interface Vehicle {
  id: string;
  name: string;
  category: string;
  price: number;
  priceOutsideDakar?: number;
  image: string;
  gallery?: string[];
  transmission: string;
  seats: number;
  fuel: string;
  luggage: number;
  description: string;
  status: VehicleStatus;
  returnDate?: string;
}

export interface Review {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  date: string;
  vehicleId?: string;
}

export interface Founder {
  name: string;
  bio: string;
  image: string;
}

export interface Reservation {
  id: string;
  vehicleId: string;
  vehicleName: string;
  startDate: string;
  duration: number;
  firstName: string;
  lastName: string;
  phone: string;
  zone: string;
  zoneDetails?: string;
  comments?: string;
  options: Record<string, boolean>;
  paymentMethod: string;
  totalPrice: number;
  status: ReservationStatus;
  createdAt: string;
}
