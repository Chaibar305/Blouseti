'use client';

import React from 'react';
import Image from 'next/image';
import { X, Trash2, ShoppingBag, Truck, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { SHIPPING_POLICY } from '@/data/morocco';

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
    total,
    openQuickCheckout,
  } = useCart();

  if (!isCartOpen) return null;

  const freeShippingThreshold = SHIPPING_POLICY.freeShippingThreshold;
  const currentTotal = subtotal + embroideryTotal;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - currentTotal);
  const progressPercent = Math.min(100, Math.round((currentTotal / freeShippingThreshold) * 100));

  const handleCheckoutFromCart = () => {
    if (items.length === 0) return;
    // Open COD modal for the first item or synthesized cart
    closeCart();
    openQuickCheckout(items[0]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="bg-[#1B2A4A] text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-sky-400" />
              <h3 className="text-base font-bold">Votre Panier Blouseti ({totalItemsCount})</h3>
            </div>
            <button
              onClick={closeCart}
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-sky-50 px-6 py-3 border-b border-sky-100">
            <div className="flex items-center justify-between text-xs font-semibold text-sky-950 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-sky-600" />
                {remainingForFreeShipping === 0 ? (
                  <span className="text-emerald-700 font-bold">🎉 Félicitations ! Livraison Gratuite activée</span>
                ) : (
                  <span>Plus que <strong className="text-sky-700">{remainingForFreeShipping} DH</strong> pour la livraison offerte</span>
                )}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-sky-200/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-800">Votre panier est vide</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Découvrez notre collection de scrubs et blouses médicales confortables.
                  </p>
                </div>
                <button
                  onClick={closeCart}
                  className="bg-[#1B2A4A] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#111C32] transition-colors"
                >
                  Continuer mes achats
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 relative"
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
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
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-medium">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-slate-300"
                            style={{ backgroundColor: item.selectedColor.hex }}
                          />
                          {item.selectedColor.name}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-slate-800">Taille {item.selectedSize}</span>
                      </div>

                      {/* Embroidery Badge */}
                      {item.embroidery?.enabled && (
                        <div className="mt-1 inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-amber-200">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>Broderie : &quot;{item.embroidery.fullName}&quot;</span>
                        </div>
                      )}
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100 rounded-l"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100 rounded-r"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-sm font-black text-[#1B2A4A]">
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
            <div className="bg-slate-50 p-6 border-t border-slate-200 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Sous-total articles :</span>
                  <span className="font-semibold text-slate-900">{subtotal} DH</span>
                </div>
                {embroideryTotal > 0 && (
                  <div className="flex justify-between text-amber-700 font-medium">
                    <span>Option broderie :</span>
                    <span>+{embroideryTotal} DH</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Livraison partout au Maroc :</span>
                  <span className={shippingFee === 0 ? 'text-emerald-700 font-bold' : 'font-semibold'}>
                    {shippingFee === 0 ? 'GRATUITE' : `${shippingFee} DH`}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-base font-black text-[#1B2A4A]">
                  <span>Total (Paiement à la livraison) :</span>
                  <span className="text-2xl font-black text-[#1B2A4A]">{total} DH</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleCheckoutFromCart}
                className="w-full btn-shimmer bg-[#1B2A4A] hover:bg-[#111C32] text-white font-black py-4 px-6 rounded-2xl text-base shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>Commander (Paiement à la livraison)</span>
                <ArrowRight className="w-5 h-5 text-sky-400" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Réglez en espèces à la livraison après avoir vérifié votre commande.</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
