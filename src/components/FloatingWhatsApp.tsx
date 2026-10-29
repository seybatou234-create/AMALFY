import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircle,
  X,
  Send,
  Phone,
  ShieldCheck,
  Sparkles,
  Check,
  QrCode,
  Download,
  Copy,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  Mic,
  MicOff,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle2,
  Wrench,
  Building2,
  ShoppingBag,
  Layers,
  Share2
} from 'lucide-react';
import QRCode from 'qrcode';
import { useAuth } from '../context/AuthContext.js';
import { buildWhatsAppLink } from '../utils/helpers.js';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';

// Smooth slide-fade transition variants for Form <-> QR Code navigation
const viewSlideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 32 : -32,
    opacity: 0,
    filter: 'blur(3px)'
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)'
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -32 : 32,
    opacity: 0,
    filter: 'blur(3px)'
  })
};

// Category types for FAQ filtering
export type FaqCategory = 'all' | 'services' | 'immobilier' | 'market';

// Retractable FAQ Data structure with domain categorization
export interface FaqItem {
  id: string;
  category: 'services' | 'immobilier' | 'market';
  categoryLabel: string;
  question: string;
  shortBadge: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
  answer: string;
  highlights: string[];
}

export const FAQ_CATEGORIES: {
  id: FaqCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'all', label: 'Tous', icon: Layers },
  { id: 'services', label: 'Services', icon: Wrench },
  { id: 'immobilier', label: 'Immobilier', icon: Building2 },
  { id: 'market', label: 'Market', icon: ShoppingBag }
];

