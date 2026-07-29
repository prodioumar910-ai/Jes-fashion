export interface Product {
  id: string;
  title: string;
  category: 'Princesse' | 'Sirène' | 'Bohème & Chic';
  lineIndex: 1 | 2 | 3; // 3 lines for section 3
  price: string;
  rentalPrice?: string;
  purchasePrice?: string;
  refCode: string;
  imageUrl: string;
  description: string;
  features: string[];
  rating: number;
  badge?: string;
}

export interface TrustedClient {
  id: string;
  name: string;
  city: string;
  weddingDate: string;
  imageUrl: string;
  quote: string;
  gownRef: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  badgeText: string;
  gownRef: string;
}

export interface OrderFormData {
  fullName: string;
  phone: string;
  quantity: number;
  size: string;
  notes: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}
