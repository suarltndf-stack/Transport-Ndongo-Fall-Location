import React, { createContext, useState, useContext, useEffect } from 'react';
import { Vehicle, VehicleStatus, Founder, Reservation, ReservationStatus, BookingOption, CompanyInfo } from './types';
import { db, auth } from './firebase';
import { collection, doc, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc, getDocFromServer, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}
testConnection();

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
  updateStatus: (id: string, status: VehicleStatus, returnDate?: string) => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<void>;
  updateVehicleDetails: (id: string, vehicle: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  updateFounder: (founder: Founder) => Promise<void>;
  addReservation: (reservation: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateReservationStatus: (id: string, status: ReservationStatus) => Promise<void>;
  addBookingOption: (option: Omit<BookingOption, 'id'>) => Promise<void>;
  updateBookingOption: (id: string, option: Partial<BookingOption>) => Promise<void>;
  deleteBookingOption: (id: string) => Promise<void>;
  logo: string;
  updateLogo: (logo: string) => Promise<void>;
  companyInfo: CompanyInfo;
  updateCompanyInfo: (info: CompanyInfo) => Promise<void>;
  isAuthReady: boolean;
  isAdmin: boolean;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export const VehicleProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [founder, setFounder] = useState<Founder>(INITIAL_FOUNDER);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [bookingOptions, setBookingOptions] = useState<BookingOption[]>(INITIAL_OPTIONS);
  const [logo, setLogo] = useState<string>('');
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(INITIAL_COMPANY_INFO);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthReady(true);
      if (user) {
        // Check if admin
        try {
          const userDoc = await getDocFromServer(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setIsAdmin(true);
          } else if (user.email === 'suarltndf@gmail.com' && user.emailVerified) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (e) {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    const unsubVehicles = onSnapshot(collection(db, 'vehicles'), (snapshot) => {
      if (!snapshot.empty) {
        setVehicles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle)));
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'vehicles'));

    const unsubOptions = onSnapshot(collection(db, 'bookingOptions'), (snapshot) => {
      if (!snapshot.empty) {
        setBookingOptions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookingOption)));
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'bookingOptions'));

    const unsubSettings = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.founder) setFounder(data.founder);
        if (data.logo !== undefined) setLogo(data.logo);
        if (data.companyInfo) setCompanyInfo(data.companyInfo);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/general'));

    let unsubReservations = () => {};
    if (isAdmin) {
      unsubReservations = onSnapshot(collection(db, 'reservations'), (snapshot) => {
        setReservations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation)));
      }, (error) => handleFirestoreError(error, OperationType.LIST, 'reservations'));
    }

    return () => {
      unsubVehicles();
      unsubOptions();
      unsubSettings();
      unsubReservations();
    };
  }, [isAuthReady, isAdmin]);

  // Seed data if admin and empty
  useEffect(() => {
    if (isAdmin && isAuthReady) {
      const seedData = async () => {
        try {
          const vSnap = await getDocs(collection(db, 'vehicles'));
          if (vSnap.empty) {
            for (const v of INITIAL_VEHICLES) {
              await setDoc(doc(db, 'vehicles', v.id), v);
            }
          }
          const oSnap = await getDocs(collection(db, 'bookingOptions'));
          if (oSnap.empty) {
            for (const o of INITIAL_OPTIONS) {
              await setDoc(doc(db, 'bookingOptions', o.id), o);
            }
          }
          const sSnap = await getDocFromServer(doc(db, 'settings', 'general'));
          if (!sSnap.exists()) {
            await setDoc(doc(db, 'settings', 'general'), {
              founder: INITIAL_FOUNDER,
              logo: '',
              companyInfo: INITIAL_COMPANY_INFO
            });
          }
        } catch (e) {
          console.error("Failed to seed data", e);
        }
      };
      seedData();
    }
  }, [isAdmin, isAuthReady]);

  const updateStatus = async (id: string, status: VehicleStatus, returnDate?: string) => {
    try {
      const updateData: any = { status };
      if (returnDate !== undefined) updateData.returnDate = returnDate;
      await updateDoc(doc(db, 'vehicles', id), updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `vehicles/${id}`);
    }
  };

  const addVehicle = async (vehicle: Omit<Vehicle, 'id'>) => {
    try {
      const newDoc = doc(collection(db, 'vehicles'));
      await setDoc(newDoc, { ...vehicle, id: newDoc.id });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'vehicles');
    }
  };

  const updateVehicleDetails = async (id: string, updatedFields: Partial<Vehicle>) => {
    try {
      await updateDoc(doc(db, 'vehicles', id), updatedFields);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `vehicles/${id}`);
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'vehicles', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `vehicles/${id}`);
    }
  };

  const updateFounder = async (newFounder: Founder) => {
    try {
      await setDoc(doc(db, 'settings', 'general'), { founder: newFounder }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/general');
    }
  };

  const addReservation = async (reservation: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => {
    try {
      const newDoc = doc(collection(db, 'reservations'));
      const newReservation: Reservation = {
        ...reservation,
        id: newDoc.id,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      await setDoc(newDoc, newReservation);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reservations');
    }
  };

  const updateReservationStatus = async (id: string, status: ReservationStatus) => {
    try {
      await updateDoc(doc(db, 'reservations', id), { status });
      
      const reservation = reservations.find(r => r.id === id);
      if (reservation) {
        if (status === 'confirmed') {
          await updateStatus(reservation.vehicleId, 'rented');
        } else if (status === 'completed' || status === 'cancelled' || status === 'pending') {
          await updateStatus(reservation.vehicleId, 'available');
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reservations/${id}`);
    }
  };

  const addBookingOption = async (option: Omit<BookingOption, 'id'>) => {
    try {
      const newDoc = doc(collection(db, 'bookingOptions'));
      await setDoc(newDoc, { ...option, id: newDoc.id });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'bookingOptions');
    }
  };

  const updateBookingOption = async (id: string, updatedFields: Partial<BookingOption>) => {
    try {
      await updateDoc(doc(db, 'bookingOptions', id), updatedFields);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bookingOptions/${id}`);
    }
  };

  const deleteBookingOption = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'bookingOptions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `bookingOptions/${id}`);
    }
  };

  const updateLogo = async (newLogo: string) => {
    try {
      await setDoc(doc(db, 'settings', 'general'), { logo: newLogo }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/general');
    }
  };

  const updateCompanyInfo = async (info: CompanyInfo) => {
    try {
      await setDoc(doc(db, 'settings', 'general'), { companyInfo: info }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/general');
    }
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
      updateCompanyInfo,
      isAuthReady,
      isAdmin
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
