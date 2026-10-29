import React from 'react';
import { motion } from 'motion/react';
import { MapPin, ArrowRight, Building, Wrench, ShoppingBag, Sparkles } from 'lucide-react';
import { SafeImage } from './SafeImage.js';

interface CityCard {
  name: string;
  tagline: string;
  countServices: number;
  countImmo: number;
  countMarket: number;
  popularQuarters: string[];
  imageUrl: string;
}

const SENEGAL_HUBS: CityCard[] = [
  {
    name: 'Dakar',
    tagline: 'Capitale & Grand Dakar',
    countServices: 84,
    countImmo: 62,
    countMarket: 145,
    popularQuarters: ['Almadies', 'Sacré-Cœur', 'Plateau', 'Ngor', 'Ouakam'],
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Saly Portudal',
    tagline: 'Petite Côte & Mbour',
    countServices: 28,
    countImmo: 41,
    countMarket: 32,
    popularQuarters: ['Saly Centre', 'Ngaparou', 'Somone', 'Saly Joseph'],
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Thiès',
    tagline: 'Carrefour ferroviaire & Artisans',
    countServices: 34,
    countImmo: 22,
    countMarket: 48,
    popularQuarters: ['Dixième', 'Randoulène', 'Grand Thiès', 'Mbour 1'],
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Saint-Louis',
    tagline: 'Ville Historique & Fleuve',
    countServices: 19,
    countImmo: 15,
    countMarket: 26,
    popularQuarters: ['Île Nord', 'Sor', 'Hydrobase', 'Bango'],
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80'
  }
];

interface DynamicCityExplorerProps {
  selectedCity: string;
  onSelectCity: (city: string) => void;
  onNavigateTab: (tab: 'services' | 'real-estate' | 'market') => void;
}

export const DynamicCityExplorer: React.FC<DynamicCityExplorerProps> = ({
  selectedCity,
  onSelectCity,
  onNavigateTab
}) => {
  return (
    <div className="py-10 bg-slate-900 text-white relative overflow-hidden border-b border-slate-800">
      {/* Visual background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <MapPin className="w-4 h-4" />
              <span>Géolocalisation & Pôles Régionaux</span>
            </div>
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-white">
              Explorer les opportunités par Ville du Sénégal
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Filtrez instantanément les artisans vérifiés, les villas et les offres market près de chez vous.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectCity('Toutes')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCity === 'Toutes'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/15'
              }`}
            >
              🇸🇳 Tout le Sénégal
            </button>
          </div>
        </div>

        {/* City Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SENEGAL_HUBS.map((hub) => {
            const isSelected = selectedCity === hub.name;
            return (
              <motion.div
                key={hub.name}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => onSelectCity(hub.name)}
                className={`relative rounded-3xl p-4.5 cursor-pointer transition-all border overflow-hidden group ${
                  isSelected
                    ? 'bg-gradient-to-b from-emerald-950/80 to-slate-900 border-emerald-400/80 ring-2 ring-emerald-500/30 shadow-xl'
                    : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-500 hover:bg-slate-800'
                }`}
              >
                {/* Background City Image Overlay */}
                <div className="absolute inset-0 opacity-15 group-hover:opacity-25 transition-opacity">
                  <SafeImage
                    src={hub.imageUrl}
                    alt={hub.name}
                    categoryPlaceholder="real-estate"
                    className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
                </div>

                <div className="relative z-10 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-heading font-black text-lg text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                        <span>{hub.name}</span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-400">{hub.tagline}</p>
                    </div>

                    <span
                      className={`p-1.5 rounded-xl transition-colors ${
                        isSelected ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-white/10 text-white'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </span>
                  </div>

                  {/* Dynamic counts */}
                  <div className="grid grid-cols-3 gap-1.5 py-2 border-y border-white/10 text-center">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCity(hub.name);
                        onNavigateTab('services');
                      }}
                      className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                      title="Voir les services"
                    >
                      <span className="block font-mono font-bold text-xs text-emerald-400">{hub.countServices}</span>
                      <span className="text-[9px] text-slate-400">Pros</span>
                    </div>

                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCity(hub.name);
                        onNavigateTab('real-estate');
                      }}
                      className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                      title="Voir les biens immobiliers"
                    >
                      <span className="block font-mono font-bold text-xs text-blue-400">{hub.countImmo}</span>
                      <span className="text-[9px] text-slate-400">Biens</span>
                    </div>

                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCity(hub.name);
                        onNavigateTab('market');
                      }}
                      className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                      title="Voir les annonces Market"
                    >
                      <span className="block font-mono font-bold text-xs text-amber-400">{hub.countMarket}</span>
                      <span className="text-[9px] text-slate-400">Articles</span>
                    </div>
                  </div>

                  {/* Popular quarters chips */}
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                      Quartiers populaires :
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {hub.popularQuarters.map((q) => (
                        <span
                          key={q}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-medium"
                        >
                          {q}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
