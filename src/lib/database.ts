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

const BOOKINGS_STORAGE_KEY = 'jes_fashion_bookings_db';
const RESERVED_PRODUCTS_KEY = 'jes_fashion_reserved_products_db';
const PRODUCT_OVERRIDES_KEY = 'jes_fashion_product_overrides_db';
const DELETED_PRODUCTS_KEY = 'jes_fashion_deleted_products_db';
const ADDED_PRODUCTS_KEY = 'jes_fashion_added_products_db';
const ADDED_ACCESSORIES_KEY = 'jes_fashion_added_accessories_db';

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

export const getDeletedProductIds = (): string[] => {
  try {
    const raw = localStorage.getItem(DELETED_PRODUCTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};

export const deleteProduct = (productId: string) => {
  const current = getDeletedProductIds();
  if (!current.includes(productId)) {
    localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify([...current, productId]));
    notifyListeners();
  }
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

export const getAddedProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(ADDED_PRODUCTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};

export const addCustomProduct = (product: Product) => {
  const current = getAddedProducts();
  localStorage.setItem(ADDED_PRODUCTS_KEY, JSON.stringify([...current, product]));
  notifyListeners();
};

export const getAddedAccessories = (): AccessoryProduct[] => {
  try {
    const raw = localStorage.getItem(ADDED_ACCESSORIES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};

export const addCustomAccessory = (accessory: AccessoryProduct) => {
  const current = getAddedAccessories();
  localStorage.setItem(ADDED_ACCESSORIES_KEY, JSON.stringify([...current, accessory]));
  notifyListeners();
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

export const updateProductLineIndex = (productId: string, lineIndex: 1 | 2 | 3) => {
  const current = getProductOverrides();
  const existing = current[productId] || {};
  current[productId] = {
    ...existing,
    lineIndex,
  };
  saveProductOverrides(current);
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
  current[productId] = {
    ...existing,
    title,
    rentalPrice,
    purchasePrice,
    price: rentalPrice,
    ...(lineIndex !== undefined ? { lineIndex } : {}),
    ...(imageUrl !== undefined ? { imageUrl } : {}),
  };
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
