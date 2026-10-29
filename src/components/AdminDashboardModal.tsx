import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  Users,
  Wrench,
  Home,
  ShoppingBag,
  FileText,
  CheckCircle2,
  Clock,
  Calendar,
  Ban,
  ShieldAlert,
  Shield,
  Lock,
  Activity,
  Terminal,
  RefreshCw,
  Zap,
  Play,
  Globe,
  Radio,
  Settings,
  Sliders,
  DollarSign,
  CreditCard,
  Bell,
  Save,
  PhoneCall,
  Mail,
  Truck,
  Percent,
  Building2,
  Check,
  MapPin,
  Smartphone,
  Info
} from 'lucide-react';
import { api } from '../services/api.js';
import { formatFCFA } from '../utils/helpers.js';
import { ReportItem, ProProfile, VisitRequest, CyberShieldStatus, CyberAttackType } from '../types/index.js';
import { AmalfyEmblem } from './AmalfyLogo.js';

export interface PlatformSettings {
  // 1. Général & Identité
  platformName: string;
  platformSlogan: string;
  supportPhone: string;
  supportWhatsapp: string;
  supportEmail: string;
  supportHours: string;
  emergencyDispatchPhone: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;

  // 2. Frais & Commissions
  artisanCommissionRate: number; // e.g. 7%
  minArtisanCommissionFCFA: number; // e.g. 1500 FCFA
  freeClientQuotes: boolean; // 0 FCFA pour le client
  realEstateBrokeragePercent: number; // 5%
  realEstateMaxFeeMonths: number; // 1 mois de loyer standard
  marketSellerCommissionRate: number; // 4%
  minPayoutThresholdFCFA: number; // 10000 FCFA

  // 3. Paiements & Comptes Marchands Sénégal
  waveMerchantPhone: string;
  waveEnabled: boolean;
  orangeMoneyMerchantCode: string;
  orangeMoneyEnabled: boolean;
  cashOnDeliveryEnabled: boolean;
  bankTransferEnabled: boolean;
  escrowHoldDurationHours: number; // 48h

  // 4. Modération & Sécurité KYC
  requireManualListingApproval: boolean;
  requireKycForPros: boolean;
  maxReportsBeforeSuspension: number;
  artisanGuaranteeHours: number; // 72h
  marketReturnPeriodDays: number; // 7 jours

  // 5. Zones & Villes Actives
  activeZones: {
    dakar: boolean;
    thies: boolean;
    mbour_saly: boolean;
    saint_louis: boolean;
    touba: boolean;
    ziguinchor: boolean;
  };
  deliveryFeeDakarFCFA: number; // 2000 FCFA
  deliveryFeeRegionsFCFA: number; // 5000 FCFA
  emergencyDispatchRadiusKm: number; // 15 km

  // 6. Notifications & Canaux
  smsAlertsOnUrgency: boolean;
  whatsappAutoConfirm: boolean;
  adminNewProAlertEmail: boolean;
  adminReportImmediateAlert: boolean;
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  platformName: 'AMALFY',
  platformSlogan: '« Le bon service, le bon bien, le bon produit. »',
  supportPhone: '+221 77 862 88 38',
  supportWhatsapp: '+221 77 862 88 38',
  supportEmail: 'contact@amalfy.sn',
  supportHours: '08h00 - 22h30 GMT (Support 7j/7)',
  emergencyDispatchPhone: '+221 77 862 88 38',
  maintenanceMode: false,
  maintenanceMessage: 'Plateforme en maintenance programmée pour mise à niveau technique. Réouverture imminente.',

  artisanCommissionRate: 7,
  minArtisanCommissionFCFA: 1500,
  freeClientQuotes: true,
  realEstateBrokeragePercent: 5,
  realEstateMaxFeeMonths: 1,
  marketSellerCommissionRate: 4,
  minPayoutThresholdFCFA: 10000,

  waveMerchantPhone: '+221 77 862 88 38',
  waveEnabled: true,
  orangeMoneyMerchantCode: '#144#391# / +221 78 123 45 67',
  orangeMoneyEnabled: true,
  cashOnDeliveryEnabled: true,
  bankTransferEnabled: true,
  escrowHoldDurationHours: 48,

  requireManualListingApproval: false,
  requireKycForPros: true,
  maxReportsBeforeSuspension: 3,
  artisanGuaranteeHours: 72,
  marketReturnPeriodDays: 7,

  activeZones: {
    dakar: true,
    thies: true,
    mbour_saly: true,
    saint_louis: true,
    touba: true,
    ziguinchor: false
  },
  deliveryFeeDakarFCFA: 2000,
  deliveryFeeRegionsFCFA: 5000,
  emergencyDispatchRadiusKm: 15,

