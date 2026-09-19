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
  Layers,
  ArrowRightLeft,
  Sparkles,
  LayoutGrid,
  Trash2,
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
  updateProductLineIndex,
  resetProductInfo,
  deleteProduct,
  getCustomizedProducts,
  addCustomProduct,
  addCustomAccessory,
  removeCustomProduct,
  removeCustomAccessory,
  getAddedProducts,
  getAddedAccessories,
  subscribeToSyncStatus,
  forceSyncAllToCloud,
  SyncStatus,
} from '../lib/database';
import { PRODUCTS } from '../data/products';
import { Product } from '../types';
import { OptimizedImage, getFastImageUrl } from './OptimizedImage';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&q=80&w=600';

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Live Cloud Synchronization state
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    connected: true,
    lastSyncTime: Date.now(),
    syncInProgress: false,
    version: 1,
  });
  const [isForcingSync, setIsForcingSync] = useState(false);
  const [forceSyncMessage, setForceSyncMessage] = useState<{ text: string; success: boolean } | null>(null);

  const [activeTab, setActiveTab] = useState<'bookings' | 'lines_manager' | 'edit_prices' | 'reserved_status' | 'new_booking' | 'add_content'>('bookings');
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [reservedIds, setReservedIds] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Line Manager Filter
  const [selectedLineFilter, setSelectedLineFilter] = useState<'all' | '1' | '2' | '3'>('all');
  const [lineMoveNotice, setLineMoveNotice] = useState<string | null>(null);

  // Catalog Name, Rental Price, Purchase Price & Image URL editing state
  const [customProducts, setCustomProducts] = useState<Product[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [editMap, setEditMap] = useState<
    Record<string, { title: string; rentalPrice: string; purchasePrice: string; lineIndex: 1 | 2 | 3; imageUrl: string }>
  >({});
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  // Manual form state
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualProductId, setManualProductId] = useState(PRODUCTS[0]?.id || 'mod-1');
  const [manualDate, setManualDate] = useState('');
  const [manualPayment, setManualPayment] = useState('Orange Money (+223)');
  
  const [addedProductsList, setAddedProductsList] = useState<Product[]>([]);
  const [addedAccessoriesList, setAddedAccessoriesList] = useState<any[]>([]);

  // New Content Form State
  const [addSection, setAddSection] = useState<'3' | '4'>('3');
  const [addLine, setAddLine] = useState<'1' | '2' | '3'>('1');
  const [addTitle, setAddTitle] = useState('');
  const [addRefCode, setAddRefCode] = useState('');
  const [addImageUrl, setAddImageUrl] = useState('');
  const [addPrice, setAddPrice] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [addFeatures, setAddFeatures] = useState('');
  const [addCategory, setAddCategory] = useState<'Princesse' | 'Sirène' | 'Bohème & Chic' | 'Accessoire'>('Princesse');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setBookings(getBookings());
      setReservedIds(getReservedProductIds());
      setAddedProductsList(getAddedProducts());
      setAddedAccessoriesList(getAddedAccessories());

      const prods = getCustomizedProducts();
      setCustomProducts(prods);
      const initialMap: Record<string, { title: string; rentalPrice: string; purchasePrice: string; lineIndex: 1 | 2 | 3; imageUrl: string }> = {};
      prods.forEach((p) => {
        initialMap[p.id] = {
          title: p.title,
          rentalPrice: p.rentalPrice || '150 000 FCFA',
          purchasePrice: p.purchasePrice || p.price || '250 000 FCFA',
          lineIndex: p.lineIndex || 1,
          imageUrl: p.imageUrl,
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
      setAddedProductsList(getAddedProducts());
      setAddedAccessoriesList(getAddedAccessories());
      const updatedProds = getCustomizedProducts();
      setCustomProducts(updatedProds);
      const updatedMap: Record<string, { title: string; rentalPrice: string; purchasePrice: string; lineIndex: 1 | 2 | 3; imageUrl: string }> = {};
      updatedProds.forEach((p) => {
        updatedMap[p.id] = {
          title: p.title,
          rentalPrice: p.rentalPrice || '150 000 FCFA',
          purchasePrice: p.purchasePrice || p.price || '250 000 FCFA',
          lineIndex: p.lineIndex || 1,
          imageUrl: p.imageUrl,
        };
      });
      setEditMap(updatedMap);
    });

    const unsubSync = subscribeToSyncStatus((status) => {
      setSyncStatus(status);
    });

    return () => {
      document.body.style.overflow = 'unset';
      unsubscribe();
      unsubSync();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleForceSync = async () => {
    if (!confirm('Voulez-vous forcer la diffusion de votre catalogue actuel à tous les clients ? Cela écrasera les données du Cloud par vos données locales.')) return;
    setIsForcingSync(true);
    setForceSyncMessage(null);
    const result = await forceSyncAllToCloud();
    setIsForcingSync(false);
    setForceSyncMessage({ text: result.message, success: result.success });
    setTimeout(() => {
      setForceSyncMessage(null);
    }, 8000);
  };

  const handleClearLocalCache = () => {
    if (confirm('Voulez-vous vider votre cache local et recharger les données depuis le Cloud ? Utile si vous ne voyez pas les changements faits par d\'autres.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

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

  const handleMoveProductLine = (productId: string, newLine: 1 | 2 | 3, productTitle: string) => {
    updateProductLineIndex(productId, newLine);
    setCustomProducts(getCustomizedProducts());
    setLineMoveNotice(`« ${productTitle} » déplacé vers la Ligne ${newLine} !`);
    setTimeout(() => {
      setLineMoveNotice(null);
    }, 3000);
  };

  const handleSaveProductInfo = (productId: string) => {
    const editData = editMap[productId];
    if (!editData) return;
    updateProductInfo(
      productId,
      editData.title,
      editData.rentalPrice,
      editData.purchasePrice,
      editData.lineIndex,
      editData.imageUrl
    );
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
          lineIndex: originalProd.lineIndex || 1,
          imageUrl: originalProd.imageUrl,
        },
      }));
    }
    setSavedSuccessId(productId);
    setTimeout(() => {
      setSavedSuccessId(null);
    }, 2500);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Voulez-vous vraiment supprimer ce modèle de la collection ?')) {
      if (productId.startsWith('added-p-')) {
        removeCustomProduct(productId);
      } else if (productId.startsWith('added-acc-')) {
        removeCustomAccessory(productId);
      } else {
        deleteProduct(productId);
      }
      alert('Modèle supprimé avec succès !');
    }
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

    confirmBookingRecord(newRecord.id);
    setManualName('');
    setManualPhone('');
    setActiveTab('bookings');
    alert('Location enregistrée et confirmée avec succès dans la base de données !');
  };

  const handleAddContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addTitle || !addRefCode || !addImageUrl || !addPrice) {
      alert('Veuillez remplir les champs obligatoires (Titre, Réf, Image, Prix).');
      return;
    }

    const featuresArray = addFeatures.split(',').map((f) => f.trim()).filter((f) => f !== '');
    const lineNum = Number(addLine) as 1 | 2 | 3;

    if (addSection === '3') {
      const newProduct: Product = {
        id: `added-p-${Date.now()}`,
        title: addTitle,
        refCode: addRefCode,
        imageUrl: addImageUrl,
        price: addPrice,
        rentalPrice: addPrice,
        purchasePrice: addPrice,
        description: addDescription || 'Nouvelle robe Jes Fashion.',
        features: featuresArray.length > 0 ? featuresArray : ['Nouvelle Collection'],
        rating: 5.0,
        lineIndex: lineNum,
        category: addCategory === 'Accessoire' ? 'Princesse' : addCategory,
      };
      addCustomProduct(newProduct);
      alert('Nouveau modèle ajouté avec succès à la Ligne ' + lineNum + ' de la Section 3 !');
    } else {
      const newAccessory: any = {
        id: `added-acc-${Date.now()}`,
        title: addTitle,
        refCode: addRefCode,
        imageUrl: addImageUrl,
        price: addPrice,
        description: addDescription || 'Nouvel accessoire Jes Fashion.',
        features: featuresArray.length > 0 ? featuresArray : ['Nouvelle Collection'],
        rating: 5.0,
        lineIndex: lineNum,
        category: 'Accessoire',
      };
      addCustomAccessory(newAccessory);
      alert('Nouvel accessoire ajouté avec succès à la Ligne ' + lineNum + ' de la Section 4 !');
    }

    // Reset form
    setAddTitle('');
    setAddRefCode('');
    setAddImageUrl('');
    setAddPrice('');
    setAddDescription('');
    setAddFeatures('');
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

  const line1Products = customProducts.filter((p) => (p.lineIndex || 1) === 1);
  const line2Products = customProducts.filter((p) => p.lineIndex === 2);
  const line3Products = customProducts.filter((p) => p.lineIndex === 3);

  // AUTHENTICATION SCREEN - FULL CLEAN WHITE BACKDROP
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white animate-fadeIn">
        <div
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-8 text-slate-900 text-center space-y-6 animate-scaleUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* TOP CLOSE BUTTON */}
          <button
            onClick={handleCloseModal}
            className="absolute top-4 right-4 px-4 py-2 rounded-full btn-gold-foil text-black font-black text-xs shadow-md flex items-center gap-1 cursor-pointer transition-transform hover:scale-105"
            aria-label="Fermer"
          >
            <X className="w-4 h-4 text-black" />
            <span>FERMER</span>
          </button>

          {/* Header */}
          <div className="space-y-3 pt-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-[#BF953F] via-[#FCF6BA] to-[#B38728] p-1 shadow-xl flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                <Lock className="w-10 h-10 text-amber-300" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-serif font-black text-slate-900">
                Espace Admin Jes Fashion
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                Base de données centrale : gérez les modèles, les prix, les réservations et le rangement des images par ligne.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5">
                <Key className="w-4 h-4 text-amber-600" />
                <span>Code d'accès administrateur</span>
              </label>
              <input
                type="password"
                required
                autoFocus
                placeholder="Code à 4 chiffres"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setAuthError('');
                }}
                className="w-full text-center px-4 py-3.5 bg-slate-100 rounded-2xl text-2xl font-mono font-black tracking-widest text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner"
              />
              {authError && (
                <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl animate-pulse">
                  {authError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full btn-gold-foil py-4 text-xs font-black uppercase tracking-wider rounded-full shadow-xl text-black cursor-pointer hover:scale-[1.02] transition-transform"
            >
              Accéder à la Gestion
            </button>
          </form>

          <p className="text-[11px] text-slate-400 font-mono pt-2">
            Jes Fashion Haute Couture • Badalabougou
          </p>
        </div>
      </div>
    );
  }

  // MAIN ADMIN INTERFACE - FULL SCREEN (100% WIDTH/HEIGHT), CLEAN WHITE BACKGROUND, HORIZONTAL TOP SECTION NAVIGATION
  return (
    <div className="fixed inset-0 z-50 bg-white w-screen h-screen flex flex-col overflow-hidden animate-fadeIn text-slate-900">
      
      {/* BRAND & STATS TOP BAR */}
      <header className="px-6 py-4 bg-slate-950 text-white flex flex-wrap items-center justify-between flex-shrink-0 gap-4 shadow-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#BF953F] via-[#FCF6BA] to-[#B38728] p-0.5 shadow-lg flex-shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
              <Database className="w-5 h-5 text-amber-300" />
            </div>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-serif font-black text-amber-300 leading-tight">
              Espace Admin • JES FASHION HAUTE COUTURE
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Base de données centrale • Badalabougou
            </p>
          </div>
        </div>

        {/* Right side stats overview & close button */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 text-xs font-mono bg-slate-900 px-4 py-2 rounded-2xl border border-slate-800 shadow-inner">
            <span className="text-slate-400">Demandes:</span>
            <strong className="text-amber-300 font-bold">{bookings.length} ({pendingCount} attente)</strong>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">Modèles:</span>
            <strong className="text-amber-300 font-bold">{customProducts.length}</strong>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">Réservés:</span>
            <strong className="text-emerald-400 font-bold">{reservedIds.length}</strong>
          </div>

          <button
            type="button"
            onClick={handleCloseModal}
            className="px-5 py-2.5 btn-gold-foil text-black font-black text-xs uppercase tracking-wider rounded-full shadow-lg transition-transform hover:scale-105 cursor-pointer flex items-center gap-1.5"
          >
            <X className="w-4 h-4 text-black" />
            <span>FERMER L'ADMIN</span>
          </button>
        </div>
      </header>

      {/* LIVE MULTI-DEVICE CLOUD SYNCHRONIZATION STATUS BAR */}
      <div className="bg-slate-900 border-b border-amber-500/30 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className={`w-2.5 h-2.5 rounded-full ${syncStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            {syncStatus.connected && (
              <span className="absolute w-4 h-4 rounded-full bg-emerald-400/30 animate-ping" />
            )}
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <span>{syncStatus.connected ? 'Base de données Neon PostgreSQL active' : 'Reconnexion à Neon...'}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono uppercase tracking-wider">
                Neon Cloud DB
              </span>
            </span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">
              Chaque modification (prix, photos, réservations) est sauvegardée sur votre base Neon et diffusée en direct.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50">
            <div className={`w-2 h-2 rounded-full ${syncStatus.connected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {syncStatus.connected ? 'Serveur Neon Connecté' : 'Erreur Connexion Neon'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleClearLocalCache}
            className="px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all font-semibold flex items-center gap-1.5 cursor-pointer"
            title="Vider le cache local et recharger depuis le Cloud"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Actualiser les données</span>
          </button>
          
          <button
            type="button"
            disabled={isForcingSync}
            onClick={handleForceSync}
            className="px-3.5 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:border-amber-400 transition-all font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Force la synchronisation intégrale de votre catalogue vers le serveur et tous les clients"
          >
            <Database className={`w-3.5 h-3.5 ${isForcingSync ? 'animate-bounce' : ''}`} />
            <span>{isForcingSync ? 'Synchronisation...' : 'Pousser vers le Cloud'}</span>
          </button>
        </div>
      </div>

      {/* FLASH NOTIFICATION AFTER FORCED SYNC */}
      {forceSyncMessage && (
        <div className={`px-6 py-2.5 text-xs font-bold text-center transition-all flex items-center justify-center gap-2 ${
          forceSyncMessage.success ? 'bg-emerald-900/90 text-emerald-100 border-b border-emerald-500' : 'bg-red-900/90 text-red-100 border-b border-red-500'
        }`}>
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          <span>{forceSyncMessage.text}</span>
        </div>
      )}

      {/* HORIZONTAL SECTION NAVIGATION BAR AT TOP */}
      <nav className="bg-slate-900 border-t border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none flex-shrink-0 z-10 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`px-4 sm:px-5 py-3 rounded-2xl font-serif font-bold text-xs sm:text-sm transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'bookings'
              ? 'btn-gold-foil text-black shadow-xl font-black scale-[1.02]'
              : 'text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-amber-200'
          }`}
        >
          <Clock className={`w-4 h-4 ${activeTab === 'bookings' ? 'text-black' : 'text-amber-400'}`} />
          <span>Demandes de Location</span>
          <span className={`px-2.5 py-0.5 text-[11px] font-mono rounded-full ${
            activeTab === 'bookings' ? 'bg-black text-amber-300 font-bold' : 'bg-slate-950 text-amber-300'
          }`}>
            {bookings.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('lines_manager')}
          className={`px-4 sm:px-5 py-3 rounded-2xl font-serif font-bold text-xs sm:text-sm transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'lines_manager'
              ? 'btn-gold-foil text-black shadow-xl font-black scale-[1.02]'
              : 'text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-amber-200'
          }`}
        >
          <ArrowRightLeft className={`w-4 h-4 ${activeTab === 'lines_manager' ? 'text-black' : 'text-amber-400'}`} />
          <span>Rangement des Lignes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('edit_prices')}
          className={`px-4 sm:px-5 py-3 rounded-2xl font-serif font-bold text-xs sm:text-sm transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'edit_prices'
              ? 'btn-gold-foil text-black shadow-xl font-black scale-[1.02]'
              : 'text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-amber-200'
          }`}
        >
          <Edit3 className={`w-4 h-4 ${activeTab === 'edit_prices' ? 'text-black' : 'text-amber-400'}`} />
          <span>Noms, Prix & Images</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reserved_status')}
          className={`px-4 sm:px-5 py-3 rounded-2xl font-serif font-bold text-xs sm:text-sm transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'reserved_status'
              ? 'btn-gold-foil text-black shadow-xl font-black scale-[1.02]'
              : 'text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-amber-200'
          }`}
        >
          <ShieldCheck className={`w-4 h-4 ${activeTab === 'reserved_status' ? 'text-black' : 'text-amber-400'}`} />
          <span>Statut RÉSERVEZ</span>
          <span className={`px-2.5 py-0.5 text-[11px] font-mono rounded-full ${
            activeTab === 'reserved_status' ? 'bg-black text-emerald-300 font-bold' : 'bg-emerald-950 text-emerald-300'
          }`}>
            {reservedIds.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('new_booking')}
          className={`px-4 sm:px-5 py-3 rounded-2xl font-serif font-bold text-xs sm:text-sm transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'new_booking'
              ? 'btn-gold-foil text-black shadow-xl font-black scale-[1.02]'
              : 'text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-amber-200'
          }`}
        >
          <Plus className={`w-4 h-4 ${activeTab === 'new_booking' ? 'text-black' : 'text-amber-400'}`} />
          <span>Saisir Location Manuelle</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('add_content')}
          className={`px-4 sm:px-5 py-3 rounded-2xl font-serif font-bold text-xs sm:text-sm transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'add_content'
              ? 'btn-gold-foil text-black shadow-xl font-black scale-[1.02]'
              : 'text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-amber-200'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${activeTab === 'add_content' ? 'text-black' : 'text-amber-400'}`} />
          <span>Ajouter Nouveau Modèle/Image</span>
        </button>
      </nav>

      {/* MAIN CONTENT AREA - Full Width Scrollable Container */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-slate-50/50 min-h-0 min-w-0">
        
        {/* Active Section Header Title */}
        <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-black text-slate-900">
              {activeTab === 'bookings' && 'Gestion des Demandes de Location'}
              {activeTab === 'lines_manager' && 'Organisation & Rangement des Lignes'}
              {activeTab === 'edit_prices' && 'Modification des Noms, Prix de Location / Achat & Images'}
              {activeTab === 'reserved_status' && 'Gestion du Statut RÉSERVEZ (Disponibilité des Robes)'}
              {activeTab === 'new_booking' && 'Saisie Manuelle d\'une Demande de Location'}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Base de données centrale Jes Fashion Haute Couture Badalabougou
            </p>
          </div>
        </div>
          
          {/* TAB 1: DEMANDES DE LOCATION */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl shadow-sm">
                <div className="relative w-full sm:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Rechercher par client, téléphone, réf..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs font-bold">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-4 py-2.5 rounded-full transition-all cursor-pointer ${
                      filterStatus === 'all'
                        ? 'btn-gold-foil text-black font-black shadow-md'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    Toutes ({bookings.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('pending')}
                    className={`px-4 py-2.5 rounded-full transition-all cursor-pointer ${
                      filterStatus === 'pending'
                        ? 'btn-gold-foil text-black font-black shadow-md'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    En Attente ({pendingCount})
                  </button>
                  <button
                    onClick={() => setFilterStatus('confirmed')}
                    className={`px-4 py-2.5 rounded-full transition-all cursor-pointer ${
                      filterStatus === 'confirmed'
                        ? 'btn-gold-foil text-black font-black shadow-md'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    Confirmées
                  </button>
                </div>
              </div>

              {/* Bookings List */}
              {filteredBookings.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl shadow-sm text-slate-400 space-y-3">
                  <Clock className="w-12 h-12 text-amber-500/40 mx-auto" />
                  <p className="text-sm font-medium">Aucune demande de location ne correspond à votre recherche.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-5 bg-white rounded-3xl shadow-sm space-y-4 hover:shadow-xl transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-4">
                        <OptimizedImage
                          rawUrl={b.productImageUrl}
                          alt={b.productTitle}
                          containerClassName="w-20 h-28 rounded-2xl flex-shrink-0 shadow-md"
                          className="w-full h-full object-cover rounded-2xl"
                        />
                        <div className="flex-1 space-y-1.5 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold">
                              Réf: {b.productRef}
                            </span>
                            <span
                              className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                                b.status === 'confirmed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : b.status === 'pending'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {b.status === 'confirmed'
                                ? '✓ Confirmée'
                                : b.status === 'pending'
                                ? '⏳ En attente'
                                : '✕ Annulée'}
                            </span>
                          </div>

                          <h4 className="text-sm font-serif font-black text-slate-900 leading-snug whitespace-normal break-words">
                            {b.productTitle}
                          </h4>

                          <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5 pt-1">
                            <User className="w-4 h-4 text-amber-600" />
                            <span>{b.customerName}</span>
                          </p>

                          <p className="text-xs font-mono text-slate-800 flex items-center gap-1.5 font-bold">
                            <Phone className="w-4 h-4 text-amber-600" />
                            <a href={`tel:${b.phone}`} className="hover:underline">
                              {b.phone}
                            </a>
                          </p>

                          {b.rentalDate && (
                            <p className="text-xs font-medium text-slate-700 bg-amber-50 px-2.5 py-1 rounded-lg inline-block mt-1">
                              📅 Date: <strong className="text-slate-900">{b.rentalDate}</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons Gold */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                        {b.status === 'pending' && (
                          <button
                            onClick={() => handleConfirm(b.id)}
                            className="flex-1 py-2.5 px-4 btn-gold-foil text-black font-black text-xs rounded-full shadow-md transition-transform hover:scale-105 cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Confirmer (RÉSERVEZ)</span>
                          </button>
                        )}

                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancel(b.id)}
                            className="py-2 px-4 btn-gold-foil text-black font-bold text-xs rounded-full transition-all cursor-pointer shadow-md flex items-center gap-1"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Remettre disponible</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(b.id)}
                          className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all cursor-pointer"
                          title="Supprimer la demande"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GESTION & DÉPLACEMENT DES LIGNES (1, 2, 3) */}
          {activeTab === 'lines_manager' && (
            <div className="space-y-6">
              
              {/* Informational Banner */}
              <div className="p-5 bg-white shadow-sm rounded-3xl text-xs text-slate-700 leading-relaxed flex items-start gap-4">
                <Sparkles className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 text-sm block">Rangement Direct par Ligne</strong>
                  <p className="mt-1 text-slate-600">
                    Cliquez sur les boutons d'or ci-dessous pour changer la ligne d'un modèle. Vos modifications s'affichent immédiatement sur la page d'accueil !
                  </p>
                </div>
              </div>

              {/* Toast feedback notice */}
              {lineMoveNotice && (
                <div className="p-4 bg-emerald-50 text-emerald-900 rounded-2xl text-xs font-bold flex items-center justify-between animate-fadeIn shadow-sm">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    {lineMoveNotice}
                  </span>
                  <button onClick={() => setLineMoveNotice(null)} className="text-emerald-700 hover:text-emerald-950">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Line Selection Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl shadow-sm">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-amber-600" />
                  <span className="text-xs font-serif font-black text-slate-900">Filtrer par Ligne :</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold">
                  <button
                    onClick={() => setSelectedLineFilter('all')}
                    className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
                      selectedLineFilter === 'all'
                        ? 'btn-gold-foil text-black font-black shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Toutes les Lignes
                  </button>
                  <button
                    onClick={() => setSelectedLineFilter('1')}
                    className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
                      selectedLineFilter === '1'
                        ? 'btn-gold-foil text-black font-black shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Ligne 1
                  </button>
                  <button
                    onClick={() => setSelectedLineFilter('2')}
                    className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
                      selectedLineFilter === '2'
                        ? 'btn-gold-foil text-black font-black shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Ligne 2
                  </button>
                  <button
                    onClick={() => setSelectedLineFilter('3')}
                    className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
                      selectedLineFilter === '3'
                        ? 'btn-gold-foil text-black font-black shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Ligne 3
                  </button>
                </div>
              </div>

              {/* Render Lines Grid */}
              {[1, 2, 3].map((lineNum) => {
                const lineIndex = lineNum as 1 | 2 | 3;
                if (selectedLineFilter !== 'all' && selectedLineFilter !== String(lineNum)) {
                  return null;
                }

                const lineProds = customProducts.filter((p) => (p.lineIndex || 1) === lineIndex);
                const lineTitles = {
                  1: 'Ligne 1 • Collection Haute Couture',
                  2: 'Ligne 2 • Collection Robes Sirènes & Soirée',
                  3: 'Ligne 3 • Collection Élégance & Cérémonie',
                };

                return (
                  <div
                    key={lineNum}
                    className="p-6 bg-white rounded-3xl space-y-5 shadow-sm"
                  >
                    {/* Line Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-2xl btn-gold-foil text-black font-black text-sm flex items-center justify-center font-mono shadow-md">
                          L{lineNum}
                        </span>
                        <div>
                          <h4 className="text-base font-serif font-black text-slate-900 uppercase tracking-wider">
                            {lineTitles[lineIndex]}
                          </h4>
                          <span className="text-xs text-slate-500 font-medium">
                            {lineProds.length} images / modèles affichés sur cette ligne
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Products Grid inside this Line */}
                    {lineProds.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl">
                        Aucun modèle sur la Ligne {lineNum} actuellement.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {lineProds.map((prod) => (
                          <div
                            key={prod.id}
                            className="p-4 bg-slate-50 rounded-2xl space-y-3 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-3">
                              <OptimizedImage
                                rawUrl={prod.imageUrl}
                                alt={prod.title}
                                containerClassName="w-20 h-28 rounded-xl flex-shrink-0 shadow-sm"
                                className="w-full h-full object-cover rounded-xl"
                              />
                              <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold inline-block mb-1">
                                  Réf: {prod.refCode}
                                </span>
                                <h5 className="text-xs font-serif font-black text-slate-900 whitespace-normal break-words leading-tight">
                                  {prod.title}
                                </h5>
                                <p className="text-xs font-mono text-amber-700 mt-1 font-bold">
                                  Location: {prod.rentalPrice || prod.price}
                                </p>
                              </div>
                            </div>

                            {/* Move Controls Section Buttons in Gold */}
                            <div className="pt-2 border-t border-slate-200 space-y-2">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                                <span>Déplacer vers :</span>
                                <span className="text-amber-700 font-mono font-bold">Actuel: Ligne {lineNum}</span>
                              </label>

                              <div className="grid grid-cols-3 gap-1.5">
                                <button
                                  type="button"
                                  disabled={lineNum === 1}
                                  onClick={() => handleMoveProductLine(prod.id, 1, prod.title)}
                                  className={`py-2 px-2 rounded-xl text-[10px] font-black transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                    lineNum === 1
                                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                                      : 'btn-gold-foil text-black shadow-sm hover:scale-105'
                                  }`}
                                >
                                  Ligne 1
                                </button>
                                <button
                                  type="button"
                                  disabled={lineNum === 2}
                                  onClick={() => handleMoveProductLine(prod.id, 2, prod.title)}
                                  className={`py-2 px-2 rounded-xl text-[10px] font-black transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                    lineNum === 2
                                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                                      : 'btn-gold-foil text-black shadow-sm hover:scale-105'
                                  }`}
                                >
                                  Ligne 2
                                </button>
                                <button
                                  type="button"
                                  disabled={lineNum === 3}
                                  onClick={() => handleMoveProductLine(prod.id, 3, prod.title)}
                                  className={`py-2 px-2 rounded-xl text-[10px] font-black transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                    lineNum === 3
                                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                                      : 'btn-gold-foil text-black shadow-sm hover:scale-105'
                                  }`}
                                >
                                  Ligne 3
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="w-full mt-2 py-2 px-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-[10px] font-black transition-all cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>SUPPRIMER LE MODÈLE</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: MODIFICATION DES NOMS, PRIX & IMAGES */}
          {activeTab === 'edit_prices' && (
            <div className="space-y-6">
              <div className="p-4 bg-white shadow-sm rounded-3xl text-xs text-slate-700 font-medium leading-relaxed">
                ✨ <strong>Modification directe du Nom, Prix de Location, Prix d'Achat, Image et Ligne de Catalogue</strong> : Saisissez vos modifications et cliquez sur « Enregistrer » !
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom de robe ou référence (ex: JF-HC-01)..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium shadow-sm"
                />
              </div>

              {/* Grid of Product items for editing */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    const currentLine = editMap[prod.id]?.lineIndex ?? prod.lineIndex ?? 1;
                    const currentImg = editMap[prod.id]?.imageUrl ?? prod.imageUrl;
                    const isSuccess = savedSuccessId === prod.id;

                    return (
                      <div
                        key={prod.id}
                        className="p-5 bg-white rounded-3xl shadow-sm space-y-4 hover:shadow-xl transition-all flex flex-col justify-between"
                      >
                        <div className="flex items-start gap-4">
                          <OptimizedImage
                            rawUrl={currentImg}
                            alt={currentTitle}
                            containerClassName="w-22 h-32 rounded-2xl shadow-md flex-shrink-0"
                            className="w-full h-full object-cover rounded-2xl"
                          />
                          <div className="flex-1 space-y-2.5 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold">
                                Réf: {prod.refCode}
                              </span>
                              
                              {/* Line Selector Dropdown */}
                              <select
                                value={currentLine}
                                onChange={(e) => {
                                  const val = Number(e.target.value) as 1 | 2 | 3;
                                  setEditMap((prev) => ({
                                    ...prev,
                                    [prod.id]: {
                                      ...prev[prod.id],
                                      title: currentTitle,
                                      rentalPrice: currentRental,
                                      purchasePrice: currentPurchase,
                                      lineIndex: val,
                                      imageUrl: currentImg,
                                    },
                                  }));
                                }}
                                className="text-xs bg-amber-50 text-amber-900 rounded-lg px-2.5 py-1 font-bold cursor-pointer focus:outline-none"
                              >
                                <option value={1}>Ligne 1</option>
                                <option value={2}>Ligne 2</option>
                                <option value={3}>Ligne 3</option>
                              </select>
                            </div>

                            {/* Title Field */}
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Nom de la Robe
                              </label>
                              <input
                                type="text"
                                value={currentTitle}
                                onChange={(e) =>
                                  setEditMap((prev) => ({
                                    ...prev,
                                    [prod.id]: {
                                      ...prev[prod.id],
                                      title: e.target.value,
                                      rentalPrice: currentRental,
                                      purchasePrice: currentPurchase,
                                      lineIndex: currentLine,
                                      imageUrl: currentImg,
                                    },
                                  }))
                                }
                                className="w-full px-3 py-2 bg-slate-50 rounded-xl text-xs font-serif font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                              />
                            </div>

                            {/* Two Price Fields: Rental & Purchase */}
                            <div className="grid grid-cols-2 gap-2">
                              {/* Prix de Location */}
                              <div>
                                <label className="block text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">
                                  Prix Location
                                </label>
                                <input
                                  type="text"
                                  value={currentRental}
                                  onChange={(e) =>
                                    setEditMap((prev) => ({
                                      ...prev,
                                      [prod.id]: {
                                        ...prev[prod.id],
                                        title: currentTitle,
                                        rentalPrice: e.target.value,
                                        purchasePrice: currentPurchase,
                                        lineIndex: currentLine,
                                        imageUrl: currentImg,
                                      },
                                    }))
                                  }
                                  className="w-full px-2.5 py-1.5 bg-amber-50 rounded-xl text-xs font-mono font-bold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                                />
                              </div>

                              {/* Prix d'Achat */}
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                  Prix Achat
                                </label>
                                <input
                                  type="text"
                                  value={currentPurchase}
                                  onChange={(e) =>
                                    setEditMap((prev) => ({
                                      ...prev,
                                      [prod.id]: {
                                        ...prev[prod.id],
                                        title: currentTitle,
                                        rentalPrice: currentRental,
                                        purchasePrice: e.target.value,
                                        lineIndex: currentLine,
                                        imageUrl: currentImg,
                                      },
                                    }))
                                  }
                                  className="w-full px-2.5 py-1.5 bg-slate-50 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions Gold */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-3">
                          <div className="flex items-center gap-2">
                            {isSuccess ? (
                              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" /> Enregistré !
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleResetProductInfo(prod.id)}
                                className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                                title="Réinitialiser la valeur d'origine"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Défaut</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                              title="Supprimer définitivement ce modèle"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSaveProductInfo(prod.id)}
                            className="px-5 py-2.5 btn-gold-foil text-black font-serif font-black text-xs rounded-full shadow-md flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
                          >
                            <Save className="w-4 h-4" />
                            <span>Enregistrer</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 4: STATUT RÉSERVEZ */}
          {activeTab === 'reserved_status' && (
            <div className="space-y-6">
              <div className="p-4 bg-white shadow-sm rounded-3xl text-xs text-slate-700 flex items-center justify-between">
                <div>
                  💡 Cliquez sur <strong>« Activer RÉSERVEZ »</strong> pour afficher le bandeau de réservation doré sur une robe, ou <strong>« Désactiver »</strong> pour la remettre disponible.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {customProducts.map((prod) => {
                  const isReserved = reservedIds.includes(prod.id);
                  return (
                    <div
                      key={prod.id}
                      className="p-4 bg-white rounded-3xl shadow-sm flex items-center justify-between gap-3 hover:shadow-md transition-shadow"
                    >
                      <OptimizedImage
                        rawUrl={prod.imageUrl}
                        alt={prod.title}
                        containerClassName="w-16 h-22 rounded-xl shadow-sm flex-shrink-0"
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-serif font-black text-slate-900 whitespace-normal break-words leading-tight">
                          {prod.title}
                        </h5>
                        <p className="text-[10px] font-mono text-slate-500 font-bold mt-1">
                          Réf: {prod.refCode} • Ligne {prod.lineIndex || 1}
                        </p>
                        <div className="mt-1">
                          {isReserved ? (
                            <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                              RÉSERVEZ
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              Disponible
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleProduct(prod.id)}
                        className={`px-3.5 py-2 text-xs font-black rounded-full transition-all cursor-pointer shadow-md ${
                          isReserved
                            ? 'btn-gold-foil text-black hover:scale-105'
                            : 'bg-slate-200 text-slate-800 hover:bg-amber-400 hover:text-black'
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

          {/* TAB 5: NOUVELLE LOCATION MANUELLE */}
          {activeTab === 'new_booking' && (
            <div className="max-w-2xl mx-auto py-4">
              <form onSubmit={handleCreateManualBooking} className="space-y-5 bg-white p-8 rounded-3xl shadow-md">
                <h4 className="text-base font-serif font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Crown className="w-5 h-5 text-amber-600" />
                  <span>Saisir une location directe en boutique</span>
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Sélectionner la Robe *
                  </label>
                  <select
                    value={manualProductId}
                    onChange={(e) => setManualProductId(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                  >
                    {customProducts.map((p) => (
                      <option key={p.id} value={p.id} className="bg-white text-slate-900">
                        {p.title} (Réf: {p.refCode} - Ligne {p.lineIndex || 1})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nom & Prénom de la cliente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mariam Traoré"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Numéro de téléphone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: +223 75 00 00 00"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Jour de la location (1 journée) *
                  </label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Moyen de paiement
                  </label>
                  <select
                    value={manualPayment}
                    onChange={(e) => setManualPayment(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                  >
                    <option value="Orange Money (+223)">Orange Money (+223)</option>
                    <option value="Wave Mali">Wave Mali</option>
                    <option value="Espèces en Boutique (Badalabougou)">Espèces en Boutique (Badalabougou)</option>
                    <option value="Virement Bancaire">Virement Bancaire</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full btn-gold-foil py-4 text-xs font-black uppercase tracking-wider rounded-full shadow-lg text-black cursor-pointer hover:scale-[1.02] transition-transform"
                  >
                    Enregistrer & Confirmer la Location
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 6: AJOUTER NOUVEAU MODÈLE/IMAGE (SECTION 3 & 4) */}
          {activeTab === 'add_content' && (
            <div className="max-w-2xl mx-auto py-4">
              <form onSubmit={handleAddContent} className="space-y-6 bg-white p-8 rounded-3xl shadow-md border border-slate-100">
                <h4 className="text-base font-serif font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Plus className="w-5 h-5 text-amber-600" />
                  <span>Ajouter un Nouveau Modèle ou Accessoire</span>
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Section *</label>
                    <select
                      value={addSection}
                      onChange={(e) => setAddSection(e.target.value as '3' | '4')}
                      className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                    >
                      <option value="3">Section 3 (Robes & Modèles)</option>
                      <option value="4">Section 4 (Accessoires)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Ligne *</label>
                    <select
                      value={addLine}
                      onChange={(e) => setAddLine(e.target.value as '1' | '2' | '3')}
                      className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                    >
                      <option value="1">Ligne 1</option>
                      <option value="2">Ligne 2</option>
                      <option value="3">Ligne 3</option>
                    </select>
                  </div>
                </div>

                {addSection === '3' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Catégorie *</label>
                    <div className="flex gap-2">
                      {(['Princesse', 'Sirène', 'Bohème & Chic'] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setAddCategory(cat)}
                          className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                            addCategory === cat
                              ? 'btn-gold-foil text-black shadow-sm'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Titre *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Reine de Bamako"
                      value={addTitle}
                      onChange={(e) => setAddTitle(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Référence *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: JF-HC-101"
                      value={addRefCode}
                      onChange={(e) => setAddRefCode(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Lien Image (Direct ou Google Drive) *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://lh3.googleusercontent.com/d/..."
                    value={addImageUrl}
                    onChange={(e) => setAddImageUrl(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  {addImageUrl && (
                    <div className="mt-2 flex justify-center">
                      <OptimizedImage
                        rawUrl={addImageUrl}
                        alt="Aperçu"
                        containerClassName="w-32 h-44 rounded-2xl shadow-md border border-slate-200"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Prix (FCFA) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 250 000 FCFA"
                    value={addPrice}
                    onChange={(e) => setAddPrice(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Description courte..."
                    value={addDescription}
                    onChange={(e) => setAddDescription(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Caractéristiques (Séparées par des virgules)</label>
                  <input
                    type="text"
                    placeholder="Ex: Satin royal, Broderies or, Traîne longue"
                    value={addFeatures}
                    onChange={(e) => setAddFeatures(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full btn-gold-foil py-4 text-xs font-black uppercase tracking-wider rounded-full shadow-lg text-black cursor-pointer hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Ajouter à la Collection</span>
                  </button>
                </div>
              </form>

              {/* LIST OF ADDED ITEMS */}
              <div className="mt-12 space-y-8">
                {addedProductsList.length > 0 && (
                  <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100">
                    <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                      Modèles Ajoutés (Section 3)
                    </h5>
                    <div className="space-y-4">
                      {addedProductsList.map((p) => (
                        <div key={p.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <OptimizedImage
                            rawUrl={p.imageUrl}
                            containerClassName="w-16 h-20 rounded-xl"
                            imageSize="thumb"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-900 truncate uppercase">{p.title}</p>
                            <p className="text-[10px] font-bold text-amber-600">Ligne {p.lineIndex} • {p.refCode}</p>
                            <p className="text-[10px] font-medium text-slate-500">{p.price}</p>
                          </div>
                          <button
                            onClick={() => {
                              if (confirm('Supprimer ce modèle ?')) removeCustomProduct(p.id);
                            }}
                            className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {addedAccessoriesList.length > 0 && (
                  <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100">
                    <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                      Accessoires Ajoutés (Section 4)
                    </h5>
                    <div className="space-y-4">
                      {addedAccessoriesList.map((a) => (
                        <div key={a.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <OptimizedImage
                            rawUrl={a.imageUrl}
                            containerClassName="w-16 h-16 rounded-xl"
                            imageSize="thumb"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-900 truncate uppercase">{a.title}</p>
                            <p className="text-[10px] font-bold text-amber-600">Ligne {a.lineIndex} • {a.refCode}</p>
                            <p className="text-[10px] font-medium text-slate-500">{a.price}</p>
                          </div>
                          <button
                            onClick={() => {
                              if (confirm('Supprimer cet accessoire ?')) removeCustomAccessory(a.id);
                            }}
                            className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
      </main>
    </div>
  );
};
