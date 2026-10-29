import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wrench,
  Home,
  ShoppingBag,
  Star,
  MapPin,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  Plus,
  CheckCircle2,
  Camera,
  Layers,
  Sparkles
} from 'lucide-react';
import { ProProfile, RealEstateListing, Product } from '../types/index.js';
import { api } from '../services/api.js';
import { formatFCFA, buildWhatsAppLink } from '../utils/helpers.js';
import { useCart } from '../context/CartContext.js';
import { SafeImage } from './SafeImage.js';

interface DynamicShowcaseTabsProps {
  selectedCity: string;
  onNavigateTab: (tab: 'services' | 'real-estate' | 'market') => void;
  onOpenDirectChat: (userId: string, userName: string, itemTitle: string) => void;
}

export const DynamicShowcaseTabs: React.FC<DynamicShowcaseTabsProps> = ({
  selectedCity,
  onNavigateTab,
  onOpenDirectChat
}) => {
  const [activeTab, setActiveTab] = useState<'services' | 'real-estate' | 'market'>('services');
  const [pros, setPros] = useState<ProProfile[]>([]);
  const [listings, setListings] = useState<RealEstateListing[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubFilter, setActiveSubFilter] = useState('Tous');

  const { addToCart } = useCart();
  const [addedItemToast, setAddedItemToast] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const cityParam = selectedCity === 'Toutes' ? undefined : selectedCity;
        const [p, l, pr] = await Promise.all([
          api.getPros({ city: cityParam }),
          api.getListings({ city: cityParam }),
          api.getProducts({ city: cityParam })
        ]);
        if (isMounted) {
          setPros(p || []);
          setListings(l || []);
          setProducts(pr || []);
        }
      } catch (err) {
        console.error('Erreur chargement showcase', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [selectedCity]);

  // Reset subfilter when switching tab
  const handleSwitchTab = (tab: 'services' | 'real-estate' | 'market') => {
    setActiveTab(tab);
    setActiveSubFilter('Tous');
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      productId: product.id,
      productTitle: product.title,
      productImage: product.images?.[0] || '',
      price: product.price,
      quantity: 1
    });
    setAddedItemToast(`« ${product.title} » ajouté à votre panier`);
    setTimeout(() => setAddedItemToast(''), 3000);
  };

  // Filtered views
  const filteredPros =
    activeSubFilter === 'Tous'
      ? pros
      : pros.filter((p) => p.profession.toLowerCase().includes(activeSubFilter.toLowerCase()));

  const filteredListings =
    activeSubFilter === 'Tous'
      ? listings
      : listings.filter((l) =>
          activeSubFilter === 'Location'
            ? l.transactionType === 'location'
            : activeSubFilter === 'Vente'
            ? l.transactionType === 'vente'
            : l.propertyType.toLowerCase().includes(activeSubFilter.toLowerCase())
        );

  const filteredProducts =
    activeSubFilter === 'Tous'
      ? products
      : products.filter((pr) => pr.category.toLowerCase().includes(activeSubFilter.toLowerCase()));

  return (
    <section className="py-12 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toast when added to cart */}
        <AnimatePresence>
          {addedItemToast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-20 right-4 z-50 py-3 px-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2.5 border border-emerald-400 backdrop-blur-md"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>{addedItemToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-emerald-700 text-xs font-black uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Sélection Interactive en Direct</span>
              {selectedCity !== 'Toutes' && (
                <span className="text-slate-600 font-semibold lowercase">
                  · à {selectedCity}
                </span>
              )}
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Trouvez ce dont vous avez besoin en un instant
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Passez d'un univers à l'autre en un clic. Contactez directement les artisans sur WhatsApp ou commandez avec livraison.
            </p>
          </div>

          {/* Master Segment Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 w-full sm:w-auto overflow-x-auto no-scrollbar shrink-0 shadow-inner">
            <button
              type="button"
              onClick={() => handleSwitchTab('services')}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${
                activeTab === 'services'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-4 h-4 shrink-0" />
              <span>Services ({pros.length})</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab('real-estate')}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${
                activeTab === 'real-estate'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-4 h-4 shrink-0" />
              <span>Immobilier ({listings.length})</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab('market')}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${
                activeTab === 'market'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>Market ({products.length})</span>
            </button>
          </div>
        </div>

        {/* Dynamic Interactive Filter Sub-bar */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Filtres :
          </span>

          {activeTab === 'services' &&
            ['Tous', 'Climaticien', 'Électricien', 'Plombier', 'Mécanicien', 'Peintre'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveSubFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeSubFilter === filter
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}

          {activeTab === 'real-estate' &&
            ['Tous', 'Location', 'Vente', 'Appartement', 'Villa', 'Studio'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveSubFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeSubFilter === filter
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}

          {activeTab === 'market' &&
            ['Tous', 'Smartphones', 'Véhicules', 'Mode', 'Informatique'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveSubFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeSubFilter === filter
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
        </div>

        {/* Dynamic Content Grid */}
        <div className="min-h-[380px]">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-3xl border border-slate-200 p-5 bg-slate-50 animate-pulse space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-200"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded-md w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-20 bg-slate-200 rounded-2xl"></div>
                  <div className="h-9 bg-slate-200 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* TAB 1: SERVICES PROS */}
              {activeTab === 'services' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPros.slice(0, 6).map((pro) => (
                    <div
                      key={pro.id}
                      className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 flex flex-col justify-between group"
                    >
                      <div className="space-y-3.5">
                        {/* Top: Avatar, name, rating */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <SafeImage
                                src={pro.user?.avatar}
                                alt={pro.user?.name}
                                categoryPlaceholder="avatar"
                                className="w-13 h-13 rounded-2xl object-cover ring-2 ring-emerald-500/20"
                              />
                              <span
                                className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"
                                title="Disponible pour intervention"
                              ></span>
                            </div>

                            <div>
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-heading font-black text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                                  {pro.user?.name || 'Artisan AMALFY'}
                                </h3>
                                <span title="Identité vérifiée">
                                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                </span>
                              </div>
                              <p className="text-xs text-emerald-800 font-bold">{pro.profession}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {pro.quarter ? `${pro.quarter} · ` : ''}{pro.city}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl text-amber-800 text-xs font-black border border-amber-200/70 shrink-0">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            <span>{pro.rating.toFixed(1)}</span>
                          </div>
                        </div>

                        {/* Specialty & Description */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{pro.specialtyTitle}</h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                            {pro.description}
                          </p>
                        </div>

                        {/* Price & availability info */}
                        <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                          <span className="text-emerald-700 font-bold flex items-center gap-1.5 text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Disponible aujourd'hui</span>
                          </span>
                          <span className="text-slate-500 text-[11px]">
                            Dès <strong className="text-slate-900 font-bold">{formatFCFA(pro.startingPrice)}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Tactile Actions */}
                      <div className="pt-4 border-t border-slate-100 mt-4 flex items-center gap-2">
                        <a
                          href={buildWhatsAppLink(
                            pro.user?.whatsappNumber || pro.user?.phone || '+221778628838',
                            `Bonjour ${pro.user?.name}, je vous contacte via AMALFY pour une demande de ${pro.profession}. Êtes-vous disponible ?`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-emerald-200/80 active:scale-95"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => onNavigateTab('services')}
                          className="py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors active:scale-95 cursor-pointer"
                        >
                          <span>Demander devis</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 2: REAL ESTATE */}
              {activeTab === 'real-estate' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onNavigateTab('real-estate')}
                      className="bg-white rounded-3xl border border-slate-200/90 hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
                    >
                      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                        <SafeImage
                          src={item.images?.[0]}
                          alt={item.title}
                          categoryPlaceholder="real-estate"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none"></div>

                        {/* Subtle Transaction & Photos badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider text-white shadow-sm ${
                              item.transactionType === 'location' ? 'bg-blue-600' : 'bg-emerald-600'
                            }`}
                          >
                            {item.transactionType === 'location' ? 'Location' : 'Vente'}
                          </span>
                          <span className="px-2 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold">
                            {item.propertyType}
                          </span>
                        </div>

                        {item.images && item.images.length > 1 && (
                          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            <span>{item.images.length}</span>
                          </div>
                        )}

                        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md text-white font-mono font-black text-xs shadow-md border border-white/10">
                          {formatFCFA(item.price)}
                          {item.transactionType === 'location' && (
                            <span className="text-[10px] font-normal text-slate-300"> /mois</span>
                          )}
                        </div>
                      </div>

                      <div className="p-4.5 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-[11px] text-slate-400 font-semibold mb-1">
                            {item.quarter ? `${item.quarter} · ` : ''}{item.city}
                          </p>
                          <h3 className="font-heading font-black text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-slate-600 font-medium text-[11px]">
                            {item.rooms && <span>{item.rooms} ch.</span>}
                            {item.surface && <span>· {item.surface} m²</span>}
                          </div>

                          <span className="font-bold text-blue-600 group-hover:text-blue-800 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            <span>Détails & Visite</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: MARKET */}
              {activeTab === 'market' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.slice(0, 6).map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-white rounded-3xl border border-slate-200/90 hover:border-amber-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                    >
                      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                        <SafeImage
                          src={prod.images?.[0]}
                          alt={prod.title}
                          categoryPlaceholder="market"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none"></div>

                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                            {prod.category}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-medium">
                            {prod.condition === 'neuf' ? 'Neuf scellé' : 'Très bon état'}
                          </span>
                        </div>

                        {prod.images && prod.images.length > 1 && (
                          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            <span>{prod.images.length}</span>
                          </div>
                        )}

                        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md text-white font-mono font-black text-xs shadow-md border border-white/10">
                          {formatFCFA(prod.price)}
                        </div>
                      </div>

                      <div className="p-4.5 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-[11px] text-slate-400 font-semibold mb-1">
                            {prod.city} · Vendeur vérifié
                          </p>
                          <h3 className="font-heading font-black text-sm text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                            {prod.title}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                            {prod.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-emerald-700 font-bold">
                            Wave & OM acceptés
                          </span>

                          <button
                            type="button"
                            onClick={(e) => handleAddToCart(prod, e)}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-colors shadow-xs active:scale-95 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Ajouter</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* View all button */}
        <div className="text-center mt-10">
          <button
            type="button"
            onClick={() => onNavigateTab(activeTab)}
            className="px-7 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs inline-flex items-center gap-2.5 transition-all shadow-md active:scale-95 cursor-pointer hover:shadow-xl"
          >
            <span>
              Explorer tout le catalogue{' '}
              {activeTab === 'services'
                ? 'AMALFY Services'
                : activeTab === 'real-estate'
                ? 'AMALFY Immobilier'
                : 'AMALFY Market'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
