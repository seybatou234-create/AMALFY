import { Router, Request, Response } from 'express';
import { db } from './db.js';
import { cyberShield } from './security.js';
import {
  User,
  ProProfile,
  ServiceRequest,
  RealEstateListing,
  VisitRequest,
  Product,
  Order,
  Conversation,
  Message,
  Review,
  FavoriteItem,
  ReportItem,
  AppNotification
} from '../src/types/index.js';

export const apiRouter = Router();

// ==========================================
// 1. AUTH & USERS
// ==========================================
apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'usr_admin_1';
  const user = db.get().users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' });
  }
  res.json(user);
});

apiRouter.get('/users', (_req: Request, res: Response) => {
  res.json(db.get().users);
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { identifier } = req.body; // email or phone
  if (!identifier) {
    return res.status(400).json({ error: 'Email ou numéro de téléphone requis' });
  }
  const cleanId = String(identifier).trim().toLowerCase();
  const user = db.get().users.find(
    (u) =>
      u.email.toLowerCase() === cleanId ||
      u.phone.replace(/\s+/g, '') === cleanId.replace(/\s+/g, '') ||
      u.whatsappNumber.replace(/\s+/g, '') === cleanId.replace(/\s+/g, '')
  );

  if (user) {
    return res.json(user);
  }

  // Create guest user if not found
  const newUser: User = {
    id: 'usr_' + Date.now(),
    name: cleanId.includes('@') ? cleanId.split('@')[0] : 'Utilisateur LEPP',
    email: cleanId.includes('@') ? cleanId : `${cleanId}@lepp.sn`,
    phone: cleanId.startsWith('+') ? cleanId : `+221 ${cleanId}`,
    whatsappNumber: cleanId.startsWith('+') ? cleanId : `+221${cleanId}`,
    roles: ['client'],
    city: 'Dakar',
    quarter: 'Plateau',
    createdAt: new Date().toISOString(),
    isVerified: true
  };
  db.get().users.push(newUser);
  db.save();
  res.json(newUser);
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, whatsappNumber, roles, city, quarter, bio } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Nom et numéro de téléphone requis' });
  }
  const newUser: User = {
    id: 'usr_' + Date.now(),
    name,
    email: email || `${phone.replace(/\D/g, '')}@lepp.sn`,
    phone,
    whatsappNumber: whatsappNumber || phone,
    roles: roles && roles.length ? roles : ['client'],
    city: city || 'Dakar',
    quarter: quarter || '',
    bio: bio || '',
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80`,
    createdAt: new Date().toISOString(),
    isVerified: true
  };
  db.get().users.push(newUser);
  db.save();
  res.status(201).json(newUser);
});

apiRouter.put('/auth/user/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.get().users.findIndex((u) => u.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' });
  }
  const updatedUser: User = {
    ...db.get().users[index],
    ...req.body,
    id // keep original ID
  };
  db.get().users[index] = updatedUser;

  // Sync to proProfiles if identityDocument or avatar updated
  if (req.body.identityDocument) {
    db.get().proProfiles.forEach((p) => {
      if (p.userId === id) {
        p.identityDocument = req.body.identityDocument;
        p.verifiedBadge = true;
      }
    });
  }
  db.save();
  res.json(updatedUser);
});

// ==========================================
// 2. LEPP SERVICES & PROS
// ==========================================
apiRouter.get('/services/pros', (req: Request, res: Response) => {
  let pros = [...db.get().proProfiles];
  const { profession, city, search, isAvailable } = req.query;

  if (profession && profession !== 'Tous') {
    pros = pros.filter((p) => p.profession === profession);
  }
  if (city && city !== 'Toutes') {
    pros = pros.filter((p) => p.city.toLowerCase() === (city as string).toLowerCase());
  }
  if (isAvailable === 'true') {
    pros = pros.filter((p) => p.isAvailable);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    pros = pros.filter(
      (p) =>
        p.specialtyTitle.toLowerCase().includes(q) ||
        p.profession.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.skills.some((s) => s.toLowerCase().includes(q)) ||
        p.quarter.toLowerCase().includes(q)
    );
  }

  // Populate user data and ensure identityDocument is present
  const populated = pros.map((pro) => {
    const user = db.get().users.find((u) => u.id === pro.userId);
    const identityDocument = pro.identityDocument || user?.identityDocument;
    return { ...pro, user, identityDocument };
  });

  res.json(populated);
});

apiRouter.get('/services/pros/:id', (req: Request, res: Response) => {
  const pro = db.get().proProfiles.find((p) => p.id === req.params.id);
  if (!pro) {
    return res.status(404).json({ error: 'Profil professionnel introuvable' });
  }
  const user = db.get().users.find((u) => u.id === pro.userId);
  const reviews = db.get().reviews.filter((r) => r.targetType === 'pro' && r.targetId === pro.id);
  const identityDocument = pro.identityDocument || user?.identityDocument;
  res.json({ ...pro, user, identityDocument, reviews });
});

apiRouter.post('/services/pros', (req: Request, res: Response) => {
  const {
    userId,
    profession,
    specialtyTitle,
    experienceYears,
    hourlyRate,
    startingPrice,
    description,
    skills,
    portfolioImages,
    city,
    quarter,
    phone,
    whatsappNumber,
    avatar,
    identityDocument
  } = req.body;

  if (!profession || !specialtyTitle || !startingPrice) {
    return res.status(400).json({ error: 'Champs obligatoires manquants pour le profil pro' });
  }

  // Ensure user has 'pro' role
  const user = db.get().users.find((u) => u.id === userId);
  if (user) {
    if (!user.roles.includes('pro')) {
      user.roles.push('pro');
    }
    if (avatar) {
      user.avatar = avatar;
    }
    if (identityDocument) {
      user.identityDocument = identityDocument;
      user.isVerified = true;
    }
  }

  const effectiveIdDoc = identityDocument || user?.identityDocument;

  const newPro: ProProfile = {
    id: 'pro_' + Date.now(),
    userId,
    profession,
    specialtyTitle,
    experienceYears: Number(experienceYears) || 1,
    hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
    startingPrice: Number(startingPrice),
    description: description || '',
    skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s: string) => s.trim()) : []),
    portfolioImages: Array.isArray(portfolioImages) && portfolioImages.length > 0
      ? portfolioImages
      : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'],
    rating: 5.0,
    reviewCount: 0,
    city: city || 'Dakar',
    quarter: quarter || 'Almadies',
    phone: phone || user?.phone || '+221 77 000 00 00',
    whatsappNumber: whatsappNumber || user?.whatsappNumber || phone || '+221770000000',
    isAvailable: true,
    verifiedBadge: Boolean(effectiveIdDoc),
    identityDocument: effectiveIdDoc
  };

  db.get().proProfiles.unshift(newPro);
  db.save();
  res.status(201).json(newPro);
});

// Service Requests (Devis & Réservations)
apiRouter.get('/services/requests', (req: Request, res: Response) => {
  const { userId, role } = req.query;
  let requests = [...db.get().serviceRequests];

  if (userId) {
    if (role === 'pro') {
      // Find pro id for this user
      const pro = db.get().proProfiles.find((p) => p.userId === userId);
      if (pro) {
        requests = requests.filter((r) => r.proId === pro.id);
      }
    } else {
      requests = requests.filter((r) => r.clientId === userId);
    }
  }

  res.json(requests);
});

apiRouter.post('/services/requests', (req: Request, res: Response) => {
  const {
    clientId,
    clientName,
    clientPhone,
    clientWhatsapp,
    proId,
    serviceType,
    title,
    description,
    city,
    quarter,
    address,
    dateRequested,
    urgency
  } = req.body;

  if (!title || !description || !proId) {
    return res.status(400).json({ error: 'Veuillez renseigner le titre, la description et le professionnel' });
  }

  const newRequest: ServiceRequest = {
    id: 'sr_' + Date.now(),
    clientId: clientId || 'usr_guest',
    clientName: clientName || 'Client LEPP',
    clientPhone: clientPhone || '+221 77 000 00 00',
    clientWhatsapp: clientWhatsapp || clientPhone || '+221770000000',
    proId,
    serviceType: serviceType || 'Service',
    title,
    description,
    city: city || 'Dakar',
    quarter: quarter || '',
    address: address || '',
    dateRequested: dateRequested || new Date().toISOString().split('T')[0],
    urgency: urgency || 'normale',
    status: 'en_attente',
    createdAt: new Date().toISOString()
  };

  db.get().serviceRequests.unshift(newRequest);
  db.save();
  res.status(201).json(newRequest);
});

apiRouter.patch('/services/requests/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.get().serviceRequests.findIndex((r) => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Demande non trouvée' });
  }

  const updated = {
    ...db.get().serviceRequests[index],
    ...req.body
  };
  db.get().serviceRequests[index] = updated;

  // Trigger notification if quote is sent or updated
  if (req.body.quoteAmount || req.body.status === 'devis_envoye') {
    const clientNotif: AppNotification = {
      id: 'notif_' + Date.now(),
      userId: updated.clientId,
      type: 'devis_reponse',
      title: 'Proposition de devis reçue !',
      message: `Le professionnel a envoyé son devis pour « ${updated.title} » : ${req.body.quoteAmount ? req.body.quoteAmount.toLocaleString() + ' FCFA' : 'Consultez les détails'}.`,
      isRead: false,
      relatedId: updated.id,
      relatedType: 'service',
      createdAt: new Date().toISOString()
    };
    db.get().notifications = db.get().notifications || [];
    db.get().notifications.unshift(clientNotif);
  }

  db.save();
  res.json(updated);
});

// ==========================================
// 3. LEPP IMMOBILIER
// ==========================================
apiRouter.get('/real-estate', (req: Request, res: Response) => {
  let listings = [...db.get().realEstateListings];
  const { propertyType, transactionType, city, minPrice, maxPrice, search } = req.query;

  if (propertyType && propertyType !== 'Tous') {
    listings = listings.filter((l) => l.propertyType === propertyType);
  }
  if (transactionType && transactionType !== 'Tous') {
    listings = listings.filter((l) => l.transactionType === transactionType);
  }
  if (city && city !== 'Toutes') {
    listings = listings.filter((l) => l.city.toLowerCase() === (city as string).toLowerCase());
  }
  if (minPrice) {
    listings = listings.filter((l) => l.price >= Number(minPrice));
  }
  if (maxPrice) {
    listings = listings.filter((l) => l.price <= Number(maxPrice));
  }
  if (search) {
    const q = (search as string).toLowerCase();
    listings = listings.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.quarter.toLowerCase().includes(q) ||
        l.features.some((f) => f.toLowerCase().includes(q))
    );
  }

  res.json(listings);
});

apiRouter.get('/real-estate/:id', (req: Request, res: Response) => {
  const listing = db.get().realEstateListings.find((l) => l.id === req.params.id);
  if (!listing) {
    return res.status(404).json({ error: 'Bien immobilier introuvable' });
  }
  res.json(listing);
});

apiRouter.post('/real-estate', (req: Request, res: Response) => {
  const {
    userId,
    title,
    description,
    propertyType,
    transactionType,
    price,
    pricePeriod,
    surface,
    rooms,
    bathrooms,
    city,
    quarter,
    address,
    features,
    images,
    advertiserName,
    advertiserPhone,
    advertiserWhatsapp,
    advertiserRole
  } = req.body;

  if (!title || !price || !propertyType || !transactionType) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  const defaultImg =
    propertyType === 'villa'
      ? 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80'
      : propertyType === 'terrain'
      ? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'
      : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80';

  const newListing: RealEstateListing = {
    id: 'immo_' + Date.now(),
    userId: userId || 'usr_admin_1',
    title,
    description: description || '',
    propertyType,
    transactionType,
    price: Number(price),
    pricePeriod: pricePeriod || (transactionType === 'location' ? 'mois' : 'total'),
    surface: Number(surface) || 50,
    rooms: rooms ? Number(rooms) : undefined,
    bathrooms: bathrooms ? Number(bathrooms) : undefined,
    city: city || 'Dakar',
    quarter: quarter || '',
    address: address || '',
    features: Array.isArray(features) ? features : [],
    images: Array.isArray(images) && images.length > 0 ? images : [defaultImg],
    status: 'disponible',
    advertiserName: advertiserName || 'Annonceur LEPP',
    advertiserPhone: advertiserPhone || '+221 77 000 00 00',
    advertiserWhatsapp: advertiserWhatsapp || advertiserPhone || '+221770000000',
    advertiserRole: advertiserRole || 'proprietaire',
    createdAt: new Date().toISOString(),
    isFeatured: false,
    isApproved: true
  };

  db.get().realEstateListings.unshift(newListing);
  db.save();
  res.status(201).json(newListing);
});

apiRouter.delete('/real-estate/:id', (req: Request, res: Response) => {
  const index = db.get().realEstateListings.findIndex((l) => l.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Annonce non trouvée' });
  }
  db.get().realEstateListings.splice(index, 1);
  db.save();
  res.json({ success: true, message: 'Annonce supprimée' });
});

// Demande de visite
apiRouter.post('/real-estate/visits', (req: Request, res: Response) => {
  const {
    listingId,
    listingTitle,
    userId,
    userName,
    userPhone,
    userWhatsapp,
    preferredDate,
    preferredTime,
    message
  } = req.body;

  if (!listingId || !userName || !userPhone || !preferredDate) {
    return res.status(400).json({ error: 'Veuillez remplir les informations obligatoires de la visite' });
  }

  const newVisit: VisitRequest = {
    id: 'vr_' + Date.now(),
    listingId,
    listingTitle: listingTitle || 'Bien immobilier',
    userId: userId || 'usr_guest',
    userName,
    userPhone,
    userWhatsapp: userWhatsapp || userPhone,
    preferredDate,
    preferredTime: preferredTime || '15:00',
    message: message || '',
    status: 'en_attente',
    createdAt: new Date().toISOString()
  };

  db.get().visitRequests.unshift(newVisit);
  db.save();
  res.status(201).json(newVisit);
});

apiRouter.get('/real-estate/visits', (req: Request, res: Response) => {
  const { userId } = req.query;
  let visits = [...db.get().visitRequests];
  if (userId) {
    visits = visits.filter((v) => v.userId === userId);
  }
  res.json(visits);
});

apiRouter.patch('/real-estate/visits/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.get().visitRequests.findIndex((v) => v.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Demande de visite non trouvée' });
  }

  const updated: VisitRequest = {
    ...db.get().visitRequests[index],
    ...req.body
  };
  db.get().visitRequests[index] = updated;

  // Add notification if status changed to 'confirmee'
  if (req.body.status === 'confirmee') {
    const notif: AppNotification = {
      id: 'notif_' + Date.now(),
      userId: updated.userId,
      type: 'visite_confirmee',
      title: 'Visite immobilière confirmée !',
      message: `Votre visite pour « ${updated.listingTitle} » prévue le ${new Date(updated.preferredDate).toLocaleDateString('fr-FR')} à ${updated.preferredTime} a été confirmée.`,
      isRead: false,
      relatedId: updated.id,
      relatedType: 'immobilier',
      createdAt: new Date().toISOString()
    };
    db.get().notifications = db.get().notifications || [];
    db.get().notifications.unshift(notif);
  }

  db.save();
  res.json(updated);
});

// ==========================================
// 4. LEPP MARKET
// ==========================================
apiRouter.get('/market/products', (req: Request, res: Response) => {
  let products = [...db.get().products];
  const { category, condition, minPrice, maxPrice, city, search } = req.query;

  if (category && category !== 'Toutes') {
    products = products.filter((p) => p.category === category);
  }
  if (condition && condition !== 'Tous') {
    products = products.filter((p) => p.condition === condition);
  }
  if (city && city !== 'Toutes') {
    products = products.filter((p) => p.city.toLowerCase() === (city as string).toLowerCase());
  }
  if (minPrice) {
    products = products.filter((p) => p.price >= Number(minPrice));
  }
  if (maxPrice) {
    products = products.filter((p) => p.price <= Number(maxPrice));
  }
  if (search) {
    const q = (search as string).toLowerCase();
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.quarter.toLowerCase().includes(q) ||
        (p.carMake && p.carMake.toLowerCase().includes(q)) ||
        (p.carModel && p.carModel.toLowerCase().includes(q))
    );
  }

  res.json(products);
});

apiRouter.get('/market/products/:id', (req: Request, res: Response) => {
  const product = db.get().products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Produit introuvable' });
  }
  // Increment view counter
  product.viewsCount = (product.viewsCount || 0) + 1;
  db.save();
  res.json(product);
});

apiRouter.post('/market/products', (req: Request, res: Response) => {
  const {
    sellerId,
    sellerName,
    sellerPhone,
    sellerWhatsapp,
    sellerType,
    title,
    description,
    category,
    price,
    originalPrice,
    condition,
    stock,
    city,
    quarter,
    images,
    clothingSizes,
    clothingColors,
    shoeSize,
    carMake,
    carModel,
    carYear,
    carMileage,
    fuelType,
    transmission,
    techStorage,
    techRam,
    warrantyMonths
  } = req.body;

  if (!title || !price || !category) {
    return res.status(400).json({ error: 'Titre, prix et catégorie obligatoires' });
  }

  const defaultImg =
    category === 'voitures'
      ? 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
      : category === 'smartphones'
      ? 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80'
      : category.startsWith('vetements')
      ? 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80'
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

  const newProduct: Product = {
    id: 'prod_' + Date.now(),
    sellerId: sellerId || 'usr_admin_1',
    sellerName: sellerName || 'Vendeur LEPP',
    sellerPhone: sellerPhone || '+221 77 000 00 00',
    sellerWhatsapp: sellerWhatsapp || sellerPhone || '+221770000000',
    sellerType: sellerType || 'particulier',
    title,
    description: description || '',
    category,
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    condition: condition || 'neuf',
    stock: stock ? Number(stock) : 1,
    city: city || 'Dakar',
    quarter: quarter || '',
    images: Array.isArray(images) && images.length > 0 ? images : [defaultImg],

    // Specific category attributes
    clothingSizes: Array.isArray(clothingSizes) ? clothingSizes : undefined,
    clothingColors: Array.isArray(clothingColors) ? clothingColors : undefined,
    shoeSize: shoeSize || undefined,

    carMake: carMake || undefined,
    carModel: carModel || undefined,
    carYear: carYear ? Number(carYear) : undefined,
    carMileage: carMileage ? Number(carMileage) : undefined,
    fuelType: fuelType || undefined,
    transmission: transmission || undefined,

    techStorage: techStorage || undefined,
    techRam: techRam || undefined,
    warrantyMonths: warrantyMonths ? Number(warrantyMonths) : undefined,

    createdAt: new Date().toISOString(),
    viewsCount: 1,
    isFeatured: false,
    isApproved: true
  };

  db.get().products.unshift(newProduct);
  db.save();
  res.status(201).json(newProduct);
});

apiRouter.delete('/market/products/:id', (req: Request, res: Response) => {
  const index = db.get().products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Produit introuvable' });
  }
  db.get().products.splice(index, 1);
  db.save();
  res.json({ success: true, message: 'Produit retiré' });
});

// ==========================================
// 5. COMMANDES & CHECKOUT
// ==========================================
apiRouter.get('/orders', (req: Request, res: Response) => {
  const { customerId } = req.query;
  let orders = [...db.get().orders];
  if (customerId) {
    orders = orders.filter((o) => o.customerId === customerId);
  }
  res.json(orders);
});

apiRouter.post('/orders', (req: Request, res: Response) => {
  const {
    customerId,
    customerName,
    customerPhone,
    customerWhatsapp,
    deliveryCity,
    deliveryQuarter,
    deliveryAddress,
    deliveryOption,
    paymentMethod,
    items,
    notes
  } = req.body;

  if (!items || !items.length || !customerName || !customerPhone || !deliveryAddress) {
    return res.status(400).json({ error: 'Veuillez remplir tous les champs de livraison obligatoires' });
  }

  const subtotal = items.reduce(
    (sum: number, item: any) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );

  const deliveryFee =
    deliveryOption === 'express_dakar' ? 3000 : deliveryOption === 'standard_senegal' ? 4500 : 0;

  const totalAmount = subtotal + deliveryFee;

  const newOrder: Order = {
    id: 'ord_' + Date.now(),
    customerId: customerId || 'usr_guest',
    customerName,
    customerPhone,
    customerWhatsapp: customerWhatsapp || customerPhone,
    deliveryCity: deliveryCity || 'Dakar',
    deliveryQuarter: deliveryQuarter || '',
    deliveryAddress,
    deliveryOption: deliveryOption || 'express_dakar',
    deliveryFee,
    paymentMethod: paymentMethod || 'wave',
    paymentStatus: paymentMethod === 'paiement_livraison' ? 'a_la_livraison' : 'en_attente_confirmation',
    orderStatus: 'nouvelle',
    items,
    subtotal,
    totalAmount,
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  db.get().orders.unshift(newOrder);

  // Trigger notification for seller(s) of the ordered products
  db.get().notifications = db.get().notifications || [];
  items.forEach((item: any) => {
    const prod = db.get().products.find((p) => p.id === item.productId);
    if (prod) {
      const sellerNotif: AppNotification = {
        id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        userId: prod.sellerId,
        type: 'vente_produit',
        title: '🎉 Félicitations, vous avez vendu un produit !',
        message: `${customerName} a commandé « ${item.productTitle} » (${(item.price * item.quantity).toLocaleString()} FCFA). Préparez l'expédition pour ${deliveryQuarter}, ${deliveryCity} !`,
        isRead: false,
        relatedId: newOrder.id,
        relatedType: 'order',
        createdAt: new Date().toISOString()
      };
      db.get().notifications.unshift(sellerNotif);
    }
  });

  // Also notify buyer
  const buyerNotif: AppNotification = {
    id: 'notif_' + Date.now() + '_buyer',
    userId: customerId || 'usr_guest',
    type: 'vente_produit',
    title: 'Commande validée !',
    message: `Votre commande #${newOrder.id.slice(-6)} d'un montant de ${totalAmount.toLocaleString()} FCFA est confirmée et en préparation.`,
    isRead: false,
    relatedId: newOrder.id,
    relatedType: 'order',
    createdAt: new Date().toISOString()
  };
  db.get().notifications.unshift(buyerNotif);

  db.save();
  res.status(201).json(newOrder);
});

