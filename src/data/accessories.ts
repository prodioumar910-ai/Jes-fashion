import shoes1 from '../assets/images/bridal_shoes_1_1785603427362.jpg';
import shoes2 from '../assets/images/bridal_shoes_2_1785603442644.jpg';
import shoes3 from '../assets/images/bridal_shoes_3_1785603530708.jpg';

import earrings1 from '../assets/images/bridal_earrings_1_1785603455669.jpg';
import earrings2 from '../assets/images/bridal_earrings_2_1785603469378.jpg';
import earrings3 from '../assets/images/bridal_earrings_3_1785603544671.jpg';

import brush1 from '../assets/images/bridal_hair_brush_1_1785603482362.jpg';
import brush2 from '../assets/images/bridal_hair_brush_2_1785603493658.jpg';
import brush3 from '../assets/images/bridal_hair_brush_3_1785603557156.jpg';

export interface AccessoryProduct {
  id: string;
  title: string;
  category: 'Les Chaussures' | "Boucles d'Oreilles" | 'Les Brosses pour Cheveux';
  lineIndex: 1 | 2 | 3;
  price: string;
  refCode: string;
  imageUrl: string;
  description: string;
  features: string[];
  rating: number;
  badge?: string;
}

export interface AccessoryLine {
  lineIndex: 1 | 2 | 3;
  title: string;
  subtitle: string;
  badge: string;
  items: AccessoryProduct[];
}

export const ACCESSORY_LINES: AccessoryLine[] = [
  {
    lineIndex: 1,
    title: "Ligne 1 : Les Chaussures",
    subtitle: "Escarpins & Sandales de Mariée Haute Couture",
    badge: "Chaussures VIP",
    items: [
      {
        id: 'acc-shoes-1',
        title: "Escarpins Satin & Cristaux Dorés",
        category: 'Les Chaussures',
        lineIndex: 1,
        price: "65 000 FCFA",
        refCode: "ACC-CH-01",
        imageUrl: shoes1,
        description: "Escarpins de mariée en satin ivoire sertis de cristaux dorés et strass étincelants. Confort absolu pour la journée du mariage.",
        features: ["Satin ivoire & cristal", "Finition or véritable", "Talon 8 cm confort VIP", "Assortiment Robes Jes Fashion"],
        rating: 5.0,
        badge: "Coup de Cœur"
      },
      {
        id: 'acc-shoes-3',
        title: "Escarpins Royale Pureté & Broche Cristal",
        category: 'Les Chaussures',
        lineIndex: 1,
        price: "70 000 FCFA",
        refCode: "ACC-CH-03",
        imageUrl: shoes3,
        description: "Chaussures de mariée fermées brodées avec broche dorée étincelante sur l'avant du pied.",
        features: ["Cuir satiné souple", "Broche dorée amovible", "Semelle antidérapante", "Talon aiguille 9 cm"],
        rating: 4.8
      }
    ]
  },
  {
    lineIndex: 2,
    title: "Ligne 2 : Boucles d'Oreilles",
    subtitle: "Pendants, Chandeliers & Bijoux d'Oreilles Dorés",
    badge: "Bijoux d'Exception",
    items: [
      {
        id: 'acc-earrings-1',
        title: "Boucles Pendantes Perles & Diamants Dorés",
        category: "Boucles d'Oreilles",
        lineIndex: 2,
        price: "25 000 FCFA",
        refCode: "ACC-BO-01",
        imageUrl: earrings1,
        description: "Boucles d'oreilles pendantes en laiton doré précieux ornées de perles d'eau douce et zircons de cristal.",
        features: ["Laiton doré à l'or fin", "Perles d'eau douce naturelles", "Anti-allergique", "Attache sécurisée"],
        rating: 4.9,
        badge: "Best Seller"
      },
      {
        id: 'acc-earrings-3',
        title: "Pendantes Feugille d'Or & Perles Vaporeuses",
        category: "Boucles d'Oreilles",
        lineIndex: 2,
        price: "30 000 FCFA",
        refCode: "ACC-BO-03",
        imageUrl: earrings3,
        description: "Motifs feuilles d'or ciselés à la main accompagnés de gouttes perlées élégantes.",
        features: ["Feuilles d'or ciselées", "Perles nacrées", "Finition brillante", "Idéal pour chignon bas"],
        rating: 4.8
      }
    ]
  },
  {
    lineIndex: 3,
    title: "Ligne 3 : Les Brosses pour Cheveux",
    subtitle: "Brosses de Mariée, Peignes & Diadèmes Ornementaux",
    badge: "Coiffure & Chignon",
    items: [
      {
        id: 'acc-brush-1',
        title: "Brosse & Peigne de Mariée Or & Perles",
        category: 'Les Brosses pour Cheveux',
        lineIndex: 3,
        price: "30 000 FCFA",
        refCode: "ACC-BR-01",
        imageUrl: brush1,
        description: "Brosse et peigne ornemental de mariée sculptés avec fleurs dorées, perles et cristaux scintillants pour un chignon d'exception.",
        features: ["Picots doux pour chignon", "Ornement d'or et perles", "Sertissage fait main", "Maintien longue durée"],
        rating: 5.0,
        badge: "Exclusivité Jes Fashion"
      },
      {
        id: 'acc-brush-3',
        title: "Brosse Couronne Cristal & Peigne Royal",
        category: 'Les Brosses pour Cheveux',
        lineIndex: 3,
        price: "40 000 FCFA",
        refCode: "ACC-BR-03",
        imageUrl: brush3,
        description: "Accessoire de coiffure de mariage royal avec brosse de finition et couronne peigne intégrée dorée.",
        features: ["Couronne peigne intégrée", "Cristaux étincelants", "Brosse démêlante VIP", "Éclat spectaculaire"],
        rating: 4.9
      }
    ]
  }
];
