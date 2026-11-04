'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldCheck, Truck, Sparkles, ArrowRight, Star, HeartPulse, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { PRODUCTS } from '@/data/products';

export default function Hero() {
  const { openQuickCheckout } = useCart();

  // Find the duo pack or flagship scrub for direct 1-click checkout CTA
  const flagshipScrub = PRODUCTS[0];

  const handleOrderNow = () => {
    openQuickCheckout({
      id: `${flagshipScrub.id}-hero-quick`,
      product: flagshipScrub,
      selectedColor: flagshipScrub.colors[0],
      selectedSize: 'M',
      quantity: 1,
      embroidery: {
        enabled: true,
        fullName: 'Dr.',
        speciality: 'Médecin',
        font: 'Moderne Classique',
        color: 'Blanc Pur',
        price: 20
      }
    });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/50 pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-slate-200/60">
      
      {/* Background soft ambient glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-red-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Sales Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 bg-[#1B2A4A]/5 border border-[#1B2A4A]/15 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#1B2A4A] shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-red-600 animate-ping" />
              <span>Collection Médicale Maroc 2026</span>
              <span className="text-slate-300">|</span>
              <span className="text-emerald-700 font-bold">Paiement à la livraison 💵</span>
            </div>

            {/* Impactful Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-black tracking-tight text-[#1B2A4A] leading-[1.15]">
              L’Élégance & le Confort Suprême pour les{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-[#1B2A4A]">
                Soignants du Maroc.
              </span>
            </h1>

            {/* Reassuring Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Fini les tenues rigides et étouffantes. Nos scrubs et blouses médicales en tissu{' '}
              <strong className="text-slate-900 font-semibold">4-Way Stretch respirant</strong> vous offrent une liberté de mouvement totale pendant vos gardes de 24h. Personnalisez votre tenue avec la broderie de votre nom !
            </p>

            {/* Highlight bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 pb-2 text-left max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center gap-2.5 text-sm font-medium text-slate-700 bg-white/80 border border-slate-200/80 px-3 py-2 rounded-xl shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Tissu résistant à plus de 100 lavages</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-medium text-slate-700 bg-white/80 border border-slate-200/80 px-3 py-2 rounded-xl shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Broderie du Nom & Spécialité</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-medium text-slate-700 bg-white/80 border border-slate-200/80 px-3 py-2 rounded-xl shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Paiement en espèces à la réception</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-medium text-slate-700 bg-white/80 border border-slate-200/80 px-3 py-2 rounded-xl shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Échange de taille garanti 48h</span>
              </div>
            </div>

            {/* Dual CTAs (Beez.ma 1-click style) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={handleOrderNow}
                className="btn-shimmer bg-[#1B2A4A] hover:bg-[#111C32] text-white px-7 py-4 rounded-xl font-bold text-base shadow-lg shadow-[#1B2A4A]/25 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 cursor-pointer group"
              >
                <span>Commander en 1 Clic (COD)</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-sky-400" />
              </button>
              
              <a
                href="#catalogue"
                className="bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-slate-300 px-6 py-4 rounded-xl font-bold text-base shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Découvrir la Collection</span>
              </a>
            </div>

            {/* Social Proof & Trust snippet */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="font-semibold text-slate-700">
                Note de 4.9/5 • Plus de 3 500 médecins & soignants équipés au Maroc 🇲🇦
              </span>
            </div>

          </div>

          {/* Right Column: Hero Visual Card with Moroccan Doctor photo & live floating badges */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer frame styling */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 group">
                <div className="aspect-[4/3] sm:aspect-[4/5] relative w-full">
                  <Image
                    src="/images/hero-banner.jpg"
                    alt="Médecins et soignants marocains en blouses et scrubs Blouseti"
                    fill
                    className="object-cover object-center group-hover:scale-103 transition-transform duration-700"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B2A4A]/80 via-transparent to-black/10" />
                </div>

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-sky-700">En vedette</p>
                      <p className="text-base font-bold text-[#1B2A4A]">Scrub Confort Fit 4-Way Stretch</p>
                      <p className="text-xs text-slate-500">Bleu Marine & Vert Sauge • Tissu infroissable</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs line-through text-slate-400">420 DH</span>
                      <p className="text-xl font-extrabold text-[#1B2A4A]">349 <span className="text-sm font-semibold">DH</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge 1: Embroidery preview */}
              <div className="absolute -top-4 -left-4 sm:-left-6 bg-white rounded-2xl p-3.5 shadow-xl border border-slate-100 flex items-center gap-3 float-gentle">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-amber-900 uppercase">Broderie Personnalisée</p>
                  <p className="text-xs font-semibold text-slate-700">Nom & Titre brodés avec soin</p>
                </div>
              </div>

              {/* Floating Badge 2: Cash On Delivery */}
              <div className="absolute -bottom-4 -right-4 sm:-right-6 bg-white rounded-2xl p-3.5 shadow-xl border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-emerald-800 uppercase">Partout au Maroc</p>
                  <p className="text-xs font-bold text-slate-900">Paiement à la livraison (COD)</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