apiRouter.patch('/orders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.get().orders.findIndex((o) => o.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Commande introuvable' });
  }
  const updated = {
    ...db.get().orders[index],
    ...req.body
  };
  db.get().orders[index] = updated;
  db.save();
  res.json(updated);
});

// ==========================================
// 6. CONVERSATIONS & MESSAGES
// ==========================================
apiRouter.get('/conversations', (req: Request, res: Response) => {
  const { userId } = req.query;
  let convs = [...db.get().conversations];
  if (userId) {
    convs = convs.filter((c) => c.participantIds.includes(userId as string));
  }
  res.json(convs);
});

apiRouter.get('/conversations/:id/messages', (req: Request, res: Response) => {
  const msgs = db.get().messages.filter((m) => m.conversationId === req.params.id);
  res.json(msgs);
});

apiRouter.post('/conversations', (req: Request, res: Response) => {
  const { currentUserId, targetUserId, currentUserName, targetUserName, itemType, itemId, itemTitle } = req.body;

  if (!currentUserId || !targetUserId) {
    return res.status(400).json({ error: 'Participants requis' });
  }

  // Check if exists
  let existing = db
    .get()
    .conversations.find(
      (c) =>
        c.participantIds.includes(currentUserId) &&
        c.participantIds.includes(targetUserId) &&
        (itemId ? c.itemId === itemId : true)
    );

  if (existing) {
    return res.json(existing);
  }

  const newConv: Conversation = {
    id: 'conv_' + Date.now(),
    participantIds: [currentUserId, targetUserId],
    participantNames: {
      [currentUserId]: currentUserName || 'Utilisateur',
      [targetUserId]: targetUserName || 'Interlocuteur'
    },
    itemType,
    itemId,
    itemTitle,
    lastMessage: 'Conversation débutée',
    lastMessageAt: new Date().toISOString(),
    unreadCount: {
      [currentUserId]: 0,
      [targetUserId]: 0
    }
  };

  db.get().conversations.unshift(newConv);
  db.save();
  res.status(201).json(newConv);
});