  smsAlertsOnUrgency: true,
  whatsappAutoConfirm: true,
  adminNewProAlertEmail: true,
  adminReportImmediateAlert: true
};

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshAll: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  onRefreshAll
}) => {
  const [adminTab, setAdminTab] = useState<'cyberdefense' | 'moderation' | 'settings'>('settings');
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalPros: number;
    totalServiceRequests: number;
    totalListings: number;
    totalProducts: number;
    totalOrders: number;
    totalReports: number;
    totalVolumeFCFA: number;
  } | null>(null);

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [prosList, setProsList] = useState<ProProfile[]>([]);
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [securityStatus, setSecurityStatus] = useState<CyberShieldStatus | null>(null);
  const [inspectProDoc, setInspectProDoc] = useState<ProProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Platform Settings State
  const [settings, setSettings] = useState<PlatformSettings>(() => {
    try {
      const saved = localStorage.getItem('amalfy_platform_settings');
      if (saved) return { ...DEFAULT_PLATFORM_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // Fallback
    }
    return DEFAULT_PLATFORM_SETTINGS;
  });

  const [settingsSubTab, setSettingsSubTab] = useState<
    'general' | 'commissions' | 'payments' | 'kyc' | 'zones' | 'notifications'
  >('general');
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);
  const [confirmResetSettings, setConfirmResetSettings] = useState(false);

  const handleSaveSettings = () => {
    try {
      localStorage.setItem('amalfy_platform_settings', JSON.stringify(settings));
      window.dispatchEvent(new CustomEvent('amalfy_settings_updated', { detail: settings }));
      setSettingsSavedToast(true);
      setTimeout(() => setSettingsSavedToast(false), 3500);
    } catch (err) {
      console.error('Erreur sauvegarde paramètres:', err);
    }
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_PLATFORM_SETTINGS);
    localStorage.setItem('amalfy_platform_settings', JSON.stringify(DEFAULT_PLATFORM_SETTINGS));
    window.dispatchEvent(new CustomEvent('amalfy_settings_updated', { detail: DEFAULT_PLATFORM_SETTINGS }));
    setConfirmResetSettings(false);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3500);
  };

  // Cyber defense simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedAttackType, setSimulatedAttackType] = useState<CyberAttackType>('xss');
  const [simulationToast, setSimulationToast] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const loadAdminData = async () => {
      setLoading(true);
      try {
        const [overview, reps, pros, vis, sec] = await Promise.all([
          api.getAdminOverview(),
          api.getAdminReports(),
          api.getPros(),
          api.getVisits(),
          api.getSecurityStatus().catch(() => null)
        ]);
        setStats(overview);
        setReports(reps);
        setProsList(pros);
        setVisits(vis || []);
        if (sec) setSecurityStatus(sec);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAdminData();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdateReport = async (id: string, status: 'traite' | 'rejete') => {
    try {
      await api.updateReportStatus(id, status);
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateVisit = async (id: string, status: string) => {
    try {
      await api.updateVisitStatus(id, status);
      setVisits((prev) => prev.map((v) => (v.id === id ? { ...v, status: status as any } : v)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetDefenseMode = async (mode: 'standard' | 'renforce' | 'verrouille') => {
    try {
      const updated = await api.setDefenseMode(mode);
      setSecurityStatus(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearSecurityLogs = async () => {
    try {
      const updated = await api.clearSecurityLogs();
      setSecurityStatus(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateAttack = async () => {
    setIsSimulating(true);
    try {
      const updated = await api.simulateAttack(simulatedAttackType);
      setSecurityStatus(updated);
      setSimulationToast(`Attaque simulée (${simulatedAttackType.toUpperCase()}) interceptée et bloquée avec succès par le bouclier !`);
      setTimeout(() => setSimulationToast(''), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetSeed = async () => {
    try {
      await api.resetSeedDatabase();
      setResetSuccess(true);
      setConfirmReset(false);
      onRefreshAll();
      setTimeout(() => setResetSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const attackLabels: Record<CyberAttackType, { name: string; desc: string; color: string }> = {
    xss: { name: 'Cross-Site Scripting (XSS)', desc: 'Injection de scripts malveillants & vol de session', color: 'bg-rose-100 text-rose-800 border-rose-200' },
    sql_injection: { name: 'Injection SQL (SQLi)', desc: 'Tentatives d’extraction ou corruption de données', color: 'bg-red-100 text-red-800 border-red-200' },
    nosql_injection: { name: 'Injection NoSQL', desc: 'Opérateurs d’évasion de filtres de données', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    path_traversal: { name: 'Path Traversal (LFI)', desc: 'Tentatives d’accès aux fichiers système (.env, /etc)', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    ddos_rate_limit: { name: 'DDoS & Brute Force', desc: 'Saturation de requêtes & attaques par force brute', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    scanner_probe: { name: 'Scanners & Bots', desc: 'Sondes automatiques de vulnérabilités (Nikto, Nuclei)', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    prototype_pollution: { name: 'Prototype Pollution', desc: 'Altération d’objets JavaScript & injection de privilèges', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    command_injection: { name: 'Injection Commandes (RCE)', desc: 'Exécution arbitraire de commandes shell système', color: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200' }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-4xl w-full max-h-[94vh] sm:max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AmalfyEmblem sizePx={40} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-base sm:text-lg text-slate-900">
                  Administration & Sécurité AMALFY
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                  🇸🇳 Sénégal
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Supervision opérationnelle et bouclier de cyberdéfense temps réel
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 pt-3 border-b border-slate-100 flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar bg-slate-50/50">
          <button
            onClick={() => setAdminTab('settings')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              adminTab === 'settings'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4 text-emerald-600" />
            <span>Paramètres Plateforme</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Opérations
            </span>
          </button>

          <button
            onClick={() => setAdminTab('cyberdefense')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              adminTab === 'cyberdefense'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            <span>Bouclier Cyberdéfense ({securityStatus?.totalAttacksBlocked || 149} Bloquées)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>

          <button
            onClick={() => setAdminTab('moderation')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              adminTab === 'moderation'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-slate-600" />
            <span>Supervision Plateforme & Modération</span>
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* ========================================================= */}
          {/* TAB 1: BOUCLIER CYBERDÉFENSE                              */}
          {/* ========================================================= */}
          {adminTab === 'cyberdefense' && (
            <div className="space-y-6">
              {/* Simulation feedback toast */}
              {simulationToast && (
                <div className="p-3.5 bg-emerald-500 text-white rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg shadow-emerald-500/20 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                    <span>{simulationToast}</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
                    STATUS 403 BLOCKED
                  </span>
                </div>
              )}

              {/* Master Defense Status Banner */}
              <div className="p-5 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl shadow-xl relative overflow-hidden border border-emerald-900/50">
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none"></div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-inner">
                      <Shield className="w-8 h-8 text-emerald-400 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-heading font-black text-base text-white">
                          Bouclier Anti-Cyberattaque AMALFY
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                          100% ACTIF & SÉCURISÉ
                        </span>
                      </div>
                      <p className="text-xs text-emerald-200/90 mt-1 max-w-xl leading-relaxed">
                        Pare-feu WAF en ligne • Anti-DDoS actif • Protection contre injections SQL/NoSQL, XSS, Path Traversal, Bot scanners & RCE.
                      </p>
                    </div>
                  </div>

                  {/* Mode switcher pills */}
                  <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                      Niveau de protection :
                    </span>
                    <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => handleSetDefenseMode('standard')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          securityStatus?.defenseMode === 'standard'
                            ? 'bg-emerald-500 text-slate-950 shadow-xs'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        Standard
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetDefenseMode('renforce')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          securityStatus?.defenseMode === 'renforce'
                            ? 'bg-amber-400 text-slate-950 shadow-xs'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        Renforcé
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetDefenseMode('verrouille')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          securityStatus?.defenseMode === 'verrouille'
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        Verrouillé
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub status row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 mt-4 border-t border-white/10 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Niveau de menace</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      {securityStatus?.threatLevel === 'faible' ? 'Faible (Normal)' : securityStatus?.threatLevel || 'Faible'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Attaques bloquées</span>
                    <span className="font-mono font-black text-white text-sm">
                      {securityStatus?.totalAttacksBlocked || 149} tentatives
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">IPs mises en quarantaine</span>
                    <span className="font-mono font-bold text-amber-300">
                      {securityStatus?.activeBannedIpsCount || 0} active(s)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Inspection Headers</span>
                    <span className="font-bold text-emerald-300">OWASP Hardened ✓</span>
                  </div>
                </div>
              </div>

              {/* 8 Defense Pillars Metrics Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span>Compteurs des Cyberattaques Neutralisées par Catégorie</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">Temps réel</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(Object.keys(attackLabels) as CyberAttackType[]).map((key) => {
                    const info = attackLabels[key];
                    const count = securityStatus?.blockedByType?.[key] ?? 0;
                    return (
                      <div
                        key={key}
                        className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 transition-colors space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-600 uppercase truncate" title={info.name}>
                            {info.name.split('(')[0]}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-black border ${info.color}`}>
                            BLOQUÉ
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <div className="font-heading font-black text-xl text-slate-900">{count}</div>
                          <span className="text-[10px] text-slate-400">attaques</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">
                          {info.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Attack Simulator & Test Tool */}
              <div className="p-4 sm:p-5 bg-slate-900 text-white rounded-3xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-emerald-400" />
                    <h5 className="font-bold text-xs sm:text-sm text-white">
                      Simulateur & Test d'Intrusion en Direct
                    </h5>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Permet de tester et de vérifier la réaction instantanée du pare-feu
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  <select
                    value={simulatedAttackType}
                    onChange={(e) => setSimulatedAttackType(e.target.value as CyberAttackType)}
                    className="w-full sm:w-auto flex-1 px-3 py-2 bg-slate-800 rounded-xl border border-slate-700 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="xss">Test Cross-Site Scripting (XSS Payload)</option>
                    <option value="sql_injection">Test Injection SQL (SQLi UNION SELECT)</option>
                    <option value="path_traversal">Test Path Traversal (LFI ../../etc/passwd)</option>
                    <option value="scanner_probe">Test Scanner Probe (Recherche .env / .git)</option>
                    <option value="ddos_rate_limit">Test DDoS & Rafale de requêtes</option>
                    <option value="prototype_pollution">Test Prototype Pollution (__proto__)</option>
                    <option value="command_injection">Test Injection Commande Shell (RCE)</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleSimulateAttack}
                    disabled={isSimulating}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
                  >
                    {isSimulating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Simulation...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Lancer l'attaque test</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Real-time Threat Audit Log */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-slate-700" />
                    <span>Journal d’Audit des Menaces Récemment Interceptées</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleClearSecurityLogs}
                    className="text-[11px] text-slate-400 hover:text-slate-600 font-semibold"
                  >
                    Effacer le journal
                  </button>
                </div>

                {(!securityStatus?.recentEvents || securityStatus.recentEvents.length === 0) ? (
                  <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                    Aucune menace détectée. Le système est totalement serein.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {securityStatus.recentEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[10px] text-slate-400">
                              {new Date(evt.timestamp).toLocaleTimeString('fr-FR')}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-200">
                              {evt.threatType.replace('_', ' ')}
                            </span>
                            <span className="font-mono text-[10px] text-slate-600 font-bold bg-white px-1.5 py-0.2 rounded-md border border-slate-200">
                              IP: {evt.ip}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {evt.method} {evt.path}
                            </span>
                          </div>
                          <p className="text-slate-700 font-mono text-[11px] bg-white p-1.5 rounded-lg border border-slate-100 truncate">
                            {evt.payloadSummary}
                          </p>
                        </div>

                        <span className="shrink-0 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center gap-1 self-start sm:self-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>NEUTRALISÉ</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Protective Layers Summary */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs space-y-2">
                <h5 className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Détail des protections actives contre tous les types de cyberattaques :</span>
                </h5>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 text-[11px]">
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Anti-DDoS & Rate Limiting :</strong> Quotas stricts par IP</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Pare-feu WAF Applicatif :</strong> Détection sémantique des attaques</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Nettoyage automatique XSS :</strong> Désinfection des entrées HTML</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Anti-Injection SQL/NoSQL :</strong> Blocage de commandes malveillantes</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Anti-Path Traversal :</strong> Interdiction de lecture des fichiers système</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Headers OWASP :</strong> Masquage serveur & NoSniff activés</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: MODÉRATION & DONNÉES GLOBALES                      */}
          {/* ========================================================= */}
          {adminTab === 'moderation' && (
            <div className="space-y-6">
              {/* Global Stats Grid */}
              {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-[10px] uppercase font-bold">Utilisateurs</span>
                      <Users className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="font-heading font-black text-xl text-slate-900">{stats.totalUsers}</div>
                  </div>

                  <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                    <div className="flex items-center justify-between text-emerald-700 mb-1">
                      <span className="text-[10px] uppercase font-bold">Artisans Pro</span>
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div className="font-heading font-black text-xl text-emerald-900">{stats.totalPros}</div>
                  </div>

                  <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <div className="flex items-center justify-between text-blue-700 mb-1">
                      <span className="text-[10px] uppercase font-bold">Biens Immo</span>
                      <Home className="w-4 h-4" />
                    </div>
                    <div className="font-heading font-black text-xl text-blue-900">{stats.totalListings}</div>
                  </div>

                  <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100">
                    <div className="flex items-center justify-between text-amber-700 mb-1">
                      <span className="text-[10px] uppercase font-bold">Volume Ventes</span>
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div className="font-heading font-black text-base text-amber-900">
                      {formatFCFA(stats.totalVolumeFCFA)}
                    </div>
                  </div>
                </div>
              )}

              {/* KYC & Identity Verification Monitoring */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Vérification d’Identité des Comptes PRO (KYC Sénégal)</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">{prosList.length} artisans audités</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {prosList.map((pro) => (
                    <div key={pro.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={pro.user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                            alt={pro.user?.name}
                            className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/40"
                          />
                          <div>
                            <h5 className="font-bold text-slate-900 leading-tight">{pro.user?.name || 'Artisan AMALFY'}</h5>
                            <p className="text-[11px] text-slate-500">{pro.profession} • {pro.city}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Certifié
                        </span>
                      </div>

                      <div className="p-2 bg-white rounded-xl border border-slate-100 text-[11px] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Document :</span>
                          <span className="font-bold text-slate-700">
                            {pro.identityDocument?.type === 'Passeport' ? 'Passeport Sénégal' : 'CNI CEDEAO Sénégal'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">N° Officiel :</span>
                          <span className="font-mono font-bold text-slate-800">
                            {pro.identityDocument?.documentNumber || '1 751 1991 03822'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setInspectProDoc(pro)}
                        className="w-full py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Examiner la pièce d'identité</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real Estate Visits Section */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Home className="w-4 h-4 text-blue-500" />
                  <span>Demandes de Visites Immobilières ({visits.length})</span>
                </h4>

                {visits.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Aucune demande de visite enregistrée.</p>
                ) : (
                  <div className="space-y-2">
                    {visits.slice(0, 6).map((v) => (
                      <div
                        key={v.id}
                        className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{v.listingTitle}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                v.status === 'confirmee'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : v.status === 'annulee'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {v.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px]">
                            Demandeur : <strong>{v.userName}</strong> ({v.userPhone}) • Date :{' '}
                            {v.preferredDate ? new Date(v.preferredDate).toLocaleDateString('fr-FR') : 'Non précisée'} à {v.preferredTime || '15:00'}
                          </p>
                          {v.message && <p className="text-slate-600 text-[11px] italic">« {v.message} »</p>}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {v.status === 'en_attente' && (
                            <>
                              <button
                                onClick={() => handleUpdateVisit(v.id, 'confirmee')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Confirmer</span>
                              </button>
                              <button
                                onClick={() => handleUpdateVisit(v.id, 'annulee')}
                                className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1"
                              >
                                <Ban className="w-3 h-3" />
                                <span>Annuler</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reports & Moderation Section */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Signalements Utilisateurs ({reports.length})</span>
                </h4>

                {reports.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Aucun signalement non traité.</p>
                ) : (
                  <div className="space-y-2">
                    {reports.map((rep) => (
                      <div
                        key={rep.id}
                        className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{rep.targetTitle}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              {rep.reason}
                            </span>
                          </div>
                          {rep.details && <p className="text-slate-600 text-[11px]">« {rep.details} »</p>}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {rep.status === 'ouvert' ? (
                            <>
                              <button
                                onClick={() => handleUpdateReport(rep.id, 'traite')}
                                className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700"
                              >
                                Traité
                              </button>
                              <button
                                onClick={() => handleUpdateReport(rep.id, 'rejete')}
                                className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold hover:bg-slate-300"
                              >
                                Rejeter
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-500 uppercase">
                              {rep.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions & Seed Reset */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-800">Données de démonstration</p>
                  <p className="text-[11px] text-slate-400">
                    Réinitialise la base de données avec des profils, annonces et biens sénégalais vérifiés.
                  </p>
                </div>

                {confirmReset ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetSeed}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                    >
                      Confirmer la réinitialisation
                    </button>
                    <button
                      onClick={() => setConfirmReset(false)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmReset(true)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-400 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{resetSuccess ? 'Réinitialisé !' : 'Réinitialiser démo'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: PARAMÈTRES PLATEFORME                              */}
          {/* ========================================================= */}
          {adminTab === 'settings' && (
            <div className="space-y-6">
              {/* Toast Feedback */}
              {settingsSavedToast && (
                <div className="p-4 bg-emerald-600 text-white rounded-2xl text-xs font-bold flex items-center justify-between shadow-xl shadow-emerald-600/20 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-200" />
                    <span>Paramètres AMALFY mis à jour et enregistrés avec succès ! Nouveaux taux, plafonds et passerelles immédiatement actifs.</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2.5 py-1 rounded-full font-mono uppercase tracking-wider">
                    CONFIG ACTIVE
                  </span>
                </div>
              )}

              {/* Master Settings Header Card */}
              <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl shadow-xl relative overflow-hidden border border-slate-700/60">
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none"></div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-13 h-13 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-inner">
                      <Sliders className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-heading font-black text-base text-white">
                          Configuration & Paramètres Généraux
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                          Sénégal (FCFA)
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                        Ajustez les commissions d'artisans, passerelles Wave & Orange Money, séquestre chantiers, conformité KYC et zones territoriales.
                      </p>
                    </div>
                  </div>

                  {/* Actions Header Bar */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
                    >
                      <Save className="w-4 h-4" />
                      <span>Enregistrer</span>
                    </button>
                    {confirmResetSettings ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleResetSettings}
                          className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                        >
                          Confirmer
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmResetSettings(false)}
                          className="px-2.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-xl"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmResetSettings(true)}
                        className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                        title="Restaurer les valeurs d'usine recommandées"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Défauts</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Settings Sub-Tab Navigation Bar */}
              <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar">
                {[
                  { id: 'general', label: 'Général & Support', icon: Globe },
                  { id: 'commissions', label: 'Commissions & Tarifs', icon: Percent },
                  { id: 'payments', label: 'Paiements & Séquestre', icon: CreditCard },
                  { id: 'kyc', label: 'Conformité & KYC', icon: ShieldCheck },
                  { id: 'zones', label: 'Zones & Logistique', icon: Truck },
                  { id: 'notifications', label: 'Alertes & Messages', icon: Bell }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = settingsSubTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSettingsSubTab(tab.id as any)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* ========================================================= */}
              {/* SUB-TAB 1: GÉNÉRAL & SUPPORT                              */}
              {/* ========================================================= */}
              {settingsSubTab === 'general' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h5 className="font-heading font-black text-sm text-slate-900 flex items-center gap-2">
                          <Globe className="w-4 h-4 text-emerald-600" />
                          <span>Identité & Coordonnées Officielles AMALFY</span>
                        </h5>
                        <p className="text-xs text-slate-500">
                          Informations visibles publiquement sur la bannière, le footer et le support WhatsApp.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nom de la plateforme
                        </label>
                        <input
                          type="text"
                          value={settings.platformName}
                          onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Slogan / Devise
                        </label>
                        <input
                          type="text"
                          value={settings.platformSlogan}
                          onChange={(e) => setSettings({ ...settings, platformSlogan: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Numéro Téléphone Standard (Support Appel)
                        </label>
                        <div className="relative">
                          <PhoneCall className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            value={settings.supportPhone}
                            onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Numéro WhatsApp Service Client
                        </label>
                        <div className="relative">
                          <Smartphone className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            value={settings.supportWhatsapp}
                            onChange={(e) => setSettings({ ...settings, supportWhatsapp: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Email Officiel Support & Litiges
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="email"
                            value={settings.supportEmail}
                            onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Horaires d'ouverture du support
                        </label>
                        <div className="relative">
                          <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            value={settings.supportHours}
                            onChange={(e) => setSettings({ ...settings, supportHours: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Hotline Urgences & Dispatch Artisans SOS 24/7
                        </label>
                        <input
                          type="text"
                          value={settings.emergencyDispatchPhone}
                          onChange={(e) => setSettings({ ...settings, emergencyDispatchPhone: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-rose-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Maintenance Mode Card */}
                  <div className={`p-5 rounded-2xl border transition-all ${
                    settings.maintenanceMode ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                          settings.maintenanceMode ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <h6 className="font-bold text-sm text-slate-900">
                            Mode Maintenance de la Plateforme
                          </h6>
                          <p className="text-xs text-slate-500">
                            Suspend temporairement les réservations de chantiers et commandes de matériaux pour maintenance serveur.
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.maintenanceMode}
                          onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>

                    {settings.maintenanceMode && (
                      <div className="mt-4 pt-3 border-t border-amber-200 space-y-2">
                        <label className="block text-xs font-bold text-amber-900">
                          Message affiché aux utilisateurs pendant la maintenance :
                        </label>
                        <textarea
                          rows={2}
                          value={settings.maintenanceMessage}
                          onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                          className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SUB-TAB 2: COMMISSIONS & MONÉTISATION                     */}
              {/* ========================================================= */}
              {settingsSubTab === 'commissions' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Artisans Commission */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-emerald-600" />
                          <h6 className="font-heading font-black text-sm text-slate-900">
                            Commissions Services & Artisans
                          </h6>
                        </div>
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          {settings.artisanCommissionRate}%
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                            <span>Taux de commission prélevé sur le devis validé</span>
                            <span className="text-emerald-700">{settings.artisanCommissionRate}%</span>
                          </div>
                          <input
                            type="range"
                            min="3"
                            max="15"
                            step="0.5"
                            value={settings.artisanCommissionRate}
                            onChange={(e) => setSettings({ ...settings, artisanCommissionRate: parseFloat(e.target.value) })}
                            className="w-full accent-emerald-600 cursor-pointer"
                          />
                          <p className="text-[11px] text-slate-400 mt-1">
                            Recommandé pour le Sénégal : 5% à 8% pour garantir l'adhésion des artisans.
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Commission minimale forfaitaire (FCFA)
                          </label>
                          <input
                            type="number"
                            min="500"
                            step="500"
                            value={settings.minArtisanCommissionFCFA}
                            onChange={(e) => setSettings({ ...settings, minArtisanCommissionFCFA: parseInt(e.target.value) || 0 })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Devis 100% gratuit pour particuliers</span>
                            <span className="text-[11px] text-slate-500">Aucun frais d'intermédiation facturé au client</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.freeClientQuotes}
                            onChange={(e) => setSettings({ ...settings, freeClientQuotes: e.target.checked })}
                            className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Immobilier & Marketplace */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-blue-600" />
                          <h6 className="font-heading font-black text-sm text-slate-900">
                            Immobilier & Marketplace
                          </h6>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Commission courtage immobilier (%)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={settings.realEstateBrokeragePercent}
                            onChange={(e) => setSettings({ ...settings, realEstateBrokeragePercent: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
                          />
                          <p className="text-[11px] text-slate-400 mt-1">
                            Standard agences Dakar : 5% sur vente ou 1 mois de loyer.
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Commission marchands Market Quincaillerie (%)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={settings.marketSellerCommissionRate}
                            onChange={(e) => setSettings({ ...settings, marketSellerCommissionRate: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Seuil minimal de virement / décaissement artisan (FCFA)
                          </label>
                          <input
                            type="number"
                            min="2000"
                            step="1000"
                            value={settings.minPayoutThresholdFCFA}
                            onChange={(e) => setSettings({ ...settings, minPayoutThresholdFCFA: parseInt(e.target.value) || 0 })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Commission Simulator */}
                  <div className="p-5 bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-2xl border border-emerald-200/80">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-emerald-700" />
                      <h6 className="font-heading font-black text-sm text-emerald-950">
                        Simulateur de Répartition en Direct (Exemple Chantier 50 000 FCFA)
                      </h6>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Montant Facturé Client
                        </span>
                        <span className="text-base font-heading font-black text-slate-900">
                          {formatFCFA(50000)}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                          Devis gratuit • 0 FCFA de frais client
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Part Nette Artisan ({100 - settings.artisanCommissionRate}%)
                        </span>
                        <span className="text-base font-heading font-black text-emerald-700">
                          {formatFCFA(Math.round(50000 * (1 - settings.artisanCommissionRate / 100)))}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Versé par Wave/OM après 48h
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Commission AMALFY ({settings.artisanCommissionRate}%)
                        </span>
                        <span className="text-base font-heading font-black text-slate-900">
                          {formatFCFA(Math.max(settings.minArtisanCommissionFCFA, Math.round(50000 * (settings.artisanCommissionRate / 100))))}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Min. garanti : {formatFCFA(settings.minArtisanCommissionFCFA)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SUB-TAB 3: PAIEMENTS & SÉQUESTRE                          */}
              {/* ========================================================= */}
              {settingsSubTab === 'payments' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h5 className="font-heading font-black text-sm text-slate-900 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-emerald-600" />
                          <span>Passerelles de Paiement Sénégal & Comptes Marchands</span>
                        </h5>
                        <p className="text-xs text-slate-500">
                          Activez et configurez les moyens de paiement acceptés pour les acomptes chantiers et quincaillerie.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Wave Sénégal */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black text-base shadow-xs">
                            W
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900">Wave Sénégal</span>
                              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                                0% frais client
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">Paiement QR Code instantané & Deep Link</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            placeholder="+221 XX XXX XX XX"
                            value={settings.waveMerchantPhone}
                            onChange={(e) => setSettings({ ...settings, waveMerchantPhone: e.target.value })}
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900"
                          />
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.waveEnabled}
                              onChange={(e) => setSettings({ ...settings, waveEnabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>

                      {/* Orange Money Sénégal */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-base shadow-xs">
                            OM
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900">Orange Money Sénégal</span>
                              <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full">
                                Code Marchand
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">Paiement USSD et via application Orange Money</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            placeholder="Code Marchand ou N°"
                            value={settings.orangeMoneyMerchantCode}
                            onChange={(e) => setSettings({ ...settings, orangeMoneyMerchantCode: e.target.value })}
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900"
                          />
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.orangeMoneyEnabled}
                              onChange={(e) => setSettings({ ...settings, orangeMoneyEnabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                          </label>
                        </div>
                      </div>

                      {/* Espèces à la livraison / Fin de chantier */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                            <DollarSign className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-sm text-slate-900 block">Paiement Espèces (Livraison / Fin de travaux)</span>
                            <span className="text-xs text-slate-500">Règlement en mains propres à l'artisan ou livreur après vérification</span>
                          </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.cashOnDeliveryEnabled}
                            onChange={(e) => setSettings({ ...settings, cashOnDeliveryEnabled: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>

                      {/* Virement bancaire / Wari */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-sm text-slate-900 block">Virement Bancaire (Grosses transactions / Immo)</span>
                            <span className="text-xs text-slate-500">RIB BOA, CBAO, Ecobank ou Société Générale Sénégal</span>
                          </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.bankTransferEnabled}
                            onChange={(e) => setSettings({ ...settings, bankTransferEnabled: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Séquestre Garanti AMALFY */}
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-600" />
                      <h6 className="font-heading font-black text-sm text-slate-900">
                        Système de Séquestre Garanti (AMALFY Escrow)
                      </h6>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      L'acompte client est consigné de façon inviolable sur le compte de transit AMALFY. L'artisan ne reçoit son solde qu'après validation de l'achèvement et expiration du délai de recours.
                    </p>

                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          Délai de consignation / recours avant décaissement final
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Période durant laquelle le client peut signaler une anomalie avant virement définitif
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="12"
                          max="168"
                          step="12"
                          value={settings.escrowHoldDurationHours}
                          onChange={(e) => setSettings({ ...settings, escrowHoldDurationHours: parseInt(e.target.value) || 24 })}
                          className="w-20 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 text-center"
                        />
                        <span className="text-xs font-bold text-slate-600">heures</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SUB-TAB 4: CONFORMITÉ & KYC                               */}
              {/* ========================================================= */}
              {settingsSubTab === 'kyc' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h5 className="font-heading font-black text-sm text-slate-900 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Règles de Modération & Conformité KYC Sénégal</span>
                        </h5>
                        <p className="text-xs text-slate-500">
                          Sécurisation de la communauté, vérification d'identité officielle et garanties légales de réintervention.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            Audit CNI CEDEAO / Passeport obligatoire pour les artisans
                          </span>
                          <span className="text-xs text-slate-500">
                            Un pro non vérifié ne peut pas recevoir de paiements séquestrés ni le badge « Pro Vérifié »
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.requireKycForPros}
                          onChange={(e) => setSettings({ ...settings, requireKycForPros: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            Validation manuelle préalable des annonces immo & market
                          </span>
                          <span className="text-xs text-slate-500">
                            Les biens et matériaux doivent être approuvés par un admin avant d'apparaître en ligne
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.requireManualListingApproval}
                          onChange={(e) => setSettings({ ...settings, requireManualListingApproval: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Seuil signalements avant suspension
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={settings.maxReportsBeforeSuspension}
                              onChange={(e) => setSettings({ ...settings, maxReportsBeforeSuspension: parseInt(e.target.value) || 1 })}
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900"
                            />
                            <span className="text-[11px] text-slate-500 whitespace-nowrap">plaintes</span>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Garantie réintervention artisan
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="24"
                              max="168"
                              step="24"
                              value={settings.artisanGuaranteeHours}
                              onChange={(e) => setSettings({ ...settings, artisanGuaranteeHours: parseInt(e.target.value) || 24 })}
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900"
                            />
                            <span className="text-[11px] text-slate-500 whitespace-nowrap">heures (72h)</span>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Délai retour produit Market
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              max="30"
                              value={settings.marketReturnPeriodDays}
                              onChange={(e) => setSettings({ ...settings, marketReturnPeriodDays: parseInt(e.target.value) || 1 })}
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900"
                            />
                            <span className="text-[11px] text-slate-500 whitespace-nowrap">jours</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SUB-TAB 5: ZONES & LOGISTIQUE                             */}
              {/* ========================================================= */}
              {settingsSubTab === 'zones' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h5 className="font-heading font-black text-sm text-slate-900 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          <span>Zones Géographiques & Couverture Territoriale Sénégal</span>
                        </h5>
                        <p className="text-xs text-slate-500">
                          Activez les régions où AMALFY déploie ses artisans et livre les matériaux.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { key: 'dakar', name: 'Région de Dakar', desc: 'Plateau, Almadies, Parcelles, Guédiawaye, Rufisque' },
                        { key: 'thies', name: 'Région de Thiès', desc: 'Thiès Ville, Tivaouane, Pout, Diamniadio' },
                        { key: 'mbour_saly', name: 'Mbour & Petite Côte', desc: 'Saly Portudal, Somone, Ngaparou, Popenguine' },
                        { key: 'saint_louis', name: 'Saint-Louis', desc: 'Ndar, Sor, Vallée du Fleuve' },
                        { key: 'touba', name: 'Touba & Mbacké', desc: 'Bassin arachidier & agglomération' },
                        { key: 'ziguinchor', name: 'Ziguinchor & Sud', desc: 'Casamance, Cap Skirring' }
                      ].map((zone) => {
                        const isChecked = (settings.activeZones as any)[zone.key];
                        return (
                          <div
                            key={zone.key}
                            onClick={() =>
                              setSettings({
                                ...settings,
                                activeZones: {
                                  ...settings.activeZones,
                                  [zone.key]: !isChecked
                                }
                              })
                            }
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs'
                                : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs text-slate-900">{zone.name}</span>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 pointer-events-none"
                              />
                            </div>
                            <p className="text-[11px] text-slate-500 leading-tight">{zone.desc}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Tarifs de livraison et rayon */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Forfait livraison standard Dakar
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="500"
                            value={settings.deliveryFeeDakarFCFA}
                            onChange={(e) => setSettings({ ...settings, deliveryFeeDakarFCFA: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900"
                          />
                          <span className="text-xs font-bold text-slate-500">FCFA</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Forfait livraison Régions
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="500"
                            value={settings.deliveryFeeRegionsFCFA}
                            onChange={(e) => setSettings({ ...settings, deliveryFeeRegionsFCFA: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900"
                          />
                          <span className="text-xs font-bold text-slate-500">FCFA</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Rayon max dispatch SOS Urgences
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="5"
                            max="50"
                            value={settings.emergencyDispatchRadiusKm}
                            onChange={(e) => setSettings({ ...settings, emergencyDispatchRadiusKm: parseInt(e.target.value) || 5 })}
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900"
                          />
                          <span className="text-xs font-bold text-slate-500">km</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SUB-TAB 6: NOTIFICATIONS & ALERTES                        */}
              {/* ========================================================= */}
              {settingsSubTab === 'notifications' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h5 className="font-heading font-black text-sm text-slate-900 flex items-center gap-2">
                          <Bell className="w-4 h-4 text-emerald-600" />
                          <span>Canaux de Notification & Alertes Automatiques</span>
                        </h5>
                        <p className="text-xs text-slate-500">
                          Gestion des alertes instantanées par SMS, WhatsApp et emails administratifs.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                            <PhoneCall className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              Envoi SMS prioritaire lors d'une demande SOS Urgence
                            </span>
                            <span className="text-xs text-slate-500">
                              Notification instantanée aux 3 artisans les plus proches
                            </span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.smsAlertsOnUrgency}
                          onChange={(e) => setSettings({ ...settings, smsAlertsOnUrgency: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                            <Smartphone className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              Confirmation automatique par message WhatsApp
                            </span>
                            <span className="text-xs text-slate-500">
                              Envoi du lien de suivi chantier et récapitulatif devis
                            </span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.whatsappAutoConfirm}
                          onChange={(e) => setSettings({ ...settings, whatsappAutoConfirm: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              Alerte email administrateur pour chaque nouveau profil PRO
                            </span>
                            <span className="text-xs text-slate-500">
                              Notifie {settings.supportEmail} avec lien direct pour vérification CNI
                            </span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.adminNewProAlertEmail}
                          onChange={(e) => setSettings({ ...settings, adminNewProAlertEmail: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              Alerte immédiate lors d'un signalement d'abus ou litige
                            </span>
                            <span className="text-xs text-slate-500">
                              Déclenche une notification haute priorité dans le panneau de supervision
                            </span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.adminReportImmediateAlert}
                          onChange={(e) => setSettings({ ...settings, adminReportImmediateAlert: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Sticky Action Bar */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs text-slate-300">
                    Configuration active AMALFY Sénégal • Synchronisée localement
                  </span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  {confirmResetSettings ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetSettings}
                        className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                      >
                        Confirmer réinitialisation
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmResetSettings(false)}
                        className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-xl"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmResetSettings(true)}
                      className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Réinitialiser aux valeurs d'usine</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    <span>Enregistrer tous les paramètres</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* INSPECT PRO IDENTITY MODAL FOR ADMIN */}
      {inspectProDoc && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-heading font-black text-sm text-white flex items-center gap-2">
                    <span>Modération Pièce d'Identité PRO</span>
                    <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                      ADMIN
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Contrôle des justificatifs d'identité officiels
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectProDoc(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <img
                  src={inspectProDoc.user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                  alt={inspectProDoc.user?.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/40"
                />
                <div>
                  <h5 className="font-bold text-slate-900 text-base">{inspectProDoc.user?.name}</h5>
                  <p className="text-xs text-slate-500">{inspectProDoc.profession} • {inspectProDoc.city}</p>
                  <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Statut : Pièce d'identité validée conforme</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Type document</span>
                  <span className="font-bold text-slate-800">
                    {inspectProDoc.identityDocument?.type === 'Passeport' ? 'Passeport Sénégal' : 'CNI CEDEAO Sénégal'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Numéro officiel</span>
                  <span className="font-mono font-bold text-slate-900">
                    {inspectProDoc.identityDocument?.documentNumber || '1 751 1991 03822'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Date de délivrance</span>
                  <span className="font-bold text-slate-800">
                    {inspectProDoc.identityDocument?.deliveryDate || '20/07/2020'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Date d'expiration</span>
                  <span className="font-bold text-slate-800">
                    {inspectProDoc.identityDocument?.expirationDate || '20/07/2030'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h6 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Aperçu des scans officiels
                </h6>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[11px] font-bold text-slate-600 mb-1">Scan Recto</span>
                    <div className="h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={inspectProDoc.identityDocument?.frontImageUrl || 'https://images.unsplash.com/photo-1633265486064-086b219458ec?auto=format&fit=crop&w=800&q=80'}
                        alt="Scan Recto"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-slate-600 mb-1">Scan Verso</span>
                    <div className="h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={inspectProDoc.identityDocument?.backImageUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80'}
                        alt="Scan Verso"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectProDoc(null)}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Fermer l'examen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
