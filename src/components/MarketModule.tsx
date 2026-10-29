import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Heart,
  MessageCircle,
  Truck,
  ShieldCheck,
  Tag,
  Car,
  Smartphone,
  Sparkles,
  X,
  AlertTriangle,
  Check,
  Eye,
  Clock,
  Calendar,
  Share2,
  Camera,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Product } from '../types/index.js';
import { api } from '../services/api.js';
import { ShareModal, ShareItemData } from './ShareModal.js';
import {
  formatFCFA,
  buildWhatsAppLink,
  formatPublicationDate,
  MARKET_CATEGORIES,
  SENEGAL_CITIES
} from '../utils/helpers.js';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { SafeImage } from './SafeImage.js';

interface MarketModuleProps {
  initialSearch?: string;
  initialCity?: string;
  onOpenDirectChat: (targetUserId: string, targetName: string, itemTitle: string) => void;
}

export const MarketModule: React.FC<MarketModuleProps> = ({
  initialSearch = '',
  initialCity = 'Toutes',
  onOpenDirectChat
}) => {
  const { user } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  const [selectedCondition, setSelectedCondition] = useState('Tous');
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Detail Modal & Report Modal
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Annonce suspecte ou prix trompeur');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSent, setReportSent] = useState(false);

  // Favorites local cache
  const [favorites, setFavorites] = useState<string[]>([]);

  // Share modal state
  const [shareItem, setShareItem] = useState<ShareItemData | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts({
        category: selectedCategory,
        condition: selectedCondition,
        city: selectedCity,
        search: searchQuery
      });
      setProducts(data);
    } catch (err) {
      console.error('Erreur chargement market', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedCondition, selectedCity, searchQuery]);

  useEffect(() => {
    if (user) {
      api.getFavorites(user.id).then((favs) => {
        setFavorites(favs.filter((f) => f.itemType === 'produit').map((f) => f.itemId));
      });
    }
  }, [user]);

  const toggleFavorite = async (productId: string) => {
    if (!user) return;
    try {
      const res = await api.toggleFavorite(user.id, 'produit', productId);
      if (res.favorited) {
        setFavorites([...favorites, productId]);
      } else {
        setFavorites(favorites.filter((id) => id !== productId));
      }
    } catch (err) {
      console.error('Erreur favori', err);
    }
  };

  const handleAddToCart = (product: Product, buyNow = false) => {
    addToCart({
      productId: product.id,
      productTitle: product.title,
      productImage: product.images[0],
      price: product.price,
      selectedSize: selectedSize || product.clothingSizes?.[0],
      selectedColor: selectedColor || product.clothingColors?.[0],
      quantity: 1
    });

    if (buyNow) {
      setIsCartOpen(true);
    }
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    try {
      await api.submitReport({
        reporterId: user?.id || 'usr_guest',
        targetType: 'produit',
        targetId: activeProduct.id,
        targetTitle: activeProduct.title,
        reason: reportReason,
        details: reportDetails
      });
      setReportSent(true);
      setTimeout(() => {
        setIsReportOpen(false);
        setReportSent(false);
      }, 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const conditionLabels: Record<string, { label: string; color: string }> = {
    neuf: { label: 'Neuf scellé', color: 'bg-emerald-100 text-emerald-800' },
    tres_bon_etat: { label: 'Très bon état', color: 'bg-blue-100 text-blue-800' },
    bon_etat: { label: 'Bon état', color: 'bg-amber-100 text-amber-800' },
    reconditionne: { label: 'Reconditionné', color: 'bg-purple-100 text-purple-800' }
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider mb-1">
            <ShoppingBag className="w-4 h-4" />
            <span>Marketplace Neufs & Occasions Vérifiés</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            AMALFY Market
          </h2>
          <p className="text-slate-500 text-sm mt-1 max-w-xl">
            Achetez et vendez en toute sécurité : téléphones, ordinateurs, voitures dédouanées, pièces auto, bazins de luxe et mobilier.
          </p>
        </div>

        {/* City Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Ville :</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          >
            {SENEGAL_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Horizontal Scrolling Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
        {MARKET_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.value
                ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Condition & Search Sub-bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs mb-8 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">État du produit :</span>
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden"
          >
            <option value="Tous">Tous les états</option>
            <option value="neuf">Neuf</option>
            <option value="tres_bon_etat">Très bon état</option>
            <option value="bon_etat">Bon état</option>
            <option value="reconditionne">Reconditionné</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un produit (ex: iPhone 15, Toyota, Salon...)"
            className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-80 bg-slate-200 rounded-3xl"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Aucun produit dans cette catégorie</h3>
          <p className="text-xs text-slate-500 mt-1">
            Revenez à « Tout le Market » ou élargissez vos critères de recherche.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((item) => {
            const isFav = favorites.includes(item.id);
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    <SafeImage
                      src={item.images[0]}
                      alt={item.title}
                      categoryPlaceholder="market"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                      onClick={() => setActiveProduct(item)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none"></div>

                    {/* Condition badge */}
                    <span
                      className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        conditionLabels[item.condition]?.color || 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {conditionLabels[item.condition]?.label || item.condition}
                    </span>

                    {/* Action Buttons: Share & Favorite */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                      {/* Social Share Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShareItem({
                            id: item.id,
                            title: item.title,
                            price: item.price,
                            city: item.city,
                            quarter: item.quarter,
                            image: item.images[0],
                            categoryOrType: item.category,
                            module: 'market'
                          });
                        }}
                        title="Partager l'annonce (WhatsApp, Facebook, Lien)"
                        aria-label="Partager cette annonce"
                        className="p-2 rounded-full bg-white/85 backdrop-blur-md text-slate-700 hover:text-amber-600 hover:bg-white transition-all shadow-xs active:scale-90"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                        }}
                        title="Ajouter aux favoris"
                        aria-label="Ajouter aux favoris"
                        className="p-2 rounded-full bg-white/85 backdrop-blur-md text-slate-700 hover:text-red-500 hover:bg-white transition-all shadow-xs active:scale-90"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>
                    </div>

                    {/* Category icon or tag & photo count */}
                    <div className="absolute bottom-3 left-3 text-white flex items-center gap-1.5">
                      <span className="text-[10px] bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-md font-semibold">
                        {item.quarter ? `${item.quarter}, ` : ''}{item.city}
                      </span>
                      {item.images && item.images.length > 1 && (
                        <span className="text-[10px] bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md font-bold text-amber-300 flex items-center gap-1 shadow-xs">
                          <Camera className="w-3 h-3 text-amber-300" />
                          <span>{item.images.length} photos</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4">
                    {/* Activity metadata: Views & Publication date */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-1 text-slate-700 font-bold bg-slate-50 px-2 py-0.5 rounded-md">
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{item.viewsCount || 24} vues</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatPublicationDate(item.createdAt)}</span>
                      </div>
                    </div>

                    <h3
                      onClick={() => {
                        setActiveProduct(item);
                        setActiveImageIndex(0);
                      }}
                      className="font-heading font-bold text-sm text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 mb-1.5 cursor-pointer leading-tight"
                    >
                      {item.title}
                    </h3>

                    {/* Dynamic Specs for Cars / Tech / Clothes */}
                    {item.category === 'voitures' && item.carMake && (
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 mb-2 bg-amber-50/60 p-1.5 rounded-lg">
                        <Car className="w-3.5 h-3.5 text-amber-600" />
                        <span>{item.carYear} • {item.carMileage?.toLocaleString()} km • {item.transmission}</span>
                      </div>
                    )}

                    {(item.category === 'smartphones' || item.category === 'ordinateurs') && item.techStorage && (
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 mb-2 bg-blue-50/60 p-1.5 rounded-lg">
                        <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                        <span>{item.techStorage} {item.techRam ? `• ${item.techRam}` : ''}</span>
                      </div>
                    )}

                    {item.clothingSizes && item.clothingSizes.length > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-[10px] text-slate-400">Tailles:</span>
                        {item.clothingSizes.map((s, idx) => (
                          <span key={idx} className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 rounded-sm">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Price in FCFA */}
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="font-heading font-black text-lg text-slate-900">
                        {formatFCFA(item.price)}
                      </span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatFCFA(item.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 pt-0 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Add to cart */}
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Panier</span>
                    </button>

                    {/* WhatsApp */}
                    <a
                      href={buildWhatsAppLink(
                        item.sellerWhatsapp,
                        `Bonjour, je vous contacte via AMALFY Market pour l'annonce "${item.title}" à ${formatFCFA(item.price)}. Est-ce toujours disponible ?`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  {/* Buy Now Primary Button */}
                  <button
                    onClick={() => handleAddToCart(item, true)}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-extrabold text-xs shadow-sm transition-all text-center"
                  >
                    Commander maintenant
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Product Detail */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Image viewer with multi-image gallery support */}
            <div className="relative h-72 sm:h-80 bg-slate-900 group">
              <SafeImage
                src={activeProduct.images[activeImageIndex] || activeProduct.images[0]}
                alt={activeProduct.title}
                categoryPlaceholder="market"
                className="w-full h-full object-cover"
              />

              {/* Prev / Next buttons if multiple images */}
              {activeProduct.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : activeProduct.images.length - 1));
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-all backdrop-blur-xs shadow-md z-10"
                    title="Photo précédente"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev < activeProduct.images.length - 1 ? prev + 1 : 0));
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-all backdrop-blur-xs shadow-md z-10"
                    title="Photo suivante"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Modal Top Actions */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <button
                  onClick={() => {
                    setShareItem({
                      id: activeProduct.id,
                      title: activeProduct.title,
                      price: activeProduct.price,
                      city: activeProduct.city,
                      quarter: activeProduct.quarter,
                      image: activeProduct.images[activeImageIndex] || activeProduct.images[0],
                      categoryOrType: activeProduct.category,
                      module: 'market'
                    });
                  }}
                  className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors shadow-xs"
                  title="Partager cette annonce sur WhatsApp, Facebook ou copier le lien"
                  aria-label="Partager"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveProduct(null)}
                  className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Top Left: Condition & Photo counter */}
              <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-md ${conditionLabels[activeProduct.condition]?.color}`}>
                  {conditionLabels[activeProduct.condition]?.label || activeProduct.condition}
                </span>

                {activeProduct.images.length > 1 && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-md shadow-md flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-amber-300" />
                    <span>{activeImageIndex + 1} / {activeProduct.images.length}</span>
                  </span>
                )}
              </div>

              {/* Thumbnails row when multiple images */}
              {activeProduct.images.length > 1 && (
                <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2 overflow-x-auto p-1.5 bg-black/50 backdrop-blur-md rounded-2xl z-10">
                  {activeProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex(idx);
                      }}
                      className={`h-12 w-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        activeImageIndex === idx ? 'border-amber-400 scale-105 shadow-md' : 'border-transparent opacity-65 hover:opacity-100'
                      }`}
                    >
                      <SafeImage
                        src={img}
                        alt={`Aperçu ${idx + 1}`}
                        categoryPlaceholder="market"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-heading font-black text-xl text-slate-900">
                    {activeProduct.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Vendu par <span className="font-bold text-slate-700">{activeProduct.sellerName}</span> ({activeProduct.sellerType}) • {activeProduct.city}
                  </p>

                  {/* Activity badges: Views, Date & Verification */}
                  <div className="flex flex-wrap items-center gap-2 mt-2.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{activeProduct.viewsCount || 1} vues</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatPublicationDate(activeProduct.createdAt)}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Annonce active • Vendeur certifié</span>
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="font-heading font-black text-2xl text-slate-900">
                    {formatFCFA(activeProduct.price)}
                  </div>
                  {activeProduct.originalPrice && (
                    <div className="text-xs text-slate-400 line-through">
                      {formatFCFA(activeProduct.originalPrice)}
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic specs details if automobile */}
              {activeProduct.category === 'voitures' && (
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/60">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800 mb-2">
                    Caractéristiques du véhicule
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div><span className="text-slate-400">Marque :</span> <span className="font-bold">{activeProduct.carMake}</span></div>
                    <div><span className="text-slate-400">Modèle :</span> <span className="font-bold">{activeProduct.carModel}</span></div>
                    <div><span className="text-slate-400">Année :</span> <span className="font-bold">{activeProduct.carYear}</span></div>
                    <div><span className="text-slate-400">Kilométrage :</span> <span className="font-bold">{activeProduct.carMileage?.toLocaleString()} km</span></div>
                    <div><span className="text-slate-400">Carburant :</span> <span className="font-bold capitalize">{activeProduct.fuelType}</span></div>
                    <div><span className="text-slate-400">Boîte :</span> <span className="font-bold capitalize">{activeProduct.transmission}</span></div>
                  </div>
                </div>
              )}

              {/* Sizes / Colors Selection if fashion */}
              {activeProduct.clothingSizes && activeProduct.clothingSizes.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Choisir votre taille :
                  </label>
                  <div className="flex gap-2">
                    {activeProduct.clothingSizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          selectedSize === s
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Description</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {activeProduct.description}
                </p>
              </div>

              {/* Actions & Ordering */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={buildWhatsAppLink(
                    activeProduct.sellerWhatsapp,
                    `Bonjour, je souhaite acheter "${activeProduct.title}" (${formatFCFA(activeProduct.price)}) sur AMALFY Market.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Négocier sur WhatsApp</span>
                </a>

                {/* Social Share Button in Modal */}
                <button
                  onClick={() => {
                    setShareItem({
                      id: activeProduct.id,
                      title: activeProduct.title,
                      price: activeProduct.price,
                      city: activeProduct.city,
                      quarter: activeProduct.quarter,
                      image: activeProduct.images[0],
                      categoryOrType: activeProduct.category,
                      module: 'market'
                    });
                  }}
                  className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center gap-2 border border-amber-200 transition-colors"
                  title="Partager cette annonce sur WhatsApp, Facebook ou copier le lien"
                >
                  <Share2 className="w-4 h-4 text-amber-700" />
                  <span>Partager l'annonce</span>
                </button>

                <button
                  onClick={() => {
                    handleAddToCart(activeProduct);
                    setActiveProduct(null);
                  }}
                  className="w-full sm:flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter au panier</span>
                </button>

                <button
                  onClick={() => {
                    handleAddToCart(activeProduct, true);
                    setActiveProduct(null);
                  }}
                  className="w-full sm:flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 text-center"
                >
                  Acheter / Commander
                </button>
              </div>

              {/* Report button */}
              <div className="text-center pt-2">
                <button
                  onClick={() => setIsReportOpen(true)}
                  className="text-[11px] text-slate-400 hover:text-red-500 flex items-center gap-1 mx-auto transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Signaler cette annonce</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Report Ad */}
      {isReportOpen && activeProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h4 className="font-bold text-sm text-slate-900">Signaler cette annonce</h4>
              <button onClick={() => setIsReportOpen(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSent ? (
              <div className="p-4 text-center">
                <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">Signalement reçu</p>
                <p className="text-[11px] text-slate-500">Nos modérateurs vont examiner l'annonce.</p>
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Motif</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="Annonce suspecte ou prix trompeur">Annonce suspecte ou prix trompeur</option>
                    <option value="Contrefaçon ou article non conforme">Contrefaçon ou article non conforme</option>
                    <option value="Vendeur injoignable ou suspect">Vendeur injoignable ou suspect</option>
                    <option value="Contenu inapproprié">Contenu inapproprié</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Précisions</label>
                  <textarea
                    rows={2}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Détails complémentaires..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  ></textarea>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(false)}
                    className="px-3 py-2 text-xs text-slate-500"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"
                  >
                    Envoyer le signalement
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Social Share */}
      <ShareModal
        isOpen={!!shareItem}
        onClose={() => setShareItem(null)}
        item={shareItem}
      />
    </section>
  );
};
