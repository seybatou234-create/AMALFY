/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { NotificationProvider } from './context/NotificationContext.js';
import { Navbar } from './components/Navbar.js';
import { MobileBottomNav } from './components/MobileBottomNav.js';
import { HeroSection } from './components/HeroSection.js';
import { ServicesModule } from './components/ServicesModule.js';
import { RealEstateModule } from './components/RealEstateModule.js';
import { MarketModule } from './components/MarketModule.js';
import { PublishModal } from './components/PublishModal.js';
import { CartDrawer } from './components/CartDrawer.js';
import { MessagesModal } from './components/MessagesModal.js';
import { UserDashboardModal } from './components/UserDashboardModal.js';
import { AdminDashboardModal } from './components/AdminDashboardModal.js';
import { FloatingWhatsApp } from './components/FloatingWhatsApp.js';
import { LiveActivityRibbon } from './components/LiveActivityRibbon.js';
import { DynamicCityExplorer } from './components/DynamicCityExplorer.js';
import { DynamicShowcaseTabs } from './components/DynamicShowcaseTabs.js';
import { DynamicQuickMatchmaker } from './components/DynamicQuickMatchmaker.js';
import { LiveSocialToast } from './components/LiveSocialToast.js';
import { AmalfyLogo } from './components/AmalfyLogo.js';
import {
  Wrench,
  Home,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Zap,
  PhoneCall,
  MessageCircle,
  Sparkles,
  Heart
} from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'home' | 'services' | 'real-estate' | 'market'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('Toutes');

  // Modals
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<'profil' | 'demandes' | 'commandes' | 'visites' | 'identite_pro'>('demandes');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [directChatTarget, setDirectChatTarget] = useState<{
    userId: string;
    userName: string;
    itemTitle?: string;
  } | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const handleSearchFromHero = (
    module: 'services' | 'real-estate' | 'market',
    query: string,
    city: string
  ) => {
    setActiveTab(module);
    setSearchQuery(query);
    setSearchCity(city);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDirectChat = (userId: string, userName: string, itemTitle: string) => {
    setDirectChatTarget({ userId, userName, itemTitle });
    setIsMessagesOpen(true);
  };

  const handlePublishSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between pb-20 md:pb-0">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(t) => {
          setActiveTab(t);
          setSearchQuery('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPublish={() => setIsPublishOpen(true)}
        onOpenMessages={() => {
          setDirectChatTarget(null);
          setIsMessagesOpen(true);
        }}
        onOpenDashboard={(tab) => {
          if (tab) setDashboardTab(tab);
          setIsDashboardOpen(true);
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onSearchFocus={() => {
          setActiveTab('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Top Live Real-time Activity Ticker */}
      <LiveActivityRibbon
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Container */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <div>
            {/* Hero Section */}
            <HeroSection
              onSearch={handleSearchFromHero}
              onNavigate={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenPublish={() => setIsPublishOpen(true)}
            />

            {/* Interactive City & Regional Hubs Explorer */}
            <DynamicCityExplorer
              selectedCity={searchCity}
              onSelectCity={(city) => {
                setSearchCity(city);
              }}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Dynamic Interactive Showcase Tabs (Services / Immo / Market) */}
            <DynamicShowcaseTabs
              selectedCity={searchCity}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenDirectChat={handleOpenDirectChat}
            />

            {/* 3-Click Express Need Matchmaker */}
            <DynamicQuickMatchmaker
              onSearch={handleSearchFromHero}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {activeTab === 'services' && (
          <ServicesModule
            key={`serv-tab-${refreshKey}`}
            initialSearch={searchQuery}
            initialCity={searchCity}
            onOpenDirectChat={handleOpenDirectChat}
          />
        )}

        {activeTab === 'real-estate' && (
          <RealEstateModule
            key={`immo-tab-${refreshKey}`}
            initialSearch={searchQuery}
            initialCity={searchCity}
            onOpenDirectChat={handleOpenDirectChat}
          />
        )}

        {activeTab === 'market' && (
          <MarketModule
            key={`mkt-tab-${refreshKey}`}
            initialSearch={searchQuery}
            initialCity={searchCity}
            onOpenDirectChat={handleOpenDirectChat}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
            {/* Brand column */}
            <div className="space-y-4">
              <AmalfyLogo
                variant="full"
                theme="dark"
                size="md"
                showSub={false}
              />
              <p className="text-xs text-slate-400 leading-relaxed">
                « Le bon service, le bon bien, le bon produit. » La marketplace multiservices nouvelle génération conçue spécifiquement pour le marché sénégalais.
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Opérationnel à Dakar, Thiès, Saly et tout le Sénégal 🇸🇳</span>
              </div>
              <div className="pt-1">
                <a
                  href="https://wa.me/221778628838"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-300 font-bold text-xs transition-colors shadow-2xs"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp direct : 77 862 88 38</span>
                </a>
              </div>
            </div>

            {/* Column 1: Services */}
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-emerald-400" />
                <span>AMALFY Services</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><button onClick={() => setActiveTab('services')} className="hover:text-white">Climaticiens & Frigoristes</button></li>
                <li><button onClick={() => setActiveTab('services')} className="hover:text-white">Mécaniciens & Garages</button></li>
                <li><button onClick={() => setActiveTab('services')} className="hover:text-white">Électriciens Bâtiment</button></li>
                <li><button onClick={() => setActiveTab('services')} className="hover:text-white">Plombiers d'urgence</button></li>
                <li><button onClick={() => setActiveTab('services')} className="hover:text-white">Professeurs particuliers</button></li>
              </ul>
            </div>

            {/* Column 2: Immobilier */}
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Home className="w-4 h-4 text-blue-400" />
                <span>AMALFY Immobilier</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><button onClick={() => setActiveTab('real-estate')} className="hover:text-white">Appartements aux Almadies</button></li>
                <li><button onClick={() => setActiveTab('real-estate')} className="hover:text-white">Villas avec piscine à Saly</button></li>
                <li><button onClick={() => setActiveTab('real-estate')} className="hover:text-white">Studios meublés Sacré-Cœur</button></li>
                <li><button onClick={() => setActiveTab('real-estate')} className="hover:text-white">Terrains Titre Foncier Diamniadio</button></li>
                <li><button onClick={() => setActiveTab('real-estate')} className="hover:text-white">Bureaux et commerces au Plateau</button></li>
              </ul>
            </div>

            {/* Column 3: Market & Paiement */}
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>AMALFY Market</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><button onClick={() => setActiveTab('market')} className="hover:text-white">Smartphones Apple & Samsung</button></li>
                <li><button onClick={() => setActiveTab('market')} className="hover:text-white">Véhicules d'occasion dédouanés</button></li>
                <li><button onClick={() => setActiveTab('market')} className="hover:text-white">Boubous & Couture Bazin Getzner</button></li>
                <li><button onClick={() => setActiveTab('market')} className="hover:text-white">Ordinateurs portables pro</button></li>
                <li className="pt-2 text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Paiements Wave & OM acceptés</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 AMALFY Sénégal. Tous droits réservés.</p>
            <div className="flex items-center gap-4">
              <span>Conditions d'utilisation</span>
              <span>•</span>
              <span>Politique de confidentialité</span>
              <span>•</span>
              <button onClick={() => setIsAdminOpen(true)} className="hover:text-emerald-400">
                Espace Admin
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={(t) => {
          setActiveTab(t);
          setSearchQuery('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPublish={() => setIsPublishOpen(true)}
      />

      {/* Modals Mounted */}
      <PublishModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        onSuccess={handlePublishSuccess}
      />

      <CartDrawer />

      <MessagesModal
        isOpen={isMessagesOpen}
        onClose={() => setIsMessagesOpen(false)}
        directTarget={directChatTarget}
      />

      <UserDashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        initialTab={dashboardTab}
      />

      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onRefreshAll={() => setRefreshKey((prev) => prev + 1)}
      />

      {/* Floating WhatsApp Contact Button */}
      <FloatingWhatsApp />

      {/* Real-time Social Proof Toast */}
      <LiveSocialToast
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  );
}

