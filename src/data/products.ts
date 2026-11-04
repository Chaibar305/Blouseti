import { Product } from '@/types';

export const PRODUCTS: Product[] = [
  {
    id: 'scrub-prestige-4way',
    name: 'Scrub Médical Confort 4-Way Stretch',
    subtitle: 'Ensemble complet : Haut Col V + Pantalon Jogger 6 poches',
    category: 'scrubs',
    price: 349,
    originalPrice: 420,
    badge: '🔥 Bestseller N°1 Soignants',
    rating: 4.9,
    reviewCount: 142,
    colors: [
      { name: 'Bleu Marine Médical', hex: '#1B2A4A', image: '/images/scrub-navy.jpg' },
      { name: 'Vert Sauge Apaisant', hex: '#7D9D8B', image: '/images/scrub-sage.jpg' },
      { name: 'Bordeaux Chirurgical', hex: '#6D1A2B', image: '/images/scrub-burgundy.jpg' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    description: 'Conçu spécialement pour les longues gardes et le confort des professionnels de santé au Maroc. Tissu technique 4-Way Stretch extensible, déperlant et anti-froissage.',
    features: [
      'Tissu 72% Polyester, 21% Rayonne, 7% Spandex',
      'Ceinture élastique ultra-souple avec cordon de serrage',
      '6 poches ergonomiques dont poche ciseaux et smartphone',
      'Résistant aux lavages fréquents jusqu’à 60°C sans décolorer',
      'Option broderie nom et fonction sur la poche poitrine'
    ],
    fabric: 'Micro-fibre technique respirante 4-Way Stretch',
    fit: 'Coupe semi-ajustée moderne (Jogger fit)'
  },
  {
    id: 'blouse-dr-prestige',
    name: 'Blouse Médicale Blanche "Dr. Prestige"',
    subtitle: 'Coupe cintrée haut de gamme avec col officier & boutons pression',
    category: 'blouses',
    price: 289,
    originalPrice: 350,
    badge: '⭐ Recommandé par les Médecins',
    rating: 4.8,
    reviewCount: 96,
    colors: [
      { name: 'Blanc Pur Optique', hex: '#FFFFFF', image: '/images/blouse-blanche.jpg' },
      { name: 'Blanc & Liseré Marine', hex: '#E2E8F0', image: '/images/blouse-blanche.jpg' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    description: 'L’élégance intemporelle pour les cabinets, cliniques et hôpitaux. Tissu opaque sergé haute densité traité anti-taches et antibactérien.',
    features: [
      'Tissu sergé 65% Coton peigné, 35% Polyester technique',
      'Fermeture rapide à boutons-pression invisibles inoxydables',
      '2 poches basses profondes + 1 poche poitrine stylisée',
      'Fente d’aisance au dos pour une totale liberté de mouvement',
      'Broderie personnalisée disponible avec emblème caducée'
    ],
    fabric: 'Sergé coton-poly lourd anti-plis et anti-transparence',
    fit: 'Coupe anatomique élégante'
  },
  {
    id: 'veste-polaire-thermo',
    name: 'Veste Polaire Médicale Thermo-Lite',
    subtitle: 'Veste zippée micropolaire chaude pour blocs & gardes de nuit',
    category: 'vestes',
    price: 299,
    originalPrice: 380,
    badge: '❄️ Indispensable Bloc & Urgences',
    rating: 4.9,
    reviewCount: 78,
    colors: [
      { name: 'Bleu Marine Clinique', hex: '#1B2A4A', image: '/images/veste-polaire.jpg' },
      { name: 'Noir Carbone', hex: '#1E293B', image: '/images/veste-polaire.jpg' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'Protégez-vous de la climatisation des blocs opératoires et des nuits fraîches à l’hôpital grâce à cette veste micro-polaire respirante et légère.',
    features: [
      'Micro-polaire anti-boulochage 280g/m²',
      'Col montant protecteur et zip intégral YKK résistant',
      'Poche poitrine zippée sécurisée pour badge et stylos',
      'Manches ajustées avec passe-pouces pratiques',
      'Séchage ultra-rapide après lavage'
    ],
    fabric: 'Micro-polaire thermo-régulatrice 100% Polyester',
    fit: 'Coupe athlétique confortable'
  },
  {
    id: 'pack-garde-duo',
    name: 'Pack Duo "Garde 24h" (2 Scrubs + Broderie Offerte)',
    subtitle: '2 Ensembles de scrubs complets au choix + 2 broderies offertes',
    category: 'packs',
    price: 599,
    originalPrice: 760,
    badge: '🎁 Économisez 160 DH',
    rating: 5.0,
    reviewCount: 114,
    colors: [
      { name: 'Duo Bleu Marine & Vert Sauge', hex: '#1B2A4A', image: '/images/scrub-navy.jpg' },
      { name: 'Duo Bleu Marine & Bordeaux', hex: '#6D1A2B', image: '/images/scrub-burgundy.jpg' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    description: 'La formule préférée des internes, résidents et soignants actifs : 2 tenues médicales complètes de qualité supérieure, avec la broderie de votre nom offerte sur les deux articles !',
    features: [
      'Contient 2 hauts col V + 2 pantalons joggers',
      'Broderie personnalisée de votre prénom et fonction 100% offerte',
      'Livraison express gratuite partout au Maroc',
      'Mixez les couleurs selon vos préférences de service'
    ],
    fabric: 'Micro-fibre 4-Way Stretch ultra-confort',
    fit: 'Coupe moderne universelle'
  },
  {
    id: 'scrub-sage-zen',
    name: 'Scrub Médical Sérénité Vert Sauge',
    subtitle: 'Couleur apaisante certifiée pour cabinet dentaire et pédiatrie',
    category: 'scrubs',
    price: 349,
    originalPrice: 410,
    badge: '🌿 Teinte Tendance 2026',
    rating: 4.8,
    reviewCount: 63,
    colors: [
      { name: 'Vert Sauge Tendance', hex: '#7D9D8B', image: '/images/scrub-sage.jpg' },
      { name: 'Bleu Marine', hex: '#1B2A4A', image: '/images/scrub-navy.jpg' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Le vert sauge apporte calme et sérénité aux patients tout en sublimant votre silhouette professionnelle. Finition soignée au millimètre près.',
    features: [
      'Tissu antibactérien traité argent naturel',
      'Col V double surpiqûre indéformable',
      'Poches latérales profondes renforcées',
      'Tissu léger et aéré idéal toute l’année'
    ],
    fabric: 'Extensible 4 directions respirant',
    fit: 'Coupe semi-ajustée'
  },
  {
    id: 'scrub-burgundy-elite',
    name: 'Scrub Chirurgical Prestige Bordeaux',
    subtitle: 'Teinte riche et élégante pour chirurgiens et spécialistes',
    category: 'scrubs',
    price: 349,
    originalPrice: 420,
    badge: '👑 Distinction & Style',
    rating: 4.9,
    reviewCount: 81,
    colors: [
      { name: 'Bordeaux Profond', hex: '#6D1A2B', image: '/images/scrub-burgundy.jpg' },
      { name: 'Bleu Marine', hex: '#1B2A4A', image: '/images/scrub-navy.jpg' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'Une touche de distinction pour les consultations et interventions. Teinte bordeaux profond résistant à l’eau de javel diluée et aux lavages hospitaliers.',
    features: [
      'Résistance supérieure aux frottements et lavages intensifs',
      'Jogger pant avec chevilles côtelées confortables',
      'Boucle porte-badge pratique intégrée à l’épaule',
      'Tissu déperlant qui repousse les liquides organiques légers'
    ],
    fabric: 'Techno-stretch premium',
    fit: 'Coupe moderne'
  }
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Dr. Mehdi Bennani',
    role: 'Chirurgien Dentiste',
    city: 'Casablanca (Gauthier)',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    stars: 5,
    comment: 'Franchement impressionné par la qualité du tissu ! Après 30 lavages à 60°C, la couleur bleu marine reste éclatante et la coupe jogger est très confortable au fauteuil toute la journée. La broderie de mon nom est magnifique.',
    itemBought: 'Scrub Confort 4-Way Stretch (Bleu Marine)'
  },
  {
    id: 2,
    name: 'Dr. Sarah El Alami',
    role: 'Médecin Généraliste',
    city: 'Rabat (Agdal)',
    avatar: 'https://images.unsplash.com/photo-1594824813501-4892c55d04c9?w=150&auto=format&fit=crop&q=80',
    stars: 5,
    comment: 'Commande passée le mardi à 14h, reçue le lendemain à Rabat. Le paiement à la livraison rassure beaucoup. La blouse cintrée Dr. Prestige tombe impeccablement bien, coupe digne des grandes marques internationales.',
    itemBought: 'Blouse Médicale Blanche Dr. Prestige'
  },
  {
    id: 3,
    name: 'Yassine Kabbaj',
    role: 'Interne en Réanimation CHU',
    city: 'Marrakech',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
    stars: 5,
    comment: 'Le Pack Duo Garde 24h est juste parfait. La veste polaire est devenue mon indispensable pour les gardes de nuit froides aux urgences. Le service client sur WhatsApp a répondu en 5 minutes pour m’aider sur la taille.',
    itemBought: 'Pack Duo Garde 24h + Veste Polaire'
  },
  {
    id: 4,
    name: 'Kaoutar Tazi',
    role: 'Infirmière Anesthésiste',
    city: 'Tanger',
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&auto=format&fit=crop&q=80',
    stars: 5,
    comment: 'Le vert sauge est encore plus beau en vrai ! Tissu très extensible, on ne se sent pas du tout étouffée pendant les heures de bloc opératoire. Je recommande à tous mes collègues.',
    itemBought: 'Scrub Médical Sérénité Vert Sauge'
  }
];

export const FAQS = [
  {
    question: 'Comment se passe le paiement à la livraison (Cash on Delivery) ?',
    answer: 'C’est très simple et 100% sécurisé : vous passez commande en 1 clic sans payer d’avance. Notre livreur partenaire vous remet votre colis à domicile ou au cabinet médical, et vous ne payez le montant exact en espèces qu’à ce moment-là.'
  },
  {
    question: 'Quels sont les délais de livraison au Maroc ?',
    answer: 'Nous expédions depuis nos ateliers sous 24h. Les livraisons prennent généralement 24h pour l’axe Casablanca-Rabat-Kénitra, et 24h à 48h ouvrables pour Marrakech, Tanger, Fès, Agadir, Oujda et les autres villes du Royaume.'
  },
  {
    question: 'Puis-je échanger si la taille ne me convient pas ?',
    answer: 'Absolument ! Si après essayage la taille ne vous convient pas, contactez notre équipe sur WhatsApp sous 48h. Nous organisons un échange de taille rapide et sans tracas.'
  },
  {
    question: 'Comment fonctionne la personnalisation par broderie ?',
    answer: 'Vous pouvez cocher l’option broderie (+20 DH seulement, ou offerte dans les Packs). Nous brodons au fil résistant de haute précision votre Titre et Nom complet (ex: "Dr. S. Bennani") et éventuellement votre spécialité sur la poche poitrine.'
  },
  {
    question: 'Faites-vous des prix pour les cliniques, cabinets et commandes groupées ?',
    answer: 'Oui ! À partir de 5 tenues pour votre équipe médicale ou votre promotion d’étudiants, nous appliquons un tarif dégressif avec broderie du logo de votre clinique offerte. Contactez-nous directement via notre bouton WhatsApp pour un devis personnalisé immédiat.'
  }
];
