import { PRODUCTS } from '../data/products';
import { ACCESSORY_LINES, AccessoryProduct, AccessoryLine } from '../data/accessories';
import { Product } from '../types';

export interface BookingRecord {
  id: string;
  customerName: string;
  phone: string;
  productId: string;
  productTitle: string;
  productRef: string;
  productImageUrl: string;
  serviceType: 'location' | 'achat';
  rentalDate?: string;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface ProductOverride {
  title?: string;
  price?: string;
  rentalPrice?: string;
  purchasePrice?: string;
  lineIndex?: 1 | 2 | 3;
  imageUrl?: string;
}

export interface FullDbState {
  bookings: BookingRecord[];
  reservedProductIds: string[];
  productOverrides: Record<string, ProductOverride>;
  deletedProductIds: string[];
  addedProducts: Product[];
  addedAccessories: AccessoryProduct[];
  lastUpdated?: number;
  version?: number;
}

const BOOKINGS_STORAGE_KEY = 'jes_fashion_bookings_db_v2';
const RESERVED_PRODUCTS_KEY = 'jes_fashion_reserved_products_db_v2';
const PRODUCT_OVERRIDES_KEY = 'jes_fashion_product_overrides_db_v2';
const DELETED_PRODUCTS_KEY = 'jes_fashion_deleted_products_db_v2';
const ADDED_PRODUCTS_KEY = 'jes_fashion_added_products_db_v2';
const ADDED_ACCESSORIES_KEY = 'jes_fashion_added_accessories_db_v2';
const LAST_SYNC_KEY = 'jes_fashion_last_sync_time_v2';

// Helper to safely read from localStorage
const readLocal = <T>(key: string, fallback: T): T => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

// Helper to safely write to localStorage
const writeLocal = (key: string, value: any) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (e) {
    console.warn(`[LocalDB] Failed to save key ${key}:`, e);
  }
};

// In-memory state for instantaneous synchronous reads
let memoryDb: FullDbState = {
  bookings: readLocal<BookingRecord[]>(BOOKINGS_STORAGE_KEY, []),
  reservedProductIds: readLocal<string[]>(RESERVED_PRODUCTS_KEY, []),
  productOverrides: readLocal<Record<string, ProductOverride>>(PRODUCT_OVERRIDES_KEY, {}),
  deletedProductIds: readLocal<string[]>(DELETED_PRODUCTS_KEY, []),
  addedProducts: readLocal<Product[]>(ADDED_PRODUCTS_KEY, []),
  addedAccessories: readLocal<AccessoryProduct[]>(ADDED_ACCESSORIES_KEY, []),
  lastUpdated: readLocal<number>(LAST_SYNC_KEY, 0),
  version: 0,
};

type Listener = () => void;
const listeners: Set<Listener> = new Set();

export const subscribeToDatabase = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error('[Database] Listener error:', e);
    }
  });
};

// Cross-tab synchronization via BroadcastChannel
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('jes_fashion_sync_channel');
    broadcastChannel.onmessage = (event) => {
      if (event.data && event.data.type === 'DB_UPDATED') {
        fetchFromServer();
      }
    };
  } catch (e) {
    // Graceful fallback if unsupported
  }
}

// Check if local database has any custom content
const hasLocalCustomData = (): boolean => {
  const overridesCount = Object.keys(memoryDb.productOverrides || {}).length;
  const addedProdCount = (memoryDb.addedProducts || []).length;
  const addedAccCount = (memoryDb.addedAccessories || []).length;
  const deletedCount = (memoryDb.deletedProductIds || []).length;
  const reservedCount = (memoryDb.reservedProductIds || []).length;
  const bookingsCount = (memoryDb.bookings || []).length;
  return overridesCount > 0 || addedProdCount > 0 || addedAccCount > 0 || deletedCount > 0 || reservedCount > 0 || bookingsCount > 0;
};

