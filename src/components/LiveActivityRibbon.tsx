import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Zap,
  Home,
  ShoppingBag,
  Wrench,
  Clock,
  MapPin,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Pause,
  Play
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'service' | 'immo' | 'market';
  icon: typeof Wrench;
  title: string;
  detail: string;
  city: string;
  timeAgo: string;
  badge: string;
  badgeColor: string;
  actionTab: 'services' | 'real-estate' | 'market';
}

const LIVE_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act_1',
    type: 'service',
    icon: Wrench,
    title: 'Intervention validée aux Almadies',
    detail: 'Ibrahima D. (Frigoriste) a accepté une réparation de climatiseur F4.',
    city: 'Dakar',
    timeAgo: 'il y a 2 min',
    badge: 'Artisan Pro',
    badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    actionTab: 'services'
  },
  {
    id: 'act_2',
    type: 'immo',
    icon: Home,
    title: 'Visite réservée pour demain 16h',
    detail: 'Appartement F4 Standing avec vue mer aux Almadies.',
    city: 'Dakar',
    timeAgo: 'il y a 4 min',
    badge: 'Visite Immo',
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
    actionTab: 'real-estate'
  },
  {
    id: 'act_3',
    type: 'market',
    icon: ShoppingBag,
    title: 'Commande validée avec Wave',
    detail: 'iPhone 15 Pro Max 256 Go commandé en livraison express à Sacré-Cœur.',
    city: 'Dakar',
    timeAgo: 'il y a 6 min',
    badge: 'Vente Market',
    badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
    actionTab: 'market'
  },
  {
    id: 'act_4',
    type: 'service',
    icon: Zap,
    title: 'Dépannage d’urgence à Saly',
    detail: 'Mamadou N. (Électricien) est en route pour une coupure générale.',
    city: 'Saly Portudal',
    timeAgo: 'il y a 9 min',
    badge: 'Dépannage Express',
    badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    actionTab: 'services'
  },
  {
    id: 'act_5',
    type: 'immo',
    icon: Home,
    title: 'Nouveau bien certifié à Thiès',
    detail: 'Villa R+1 Titre Foncier au quartier Dixième vérifiée par l’équipe AMALFY.',
    city: 'Thiès',
    timeAgo: 'il y a 12 min',
    badge: 'Nouveau Bien',
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
    actionTab: 'real-estate'
  },
  {
    id: 'act_6',
    type: 'market',
    icon: ShoppingBag,
    title: 'Nouveau vendeur certifié',
    detail: 'Boutique Getzner Prestige a publié 8 nouveaux modèles de Boubous Bazin.',
    city: 'Dakar',
    timeAgo: 'il y a 15 min',
    badge: 'Boutique Pro',
    badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
    actionTab: 'market'
  }
];

interface LiveActivityRibbonProps {
  onNavigateTab: (tab: 'services' | 'real-estate' | 'market') => void;
}

export const LiveActivityRibbon: React.FC<LiveActivityRibbonProps> = ({ onNavigateTab }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [onlineCount, setOnlineCount] = useState(384);

  // Rotate activities smoothly every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % LIVE_ACTIVITIES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Slight natural fluctuation of online users counter
  useEffect(() => {
    const userInterval = setInterval(() => {
      setOnlineCount((prev) => {
        const delta = Math.floor(Math.random() * 7) - 3;
        return Math.max(340, Math.min(460, prev + delta));
      });
    }, 7000);
    return () => clearInterval(userInterval);
  }, []);

  const current = LIVE_ACTIVITIES[currentIndex];
  const IconComponent = current.icon;

  return (
    <div className="bg-slate-900 border-b border-emerald-900/30 text-white overflow-hidden py-2 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
        {/* Left: Live indicator & counter */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>ACTIVITÉ EN DIRECT</span>
          </div>

          <span className="text-slate-400 text-[11px] hidden sm:inline flex items-center gap-1">
            <span className="font-mono font-bold text-slate-200">{onlineCount}</span>
            <span>visiteurs en ligne au Sénégal</span>
          </span>
        </div>

        {/* Center: Animated Activity Item */}
        <div
          className="flex-1 w-full max-w-2xl flex items-center justify-center overflow-hidden h-7"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={() => onNavigateTab(current.actionTab)}
              className="flex items-center gap-2 cursor-pointer group hover:text-emerald-300 transition-colors w-full justify-center text-center"
            >
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${current.badgeColor}`}>
                {current.badge}
              </span>

              <span className="font-bold text-white truncate max-w-[280px] sm:max-w-md group-hover:underline">
                {current.title}
              </span>

              <span className="text-slate-400 text-[11px] shrink-0 hidden md:inline">
                • {current.city} ({current.timeAgo})
              </span>

              <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Quick shortcuts & pause button */}
        <div className="hidden lg:flex items-center gap-3 shrink-0 text-[11px] text-slate-400">
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'Reprendre le défilement' : 'Mettre en pause'}
            className="p-1 hover:text-white rounded-md text-slate-400"
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>
          <span>Dakar</span>
          <span>•</span>
          <span>Thiès</span>
          <span>•</span>
          <span>Saly</span>
          <span>•</span>
          <span>Saint-Louis</span>
        </div>
      </div>
    </div>
  );
};
