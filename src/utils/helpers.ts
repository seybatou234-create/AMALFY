export function formatFCFA(amount: number): string {
  if (isNaN(amount)) return '0 FCFA';
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0
  }).format(amount) + ' FCFA';
}

export function formatPhoneForWhatsApp(phone: string): string {
  // Clean phone number: remove +, spaces, dashes
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('00221')) {
    cleaned = cleaned.substring(2);
  }
  if (cleaned.startsWith('221')) return cleaned;
  if (cleaned.length === 9) return '221' + cleaned;
  return cleaned;
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const number = formatPhoneForWhatsApp(phone);
  const text = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${text}`;
}

export function formatPublicationDate(dateString: string): string {
  if (!dateString) return 'Récemment';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Publié il y a quelques instants';
    if (diffHours < 24) return `Publié aujourd’hui (${diffHours}h)`;
    if (diffDays === 1) return 'Publié hier';
    if (diffDays < 7) return `Publié il y a ${diffDays} jours`;

    return 'Publié le ' + date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  } catch {
    return 'Publié récemment';
  }
}

export const SENEGAL_CITIES = [
  'Toutes',
  'Dakar',
  'Thiès',
  'Mbour',
  'Saly Portudal',
  'Saint-Louis',
  'Rufisque',
  'Touba',
  'Kaolack',
  'Ziguinchor'
];

export const DAKAR_QUARTERS = [
  'Almadies',
  'Ngor',
  'Ouakam',
  'Mermoz',
  'Sacré-Cœur',
  'Plateau',
  'Fann Résidence',
  'Point E',
  'Liberté 6',
  'Maristes',
  'Parcelles Assainies',
  'Grand Yoff',
  'Yoff',
  'Guédiawaye',
  'Pikine',
  'Diamniadio'
];

export const SERVICE_PROFESSIONS = [
  'Tous',
  'Frigoriste & Climaticien',
  'Mécanicien',
  'Électricien',
  'Plombier',
  'Professeur particulier',
  'Informaticien',
  'Coiffeur / Coiffeuse',
  'Réparateur de téléphones',
  'Menuisier',
  'Photographe & Vidéaste',
  'Technicien de surface & Nettoyage',
  'Peintre en bâtiment',
  'Maçon & Carreleur'
];

export const PROPERTY_TYPES = [
  { value: 'Tous', label: 'Tous les biens' },
  { value: 'appartement', label: 'Appartement' },
  { value: 'villa', label: 'Villa' },
  { value: 'studio', label: 'Studio' },
  { value: 'chambre', label: 'Chambre' },
  { value: 'terrain', label: 'Terrain' },
  { value: 'bureau', label: 'Bureau' },
  { value: 'magasin', label: 'Magasin' },
  { value: 'local_commercial', label: 'Local commercial' }
];

export const MARKET_CATEGORIES = [
  { value: 'Toutes', label: 'Tout le Market' },
  { value: 'smartphones', label: 'Smartphones' },
  { value: 'ordinateurs', label: 'Ordinateurs' },
  { value: 'electronique', label: 'Électronique' },
  { value: 'electromenager', label: 'Électroménager' },
  { value: 'voitures', label: 'Voitures' },
  { value: 'motos', label: 'Motos & Scooters' },
  { value: 'pieces_detachees', label: 'Pièces détachées' },
  { value: 'vetements_homme', label: 'Mode Homme' },
  { value: 'vetements_femme', label: 'Mode Femme' },
  { value: 'chaussures', label: 'Chaussures' },
  { value: 'sacs', label: 'Sacs & Maroquinerie' },
  { value: 'montres_bijoux', label: 'Montres & Bijoux' },
  { value: 'meubles', label: 'Meubles & Salon' },
  { value: 'decoration', label: 'Décoration' },
  { value: 'beaute', label: 'Beauté & Parfums' },
  { value: 'sport', label: 'Sport & Fitness' },
  { value: 'autres', label: 'Autres produits' }
];