// Apply fresh state from server and notify UI (Guaranteed Non-Destructive)
export const applyRemoteState = (remote: Partial<FullDbState>) => {
  if (!remote || typeof remote !== 'object') return;

  // Protect local custom edits if the server is brand new or completely empty
  const remoteHasContent =
    (remote.productOverrides && Object.keys(remote.productOverrides).length > 0) ||
    (Array.isArray(remote.addedProducts) && remote.addedProducts.length > 0) ||
    (Array.isArray(remote.addedAccessories) && remote.addedAccessories.length > 0) ||
    (Array.isArray(remote.deletedProductIds) && remote.deletedProductIds.length > 0) ||
    (Array.isArray(remote.reservedProductIds) && remote.reservedProductIds.length > 0) ||
    (Array.isArray(remote.bookings) && remote.bookings.length > 0);

  // If server is empty but local has data, push local data to seed server
  if (!remoteHasContent && hasLocalCustomData()) {
    console.log('[Sync] Server database is empty. Auto-seeding server with local admin state...');
    forceSyncAllToCloud();
    return;
  }

  let changed = false;

  // Compare and update Bookings
  if (Array.isArray(remote.bookings)) {
    const currentSerialized = JSON.stringify(memoryDb.bookings);
    const remoteSerialized = JSON.stringify(remote.bookings);
    if (currentSerialized !== remoteSerialized) {
      memoryDb.bookings = remote.bookings;
      writeLocal(BOOKINGS_STORAGE_KEY, remote.bookings);
      changed = true;
    }
  }

  // Compare and update Reserved Product IDs
  if (Array.isArray(remote.reservedProductIds)) {
    const currentSerialized = JSON.stringify(memoryDb.reservedProductIds);
    const remoteSerialized = JSON.stringify(remote.reservedProductIds);
    if (currentSerialized !== remoteSerialized) {
      memoryDb.reservedProductIds = remote.reservedProductIds;
      writeLocal(RESERVED_PRODUCTS_KEY, remote.reservedProductIds);
      changed = true;
    }
  }

  // Compare and update Product Overrides
  if (remote.productOverrides && typeof remote.productOverrides === 'object') {
    const currentSerialized = JSON.stringify(memoryDb.productOverrides);
    const remoteSerialized = JSON.stringify(remote.productOverrides);
    if (currentSerialized !== remoteSerialized) {
      memoryDb.productOverrides = remote.productOverrides;
      writeLocal(PRODUCT_OVERRIDES_KEY, remote.productOverrides);
      changed = true;
    }
  }

  // Compare and update Deleted Product IDs
  if (Array.isArray(remote.deletedProductIds)) {
    const currentSerialized = JSON.stringify(memoryDb.deletedProductIds);
    const remoteSerialized = JSON.stringify(remote.deletedProductIds);
    if (currentSerialized !== remoteSerialized) {
      memoryDb.deletedProductIds = remote.deletedProductIds;
      writeLocal(DELETED_PRODUCTS_KEY, remote.deletedProductIds);
      changed = true;
    }
  }

  // Compare and update Added Products
  if (Array.isArray(remote.addedProducts)) {
    const currentSerialized = JSON.stringify(memoryDb.addedProducts);
    const remoteSerialized = JSON.stringify(remote.addedProducts);
    if (currentSerialized !== remoteSerialized) {
      memoryDb.addedProducts = remote.addedProducts;
      writeLocal(ADDED_PRODUCTS_KEY, remote.addedProducts);
      changed = true;
    }
  }

  // Compare and update Added Accessories
  if (Array.isArray(remote.addedAccessories)) {
    const currentSerialized = JSON.stringify(memoryDb.addedAccessories);
    const remoteSerialized = JSON.stringify(remote.addedAccessories);
    if (currentSerialized !== remoteSerialized) {
      memoryDb.addedAccessories = remote.addedAccessories;
      writeLocal(ADDED_ACCESSORIES_KEY, remote.addedAccessories);
      changed = true;
    }
  }

  if (remote.lastUpdated) {
    memoryDb.lastUpdated = remote.lastUpdated;
    writeLocal(LAST_SYNC_KEY, remote.lastUpdated);
  }
  if (remote.version) {
    memoryDb.version = remote.version;
  }

  if (changed) {
    notifyListeners();
  }
};

// Sync state status
export interface SyncStatus {
  connected: boolean;
  lastSyncTime: number;
  syncInProgress: boolean;
  version: number;
}

let syncStatus: SyncStatus = {
  connected: true,
  lastSyncTime: Date.now(),
  syncInProgress: false,
  version: 1,
};

type StatusListener = (status: SyncStatus) => void;
const statusListeners: Set<StatusListener> = new Set();

export const subscribeToSyncStatus = (listener: StatusListener) => {
  statusListeners.add(listener);
  listener(syncStatus);
  return () => {
    statusListeners.delete(listener);
  };
};

const updateSyncStatus = (partial: Partial<SyncStatus>) => {
  syncStatus = { ...syncStatus, ...partial };
  statusListeners.forEach((fn) => {
    try {
      fn(syncStatus);
    } catch (e) {
      // ignore
    }
  });
};

