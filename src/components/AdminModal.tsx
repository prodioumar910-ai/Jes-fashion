import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Phone,
  User,
  Calendar,
  CreditCard,
  Tag,
  ShieldCheck,
  Search,
  Filter,
  Lock,
  Key,
  Edit3,
  Save,
  RotateCcw,
  Crown,
} from 'lucide-react';
import {
  BookingRecord,
  getBookings,
  getReservedProductIds,
  confirmBookingRecord,
  cancelBookingRecord,
  deleteBookingRecord,
  toggleProductReservationStatus,
  addBookingRecord,
  subscribeToDatabase,
  updateProductInfo,
  resetProductInfo,
  getCustomizedProducts,
} from '../lib/database';
import { PRODUCTS } from '../data/products';
import { Product } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'bookings' | 'products' | 'edit_prices' | 'new'>('bookings');
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [reservedIds, setReservedIds] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Catalog Name, Rental Price & Purchase Price editing state
  const [customProducts, setCustomProducts] = useState<Product[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [editMap, setEditMap] = useState<
    Record<string, { title: string; rentalPrice: string; purchasePrice: string }>
  >({});
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  // Manual form state
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualProductId, setManualProductId] = useState(PRODUCTS[0]?.id || 'mod-1');
  const [manualDate, setManualDate] = useState('');
  const [manualPayment, setManualPayment] = useState('Orange Money (+223)');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setBookings(getBookings());
      setReservedIds(getReservedProductIds());

      const prods = getCustomizedProducts();
      setCustomProducts(prods);
      const initialMap: Record<string, { title: string; rentalPrice: string; purchasePrice: string }> = {};
      prods.forEach((p) => {
        initialMap[p.id] = {
          title: p.title,
          rentalPrice: p.rentalPrice || '150 000 FCFA',
          purchasePrice: p.purchasePrice || p.price || '250 000 FCFA',
        };
      });
      setEditMap(initialMap);
    } else {
      document.body.style.overflow = 'unset';
      setPasswordInput('');
      setAuthError('');
    }

    const unsubscribe = subscribeToDatabase(() => {
      setBookings(getBookings());
      setReservedIds(getReservedProductIds());
      const updatedProds = getCustomizedProducts();
      setCustomProducts(updatedProds);
    });

    return () => {
      document.body.style.overflow = 'unset';
      unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === '4321') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Mot de passe incorrect (Indice: 4321)');
    }
  };

  const handleCloseModal = () => {
    setPasswordInput('');
    setAuthError('');
    onClose();
  };

  const handleConfirm = (id: string) => {
    confirmBookingRecord(id);
  };

  const handleCancel = (id: string) => {
    cancelBookingRecord(id);
  };

  const handleDelete = (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer cette demande de la base de données ?')) {
      deleteBookingRecord(id);
    }
  };

  const handleToggleProduct = (productId: string) => {
    toggleProductReservationStatus(productId);
  };

  const handleSaveProductInfo = (productId: string) => {
    const editData = editMap[productId];
    if (!editData) return;
    updateProductInfo(productId, editData.title, editData.rentalPrice, editData.purchasePrice);
    const updated = getCustomizedProducts();
    setCustomProducts(updated);
    setSavedSuccessId(productId);
    setTimeout(() => {
      setSavedSuccessId(null);
    }, 2500);
  };

  const handleResetProductInfo = (productId: string) => {
    resetProductInfo(productId);
    const updated = getCustomizedProducts();
    setCustomProducts(updated);
    const originalProd = updated.find((p) => p.id === productId);
    if (originalProd) {
      setEditMap((prev) => ({
        ...prev,
        [productId]: {
          title: originalProd.title,
          rentalPrice: originalProd.rentalPrice || '150 000 FCFA',
          purchasePrice: originalProd.purchasePrice || originalProd.price || '250 000 FCFA',
        },
      }));
    }
    setSavedSuccessId(productId);
    setTimeout(() => {
      setSavedSuccessId(null);
    }, 2500);
  };

  const handleCreateManualBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName || !manualPhone) {
      alert('Veuillez saisir le nom et le téléphone.');
      return;
    }

    const selectedProd = customProducts.find((p) => p.id === manualProductId) || customProducts[0];

    const newRecord = addBookingRecord({
      customerName: manualName,
      phone: manualPhone,
      productId: selectedProd.id,
      productTitle: selectedProd.title,
      productRef: selectedProd.refCode,
      productImageUrl: selectedProd.imageUrl,
      serviceType: 'location',
      rentalDate: manualDate || new Date().toISOString().split('T')[0],
      paymentMethod: manualPayment,
    });

    // Auto-confirm manual entry
    confirmBookingRecord(newRecord.id);

    setManualName('');
    setManualPhone('');
    setActiveTab('bookings');
    alert('Location enregistrée et confirmée avec succès dans la base de données !');
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesFilter = filterStatus === 'all' || b.status === filterStatus;
    const matchesSearch =
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone.includes(searchQuery) ||
      b.productRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.productTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
        <div
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-200 p-6 sm:p-8 text-neutral-900 text-center space-y-6 animate-scaleUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HIGH VISIBILITY CLOSE BUTTON */}
          <button
            onClick={handleCloseModal}
            className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xs transition-transform hover:scale-105 shadow-lg flex items-center gap-1 cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
            <span>FERMER</span>
          </button>

          {/* Header */}
          <div className="space-y-3 pt-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-[#BF953F] via-[#FCF6BA] to-[#B38728] p-0.5 shadow-xl flex items-center justify-center">
              <Lock className="w-8 h-8 text-black" />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-black text-neutral-900">
                Espace Admin Jes Fashion
              </h3>
              <p className="text-xs text-neutral-600 mt-1 font-medium">
                Saisissez le mot de passe pour modifier les prix, gérer la base de données et confirmer les réservations.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-700 flex items-center justify-center gap-1.5">
                <Key className="w-4 h-4 text-amber-600" />
                <span>Code d'accès administrateur</span>
              </label>
              <input
                type="password"
                required
                autoFocus
                placeholder="Entrez le code"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setAuthError('');
                }}
                className="w-full text-center px-4 py-3.5 bg-neutral-100 border-2 border-neutral-300 rounded-xl text-2xl font-mono font-black tracking-widest text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
              {authError && (
                <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 animate-pulse">
                  {authError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full btn-gold-foil py-3.5 text-xs font-black uppercase tracking-wider rounded-full shadow-lg text-black cursor-pointer hover:scale-[1.02] transition-transform"
            >
              Accéder à la Gestion
            </button>
          </form>

          <p className="text-[11px] text-neutral-500 font-mono pt-2">
            Base de Données Jes Fashion Badalabougou
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 my-4 animate-scaleUp text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-neutral-900 text-white p-4 sm:p-5 border-b border-amber-500/30 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#BF953F] via-[#FCF6BA] to-[#B38728] p-0.5 shadow-md flex-shrink-0 flex items-center justify-center">
              <Database className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-black text-amber-300 flex items-center gap-2">
                Espace Admin Jes Fashion
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Gestion & Tarifs
                </span>
              </h3>
              <p className="text-xs text-neutral-300 font-medium">
                Modifiez les prix de location/achat, les noms des modèles et gérez les réservations.
              </p>
            </div>
          </div>

          {/* HIGH VISIBILITY TOP CLOSE BUTTON */}
          <button
            onClick={handleCloseModal}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xs border border-red-500 shadow-xl transition-all hover:scale-105 cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4 text-white" />
            <span>FERMER</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 bg-neutral-100 px-3 sm:px-6 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-3 px-4 font-serif font-black text-xs sm:text-sm rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-white text-black border-t-2 border-x border-amber-500 shadow-md'
                : 'text-neutral-600 hover:text-black font-bold'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Demandes ({bookings.length})</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] bg-amber-500 text-black font-black rounded-full animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 px-4 font-serif font-black text-xs sm:text-sm rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'products'
                ? 'bg-white text-black border-t-2 border-x border-amber-500 shadow-md'
                : 'text-neutral-600 hover:text-black font-bold'
            }`}
          >
            <Tag className="w-4 h-4 text-amber-600" />
            <span>Statut RÉSERVEZ ({reservedIds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('edit_prices')}
            className={`py-3 px-4 font-serif font-black text-xs sm:text-sm rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'edit_prices'
                ? 'bg-white text-black border-t-2 border-x border-amber-500 shadow-md'
                : 'text-neutral-600 hover:text-black font-bold'
            }`}
          >
            <Edit3 className="w-4 h-4 text-amber-600" />
            <span>Modifier Noms & Prix</span>
            <span className="px-2 py-0.5 text-[10px] bg-amber-100 text-amber-900 rounded-full font-sans font-bold">
              18 Modèles
            </span>
          </button>

          <button
            onClick={() => setActiveTab('new')}
            className={`py-3 px-4 font-serif font-black text-xs sm:text-sm rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'new'
                ? 'bg-white text-black border-t-2 border-x border-amber-500 shadow-md'
                : 'text-neutral-600 hover:text-black font-bold'
            }`}
          >
            <Plus className="w-4 h-4 text-amber-600" />
            <span>Saisir Location</span>
          </button>
        </div>

        {/* Modal Main Body - Clean White Background */}
        <div className="p-4 sm:p-6 max-h-[72vh] overflow-y-auto space-y-5 bg-slate-50 text-neutral-900">
          
          {/* TAB 1: DEMANDES DE LOCATION */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-sm">
                {/* Search */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Rechercher nom, téléphone, réf..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs font-bold">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                      filterStatus === 'all'
                        ? 'bg-neutral-900 text-amber-300 font-bold'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    Toutes ({bookings.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('pending')}
                    className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                      filterStatus === 'pending'
                        ? 'bg-amber-500 text-black font-black'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    En Attente
                  </button>
                  <button
                    onClick={() => setFilterStatus('confirmed')}
                    className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                      filterStatus === 'confirmed'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    Confirmées
                  </button>
                </div>
              </div>

              {/* Bookings List */}
              {filteredBookings.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200 text-neutral-500 space-y-2">
                  <Clock className="w-8 h-8 text-neutral-300 mx-auto" />
                  <p className="text-xs font-medium">Aucune demande de location enregistrée pour le moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 bg-white rounded-2xl border border-neutral-200 space-y-3 shadow-md hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={b.productImageUrl}
                          alt={b.productTitle}
                          className="w-16 h-20 object-cover rounded-xl border border-neutral-200 flex-shrink-0"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-200">
                              Réf: {b.productRef}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                b.status === 'confirmed'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : b.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-red-100 text-red-800 border border-red-300'
                              }`}
                            >
                              {b.status === 'confirmed'
                                ? '✓ Confirmée (RÉSERVEZ)'
                                : b.status === 'pending'
                                ? '⏳ En attente'
                                : '✕ Annulée'}
                            </span>
                          </div>

                          <h4 className="text-xs font-serif font-black text-neutral-900 leading-snug">
                            {b.productTitle}
                          </h4>

                          <p className="text-xs font-bold text-neutral-800 flex items-center gap-1.5 pt-1">
                            <User className="w-3.5 h-3.5 text-amber-600" />
                            <span>{b.customerName}</span>
                          </p>

                          <p className="text-xs font-mono text-neutral-700 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-amber-600" />
                            <a href={`tel:${b.phone}`} className="hover:underline font-bold">
                              {b.phone}
                            </a>
                          </p>

                          {b.rentalDate && (
                            <p className="text-xs font-medium text-amber-900 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 inline-block mt-1">
                              📅 Date: <strong>{b.rentalDate}</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-100 gap-2">
                        {b.status === 'pending' && (
                          <button
                            onClick={() => handleConfirm(b.id)}
                            className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Confirmer (Marquer RÉSERVEZ)</span>
                          </button>
                        )}

                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancel(b.id)}
                            className="py-1.5 px-3 bg-amber-100 text-amber-800 hover:bg-amber-200 font-bold text-xs rounded-xl transition-all cursor-pointer border border-amber-300 flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Remettre disponible</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(b.id)}
                          className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                          title="Supprimer la demande"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GESTION MANUELLE DES STATUTS "RÉSERVEZ" */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center justify-between">
                <div>
                  💡 Cliquez sur <strong>« Activer RÉSERVEZ »</strong> pour afficher manuellement le bandeau de réservation doré sur une robe, ou <strong>« Désactiver »</strong> pour la rendre libre.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {customProducts.map((prod) => {
                  const isReserved = reservedIds.includes(prod.id);
                  return (
                    <div
                      key={prod.id}
                      className="p-3 bg-white rounded-2xl border border-neutral-200 shadow-md flex items-center justify-between gap-3"
                    >
                      <img
                        src={prod.imageUrl}
                        alt={prod.title}
                        className="w-12 h-16 object-cover rounded-lg border border-neutral-200 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-serif font-black text-neutral-900 truncate">
                          {prod.title}
                        </h5>
                        <p className="text-[10px] font-mono text-neutral-500 font-bold">
                          Réf: {prod.refCode}
                        </p>
                        <div className="mt-1">
                          {isReserved ? (
                            <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                              RÉSERVEZ
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Disponible
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleProduct(prod.id)}
                        className={`px-3 py-2 text-[11px] font-black rounded-full transition-all cursor-pointer shadow-md ${
                          isReserved
                            ? 'bg-amber-500 text-black hover:bg-amber-400'
                            : 'bg-neutral-800 text-white hover:bg-neutral-900'
                        }`}
                      >
                        {isReserved ? 'Désactiver' : 'Activer'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: MODIFICATION DES NOMS ET DES DEUX PRIX (LOCATION & ACHAT) - WHITE BACKGROUND */}
          {activeTab === 'edit_prices' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 font-medium leading-relaxed">
                ✨ <strong>Modification directe du Nom, Prix de Location et Prix d'Achat</strong> : Saisissez les nouveaux prix pour chaque modèle ci-dessous. Ils s'afficheront instantanément lorsque les clientes basculent entre Location et Achat !
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Rechercher par nom de robe ou référence (ex: JF-ROYAL-01)..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 shadow-sm"
                />
              </div>

              {/* Grid of Product items for editing - White Background Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customProducts
                  .filter((p) => {
                    if (!catalogSearch.trim()) return true;
                    const q = catalogSearch.toLowerCase();
                    const currentTitle = editMap[p.id]?.title ?? p.title;
                    const currentRental = editMap[p.id]?.rentalPrice ?? p.rentalPrice ?? '';
                    const currentPurchase = editMap[p.id]?.purchasePrice ?? p.purchasePrice ?? p.price ?? '';
                    return (
                      currentTitle.toLowerCase().includes(q) ||
                      p.refCode.toLowerCase().includes(q) ||
                      currentRental.toLowerCase().includes(q) ||
                      currentPurchase.toLowerCase().includes(q)
                    );
                  })
                  .map((prod) => {
                    const currentTitle = editMap[prod.id]?.title ?? prod.title;
                    const currentRental = editMap[prod.id]?.rentalPrice ?? prod.rentalPrice ?? '150 000 FCFA';
                    const currentPurchase = editMap[prod.id]?.purchasePrice ?? prod.purchasePrice ?? prod.price ?? '250 000 FCFA';
                    const isSuccess = savedSuccessId === prod.id;

                    return (
                      <div
                        key={prod.id}
                        className="p-4 bg-white rounded-2xl border border-neutral-200 space-y-3 shadow-md hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={prod.imageUrl}
                            alt={prod.title}
                            className="w-20 h-28 object-cover rounded-xl border border-neutral-200 flex-shrink-0 shadow-sm"
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-200">
                                Réf: {prod.refCode}
                              </span>
                              <span className="text-[10px] text-neutral-500 font-serif font-bold">
                                Ligne {prod.lineIndex}
                              </span>
                            </div>

                            {/* Title Field */}
                            <div>
                              <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-0.5">
                                Nom de la Robe
                              </label>
                              <input
                                type="text"
                                value={currentTitle}
                                onChange={(e) =>
                                  setEditMap((prev) => ({
                                    ...prev,
                                    [prod.id]: {
                                      title: e.target.value,
                                      rentalPrice: currentRental,
                                      purchasePrice: currentPurchase,
                                    },
                                  }))
                                }
                                className="w-full px-3 py-1.5 bg-slate-50 border border-neutral-300 rounded-lg text-xs font-serif font-black text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                              />
                            </div>

                            {/* Two Price Fields: Rental & Purchase */}
                            <div className="grid grid-cols-2 gap-2">
                              {/* Prix de Location */}
                              <div>
                                <label className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-0.5">
                                  Prix Location (1j)
                                </label>
                                <input
                                  type="text"
                                  value={currentRental}
                                  onChange={(e) =>
                                    setEditMap((prev) => ({
                                      ...prev,
                                      [prod.id]: {
                                        title: currentTitle,
                                        rentalPrice: e.target.value,
                                        purchasePrice: currentPurchase,
                                      },
                                    }))
                                  }
                                  className="w-full px-2.5 py-1.5 bg-amber-50/60 border border-amber-300 rounded-lg text-xs font-mono font-bold text-amber-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                                />
                              </div>

                              {/* Prix d'Achat */}
                              <div>
                                <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-wider mb-0.5">
                                  Prix Achat
                                </label>
                                <input
                                  type="text"
                                  value={currentPurchase}
                                  onChange={(e) =>
                                    setEditMap((prev) => ({
                                      ...prev,
                                      [prod.id]: {
                                        title: currentTitle,
                                        rentalPrice: currentRental,
                                        purchasePrice: e.target.value,
                                      },
                                    }))
                                  }
                                  className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                          {isSuccess ? (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" /> Enregistré !
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleResetProductInfo(prod.id)}
                              className="text-[11px] text-neutral-500 hover:text-neutral-800 flex items-center gap-1 transition-colors cursor-pointer"
                              title="Réinitialiser la valeur d'origine"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Défaut</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleSaveProductInfo(prod.id)}
                            className="px-4 py-2 btn-gold-foil text-black font-serif font-black text-xs rounded-full shadow-md flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 ml-auto"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Enregistrer</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 4: NOUVELLE LOCATION MANUELLE */}
          {activeTab === 'new' && (
            <form onSubmit={handleCreateManualBooking} className="space-y-4 max-w-xl mx-auto py-2 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
              <h4 className="text-sm font-serif font-black text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-600" />
                <span>Saisir une location directe en boutique</span>
              </h4>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Sélectionner la Robe *
                </label>
                <select
                  value={manualProductId}
                  onChange={(e) => setManualProductId(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {customProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (Réf: {p.refCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Nom & Prénom de la cliente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mariam Traoré"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Numéro de téléphone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: +223 75 00 00 00"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Jour de la location (1 journée) *
                </label>
                <input
                  type="date"
                  required
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Moyen de paiement
                </label>
                <select
                  value={manualPayment}
                  onChange={(e) => setManualPayment(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="Orange Money (+223)">Orange Money (+223)</option>
                  <option value="Wave Mali">Wave Mali</option>
                  <option value="Espèces en Boutique (Badalabougou)">Espèces en Boutique (Badalabougou)</option>
                  <option value="Virement Bancaire">Virement Bancaire</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full btn-gold-foil py-3.5 text-xs font-black uppercase tracking-wider rounded-full shadow-lg text-black cursor-pointer hover:scale-105 transition-transform"
                >
                  Enregistrer & Confirmer la Location
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Modal Footer Bar with Highly Visible Red Close Button */}
        <div className="p-4 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between sticky bottom-0 z-20">
          <p className="text-xs text-neutral-600 font-bold hidden sm:block">
            Espace Administration • Jes Fashion Badalabougou
          </p>
          
          {/* HIGH VISIBILITY RED CLOSE BUTTON IN FOOTER */}
          <button
            type="button"
            onClick={handleCloseModal}
            className="w-full sm:w-auto px-7 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider border border-red-500 shadow-xl transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-2 ml-auto"
          >
            <X className="w-4 h-4 text-white" />
            <span>Fermer la page d'administration</span>
          </button>
        </div>
      </div>
    </div>
  );
};
