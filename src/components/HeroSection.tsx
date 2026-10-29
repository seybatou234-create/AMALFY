import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Wrench,
  Home,
  ShoppingBag,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  TrendingUp,
  X
} from 'lucide-react';
import { SENEGAL_CITIES } from '../utils/helpers.js';
import { AmalfyEmblem } from './AmalfyLogo.js';

interface HeroSectionProps {
  onSearch: (type: 'services' | 'real-estate' | 'market', query: string, city: string) => void;
  onNavigate: (tab: 'services' | 'real-estate' | 'market') => void;
  onOpenPublish: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch, onNavigate, onOpenPublish }) => {
  const [activeModule, setActiveModule] = useState<'services' | 'real-estate' | 'market'>('services');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Toutes');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(activeModule, searchQuery, selectedCity);
  };

  const placeholders = {
    services: 'Rechercher un climaticien, plombier, électricien, mécanicien...',
    'real-estate': 'Rechercher appartement Almadies, villa Saly, studio Sacré-Cœur...',
    market: 'Rechercher iPhone 15, Toyota RAV4, boubou bazin riche, MacBook...'
  };

  const modulePillars = [
    {
      id: 'services' as const,
      label: 'AMALFY Services',
      short: 'Services',
      icon: Wrench,
      accent: 'emerald',
      desc: 'Plombiers, climaticiens et artisans certifiés avec devis & avis vérifiés.',
      count: '80+ métiers',
      badge: 'Intervention 2h'
    },
    {
      id: 'real-estate' as const,
      label: 'AMALFY Immobilier',
      short: 'Immobilier',
      icon: Home,
      accent: 'blue',
      desc: 'Locations & ventes : appartements à Dakar, villas avec piscine à Saly, terrains.',
      count: '150+ biens vérifiés',
      badge: 'Visite garantie'
    },
    {
      id: 'market' as const,
      label: 'AMALFY Market',
      short: 'Market',
      icon: ShoppingBag,
      accent: 'amber',
      desc: 'Smartphones scellés, voitures dédouanées, mode africaine et paiement Wave.',
      count: '300+ articles',
      badge: 'Paiement Wave/OM'
    }
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-emerald-950/80 to-slate-950 text-white pt-10 pb-16 md:py-20 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/30">
      {/* Background visual accents & soft radial glow */}
      <div className="absolute top-0 right-1/4 -mt-24 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-10 -mb-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-64 bg-radial from-emerald-500/5 to-transparent blur-2xl pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10 text-center">
        {/* Brand Emblem & Official Senegalese Badge */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="mb-3 hover:scale-105 transition-transform duration-300">
            <AmalfyEmblem sizePx={62} />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-sm shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>La Référence Multiservices au Sénégal 🇸🇳</span>
          </div>
        </div>

        {/* Hero Title & Slogan */}
        <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-4 leading-tight">
          AMALFY{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
            Sénégal
          </span>
        </h1>
        <p className="text-base sm:text-xl md:text-2xl text-emerald-100/90 font-medium max-w-2xl mx-auto mb-8 tracking-wide">
          « Le bon service, le bon bien, le bon produit. »
        </p>

        {/* Interactive Search Box Container */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-3 sm:p-5 rounded-3xl border border-white/15 shadow-2xl max-w-3xl mx-auto text-left ring-1 ring-white/10">
          {/* Sub-tabs for search */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-3.5 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar">
            {modulePillars.map((p) => {
              const Icon = p.icon;
              const isActive = activeModule === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActiveModule(p.id)}
                  className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? p.id === 'services'
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 font-black'
                        : p.id === 'real-estate'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black'
                        : 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30 font-black'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span><span className="hidden sm:inline">AMALFY </span>{p.short}</span>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholders[activeModule]}
                className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-400 shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="relative sm:w-44">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-9 pr-8 py-3.5 rounded-2xl bg-white text-slate-900 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-400 shadow-inner appearance-none cursor-pointer"
              >
                {SENEGAL_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <span>Rechercher</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Popular shortcuts */}
          <div className="mt-3 flex items-center gap-2 flex-wrap text-xs text-slate-300 pt-2 border-t border-white/5">
            <span className="text-slate-400 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              Tendances :
            </span>

            {activeModule === 'services' && (
              <>
                {['Climaticien', 'Électricien', 'Mécanicien Toyota', 'Plombier urgence', 'Peintre bâtiment'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSearchQuery(term);
                      onSearch('services', term, selectedCity);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-emerald-500/20 hover:text-emerald-300 border border-white/5 transition-colors cursor-pointer text-[11px]"
                  >
                    {term}
                  </button>
                ))}
              </>
            )}

            {activeModule === 'real-estate' && (
              <>
                {['Almadies', 'Villa Saly', 'Studio Sacré-Cœur', 'Terrain Diamniadio', 'Plateau'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSearchQuery(term);
                      onSearch('real-estate', term, selectedCity);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-blue-500/20 hover:text-blue-300 border border-white/5 transition-colors cursor-pointer text-[11px]"
                  >
                    {term}
                  </button>
                ))}
              </>
            )}

            {activeModule === 'market' && (
              <>
                {['iPhone 15 Pro', 'Toyota RAV4', 'Boubou Bazin', 'MacBook Air M2', 'Salon cuir'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSearchQuery(term);
                      onSearch('market', term, selectedCity);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-amber-500/20 hover:text-amber-300 border border-white/5 transition-colors cursor-pointer text-[11px]"
                  >
                    {term}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* 3 Pillars Quick Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mt-10">
          {modulePillars.map((p) => {
            const Icon = p.icon;
            const borderHover =
              p.id === 'services'
                ? 'hover:border-emerald-500/60'
                : p.id === 'real-estate'
                ? 'hover:border-blue-500/60'
                : 'hover:border-amber-500/60';
            const iconBg =
              p.id === 'services'
                ? 'bg-emerald-500/20 text-emerald-300'
                : p.id === 'real-estate'
                ? 'bg-blue-500/20 text-blue-300'
                : 'bg-amber-500/20 text-amber-300';

            return (
              <div
                key={p.id}
                onClick={() => onNavigate(p.id)}
                className={`p-4.5 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-white/10 ${borderHover} hover:bg-slate-900/90 hover:-translate-y-1 transition-all duration-300 cursor-pointer text-left group shadow-lg`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-2xl ${iconBg} flex items-center justify-center font-bold shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 group-hover:text-white flex items-center gap-1 group-hover:translate-x-1 transition-all">
                    <span>Explorer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <h3 className="font-heading font-black text-base text-white mb-1">{p.label}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{p.desc}</p>
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-emerald-400 font-bold">{p.count}</span>
                  <span className="text-slate-400">{p.badge}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Official Senegal Reassurance Bar with real Trust Metrics */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-6 border-t border-white/10 text-left">
          <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-white/5 border border-white/5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Pros Vérifiés</p>
              <p className="text-[10px] text-slate-400">CNI & casier modérés</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-white/5 border border-white/5">
            <Zap className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Wave & OM</p>
              <p className="text-[10px] text-slate-400">Paiement 100% protégé</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-white/5 border border-white/5">
            <PhoneCall className="w-5 h-5 text-teal-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Contact Direct</p>
              <p className="text-[10px] text-slate-400">WhatsApp sans commission</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-white/5 border border-white/5">
            <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Couverture Nationale</p>
              <p className="text-[10px] text-slate-400">Dakar, Thiès, Saly & plus</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