export const FAQ_ITEMS: FaqItem[] = [
  // --- Catégorie : SERVICES ---
  {
    id: 'frais-de-service',
    category: 'services',
    categoryLabel: 'Services',
    question: 'Quels sont les frais de service et commissions ?',
    shortBadge: '0 FCFA devis client',
    icon: CreditCard,
    accentColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    answer:
      'L’inscription, la mise en relation et les demandes de devis sont 100% gratuites pour les clients particuliers et entreprises.',
    highlights: [
      'Client : 0 FCFA pour déposer une demande et recevoir des propositions d’artisans',
      'Artisans & Pros : commission fixe modérée (5% à 8%) uniquement sur chantier validé et encaissé',
      'Paiements transparents sans frais cachés via Wave, Orange Money et virement bancaire'
    ]
  },
  {
    id: 'delais-urgences',
    category: 'services',
    categoryLabel: 'Services',
    question: 'Quels sont les délais d’intervention pour une urgence ?',
    shortBadge: '30 à 60 minutes',
    icon: Clock,
    accentColor: 'text-amber-700 bg-amber-50 border-amber-200',
    badgeBg: 'bg-amber-100 text-amber-800',
    answer:
      'Pour toute urgence technique (fuite d’eau majeure, panne électrique totale, clim en panne, serrure bloquée) :',
    highlights: [
      'Artisan agréé le plus proche mobilisé sous 30 à 60 minutes à Dakar et banlieue',
      'Service d’astreinte technique actif 7j/7 avec suivi en direct',
      'Estimation tarifaire claire annoncée préalablement pour éviter les mauvaises surprises'
    ]
  },
  {
    id: 'zones-couverture',
    category: 'services',
    categoryLabel: 'Services',
    question: 'Quelles sont les zones de couverture au Sénégal ?',
    shortBadge: 'Dakar & Régions',
    icon: MapPin,
    accentColor: 'text-blue-700 bg-blue-50 border-blue-200',
    badgeBg: 'bg-blue-100 text-blue-800',
    answer:
      'AMALFY intervient sur l’ensemble de la presqu’île du Cap-Vert et dans les grands pôles régionaux du Sénégal :',
    highlights: [
      'Dakar Métropole : Plateau, Almadies, Ngor, Ouakam, Mermoz, Sacré-Cœur, Point E, Fann',
      'Grand Dakar & Banlieue : Yoff, Parcelles Assainies, Grand Yoff, Pikine, Guédiawaye, Keur Massar',
      'Pôle Émergent & Régions : Rufisque, Diamniadio, Thiès, Mbour, Saly, Touba et Saint-Louis'
    ]
  },
  {
    id: 'securite-garanties',
    category: 'services',
    categoryLabel: 'Services',
    question: 'Comment sont garantis les travaux et les artisans ?',
    shortBadge: 'Artisans vérifiés CNI',
    icon: ShieldCheck,
    accentColor: 'text-purple-700 bg-purple-50 border-purple-200',
    badgeBg: 'bg-purple-100 text-purple-800',
    answer:
      'Chaque artisan partenaire fait l’objet d’un contrôle rigoureux avant son déploiement sur la plateforme AMALFY :',
    highlights: [
      'Audit d’identité : CNI, casier judiciaire, attestations d’assurance et NINEA vérifiés',
      'Paiement séquestré : l’artisan n’est payé qu’après votre validation de conformité',
      'Garantie réintervention gratuite sous 72h si le travail présente une anomalie'
    ]
  },

  // --- Catégorie : IMMOBILIER ---
  {
    id: 'immobilier-visites',
    category: 'immobilier',
    categoryLabel: 'Immobilier',
    question: 'Comment se passent les visites et réservations de logements ?',
    shortBadge: 'Visites certifiées & sécurisées',
    icon: Building2,
    accentColor: 'text-sky-700 bg-sky-50 border-sky-200',
    badgeBg: 'bg-sky-100 text-sky-800',
    answer:
      'Toutes les annonces immobilières (studios, appartements, villas, terrains) sont auditées sur le terrain par nos agents accrédités :',
    highlights: [
      'Visites physiques ou vidéos guidées avec un agent certifié AMALFY sans intermédiaires douteux',
      'Vérification des titres fonciers, baux d’habitation et conformité juridique des propriétaires',
      'Dépôt de garantie consigné sous séquestre sécurisé jusqu’à la remise officielle des clés'
    ]
  },
  {
    id: 'immobilier-frais-agence',
    category: 'immobilier',
    categoryLabel: 'Immobilier',
    question: 'Quels sont les frais d’agence et honoraires de location ?',
    shortBadge: '0 commission cachée',
    icon: ShieldCheck,
    accentColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    badgeBg: 'bg-indigo-100 text-indigo-800',
    answer:
      'AMALFY Immobilier garantit une totale transparence tarifaire conformément aux lois en vigueur au Sénégal :',
    highlights: [
      'Barème d’honoraires réglementé et plafonné à 1 mois de loyer standard négocié',
      'Rédaction de contrat de bail certifié et état des lieux contradictoire inclus sans surcoût',
      'Aucun faux frais de visite ou avance non déclarée exigée'
    ]
  },

  // --- Catégorie : MARKET ---
  {
    id: 'market-paiement-livraison',
    category: 'market',
    categoryLabel: 'Market',
    question: 'Comment fonctionnent l’achat et la livraison sur le Market BTP ?',
    shortBadge: 'Wave & OM à la réception',
    icon: ShoppingBag,
    accentColor: 'text-orange-700 bg-orange-50 border-orange-200',
    badgeBg: 'bg-orange-100 text-orange-800',
    answer:
      'Achetez votre outillage professionnel, quincaillerie, climatiseurs et matériaux BTP en toute sérénité :',
    highlights: [
      'Paiement sécurisé Wave, Orange Money ou espèces uniquement après vérification du colis',
      'Livraison express en 2h à 4h sur Dakar métropole et banlieue, 24h en région',
      'Articles neufs certifiés d’origine distributeur officiel avec facture et garantie constructeur'
    ]
  },
  {
    id: 'market-garantie-retour',
    category: 'market',
    categoryLabel: 'Market',
    question: 'Quelle est la politique de retour et d’échange de matériel ?',
    shortBadge: 'Garantie retour 7 jours',
    icon: RefreshCw,
    accentColor: 'text-teal-700 bg-teal-50 border-teal-200',
    badgeBg: 'bg-teal-100 text-teal-800',
    answer:
      'En cas d’article non conforme, défectueux ou erreur de commande sur le Market :',
    highlights: [
      'Délai de rétractation de 7 jours après réception pour échange rapide ou remboursement intégral',
      'Enlèvement du colis directement à votre adresse sans frais de reprise en cas de défaut',
      'Support client réactif disponible en direct sur WhatsApp pour toute assistance SAV'
    ]
  }
];

