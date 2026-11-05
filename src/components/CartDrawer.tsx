'use client';

import React from 'react';
import Image from 'next/image';
import { X, Trash2, ShoppingBag, Truck, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    totalItemsCount,
    subtotal,
    embroideryTotal,
    shippingFee,
    freeShippingThreshold,
    total,
    openQuickCheckout,
  } = useCart();

  if (!isCartOpen) return null;

  const currentTotal = subtotal + embroideryTotal;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - currentTotal);
  const progressPercent = Math.min(100, Math.round((currentTotal / freeShippingThreshold) * 100));

  const handleCheckoutFromCart = () => {
    if (items.length === 0) return;
    closeCart();
    openQuickCheckout(items[0]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={closeCart}
      />

      {/* Drawer Container (100% on mobile without clipping, max-w-md on sm+) */}
      <div className="fixed inset-y-0 right-0 w-full sm:max-w-md flex pointer-events-none">
        <div className="w-full h-full bg-white shadow-2xl flex flex-col pointer-events-auto overflow-hidden animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="bg-[#1B2A4A] text-white px-4 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold leading-tight">Votre Panier Blouseti</h3>
                <span className="text-[11px] text-sky-300 font-medium">
                  {totalItemsCount} article{totalItemsCount > 1 ? 's' : ''} sélectionné{totalItemsCount > 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
              aria-label="Fermer le panier"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-sky-50 px-4 py-2.5 sm:px-6 sm:py-3 border-b border-sky-100 shrink-0">
            <div className="flex items-center justify-between text-xs font-semibold text-sky-950 mb-1.5 gap-2">
              <span className="flex items-center gap-1.5 min-w-0 truncate">
                <Truck className="w-4 h-4 text-sky-600 shrink-0" />
                {remainingForFreeShipping === 0 ? (
                  <span className="text-emerald-700 font-bold truncate">🎉 Livraison Gratuite activée</span>
                ) : (
                  <span className="truncate text-[11px] sm:text-xs">
                    Plus que <strong className="text-sky-700">{remainingForFreeShipping} DH</strong> pour livraison offerte
                  </span>
                )}
              </span>
              <span className="shrink-0 text-[10px] font-bold bg-sky-200/80 text-sky-800 px-2 py-0.5 rounded-full">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full bg-sky-200/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4 px-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-800">Votre panier est vide</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Découvrez notre collection de scrubs et blouses médicales confortables 4-Way Stretch.
                  </p>
                </div>
                <button
                  onClick={closeCart}
                  className="bg-[#1B2A4A] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#111C32] transition-colors cursor-pointer"
                >
                  Continuer mes achats
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 relative"
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                    <Image
                      src={item.selectedColor.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate pr-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors p-1 rounded-lg shrink-0"
                          title="Supprimer"
                          aria-label="Supprimer cet article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1 font-medium">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0"
                            style={{ backgroundColor: item.selectedColor.hex }}
                          />
                          <span className="truncate max-w-[110px]">{item.selectedColor.name}</span>
                        </span>
                        <span>•</span>
                        <span className="font-bold text-slate-800">Taille {item.selectedSize}</span>
                      </div>

                      {/* Embroidery Badge */}
                      {item.embroidery?.enabled && (
                        <div className="mt-1.5 inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-amber-200">
                          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="truncate max-w-[180px]">Broderie : &quot;{item.embroidery.fullName}&quot;</span>
                        </div>
                      )}
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors active:scale-95"
                          aria-label="Diminuer la quantité"
                        >
                          -
                        </button>
                        <span className="w-7 sm:w-8 text-center text-xs font-bold text-slate-900 select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors active:scale-95"
                          aria-label="Augmenter la quantité"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-sm sm:text-base font-black text-[#1B2A4A]">
                        {item.product.price * item.quantity} DH
                      </span>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 space-y-3 shrink-0 shadow-lg">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Sous-total articles :</span>
                  <span className="font-semibold text-slate-900">{subtotal} DH</span>
                </div>
                {embroideryTotal > 0 && (
                  <div className="flex justify-between items-center text-amber-700 font-medium">
                    <span>Option broderie :</span>
                    <span>+{embroideryTotal} DH</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-slate-600">
                  <span>Livraison partout au Maroc :</span>
                  <span className={shippingFee === 0 ? 'text-emerald-700 font-bold' : 'font-semibold'}>
                    {shippingFee === 0 ? 'GRATUITE' : `${shippingFee} DH`}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-baseline justify-between gap-2">
                  <span className="text-xs sm:text-sm font-extrabold text-[#1B2A4A]">
                    Total (Paiement à la livraison) :
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-[#1B2A4A] shrink-0">
                    {total} DH
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleCheckoutFromCart}
                className="w-full btn-shimmer bg-[#1B2A4A] hover:bg-[#111C32] text-white font-extrabold py-3.5 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl text-sm sm:text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Commander (Paiement à la livraison)</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400 shrink-0" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 text-center leading-tight pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Réglez en espèces à la livraison après vérification de votre commande.</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
