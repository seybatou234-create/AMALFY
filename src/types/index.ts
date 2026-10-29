export type UserRole = 'client' | 'pro' | 'seller' | 'landlord' | 'admin';

export type IdentityDocumentType = 'CNI' | 'Passeport' | 'Permis' | 'Carte_Consulaire';
export type IdentityVerificationStatus = 'verifie' | 'en_attente' | 'non_fourni';

export interface IdentityDocument {
  type: IdentityDocumentType;
  documentNumber: string; // Ex: '1 751 1991 03822' (format CNI CEDEAO Sénégal) ou 'A08492015' (Passeport)
  frontImageUrl: string; // Photo / scan du recto
  backImageUrl?: string; // Photo / scan du verso
  verificationStatus: IdentityVerificationStatus;
  verifiedAt?: string;
  deliveryDate?: string;
  expirationDate?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  avatar?: string;
  roles: UserRole[];
  city: string;
  quarter?: string;
  bio?: string;
  createdAt: string;
  isVerified?: boolean;
  identityDocument?: IdentityDocument;
}

export type ServiceProfession =
  | 'Mécanicien'
  | 'Plombier'
  | 'Électricien'
  | 'Professeur particulier'
  | 'Informaticien'
  | 'Coiffeur / Coiffeuse'
  | 'Réparateur de téléphones'
  | 'Frigoriste & Climaticien'
  | 'Menuisier'
  | 'Photographe & Vidéaste'
  | 'Technicien de surface & Nettoyage'
  | 'Peintre en bâtiment'
  | 'Maçon & Carreleur'
  | 'Autre métier';

export interface ProProfile {
  id: string;
  userId: string;
  profession: ServiceProfession;
  specialtyTitle: string;
  experienceYears: number;
  hourlyRate?: number;
  startingPrice: number;
  description: string;
  skills: string[];
  portfolioImages: string[];
  rating: number;
  reviewCount: number;
  city: string;
  quarter: string;
  phone: string;
  whatsappNumber: string;
  isAvailable: boolean;
  verifiedBadge: boolean;
  avatar?: string;
  user?: Partial<User>;
  identityDocument?: IdentityDocument;
}

export type UrgencyLevel = 'normale' | 'urgente' | 'tres_urgente';
export type ServiceRequestStatus = 'en_attente' | 'devis_envoye' | 'accepte' | 'refuse' | 'termine';

export interface ServiceRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientWhatsapp: string;
  proId: string;
  serviceType: string;
  title: string;
  description: string;
  city: string;
  quarter: string;
  address: string;
  dateRequested: string;
  urgency: UrgencyLevel;
  status: ServiceRequestStatus;
  quoteAmount?: number;
  quoteNotes?: string;
  createdAt: string;
}

export type PropertyType =
  | 'maison'
  | 'appartement'
  | 'studio'
  | 'chambre'
  | 'villa'
  | 'terrain'
  | 'bureau'
  | 'magasin'
  | 'local_commercial';

export type TransactionType = 'location' | 'vente';
export type PropertyStatus = 'disponible' | 'loue' | 'vendu' | 'en_negociation';

export interface RealEstateListing {
  id: string;
  userId: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  transactionType: TransactionType;
  price: number;
  pricePeriod?: 'mois' | 'jour' | 'total';
  surface: number; // m²
  rooms?: number;
  bathrooms?: number;
  city: string;
  quarter: string;
  address: string;
  features: string[];
  images: string[];
  status: PropertyStatus;
  advertiserName: string;
  advertiserPhone: string;
  advertiserWhatsapp: string;
  advertiserRole: 'proprietaire' | 'agent' | 'courtier';
  createdAt: string;
  viewsCount?: number;
  isFeatured?: boolean;
  isApproved: boolean;
}

export interface VisitRequest {
  id: string;
  listingId: string;
  listingTitle: string;
  userId: string;
  userName: string;
  userPhone: string;
  userWhatsapp: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
  status: 'en_attente' | 'confirmee' | 'annulee' | 'terminee';
  createdAt: string;
}