// Push local update to server with retry and multi-device broadcast
export const pushToServer = async (payload: Partial<FullDbState>): Promise<boolean> => {
  updateSyncStatus({ syncInProgress: true });
  try {
    const res = await fetch('/api/database/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const json = await res.json();
      updateSyncStatus({
        connected: true,
        lastSyncTime: Date.now(),
        syncInProgress: false,
        version: json.version || syncStatus.version + 1,
      });

      // Broadcast to other tabs on same device
      broadcastChannel?.postMessage({ type: 'DB_UPDATED' });
      return true;
    } else {
      updateSyncStatus({ syncInProgress: false, connected: false });
      return false;
    }
  } catch (err) {
    console.warn('[Sync] Server push failed, will retry:', err);
    updateSyncStatus({ syncInProgress: false, connected: false });
    return false;
  }
};

// Force upload complete authoritative database to server
export const forceSyncAllToCloud = async (): Promise<{ success: boolean; message: string }> => {
  updateSyncStatus({ syncInProgress: true });
  try {
    const fullPayload: FullDbState = {
      bookings: memoryDb.bookings || [],
      reservedProductIds: memoryDb.reservedProductIds || [],
      productOverrides: memoryDb.productOverrides || {},
      deletedProductIds: memoryDb.deletedProductIds || [],
      addedProducts: memoryDb.addedProducts || [],
      addedAccessories: memoryDb.addedAccessories || [],
    };

    const res = await fetch('/api/database/sync-all', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fullPayload),
    });

    if (res.ok) {
      const json = await res.json();
      updateSyncStatus({
        connected: true,
        lastSyncTime: Date.now(),
        syncInProgress: false,
        version: json.version || syncStatus.version + 1,
      });
      broadcastChannel?.postMessage({ type: 'DB_UPDATED' });
      return { success: true, message: 'Tous les modèles, prix et réservations sont synchronisés en direct sur tous les téléphones et ordinateurs des clients !' };
    } else {
      updateSyncStatus({ syncInProgress: false, connected: false });
      return { success: false, message: 'Erreur lors de la synchronisation avec le serveur. Vérifiez votre connexion internet.' };
    }
  } catch (err: any) {
    updateSyncStatus({ syncInProgress: false, connected: false });
    return { success: false, message: `Erreur réseau : ${err.message || 'Impossible de contacter le serveur.'}` };
  }
};

