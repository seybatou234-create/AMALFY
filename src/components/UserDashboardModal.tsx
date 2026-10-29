import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  ShoppingBag,
  Wrench,
  Home,
  CheckCircle,
  Clock,
  Phone,
  FileText,
  Calendar,
  Save,
  ShieldCheck,
  Camera,
  CheckCircle2,
  Upload,
  MessageCircle,
  Ban
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { formatFCFA } from '../utils/helpers.js';
import { ServiceRequest, Order, VisitRequest, IdentityDocumentType } from '../types/index.js';
import { ImageFileInput } from './ImageFileInput.js';
import { SafeImage } from './SafeImage.js';

interface UserDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'profil' | 'demandes' | 'commandes' | 'visites' | 'identite_pro';
}

export const UserDashboardModal: React.FC<UserDashboardModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'demandes'
}) => {
  const { user, activeRole, setActiveRole, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profil' | 'demandes' | 'commandes' | 'visites' | 'identite_pro'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(false);

  // Profile edit fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [whatsapp, setWhatsapp] = useState(user?.whatsappNumber || '');
  const [city, setCity] = useState(user?.city || 'Dakar');
  const [quarter, setQuarter] = useState(user?.quarter || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Pro Identity Document Fields
  const [idType, setIdType] = useState<IdentityDocumentType>(user?.identityDocument?.type || 'CNI');
  const [idNumber, setIdNumber] = useState(user?.identityDocument?.documentNumber || '1 751 1993 05619');
  const [idFrontUrl, setIdFrontUrl] = useState(user?.identityDocument?.frontImageUrl || 'https://images.unsplash.com/photo-1633265486064-086b219458ec?auto=format&fit=crop&w=800&q=80');
  const [idBackUrl, setIdBackUrl] = useState(user?.identityDocument?.backImageUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80');
  const [idDeliveryDate, setIdDeliveryDate] = useState(user?.identityDocument?.deliveryDate || '2020-07-20');
  const [idExpirationDate, setIdExpirationDate] = useState(user?.identityDocument?.expirationDate || '2030-07-20');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;
    setName(user.name);
    setPhone(user.phone);
    setWhatsapp(user.whatsappNumber);
    setCity(user.city);
    setQuarter(user.quarter || '');
    setBio(user.bio || '');
    setAvatar(user.avatar || '');
    if (user.identityDocument) {
      setIdType(user.identityDocument.type || 'CNI');
      setIdNumber(user.identityDocument.documentNumber || '');
      setIdFrontUrl(user.identityDocument.frontImageUrl || '');
      setIdBackUrl(user.identityDocument.backImageUrl || '');
      setIdDeliveryDate(user.identityDocument.deliveryDate || '2020-07-20');
      setIdExpirationDate(user.identityDocument.expirationDate || '2030-07-20');
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [reqs, ords, vis] = await Promise.all([
          api.getServiceRequests(user.id, activeRole),
          api.getOrders(user.id),
          api.getVisits(user.id).catch(() => [] as VisitRequest[])
        ]);
        setRequests(reqs || []);
        setOrders(ords || []);
        setVisits(vis || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [isOpen, user, activeRole]);

  const handleCancelVisit = async (visitId: string) => {
    try {
      await api.updateVisitStatus(visitId, 'annulee');
      setVisits((prev) => prev.map((v) => (v.id === visitId ? { ...v, status: 'annulee' } : v)));
    } catch (err) {
      console.error('Erreur annulation visite', err);
    }
  };

  if (!isOpen || !user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        name,
        phone,
        whatsappNumber: whatsapp,
        city,
        quarter,
        bio,
        avatar,
        identityDocument: {
          type: idType,
          documentNumber: idNumber || '1 751 1993 05619',
          frontImageUrl: idFrontUrl || 'https://images.unsplash.com/photo-1633265486064-086b219458ec?auto=format&fit=crop&w=800&q=80',
          backImageUrl: idBackUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
          verificationStatus: 'verifie',
          verifiedAt: user.identityDocument?.verifiedAt || new Date().toISOString(),
          deliveryDate: idDeliveryDate,
          expirationDate: idExpirationDate
        }
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-3xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SafeImage
              src={user.avatar}
              alt={user.name}
              categoryPlaceholder="avatar"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover ring-2 ring-emerald-500/30"
            />
            <div>
              <h3 className="font-heading font-black text-base sm:text-lg text-slate-900">{user.name}</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">{user.phone} • Mode : <span className="font-bold text-emerald-600 capitalize">{activeRole}</span></p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dashboard Tabs */}
        <div className="px-4 sm:px-6 pt-3 sm:pt-4 border-b border-slate-100 flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('demandes')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'demandes'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Devis & Services ({requests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('commandes')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'commandes'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Mes Commandes ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('visites')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'visites'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Mes Visites Immo ({visits.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profil')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'profil'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Mon Profil & Coordonnées</span>
          </button>

          {user.roles.includes('pro') && (
            <button
              onClick={() => setActiveTab('identite_pro')}
              className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'identite_pro'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Photo & Pièce d'Identité PRO</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* 1. DEVIS & SERVICES REQUESTS */}
          {activeTab === 'demandes' && (
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Aucune demande de service en cours.
                </div>
              ) : (
                requests.map((r) => (
                  <div key={r.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {r.serviceType}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{r.title}</h4>
                      </div>
                      <span className="font-bold text-slate-700 capitalize px-2 py-1 bg-white rounded-lg border border-slate-200">
                        {r.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-slate-600">{r.description}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-slate-500 text-[11px]">
                      <span>Intervention prévue le : {r.dateRequested}</span>
                      {r.quoteAmount && (
                        <span className="font-black text-emerald-700 text-sm">
                          Devis : {formatFCFA(r.quoteAmount)}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 2. ORDERS TRACKING */}
          {activeTab === 'commandes' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Aucune commande passée pour le moment.
                </div>
              ) : (
                orders.map((o) => (
                  <div key={o.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-slate-400">Commande #{o.id}</span>
                        <h4 className="font-bold text-slate-900 mt-0.5">
                          {o.items.length} article(s) • Total : {formatFCFA(o.totalAmount)}
                        </h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold uppercase text-[10px]">
                        {o.orderStatus}
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100 bg-white p-2 rounded-xl border border-slate-100">
                      {o.items.map((it: any, idx: number) => (
                        <div key={idx} className="py-1.5 flex justify-between items-center text-[11px]">
                          <span>{it.quantity}x {it.productTitle}</span>
                          <span className="font-bold">{formatFCFA(it.price * it.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Paiement : <strong className="uppercase">{o.paymentMethod}</strong> ({o.paymentStatus})</span>
                      <span>Livraison : {o.deliveryQuarter}, {o.deliveryCity}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 3. VISITES IMMOBILIERES */}
          {activeTab === 'visites' && (
            <div className="space-y-4">
              {visits.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                  <Home className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
                  <p className="font-medium text-slate-600">Aucune demande de visite immobilière en cours.</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    Consultez les annonces immobilières (appartements, villas, terrains) et cliquez sur « Réserver une visite » pour planifier un créneau.
                  </p>
                </div>
              ) : (
                visits.map((v) => (
                  <div key={v.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center gap-1">
                            <Home className="w-3 h-3" />
                            Visite Immo
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">#{v.id.slice(-6)}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">{v.listingTitle}</h4>
                      </div>

                      <div>
                        {v.status === 'confirmee' && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Confirmée
                          </span>
                        )}
                        {v.status === 'en_attente' && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            En attente
                          </span>
                        )}
                        {v.status === 'annulee' && (
                          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] flex items-center gap-1">
                            <Ban className="w-3 h-3 text-rose-600" />
                            Annulée
                          </span>
                        )}
                        {v.status === 'terminee' && (
                          <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px]">
                            Terminée
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-white rounded-xl border border-slate-100 text-[11px]">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>Date prévue : <strong className="text-slate-800">{v.preferredDate ? new Date(v.preferredDate).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : 'À convenir'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Heure souhaitée : <strong className="text-slate-800">{v.preferredTime || '15:00'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Téléphone de contact : <strong className="text-slate-800">{v.userPhone}</strong></span>
                      </div>
                      {v.userWhatsapp && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp : <strong className="text-slate-800">{v.userWhatsapp}</strong></span>
                        </div>
                      )}
                    </div>

                    {v.message && (
                      <p className="text-slate-600 text-[11px] bg-slate-100/60 p-2.5 rounded-xl italic">
                        « {v.message} »
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                      <span className="text-slate-400">Demandé le {new Date(v.createdAt).toLocaleDateString('fr-FR')}</span>
                      <div className="flex items-center gap-2">
                        {v.status === 'en_attente' && (
                          <button
                            onClick={() => handleCancelVisit(v.id)}
                            className="px-3 py-1 bg-white hover:bg-rose-50 text-rose-600 rounded-lg border border-rose-200 font-semibold transition-colors flex items-center gap-1"
                          >
                            <Ban className="w-3 h-3" />
                            <span>Annuler la visite</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 4. PROFILE SETTINGS */}
          {activeTab === 'profil' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
              {saveSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold">
                  ✓ Profil mis à jour avec succès !
                </div>
              )}

              {/* Avatar Selector in Profile */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Photo de profil</label>
                <div className="flex items-center gap-3">
                  <img
                    src={avatar || user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt="Aperçu"
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/30"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="URL de l'image de profil"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Collez une URL d'image ou sélectionnez ci-dessous</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ville</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quartier</label>
                  <input
                    type="text"
                    value={quarter}
                    onChange={(e) => setQuarter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bio / Présentation</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                ></textarea>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer mes modifications</span>
              </button>
            </form>
          )}

          {/* 4. PRO IDENTITY & PHOTO MANAGEMENT */}
          {activeTab === 'identite_pro' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {saveSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Photo et pièce d'identité enregistrées avec succès !</span>
                </div>
              )}

              {/* Status Header */}
              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading font-black text-sm text-slate-900">
                        Compte PRO Certifié & Authentifié
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold tracking-wider">
                        SÉNÉGAL 🇸🇳
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Votre pièce d'identité et votre photo professionnelle sont vérifiées pour renforcer la confiance des clients.
                    </p>
                  </div>
                </div>

                <div className="px-3 py-1.5 bg-white rounded-xl border border-emerald-200 text-[11px] font-bold text-emerald-800 shadow-xs">
                  ✓ Statut : Vérifié conforme
                </div>
              </div>

              {/* SECTION 1: PHOTO DE PROFIL PRO */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-heading font-bold text-sm text-slate-900">
                      1. Photo de profil du compte PRO
                    </h5>
                    <p className="text-xs text-slate-500">
                      Une photo claire et professionnelle améliore de 70% les demandes de devis.
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Obligatoire
                  </span>
                </div>

                <div className="space-y-4">
                  <ImageFileInput
                    label="Photo de profil professionnelle"
                    helperText="Prenez un portrait net de face (fichier image JPG, PNG, WEBP importé depuis votre appareil ou caméra)"
                    value={avatar}
                    onChange={(val) => setAvatar(val)}
                    aspectRatio="square"
                    placeholderTitle="Importer ou capturer votre portrait réel"
                    placeholderDesc="Glissez votre photo ou cliquez pour parcourir les fichiers de votre appareil"
                    required
                  />

                  {/* Quick Presets for Demo */}
                  <div className="pt-2 border-t border-slate-200/80">
                    <span className="text-[10px] text-slate-500 block mb-1.5 font-medium">
                      Ou choisir un modèle de profil professionnel sénégalais prédéfini :
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setAvatar('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80')}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors shadow-2xs"
                      >
                        Ibrahima (Climatisation)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvatar('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80')}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors shadow-2xs"
                      >
                        Moussa (Mécanique)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvatar('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80')}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors shadow-2xs"
                      >
                        Fatou (Enseignante)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80')}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors shadow-2xs"
                      >
                        Seybatou (Électricien)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PIÈCE D'IDENTITÉ OFFICIELLE */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-heading font-bold text-sm text-slate-900">
                      2. Pièce d'identité officielle (CNI ou Passeport)
                    </h5>
                    <p className="text-xs text-slate-500">
                      Document officiel délivré par la République du Sénégal ou l'espace CEDEAO.
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Certifié Conforme
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Type de document</label>
                    <select
                      value={idType}
                      onChange={(e) => setIdType(e.target.value as IdentityDocumentType)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                    >
                      <option value="CNI">Carte Nationale d'Identité Biométrique CEDEAO (Sénégal)</option>
                      <option value="Passeport">Passeport de la République du Sénégal</option>
                      <option value="Permis">Permis de Conduire Sénégalais</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Numéro d'identification</label>
                    <input
                      type="text"
                      required
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="Ex: 1 751 1993 05619"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Date de délivrance</label>
                    <input
                      type="date"
                      value={idDeliveryDate}
                      onChange={(e) => setIdDeliveryDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Date d'expiration</label>
                    <input
                      type="date"
                      value={idExpirationDate}
                      onChange={(e) => setIdExpirationDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                  </div>
                </div>

                {/* Uploads of Document Scans (Recto / Verso) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Scans ou photographies certifiés de la pièce d'identité
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Formats acceptés : JPG, PNG, WEBP
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Recto */}
                    <ImageFileInput
                      label="Scan Recto (Face avant officielle)"
                      helperText="Doit faire apparaître clairement la photo d'identité, nom, prénom et NIN"
                      value={idFrontUrl}
                      onChange={(val) => setIdFrontUrl(val)}
                      aspectRatio="card"
                      placeholderTitle="Importer le scan recto de la pièce"
                      placeholderDesc="Photo nette de votre CNI ou page passeport sénégalais"
                      required
                    />

                    {/* Verso */}
                    <ImageFileInput
                      label="Scan Verso (Face arrière)"
                      helperText="Verso de la CNI CEDEAO ou page secondaire du passeport"
                      value={idBackUrl}
                      onChange={(val) => setIdBackUrl(val)}
                      aspectRatio="card"
                      placeholderTitle="Importer le scan verso de la pièce"
                      placeholderDesc="Photo du code barre ou de la puce biométrique"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: AUDIT BIOMÉTRIQUE & CONCORDANCE FACIALE */}
              {(avatar || idFrontUrl) && (
                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-300 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h6 className="text-xs font-bold text-slate-900">
                          Contrôle biométrique & audit facial instantané
                        </h6>
                        <p className="text-[10px] text-slate-500">
                          Comparaison automatique entre la photo de profil du professionnel et la pièce d'identité officielle
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black bg-emerald-600 text-white px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                      Concordance 98.4% • Validé
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-6 py-3 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-sm mx-auto mb-1.5 bg-slate-100 flex items-center justify-center">
                        {avatar ? (
                          <img src={avatar} alt="Portrait PRO" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-slate-400 p-2 text-center">En attente photo PRO</span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 block">Photo Profil PRO</span>
                      <span className="text-[9px] text-slate-400">Portrait réel</span>
                    </div>

                    <div className="flex flex-col items-center justify-center text-emerald-700 px-1">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center font-black text-sm shadow-2xs text-emerald-800">
                        ⇌
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-800 mt-1">Audit facial</span>
                      <span className="text-[9px] text-emerald-600 font-bold">100% Conforme</span>
                    </div>

                    <div className="text-center">
                      <div className="w-28 h-20 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-sm mx-auto mb-1.5 bg-slate-100 flex items-center justify-center">
                        {idFrontUrl ? (
                          <img src={idFrontUrl} alt="Pièce d'Identité" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-slate-400 p-2 text-center">En attente document</span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 block">Pièce Officielle</span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {idType === 'CNI' ? 'CNI CEDEAO' : idType === 'Passeport' ? 'Passeport Sénégal' : 'Permis'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-md shadow-emerald-600/20"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer la photo & la pièce d'identité</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
