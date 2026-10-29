import React, { useState, useEffect } from 'react';
import {
  Home,
  MapPin,
  Maximize2,
  Bed,
  Bath,
  Phone,
  MessageCircle,
  Calendar,
  CheckCircle,
  X,
  Heart,
  Share2,
  Tag,
  Eye,
  Clock,
  Sparkles,
  Mic,
  Camera,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { RealEstateListing, VisitRequest } from '../types/index.js';
import { api } from '../services/api.js';
import { ShareModal, ShareItemData } from './ShareModal.js';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';
import {
  formatFCFA,
  buildWhatsAppLink,
  formatPublicationDate,
  PROPERTY_TYPES,
  SENEGAL_CITIES
} from '../utils/helpers.js';
import { useAuth } from '../context/AuthContext.js';
import { SafeImage } from './SafeImage.js';

interface RealEstateModuleProps {
  initialSearch?: string;
  initialCity?: string;
  onOpenDirectChat: (targetUserId: string, targetName: string, itemTitle: string) => void;
}

export const RealEstateModule: React.FC<RealEstateModuleProps> = ({
  initialSearch = '',
  initialCity = 'Toutes',
  onOpenDirectChat
}) => {
  const { user } = useAuth();
  const [listings, setListings] = useState<RealEstateListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedTransaction, setSelectedTransaction] = useState<'Tous' | 'location' | 'vente'>('Tous');
  const [selectedType, setSelectedType] = useState('Tous');
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

  // Detail Modal & Visit Modal
  const [activeListing, setActiveListing] = useState<RealEstateListing | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [visitSuccessMsg, setVisitSuccessMsg] = useState('');
  const [visitErrorMsg, setVisitErrorMsg] = useState('');

  // Visit Form State
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('16:00');
  const [visitMessage, setVisitMessage] = useState('');
  const [visitSubmitting, setVisitSubmitting] = useState(false);

  // Voice Dictation for Visit Message
  const {
    isListening: isVisitListening,
    errorMessage: visitSpeechError,
    toggleListening: toggleVisitDictation
  } = useSpeechRecognition({
    lang: 'fr-FR',
    onTranscript: (spokenText) => {
      setVisitMessage((prev) => {
        const trimmed = prev.trim();
        return trimmed ? `${trimmed} ${spokenText.trim()}` : spokenText.trim();
      });
    }
  });

  // Favorites local cache
  const [favorites, setFavorites] = useState<string[]>([]);

  // Share Modal State
  const [shareItem, setShareItem] = useState<ShareItemData | null>(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const data = await api.getListings({
        propertyType: selectedType,
        transactionType: selectedTransaction,
        city: selectedCity,
        maxPrice: maxPrice,
        search: searchQuery
      });
      setListings(data);
    } catch (err) {
      console.error('Erreur chargement immo', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [selectedTransaction, selectedType, selectedCity, searchQuery, maxPrice]);

  useEffect(() => {
    if (user) {
      api.getFavorites(user.id).then((favs) => {
        setFavorites(favs.filter((f) => f.itemType === 'immobilier').map((f) => f.itemId));
      });
    }
  }, [user]);

  const toggleFavorite = async (listingId: string) => {
    if (!user) return;
    try {
      const res = await api.toggleFavorite(user.id, 'immobilier', listingId);
      if (res.favorited) {
        setFavorites([...favorites, listingId]);
      } else {
        setFavorites(favorites.filter((id) => id !== listingId));
      }
    } catch (err) {
      console.error('Erreur favori', err);
    }
  };

  const handleOpenVisitModal = (listing: RealEstateListing) => {
    setActiveListing(listing);
    setVisitDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    setIsVisitModalOpen(true);
    setVisitSuccessMsg('');
    setVisitErrorMsg('');
  };

  const handleSubmitVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeListing) return;
    setVisitSubmitting(true);
    setVisitErrorMsg('');
    try {
      await api.requestVisit({
        listingId: activeListing.id,
        listingTitle: activeListing.title,
        userId: user?.id || 'usr_guest',
        userName: user?.name || 'Visiteur AMALFY',
        userPhone: user?.phone || '+221 77 000 00 00',
        userWhatsapp: user?.whatsappNumber || user?.phone || '+221770000000',
        preferredDate: visitDate,
        preferredTime: visitTime,
        message: visitMessage
      });
      setVisitSuccessMsg('Votre demande de visite a été envoyée au bailleur ! Il vous recontactera très vite.');
      setTimeout(() => {
        setIsVisitModalOpen(false);
        setVisitSuccessMsg('');
      }, 2500);
    } catch (err: any) {
      setVisitErrorMsg(err.message || 'Erreur lors de la réservation de visite');
    } finally {
      setVisitSubmitting(false);
    }
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Home className="w-4 h-4" />
            <span>Portail Immobilier de Référence au Sénégal</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            AMALFY Immobilier
          </h2>
          <p className="text-slate-500 text-sm mt-1 max-w-xl">
            Découvrez les meilleures opportunités : villas de luxe à Saly, appartements standing à Dakar, studios meublés et terrains avec titre foncier.
          </p>
        </div>

        {/* Transaction Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => setSelectedTransaction('Tous')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedTransaction === 'Tous'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setSelectedTransaction('location')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedTransaction === 'location'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            À Louer
          </button>
          <button
            onClick={() => setSelectedTransaction('vente')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedTransaction === 'vente'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            À Vendre
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs mb-8 flex flex-wrap items-center gap-3">
        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Type de bien :</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Ville :</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            {SENEGAL_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Price quick filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Budget max :</span>
          <select
            value={maxPrice || ''}
            onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
            className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les prix</option>
            <option value="300000">Jusqu'à 300 000 FCFA</option>
            <option value="600000">Jusqu'à 600 000 FCFA</option>
            <option value="1500000">Jusqu'à 1 500 000 FCFA</option>
            <option value="50000000">Jusqu'à 50 M FCFA</option>
            <option value="200000000">Jusqu'à 200 M FCFA</option>
          </select>
        </div>

        {/* Search input */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par mot-clé (vue mer, piscine, Almadies...)"
            className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Real Estate Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 bg-slate-200 rounded-3xl"></div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
          <Home className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Aucun bien correspondant aux critères</h3>
          <p className="text-xs text-slate-500 mt-1">
            Élargissez vos filtres ou réinitialisez le budget pour voir plus d'annonces.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => {
            const isFav = favorites.includes(item.id);
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Photo Header */}
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <SafeImage
                      src={item.images[0]}
                      alt={item.title}
                      categoryPlaceholder="real-estate"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                      onClick={() => {
                        setActiveListing(item);
                        setActiveImageIndex(0);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none"></div>

                    {/* Transaction Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm ${
                          item.transactionType === 'location'
                            ? 'bg-blue-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {item.transactionType === 'location' ? 'À Louer' : 'À Vendre'}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold">
                        {item.propertyType}
                      </span>
                    </div>

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
                            categoryOrType: item.propertyType,
                            module: 'real-estate'
                          });
                        }}
                        title="Partager ce bien (WhatsApp, Facebook, Lien)"
                        aria-label="Partager cette annonce"
                        className="p-2 rounded-full bg-white/85 backdrop-blur-md text-slate-700 hover:text-blue-600 hover:bg-white transition-all shadow-xs active:scale-90"
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

                    {/* Price Tag Overlay on Bottom */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                      <div>
                        <div className="text-[11px] text-slate-200 font-medium">Prix</div>
                        <div className="font-heading font-black text-xl text-white drop-shadow-md">
                          {formatFCFA(item.price)}
                          {item.transactionType === 'location' && (
                            <span className="text-xs font-normal text-slate-300">
                              /{item.pricePeriod || 'mois'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-blue-200 bg-black/50 px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-xs">
                          <Camera className="w-3 h-3 text-blue-300" />
                          <span>{(item.images?.length || 1)} photo{(item.images?.length || 1) > 1 ? 's' : ''}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5">
                    {/* Activity metadata: Views & Publication date */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-1 text-slate-700 font-bold bg-slate-50 px-2 py-0.5 rounded-md">
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>{item.viewsCount || 52} vues</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatPublicationDate(item.createdAt)}</span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 mb-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{item.quarter ? `${item.quarter}, ` : ''}{item.city}</span>
                    </div>

                    <h3
                      onClick={() => {
                        setActiveListing(item);
                        setActiveImageIndex(0);
                      }}
                      className="font-heading font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-2 cursor-pointer"
                    >
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                      {item.description}
                    </p>

                    {/* Key Specifications (Surface, Rooms, Baths) */}
                    <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs mb-3">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Maximize2 className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-semibold">{item.surface} m²</span>
                      </div>
                      {item.rooms ? (
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Bed className="w-3.5 h-3.5 text-blue-500" />
                          <span className="font-semibold">{item.rooms} pces</span>
                        </div>
                      ) : (
                        <div className="text-slate-400 text-[10px]">Non spécifié</div>
                      )}
                      {item.bathrooms ? (
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Bath className="w-3.5 h-3.5 text-blue-500" />
                          <span className="font-semibold">{item.bathrooms} sdb</span>
                        </div>
                      ) : (
                        <div className="text-slate-400 text-[10px]">Titre Foncier</div>
                      )}
                    </div>

                    {/* Features checklist highlights */}
                    <div className="flex flex-wrap gap-1">
                      {item.features.slice(0, 3).map((f, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[10px] font-semibold"
                        >
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                  {/* WhatsApp */}
                  <a
                    href={buildWhatsAppLink(
                      item.advertiserWhatsapp,
                      `Bonjour, je suis intéressé par votre bien immobilier AMALFY : "${item.title}" à ${item.city} (${formatFCFA(item.price)}). Est-il toujours disponible ?`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Demande de Visite */}
                  <button
                    onClick={() => handleOpenVisitModal(item)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all"
                  >
                    <Calendar className="w-4 h-4 text-blue-200" />
                    <span>Visiter</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveListing(item);
                      setActiveImageIndex(0);
                    }}
                    className="col-span-2 text-center text-[11px] font-semibold text-slate-500 hover:text-blue-700 py-1 transition-colors"
                  >
                    Voir la galerie complète & détails →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Real Estate Detail & Gallery */}
      {activeListing && !isVisitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-3xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Gallery Viewer */}
            <div className="relative h-72 sm:h-96 bg-slate-900 group">
              <SafeImage
                src={activeListing.images[activeImageIndex] || activeListing.images[0]}
                alt={activeListing.title}
                categoryPlaceholder="real-estate"
                className="w-full h-full object-cover"
              />

              {/* Prev / Next navigation buttons */}
              {activeListing.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : activeListing.images.length - 1));
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
                      setActiveImageIndex((prev) => (prev < activeListing.images.length - 1 ? prev + 1 : 0));
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-all backdrop-blur-xs shadow-md z-10"
                    title="Photo suivante"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Top Left: Photo counter badge */}
              {activeListing.images.length > 1 && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-md shadow-md flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-blue-300" />
                    <span>{activeImageIndex + 1} / {activeListing.images.length}</span>
                  </span>
                </div>
              )}

              {/* Modal Top Actions: Share & Close */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <button
                  onClick={() => {
                    setShareItem({
                      id: activeListing.id,
                      title: activeListing.title,
                      price: activeListing.price,
                      city: activeListing.city,
                      quarter: activeListing.quarter,
                      image: activeListing.images[activeImageIndex] || activeListing.images[0],
                      categoryOrType: activeListing.propertyType,
                      module: 'real-estate'
                    });
                  }}
                  className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors shadow-xs"
                  title="Partager ce bien sur WhatsApp, Facebook ou copier le lien"
                  aria-label="Partager ce bien"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveListing(null)}
                  className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Thumbnails row */}
              {activeListing.images.length > 1 && (
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 overflow-x-auto p-1 bg-black/40 backdrop-blur-md rounded-2xl">
                  {activeListing.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`h-14 w-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        activeImageIndex === idx ? 'border-blue-400 scale-105' : 'border-transparent opacity-70'
                      }`}
                    >
                      <SafeImage
                        src={img}
                        alt="Aperçu"
                        categoryPlaceholder="real-estate"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase">
                      {activeListing.transactionType === 'location' ? 'Location' : 'Vente'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                      {activeListing.propertyType}
                    </span>
                  </div>
                  <h3 className="font-heading font-black text-xl text-slate-900">
                    {activeListing.title}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>{activeListing.address || activeListing.quarter}, {activeListing.city}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>{activeListing.viewsCount || 52} vues</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatPublicationDate(activeListing.createdAt)}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>Bien vérifié</span>
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 block">Prix demandé</span>
                  <div className="font-heading font-black text-2xl text-blue-600">
                    {formatFCFA(activeListing.price)}
                    {activeListing.transactionType === 'location' && (
                      <span className="text-sm font-normal text-slate-500">
                        /{activeListing.pricePeriod || 'mois'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Surface & Key attributes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block">Surface habitable</span>
                  <span className="font-bold text-slate-900 text-sm">{activeListing.surface} m²</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Pièces</span>
                  <span className="font-bold text-slate-900 text-sm">{activeListing.rooms || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Salles de bain</span>
                  <span className="font-bold text-slate-900 text-sm">{activeListing.bathrooms || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Statut</span>
                  <span className="font-bold text-emerald-600 text-sm capitalize">{activeListing.status}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                  Description du bien
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {activeListing.description}
                </p>
              </div>

              {/* Features checklist */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                  Équipements & Prestations
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {activeListing.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advertiser & Direct contact */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Annonceur</div>
                  <div className="font-bold text-sm text-slate-900">{activeListing.advertiserName}</div>
                  <div className="text-xs text-slate-500 capitalize">{activeListing.advertiserRole}</div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={`tel:${activeListing.advertiserPhone}`}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700"
                    title="Appeler"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a
                    href={buildWhatsAppLink(
                      activeListing.advertiserWhatsapp,
                      `Bonjour, je vous contacte depuis AMALFY pour votre annonce "${activeListing.title}".`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                  <button
                    onClick={() => {
                      setShareItem({
                        id: activeListing.id,
                        title: activeListing.title,
                        price: activeListing.price,
                        city: activeListing.city,
                        quarter: activeListing.quarter,
                        image: activeListing.images[0],
                        categoryOrType: activeListing.propertyType,
                        module: 'real-estate'
                      });
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-200 transition-colors"
                    title="Partager cette annonce"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Partager</span>
                  </button>
                  <button
                    onClick={() => handleOpenVisitModal(activeListing)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Réserver visite</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Request Visit */}
      {isVisitModalOpen && activeListing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-heading font-black text-lg text-slate-900">
                  Demande de Visite Immobilière
                </h3>
                <p className="text-xs text-slate-500">{activeListing.title}</p>
              </div>
              <button
                onClick={() => setIsVisitModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {visitSuccessMsg ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 mb-1">Visite demandée avec succès !</h4>
                <p className="text-xs text-slate-500">{visitSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitVisit} className="space-y-4">
                {visitErrorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold">
                    {visitErrorMsg}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Date souhaitée
                    </label>
                    <input
                      type="date"
                      required
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Heure préférée
                    </label>
                    <input
                      type="time"
                      required
                      value={visitTime}
                      onChange={(e) => setVisitTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Message au propriétaire ou à l'agence
                    </label>
                    {isVisitListening && (
                      <span className="flex items-center gap-1.5 text-[10px] text-rose-600 font-bold animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                        <span>Parlez maintenant...</span>
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <textarea
                      rows={3}
                      value={visitMessage}
                      onChange={(e) => setVisitMessage(e.target.value)}
                      placeholder="Précisez vos disponibilités, critères ou dictez à la voix..."
                      className="w-full px-3 py-2.5 pb-8 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    ></textarea>

                    {/* Bouton Dicter dans le textarea */}
                    <button
                      type="button"
                      onClick={toggleVisitDictation}
                      title={isVisitListening ? 'Arrêter la dictée vocale' : 'Dicter votre message par reconnaissance vocale (Web Speech)'}
                      className={`absolute bottom-2.5 right-2 px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer ${
                        isVisitListening
                          ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse shadow-md shadow-rose-600/30'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 hover:border-blue-300'
                      }`}
                    >
                      <Mic className={`w-3.5 h-3.5 ${isVisitListening ? 'animate-bounce text-white' : 'text-blue-600'}`} />
                      <span>{isVisitListening ? 'Arrêter' : 'Dicter'}</span>
                    </button>
                  </div>
                  {visitSpeechError && (
                    <p className="text-[10px] text-rose-600 mt-1 font-semibold">
                      ⚠️ {visitSpeechError}
                    </p>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsVisitModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={visitSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 disabled:opacity-50"
                  >
                    {visitSubmitting ? 'Envoi...' : 'Confirmer la demande de visite'}
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
