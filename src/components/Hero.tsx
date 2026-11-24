'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  Sparkles,
  Star,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Stethoscope,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { PRODUCTS } from '@/data/products';

export default function Hero() {
  const { openQuickCheckout } = useCart();
  const { t, isRtl } = useLanguage();
  const [heroSrc, setHeroSrc] = useState<string>('/images/hero-blouseti.jpg');
  const [imageUnavailable, setImageUnavailable] = useState<boolean>(false);

  const flagshipScrub = PRODUCTS[0];

  const handleOrderWithEmbroidery = () => {
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
        price: 20,
      },
    });
  };

  const handleImageError = () => {
    if (heroSrc === '/images/hero-blouseti.jpg') {
      setHeroSrc('/images/hero-banner.jpg');
    } else {
      setImageUnavailable(true);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#F8FAFC]/60 to-white pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200/70">
      <div className="absolute -top-24 right-0 w-[480px] h-[480px] bg-[#0284C7]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -left-24 w-[400px] h-[400px] bg-[#0B132B]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column */}
          <div className={`lg:col-span-7 space-y-6 text-center ${isRtl ? 'lg:text-right' : 'lg:text-left'}`}>
            <div className="inline-flex items-center gap-2 bg-[#F8FAFC] border border-slate-200/90 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-[#0B132B] shadow-2xs">
              <span>{t('hero_badge')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-black tracking-tight text-[#0B132B] leading-[1.14]">
              {t('hero_title_start')}{' '}
              <span className="text-[#0284C7]">{t('hero_title_highlight')}</span>{' '}
              {t('hero_title_end')}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed line-clamp-3 sm:line-clamp-2">
              {t('hero_desc')}
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3.5">
                <a
                  href="#catalogue"
                  className="inline-flex items-center justify-center gap-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white px-7 py-4 rounded-xl font-bold text-base shadow-lg shadow-[#0284C7]/25 hover:shadow-xl hover:-translate-y-0.5 transition-all group"
                >
                  <span>{t('hero_cta_primary')}</span>
                  <ArrowRight className={`w-5 h-5 transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                </a>

                <button
                  type="button"
                  onClick={handleOrderWithEmbroidery}
                  className="inline-flex items-center justify-center gap-2.5 bg-white hover:bg-[#F8FAFC] text-[#0B132B] border border-slate-300 hover:border-[#0B132B]/40 px-6 py-4 rounded-xl font-bold text-base shadow-2xs transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#0284C7]" />
                  <span>{t('hero_cta_secondary')}</span>
                </button>
              </div>

              <p className="inline-flex items-center justify-center lg:justify-start gap-2 text-xs sm:text-sm font-medium text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t('hero_micro_badge')}</span>
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#F8FAFC] via-sky-50/70 to-slate-100 border border-slate-200/80 shadow-2xl p-2 sm:p-2.5">
                <div className="relative aspect-[4/5] w-full rounded-[20px] overflow-hidden bg-[#0B132B]/5">
                  {!imageUnavailable ? (
                    <Image
                      src={heroSrc}
                      alt="Blouseti Maroc"
                      fill
                      onError={handleImageError}
                      className="object-cover object-center hover:scale-[1.03] transition-transform duration-700"
                      sizes="(max-width: 1024px) 100vw, 42vw"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0B132B] via-[#132248] to-[#0284C7] text-white p-8 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-4">
                        <Stethoscope className="w-8 h-8 text-sky-300" />
                      </div>
                      <p className="text-lg font-bold tracking-tight">{t('hero_fallback_title')}</p>
                      <p className="text-xs text-sky-200 mt-1 max-w-xs">{t('hero_fallback_sub')}</p>
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0B132B]/55 via-[#0B132B]/15 to-transparent pointer-events-none" />
                </div>
              </div>

              <div className="absolute -top-4 -left-2 sm:-left-6 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl border border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#0B132B]">{t('hero_card_rating')}</p>
                  <p className="text-[11px] font-medium text-slate-500">{t('hero_card_rating_sub')}</p>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-2 sm:-right-6 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl border border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284C7] shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-[#0284C7]" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#0B132B]">{t('hero_card_fabric')}</p>
                  <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                    <Truck className="w-3 h-3 text-emerald-600" />
                    <span>{t('hero_card_delivery')}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
