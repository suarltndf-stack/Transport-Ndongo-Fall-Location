import React, { useState, useRef, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, X, Save, Lock, LogOut, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useVehicles } from '../VehicleContext';
import { VehicleStatus, Vehicle, ReservationStatus, BookingOption } from '../types';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';

export const AdminPage = () => {
  const { vehicles, founder, reservations, bookingOptions, logo, companyInfo, updateStatus, addVehicle, updateVehicleDetails, deleteVehicle, updateFounder, updateReservationStatus, addBookingOption, updateBookingOption, deleteBookingOption, updateLogo, updateCompanyInfo, isAdmin, isAuthReady } = useVehicles();
  
  // --- Auth State ---
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // --- Admin State ---
  const [activeTab, setActiveTab] = useState<'fleet' | 'founder' | 'reservations' | 'options'>('reservations');
  
  // Fleet State
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [tempDate, setTempDate] = useState('');
  
  // Modal State for Add/Edit Vehicle
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<Partial<Vehicle>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Founder State
  const [founderData, setFounderData] = useState(founder);
  const founderFileRef = useRef<HTMLInputElement>(null);
  const [logoData, setLogoData] = useState(logo);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const [companyData, setCompanyData] = useState(companyInfo);

  // --- Handlers for Auth ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Firebase Auth Error:", err);
      setError(`Erreur: ${err.message || 'Veuillez réessayer.'}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Erreur lors de la déconnexion', err);
    }
  };

  // --- Handlers for Status ---
  const handleStatusChange = (id: string, newStatus: VehicleStatus) => {
    if (newStatus === 'soon') {
      setEditingStatusId(id);
      setTempDate('');
    } else {
      updateStatus(id, newStatus);
      setEditingStatusId(null);
    }
  };

  const saveSoonDate = (id: string) => {
    updateStatus(id, 'soon', tempDate);
    setEditingStatusId(null);
  };

  // --- Handlers for Add/Edit Vehicle ---
  const openAddModal = () => {
    setEditingVehicle(null);
    setFormData({
      name: '', category: 'Berline Luxe', price: 0, image: '', gallery: [], transmission: 'Automatique',
      seats: 5, fuel: 'Essence', luggage: 2, description: '', status: 'available'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (car: Vehicle) => {
    setEditingVehicle(car);
    setFormData({
      ...car,
      gallery: car.gallery?.length ? car.gallery : (car.image ? [car.image] : [])
    });
    setIsModalOpen(true);
  };

  const [isUploading, setIsUploading] = useState(false);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to WebP or JPEG
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'founder' | 'logo' = 'founder') => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const compressedDataUrl = await compressImage(file);
        if (type === 'founder') {
          setFounderData({ ...founderData, image: compressedDataUrl });
        } else if (type === 'logo') {
          setLogoData(compressedDataUrl);
        }
      } catch (error) {
        console.error("Erreur lors de la compression de l'image:", error);
        alert("Erreur lors du traitement de l'image.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const currentGallery = formData.gallery || (formData.image ? [formData.image] : []);
    const remainingSlots = 4 - currentGallery.length;
    
    if (remainingSlots <= 0) {
      alert("Vous ne pouvez ajouter que 4 photos maximum.");
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    setIsUploading(true);

    try {
      const compressedImages = await Promise.all(filesToProcess.map(file => compressImage(file)));
      const newGallery = [...currentGallery, ...compressedImages];
      
      setFormData({ 
        ...formData, 
        gallery: newGallery,
        image: newGallery[0] || '' 
      });
    } catch (error) {
      console.error("Erreur lors de la compression des images:", error);
      alert("Erreur lors du traitement des images.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeGalleryImage = (index: number) => {
    const currentGallery = formData.gallery || (formData.image ? [formData.image] : []);
    const newGallery = currentGallery.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      gallery: newGallery,
      image: newGallery[0] || ''
    });
  };

  const saveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      updateVehicleDetails(editingVehicle.id, formData);
    } else {
      addVehicle(formData as Omit<Vehicle, 'id'>);
    }
    setIsModalOpen(false);
  };

  // --- Handlers for Founder & Logo ---
  const saveCompanySettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateFounder(founderData);
    updateLogo(logoData);
    updateCompanyInfo(companyData);
    alert('Paramètres de l\'entreprise mis à jour avec succès !');
  };

  // --- Handlers for Options ---
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<BookingOption | null>(null);
  const [optionFormData, setOptionFormData] = useState<Partial<BookingOption>>({});

  const openAddOptionModal = () => {
    setEditingOption(null);
    setOptionFormData({ name: '', description: '', price: 0 });
    setIsOptionModalOpen(true);
  };

  const openEditOptionModal = (option: BookingOption) => {
    setEditingOption(option);
    setOptionFormData(option);
    setIsOptionModalOpen(true);
  };

  const saveOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOption) {
      updateBookingOption(editingOption.id, optionFormData);
    } else {
      addBookingOption(optionFormData as Omit<BookingOption, 'id'>);
    }
    setIsOptionModalOpen(false);
  };

  // --- Render Login Screen ---
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-navy)] mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-[var(--color-navy)]" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold font-serif text-[var(--color-navy)]">
            Accès Administrateur
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {!user 
              ? "Connectez-vous avec votre compte Google administrateur pour accéder à la gestion de la flotte."
              : "Votre compte n'a pas les droits d'administrateur."}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
            {error && <p className="mb-4 text-sm text-red-600 font-medium text-center">{error}</p>}
            
            {!user ? (
              <button
                onClick={handleLogin}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-navy)] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-navy)] transition-colors"
              >
                Se connecter avec Google
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-navy)] transition-colors"
              >
                Se déconnecter
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Render Admin Dashboard ---
  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold font-serif text-[var(--color-navy)]">Administration</h1>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors font-medium text-sm bg-white px-4 py-2 rounded-md border border-gray-200 shadow-sm"
          >
            <LogOut className="w-4 h-4" /> Se déconnecter
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('reservations')}
            className={`pb-4 px-4 font-medium text-sm transition-colors ${activeTab === 'reservations' ? 'border-b-2 border-[var(--color-gold)] text-[var(--color-navy)]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Réservations
            {reservations.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {reservations.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('fleet')}
            className={`pb-4 px-4 font-medium text-sm transition-colors ${activeTab === 'fleet' ? 'border-b-2 border-[var(--color-gold)] text-[var(--color-navy)]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Gestion de la Flotte
          </button>
          <button 
            onClick={() => setActiveTab('founder')}
            className={`pb-4 px-4 font-medium text-sm transition-colors ${activeTab === 'founder' ? 'border-b-2 border-[var(--color-gold)] text-[var(--color-navy)]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Entreprise & Fondateur
          </button>
          <button 
            onClick={() => setActiveTab('options')}
            className={`pb-4 px-4 font-medium text-sm transition-colors ${activeTab === 'options' ? 'border-b-2 border-[var(--color-gold)] text-[var(--color-navy)]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Options Supplémentaires
          </button>
        </div>

        {/* Tab Content: Reservations */}
        {activeTab === 'reservations' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-bold text-[var(--color-navy)]">Réservations ({reservations.length})</h2>
            </div>
            
            {reservations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Aucune réservation pour le moment.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 text-xs uppercase tracking-wider border-b border-gray-200">
                      <th className="p-4 font-semibold">Date demande</th>
                      <th className="p-4 font-semibold">Client</th>
                      <th className="p-4 font-semibold">Véhicule</th>
                      <th className="p-4 font-semibold">Période</th>
                      <th className="p-4 font-semibold">Total</th>
                      <th className="p-4 font-semibold">Statut</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reservations.map(res => (
                      <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-sm text-gray-600">
                          {new Date(res.createdAt).toLocaleDateString('fr-FR')} à {new Date(res.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-[var(--color-navy)]">{res.firstName} {res.lastName}</div>
                          <div className="text-xs text-gray-500">{res.phone}</div>
                          <div className="text-xs text-gray-500">{res.zone}</div>
                        </td>
                        <td className="p-4 font-medium text-sm text-gray-800">
                          {res.vehicleName}
                          {Object.entries(res.options).filter(([_, v]) => v).length > 0 && (
                            <div className="mt-1 text-xs text-gray-500 font-normal">
                              Options: {Object.entries(res.options)
                                .filter(([_, v]) => v)
                                .map(([key]) => bookingOptions.find(o => o.id === key)?.name || key)
                                .join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          À partir du: {new Date(res.startDate).toLocaleDateString('fr-FR')}
                          <br />
                          <span className="font-medium">{res.duration} jour(s)</span>
                        </td>
                        <td className="p-4 font-bold text-[var(--color-gold)] text-sm">
                          {res.totalPrice.toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="p-4">
                          {res.status === 'pending' && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3"/> En attente</span>}
                          {res.status === 'confirmed' && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3"/> Confirmée</span>}
                          {res.status === 'completed' && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3"/> Terminée</span>}
                          {res.status === 'cancelled' && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3"/> Annulée</span>}
                        </td>
                        <td className="p-4 text-right">
                          <select 
                            value={res.status}
                            onChange={(e) => updateReservationStatus(res.id, e.target.value as ReservationStatus)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]"
                          >
                            <option value="pending">En attente</option>
                            <option value="confirmed">Confirmer</option>
                            <option value="completed">Terminer</option>
                            <option value="cancelled">Annuler</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Fleet */}
        {activeTab === 'fleet' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-[var(--color-navy)]">Véhicules ({vehicles.length})</h2>
              <button onClick={openAddModal} className="bg-[var(--color-navy)] text-white px-4 py-2 rounded-md font-medium hover:bg-blue-900 transition-colors flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" /> Ajouter un véhicule
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-xs uppercase tracking-wider border-b border-gray-200">
                    <th className="p-4 font-semibold">Véhicule</th>
                    <th className="p-4 font-semibold">Prix/j</th>
                    <th className="p-4 font-semibold">Statut</th>
                    <th className="p-4 font-semibold">Disponibilité</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vehicles.map(car => (
                    <tr key={car.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img src={car.image} alt={car.name} className="w-12 h-8 object-cover rounded" />
                        <div>
                          <div className="font-medium text-[var(--color-navy)]">{car.name}</div>
                          <div className="text-xs text-gray-500">{car.category}</div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 text-sm font-medium">{car.price.toLocaleString('fr-FR')} FCFA</td>
                      <td className="p-4">
                        {car.status === 'available' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Disponible</span>}
                        {car.status === 'soon' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Bientôt libre ({car.returnDate})</span>}
                        {car.status === 'rented' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Loué</span>}
                      </td>
                      <td className="p-4">
                        {editingStatusId === car.id ? (
                          <div className="flex items-center gap-2">
                            <input type="text" placeholder="Ex: 25 Avr" value={tempDate} onChange={e => setTempDate(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm w-24" />
                            <button onClick={() => saveSoonDate(car.id)} className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700">OK</button>
                            <button onClick={() => setEditingStatusId(null)} className="text-gray-500 hover:text-gray-700 text-xs">Annuler</button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button onClick={() => handleStatusChange(car.id, 'available')} className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${car.status === 'available' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>Dispo</button>
                            <button onClick={() => handleStatusChange(car.id, 'soon')} className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${car.status === 'soon' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>Bientôt</button>
                            <button onClick={() => handleStatusChange(car.id, 'rented')} className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${car.status === 'rented' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>Loué</button>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => openEditModal(car)} className="text-blue-600 hover:text-blue-800 p-1 mx-1" title="Modifier">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => { if(window.confirm('Supprimer ce véhicule ?')) deleteVehicle(car.id); }} className="text-red-600 hover:text-red-800 p-1 mx-1" title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: Founder & Logo */}
        {activeTab === 'founder' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-3xl">
            <h2 className="text-xl font-bold text-[var(--color-navy)] mb-6">Paramètres de l'entreprise</h2>
            <form onSubmit={saveCompanySettings} className="space-y-8">
              
              {/* Logo Section */}
              <div className="pb-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-[var(--color-navy)] mb-4">Logo de l'entreprise</h3>
                <div className="flex items-center gap-6">
                  <div className="w-32 h-16 bg-gray-100 rounded flex items-center justify-center border border-gray-200 overflow-hidden">
                    {logoData ? (
                      <img src={logoData} alt="Logo" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="text-sm text-gray-400">Aucun logo</span>
                    )}
                  </div>
                  <div>
                    <input type="file" accept="image/*" ref={logoFileRef} onChange={(e) => handleImageUpload(e, 'logo')} className="hidden" />
                    <div className="flex items-center gap-2">
                      <button type="button" disabled={isUploading} onClick={() => logoFileRef.current?.click()} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50">
                        {isUploading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div> : <ImageIcon className="w-4 h-4" />} 
                        {isUploading ? 'Traitement...' : 'Importer un logo'}
                      </button>
                      {logoData && !isUploading && (
                        <button type="button" onClick={() => { setLogoData(''); if (logoFileRef.current) logoFileRef.current.value = ''; }} className="text-red-600 text-sm hover:text-red-800 font-medium px-2">
                          Supprimer
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Format recommandé : PNG transparent. Max 2MB.</p>
                  </div>
                </div>
              </div>

              {/* Company Info Section */}
              <div className="pb-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-[var(--color-navy)] mb-4">Informations de contact et description</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Pied de page)</label>
                    <textarea required rows={3} value={companyData.description} onChange={e => setCompanyData({...companyData, description: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)]"></textarea>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                      <input type="text" required value={companyData.address} onChange={e => setCompanyData({...companyData, address: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone (Affichage)</label>
                      <input type="text" required value={companyData.phone} onChange={e => setCompanyData({...companyData, phone: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Numéro WhatsApp (sans le +)</label>
                      <input type="text" required value={companyData.whatsapp} onChange={e => setCompanyData({...companyData, whatsapp: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" required value={companyData.email} onChange={e => setCompanyData({...companyData, email: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Founder Section */}
              <div>
                <h3 className="text-lg font-bold text-[var(--color-navy)] mb-4">Biographie du fondateur</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom du fondateur</label>
                    <input type="text" required value={founderData.name} onChange={e => setFounderData({...founderData, name: e.target.value})} className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)]" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Photo de profil</label>
                    <div className="flex items-center gap-6">
                      <img src={founderData.image} alt="Fondateur" className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow-sm" />
                      <div>
                        <input type="file" accept="image/*" ref={founderFileRef} onChange={(e) => handleImageUpload(e, 'founder')} className="hidden" />
                        <button type="button" disabled={isUploading} onClick={() => founderFileRef.current?.click()} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50">
                          {isUploading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div> : <ImageIcon className="w-4 h-4" />} 
                          {isUploading ? 'Traitement...' : 'Importer une nouvelle image'}
                        </button>
                        <p className="text-xs text-gray-500 mt-2">Format recommandé : JPG, PNG. Max 2MB.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Biographie</label>
                    <textarea required rows={6} value={founderData.bio} onChange={e => setFounderData({...founderData, bio: e.target.value})} className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)]"></textarea>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button type="submit" className="bg-[var(--color-navy)] text-white px-6 py-2 rounded-md font-medium hover:bg-blue-900 transition-colors flex items-center gap-2">
                  <Save className="w-4 h-4" /> Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab Content: Options */}
        {activeTab === 'options' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-[var(--color-navy)]">Options Supplémentaires ({bookingOptions.length})</h2>
              <button onClick={openAddOptionModal} className="bg-[var(--color-navy)] text-white px-4 py-2 rounded-md font-medium hover:bg-blue-900 transition-colors flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" /> Ajouter une option
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-xs uppercase tracking-wider border-b border-gray-200">
                    <th className="p-4 font-semibold">Nom de l'option</th>
                    <th className="p-4 font-semibold">Description</th>
                    <th className="p-4 font-semibold">Prix/j</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookingOptions.map(option => (
                    <tr key={option.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-[var(--color-navy)]">{option.name}</td>
                      <td className="p-4 text-sm text-gray-600">{option.description}</td>
                      <td className="p-4 text-gray-600 text-sm font-medium">{option.price.toLocaleString('fr-FR')} FCFA</td>
                      <td className="p-4 text-right">
                        <button onClick={() => openEditOptionModal(option)} className="text-blue-600 hover:text-blue-800 p-1 mx-1" title="Modifier">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => { if(window.confirm('Supprimer cette option ?')) deleteBookingOption(option.id); }} className="text-red-600 hover:text-red-800 p-1 mx-1" title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Add/Edit Vehicle */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-8">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[var(--color-navy)]">{editingVehicle ? 'Modifier le véhicule' : 'Ajouter un véhicule'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={saveVehicle} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du véhicule</label>
                  <input type="text" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option>Berline Luxe</option>
                    <option>4x4 / SUV</option>
                    <option>Économique</option>
                    <option>Citadine</option>
                    <option>Minibus / Van</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix par jour (FCFA)</label>
                  <input type="number" required value={formData.price || ''} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photos du véhicule (Max 4)</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                    {(formData.gallery || (formData.image ? [formData.image] : [])).map((img, idx) => (
                      <div key={idx} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => removeGalleryImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-sm"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded">Principale</span>
                        )}
                      </div>
                    ))}
                    {(formData.gallery || (formData.image ? [formData.image] : [])).length < 4 && (
                      <button 
                        type="button" 
                        disabled={isUploading} 
                        onClick={() => fileInputRef.current?.click()} 
                        className="aspect-video bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-100 hover:border-gray-400 transition-colors disabled:opacity-50"
                      >
                        {isUploading ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500 mb-1"></div>
                        ) : (
                          <Plus className="w-6 h-6 mb-1" />
                        )}
                        <span className="text-xs font-medium">{isUploading ? 'Traitement...' : 'Ajouter photo'}</span>
                      </button>
                    )}
                  </div>
                  <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleGalleryUpload} className="hidden" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                  <select value={formData.transmission || ''} onChange={e => setFormData({...formData, transmission: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option>Automatique</option>
                    <option>Manuelle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carburant</label>
                  <select value={formData.fuel || ''} onChange={e => setFormData({...formData, fuel: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option>Essence</option>
                    <option>Diesel</option>
                    <option>Hybride</option>
                    <option>Électrique</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de places</label>
                  <input type="number" required value={formData.seats || ''} onChange={e => setFormData({...formData, seats: Number(e.target.value)})} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacité bagages</label>
                  <input type="number" required value={formData.luggage || ''} onChange={e => setFormData({...formData, luggage: Number(e.target.value)})} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea required rows={3} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2"></textarea>
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Annuler</button>
                <button type="submit" className="bg-[var(--color-gold)] text-white px-6 py-2 rounded-md font-medium hover:bg-yellow-600 transition-colors">
                  {editingVehicle ? 'Enregistrer les modifications' : 'Ajouter le véhicule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add/Edit Option */}
      {isOptionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg my-8">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[var(--color-navy)]">{editingOption ? 'Modifier l\'option' : 'Ajouter une option'}</h2>
              <button onClick={() => setIsOptionModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={saveOption} className="p-6">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'option</label>
                  <input type="text" required value={optionFormData.name || ''} onChange={e => setOptionFormData({...optionFormData, name: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input type="text" required value={optionFormData.description || ''} onChange={e => setOptionFormData({...optionFormData, description: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix par jour (FCFA)</label>
                  <input type="number" required value={optionFormData.price || ''} onChange={e => setOptionFormData({...optionFormData, price: Number(e.target.value)})} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsOptionModalOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Annuler</button>
                <button type="submit" className="bg-[var(--color-gold)] text-white px-6 py-2 rounded-md font-medium hover:bg-yellow-600 transition-colors">
                  {editingOption ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
