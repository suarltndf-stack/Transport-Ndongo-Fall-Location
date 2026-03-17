import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, CreditCard, User, ChevronRight, Quote } from 'lucide-react';
import { useVehicles } from '../VehicleContext';
import { VehicleCard } from '../components';

export const HomePage = () => {
  const { vehicles, founder } = useVehicles();
  const featuredVehicles = vehicles.slice(0, 3);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-[var(--color-navy)] text-white py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80" 
            alt="Dakar route" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-navy)] to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold font-serif leading-tight mb-6">
              L'excellence de la location automobile au Sénégal
            </h1>
            <p className="text-xl text-gray-300 mb-10 font-light">
              Découvrez notre flotte de véhicules premium pour vos déplacements professionnels, personnels ou touristiques.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/catalog" className="bg-[var(--color-gold)] text-white px-8 py-4 rounded-md font-bold text-lg hover:bg-yellow-600 transition-colors text-center shadow-lg">
                Réserver maintenant
              </Link>
              <a href="https://wa.me/221770000000" target="_blank" rel="noreferrer" className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-md font-bold text-lg hover:bg-white/20 transition-colors text-center">
                Contactez-nous
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-[var(--color-gold)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-navy)] mb-4 font-serif">Fiabilité Garantie</h3>
              <p className="text-gray-600">Tous nos véhicules sont rigoureusement entretenus et révisés avant chaque location pour votre sécurité.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <User className="w-8 h-8 text-[var(--color-gold)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-navy)] mb-4 font-serif">Chauffeurs Professionnels</h3>
              <p className="text-gray-600">Optez pour la tranquillité avec nos chauffeurs expérimentés, courtois et connaissant parfaitement le pays.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <CreditCard className="w-8 h-8 text-[var(--color-gold)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-navy)] mb-4 font-serif">Paiement Flexible</h3>
              <p className="text-gray-600">Réservez en ligne avec un acompte de 30% ou payez à la livraison du véhicule. C'est vous qui choisissez.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Biography Section */}
      <section className="py-20 bg-[var(--color-navy)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute -top-6 -left-6 text-[var(--color-gold)] opacity-50">
                <Quote className="w-24 h-24" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-serif mb-6 relative z-10">Le mot du fondateur</h2>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed relative z-10 italic">
                "{founder.bio}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-1 bg-[var(--color-gold)]"></div>
                <span className="font-bold text-xl tracking-wider uppercase">{founder.name}</span>
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 border-2 border-[var(--color-gold)] rounded-2xl transform translate-x-4 translate-y-4"></div>
                <img 
                  src={founder.image} 
                  alt={founder.name} 
                  className="relative z-10 w-full max-w-md h-[500px] object-cover rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold font-serif text-[var(--color-navy)] mb-2">Véhicules Populaires</h2>
              <p className="text-gray-600">Découvrez notre sélection des véhicules les plus demandés.</p>
            </div>
            <Link to="/catalog" className="hidden md:flex items-center text-[var(--color-gold)] font-semibold hover:text-yellow-600 transition-colors">
              Voir tout le catalogue <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredVehicles.map(car => (
              <VehicleCard key={car.id} car={car} />
            ))}
          </div>

          <div className="mt-10 text-center md:hidden">
            <Link to="/catalog" className="inline-flex items-center text-[var(--color-gold)] font-semibold hover:text-yellow-600 transition-colors">
              Voir tout le catalogue <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
