'use client';

import React from 'react';
import { Truck, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { usePathname } from 'next/navigation';

export default function MobileBottomCta() {
  const pathname = usePathname();
  const { quickCheckoutItem, isCartOpen, openCart } = useCart();

  // Do not render on admin pages or if quick checkout modal is already open
  if (pathname?.startsWith('/admin') || quickCheckoutItem || isCartOpen) {
    return null;
  }

  const handleCtaClick = () => {
    const catalogueEl = document.getElementById('catalogue') || document.getElementById('scrubs');
    if (catalogueEl) {
      catalogueEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/#catalogue';
    }
  };

  return (
    <div className="sm:hidden fixed bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-3 shadow-[0_-8px_20px_rgba(0,0,0,0.08)] pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
      <button
        onClick={handleCtaClick}
        className="w-full min-h-[50px] btn-shimmer bg-[#1B2A4A] active:bg-[#111C32] text-white font-black py-3.5 px-4 rounded-xl text-xs tracking-wide shadow-lg shadow-[#1B2A4A]/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
      >
        <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="truncate">COMMANDER MAINTENANT - PAIEMENT À LA LIVRAISON</span>
        <ArrowRight className="w-3.5 h-3.5 text-sky-400 shrink-0" />
      </button>
    </div>
  );
}
