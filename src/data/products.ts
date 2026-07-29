import { Product, TrustedClient, HeroSlide, FaqItem } from '../types';

// 5 Carousel Slides for Section 1 (Google Drive High-Res Assets)
export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    title: "L'Éclat du Sur-Mesure Haute Couture",
    subtitle: "Des robes de mariée d'exception façonnées avec ferveur à Badalabougou.",
    imageUrl: "https://lh3.googleusercontent.com/d/1717nMKQ3EsMI9jyDTIy7XLx2WeZ1YXOJ",
    badgeText: "Collection Exclusive 2026",
    gownRef: "JF-ROYAL-01"
  },
  {
    id: 'slide-2',
    title: "Collection Royale Princesse",
    subtitle: "Corsets incrustés et traînes majestueuses pour illuminer le plus beau jour de votre vie.",
    imageUrl: "https://lh3.googleusercontent.com/d/1zSJEVhO0r25NVZdJcQevpuWfzI-hRmhq",
    badgeText: "Robes Volumineuses",
    gownRef: "JF-ROYAL-02"
  },
  {
    id: 'slide-3',
    title: "Finitions Effet Feuille d'Or",
    subtitle: "Robe Sirène sculptée au millimètre avec reflets or précieux.",
    imageUrl: "https://lh3.googleusercontent.com/d/1SuLqz6mohw09zkiy4XZUNz1Yh05lUa7n",
    badgeText: "Haute Couturière Jes Fashion",
    gownRef: "JF-HC-01"
  },
  {
    id: 'slide-4',
    title: "Bohème Chic & Soie Immense",
    subtitle: "Légèreté infinie, finitions épurées et broderies étincelantes.",
    imageUrl: "https://lh3.googleusercontent.com/d/1YqLh2s1qePwSFsJ2b7bYAMOQ_tmpXKPp",
    badgeText: "Créations Uniques",
    gownRef: "JF-EE-01"
  },
  {
    id: 'slide-5',
    title: "Essayage Privé dans Notre Atelier",
    subtitle: "Prenez rendez-vous en boutique à Badalabougou, Bamako ou commandez votre modèle sur-mesure.",
    imageUrl: "https://lh3.googleusercontent.com/d/1xUfUStw2-5xpCplZtFlLGFDVWrtos_Mm",
    badgeText: "Badalabougou, Bamako",
    gownRef: "JF-ROYAL-04"
  }
];

// Section 2: Animated Client Photos ("Ils nous ont fait confiance - Jes Fashion")
export const TRUSTED_CLIENTS: TrustedClient[] = [
  {
    id: 'trust-1',
    name: 'Mariée Aïcha M.',
    city: 'Bamako (Hôtel de l\'Amitié)',
    weddingDate: 'Juin 2026',
    imageUrl: 'https://lh3.googleusercontent.com/d/14PNEynhG60yZdhTU-o8k9ZpcDmD2lqts',
    quote: 'Ma robe Princesse dorée Jes Fashion a illuminé toute la soirée. La finition feuille d\'or était spectaculaire !',
    gownRef: 'Réf: JF-ROYAL-01'
  },
  {
    id: 'trust-2',
    name: 'Mariée Fatoumata D.',
    city: 'Badalabougou, Bamako',
    weddingDate: 'Mai 2026',
    imageUrl: 'https://lh3.googleusercontent.com/d/1fJ6D3r7qMFtvwbB1dAam85lDVacF5pTu',
    quote: 'Un travail sur-mesure irréprochable. La couturière à Badalabougou a parfaitement compris mes mesures exactes.',
    gownRef: 'Réf: JF-HC-02'
  },
  {
    id: 'trust-3',
    name: 'Mariée Mariam S.',
    city: 'Kayes',
    weddingDate: 'Avril 2026',
    imageUrl: 'https://lh3.googleusercontent.com/d/16Wb9VYA73e0KaNEY0Egq43UHMM_nomZN',
    quote: 'Commande passée depuis WhatsApp et livrée à Kayes sans aucun souci. Ma traîne était digne d\'une reine !',
    gownRef: 'Réf: JF-ROYAL-03'
  },
  {
    id: 'trust-4',
    name: 'Mariée Oumou K.',
    city: 'Ségou',
    weddingDate: 'Mars 2026',
    imageUrl: 'https://lh3.googleusercontent.com/d/1kxjlkTTKcSxq58JY5OV8klGBteDTvWX8',
    quote: 'La coupe sirène Jes Fashion m\'a donné une silhouette merveilleuse. Merci pour la qualité exceptionnelle.',
    gownRef: 'Réf: JF-HC-01'
  },
  {
    id: 'trust-5',
    name: 'Mariée Kadiatou B.',
    city: 'Sikasso',
    weddingDate: 'Février 2026',
    imageUrl: 'https://lh3.googleusercontent.com/d/1l5CAIr88Ux8bUdd6XCE_c9kqFmuboQou',
    quote: 'Tout le monde n\'a parlé que de ma robe pendant des jours. Les boutons dorés sont un vrai chef d\'œuvre.',
    gownRef: 'Réf: JF-EE-02'
  }
];