apiRouter.post('/messages', (req: Request, res: Response) => {
  const { conversationId, senderId, senderName, text } = req.body;

  if (!conversationId || !text || !senderId) {
    return res.status(400).json({ error: 'Message et conversation requis' });
  }

  const newMsg: Message = {
    id: 'msg_' + Date.now(),
    conversationId,
    senderId,
    senderName: senderName || 'Moi',
    text,
    createdAt: new Date().toISOString()
  };

  db.get().messages.push(newMsg);

  // Update conversation
  const conv = db.get().conversations.find((c) => c.id === conversationId);
  if (conv) {
    conv.lastMessage = text;
    conv.lastMessageAt = new Date().toISOString();

    // Trigger notification for the other participant
    const otherParticipantId = conv.participantIds.find((id) => id !== senderId);
    if (otherParticipantId) {
      const msgNotif: AppNotification = {
        id: 'notif_' + Date.now(),
        userId: otherParticipantId,
        type: 'message',
        title: `Nouveau message de ${senderName || 'un utilisateur'}`,
        message: text.length > 90 ? text.substring(0, 87) + '...' : text,
        isRead: false,
        relatedId: conversationId,
        relatedType: 'message',
        createdAt: new Date().toISOString()
      };
      db.get().notifications = db.get().notifications || [];
      db.get().notifications.unshift(msgNotif);
    }
  }

  db.save();
  res.status(201).json(newMsg);
});

