import React, { useState, useRef, useEffect } from 'react';
import {
  Wrench,
  Home,
  ShoppingBag,
  PlusCircle,
  MessageSquare,
  ShoppingCart,
  User as UserIcon,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Search,
  Bell,
  CheckCheck,
  FileText,
  Clock,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { useNotifications } from '../context/NotificationContext.js';
import { UserRole, AppNotification } from '../types/index.js';
import { AmalfyLogo } from './AmalfyLogo.js';
import { SafeImage } from './SafeImage.js';

interface NavbarProps {
  activeTab: 'home' | 'services' | 'real-estate' | 'market';
  setActiveTab: (tab: 'home' | 'services' | 'real-estate' | 'market') => void;
  onOpenPublish: () => void;
  onOpenMessages: () => void;
  onOpenDashboard: (tab?: 'profil' | 'demandes' | 'commandes' | 'visites' | 'identite_pro') => void;
  onOpenAdmin: () => void;
  onSearchFocus: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenPublish,
  onOpenMessages,
  onOpenDashboard,
  onOpenAdmin,
  onSearchFocus
}) => {
  const { user, activeRole, setActiveRole, switchUser, logout } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifTab, setNotifTab] = useState<'all' | 'unread'>('all');

  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleLabels: Record<UserRole, string> = {
    client: 'Client',
    pro: 'Professionnel / Artisan',
    seller: 'Vendeur Market',
    landlord: 'Bailleur / Agent Immo',
    admin: 'Administrateur'
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    await markAsRead(notif.id);
    setNotifDropdownOpen(false);

    if (notif.type === 'message') {
      onOpenMessages();
    } else if (notif.type === 'devis_reponse') {
      onOpenDashboard('demandes');
    } else if (notif.type === 'vente_produit') {
      onOpenDashboard('commandes');
    } else if (notif.type === 'visite_confirmee') {
      onOpenDashboard('visites');
    }
  };

  const filteredNotifications = notifTab === 'unread'
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all shadow-xs">
      {/* Top micro bar for slogan & quick contacts */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium text-slate-200">AMALFY Sénégal</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 italic">« Le bon service, le bon bien, le bon produit. »</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Dakar • Thiès • Mbour • Saint-Louis</span>
            <span className="text-slate-600">|</span>
            <a
              href="https://wa.me/221778628838"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 text-emerald-300 font-bold flex items-center gap-1 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>WhatsApp direct : 77 862 88 38</span>
            </a>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-semibold">Wave & Orange Money acceptés</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-2 sm:gap-4">
          {/* Brand Logo */}
          <AmalfyLogo
            variant="header"
            size="md"
            onClick={() => setActiveTab('home')}
          />

          {/* Module Navigation Tabs (Tablets & Desktop) */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all flex items-center gap-1.5 lg:gap-2 cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Accueil</span>
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all flex items-center gap-1.5 lg:gap-2 cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Wrench className="w-4 h-4 shrink-0" />
              <span><span className="hidden xl:inline">AMALFY </span>Services</span>
            </button>
            <button
              onClick={() => setActiveTab('real-estate')}
              className={`px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all flex items-center gap-1.5 lg:gap-2 cursor-pointer ${
                activeTab === 'real-estate'
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Home className="w-4 h-4 shrink-0" />
              <span><span className="hidden xl:inline">AMALFY </span>Immobilier</span>
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className={`px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all flex items-center gap-1.5 lg:gap-2 cursor-pointer ${
                activeTab === 'market'
                  ? 'bg-amber-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span><span className="hidden xl:inline">AMALFY </span>Market</span>
            </button>
          </nav>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Quick search button for mobile */}
            <button
              onClick={onSearchFocus}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl min-w-[38px] min-h-[38px] flex items-center justify-center cursor-pointer"
              title="Rechercher"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Publier une annonce button - hidden on small phones as mobile bottom nav has prominent center action */}
            <button
              onClick={onOpenPublish}
              className="hidden sm:inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-200" />
              <span>Publier</span>
            </button>

            {/* Notifications Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  setUserDropdownOpen(false);
                }}
                className="relative p-2 sm:p-2.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center cursor-pointer"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <>
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </>
                )}
              </button>

              {/* Notification Flyout Menu - perfectly fitted for mobile & tablet */}
              {notifDropdownOpen && (
                <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:mt-2 w-auto sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  {/* Header */}
                  <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <h4 className="font-heading font-black text-sm">Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                          {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllAsRead()}
                        className="text-[11px] text-emerald-300 hover:text-emerald-100 font-semibold flex items-center gap-1 transition-colors"
                        title="Tout marquer comme lu"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Tout marquer lu</span>
                      </button>
                    )}
                  </div>

                  {/* Tabs: Toutes vs Non lues */}
                  <div className="flex items-center border-b border-slate-100 bg-slate-50 px-3 py-1.5 gap-2 text-xs">
                    <button
                      onClick={() => setNotifTab('all')}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                        notifTab === 'all'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Toutes ({notifications.length})
                    </button>
                    <button
                      onClick={() => setNotifTab('unread')}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                        notifTab === 'unread'
                          ? 'bg-white text-rose-600 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Non lues ({unreadCount})
                    </button>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                    {filteredNotifications.length === 0 ? (
                      <div className="py-12 px-4 text-center">
                        <Bell className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-700">Aucune notification pour le moment</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Vous serez alerté dès la réception d'un message, d'un devis ou d'une vente.
                        </p>
                      </div>
                    ) : (
                      filteredNotifications.map((notif) => {
                        return (
                          <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-3.5 sm:p-4 text-left transition-colors cursor-pointer flex items-start gap-3 relative ${
                              !notif.isRead
                                ? 'bg-amber-50/40 hover:bg-amber-50/70'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            {/* Unread indicator bar */}
                            {!notif.isRead && (
                              <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-full bg-rose-500"></span>
                            )}

                            {/* Icon based on type */}
                            <div className="shrink-0 mt-0.5">
                              {notif.type === 'message' && (
                                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                                  <MessageSquare className="w-4.5 h-4.5" />
                                </div>
                              )}
                              {notif.type === 'devis_reponse' && (
                                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                  <FileText className="w-4.5 h-4.5" />
                                </div>
                              )}
                              {notif.type === 'vente_produit' && (
                                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                                  <ShoppingBag className="w-4.5 h-4.5" />
                                </div>
                              )}
                              {notif.type === 'visite_confirmee' && (
                                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                                  <Home className="w-4.5 h-4.5" />
                                </div>
                              )}
                            </div>

                            {/* Text content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <h5 className={`text-xs truncate ${!notif.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                                  {notif.title}
                                </h5>
                                <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                                {notif.message}
                              </p>

                              {/* Action prompt */}
                              <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-800">
                                {notif.type === 'message' && <span>Ouvrir la conversation</span>}
                                {notif.type === 'devis_reponse' && <span>Consulter le devis</span>}
                                {notif.type === 'vente_produit' && <span>Gérer la commande</span>}
                                {notif.type === 'visite_confirmee' && <span>Voir la visite</span>}
                                <ArrowRight className="w-3 h-3" />
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 font-medium">
                      AMALFY • Alertes instantanées en direct
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 sm:p-2.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="Panier AMALFY Market"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Messages Icon */}
            <button
              onClick={onOpenMessages}
              className="relative p-2 sm:p-2.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="Messagerie instantanée"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500"></span>
            </button>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setNotifDropdownOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
              >
                <SafeImage
                  src={user?.avatar}
                  alt={user?.name}
                  categoryPlaceholder="avatar"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover ring-1 ring-emerald-500/30"
                />
                <div className="hidden md:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                    {user?.name}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold leading-tight">
                    {roleLabels[activeRole] || 'Compte'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-400">Connecté en tant que</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>

                  {/* Role Switcher */}
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
                      Mode actif
                    </p>
                    <div className="space-y-1">
                      {(user?.roles || ['client']).map((r) => (
                        <button
                          key={r}
                          onClick={() => setActiveRole(r)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between ${
                            activeRole === r
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span>{roleLabels[r]}</span>
                          {activeRole === r && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fast demo account switcher */}
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
                      Changer de compte démo
                    </p>
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      <button
                        onClick={() => switchUser('usr_admin_1')}
                        className="px-2 py-1 text-left rounded-md hover:bg-slate-100 text-slate-700"
                      >
                        👑 Seybatou (Admin)
                      </button>
                      <button
                        onClick={() => switchUser('usr_pro_1')}
                        className="px-2 py-1 text-left rounded-md hover:bg-slate-100 text-slate-700"
                      >
                        ❄️ Ibrahima (Clim)
                      </button>
                      <button
                        onClick={() => switchUser('usr_seller_1')}
                        className="px-2 py-1 text-left rounded-md hover:bg-slate-100 text-slate-700"
                      >
                        📱 Cheikh (Tech)
                      </button>
                      <button
                        onClick={() => switchUser('usr_landlord_1')}
                        className="px-2 py-1 text-left rounded-md hover:bg-slate-100 text-slate-700"
                      >
                        🏢 Pape (Immo)
                      </button>
                    </div>
                  </div>

                  {/* Main Sub-Menus */}
                  <div className="py-1 border-b border-slate-100">
                    <button
                      onClick={() => onOpenDashboard('demandes')}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Wrench className="w-4 h-4 text-emerald-600" />
                        <span>Mes Devis & Services</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                    </button>

                    <button
                      onClick={() => onOpenDashboard('commandes')}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-800 flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <ShoppingBag className="w-4 h-4 text-amber-500" />
                        <span>Mes Commandes Market</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-500 transition-colors" />
                    </button>

                    <button
                      onClick={() => onOpenDashboard('visites')}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-800 flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Home className="w-4 h-4 text-blue-600" />
                        <span>Mes Visites Immobilières</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </button>

                    {user?.roles.includes('pro') && (
                      <button
                        onClick={() => onOpenDashboard('identite_pro')}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50/60 hover:bg-emerald-100/70 flex items-center justify-between transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Photo & Pièce d'Identité PRO</span>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      </button>
                    )}

                    <button
                      onClick={() => onOpenDashboard('profil')}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>Mon Profil & Coordonnées</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                    </button>

                    <button
                      onClick={onOpenMessages}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <MessageSquare className="w-4 h-4 text-slate-400" />
                        <span>Messagerie instantanée</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                    </button>
                  </div>

                  {/* Admin & Logout Section */}
                  <div className="py-1">
                    {user?.roles.includes('admin') && (
                      <button
                        onClick={onOpenAdmin}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2.5 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Administration AMALFY</span>
                      </button>
                    )}

                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