export type ProductCategory =
  | 'vetements_homme'
  | 'vetements_femme'
  | 'chaussures'
  | 'sacs'
  | 'accessoires'
  | 'montres_bijoux'
  | 'smartphones'
  | 'ordinateurs'
  | 'electronique'
  | 'electromenager'
  | 'voitures'
  | 'motos'
  | 'pieces_detachees'
  | 'meubles'
  | 'decoration'
  | 'beaute'
  | 'sport'
  | 'fournitures'
  | 'autres';

export type ProductCondition = 'neuf' | 'tres_bon_etat' | 'bon_etat' | 'reconditionne';

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerWhatsapp: string;
  sellerType: 'particulier' | 'commercant';
  title: string;
  description: string;
  category: ProductCategory;
  price: number; // FCFA
  originalPrice?: number;
  condition: ProductCondition;
  stock: number;
  city: string;
  quarter: string;
  images: string[];
  
  // Specific category attributes
  clothingSizes?: string[];
  clothingColors?: string[];
  shoeSize?: string;
  
  carMake?: string;
  carModel?: string;
  carYear?: number;
  carMileage?: number;
  fuelType?: 'essence' | 'diesel' | 'hybride' | 'electrique';
  transmission?: 'manuelle' | 'automatique';
  
  techStorage?: string;
  techRam?: string;
  warrantyMonths?: number;

  createdAt: string;
  viewsCount?: number;
  isFeatured?: boolean;
  isApproved: boolean;
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  productImage: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export type DeliveryOption = 'express_dakar' | 'standard_senegal' | 'retrait_magasin';
export type PaymentMethod = 'wave' | 'orange_money' | 'paiement_livraison';
export type OrderStatus = 'nouvelle' | 'en_preparation' | 'en_livraison' | 'livree' | 'annulee';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string;
  deliveryCity: string;
  deliveryQuarter: string;
  deliveryAddress: string;
  deliveryOption: DeliveryOption;
  deliveryFee: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'en_attente_confirmation' | 'paye' | 'a_la_livraison';
  orderStatus: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantNames: { [userId: string]: string };
  itemType?: 'service' | 'immobilier' | 'produit';
  itemId?: string;
  itemTitle?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: { [userId: string]: number };
}

export interface Review {
  id: string;
  targetType: 'pro' | 'product' | 'landlord';
  targetId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  itemType: 'service' | 'immobilier' | 'produit';
  itemId: string;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  targetType: 'service' | 'immobilier' | 'produit' | 'user';
  targetId: string;
  targetTitle: string;
  reason: string;
  details: string;
  status: 'ouvert' | 'traite' | 'rejete';
  createdAt: string;
}

export type NotificationType = 'message' | 'devis_reponse' | 'vente_produit' | 'visite_confirmee';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: string;
  relatedType?: 'message' | 'service' | 'order' | 'immobilier';
  createdAt: string;
}

export type CyberAttackType =
  | 'xss'
  | 'sql_injection'
  | 'nosql_injection'
  | 'path_traversal'
  | 'ddos_rate_limit'
  | 'scanner_probe'
  | 'prototype_pollution'
  | 'command_injection';

export interface SecurityEvent {
  id: string;
  timestamp: string;
  threatType: CyberAttackType;
  ip: string;
  path: string;
  method: string;
  userAgent: string;
  payloadSummary: string;
  actionTaken: 'bloque' | 'neutralise' | 'banni';
}

export interface CyberShieldStatus {
  isActive: boolean;
  defenseMode: 'standard' | 'renforce' | 'verrouille';
  threatLevel: 'faible' | 'modere' | 'critique';
  totalAttacksBlocked: number;
  blockedByType: Record<CyberAttackType, number>;
  activeBannedIpsCount: number;
  uptimeHours: number;
  recentEvents: SecurityEvent[];
}