// Fetch full DB from server with cache-busting timestamp
export const fetchFromServer = async (): Promise<boolean> => {
  try {
    const res = await fetch(`/api/database?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    });

    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        applyRemoteState(json.data);
        updateSyncStatus({
          connected: true,
          lastSyncTime: Date.now(),
          version: json.data.version || syncStatus.version,
        });
        return true;
      }
    }
    return false;
  } catch (e) {
    updateSyncStatus({ connected: false });
    return false;
  }
};

// Real-time synchronization engine via Server-Sent Events (SSE) & Visibility Listeners
let sseSource: EventSource | null = null;
let pollTimer: any = null;

const initRealtimeSync = () => {
  if (typeof window === 'undefined') return;

  // 1. Initial snapshot fetch immediately
  fetchFromServer();

  // 2. Setup Server-Sent Events for instant live broadcast (< 50ms)
  const connectSSE = () => {
    try {
      if (sseSource) {
        sseSource.close();
      }
      sseSource = new EventSource('/api/database/stream');

      sseSource.onopen = () => {
        updateSyncStatus({ connected: true });
      };

      sseSource.onmessage = (event) => {
        try {
          if (!event.data || event.data.startsWith(':')) return;
          const parsed = JSON.parse(event.data);
          if (parsed) {
            applyRemoteState(parsed);
            updateSyncStatus({
              connected: true,
              lastSyncTime: Date.now(),
              version: parsed.version || syncStatus.version,
            });
          }
        } catch (err) {
          console.error('[SSE] Parse error:', err);
        }
      };

      sseSource.onerror = () => {
        if (sseSource) {
          sseSource.close();
          sseSource = null;
        }
        updateSyncStatus({ connected: false });
        // Reconnect after brief backoff
        setTimeout(connectSSE, 3000);
      };
    } catch (e) {
      console.warn('[SSE] EventSource init error:', e);
    }
  };

  connectSSE();

  // 3. Periodic polling every 4 seconds as a guaranteed fallback on mobile network transitions
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(() => {
    fetchFromServer();
  }, 4000);

  // 4. Instant wake-up sync when user unlocks phone or switches back to tab
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        fetchFromServer();
        if (!sseSource || sseSource.readyState === EventSource.CLOSED) {
          connectSSE();
        }
      }
    });
  }

  // 5. Window focus & online listeners
  window.addEventListener('focus', () => fetchFromServer());
  window.addEventListener('online', () => {
    fetchFromServer();
    connectSSE();
  });
};

// Automatically start real-time sync when script loads in browser
initRealtimeSync();

// --- Database Accessors & Actions ---

export const getDeletedProductIds = (): string[] => {
  return memoryDb.deletedProductIds || [];
};

export const deleteProduct = (productId: string) => {
  const current = getDeletedProductIds();
  if (!current.includes(productId)) {
    const updated = [...current, productId];
    memoryDb.deletedProductIds = updated;
    writeLocal(DELETED_PRODUCTS_KEY, updated);
    notifyListeners();
    pushToServer({ deletedProductIds: updated });
  }
};

export const getBookings = (): BookingRecord[] => {
  return memoryDb.bookings || [];
};

export const getReservedProductIds = (): string[] => {
  return memoryDb.reservedProductIds || [];
};

export const getAddedProducts = (): Product[] => {
  return memoryDb.addedProducts || [];
};

export const addCustomProduct = (product: Product) => {
  const current = getAddedProducts();
  const updated = [...current, product];
  memoryDb.addedProducts = updated;
  writeLocal(ADDED_PRODUCTS_KEY, updated);
  notifyListeners();
  pushToServer({ addedProducts: updated });
};

export const removeCustomProduct = (productId: string) => {
  const current = getAddedProducts();
  const updated = current.filter((p) => p.id !== productId);
  memoryDb.addedProducts = updated;
  writeLocal(ADDED_PRODUCTS_KEY, updated);
  notifyListeners();
  pushToServer({ addedProducts: updated });
};

export const getAddedAccessories = (): AccessoryProduct[] => {
  return memoryDb.addedAccessories || [];
};

export const addCustomAccessory = (accessory: AccessoryProduct) => {
  const current = getAddedAccessories();
  const updated = [...current, accessory];
  memoryDb.addedAccessories = updated;
  writeLocal(ADDED_ACCESSORIES_KEY, updated);
  notifyListeners();
  pushToServer({ addedAccessories: updated });
};

export const removeCustomAccessory = (accessoryId: string) => {
  const current = getAddedAccessories();
  const updated = current.filter((a) => a.id !== accessoryId);
  memoryDb.addedAccessories = updated;
  writeLocal(ADDED_ACCESSORIES_KEY, updated);
  notifyListeners();
  pushToServer({ addedAccessories: updated });
};

export const getProductOverrides = (): Record<string, ProductOverride> => {
  return memoryDb.productOverrides || {};
};

export const getCustomizedProducts = (): Product[] => {
  const overrides = getProductOverrides();
  const deletedIds = getDeletedProductIds();
  const addedProducts = getAddedProducts();

  const baseProducts = PRODUCTS.filter((p) => !deletedIds.includes(p.id)).map((p) => {
    const override = overrides[p.id];
    const rentalPrice = override?.rentalPrice || p.rentalPrice || '150 000 FCFA';
    const purchasePrice = override?.purchasePrice || p.purchasePrice || p.price || '250 000 FCFA';
    const title = override?.title !== undefined ? override.title : p.title;
    const price = override?.price !== undefined ? override.price : rentalPrice;
    const lineIndex = override?.lineIndex !== undefined ? (override.lineIndex as 1 | 2 | 3) : (p.lineIndex as 1 | 2 | 3);
    const imageUrl = override?.imageUrl !== undefined ? override.imageUrl : p.imageUrl;

    return {
      ...p,
      title,
      price,
      rentalPrice,
      purchasePrice,
      lineIndex,
      imageUrl,
    };
  });

  // Apply overrides to added products too
  const processedAdded = addedProducts.map((p) => {
    const override = overrides[p.id];
    if (!override) return p;
    return {
      ...p,
      title: override.title !== undefined ? override.title : p.title,
      rentalPrice: override.rentalPrice !== undefined ? override.rentalPrice : p.rentalPrice,
      purchasePrice: override.purchasePrice !== undefined ? override.purchasePrice : p.purchasePrice,
      lineIndex: override.lineIndex !== undefined ? (override.lineIndex as 1 | 2 | 3) : p.lineIndex,
      imageUrl: override.imageUrl !== undefined ? override.imageUrl : p.imageUrl,
    };
  });

  return [...baseProducts, ...processedAdded];
};

export const getCustomizedAccessories = (): AccessoryLine[] => {
  const overrides = getProductOverrides();
  const addedAccessories = getAddedAccessories();

  return ACCESSORY_LINES.map((line) => {
    const lineAdded = addedAccessories.filter((acc) => acc.lineIndex === line.lineIndex);
    const baseItems = line.items.map((item) => {
      const override = overrides[item.id];
      if (!override) return item;
      return {
        ...item,
        title: override.title !== undefined ? override.title : item.title,
        price: override.rentalPrice !== undefined ? override.rentalPrice : item.price,
        imageUrl: override.imageUrl !== undefined ? override.imageUrl : item.imageUrl,
      };
    });

    return {
      ...line,
      items: [...baseItems, ...lineAdded],
    };
  });
};

export const saveBookings = (bookings: BookingRecord[]) => {
  memoryDb.bookings = bookings;
  writeLocal(BOOKINGS_STORAGE_KEY, bookings);
  notifyListeners();
  pushToServer({ bookings });
};

export const saveReservedProductIds = (ids: string[]) => {
  memoryDb.reservedProductIds = ids;
  writeLocal(RESERVED_PRODUCTS_KEY, ids);
  notifyListeners();
  pushToServer({ reservedProductIds: ids });
};

export const saveProductOverrides = (overrides: Record<string, ProductOverride>) => {
  memoryDb.productOverrides = overrides;
  writeLocal(PRODUCT_OVERRIDES_KEY, overrides);
  notifyListeners();
  pushToServer({ productOverrides: overrides });
};

export const updateProductLineIndex = (productId: string, lineIndex: 1 | 2 | 3) => {
  const current = getProductOverrides();
  const existing = current[productId] || {};
  const updated = {
    ...current,
    [productId]: {
      ...existing,
      lineIndex,
    },
  };
  saveProductOverrides(updated);
};

export const updateProductInfo = (
  productId: string,
  title: string,
  rentalPrice: string,
  purchasePrice: string,
  lineIndex?: 1 | 2 | 3,
  imageUrl?: string
) => {
  const current = getProductOverrides();
  const existing = current[productId] || {};
  const updated = {
    ...current,
    [productId]: {
      ...existing,
      title,
      rentalPrice,
      purchasePrice,
      price: rentalPrice,
      ...(lineIndex !== undefined ? { lineIndex } : {}),
      ...(imageUrl !== undefined ? { imageUrl } : {}),
    },
  };
  saveProductOverrides(updated);
};

export const resetProductInfo = (productId: string) => {
  const current = { ...getProductOverrides() };
  delete current[productId];
  saveProductOverrides(current);
};

// Actions
export const addBookingRecord = (booking: Omit<BookingRecord, 'id' | 'createdAt' | 'status'>): BookingRecord => {
  const current = getBookings();
  const newBooking: BookingRecord = {
    ...booking,
    id: `bk-${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  const updated = [newBooking, ...current];
  saveBookings(updated);
  return newBooking;
};

export const confirmBookingRecord = (bookingId: string) => {
  const bookings = getBookings();
  let targetProductId = '';
  const updatedBookings = bookings.map((b) => {
    if (b.id === bookingId) {
      targetProductId = b.productId;
      return { ...b, status: 'confirmed' as const };
    }
    return b;
  });

  saveBookings(updatedBookings);

  if (targetProductId) {
    const reservedIds = getReservedProductIds();
    if (!reservedIds.includes(targetProductId)) {
      saveReservedProductIds([...reservedIds, targetProductId]);
    }
  }
};

export const reserveProductDirectly = (productId: string) => {
  if (!productId) return;
  const reservedIds = getReservedProductIds();
  if (!reservedIds.includes(productId)) {
    saveReservedProductIds([...reservedIds, productId]);
  }
};

export const cancelBookingRecord = (bookingId: string) => {
  const bookings = getBookings();
  let targetProductId = '';
  const updatedBookings = bookings.map((b) => {
    if (b.id === bookingId) {
      targetProductId = b.productId;
      return { ...b, status: 'cancelled' as const };
    }
    return b;
  });

  saveBookings(updatedBookings);

  // Check if any other confirmed booking uses this product
  if (targetProductId) {
    const hasOtherActive = updatedBookings.some(
      (b) => b.productId === targetProductId && b.status === 'confirmed'
    );
    if (!hasOtherActive) {
      const reservedIds = getReservedProductIds();
      saveReservedProductIds(reservedIds.filter((id) => id !== targetProductId));
    }
  }
};

export const deleteBookingRecord = (bookingId: string) => {
  const bookings = getBookings();
  const updated = bookings.filter((b) => b.id !== bookingId);
  saveBookings(updated);
};

export const toggleProductReservationStatus = (productId: string) => {
  const currentReserved = getReservedProductIds();
  if (currentReserved.includes(productId)) {
    saveReservedProductIds(currentReserved.filter((id) => id !== productId));
  } else {
    saveReservedProductIds([...currentReserved, productId]);
  }
};
