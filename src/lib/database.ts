import { PRODUCTS } from '../data/products';
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
}

const BOOKINGS_STORAGE_KEY = 'jes_fashion_bookings_db';
const RESERVED_PRODUCTS_KEY = 'jes_fashion_reserved_products_db';
const PRODUCT_OVERRIDES_KEY = 'jes_fashion_product_overrides_db';

// Initial empty bookings for fresh site startup
const INITIAL_BOOKINGS: BookingRecord[] = [];

// Initial empty reserved products for fresh site startup
const INITIAL_RESERVED_IDS: string[] = [];

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

// Database Accessors
export const getBookings = (): BookingRecord[] => {
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(INITIAL_BOOKINGS));
      return INITIAL_BOOKINGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading bookings DB:', e);
    return INITIAL_BOOKINGS;
  }
};

export const getReservedProductIds = (): string[] => {
  try {
    const raw = localStorage.getItem(RESERVED_PRODUCTS_KEY);
    if (!raw) {
      localStorage.setItem(RESERVED_PRODUCTS_KEY, JSON.stringify(INITIAL_RESERVED_IDS));
      return INITIAL_RESERVED_IDS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading reserved products DB:', e);
    return INITIAL_RESERVED_IDS;
  }
};

export const getProductOverrides = (): Record<string, ProductOverride> => {
  try {
    const raw = localStorage.getItem(PRODUCT_OVERRIDES_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading product overrides DB:', e);
    return {};
  }
};

export const getCustomizedProducts = (): Product[] => {
  const overrides = getProductOverrides();
  return PRODUCTS.map((p) => {
    const override = overrides[p.id];
    const rentalPrice = override?.rentalPrice || p.rentalPrice || '150 000 FCFA';
    const purchasePrice = override?.purchasePrice || p.purchasePrice || p.price || '250 000 FCFA';
    const title = override?.title !== undefined ? override.title : p.title;
    const price = override?.price !== undefined ? override.price : rentalPrice;

    return {
      ...p,
      title,
      price,
      rentalPrice,
      purchasePrice,
    };
  });
};

export const saveBookings = (bookings: BookingRecord[]) => {
  try {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    notifyListeners();
  } catch (e) {
    console.error('Error saving bookings DB:', e);
  }
};

export const saveReservedProductIds = (ids: string[]) => {
  try {
    localStorage.setItem(RESERVED_PRODUCTS_KEY, JSON.stringify(ids));
    notifyListeners();
  } catch (e) {
    console.error('Error saving reserved products DB:', e);
  }
};

export const saveProductOverrides = (overrides: Record<string, ProductOverride>) => {
  try {
    localStorage.setItem(PRODUCT_OVERRIDES_KEY, JSON.stringify(overrides));
    notifyListeners();
  } catch (e) {
    console.error('Error saving product overrides DB:', e);
  }
};

export const updateProductInfo = (productId: string, title: string, rentalPrice: string, purchasePrice: string) => {
  const current = getProductOverrides();
  current[productId] = { title, rentalPrice, purchasePrice, price: rentalPrice };
  saveProductOverrides(current);
};

export const resetProductInfo = (productId: string) => {
  const current = getProductOverrides();
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