// Section 3: 18 Products divided into 3 Horizontal Perpetual Lines
export const PRODUCTS: Product[] = [
  // --- LINE 1: Collection Royale (Robes Princesse & Traînes Impériales) ---
  {
    id: 'p-line1-1',
    title: "L'Éclat d'Or Impérial",
    category: 'Princesse',
    lineIndex: 1,
    price: "350 000 FCFA",
    refCode: "JF-ROYAL-01",
    imageUrl: "https://lh3.googleusercontent.com/d/1tVIaBGRtYfmdttoqQr0_olxcw1E4Kf3y",
    description: "Robe Princesse à grand volume avec corset incrusté de broderies précieuses et traîne majestueuse.",
    features: ["Dentelle française", "Broderies dorées à la main", "Traîne cathédrale", "Corset structuré"],
    rating: 5.0,
    badge: "Nouveauté"
  },
  {
    id: 'p-line1-2',
    title: "Reine Yirimadjo",
    category: 'Princesse',
    lineIndex: 1,
    price: "380 000 FCFA",
    refCode: "JF-ROYAL-02",
    imageUrl: "https://lh3.googleusercontent.com/d/1OhrNoqtI8KWd6JvB0AVmBkNHYS9wSno8",
    description: "Satin de soie pur marié à des volants majestueux et des détails raffinés.",
    features: ["Satin de soie", "Finitions dorées", "Jupon intégré", "Doublure en coton doux"],
    rating: 4.9,
    badge: "Haute Couture"
  },
  {
    id: 'p-line1-3',
    title: "Symphonie Dorée",
    category: 'Princesse',
    lineIndex: 1,
    price: "320 000 FCFA",
    refCode: "JF-ROYAL-03",
    imageUrl: "https://lh3.googleusercontent.com/d/10_Kfr6wBXYiLUaJlz9fxH5KO4SIM837N",
    description: "Décolleté précieux avec mancherons tombants et jupon en tulles étincelants superposés.",
    features: ["Mancherons d'or", "Tulle pailleté", "Boutons dos", "Fermeture invisible"],
    rating: 4.8
  },
  {
    id: 'p-line1-4',
    title: "Souveraine de Bamako",
    category: 'Princesse',
    lineIndex: 1,
    price: "390 000 FCFA",
    refCode: "JF-ROYAL-04",
    imageUrl: "https://lh3.googleusercontent.com/d/1xQ5hXQfYP6oKLdhj7me6oC7JXK1GptFi",
    description: "Création d'exception avec traîne royale ornée de motifs géométriques raffinés.",
    features: ["Traîne majestueuse", "Guipure dorée exclusive", "Col d'exception", "Ajustement sur-mesure"],
    rating: 5.0,
    badge: "Édition Limitée"
  },
  {
    id: 'p-line1-5',
    title: "Couronne de Soie",
    category: 'Princesse',
    lineIndex: 1,
    price: "340 000 FCFA",
    refCode: "JF-ROYAL-05",
    imageUrl: "https://lh3.googleusercontent.com/d/1rE5LXuGLJjNWrVobedoPdKVcwqa5ovWm",
    description: "Robe bal avec manches délicates en dentelle ciselée et dos nu envoûtant.",
    features: ["Manches en dentelle", "Dos nu festonné", "Ceinture dorée", "Broderies perles"],
    rating: 4.9
  },
  {
    id: 'p-line1-6',
    title: "Majesté Jes Fashion",
    category: 'Princesse',
    lineIndex: 1,
    price: "420 000 FCFA",
    refCode: "JF-ROYAL-06",
    imageUrl: "https://lh3.googleusercontent.com/d/1S60HYzfPrpQdTJVMp2MwNEGWZnAL1kGi",
    description: "Chef-d'œuvre de l'atelier Jes Fashion : tulle d'or cuivré, traîne royale et corset bijoux.",
    features: ["Corset bijoux", "Tulle précieux", "Confection artisanale", "Finitions dorées"],
    rating: 5.0,
    badge: "Masterpiece"
  },
  {
    id: 'p-line1-7',
    title: "Princesse Étoile de Mali",
    category: 'Princesse',
    lineIndex: 1,
    price: "365 000 FCFA",
    refCode: "JF-ROYAL-07",
    imageUrl: "https://lh3.googleusercontent.com/d/1uMcaJY9bfSoRYAGdDsx_E5vl9pjH_9aM",
    description: "Création voluptueuse à effet princesse féerique garnie de cristal et dentelle dorée.",
    features: ["Cristaux de verre", "Jupon grand volume", "Corset ajustable", "Fait main à Yirimadjo"],
    rating: 4.9
  },
  {
    id: 'p-line1-8',
    title: "Fleur de Mariée Royale",
    category: 'Princesse',
    lineIndex: 1,
    price: "375 000 FCFA",
    refCode: "JF-ROYAL-08",
    imageUrl: "https://lh3.googleusercontent.com/d/17Pa9oIfoo4fxzzubJK1Hv-Q6p8zf65eP",
    description: "Traîne majestueuse et corset ciselé aux motifs floraux or et argent.",
    features: ["Motifs floraux", "Broderie relief", "Soie haute qualité", "Essayage VIP inclus"],
    rating: 5.0
  },
  {
    id: 'p-line1-9',
    title: "Sublime Cérémonie",
    category: 'Princesse',
    lineIndex: 1,
    price: "355 000 FCFA",
    refCode: "JF-ROYAL-09",
    imageUrl: "https://lh3.googleusercontent.com/d/1AN7ufmSJ7WOc6W_KB1brkm2lwOn6_lGk",
    description: "Elégance nuptiale ultime avec col d'or sculpté et volants de mousseline de soie.",
    features: ["Col sculpté", "Mousseline de soie", "Traîne satinée", "Sur-mesure garanti"],
    rating: 4.8
  },
  {
    id: 'p-line1-10',
    title: "Soleil de Yirimadjo",
    category: 'Princesse',
    lineIndex: 1,
    price: "395 000 FCFA",
    refCode: "JF-ROYAL-10",
    imageUrl: "https://lh3.googleusercontent.com/d/1rhyJdBHthaHSsHLTd_sYxT9TkbhRvWPZ",
    description: "Combinaison majestueuse de tulle brodé et de perles dorées de haute couture.",
    features: ["Perles dorées", "Broderie fine", "Volume féerique", "Inspiration Haute Couture"],
    rating: 4.9
  },
  {
    id: 'p-line1-11',
    title: "Prestige Jes Couture",
    category: 'Princesse',
    lineIndex: 1,
    price: "410 000 FCFA",
    refCode: "JF-ROYAL-11",
    imageUrl: "https://lh3.googleusercontent.com/d/1YCXI3L5tXH7W4EwVQ4CF5GlGLNxdSsmm",
    description: "Une création somptueuse signée Jes Fashion avec traîne royale d'exception.",
    features: ["Traîne d'exception", "Dentelle ciselée", "Confection sur-mesure", "Éclat d'or"],
    rating: 5.0,
    badge: "Exclusivité"
  },

  // --- LINE 2: Collection Haute Couture (Coupes Sirènes & Formes Sculptantes) ---
  {
    id: 'p-line2-1',
    title: "Sirène d'Or d'Afrique",
    category: 'Sirène',
    lineIndex: 2,
    price: "290 000 FCFA",
    refCode: "JF-HC-01",
    imageUrl: "https://lh3.googleusercontent.com/d/1Tp2V6ABxdrYhalJTNPCoz6utyn_ekdiM",
    description: "Coupe sirène envoûtante sculptant la taille, rehaussée d'incrustations dorées étincelantes.",
    features: ["Effet seconde peau", "Traîne évasée en vagues", "Dos nu plongeant", "Perles de verre dorées"],
    rating: 4.9,
    badge: "Best-seller"
  },
  {
    id: 'p-line2-2',
    title: "Sublime Fleur d'Oranger",
    category: 'Sirène',
    lineIndex: 2,
    price: "310 000 FCFA",
    refCode: "JF-HC-02",
    imageUrl: "https://lh3.googleusercontent.com/d/1WMhfQoMiMXLwNaJ5_zUl1WvNdoQg_coD",
    description: "Création contemporaine avec encolure raffinée et traîne sirène en satin précieux.",
    features: ["Col bijoux", "Satin duchesse lourd", "Boutonnage d'or", "Sculpte les formes"],
    rating: 4.8
  },
  {
    id: 'p-line2-3',
    title: "Opéra Bambara",
    category: 'Sirène',
    lineIndex: 2,
    price: "275 000 FCFA",
    refCode: "JF-HC-03",
    imageUrl: "https://lh3.googleusercontent.com/d/1oxyL8-CWh68pH3em6DHM_xuCVBvip0aa",
    description: "Broderies en fil d'or disposées en cascades le long des hanches et traîne royale.",
    features: ["Cascades de dorures", "Forme fourreau sirène", "Tissu extensible confort", "Coutures invisibles"],
    rating: 4.9
  },
  {
    id: 'p-line2-4',
    title: "Gala de Bamako",
    category: 'Sirène',
    lineIndex: 2,
    price: "330 000 FCFA",
    refCode: "JF-HC-04",
    imageUrl: "https://lh3.googleusercontent.com/d/1anK4wN0LbEpRaHrFiOiirlWpz7ugtx_N",
    description: "Robe sirène raffinée avec traîne en tulle dorée pour une allure cérémoniale spectaculaire.",
    features: ["Dentelle florale relief", "Finition métallisée", "Maintien parfait", "Luxe absolu"],
    rating: 5.0,
    badge: "Coup de Cœur"
  },
  {
    id: 'p-line2-5',
    title: "Secret d'Amour Sirène",
    category: 'Sirène',
    lineIndex: 2,
    price: "295 000 FCFA",
    refCode: "JF-HC-05",
    imageUrl: "https://lh3.googleusercontent.com/d/1A8F_SVyhmBnaaFU4QAYw7EjxxQl6t0TV",
    description: "Décolleté transparent illusion avec ramages en dentelle dorée sculptés sur les épaules.",
    features: ["Effet illusion doré", "Traîne vaporeuse", "Perles fines dorées", "Moulante & souple"],
    rating: 4.7
  },
  {
    id: 'p-line2-6',
    title: "Diamant & Or Pur",
    category: 'Sirène',
    lineIndex: 2,
    price: "360 000 FCFA",
    refCode: "JF-HC-06",
    imageUrl: "https://lh3.googleusercontent.com/d/1c-EntGO8mjoXsOpaX-otHLeFDyTV_e68",
    description: "Composition spectaculaire de broderies dorées en relief 3D et traîne longue brodée.",
    features: ["Broderies relief 3D", "Traîne majestueuse", "Corset structurant", "Eclat incomparable"],
    rating: 5.0,
    badge: "Luxe Extrême"
  },
  {
    id: 'p-line2-7',
    title: "Sculpture Impériale",
    category: 'Sirène',
    lineIndex: 2,
    price: "340 000 FCFA",
    refCode: "JF-HC-07",
    imageUrl: "https://lh3.googleusercontent.com/d/1PglcgS6bo92fiONILHr6pnhLwAeR0I2A",
    description: "Silhouette moulante et traîne évasée en tulle pailleté d'or, signée Jes Fashion.",
    features: ["Tulle pailleté d'or", "Silhouette sculptée", "Doublure soyeuse", "Broderies artisanales"],
    rating: 4.9
  },
  {
    id: 'p-line2-8',
    title: "Princesse des Sables",
    category: 'Sirène',
    lineIndex: 2,
    price: "320 000 FCFA",
    refCode: "JF-HC-08",
    imageUrl: "https://lh3.googleusercontent.com/d/1-40Br4alUuu43rb9_xqlzH1nJTtvxu7e",
    description: "Mariage d'or précieux et de crêpe de soie blanche sculptant chaque courbe.",
    features: ["Crêpe de soie", "Bordures dorées", "Encolure sculpturale", "Savoir-faire Yirimadjo"],
    rating: 4.8
  },
  {
    id: 'p-line2-9',
    title: "Symphonie d'Ébène & Or",
    category: 'Sirène',
    lineIndex: 2,
    price: "350 000 FCFA",
    refCode: "JF-HC-09",
    imageUrl: "https://lh3.googleusercontent.com/d/1WtMGkl507IqDzIIPI0usbAtBPt5fcClj",
    description: "Robe de gala nuptiale au dos nu plongeant festonné de dentelle dorée.",
    features: ["Dos nu festonné", "Dentelle ciselée", "Traîne en cascade", "Essayage VIP"],
    rating: 5.0,
    badge: "Exclusif"
  },
  {
    id: 'p-line2-10',
    title: "Éclat d'Or de Yirimadjo",
    category: 'Sirène',
    lineIndex: 2,
    price: "315 000 FCFA",
    refCode: "JF-HC-10",
    imageUrl: "https://lh3.googleusercontent.com/d/1qdzG0xXyA2RfrhExGYio0xfPx72NNxup",
    description: "Forme sirène à volants de tulle et bustier étincelant cousu de fil d'or.",
    features: ["Bustier fil d'or", "Volants vaporeux", "Fermeture corset", "Sur-mesure offert"],
    rating: 4.9
  },
  {
    id: 'p-line2-11',
    title: "Rose d'Or Nobilia",
    category: 'Sirène',
    lineIndex: 2,
    price: "325 000 FCFA",
    refCode: "JF-HC-11",
    imageUrl: "https://lh3.googleusercontent.com/d/1odrd_WAEaKyHt7GAp9KEQ2dsVAQ_5TVv",
    description: "Robe fourreau sirène ultra-élégante ornée de perles métalliques étincelantes.",
    features: ["Perles métalliques", "Coupe fourreau", "Finitions dorées", "Tissu haut de gamme"],
    rating: 4.9
  },
  {
    id: 'p-line2-12',
    title: "Bouton d'Or Cérémonie",
    category: 'Sirène',
    lineIndex: 2,
    price: "335 000 FCFA",
    refCode: "JF-HC-12",
    imageUrl: "https://lh3.googleusercontent.com/d/1rPL77N9Aqjag9J4AwvERbU8VQzfXTphr",
    description: "Satin lourd d'Italie brodé à la main aux motifs royaux en relief doré.",
    features: ["Satin lourd", "Motifs royaux", "Traîne sculptée", "Création d'art"],
    rating: 5.0
  },
  {
    id: 'p-line2-13',
    title: "Lumière Céleste",
    category: 'Sirène',
    lineIndex: 2,
    price: "305 000 FCFA",
    refCode: "JF-HC-13",
    imageUrl: "https://lh3.googleusercontent.com/d/10kPnpFAcNXco_NjiUoo6zIOMKhcDQId_",
    description: "Modèle sirène à décolleté illusion et épaules habillées de perles fines d'or.",
    features: ["Perles d'or aux épaules", "Décolleté cœur", "Maintien gainant", "Mousseline perlée"],
    rating: 4.8
  },
  {
    id: 'p-line2-14',
    title: "Féerie de Soie Dorée",
    category: 'Sirène',
    lineIndex: 2,
    price: "345 000 FCFA",
    refCode: "JF-HC-14",
    imageUrl: "https://lh3.googleusercontent.com/d/1470uurbpGCtvpH8RHXWdg-M2ZoAa0B3l",
    description: "Robe nuptiale d'une grâce absolue avec traîne sirène à découpes transparentes.",
    features: ["Transparences dorées", "Traîne en rosace", "Boutonnage précieux", "Luxe absolu"],
    rating: 5.0,
    badge: "Haute Couture"
  },
  {
    id: 'p-line2-15',
    title: "Nuit de Noces Dorée",
    category: 'Sirène',
    lineIndex: 2,
    price: "328 000 FCFA",
    refCode: "JF-HC-15",
    imageUrl: "https://lh3.googleusercontent.com/d/1EXgUkahmkKKzwVPToJONKTagRbBBudDg",
    description: "Coupe ajustée soulignant la taille avec application de dentelle dorée faite main.",
    features: ["Dentelle dorée à la main", "Ajustement parfait", "Traîne souple", "Bustier cœur"],
    rating: 4.9
  },
  {
    id: 'p-line2-16',
    title: "Fleur Royale Bamako",
    category: 'Sirène',
    lineIndex: 2,
    price: "355 000 FCFA",
    refCode: "JF-HC-16",
    imageUrl: "https://lh3.googleusercontent.com/d/1WMhKO3ahpJi6hW9FiLXz1T5CJOm8TfL8",
    description: "Confection d'exception alliant broderies métalliques et finitions haute couture.",
    features: ["Broderies métalliques", "Finition or cuivré", "Silhouette élancée", "Satisfaction garantie"],
    rating: 5.0
  },
  {
    id: 'p-line2-17',
    title: "Soleil d'Afrique Couture",
    category: 'Sirène',
    lineIndex: 2,
    price: "370 000 FCFA",
    refCode: "JF-HC-17",
    imageUrl: "https://lh3.googleusercontent.com/d/1v_cQcf-LWvTCOtq5qx35RQXkLddcPrpG",
    description: "Traîne majestueuse de 2 mètres et corset sirène entièrement rehaussé de cristaux d'or.",
    features: ["Cristaux d'or", "Traîne de 2 mètres", "Confection atelier Yirimadjo", "Robe de rêve"],
    rating: 5.0,
    badge: "Sommet du Luxe"
  },

  // --- LINE 3: Collection Élégance Épurée & Bohème Chic ---
  {
    id: 'p-line3-1',
    title: "Bohème Chic Yirimadjo",
    category: 'Bohème & Chic',
    lineIndex: 3,
    price: "230 000 FCFA",
    refCode: "JF-EE-01",
    imageUrl: "https://lh3.googleusercontent.com/d/1cqwJqKA6FG6Ei5YeAqNyEtSXB2AoQv0p",
    description: "Mousseline de soie fluide et légère, soulignée par une ceinture tressée d'or métallisé.",
    features: ["Mousseline de soie", "Ceinture or tressée", "Confort absolu", "Jupe fluide vaporeuse"],
    rating: 4.8,
    badge: "Mousseline Soie"
  },
  {
    id: 'p-line3-2',
    title: "Satin Pureté Royale",
    category: 'Bohème & Chic',
    lineIndex: 3,
    price: "250 000 FCFA",
    refCode: "JF-EE-02",
    imageUrl: "https://lh3.googleusercontent.com/d/1aVTAcnGPO6RL-zHDKZVlgUUwsBZnljRp",
    description: "Lignes épurées et minimalistes en satin duchesse avec détails dorés raffinés.",
    features: ["Satin duchesse royal", "Finition or", "Fente latérale chic", "Encolure élégante"],
    rating: 4.9
  },
  {
    id: 'p-line3-3',
    title: "Romance de Soie",
    category: 'Bohème & Chic',
    lineIndex: 3,
    price: "220 000 FCFA",
    refCode: "JF-EE-03",
    imageUrl: "https://lh3.googleusercontent.com/d/1-Tk-t0FWDFaktFSi43_T1_8j3Dmvkmdl",
    description: "Bretelles spaghettis perlées dorées et jupe évasée à traîne légère pour mariée moderne.",
    features: ["Bretelles spaghettis d'or", "Jupe évasée souple", "Col V délicat", "Ultra légère"],
    rating: 4.7
  },
  {
    id: 'p-line3-4',
    title: "Lumière d'Ébène",
    category: 'Bohème & Chic',
    lineIndex: 3,
    price: "240 000 FCFA",
    refCode: "JF-EE-04",
    imageUrl: "https://lh3.googleusercontent.com/d/12CTOyUMHOY3uC7slDyRg4dQTgNViZUwo",
    description: "Col bénitier délicat avec dos drapé en cascade de soie et chaîne dorée amovible.",
    features: ["Col bénitier chic", "Dos drapé soie", "Chaîne dorée bijou", "Élégance discrète"],
    rating: 4.9,
    badge: "Nouveauté"
  },
  {
    id: 'p-line3-5',
    title: "Voile de Reine",
    category: 'Bohème & Chic',
    lineIndex: 3,
    price: "260 000 FCFA",
    refCode: "JF-EE-05",
    imageUrl: "https://lh3.googleusercontent.com/d/1_320bnI61cAL3cGceiZPrFBFyk_xxYMz",
    description: "Création moderne 2-en-1 avec sur-jupe en tulle doré scintillante et fourreau épuré.",
    features: ["Look 2-en-1", "Sur-jupe dorée", "Pratique & élégante", "Idéal soirée"],
    rating: 5.0
  },
  {
    id: 'p-line3-6',
    title: "Goutte de Rosée",
    category: 'Bohème & Chic',
    lineIndex: 3,
    price: "280 000 FCFA",
    refCode: "JF-EE-06",
    imageUrl: "https://lh3.googleusercontent.com/d/1le0arrjstrMZVYMxpRYKXS1UFLXYlmuy",
    description: "Robe de mariée brodée de micro-paillettes or solaire reflétant la lumière sous tous les angles.",
    features: ["Micro-paillettes or", "Reflets solaires", "Traîne intermédiaire", "Finition Haute Couture"],
    rating: 4.8
  },
  {
    id: 'p-line3-7',
    title: "Élégance Satinée Bamako",
    category: 'Bohème & Chic',
    lineIndex: 3,
    price: "245 000 FCFA",
    refCode: "JF-EE-07",
    imageUrl: "https://lh3.googleusercontent.com/d/1TrO6NDxdvBn9xSsZmJ8iZ1XSoU2-FKPh",
    description: "Coupe bohème fluide sublimée par des détails dorés faits main à l'atelier de Yirimadjo.",
    features: ["Coupe fluide", "Motifs dorés", "Tissu respirant", "Confort toute la journée"],
    rating: 4.9
  },
  {
    id: 'p-line3-8',
    title: "Mousseline d'Or Fleurie",
    category: 'Bohème & Chic',
    lineIndex: 3,
    price: "235 000 FCFA",
    refCode: "JF-EE-08",
    imageUrl: "https://lh3.googleusercontent.com/d/1N_ByltArK3WJmFlTQFELebrIf2vPsiqF",
    description: "Une envolée de mousseline étincelante garnie de petites fleurs brodées au fil d'or.",
    features: ["Mousseline légère", "Broderie florale d'or", "Col romantique", "Luxe accessible"],
    rating: 4.8
  },
  {
    id: 'p-line3-9',
    title: "Symphonie Bohème",
    category: 'Bohème & Chic',
    lineIndex: 3,
    price: "255 000 FCFA",
    refCode: "JF-EE-09",
    imageUrl: "https://lh3.googleusercontent.com/d/1ofV_-es17CpNrcn_F-3bTCYyowLMjgEj",
    description: "Combinaison raffinée de mousseline et de dentelle dorée épurée pour la mariée moderne.",
    features: ["Dentelle épurée", "Traîne souple", "Maintien discret", "Sophistication naturelle"],
    rating: 4.9
  },
  {
    id: 'p-line3-10',
    title: "Eclat de Soie Yirimadjo",
    category: 'Bohème & Chic',
    lineIndex: 3,
    price: "265 000 FCFA",
    refCode: "JF-EE-10",
    imageUrl: "https://lh3.googleusercontent.com/d/1sWulKfEIDWiZQ_thS3a58C7t0Uvbo94u",
    description: "Tenue nuptiale poétique aux finitions soignées en satin souple et garnitures dorées.",
    features: ["Satin souple", "Garnitures dorées", "Finition poétique", "Creation unique"],
    rating: 5.0,
    badge: "Favori"
  },
  {
    id: 'p-line3-11',
    title: "Fleur de Coton & Or",
    category: 'Bohème & Chic',
    lineIndex: 3,
    price: "225 000 FCFA",
    refCode: "JF-EE-11",
    imageUrl: "https://lh3.googleusercontent.com/d/1wSKVUWVkz-21eSZj-pfNWGNiH6H4fnGK",
    description: "Légèreté et volupté avec bustier drapé et traîne aérienne soulignée d'or doux.",
    features: ["Bustier drapé", "Traîne aérienne", "Or doux métallisé", "Essayage facile"],
    rating: 4.7
  },
  {
    id: 'p-line3-12',
    title: "Harmonie Nuptiale",
    category: 'Bohème & Chic',
    lineIndex: 3,
    price: "275 000 FCFA",
    refCode: "JF-EE-12",
    imageUrl: "https://lh3.googleusercontent.com/d/1Wd68_lBMo3YtJUTytzzGnaFJab7x4V3h",
    description: "Silhouette épurée Haute Couture mariant simplicité moderne et broderies d'art.",
    features: ["Silhouette moderne", "Broderies d'art", "Ajustement sur mesure", "Finitions dorées"],
    rating: 5.0,
    badge: "Exclusivité"
  }
];

