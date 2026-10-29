import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Phone
} from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { formatFCFA, buildWhatsAppLink } from '../utils/helpers.js';
import { api } from '../services/api.js';
import { DeliveryOption, PaymentMethod, Order } from '../types/index.js';
import { SafeImage } from './SafeImage.js';

export const CartDrawer: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, isCartOpen, setIsCartOpen, subtotal } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>('express_dakar');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave');

  // Customer Delivery Info
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+221 77 800 12 34');
  const [customerWhatsapp, setCustomerWhatsapp] = useState(user?.whatsappNumber || '+221778001234');
  const [deliveryCity, setDeliveryCity] = useState(user?.city || 'Dakar');
  const [deliveryQuarter, setDeliveryQuarter] = useState(user?.quarter || 'Almadies');
  const [deliveryAddress, setDeliveryAddress] = useState('Villa 12, près de la pharmacie');
  const [orderNotes, setOrderNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [checkoutError, setCheckoutError] = useState('');

  if (!isCartOpen) return null;

  const deliveryFee =
    deliveryOption === 'express_dakar' ? 3000 : deliveryOption === 'standard_senegal' ? 4500 : 0;
  const totalAmount = subtotal + deliveryFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setCheckoutError('');
    try {
      const order = await api.placeOrder({
        customerId: user?.id || 'usr_guest',
        customerName,
        customerPhone,
        customerWhatsapp,
        deliveryCity,
        deliveryQuarter,
        deliveryAddress,
        deliveryOption,
        deliveryFee,
        paymentMethod,
        items: cart,
        notes: orderNotes
      });
      setPlacedOrder(order);
      clearCart();
      setStep('success');
    } catch (err: any) {
      setCheckoutError(err.message || 'Erreur lors de la validation de commande');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setIsCartOpen(false);
    setStep('cart');
    setPlacedOrder(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base text-slate-900">
                {step === 'cart' && 'Mon Panier'}
                {step === 'checkout' && 'Livraison & Paiement'}
                {step === 'success' && 'Confirmation de commande'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {step === 'cart' && `${cart.length} article(s)`}
                {step === 'checkout' && 'Sénégal (Dakar et Régions)'}
                {step === 'success' && `Commande #${placedOrder?.id.slice(-6)}`}
              </p>
            </div>
          </div>
          <button onClick={resetAndClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: CART ITEMS */}
        {step === 'cart' && (
          <>
            <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3">
              {cart.length === 0 ? (
                <div className="py-20 text-center">
                  <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-700">Votre panier est vide</p>
                  <p className="text-xs text-slate-400 mt-1">Découvrez les offres de AMALFY Market !</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100"
                  >
                    <SafeImage
                      src={item.productImage}
                      alt={item.productTitle}
                      categoryPlaceholder="market"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{item.productTitle}</h4>
                      <p className="font-heading font-extrabold text-xs text-amber-600 mt-0.5">
                        {formatFCFA(item.price)}
                      </p>
                      {(item.selectedSize || item.selectedColor) && (
                        <p className="text-[10px] text-slate-500">
                          {item.selectedSize ? `Taille: ${item.selectedSize} ` : ''}
                          {item.selectedColor ? `• ${item.selectedColor}` : ''}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-1.5 py-1">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="text-slate-500 hover:text-slate-800"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-800 w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="text-slate-500 hover:text-slate-800"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="p-1.5 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 sm:p-5 pb-[max(1rem,env(safe-area-inset-bottom,0px))] border-t border-slate-100 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Sous-total articles :</span>
                  <span className="font-extrabold text-sm text-slate-900">{formatFCFA(subtotal)}</span>
                </div>

                <button
                  onClick={() => setStep('checkout')}
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <span>Passer la commande</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}

        {/* STEP 2: CHECKOUT & PAYMENT SELECTION */}
        {step === 'checkout' && (
          <form onSubmit={handlePlaceOrder} className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
              {checkoutError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold">
                  {checkoutError}
                </div>
              )}
              {/* Delivery info */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Coordonnées de livraison
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Nom complet</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Téléphone d'appel</label>
                    <input
                      type="text"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Ville</label>
                    <input
                      type="text"
                      required
                      value={deliveryCity}
                      onChange={(e) => setDeliveryCity(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Quartier</label>
                    <input
                      type="text"
                      required
                      value={deliveryQuarter}
                      onChange={(e) => setDeliveryQuarter(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Adresse exacte</label>
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Repères, numéro de rue, villa..."
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Delivery options */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Mode de livraison
                </h4>

                <div className="space-y-2">
                  <label
                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                      deliveryOption === 'express_dakar'
                        ? 'border-amber-500 bg-amber-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="delivery"
                        checked={deliveryOption === 'express_dakar'}
                        onChange={() => setDeliveryOption('express_dakar')}
                        className="text-amber-500 focus:ring-amber-400"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800">Express Dakar (2h à 4h)</div>
                        <div className="text-[10px] text-slate-500">Livraison coursier rapide à moto</div>
                      </div>
                    </div>
                    <span className="font-bold text-xs text-slate-900">3 000 FCFA</span>
                  </label>

                  <label
                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                      deliveryOption === 'standard_senegal'
                        ? 'border-amber-500 bg-amber-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="delivery"
                        checked={deliveryOption === 'standard_senegal'}
                        onChange={() => setDeliveryOption('standard_senegal')}
                        className="text-amber-500 focus:ring-amber-400"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800">Régions Sénégal (24h à 48h)</div>
                        <div className="text-[10px] text-slate-500">Thiès, Mbour, Saint-Louis, Touba...</div>
                      </div>
                    </div>
                    <span className="font-bold text-xs text-slate-900">4 500 FCFA</span>
                  </label>

                  <label
                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                      deliveryOption === 'retrait_magasin'
                        ? 'border-amber-500 bg-amber-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="delivery"
                        checked={deliveryOption === 'retrait_magasin'}
                        onChange={() => setDeliveryOption('retrait_magasin')}
                        className="text-amber-500 focus:ring-amber-400"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800">Retrait en point relais / boutique</div>
                        <div className="text-[10px] text-slate-500">Dakar Plateau & Sacré-Cœur</div>
                      </div>
                    </div>
                    <span className="font-bold text-xs text-emerald-600">Gratuit</span>
                  </label>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Moyen de paiement
                </h4>

                <div className="space-y-2">
                  {/* Wave */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'wave'
                        ? 'border-sky-500 bg-sky-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'wave'}
                      onChange={() => setPaymentMethod('wave')}
                      className="mt-0.5 text-sky-500 focus:ring-sky-400"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Wave Sénégal</span>
                        <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full">
                          Recommandé
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Paiement via l'application Wave au numéro marchand après validation de la commande.
                      </p>
                    </div>
                  </label>

                  {/* Orange Money */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'orange_money'
                        ? 'border-orange-500 bg-orange-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'orange_money'}
                      onChange={() => setPaymentMethod('orange_money')}
                      className="mt-0.5 text-orange-500 focus:ring-orange-400"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Orange Money (OM)</span>
                        <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full">
                          Code marchand
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Transfert OM ou paiement marchand #144# sécurisé.
                      </p>
                    </div>
                  </label>

                  {/* Cash on delivery */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'paiement_livraison'
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'paiement_livraison'}
                      onChange={() => setPaymentMethod('paiement_livraison')}
                      className="mt-0.5 text-emerald-500 focus:ring-emerald-400"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Paiement à la réception</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          Cash ou Wave
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Réglez directement en espèces ou par Wave au livreur après vérification du colis.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Bottom confirmation actions */}
            <div className="p-4 sm:p-5 pb-[max(1rem,env(safe-area-inset-bottom,0px))] border-t border-slate-100 bg-slate-50/50 space-y-2">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Sous-total :</span>
                  <span>{formatFCFA(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Frais de livraison :</span>
                  <span>{formatFCFA(deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total à payer :</span>
                  <span className="text-amber-600">{formatFCFA(totalAmount)}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all text-center disabled:opacity-50"
                >
                  {submitting ? 'Validation...' : 'Confirmer la commande'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* STEP 3: ORDER SUCCESS & TRACKING */}
        {step === 'success' && placedOrder && (
          <div className="p-6 flex-1 flex flex-col justify-between overflow-y-auto">
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-heading font-black text-xl text-slate-900">
                Commande enregistrée avec succès !
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Numéro de commande : <span className="font-bold text-slate-800">#{placedOrder.id}</span>
              </p>

              {/* Status Box */}
              <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Statut commande :</span>
                  <span className="font-bold text-amber-600 uppercase">En préparation</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total :</span>
                  <span className="font-black text-slate-900">{formatFCFA(placedOrder.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mode de paiement :</span>
                  <span className="font-bold text-slate-800 uppercase">{placedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Livraison :</span>
                  <span className="font-bold text-slate-800">{placedOrder.deliveryQuarter}, {placedOrder.deliveryCity}</span>
                </div>
              </div>

              {/* Payment instructions */}
              {placedOrder.paymentMethod === 'wave' && (
                <div className="mt-4 p-4 bg-sky-50 rounded-2xl border border-sky-200 text-left text-xs">
                  <h5 className="font-bold text-sky-900 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    Instructions Wave Sénégal
                  </h5>
                  <p className="text-sky-800 text-[11px] leading-relaxed">
                    Veuillez envoyer <span className="font-bold">{formatFCFA(placedOrder.totalAmount)}</span> au compte marchand AMALFY au <span className="font-bold">+221 77 862 88 38</span> avec la référence <span className="font-bold">#{placedOrder.id.slice(-6)}</span>.
                  </p>
                </div>
              )}

              {placedOrder.paymentMethod === 'orange_money' && (
                <div className="mt-4 p-4 bg-orange-50 rounded-2xl border border-orange-200 text-left text-xs">
                  <h5 className="font-bold text-orange-900 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-orange-600" />
                    Instructions Orange Money
                  </h5>
                  <p className="text-orange-800 text-[11px] leading-relaxed">
                    Composez le <span className="font-bold">#144#391#</span> ou envoyez le paiement au <span className="font-bold">+221 78 123 45 67</span> avec en motif votre ID de commande.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100">
              <a
                href={buildWhatsAppLink(
                  '+221778628838',
                  `Bonjour AMALFY, je viens de passer la commande #${placedOrder.id} d'un montant de ${formatFCFA(placedOrder.totalAmount)}. Pouvez-vous me confirmer la prise en charge ?`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <span>Suivre ma commande sur WhatsApp</span>
              </a>

              <button
                onClick={resetAndClose}
                className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs text-center"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
