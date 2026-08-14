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

interface FullDbState {
  bookings: BookingRecord[];
  reservedProductIds: string[];
  productOverrides: Record<string, ProductOverride>;
  deletedProductIds: string[];
  addedProducts: Product[];
  addedAccessories: AccessoryProduct[];
}

const BOOKINGS_STORAGE_KEY = 'jes_fashion_bookings_db';
const RESERVED_PRODUCTS_KEY = 'jes_fashion_reserved_products_db';
const PRODUCT_OVERRIDES_KEY = 'jes_fashion_product_overrides_db';
const DELETED_PRODUCTS_KEY = 'jes_fashion_deleted_products_db';
const ADDED_PRODUCTS_KEY = 'jes_fashion_added_products_db';
const ADDED_ACCESSORIES_KEY = 'jes_fashion_added_accessories_db';

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
  listeners.forEach((fn) => fn());
};

// Apply fresh state from server and notify UI
const applyRemoteState = (remote: Partial<FullDbState>) => {
  let changed = false;

  if (Array.isArray(remote.bookings)) {
    memoryDb.bookings = remote.bookings;
    writeLocal(BOOKINGS_STORAGE_KEY, remote.bookings);
    changed = true;
  }
  if (Array.isArray(remote.reservedProductIds)) {
    memoryDb.reservedProductIds = remote.reservedProductIds;
    writeLocal(RESERVED_PRODUCTS_KEY, remote.reservedProductIds);
    changed = true;
  }
  if (remote.productOverrides && typeof remote.productOverrides === 'object') {
    memoryDb.productOverrides = remote.productOverrides;
    writeLocal(PRODUCT_OVERRIDES_KEY, remote.productOverrides);
    changed = true;
  }
  if (Array.isArray(remote.deletedProductIds)) {
    memoryDb.deletedProductIds = remote.deletedProductIds;
    writeLocal(DELETED_PRODUCTS_KEY, remote.deletedProductIds);
    changed = true;
  }
  if (Array.isArray(remote.addedProducts)) {
    memoryDb.addedProducts = remote.addedProducts;
    writeLocal(ADDED_PRODUCTS_KEY, remote.addedProducts);
    changed = true;
  }
  if (Array.isArray(remote.addedAccessories)) {
    memoryDb.addedAccessories = remote.addedAccessories;
    writeLocal(ADDED_ACCESSORIES_KEY, remote.addedAccessories);
    changed = true;
  }

  if (changed) {
    notifyListeners();
  }
};

// Push local update to server for instant multi-device broadcast
let pushTimeout: any = null;
const pushToServer = async (payload: Partial<FullDbState>) => {
  try {
    await fetch('/api/database/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('[Sync] Server push failed, will retry on next poll:', err);
  }
};

// Fetch full DB from server
const fetchFromServer = async () => {
  try {
    const res = await fetch('/api/database', { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        applyRemoteState(json.data);
      }
    }
  } catch (e) {
    // Silent catch for offline or initial boot
  }
};

// Real-time synchronization engine via Server-Sent Events (SSE) & Polling
let sseSource: EventSource | null = null;
let pollTimer: any = null;

const initRealtimeSync = () => {
  if (typeof window === 'undefined') return;

  // 1. Initial snapshot fetch
  fetchFromServer();

  // 2. Setup Server-Sent Events for instant push (< 100ms across all devices)
  const connectSSE = () => {
    try {
      if (sseSource) {
        sseSource.close();
      }
      sseSource = new EventSource('/api/database/stream');
      
      sseSource.onmessage = (event) => {
        try {
          if (!event.data || event.data.startsWith(':')) return;
          const parsed = JSON.parse(event.data);
          if (parsed) {
            applyRemoteState(parsed);
          }
        } catch (err) {
          console.error('[SSE] Parse error:', err);
        }
      };

      sseSource.onerror = () => {
        // Reconnect after brief delay
        if (sseSource) {
          sseSource.close();
          sseSource = null;
        }
        setTimeout(connectSSE, 4000);
      };
    } catch (e) {
      console.warn('[SSE] EventSource init error:', e);
    }
  };

  connectSSE();

  // 3. Fallback periodic polling every 4 seconds to guarantee sync on mobile sleep/wake
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(() => {
    fetchFromServer();
  }, 4000);
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
  const updated = current.filter(p => p.id !== productId);
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
  const updated = current.filter(a => a.id !== accessoryId);
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