// ==========================================
// 7. AVIS & NOTES
// ==========================================
apiRouter.get('/reviews', (req: Request, res: Response) => {
  const { targetType, targetId } = req.query;
  let reviews = [...db.get().reviews];
  if (targetType && targetId) {
    reviews = reviews.filter((r) => r.targetType === targetType && r.targetId === targetId);
  }
  res.json(reviews);
});

apiRouter.post('/reviews', (req: Request, res: Response) => {
  const { targetType, targetId, authorId, authorName, rating, comment } = req.body;

  if (!targetType || !targetId || !rating || !comment) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  const newReview: Review = {
    id: 'rev_' + Date.now(),
    targetType,
    targetId,
    authorId: authorId || 'usr_guest',
    authorName: authorName || 'Utilisateur LEPP',
    rating: Number(rating),
    comment,
    createdAt: new Date().toISOString()
  };

  db.get().reviews.unshift(newReview);

  // Recompute pro rating if pro
  if (targetType === 'pro') {
    const pro = db.get().proProfiles.find((p) => p.id === targetId);
    if (pro) {
      const allProReviews = db.get().reviews.filter((r) => r.targetType === 'pro' && r.targetId === targetId);
      const avg = allProReviews.reduce((sum, r) => sum + r.rating, 0) / allProReviews.length;
      pro.rating = Number(avg.toFixed(1));
      pro.reviewCount = allProReviews.length;
    }
  }

  db.save();
  res.status(201).json(newReview);
});

