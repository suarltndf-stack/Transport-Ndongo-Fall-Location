import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useVehicles } from '../VehicleContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const BookingPage = () => {
  const { id } = useParams();
  const { vehicles, addReservation, reservations, bookingOptions } = useVehicles();
  const car = vehicles.find(v => v.id === id);

  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState<number>(1);
  const [options, setOptions] = useState<Record<string, boolean>>({});
  const [paymentMethod, setPaymentMethod] = useState('delivery');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // New fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [zone, setZone] = useState('Dakar');
  const [zoneDetails, setZoneDetails] = useState('');
  const [comments, setComments] = useState('');

  if (!car) return <div className="p-20 text-center">Véhicule introuvable.</div>;

  const confirmedReservations = reservations.filter(r => r.vehicleId === car.id && r.status === 'confirmed');
  
  const excludedIntervals = confirmedReservations.map(res => {
    const start = new Date(res.startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + res.duration - 1);
    return { start, end };
  });

  const days = Math.max(1, duration);
  const selectedPrice = zone === 'Dakar' ? car.price : (car.priceOutsideDakar || car.price);
  const basePrice = days * selectedPrice;
  const optionsPrice = bookingOptions.reduce((total, option) => {
    return total + (options[option.id] ? option.price * days : 0);
  }, 0);
  const totalPrice = basePrice + optionsPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check for overlapping confirmed reservations
    const newStart = new Date(startDate);
    const newEnd = new Date(newStart);
    newEnd.setDate(newEnd.getDate() + duration);

    const hasOverlap = reservations.some(res => {
      if (res.vehicleId !== car.id || res.status !== 'confirmed') return false;
      
      const resStart = new Date(res.startDate);
      const resEnd = new Date(resStart);
      resEnd.setDate(resEnd.getDate() + res.duration);

      // Check if dates overlap
      return (newStart < resEnd && newEnd > resStart);
    });

    if (hasOverlap) {
      setError('Ce véhicule est déjà réservé pour une partie ou la totalité de cette période. Veuillez choisir d\'autres dates.');
      return;
    }

    addReservation({
      vehicleId: car.id,
      vehicleName: car.name,
      startDate,
      duration,
      firstName,
      lastName,
      phone,
      zone,
      zoneDetails,
      comments,
      options,
      paymentMethod,
      totalPrice
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="py-20 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold font-serif text-[var(--color-navy)] mb-4">Réservation Confirmée !</h2>
          <p className="text-gray-600 mb-8">Merci {firstName} pour votre confiance. Notre équipe vous contactera très prochainement au {phone} pour finaliser les détails.</p>
          <Link to="/" className="bg-[var(--color-navy)] text-white px-8 py-3 rounded-md font-bold hover:bg-blue-900 transition-colors inline-block">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={`/vehicle/${car.id}`} className="text-[var(--color-gold)] hover:underline mb-6 inline-block">&larr; Retour au véhicule</Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8">
              <h2 className="text-2xl font-bold font-serif text-[var(--color-navy)] mb-6">Détails de la réservation</h2>
              <form onSubmit={handleSubmit}>
                
                <h3 className="text-lg font-bold text-[var(--color-navy)] mb-4 border-b pb-2">Période de location</h3>
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm font-medium">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">À partir du (Date de départ)</label>
                    <DatePicker
                      selected={startDate ? new Date(startDate) : null}
                      onChange={(date: Date | null) => setStartDate(date ? format(date, 'yyyy-MM-dd') : '')}
                      excludeDateIntervals={excludedIntervals}
                      minDate={new Date()}
                      locale={fr}
                      dateFormat="dd/MM/yyyy"
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)]"
                      wrapperClassName="w-full"
                      placeholderText="Sélectionnez une date"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de jours</label>
                    <input type="number" min="1" required value={duration} onChange={e => setDuration(parseInt(e.target.value) || 1)} className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)]" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[var(--color-navy)] mb-4 border-b pb-2">Vos coordonnées</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                    <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)]" placeholder="Ex: Jean" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                    <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)]" placeholder="Ex: Dupont" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                    <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)]" placeholder="Ex: +221 77 000 00 00" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zone de déplacement</label>
                    <select value={zone} onChange={e => setZone(e.target.value)} className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)]">
                      <option value="Dakar">Dakar et banlieue</option>
                      <option value="Hors Dakar">Hors Dakar (Régions)</option>
                    </select>
                  </div>
                  
                  {zone === 'Hors Dakar' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Précisez la zone (Région / Ville)</label>
                      <input type="text" required value={zoneDetails} onChange={e => setZoneDetails(e.target.value)} className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)]" placeholder="Ex: Saly, Saint-Louis, Touba..." />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Autres informations / Commentaires</label>
                    <textarea rows={3} value={comments} onChange={e => setComments(e.target.value)} className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)]" placeholder="Précisions sur le lieu de livraison, horaires, besoins spécifiques..."></textarea>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[var(--color-navy)] mb-4 border-b pb-2">Options supplémentaires</h3>
                <div className="space-y-4 mb-8">
                  {bookingOptions.map(option => (
                    <label key={option.id} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={options[option.id] || false} 
                        onChange={e => setOptions({...options, [option.id]: e.target.checked})} 
                        className="w-5 h-5 text-[var(--color-gold)] focus:ring-[var(--color-gold)] rounded" 
                      />
                      <div className="ml-4 flex-1">
                        <span className="block font-medium text-gray-900">{option.name}</span>
                        <span className="block text-sm text-gray-500">{option.description}</span>
                      </div>
                      <span className="font-bold text-[var(--color-navy)]">+{option.price.toLocaleString('fr-FR')} FCFA/j</span>
                    </label>
                  ))}
                  {bookingOptions.length === 0 && (
                    <p className="text-gray-500 italic text-sm">Aucune option supplémentaire disponible pour le moment.</p>
                  )}
                </div>

                <h3 className="text-lg font-bold text-[var(--color-navy)] mb-4 border-b pb-2">Mode de paiement</h3>
                <div className="space-y-4 mb-8">
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="radio" name="payment" value="delivery" checked={paymentMethod === 'delivery'} onChange={e => setPaymentMethod(e.target.value)} className="w-5 h-5 text-[var(--color-gold)] focus:ring-[var(--color-gold)]" />
                    <span className="ml-4 font-medium text-gray-900">Paiement à la livraison</span>
                  </label>
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={e => setPaymentMethod(e.target.value)} className="w-5 h-5 text-[var(--color-gold)] focus:ring-[var(--color-gold)]" />
                    <div className="ml-4">
                      <span className="block font-medium text-gray-900">Paiement en ligne (Acompte 30%)</span>
                      <span className="block text-sm text-gray-500">Payez {Math.round(totalPrice * 0.3).toLocaleString('fr-FR')} FCFA maintenant</span>
                    </div>
                  </label>
                </div>

                <button type="submit" className="w-full bg-[var(--color-navy)] text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-900 transition-colors">
                  Confirmer la réservation
                </button>
              </form>
            </div>
          </div>

          <div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-xl font-bold font-serif text-[var(--color-navy)] mb-6">Résumé</h3>
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <img src={car.image} alt={car.name} className="w-20 h-16 object-cover rounded-md" />
                <div>
                  <div className="font-bold text-[var(--color-navy)]">{car.name}</div>
                  <div className="text-sm text-gray-500">{car.category}</div>
                </div>
              </div>
              
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Durée</span>
                  <span className="font-medium">{days} jour(s)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tarif de base</span>
                  <span className="font-medium">{basePrice.toLocaleString('fr-FR')} FCFA</span>
                </div>
                {optionsPrice > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Options</span>
                    <span className="font-medium">{optionsPrice.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end">
                <span className="text-lg font-bold text-[var(--color-navy)]">Total</span>
                <span className="text-2xl font-bold text-[var(--color-gold)]">{totalPrice.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
