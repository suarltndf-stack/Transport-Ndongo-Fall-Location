import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Car, User, Shield, Check, AlertCircle } from 'lucide-react';
import { useVehicles } from '../VehicleContext';

export const VehicleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vehicles } = useVehicles();
  const car = vehicles.find(v => v.id === id);
  const [selectedImageIdx, setSelectedImageIdx] = React.useState(0);

  if (!car) return <div className="p-20 text-center">Véhicule introuvable.</div>;

  const isRented = car.status === 'rented';
  const isSoon = car.status === 'soon';
  const isAvailable = car.status === 'available';

  // Find confirmed reservations for this vehicle to show unavailable dates
  const { reservations } = useVehicles();
  const confirmedReservations = reservations.filter(r => r.vehicleId === car.id && r.status === 'confirmed');

  const gallery = car.gallery?.length ? car.gallery : (car.image ? [car.image] : []);
  const currentImage = gallery[selectedImageIdx] || car.image;

  return (
    <div className="py-12 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/catalog" className="text-[var(--color-gold)] hover:underline mb-6 inline-block">&larr; Retour au catalogue</Link>
        
        {/* Status Banner */}
        <div className={`mb-8 p-4 rounded-lg flex items-center gap-3 border ${isAvailable ? 'bg-green-50 border-green-200 text-green-800' : isSoon ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
          <AlertCircle className="w-6 h-6 shrink-0" />
          <div>
            <h3 className="font-bold text-lg">
              {isAvailable && 'Ce véhicule est actuellement disponible.'}
              {isSoon && `Ce véhicule sera bientôt libre (Retour prévu : ${car.returnDate}).`}
              {isRented && 'Ce véhicule est actuellement en cours de location.'}
            </h3>
            <p className="text-sm opacity-90">
              {isAvailable && 'Vous pouvez procéder à la réservation immédiatement.'}
              {isSoon && 'Vous pouvez le réserver pour des dates ultérieures à son retour.'}
              {isRented && 'Vous pouvez tout de même le réserver pour une période ultérieure.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl overflow-hidden shadow-lg h-[400px] lg:h-[500px] relative">
              <img src={currentImage} alt={car.name} className={`w-full h-full object-cover transition-opacity duration-300 ${isRented ? 'grayscale opacity-80' : ''}`} />
              {isRented && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="text-white text-4xl font-bold tracking-widest border-4 border-white px-6 py-3 rotate-[-15deg]">LOUÉ</span>
                </div>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {gallery.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`relative rounded-lg overflow-hidden h-24 border-2 transition-all ${selectedImageIdx === idx ? 'border-[var(--color-gold)] shadow-md' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <img src={img} alt={`${car.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="text-sm font-bold text-[var(--color-gold)] tracking-wider uppercase mb-2">{car.category}</div>
            <h1 className="text-4xl font-bold font-serif text-[var(--color-navy)] mb-4">{car.name}</h1>
            <p className="text-gray-600 mb-8 text-lg">{car.description}</p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3 border border-gray-100">
                <User className="w-6 h-6 text-[var(--color-navy)]" />
                <div>
                  <div className="text-xs text-gray-500 uppercase">Places</div>
                  <div className="font-bold text-[var(--color-navy)]">{car.seats}</div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3 border border-gray-100">
                <Car className="w-6 h-6 text-[var(--color-navy)]" />
                <div>
                  <div className="text-xs text-gray-500 uppercase">Transmission</div>
                  <div className="font-bold text-[var(--color-navy)]">{car.transmission}</div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3 border border-gray-100">
                <Shield className="w-6 h-6 text-[var(--color-navy)]" />
                <div>
                  <div className="text-xs text-gray-500 uppercase">Carburant</div>
                  <div className="font-bold text-[var(--color-navy)]">{car.fuel}</div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3 border border-gray-100">
                <Check className="w-6 h-6 text-[var(--color-navy)]" />
                <div>
                  <div className="text-xs text-gray-500 uppercase">Climatisation</div>
                  <div className="font-bold text-[var(--color-navy)]">Oui</div>
                </div>
              </div>
            </div>

            <div className="mt-auto bg-blue-50 p-6 rounded-xl border border-blue-100">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Tarif de location</div>
                  <div className="text-3xl font-bold text-[var(--color-navy)]">{car.price.toLocaleString('fr-FR')} FCFA<span className="text-lg font-normal text-gray-500">/jour</span></div>
                </div>
              </div>
              
              {confirmedReservations.length > 0 && (
                <div className="mb-6 bg-white p-3 rounded border border-blue-100 text-sm">
                  <div className="font-bold text-[var(--color-navy)] mb-2">Périodes indisponibles :</div>
                  <ul className="list-disc pl-5 text-gray-600">
                    {confirmedReservations.map(res => {
                      const start = new Date(res.startDate);
                      const end = new Date(start);
                      end.setDate(end.getDate() + res.duration);
                      return (
                        <li key={res.id}>
                          Du {start.toLocaleDateString('fr-FR')} au {end.toLocaleDateString('fr-FR')}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <button onClick={() => navigate(`/book/${car.id}`)} className="w-full bg-[var(--color-navy)] text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-900 transition-colors">
                Réserver ce véhicule
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