// ==========================================
// 8. FAVORIS
// ==========================================
apiRouter.get('/favorites', (req: Request, res: Response) => {
  const { userId } = req.query;
  let favs = [...db.get().favorites];
  if (userId) {
    favs = favs.filter((f) => f.userId === userId);
  }
  res.json(favs);
});

apiRouter.post('/favorites/toggle', (req: Request, res: Response) => {
  const { userId, itemType, itemId } = req.body;
  if (!userId || !itemType || !itemId) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }

  const index = db
    .get()
    .favorites.findIndex((f) => f.userId === userId && f.itemType === itemType && f.itemId === itemId);

  if (index !== -1) {
    // Remove
    db.get().favorites.splice(index, 1);
    db.save();
    return res.json({ favorited: false });
  } else {
    // Add
    const newFav: FavoriteItem = {
      id: 'fav_' + Date.now(),
      userId,
      itemType,
      itemId,
      createdAt: new Date().toISOString()
    };
    db.get().favorites.push(newFav);
    db.save();
    return res.json({ favorited: true });
  }
});

// ==========================================
// 9. SIGNALEMENTS & ADMINISTRATION
// ==========================================
apiRouter.post('/reports', (req: Request, res: Response) => {
  const { reporterId, targetType, targetId, targetTitle, reason, details } = req.body;
  if (!targetType || !targetId || !reason) {
    return res.status(400).json({ error: 'Champs de signalement obligatoires' });
  }

  const newReport: ReportItem = {
    id: 'rep_' + Date.now(),
    reporterId: reporterId || 'usr_guest',
    targetType,
    targetId,
    targetTitle: targetTitle || 'Contenu signalé',
    reason,
    details: details || '',
    status: 'ouvert',
    createdAt: new Date().toISOString()
  };

  db.get().reports.unshift(newReport);
  db.save();
  res.status(201).json(newReport);
});

