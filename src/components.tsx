import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, MapPin, Phone, Menu, X, User, Shield, Mail } from 'lucide-react';
import { useVehicles } from './VehicleContext';
import { Vehicle } from './types';

export const TopBanner = () => {
  const { vehicles } = useVehicles();
  const available = vehicles.filter(v => v.status === 'available').length;
  const soon = vehicles.filter(v => v.status === 'soon').length;
  const rented = vehicles.filter(v => v.status === 'rented').length;

  return (
    <div className="bg-gray-900 text-white text-xs md:text-sm py-2 px-4 flex flex-wrap justify-center gap-4 md:gap-8 items-center border-b border-gray-800">
      <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <span className="font-medium">{available} Disponibles</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
        <span className="font-medium">{soon} Bientôt libres</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        <span className="font-medium">{rented} Loués</span>
      </div>
    </div>
  );
};

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logo, companyInfo } = useVehicles();

  return (
    <nav className="bg-[var(--color-navy)] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              {logo ? (
                <img src={logo} alt="Ndongo Fall Location" className="h-12 object-contain" />
              ) : (
                <>
                  <Car className="h-8 w-8 text-[var(--color-gold)]" />
                  <span className="font-serif text-xl font-bold tracking-wider">NDONGO FALL<br/><span className="text-[var(--color-gold)] text-sm">LOCATION</span></span>
                </>
              )}
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-[var(--color-gold)] transition-colors">Accueil</Link>
            <Link to="/catalog" className="hover:text-[var(--color-gold)] transition-colors">Notre Flotte</Link>
            <Link to="/admin/disponibilites" className="hover:text-[var(--color-gold)] transition-colors">Admin</Link>
            <div className="flex items-center gap-3">
              <a href={`https://wa.me/${companyInfo.whatsapp}`} target="_blank" rel="noreferrer" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                <Phone className="w-4 h-4" />
                WhatsApp
              </a>
              <Link to="/catalog" className="bg-[var(--color-gold)] text-white px-5 py-2.5 rounded-md font-medium hover:bg-yellow-600 transition-colors">
                Réserver
              </Link>
            </div>
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white hover:text-[var(--color-gold)]">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-[var(--color-navy)] pb-4 px-4">
          <Link to="/" onClick={() => setIsOpen(false)} className="block py-2 hover:text-[var(--color-gold)]">Accueil</Link>
          <Link to="/catalog" onClick={() => setIsOpen(false)} className="block py-2 hover:text-[var(--color-gold)]">Notre Flotte</Link>
          <Link to="/admin/disponibilites" onClick={() => setIsOpen(false)} className="block py-2 hover:text-[var(--color-gold)]">Admin</Link>
          <div className="mt-4 flex flex-col gap-2">
            <a href={`https://wa.me/${companyInfo.whatsapp}`} target="_blank" rel="noreferrer" className="bg-white/10 text-white px-4 py-2 rounded-md text-center flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" /> WhatsApp
            </a>
            <Link to="/catalog" onClick={() => setIsOpen(false)} className="bg-[var(--color-gold)] text-white px-4 py-2 rounded-md font-medium text-center">
              Réserver
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export const Footer = () => {
  const { logo, companyInfo } = useVehicles();
  
  return (
    <footer className="bg-[var(--color-navy)] text-gray-300 py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            {logo ? (
              <img src={logo} alt="Ndongo Fall Location" className="h-10 object-contain" />
            ) : (
              <>
                <Car className="h-6 w-6 text-[var(--color-gold)]" />
                <span className="font-serif text-lg font-bold text-white">NDONGO FALL LOCATION</span>
              </>
            )}
          </div>
          <p className="text-sm">{companyInfo.description}</p>
        </div>
      <div>
        <h3 className="text-white font-bold mb-4 font-serif">Liens Rapides</h3>
        <ul className="space-y-2 text-sm">
          <li><Link to="/catalog" className="hover:text-[var(--color-gold)]">Voir la flotte</Link></li>
          <li><a href={`https://wa.me/${companyInfo.whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-[var(--color-gold)]">Nous contacter</a></li>
          <li><a href="#" className="hover:text-[var(--color-gold)]">Conditions générales</a></li>
        </ul>
      </div>
      <div>
        <h3 className="text-white font-bold mb-4 font-serif">Contact</h3>
        <ul className="space-y-4 text-sm">
          <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[var(--color-gold)]" /> {companyInfo.address}</li>
          <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-[var(--color-gold)]" /> {companyInfo.phone}</li>
          <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-[var(--color-gold)]" /> {companyInfo.email}</li>
        </ul>
      </div>
      </div>
    </footer>
  );
};

export const VehicleCard = ({ car }: { car: Vehicle }) => {
  const isRented = car.status === 'rented';
  const isSoon = car.status === 'soon';
  const isAvailable = car.status === 'available';

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col relative group">
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        {isAvailable && <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">Disponible</span>}
        {isSoon && <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">Bientôt libre {car.returnDate && `(Retour le ${car.returnDate})`}</span>}
        {isRented && <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">Loué</span>}
      </div>

      <div className="h-56 overflow-hidden relative">
        <img src={car.image} alt={car.name} className={`w-full h-full object-cover transition-transform duration-500 ${isRented ? 'grayscale opacity-80' : 'group-hover:scale-105'}`} />
        {isRented && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="text-white text-3xl font-bold tracking-widest border-4 border-white px-4 py-2 rotate-[-15deg]">LOUÉ</span>
          </div>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="text-sm text-[var(--color-gold)] font-semibold mb-1">{car.category}</div>
        <h3 className="text-xl font-bold text-[var(--color-navy)] mb-4">{car.name}</h3>
        
        <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600 mb-6 flex-1">
          <div className="flex items-center gap-2"><User className="w-4 h-4" /> {car.seats} places</div>
          <div className="flex items-center gap-2"><Car className="w-4 h-4" /> {car.transmission}</div>
          <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> {car.fuel}</div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <div className="text-xl font-bold text-[var(--color-navy)]">{car.price.toLocaleString('fr-FR')} FCFA<span className="text-sm font-normal text-gray-500">/j</span></div>
          {isRented ? (
            <button disabled className="bg-gray-300 text-gray-500 px-4 py-2 rounded font-medium cursor-not-allowed">
              Indisponible
            </button>
          ) : (
            <Link to={`/vehicle/${car.id}`} className="bg-[var(--color-navy)] text-white px-4 py-2 rounded font-medium hover:bg-blue-900 transition-colors">
              Réserver
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
