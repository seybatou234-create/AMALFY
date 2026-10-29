import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ShieldCheck, MapPin, ExternalLink } from 'lucide-react';

interface ToastItem {
  id: string;
  name: string;
  location: string;
  action: string;
  item: string;
  avatar: string;
  timeAgo: string;
  tab: 'services' | 'real-estate' | 'market';
}

const TOAST_EVENTS: ToastItem[] = [
  {
    id: 't_1',
    name: 'Moussa Ndiaye',
    location: 'Dakar (Almadies)',
    action: 'a réservé une intervention',
    item: 'Climatisation Split F4',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    timeAgo: 'il y a 3 min',
    tab: 'services'
  },
  {
    id: 't_2',
    name: 'Fatou Bintou S.',
    location: 'Saly Portudal',
    action: 'a confirmé une visite',
    item: 'Villa 4 pièces avec piscine',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    timeAgo: 'il y a 5 min',
    tab: 'real-estate'
  },
  {
    id: 't_3',
    name: 'Cheikh Tidiane',
    location: 'Sacré-Cœur 3',
    action: 'a commandé via Wave',
    item: 'iPhone 15 Pro Max 256Go',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    timeAgo: 'il y a 8 min',
    tab: 'market'
  },
  {
    id: 't_4',
    name: 'Aissatou Diallo',
    location: 'Thiès (Dixième)',
    action: 'a contacté sur WhatsApp',
    item: 'Mamadou N. (Électricien certifié)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    timeAgo: 'il y a 11 min',
    tab: 'services'
  }
];

interface LiveSocialToastProps {
  onNavigateTab: (tab: 'services' | 'real-estate' | 'market') => void;
}

export const LiveSocialToast: React.FC<LiveSocialToastProps> = ({ onNavigateTab }) => {
  const [currentToast, setCurrentToast] = useState<ToastItem | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    // Show first toast after 4 seconds
    const initialTimer = setTimeout(() => {
      setCurrentToast(TOAST_EVENTS[0]);
    }, 4000);

    // Loop through toasts every 22 seconds
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % TOAST_EVENTS.length;
      setCurrentToast(TOAST_EVENTS[index]);
    }, 22000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isDismissed]);

  // Auto-hide toast after 7 seconds of showing
  useEffect(() => {
    if (!currentToast) return;
    const hideTimer = setTimeout(() => {
      setCurrentToast(null);
    }, 7000);
    return () => clearTimeout(hideTimer);
  }, [currentToast]);

  if (isDismissed || !currentToast) return null;

  return (
    <div className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-40 max-w-xs sm:max-w-sm pointer-events-auto">
      <AnimatePresence>
        {currentToast && (
          <motion.div
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={() => onNavigateTab(currentToast.tab)}
            className="p-3.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 text-slate-900 cursor-pointer hover:border-emerald-500/50 transition-all flex items-start gap-3 relative group"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDismissed(true);
              }}
              className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
              title="Fermer"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="relative shrink-0">
              <img
                src={currentToast.avatar}
                alt={currentToast.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/30"
              />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
            </div>

            <div className="min-w-0 flex-1 pr-4">
              <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                <span className="font-bold text-slate-800">{currentToast.name}</span>
                <span>• {currentToast.location}</span>
              </p>

              <p className="text-xs font-bold text-slate-900 leading-tight mt-0.5 truncate">
                {currentToast.action} : <span className="text-emerald-700">{currentToast.item}</span>
              </p>

              <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                <span>{currentToast.timeAgo}</span>
                <span>•</span>
                <span className="text-emerald-600 font-bold group-hover:underline flex items-center gap-0.5">
                  <span>Voir l'offre</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