export const FloatingWhatsApp: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Retractable FAQ State
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<FaqCategory>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('frais-de-service');

  const handleSelectFaqCategory = (catId: FaqCategory) => {
    setSelectedFaqCategory(catId);
    const itemsInCat = catId === 'all' ? FAQ_ITEMS : FAQ_ITEMS.filter((i) => i.category === catId);
    if (itemsInCat.length > 0) {
      if (!expandedFaqId || !itemsInCat.some((i) => i.id === expandedFaqId)) {
        setExpandedFaqId(itemsInCat[0].id);
      }
    }
  };

  const filteredFaqItems =
    selectedFaqCategory === 'all'
      ? FAQ_ITEMS
      : FAQ_ITEMS.filter((item) => item.category === selectedFaqCategory);

  // Contact number for AMALFY central support & dispatch from platform settings or fallback
  const [supportWhatsapp, setSupportWhatsapp] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('amalfy_platform_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.supportWhatsapp) return parsed.supportWhatsapp;
      }
    } catch {
      // Fallback
    }
    return '+221 77 862 88 38';
  });

  useEffect(() => {
    const handleSettingsUpdate = (e: any) => {
      if (e.detail?.supportWhatsapp) {
        setSupportWhatsapp(e.detail.supportWhatsapp);
      }
    };
    window.addEventListener('amalfy_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('amalfy_settings_updated', handleSettingsUpdate);
  }, []);

  const AMALFY_SUPPORT_WHATSAPP = supportWhatsapp;

  const userPhone = user?.whatsappNumber || user?.phone || '+221 77 862 88 38';
  const userName = user?.name || 'Client AMALFY';

  const [selectedTopic, setSelectedTopic] = useState('Urgence artisan');
  const [customText, setCustomText] = useState(
    `Bonjour AMALFY, je vous contacte depuis mon compte (${userPhone}) pour une mise en relation directe.`
  );

  // Web Speech API Voice Dictation
  const {
    isListening,
    errorMessage: speechError,
    toggleListening: toggleVoiceDictation
  } = useSpeechRecognition({
    lang: 'fr-FR',
    onTranscript: (spokenText) => {
      setCustomText((prev) => {
        const trimmed = prev.trim();
        return trimmed ? `${trimmed} ${spokenText.trim()}` : spokenText.trim();
      });
    }
  });

  // QR Code states
  const [showQrView, setShowQrView] = useState(false);
  const [viewDirection, setViewDirection] = useState<number>(1); // 1 = forward (to QR), -1 = backward (to Form)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Real-time human support agent availability (Dakar GMT 08:00 - 22:30)
  const computeIsAgentOnline = () => {
    try {
      const now = new Date();
      const utcHours = now.getUTCHours();
      const utcMinutes = now.getUTCMinutes();
      const currentMinuteOfDay = utcHours * 60 + utcMinutes;
      // Active hours: 08:00 (480 min) to 22:30 (1350 min) GMT
      return currentMinuteOfDay >= 480 && currentMinuteOfDay <= 1350;
    } catch {
      return true;
    }
  };

  const [isAgentOnline, setIsAgentOnline] = useState<boolean>(computeIsAgentOnline);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAgentOnline(computeIsAgentOnline());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Share / Invite friends pre-formatted link states
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  const handleShareInvite = async () => {
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://amalfy.sn';
    const inviteUrl = `${origin}?ref=invite_amalfy`;
    const inviteMessage = `🇸🇳 Découvre AMALFY : « Le bon service, le bon bien, le bon produit. »\nTrouve un artisan certifié à Dakar, loue ou achète un bien immobilier, ou commande du matériel BTP en toute sécurité !\n👉 Rejoins la plateforme ici : ${inviteUrl}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(inviteMessage);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = inviteMessage;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedInvite(true);
      setShowShareTooltip(true);
      setTimeout(() => setCopiedInvite(false), 2500);
      setTimeout(() => setShowShareTooltip(false), 4500);
    } catch {
      // Graceful fallback
    }
  };

  const topics = [
    {
      id: 'Urgence artisan',
      label: '⚡ Urgence Artisan / Dépannage',
      msg: `Bonjour AMALFY, j’ai une urgence technique (clim, plomberie, électricité) à Dakar. Mon numéro : ${userPhone}. Pouvez-vous me dépêcher un artisan disponible ?`
    },
    {
      id: 'Immobilier',
      label: '🏠 Information Bien Immobilier',
      msg: `Bonjour, je souhaite des précisions sur un bien immobilier repéré sur AMALFY Immobilier. Contactez-moi au ${userPhone}.`
    },
    {
      id: 'Market',
      label: '🛍️ Commande & Livraison Market',
      msg: `Bonjour, je souhaite des détails concernant une commande ou un article en vente sur AMALFY Market. Client : ${userName} (${userPhone}).`
    },
    {
      id: 'Assistance',
      label: '💬 Assistance Générale',
      msg: `Bonjour l’équipe AMALFY, je souhaiterais être orienté vers un prestataire qualifié. Mon numéro : ${userPhone}.`
    }
  ];

  const handleSelectTopic = (topic: typeof topics[0]) => {
    setSelectedTopic(topic.id);
    setCustomText(topic.msg);
    // If QR code is already visible, regenerate it smoothly with new topic text
    if (showQrView) {
      setTimeout(() => {
        generateQrCodeWithText(topic.msg, false);
      }, 50);
    }
  };

  const generateQrCodeWithText = async (text: string, switchView: boolean = true) => {
    setIsGeneratingQr(true);
    try {
      const link = buildWhatsAppLink(AMALFY_SUPPORT_WHATSAPP, text);
      const url = await QRCode.toDataURL(link, {
        width: 320,
        margin: 2,
        color: {
          dark: '#075E54', // WhatsApp brand green
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(url);
      if (switchView) {
        setViewDirection(1);
        setShowQrView(true);
      }
    } catch (err) {
      console.error('Erreur génération QR Code:', err);
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const handleGenerateQr = () => {
    setViewDirection(1);
    generateQrCodeWithText(customText, true);
  };

  const handleSwitchToForm = () => {
    setViewDirection(-1);
    setShowQrView(false);
  };

  const handleSwitchToQr = () => {
    setViewDirection(1);
    if (!qrCodeDataUrl) {
      generateQrCodeWithText(customText, true);
    } else {
      setShowQrView(true);
    }
  };

  const handleCopyWhatsAppLink = async () => {
    try {
      const link = buildWhatsAppLink(AMALFY_SUPPORT_WHATSAPP, customText);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = link;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error('Erreur copie lien:', err);
    }
  };

  const handleDownloadQr = () => {
    if (!qrCodeDataUrl) return;
    const a = document.createElement('a');
    a.href = qrCodeDataUrl;
    a.download = `qr-whatsapp-amalfy-${selectedTopic.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleAskFaqOnWhatsApp = (faq: FaqItem) => {
    const questionText = `Bonjour AMALFY, j'ai une question concernant : "${faq.question}". Pouvez-vous me donner des précisions pour mon besoin ?`;
    setCustomText(questionText);
    setSelectedTopic('Assistance');
  };

  const handleOpenWhatsApp = () => {
    const link = buildWhatsAppLink(AMALFY_SUPPORT_WHATSAPP, customText);
    window.open(link, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setShowQrView(false);
      setViewDirection(1);
    }, 200);
  };

  return (
    <div className="fixed bottom-[82px] right-3 md:bottom-6 md:right-6 z-40 flex flex-col items-end">
      {/* Interactive Popover Box with AnimatePresence */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-3 w-[calc(100vw-24px)] sm:w-96 max-w-[400px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] sm:max-h-[85vh]"
          >
            {/* Header */}
            <div className="bg-[#128C7E] text-white p-4 pb-3 relative">
              <button
                onClick={handleClose}
                className="absolute top-3.5 right-3.5 p-1 text-white/80 hover:text-white hover:bg-black/10 rounded-full transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold">
                    <WhatsAppIcon className="w-6 h-6 fill-white" />
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#128C7E] ${
                      isAgentOnline ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  ></span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-heading font-black text-sm text-white tracking-tight flex items-center gap-1.5">
                      <span>WhatsApp Direct</span>
                      <span className="text-[10px] font-mono bg-white/20 text-white px-1.5 py-0.5 rounded-md font-bold">
                        77 862 88 38
                      </span>
                    </h4>

                    {/* Badge d'état 'En ligne' ou 'Absent' */}
                    <button
                      type="button"
                      onClick={() => setIsAgentOnline((prev) => !prev)}
                      title={
                        isAgentOnline
                          ? 'Agent humain en direct • Cliquez pour tester le mode Absent'
                          : 'Agent actuellement absent (Support 08h-22h30 GMT) • Cliquez pour tester le mode En ligne'
                      }
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-all cursor-pointer shadow-xs ${
                        isAgentOnline
                          ? 'bg-emerald-500/35 border border-emerald-300/50 text-emerald-100 hover:bg-emerald-500/50'
                          : 'bg-amber-500/35 border border-amber-300/50 text-amber-100 hover:bg-amber-500/50'
                      }`}
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        {isAgentOnline && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                        )}
                        <span
                          className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                            isAgentOnline ? 'bg-emerald-300' : 'bg-amber-400'
                          }`}
                        ></span>
                      </span>
                      <span>{isAgentOnline ? 'En ligne' : 'Absent'}</span>
                    </button>

                    {/* Bouton bascule rapide FAQ Express */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowQrView(false);
                        setIsFaqOpen((prev) => !prev);
                      }}
                      title="Consulter les questions fréquentes (Frais, Couverture, Délais...)"
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-all cursor-pointer border ${
                        isFaqOpen
                          ? 'bg-white text-emerald-900 border-white shadow-2xs font-black'
                          : 'bg-white/15 hover:bg-white/25 text-white border-white/20'
                      }`}
                    >
                      <HelpCircle className="w-3 h-3" />
                      <span>FAQ {isFaqOpen ? '▲' : '▼'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-emerald-100/90 flex items-center justify-between gap-1 mt-0.5">
                    <span className="truncate">
                      {isAgentOnline
                        ? '🟢 Agent humain dispo en direct'
                        : '🕒 Support actif 08h00 - 22h30 GMT'}
                    </span>
                    <span className="text-[9px] bg-white/15 px-1.5 py-0.2 rounded-full font-medium shrink-0">
                      🇸🇳 Dakar
                    </span>
                  </p>
                </div>
              </div>

              {/* View Switcher Tabs with Animated Sliding Pill */}
              <div className="flex bg-black/15 p-1 rounded-2xl text-xs font-bold text-white/85 relative">
                <button
                  type="button"
                  onClick={handleSwitchToForm}
                  className={`relative flex-1 py-1.5 px-3 rounded-xl text-center transition-colors flex items-center justify-center gap-1.5 text-xs z-10 ${
                    !showQrView ? 'text-white' : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  {!showQrView && (
                    <motion.div
                      layoutId="activeWhatsAppTab"
                      className="absolute inset-0 bg-white/25 rounded-xl shadow-xs"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <MessageCircle className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10">Formulaire</span>
                </button>

                <button
                  type="button"
                  onClick={handleSwitchToQr}
                  className={`relative flex-1 py-1.5 px-3 rounded-xl text-center transition-colors flex items-center justify-center gap-1.5 text-xs z-10 ${
                    showQrView ? 'text-white' : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  {showQrView && (
                    <motion.div
                      layoutId="activeWhatsAppTab"
                      className="absolute inset-0 bg-white/25 rounded-xl shadow-xs"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <QrCode className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10">QR Code Mobile</span>
                </button>
              </div>
            </div>

            {/* Body: Animated Transition between Form View and QR Code Scanner View */}
            <div className="relative overflow-y-auto max-h-[calc(85vh-130px)] sm:max-h-[520px] bg-slate-50 overscroll-contain">
              <AnimatePresence mode="wait" initial={false} custom={viewDirection}>
                {showQrView ? (
                  /* QR CODE VIEW */
                  <motion.div
                    key="qr-view"
                    custom={viewDirection}
                    variants={viewSlideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.24, ease: [0.25, 1, 0.5, 1] }}
                    className="p-4 space-y-3.5 bg-slate-50"
                  >
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleSwitchToForm}
                        className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-all active:scale-95"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Modifier le message</span>
                      </button>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                        Scan Mobile
                      </span>
                    </div>

                    {/* QR Code Presentation Box with spring pop-in */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-xs flex flex-col items-center">
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25, delay: 0.05 }}
                        className="relative p-2 bg-emerald-50/50 rounded-2xl border border-emerald-100 mb-2"
                      >
                        {qrCodeDataUrl ? (
                          <img
                            src={qrCodeDataUrl}
                            alt="QR Code WhatsApp AMALFY"
                            className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-xl shadow-xs"
                          />
                        ) : (
                          <div className="w-48 h-48 flex items-center justify-center">
                            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                          </div>
                        )}
                        {/* WhatsApp center badge */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-10 h-10 rounded-full bg-white shadow-md p-1.5 flex items-center justify-center border border-emerald-100">
                            <WhatsAppIcon className="w-6 h-6 fill-[#25D366]" />
                          </div>
                        </div>
                      </motion.div>

                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-900">
                          Scannez pour ouvrir WhatsApp
                        </p>
                        <p className="text-[11px] text-slate-500 max-w-[260px] leading-relaxed">
                          Pointez l'appareil photo de votre smartphone pour démarrer immédiatement la conversation.
                        </p>
                      </div>

                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Contact direct : {AMALFY_SUPPORT_WHATSAPP}</span>
                      </div>
                    </div>

                    {/* QR Code Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleCopyWhatsAppLink}
                        className="py-2.5 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 active:scale-95 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                      >
                        {copiedLink ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Lien copié !</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Copier le lien</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadQr}
                        className="py-2.5 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 active:scale-95 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span>Télécharger</span>
                      </button>
                    </div>

                    {/* Direct Open in New Tab option */}
                    <button
                      type="button"
                      onClick={handleOpenWhatsApp}
                      className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-98 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/25 transition-all"
                    >
                      <WhatsAppIcon className="w-4 h-4 fill-white" />
                      <span>Ouvrir sur ce navigateur</span>
                    </button>
                  </motion.div>
                ) : (
                  /* STANDARD FORM VIEW */
                  <motion.div
                    key="form-view"
                    custom={viewDirection}
                    variants={viewSlideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.24, ease: [0.25, 1, 0.5, 1] }}
                    className="p-4 space-y-3.5 bg-slate-50"
                  >
                    {/* Destination WhatsApp Direct Chip */}
                    <div className="p-2.5 bg-emerald-100/70 rounded-2xl border border-emerald-200 text-xs flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-2 text-emerald-950 font-semibold">
                        <WhatsAppIcon className="w-4 h-4 fill-[#25D366] shrink-0" />
                        <span className="text-[11px]">Numéro WhatsApp direct :</span>
                      </div>
                      <span className="font-mono font-black text-emerald-900 bg-white px-2 py-0.5 rounded-lg border border-emerald-300 text-xs shadow-2xs">
                        77 862 88 38
                      </span>
                    </div>
                    {/* User Phone Confirmation Chip */}
                    <div className="p-2.5 bg-white rounded-2xl border border-slate-200 text-xs flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <span className="text-[11px] font-semibold">Votre numéro de contact :</span>
                      </div>
                      <span className="font-bold text-slate-900 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-lg border border-emerald-200">
                        {userPhone}
                      </span>
                    </div>

                    {/* Section rétractable : Questions Fréquentes (FAQ) */}
                    <div className="rounded-2xl border border-emerald-200/90 bg-white shadow-2xs overflow-hidden transition-all">
                      <button
                        type="button"
                        onClick={() => setIsFaqOpen((prev) => !prev)}
                        className="w-full p-2.5 sm:p-3 flex items-center justify-between text-left hover:bg-emerald-50/50 transition-colors cursor-pointer group"
                        aria-expanded={isFaqOpen}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                            <HelpCircle className="w-4 h-4 text-emerald-700" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-black text-slate-800 group-hover:text-emerald-700 transition-colors">
                                Questions fréquentes
                              </span>
                              <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.2 rounded-full shadow-2xs">
                                FAQ Directe
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 truncate">
                              Frais de service (0 FCFA), zones de couverture, délais...
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-700 text-xs font-bold shrink-0 ml-1.5">
                          <span className="text-[10px] font-semibold text-slate-500 hidden sm:inline">
                            {isFaqOpen ? 'Masquer' : 'Consulter'}
                          </span>
                          <div className="w-6 h-6 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                            {isFaqOpen ? (
                              <ChevronUp className="w-3.5 h-3.5 text-emerald-700" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-emerald-700" />
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Contenu rétractable avec animation fluide */}
                      <AnimatePresence initial={false}>
                        {isFaqOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden border-t border-emerald-100 bg-slate-50/70"
                          >
                            <div className="p-2.5 sm:p-3 space-y-2.5">
                              <div className="flex items-center justify-between px-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-emerald-600" />
                                  Réponses instantanées sans attente :
                                </span>
                                <span className="text-[9px] text-emerald-800 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                                  {filteredFaqItems.length} question{filteredFaqItems.length > 1 ? 's' : ''}
                                </span>
                              </div>

                              {/* Barre de filtrage par catégorie : Tous, Services, Immobilier, Market */}
                              <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl overflow-x-auto no-scrollbar border border-slate-200/80">
                                {FAQ_CATEGORIES.map((cat) => {
                                  const isActive = selectedFaqCategory === cat.id;
                                  const IconComponent = cat.icon;
                                  const count =
                                    cat.id === 'all'
                                      ? FAQ_ITEMS.length
                                      : FAQ_ITEMS.filter((item) => item.category === cat.id).length;
                                  return (
                                    <button
                                      key={cat.id}
                                      type="button"
                                      onClick={() => handleSelectFaqCategory(cat.id)}
                                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                                        isActive
                                          ? 'bg-white text-emerald-900 shadow-xs border border-emerald-200 font-black'
                                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                      }`}
                                    >
                                      <IconComponent
                                        className={`w-3 h-3 ${isActive ? 'text-emerald-600' : 'text-slate-500'}`}
                                      />
                                      <span>{cat.label}</span>
                                      <span
                                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                                          isActive
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-slate-300/80 text-slate-600'
                                        }`}
                                      >
                                        {count}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Liste des questions filtrées */}
                              <div className="space-y-1.5">
                                {filteredFaqItems.map((item) => {
                                  const isExpanded = expandedFaqId === item.id;
                                  const IconComponent = item.icon;
                                  return (
                                    <div
                                      key={item.id}
                                      id={item.id}
                                      className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs transition-all hover:border-emerald-300"
                                    >
                                      <button
                                        type="button"
                                        onClick={() => setExpandedFaqId(isExpanded ? null : item.id)}
                                        className="w-full p-2.5 text-left flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors cursor-pointer"
                                        aria-expanded={isExpanded}
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <div className={`p-1.5 rounded-lg border shrink-0 ${item.accentColor}`}>
                                            <IconComponent className="w-3.5 h-3.5" />
                                          </div>
                                          <div className="min-w-0">
                                            <span className="text-xs font-bold text-slate-800 block truncate">
                                              {item.question}
                                            </span>
                                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                              <span className={`inline-block text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${item.badgeBg}`}>
                                                {item.shortBadge}
                                              </span>
                                              <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200/60">
                                                {item.categoryLabel}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="shrink-0 text-slate-400">
                                          {isExpanded ? (
                                            <ChevronUp className="w-3.5 h-3.5 text-emerald-600" />
                                          ) : (
                                            <ChevronDown className="w-3.5 h-3.5" />
                                          )}
                                        </div>
                                      </button>

                                      <AnimatePresence initial={false}>
                                        {isExpanded && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.18, ease: 'easeOut' }}
                                            className="overflow-hidden border-t border-slate-100 bg-emerald-50/20 px-3 py-2.5 text-[11px] text-slate-700 space-y-2"
                                          >
                                            <p className="leading-relaxed font-medium text-slate-800">
                                              {item.answer}
                                            </p>
                                            <ul className="space-y-1.5 pl-0.5">
                                              {item.highlights.map((h, i) => (
                                                <li key={i} className="flex items-start gap-1.5 text-slate-600">
                                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                                  <span className="leading-snug">{h}</span>
                                                </li>
                                              ))}
                                            </ul>
                                            <div className="pt-2 flex items-center justify-between border-t border-emerald-100">
                                              <span className="text-[10px] text-slate-400 font-medium">Une question sur ce point ?</span>
                                              <button
                                                type="button"
                                                onClick={() => handleAskFaqOnWhatsApp(item)}
                                                className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 active:scale-95 cursor-pointer shadow-2xs"
                                              >
                                                <Send className="w-2.5 h-2.5" />
                                                <span>Poser sur WhatsApp</span>
                                              </button>
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Quick Topic Chips */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Objet de votre demande :
                      </label>
                      <div className="space-y-1.5">
                        {topics.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => handleSelectTopic(t)}
                            className={`w-full text-left p-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                              selectedTopic === t.id
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span>{t.label}</span>
                            {selectedTopic === t.id && <Check className="w-3.5 h-3.5 text-white" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message Preview with Voice Dictation Button */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Message à envoyer :
                        </label>
                        {isListening && (
                          <span className="flex items-center gap-1.5 text-[10px] text-rose-600 font-bold animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                            <span>Écoute active... Parlez</span>
                          </span>
                        )}
                      </div>

                      <div className="relative">
                        <textarea
                          rows={3}
                          value={customText}
                          onChange={(e) => setCustomText(e.target.value)}
                          placeholder="Écrivez ou dictez votre message à la voix..."
                          className="w-full p-2.5 pb-9 bg-white rounded-2xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition-all"
                        ></textarea>

                        {/* Bouton 'Dicter' positionné dans le textarea */}
                        <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={toggleVoiceDictation}
                            title={isListening ? 'Arrêter la dictée vocale' : 'Dicter votre message par reconnaissance vocale (Web Speech)'}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                              isListening
                                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse shadow-md shadow-rose-600/30'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 hover:border-emerald-300'
                            }`}
                          >
                            <Mic className={`w-3.5 h-3.5 ${isListening ? 'animate-bounce text-white' : 'text-emerald-600'}`} />
                            <span>{isListening ? 'Arrêter' : 'Dicter'}</span>
                          </button>
                        </div>
                      </div>

                      {speechError && (
                        <p className="text-[10px] text-rose-600 mt-1 font-semibold flex items-center gap-1">
                          <span>⚠️ {speechError}</span>
                        </p>
                      )}
                    </div>

                    {/* Action Buttons: Direct WhatsApp & QR Code Generation */}
                    <div className="space-y-2 pt-1">
                      {/* Primary Button: Direct WhatsApp Web / App */}
                      <button
                        type="button"
                        onClick={handleOpenWhatsApp}
                        className="w-full py-3 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-98 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/30 transition-all"
                      >
                        <WhatsAppIcon className="w-4 h-4 fill-white" />
                        <span>Ouvrir WhatsApp maintenant</span>
                      </button>

                      {/* Secondary Button: Générer QR Code for Mobile Scanning */}
                      <button
                        type="button"
                        onClick={handleGenerateQr}
                        disabled={isGeneratingQr}
                        className="w-full py-2.5 rounded-2xl bg-white border-2 border-emerald-600 hover:bg-emerald-50 active:scale-98 text-emerald-800 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                      >
                        {isGeneratingQr ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                        ) : (
                          <QrCode className="w-4 h-4 text-emerald-600" />
                        )}
                        <span>{isGeneratingQr ? 'Génération du code...' : 'Générer QR Code (Scanner sur mobile)'}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer note */}
            <div className="p-2.5 bg-slate-100 text-center border-t border-slate-200/60">
              <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Réponse moyenne en moins de 5 minutes • 7j/7</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Triggers: Share & WhatsApp */}
      <div className="flex items-center gap-2 relative">
        {/* Share & Invite Friends Trigger */}
        <div className="relative">
          {/* Floating Share Feedback & Actions Tooltip */}
          <AnimatePresence>
            {showShareTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                className="absolute bottom-full right-0 mb-3 w-72 p-3.5 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 z-50 text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-heading font-black text-xs text-white">Lien d'invitation copié !</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowShareTooltip(false)}
                    className="text-slate-400 hover:text-white p-0.5 rounded-md"
                    aria-label="Fermer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                  Le message d'invitation officiel pour AMALFY est prêt. Collez-le à vos proches ou envoyez-le directement sur WhatsApp.
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center gap-2">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `🇸🇳 Découvre AMALFY : « Le bon service, le bon bien, le bon produit. »\nTrouve un artisan certifié à Dakar, loue ou achète un bien immobilier, ou commande du matériel BTP en toute sécurité !\n👉 Rejoins la plateforme ici : ${
                        typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://amalfy.sn'
                      }?ref=invite`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-[11px] transition-all shadow-md shadow-[#25D366]/20"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
                    <span>Envoyer sur WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleShareInvite}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Recopier</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={handleShareInvite}
            className="group relative flex items-center gap-2 px-3.5 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-950/35 border border-slate-700/60 active:scale-90 transition-all cursor-pointer"
            title="Inviter des amis sur AMALFY (copier le lien d'invitation)"
            aria-label="Inviter des amis sur AMALFY"
          >
            {copiedInvite ? (
              <>
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-xs font-black text-emerald-300 pr-1">Copié !</span>
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline text-xs font-black pr-1">Partager</span>
              </>
            )}
          </button>
        </div>

        {/* Main Floating Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-3.5 py-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl shadow-[#25D366]/35 active:scale-90 transition-all"
          title="Contacter sur WhatsApp"
          aria-label="Contacter sur WhatsApp"
        >
          {/* Pulsating Ring Indicator */}
          <span
            className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
              isAgentOnline ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
            }`}
          ></span>
          <span
            className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
              isAgentOnline ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          ></span>

          {/* WhatsApp Icon */}
          <WhatsAppIcon className="w-6 h-6 fill-white shrink-0 group-hover:scale-110 transition-transform" />

          {/* Label on desktop / expandable */}
          <div className="hidden sm:flex flex-col text-left pr-1 leading-tight">
            <span className="font-black text-xs">WhatsApp Direct</span>
            <span className="text-[10px] text-white/90 font-mono font-bold">77 862 88 38</span>
          </div>
        </button>
      </div>
    </div>
  );
};

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
