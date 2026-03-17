import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useVehicles } from '../VehicleContext';
import { VehicleCard } from '../components';

export const CatalogPage = () => {
  const { vehicles, reservations } = useVehicles();
  const [filter, setFilter] = useState('Tous');
  const [availableOnly, setAvailableOnly] = useState(false);
  
  // Availability checker state
  const [checkVehicle, setCheckVehicle] = useState('');
  const [checkDate, setCheckDate] = useState('');
  const [checkResult, setCheckResult] = useState<string | null>(null);

  const categories = ['Tous', 'Berline Luxe', '4x4 / SUV', 'Économique', 'Citadine', 'Minibus / Van'];

  let filteredVehicles = filter === 'Tous' ? vehicles : vehicles.filter(v => v.category === filter);
  if (availableOnly) {
    filteredVehicles = filteredVehicles.filter(v => v.status === 'available');
  }

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkVehicle || !checkDate) {
      setCheckResult('Veuillez sélectionner un véhicule et une date.');
      return;
    }
    
    const v = vehicles.find(car => car.id === checkVehicle);
    if (!v) return;

    const targetDate = new Date(checkDate);
    
    // Check if there is any confirmed reservation covering this date
    const hasOverlap = reservations.some(res => {
      if (res.vehicleId !== v.id || res.status !== 'confirmed') return false;
      const resStart = new Date(res.startDate);
      const resEnd = new Date(resStart);
      resEnd.setDate(resEnd.getDate() + res.duration);
      return targetDate >= resStart && targetDate < resEnd;
    });

    if (hasOverlap) {
      setCheckResult(`${v.name} est déjà réservé à cette date.`);
    } else {
      setCheckResult(`${v.name} est disponible à cette date !`);
    }
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold font-serif text-[var(--color-navy)] mb-8">Notre Flotte</h1>
        
        {/* Availability Checker */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-10">
          <h2 className="text-lg font-bold text-[var(--color-navy)] mb-4 flex items-center gap-2"><Search className="w-5 h-5" /> Vérifier la disponibilité</h2>
          <form onSubmit={handleCheck} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Véhicule</label>
              <select value={checkVehicle} onChange={e => setCheckVehicle(e.target.value)} className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)]">
                <option value="">Sélectionnez un véhicule...</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date souhaitée</label>
              <input type="date" value={checkDate} onChange={e => setCheckDate(e.target.value)} className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)]" />
            </div>
            <button type="submit" className="bg-[var(--color-gold)] text-white px-6 py-2 rounded-md font-medium hover:bg-yellow-600 transition-colors w-full md:w-auto h-[42px]">
              Vérifier
            </button>
          </form>
          {checkResult && (
            <div className={`mt-4 p-3 rounded-md text-sm font-medium ${checkResult.includes('disponible') ? 'bg-green-50 text-green-700 border border-green-200' : checkResult.includes('sera libre') ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {checkResult}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === cat ? 'bg-[var(--color-navy)] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-[var(--color-navy)]'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm hover:bg-gray-50">
            <input type="checkbox" checked={availableOnly} onChange={e => setAvailableOnly(e.target.checked)} className="w-4 h-4 text-green-600 focus:ring-green-500 rounded" />
            <span className="text-sm font-medium text-gray-700">Disponibles uniquement</span>
          </label>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVehicles.map(car => (
            <VehicleCard key={car.id} car={car} />
          ))}
        </div>
        {filteredVehicles.length === 0 && (
          <div className="text-center py-12 text-gray-500">Aucun véhicule ne correspond à vos critères.</div>
        )}
      </div>
    </div>
  );
};