apiRouter.get('/admin/overview', (_req: Request, res: Response) => {
  const d = db.get();
  const totalVolume = d.orders.reduce((sum, o) => sum + o.totalAmount, 0);

  res.json({
    totalUsers: d.users.length,
    totalPros: d.proProfiles.length,
    totalServiceRequests: d.serviceRequests.length,
    totalListings: d.realEstateListings.length,
    totalProducts: d.products.length,
    totalOrders: d.orders.length,
    totalReports: d.reports.length,
    totalVolumeFCFA: totalVolume
  });
});

apiRouter.get('/admin/reports', (_req: Request, res: Response) => {
  res.json(db.get().reports);
});

apiRouter.patch('/admin/reports/:id', (req: Request, res: Response) => {
  const report = db.get().reports.find((r) => r.id === req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Signalement introuvable' });
  }
  report.status = req.body.status || 'traite';
  db.save();
  res.json(report);
});

// ==========================================
// 10. NOTIFICATIONS
// ==========================================
apiRouter.get('/notifications', (req: Request, res: Response) => {
  const { userId } = req.query;
  let notifs = [...(db.get().notifications || [])];
  if (userId) {
    notifs = notifs.filter((n) => n.userId === userId);
  }
  // Sort latest first
  notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(notifs);
});

apiRouter.patch('/notifications/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const notif = (db.get().notifications || []).find((n) => n.id === id);
  if (!notif) {
    return res.status(404).json({ error: 'Notification introuvable' });
  }
  notif.isRead = true;
  db.save();
  res.json(notif);
});

