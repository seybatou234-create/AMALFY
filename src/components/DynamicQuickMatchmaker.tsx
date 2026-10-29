import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, MapPin, Clock, ArrowRight, MessageCircle, CheckCircle2, Sparkles, PhoneCall } from 'lucide-react';
import { buildWhatsAppLink } from '../utils/helpers.js';

interface DynamicQuickMatchmakerProps {
  onSearch: (type: 'services' | 'real-estate' | 'market', query: string, city: string) => void;
  onNavigateTab: (tab: 'services' | 'real-estate' | 'market') => void;
}

export const DynamicQuickMatchmaker: React.FC<DynamicQuickMatchmakerProps> = ({
  onSearch,
  onNavigateTab
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'clim' | 'plomb' | 'elec' | 'immo' | 'tech'>('clim');
  const [selectedCity, setSelectedCity] = useState('Dakar');
  const [selectedUrgency, setSelectedUrgency] = useState<'immediate' | 'today' | 'week'>('today');

  const categories = [
    { id: 'clim' as const, label: '❄️ Dépannage Clim & Froid', tab: 'services' as const, query: 'Climaticien' },
    { id: 'plomb' as const, label: '🔧 Plomberie & Fuite', tab: 'services' as const, query: 'Plombier' },
    { id: 'elec' as const, label: '⚡ Électricien Bâtiment', tab: 'services' as const, query: 'Électricien' },
    { id: 'immo' as const, label: '🏠 Logement / Villa Saly', tab: 'real-estate' as const, query: 'Appartement' },
    { id: 'tech' as const, label: '📱 Smartphone & High-Tech', tab: 'market' as const, query: 'iPhone' }
  ];

  const currentCat = categories.find(c => c.id === selectedCategory) || categories[0];

  const handleLaunchSearch = () => {
    onSearch(currentCat.tab, currentCat.query, selectedCity);
  };

  const dispatchWhatsAppMessage = `Bonjour AMALFY Dispatch, j'ai besoin d'une assistance rapide pour : ${currentCat.label} à ${selectedCity} (${selectedUrgency === 'immediate' ? 'URGENCE IMMÉDIATE' : selectedUrgency === 'today' ? 'Aujourd’hui' : 'Cette semaine'}). Pouvez-vous me mettre en relation directe avec un artisan disponible ?`;

  return (
    <div className="py-12 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white relative overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-3 border border-emerald-500/30">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Mise en Relation Express au Sénégal</span>
          </div>
          <h3 className="font-heading font-black text-2xl sm:text-3xl text-white">
            Besoin d’une intervention ou d’un bien sans attendre ?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Configurez votre demande en 3 clics. Notre dispatch AMALFY vous connecte immédiatement avec le bon professionnel vérifié.
          </p>
        </div>

        {/* 3 Steps Interactive Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 sm:p-7 border border-white/15 shadow-2xl space-y-6">
          {/* Step 1: Quel est votre besoin */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              1. Sélectionnez votre besoin :
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-3 rounded-2xl text-xs font-bold text-left transition-all border ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/30'
                      : 'bg-white/5 text-slate-200 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="block truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2 & 3: Ville & Urgence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                2. Ville ou Région :
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Dakar', 'Thiès', 'Saly Portudal', 'Saint-Louis'].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                      selectedCity === city
                        ? 'bg-white text-slate-950 border-white shadow-sm font-black'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                3. Niveau d’urgence :
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'immediate' as const, label: '⚡ Immédiat (< 2h)' },
                  { id: 'today' as const, label: '📅 Aujourd’hui' },
                  { id: 'week' as const, label: '🗓️ Cette semaine' }
                ].map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedUrgency(u.id)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                      selectedUrgency === u.id
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm font-black'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Plus de <strong>120 artisans disponibles</strong> prêts à intervenir à {selectedCity}</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <a
                href={buildWhatsAppLink('+221778628838', dispatchWhatsAppMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial py-3 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#25D366]/30 active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Dispatch WhatsApp direct</span>
              </a>

              <button
                type="button"
                onClick={handleLaunchSearch}
                className="py-3 px-5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0"
              >
                <span>Voir les offres</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
