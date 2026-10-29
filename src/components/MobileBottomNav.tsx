import React from 'react';
import { Sparkles, Wrench, Home, ShoppingBag, Plus } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'home' | 'services' | 'real-estate' | 'market';
  setActiveTab: (tab: 'home' | 'services' | 'real-estate' | 'market') => void;
  onOpenPublish: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenPublish
}) => {
  return (
    <nav
      aria-label="Navigation mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] shadow-2xl"
    >
      <div className="flex items-center justify-between max-w-sm mx-auto relative">
        {/* Accueil */}
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex-1 min-w-[54px] min-h-[46px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-all active:scale-95 cursor-pointer ${
            activeTab === 'home'
              ? 'text-emerald-700 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Sparkles className="w-5 h-5" />
            {activeTab === 'home' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            )}
          </div>
          <span>Accueil</span>
        </button>

        {/* Services */}
        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`flex-1 min-w-[54px] min-h-[46px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-all active:scale-95 cursor-pointer ${
            activeTab === 'services'
              ? 'text-emerald-700 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Wrench className="w-5 h-5" />
            {activeTab === 'services' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            )}
          </div>
          <span>Services</span>
        </button>

        {/* Center Floating Publier Button */}
        <div className="relative -top-3.5 px-1 shrink-0">
          <button
            type="button"
            onClick={onOpenPublish}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-600/40 border-4 border-white active:scale-90 transition-transform cursor-pointer"
            title="Publier une annonce"
            aria-label="Publier une annonce"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Immobilier */}
        <button
          type="button"
          onClick={() => setActiveTab('real-estate')}
          className={`flex-1 min-w-[54px] min-h-[46px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-all active:scale-95 cursor-pointer ${
            activeTab === 'real-estate'
              ? 'text-blue-700 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Home className="w-5 h-5" />
            {activeTab === 'real-estate' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            )}
          </div>
          <span>Immo</span>
        </button>

        {/* Market */}
        <button
          type="button"
          onClick={() => setActiveTab('market')}
          className={`flex-1 min-w-[54px] min-h-[46px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-all active:scale-95 cursor-pointer ${
            activeTab === 'market'
              ? 'text-amber-700 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {activeTab === 'market' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            )}
          </div>
          <span>Market</span>
        </button>
      </div>
    </nav>
  );
};
