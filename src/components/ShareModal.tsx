import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Share2, MessageCircle, ExternalLink, Globe, QrCode, Download, ArrowLeft, RefreshCw } from 'lucide-react';
import QRCode from 'qrcode';
import { formatFCFA } from '../utils/helpers.js';

export interface ShareItemData {
  id: string;
  title: string;
  price?: number;
  city: string;
  quarter?: string;
  image?: string;
  categoryOrType?: string;
  module: 'market' | 'real-estate' | 'services';
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ShareItemData | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, item }) => {
  const [copied, setCopied] = useState(false);
  const [showQrView, setShowQrView] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);

  if (!isOpen || !item) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://amalfy.sn';
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const shareUrl = `${currentOrigin}${currentPath}?tab=${item.module}&id=${item.id}`;

  const priceText = item.price ? ` - ${formatFCFA(item.price)}` : '';
  const locationText = item.quarter ? `${item.quarter}, ${item.city}` : item.city;

  const shareTitle = `${item.title}${priceText} sur AMALFY Sénégal`;
  const shareMessage = `Regarde cette offre sur AMALFY : *${item.title}*${priceText} (${locationText}).\nConsulte l'annonce ici : ${shareUrl}`;

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareTitle)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Erreur lors de la copie du lien:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: `Découvre "${item.title}" sur AMALFY Sénégal`,
          url: shareUrl
        });
      } catch {
        // User cancelled or share failed
      }
    }
  };

  const handleGenerateQr = async () => {
    setIsGeneratingQr(true);
    try {
      const url = await QRCode.toDataURL(shareUrl, {
        width: 280,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(url);
      setShowQrView(true);
    } catch (err) {
      console.error('Erreur génération QR Code:', err);
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const handleDownloadQr = () => {
    if (!qrCodeUrl) return;
    const a = document.createElement('a');
    a.href = qrCodeUrl;
    a.download = `qr-amalfy-${item.module}-${item.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base text-slate-900">
                Partager cette annonce
              </h3>
              <p className="text-[11px] text-slate-500">
                Diffusez l'offre sur vos réseaux préférés
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Preview Card */}
        <div className="my-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
          {item.image && (
            <img
              src={item.image}
              alt={item.title}
              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
            />
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{item.title}</h4>
            {item.price !== undefined && (
              <p className="font-heading font-extrabold text-xs text-emerald-700 mt-0.5">
                {formatFCFA(item.price)}
              </p>
            )}
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
              {locationText} • {item.module === 'market' ? 'AMALFY Market' : item.module === 'real-estate' ? 'AMALFY Immobilier' : 'AMALFY Services'}
            </p>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="space-y-2.5">
          {/* WhatsApp Direct Share Button */}
          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-3 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-between shadow-sm transition-all active:scale-98 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
                <WhatsAppIcon className="w-4.5 h-4.5 fill-white" />
              </div>
              <span>Partager sur WhatsApp</span>
            </div>
            <ExternalLink className="w-4 h-4 opacity-75 group-hover:opacity-100" />
          </a>

          {/* Facebook Share Button */}
          <a
            href={facebookShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-3 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs flex items-center justify-between shadow-sm transition-all active:scale-98 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
                <FacebookIcon className="w-4.5 h-4.5 fill-white" />
              </div>
              <span>Partager sur Facebook</span>
            </div>
            <ExternalLink className="w-4 h-4 opacity-75 group-hover:opacity-100" />
          </a>

          {/* Twitter / X Share Button */}
          <a
            href={twitterShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-3 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-between shadow-sm transition-all active:scale-98 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
                <TwitterXIcon className="w-4 h-4 fill-white" />
              </div>
              <span>Partager sur X (Twitter)</span>
            </div>
            <ExternalLink className="w-4 h-4 opacity-75 group-hover:opacity-100" />
          </a>

          {/* QR Code Scan Option */}
          <button
            type="button"
            onClick={handleGenerateQr}
            disabled={isGeneratingQr}
            className="w-full p-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-between border border-slate-200 shadow-2xs transition-all active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center">
                {isGeneratingQr ? (
                  <RefreshCw className="w-4 h-4 text-slate-700 animate-spin" />
                ) : (
                  <QrCode className="w-4 h-4 text-slate-700" />
                )}
              </div>
              <span>{isGeneratingQr ? 'Génération du QR Code...' : 'Générer QR Code (Scanner depuis mobile)'}</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
              Mobile
            </span>
          </button>

          {/* Mobile Native Share Sheet (if supported) */}
          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
            <button
              onClick={handleNativeShare}
              className="w-full p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-between border border-emerald-200 transition-all active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-emerald-600/10 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-emerald-700" />
                </div>
                <span>Autres applications (Partage système)</span>
              </div>
              <Share2 className="w-4 h-4 text-emerald-600" />
            </button>
          )}
        </div>

        {/* QR Code Presentation Overlay if active */}
        {showQrView && (
          <div className="mt-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-emerald-600" />
                QR Code de l'annonce
              </span>
              <button
                onClick={() => setShowQrView(false)}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-200"
              >
                Masquer
              </button>
            </div>
            <div className="flex flex-col items-center">
              {qrCodeUrl && (
                <div className="bg-white p-2 rounded-xl shadow-xs border border-slate-200 mb-2">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code Annonce"
                    className="w-44 h-44 object-contain"
                  />
                </div>
              )}
              <p className="text-[11px] text-slate-500 text-center max-w-[240px] mb-3">
                Scannez avec un appareil photo pour afficher l'annonce directement sur smartphone.
              </p>
              <button
                onClick={handleDownloadQr}
                className="py-1.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger l'image QR</span>
              </button>
            </div>
          </div>
        )}

        {/* Copy Link Section */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Copier le lien direct
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-mono truncate select-all">
              {shareUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copier</span>
                </>
              )}
            </button>
          </div>

          {copied && (
            <p className="text-[11px] font-bold text-emerald-600 mt-2 text-center animate-in fade-in">
              ✓ Lien copié dans le presse-papier avec succès !
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TwitterXIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
