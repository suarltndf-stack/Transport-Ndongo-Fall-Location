import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Car, User, Shield, Check, AlertCircle, Star } from 'lucide-react';
import { useVehicles } from '../VehicleContext';

export const VehicleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vehicles, reservations, reviews, addReview } = useVehicles();
  const car = vehicles.find(v => v.id === id);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [reviewForm, setReviewForm] = useState({ authorName: '', rating: 5, text: '' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (!car) return <div className="p-20 text-center">Véhicule introuvable.</div>;

  const isRented = car.status === 'rented';
  const isSoon = car.status === 'soon';
  const isAvailable = car.status === 'available';

  const confirmedReservations = reservations.filter(r => r.vehicleId === car.id && r.status === 'confirmed');
  
  const carReviews = reviews.filter(r => r.vehicleId === car.id || !r.vehicleId);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addReview({
      ...reviewForm,
      vehicleId: car.id
    });
    setReviewSubmitted(true);
    setReviewForm({ authorName: '', rating: 5, text: '' });
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

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
              <div className="flex flex-col gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Tarif de location (Dakar)</div>
                  <div className="text-3xl font-bold text-[var(--color-navy)]">{car.price.toLocaleString('fr-FR')} FCFA<span className="text-lg font-normal text-gray-500">/jour</span></div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Tarif de location (Hors Dakar)</div>
                  <div className="text-2xl font-bold text-[var(--color-navy)]">{(car.priceOutsideDakar || car.price).toLocaleString('fr-FR')} FCFA<span className="text-base font-normal text-gray-500">/jour</span></div>
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

        {/* Reviews Section */}
        <div className="mt-16 border-t border-gray-100 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold font-serif text-[var(--color-navy)] mb-8">Avis sur ce véhicule</h3>
              {carReviews.length > 0 ? (
                <div className="space-y-6">
                  {carReviews.map(review => (
                    <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex text-[var(--color-gold)] mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <p className="text-gray-600 italic mb-4">"{review.text}"</p>
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-[var(--color-navy)]">{review.authorName}</div>
                        <div className="text-sm text-gray-400">{new Date(review.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
              )}
            </div>

            <div>
              <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                <h3 className="text-2xl font-bold font-serif text-[var(--color-navy)] mb-6">Laisser un avis</h3>
                {reviewSubmitted ? (
                  <div className="bg-green-50 text-green-800 p-4 rounded-lg border border-green-200">
                    Merci pour votre avis ! Il a été publié avec succès.
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Votre nom</label>
                      <input 
                        type="text" 
                        required 
                        value={reviewForm.authorName}
                        onChange={e => setReviewForm({...reviewForm, authorName: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)]"
                        placeholder="Jean Dupont"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm({...reviewForm, rating: star})}
                            className="focus:outline-none"
                          >
                            <Star className={`w-8 h-8 ${star <= reviewForm.rating ? 'fill-[var(--color-gold)] text-[var(--color-gold)]' : 'text-gray-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Votre commentaire</label>
                      <textarea 
                        required 
                        rows={4}
                        value={reviewForm.text}
                        onChange={e => setReviewForm({...reviewForm, text: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)]"
                        placeholder="Partagez votre expérience..."
                      ></textarea>
                    </div>
                    <button type="submit" className="w-full bg-[var(--color-gold)] text-white py-3 rounded-lg font-bold hover:bg-yellow-600 transition-colors">
                      Publier l'avis
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
