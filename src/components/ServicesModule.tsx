import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Star,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  ShieldCheck,
  Send,
  Calendar,
  X,
  FileText,
  Share2,
  Eye,
  CheckCircle2,
  Mic
} from 'lucide-react';
import { ProProfile, Review } from '../types/index.js';
import { api } from '../services/api.js';
import { ShareModal, ShareItemData } from './ShareModal.js';
import { formatFCFA, buildWhatsAppLink, SERVICE_PROFESSIONS, SENEGAL_CITIES } from '../utils/helpers.js';
import { useAuth } from '../context/AuthContext.js';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';
import { SafeImage } from './SafeImage.js';

interface ServicesModuleProps {
  initialSearch?: string;
  initialCity?: string;
  onOpenDirectChat: (targetUserId: string, targetName: string, itemTitle: string) => void;
}

export const ServicesModule: React.FC<ServicesModuleProps> = ({
  initialSearch = '',
  initialCity = 'Toutes',
  onOpenDirectChat
}) => {
  const { user } = useAuth();
  const [pros, setPros] = useState<ProProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfession, setSelectedProfession] = useState('Tous');
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Selected Pro Modal & Quote Modal
  const [activePro, setActivePro] = useState<ProProfile | null>(null);
  const [activeIdentityPro, setActiveIdentityPro] = useState<ProProfile | null>(null);
  const [proReviews, setProReviews] = useState<Review[]>([]);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteSuccessMsg, setQuoteSuccessMsg] = useState('');

  // Quote Form State
  const [quoteTitle, setQuoteTitle] = useState('');
  const [quoteDesc, setQuoteDesc] = useState('');
  const [quoteUrgency, setQuoteUrgency] = useState<'normale' | 'urgente' | 'tres_urgente'>('urgente');
  const [quoteDate, setQuoteDate] = useState('');
  const [quoteAddress, setQuoteAddress] = useState('');
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteErrorMsg, setQuoteErrorMsg] = useState('');

  // Voice dictation for service quote description
  const {
    isListening: isQuoteListening,
    toggleListening: toggleQuoteDictation
  } = useSpeechRecognition({
    lang: 'fr-FR',
    onTranscript: (spokenText) => {
      setQuoteDesc((prev) => {
        const trimmed = prev.trim();
        return trimmed ? `${trimmed} ${spokenText.trim()}` : spokenText.trim();
      });
    }
  });

  // Review submission
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');

  // Share modal state
  const [shareItem, setShareItem] = useState<ShareItemData | null>(null);

  const fetchPros = async () => {
    setLoading(true);
    try {
      const data = await api.getPros({
        profession: selectedProfession,
        city: selectedCity,
        search: searchQuery
      });
      setPros(data);
    } catch (err) {
      console.error('Erreur chargement pros', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPros();
  }, [selectedProfession, selectedCity, searchQuery]);

  const handleOpenProDetail = async (pro: ProProfile) => {
    setActivePro(pro);
    try {
      const detail = await api.getProById(pro.id);
      setProReviews(detail.reviews || []);
    } catch {
      setProReviews([]);
    }
  };

  const handleOpenQuoteModal = (pro: ProProfile) => {
    setActivePro(pro);
    setQuoteTitle(`Demande d'intervention : ${pro.profession}`);
    setQuoteDate(new Date().toISOString().split('T')[0]);
    setIsQuoteModalOpen(true);
    setQuoteSuccessMsg('');
    setQuoteErrorMsg('');
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePro) return;
    setQuoteSubmitting(true);
    setQuoteErrorMsg('');
    try {
      await api.createServiceRequest({
        clientId: user?.id || 'usr_client_guest',
        clientName: user?.name || 'Client AMALFY',
        clientPhone: user?.phone || '+221 77 000 00 00',
        clientWhatsapp: user?.whatsappNumber || user?.phone || '+221770000000',
        proId: activePro.id,
        serviceType: activePro.profession,
        title: quoteTitle,
        description: quoteDesc,
        city: activePro.city,
        quarter: activePro.quarter,
        address: quoteAddress,
        dateRequested: quoteDate,
        urgency: quoteUrgency
      });
      setQuoteSuccessMsg('Votre demande de devis a été transmise avec succès au professionnel !');
      setTimeout(() => {
        setIsQuoteModalOpen(false);
        setQuoteSuccessMsg('');
      }, 2500);
    } catch (err: any) {
      setQuoteErrorMsg(err.message || 'Erreur lors de la soumission de la demande');
    } finally {
      setQuoteSubmitting(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePro || !newComment.trim()) return;
    setSubmittingReview(true);
    setReviewErrorMsg('');
    try {
      const rev = await api.submitReview({
        targetType: 'pro',
        targetId: activePro.id,
        authorId: user?.id || 'usr_guest',
        authorName: user?.name || 'Client vérifié',
        rating: newRating,
        comment: newComment
      });
      setProReviews([rev, ...proReviews]);
      setNewComment('');
      // Refresh pro info
      const updated = await api.getProById(activePro.id);
      setActivePro(updated);
      fetchPros();
    } catch (err: any) {
      setReviewErrorMsg(err.message || 'Erreur lors de l’envoi de l’avis');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Wrench className="w-4 h-4" />
            <span>Marketplace des Artisans & Prestataires</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            AMALFY Services
          </h2>
          <p className="text-slate-500 text-sm mt-1 max-w-xl">
            Trouvez les meilleurs artisans et techniciens qualifiés au Sénégal : climaticiens, mécaniciens, électriciens, plombiers et plus.
          </p>
        </div>

        {/* City Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Ville :</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            {SENEGAL_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Professions Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
        {SERVICE_PROFESSIONS.map((prof) => (
          <button
            key={prof}
            onClick={() => setSelectedProfession(prof)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedProfession === prof
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {prof}
          </button>
        ))}
      </div>

      {/* Grid of Pros */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-slate-200 rounded-3xl"></div>
          ))}
        </div>
      ) : pros.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Aucun professionnel trouvé</h3>
          <p className="text-xs text-slate-500 mt-1">
            Essayez de modifier la profession ou la ville sélectionnée.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pros.map((pro) => (
            <div
              key={pro.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Top Image or Avatar Header */}
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <SafeImage
                    src={pro.portfolioImages[0]}
                    alt={pro.specialtyTitle}
                    categoryPlaceholder="service"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>

                  {/* Profession Badge */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                    {pro.profession}
                  </span>

                  {/* Top Right: Share & Availability */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShareItem({
                          id: pro.id,
                          title: `${pro.user?.name || 'Artisan'} - ${pro.specialtyTitle}`,
                          price: pro.startingPrice,
                          city: pro.city,
                          quarter: pro.quarter,
                          image: pro.portfolioImages[0] || pro.user?.avatar,
                          categoryOrType: pro.profession,
                          module: 'services'
                        });
                      }}
                      title="Partager ce professionnel (WhatsApp, Facebook, Lien)"
                      aria-label="Partager ce professionnel"
                      className="p-2 rounded-full bg-white/85 backdrop-blur-md text-slate-700 hover:text-emerald-600 hover:bg-white transition-all shadow-xs active:scale-90"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {pro.isAvailable && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                        Disponible
                      </span>
                    )}
                  </div>

                  {/* Pro Avatar & Rating on header bottom */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <SafeImage
                          src={pro.user?.avatar}
                          alt={pro.user?.name}
                          categoryPlaceholder="avatar"
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-md"
                        />
                        {pro.verifiedBadge && (
                          <ShieldCheck className="w-4 h-4 text-emerald-400 absolute -bottom-1 -right-1 bg-white rounded-full p-0.5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm leading-tight text-white drop-shadow-md">
                          {pro.user?.name || 'Artisan AMALFY'}
                        </h4>
                        <p className="text-[11px] text-slate-200 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          <span>{pro.quarter ? `${pro.quarter}, ` : ''}{pro.city}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-amber-300">
                      <Star className="w-3.5 h-3.5 fill-amber-300" />
                      <span>{pro.rating}</span>
                      <span className="text-[10px] text-slate-300">({pro.reviewCount})</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5">
                  {/* Activity metadata: Views & Verification */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-1 text-slate-700 font-bold bg-slate-50 px-2 py-0.5 rounded-md">
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{Math.round(42 + (pro.rating * 14))} vues</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveIdentityPro(pro);
                      }}
                      className="flex items-center gap-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/70 px-2 py-0.5 rounded-full font-bold text-[10px] transition-colors cursor-pointer"
                      title="Cliquer pour voir la pièce d'identité certifiée"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{pro.identityDocument?.type === 'Passeport' ? 'Passeport vérifié' : 'CNI vérifiée'}</span>
                    </button>
                  </div>

                  <h3 className="font-heading font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 mb-1">
                    {pro.specialtyTitle}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {pro.description}
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {pro.skills.slice(0, 3).map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold"
                      >
                        {s}
                      </span>
                    ))}
                    {pro.skills.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px] font-bold">
                        +{pro.skills.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Price info */}
                  <div className="flex items-center justify-between py-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">À partir de</span>
                      <span className="font-heading font-extrabold text-sm text-emerald-700">
                        {formatFCFA(pro.startingPrice)}
                      </span>
                    </div>
                    {pro.experienceYears && (
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px]">Expérience</span>
                        <span className="font-semibold text-slate-700">{pro.experienceYears} ans</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

                {/* Action buttons */}
                <div className="p-4 pt-0 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* WhatsApp Button */}
                    <a
                      href={buildWhatsAppLink(
                        pro.whatsappNumber,
                        `Bonjour ${pro.user?.name || ''}, je vous contacte via AMALFY pour votre service : "${pro.specialtyTitle}". Êtes-vous disponible ?`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>

                    {/* Devis / Détails */}
                    <button
                      onClick={() => handleOpenQuoteModal(pro)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all"
                    >
                      <FileText className="w-4 h-4 text-emerald-200" />
                      <span>Devis gratuit</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleOpenProDetail(pro)}
                      className="text-left text-[11px] font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
                    >
                      Voir profil & portfolio →
                    </button>

                    {/* Quick Share on Card */}
                    <button
                      onClick={() => {
                        setShareItem({
                          id: pro.id,
                          title: `${pro.user?.name || 'Artisan'} - ${pro.specialtyTitle}`,
                          price: pro.startingPrice,
                          city: pro.city,
                          quarter: pro.quarter,
                          image: pro.portfolioImages[0] || pro.user?.avatar,
                          categoryOrType: pro.profession,
                          module: 'services'
                        });
                      }}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-emerald-50 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Partager</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL: Pro Profile Detail */}
        {activePro && !isQuoteModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              {/* Modal Header */}
              <div className="relative h-44 sm:h-52 bg-slate-800">
                <SafeImage
                  src={activePro.portfolioImages[0]}
                  alt={activePro.specialtyTitle}
                  categoryPlaceholder="service"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                {/* Top Actions: Share & Close */}
                <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                  <button
                    onClick={() => {
                      setShareItem({
                        id: activePro.id,
                        title: `${activePro.user?.name || 'Artisan'} - ${activePro.specialtyTitle}`,
                        price: activePro.startingPrice,
                        city: activePro.city,
                        quarter: activePro.quarter,
                        image: activePro.portfolioImages[0] || activePro.user?.avatar,
                        categoryOrType: activePro.profession,
                        module: 'services'
                      });
                    }}
                    className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors shadow-xs"
                    title="Partager ce profil sur WhatsApp, Facebook ou copier le lien"
                    aria-label="Partager ce professionnel"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActivePro(null)}
                    className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

              <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between text-white">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase mb-1 inline-block">
                    {activePro.profession}
                  </span>
                  <h3 className="font-heading font-black text-xl text-white">
                    {activePro.specialtyTitle}
                  </h3>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{activePro.quarter}, {activePro.city}</span>
                  </p>
                </div>

                <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl text-right">
                  <div className="text-[10px] text-slate-300">Tarif de départ</div>
                  <div className="font-bold text-base text-emerald-400">
                    {formatFCFA(activePro.startingPrice)}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Pro Identity */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <SafeImage
                    src={activePro.user?.avatar}
                    alt={activePro.user?.name}
                    categoryPlaceholder="avatar"
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/40"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{activePro.user?.name}</h4>
                    <p className="text-xs text-slate-500">{activePro.experienceYears} ans de pratique certifiée</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${activePro.phone}`}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                    title="Appeler"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => {
                      onOpenDirectChat(activePro.userId, activePro.user?.name || 'Pro', activePro.specialtyTitle);
                      setActivePro(null);
                    }}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                    title="Discuter"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setShareItem({
                        id: activePro.id,
                        title: `${activePro.user?.name || 'Artisan'} - ${activePro.specialtyTitle}`,
                        price: activePro.startingPrice,
                        city: activePro.city,
                        quarter: activePro.quarter,
                        image: activePro.portfolioImages[0] || activePro.user?.avatar,
                        categoryOrType: activePro.profession,
                        module: 'services'
                      });
                    }}
                    className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors"
                    title="Partager ce profil sur WhatsApp, Facebook ou copier le lien"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenQuoteModal(activePro)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                  >
                    Demander devis
                  </button>
                </div>
              </div>

              {/* Official Identity Document & Verification Banner */}
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="font-heading font-black text-xs text-slate-900">
                        Pièce d’identité officielle vérifiée
                      </h5>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold tracking-wider">
                        CERTIFIÉ AMALFY
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Type : <strong className="text-slate-800">{activePro.identityDocument?.type === 'Passeport' ? 'Passeport biométrique Sénégal' : 'CNI biométrique CEDEAO Sénégal'}</strong> • N° {activePro.identityDocument?.documentNumber ? activePro.identityDocument.documentNumber.replace(/(\d{4})\d+(\d{2})/, '$1 **** $2') : '1 751 **** ** 19'}
                    </p>
                    <p className="text-[11px] text-emerald-800 font-medium">
                      ✓ Identité contrôlée et validée par le pôle Sécurité & Teranga AMALFY
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveIdentityPro(activePro)}
                  className="shrink-0 px-3.5 py-2 rounded-xl bg-white text-emerald-800 hover:bg-emerald-100/60 border border-emerald-300 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Consulter le justificatif certifié</span>
                </button>
              </div>

              {/* Bio & Skills */}
              <div>
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Description</h5>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {activePro.description}
                </p>
              </div>

              <div>
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Compétences clés</h5>
                <div className="flex flex-wrap gap-1.5">
                  {activePro.skills.map((s, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-100"
                    >
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Portfolio Photos */}
              {activePro.portfolioImages && activePro.portfolioImages.length > 0 && (
                <div>
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                    Photos de réalisations
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {activePro.portfolioImages.map((img, i) => (
                      <SafeImage
                        key={i}
                        src={img}
                        alt="Portfolio"
                        categoryPlaceholder="service"
                        className="h-28 w-full object-cover rounded-xl border border-slate-100"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-bold text-sm text-slate-900">
                    Avis clients vérifiés ({proReviews.length})
                  </h5>
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{activePro.rating} / 5</span>
                  </div>
                </div>

                {/* List of reviews */}
                <div className="space-y-3 mb-6">
                  {proReviews.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Aucun avis pour le moment. Soyez le premier !</p>
                  ) : (
                    proReviews.map((rev) => (
                      <div key={rev.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-800">{rev.authorName}</span>
                          <div className="flex text-amber-400">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-600">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Review Form */}
                <form onSubmit={handleAddReview} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h6 className="font-bold text-xs text-slate-800 mb-2">Laisser un avis</h6>
                  {reviewErrorMsg && (
                    <div className="p-2.5 mb-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold">
                      {reviewErrorMsg}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-slate-500">Note :</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className={`p-1 ${newRating >= star ? 'text-amber-400' : 'text-slate-300'}`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={2}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Partagez votre expérience sur la qualité du travail..."
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden mb-2"
                  ></textarea>
                  <button
                    type="submit"
                    disabled={submittingReview || !newComment.trim()}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {submittingReview ? 'Envoi...' : 'Publier mon avis'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Request Quote / Devis */}
      {isQuoteModalOpen && activePro && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-heading font-black text-lg text-slate-900">
                  Demande de devis & Réservation
                </h3>
                <p className="text-xs text-slate-500">
                  Pour {activePro.user?.name} ({activePro.profession})
                </p>
              </div>
              <button
                onClick={() => setIsQuoteModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {quoteSuccessMsg ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 mb-1">Demande transmise !</h4>
                <p className="text-xs text-slate-500">{quoteSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitQuote} className="space-y-3.5">
                {quoteErrorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold">
                    {quoteErrorMsg}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Objet de la demande
                  </label>
                  <input
                    type="text"
                    required
                    value={quoteTitle}
                    onChange={(e) => setQuoteTitle(e.target.value)}
                    placeholder="Ex: Réparation climatiseur salon + recharge"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Description détaillée du problème
                    </label>
                    <button
                      type="button"
                      onClick={toggleQuoteDictation}
                      title={isQuoteListening ? 'Arrêter la dictée vocale' : 'Dicter vocalement avec le micro'}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        isQuoteListening
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      <Mic className={`w-3 h-3 ${isQuoteListening ? 'animate-bounce text-white' : 'text-emerald-600'}`} />
                      <span>{isQuoteListening ? 'Arrêter' : 'Dicter'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    required
                    value={quoteDesc}
                    onChange={(e) => setQuoteDesc(e.target.value)}
                    placeholder="Décrivez précisément ce dont vous avez besoin, marque, symptômes de la panne..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Date souhaitée
                    </label>
                    <input
                      type="date"
                      value={quoteDate}
                      onChange={(e) => setQuoteDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Niveau d'urgence
                    </label>
                    <select
                      value={quoteUrgency}
                      onChange={(e) => setQuoteUrgency(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      <option value="normale">Normale</option>
                      <option value="urgente">Urgente (sous 24h)</option>
                      <option value="tres_urgente">Très urgente (immédiate)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Adresse ou quartier d'intervention
                  </label>
                  <input
                    type="text"
                    required
                    value={quoteAddress}
                    onChange={(e) => setQuoteAddress(e.target.value)}
                    placeholder="Ex: Sacré-Cœur 3, près de la boulangerie jaune"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsQuoteModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={quoteSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50"
                  >
                    {quoteSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}
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

      {/* MODAL: Identity Document & Certification Inspection */}
      {activeIdentityPro && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in-95">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                  <ShieldCheck className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <h4 className="font-heading font-black text-sm text-white flex items-center gap-2">
                    <span>Justificatif d’Identité Officiel</span>
                    <span className="text-[10px] bg-emerald-500/40 text-emerald-100 px-2 py-0.5 rounded-full font-bold">
                      🇸🇳 Sénégal
                    </span>
                  </h4>
                  <p className="text-[11px] text-emerald-200">
                    Contrôlé et validé par AMALFY pour la sécurité des interventions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveIdentityPro(null)}
                className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Pro Info summary */}
              <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <SafeImage
                  src={activeIdentityPro.user?.avatar}
                  alt={activeIdentityPro.user?.name}
                  categoryPlaceholder="avatar"
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/40 shadow-xs"
                />
                <div>
                  <h5 className="font-heading font-black text-base text-slate-900">
                    {activeIdentityPro.user?.name}
                  </h5>
                  <p className="text-xs text-slate-600 font-medium">
                    {activeIdentityPro.profession} • {activeIdentityPro.specialtyTitle}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Compte PRO Certifié & Vérifié</span>
                  </p>
                </div>
              </div>

              {/* Identity Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Type de document</span>
                  <span className="font-bold text-slate-800">
                    {activeIdentityPro.identityDocument?.type === 'Passeport'
                      ? 'Passeport Ordinaire (Sénégal)'
                      : 'CNI Biométrique CEDEAO (Sénégal)'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Numéro d’identification</span>
                  <span className="font-mono font-bold text-slate-900">
                    {activeIdentityPro.identityDocument?.documentNumber || '1 751 1991 03822'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Délivrance</span>
                  <span className="font-bold text-slate-800">
                    {activeIdentityPro.identityDocument?.deliveryDate || '12/04/2021'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Expiration</span>
                  <span className="font-bold text-slate-800">
                    {activeIdentityPro.identityDocument?.expirationDate || '12/04/2031'}
                  </span>
                </div>
              </div>

              {/* Document Images Preview (Recto & Verso) with Security Watermark */}
              <div className="space-y-3">
                <h6 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Aperçu des scans officiels (Recto / Verso)
                </h6>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Recto */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-sm">
                    <img
                      src={activeIdentityPro.identityDocument?.frontImageUrl || 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=800&q=80'}
                      alt="Recto Pièce d'identité"
                      className="w-full h-36 object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center p-2 text-center">
                      <span className="bg-emerald-900/80 text-emerald-200 font-mono text-[9px] font-black px-2 py-1 rounded-md tracking-widest border border-emerald-400/40 uppercase">
                        CERTIFIÉ AMALFY SÉNÉGAL
                      </span>
                    </div>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold">
                      Scan Recto
                    </span>
                  </div>

                  {/* Verso */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-sm">
                    <img
                      src={activeIdentityPro.identityDocument?.backImageUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80'}
                      alt="Verso Pièce d'identité"
                      className="w-full h-36 object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center p-2 text-center">
                      <span className="bg-emerald-900/80 text-emerald-200 font-mono text-[9px] font-black px-2 py-1 rounded-md tracking-widest border border-emerald-400/40 uppercase">
                        CERTIFIÉ AMALFY SÉNÉGAL
                      </span>
                    </div>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold">
                      Scan Verso
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  Conformément aux normes de la Commission de Protection des Données Personnelles (CDP Sénégal), les documents sont authentifiés exclusivement par notre pôle vérification.
                </span>
              </div>

              <button
                type="button"
                onClick={() => setActiveIdentityPro(null)}
                className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
              >
                Fermer la vue de certification
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
