import React, { createContext, useState, useContext } from 'react';
import { Vehicle, VehicleStatus, Founder, Reservation, ReservationStatus, BookingOption, CompanyInfo } from './types';

const INITIAL_VEHICLES: Vehicle[] = [
  { id: '1', name: 'Mercedes Classe E', category: 'Berline Luxe', price: 60000, image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80', transmission: 'Automatique', seats: 5, fuel: 'Essence', luggage: 2, description: 'Le summum du luxe et du confort pour vos déplacements professionnels ou personnels.', status: 'available' },
  { id: '2', name: 'Toyota Land Cruiser Prado', category: '4x4 / SUV', price: 65000, image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80', transmission: 'Automatique', seats: 7, fuel: 'Diesel', luggage: 4, description: 'Robuste et spacieux, idéal pour explorer le Sénégal en toute sécurité.', status: 'rented' },
  { id: '3', name: 'Renault Logan', category: 'Économique', price: 20000, image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80', transmission: 'Manuelle', seats: 5, fuel: 'Essence', luggage: 2, description: 'Pratique et économique pour vos trajets quotidiens en ville.', status: 'soon', returnDate: '25 Avr' },
  { id: '4', name: 'Peugeot 208', category: 'Citadine', price: 25000, image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80', transmission: 'Automatique', seats: 5, fuel: 'Essence', luggage: 1, description: 'Compacte et maniable, parfaite pour se faufiler dans la circulation dakaroise.', status: 'available' },
  { id: '5', name: 'Toyota HiAce', category: 'Minibus / Van', price: 70000, image: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?auto=format&fit=crop&q=80', transmission: 'Manuelle', seats: 15, fuel: 'Diesel', luggage: 6, description: 'La solution idéale pour les voyages en groupe ou les excursions touristiques.', status: 'rented' },
  { id: '6', name: 'BMW Série 5', category: 'Berline Luxe', price: 55000, image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80', transmission: 'Automatique', seats: 5, fuel: 'Essence', luggage: 2, description: 'Élégance et performance réunies dans cette berline haut de gamme.', status: 'soon', returnDate: '28 Avr' },
];

const INITIAL_FOUNDER: Founder = {
  name: "Ndongo Fall",
  bio: "Passionné par l'automobile et fort de plusieurs années d'expérience dans le service client, j'ai fondé cette agence avec une vision claire : offrir une expérience de location premium, fiable et accessible au Sénégal. Notre priorité absolue est votre sécurité, votre confort et votre entière satisfaction lors de chacun de vos déplacements.",
  image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80"
};

const INITIAL_OPTIONS: BookingOption[] = [
  { id: 'opt1', name: 'Chauffeur professionnel', description: "Tranquillité d'esprit totale", price: 15000 },
  { id: 'opt2', name: 'Siège bébé', description: 'Sécurité pour vos enfants', price: 5000 },
  { id: 'opt3', name: 'Assurance tous risques', description: 'Couverture maximale', price: 10000 }
];

const INITIAL_COMPANY_INFO: CompanyInfo = {
  description: "Votre partenaire de confiance pour la location de véhicules au Sénégal. Courte et longue durée, avec ou sans chauffeur.",
  address: "Dakar, Sénégal",
  phone: "+221 77 000 00 00",
  email: "contact@ndongofall.com",
  whatsapp: "221770000000"
};

interface VehicleContextType {
  vehicles: Vehicle[];
  founder: Founder;
  reservations: Reservation[];
  bookingOptions: BookingOption[];
  updateStatus: (id: string, status: VehicleStatus, returnDate?: string) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicleDetails: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  updateFounder: (founder: Founder) => void;
  addReservation: (reservation: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => void;
  updateReservationStatus: (id: string, status: ReservationStatus) => void;
  addBookingOption: (option: Omit<BookingOption, 'id'>) => void;
  updateBookingOption: (id: string, option: Partial<BookingOption>) => void;
  deleteBookingOption: (id: string) => void;
  logo: string;
  updateLogo: (logo: string) => void;
  companyInfo: CompanyInfo;
  updateCompanyInfo: (info: CompanyInfo) => void;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export const VehicleProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [founder, setFounder] = useState<Founder>(INITIAL_FOUNDER);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [bookingOptions, setBookingOptions] = useState<BookingOption[]>(INITIAL_OPTIONS);
  const [logo, setLogo] = useState<string>('');
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(INITIAL_COMPANY_INFO);

  const updateStatus = (id: string, status: VehicleStatus, returnDate?: string) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, status, returnDate } : v));
  };

  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle = { ...vehicle, id: Date.now().toString() };
    setVehicles(prev => [...prev, newVehicle]);
  };

  const updateVehicleDetails = (id: string, updatedFields: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updatedFields } : v));
  };

  const deleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  const updateFounder = (newFounder: Founder) => {
    setFounder(newFounder);
  };

  const addReservation = (reservation: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => {
    const newReservation: Reservation = {
      ...reservation,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setReservations(prev => [newReservation, ...prev]);
  };

  const updateReservationStatus = (id: string, status: ReservationStatus) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    
    // Automatically update the vehicle's status
    const reservation = reservations.find(r => r.id === id);
    if (reservation) {
      if (status === 'confirmed') {
        updateStatus(reservation.vehicleId, 'rented');
      } else if (status === 'completed' || status === 'cancelled' || status === 'pending') {
        updateStatus(reservation.vehicleId, 'available');
      }
    }
  };

  const addBookingOption = (option: Omit<BookingOption, 'id'>) => {
    const newOption = { ...option, id: Date.now().toString() };
    setBookingOptions(prev => [...prev, newOption]);
  };

  const updateBookingOption = (id: string, updatedFields: Partial<BookingOption>) => {
    setBookingOptions(prev => prev.map(o => o.id === id ? { ...o, ...updatedFields } : o));
  };

  const deleteBookingOption = (id: string) => {
    setBookingOptions(prev => prev.filter(o => o.id !== id));
  };

  const updateLogo = (newLogo: string) => {
    setLogo(newLogo);
  };

  const updateCompanyInfo = (info: CompanyInfo) => {
    setCompanyInfo(info);
  };

  return (
    <VehicleContext.Provider value={{ 
      vehicles, 
      founder, 
      reservations,
      bookingOptions,
      logo,
      companyInfo,
      updateStatus, 
      addVehicle, 
      updateVehicleDetails, 
      deleteVehicle, 
      updateFounder,
      addReservation,
      updateReservationStatus,
      addBookingOption,
      updateBookingOption,
      deleteBookingOption,
      updateLogo,
      updateCompanyInfo
    }}>
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicles = () => {
  const context = useContext(VehicleContext);
  if (!context) throw new Error("useVehicles must be used within VehicleProvider");
  return context;
};