apiRouter.post('/notifications/mark-all-read', (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId requis' });
  }
  (db.get().notifications || []).forEach((n) => {
    if (n.userId === userId) {
      n.isRead = true;
    }
  });
  db.save();
  res.json({ success: true });
});

apiRouter.post('/seed/reset', (_req: Request, res: Response) => {
  const data = db.resetToDefault();
  res.json({ message: 'Base de données réinitialisée avec succès', data });
});

// ==========================================
// 11. CYBER DÉFENSE & SÉCURITÉ
// ==========================================
apiRouter.get('/admin/security', (_req: Request, res: Response) => {
  res.json(cyberShield.getStatus());
});

apiRouter.post('/admin/security/mode', (req: Request, res: Response) => {
  const { mode } = req.body;
  if (mode === 'standard' || mode === 'renforce' || mode === 'verrouille') {
    cyberShield.setDefenseMode(mode);
  }
  res.json(cyberShield.getStatus());
});

apiRouter.post('/admin/security/clear', (_req: Request, res: Response) => {
  cyberShield.clearSecurityLogs();
  res.json(cyberShield.getStatus());
});

apiRouter.post('/admin/security/simulate', (req: Request, res: Response) => {
  const { threatType } = req.body;
  cyberShield.simulateAttack(threatType || 'xss');
  res.json(cyberShield.getStatus());
});