// Section 6: FAQ
export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Boutique & Essayages',
    question: "Comment puis-je essayer une robe dans votre boutique à Badalabougou ?",
    answer: "Vous êtes la bienvenue dans notre atelier boutique situé à Badalabougou, Bamako ! Pour garantir un accueil personnalisé, nous vous conseillons de réserver votre créneau gratuit par téléphone au +223 72 56 89 75 ou via notre bouton WhatsApp."
  },
  {
    id: 'faq-2',
    category: 'Commande & Délais',
    question: "Quels sont les délais de confection pour une robe sur mesure ?",
    answer: "Pour les confections sur-mesure Haute Couture, nous recommandons de passer commande 2 à 4 semaines avant la date de votre événement. Cependant, nous disposons également d'une collection prête à porter disponible immédiatement en boutique avec ajustements express."
  },
  {
    id: 'faq-3',
    category: 'Livraison',
    question: "Proposez-vous la livraison à Bamako, dans les régions du Mali et à l'international ?",
    answer: "Oui ! Nous livrons en toute sécurité à Bamako (livraison à domicile par coursier VIP), dans toutes les régions du Mali (Kayes, Ségou, Sikasso, Mopti, etc.) ainsi qu'à l'international (France, Côte d'Ivoire, Sénégal, Gabon, etc.) via nos partenaires logistiques."
  },
  {
    id: 'faq-4',
    category: 'Paiements',
    question: "Quels sont les modes de paiement acceptés chez Jes Fashion ?",
    answer: "Nous acceptons les paiements via Orange Money (+223 72 56 89 75), Moov Money, Wave, les espèces directement à l'atelier de Badalabougou, ainsi que les virements bancaires et transferts internationaux (Western Union, MoneyGram, Ria)."
  },
  {
    id: 'faq-5',
    category: 'Personnalisation',
    question: "Puis-je modifier la traîne, les manches ou ajouter plus de broderies dorées à un modèle ?",
    answer: "Absolument ! En tant que couturière spécialiste de haute couture, chaque modèle de notre catalogue peut être ajusté selon vos envies : rallonger ou raccourcir la traîne, ajouter des manches longues en dentelle, ajouter ou alléger les broderies dorées."
  },
  {
    id: 'faq-6',
    category: 'Prise de Mesures',
    question: "Comment prendre mes mesures si je suis à l'extérieur de Bamako ?",
    answer: "C'est très simple ! Notre équipe vous contacte directement en appel vidéo sur WhatsApp pour vous guider étape par étape lors de la prise de vos mesures (tour de poitrine, tour de taille, tour de hanches, hauteur avec talons)."
  }
];
