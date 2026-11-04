'use client';

import React from 'react';
import Image from 'next/image';
import { Star, CheckCircle, Quote, ThumbsUp } from 'lucide-react';
import { TESTIMONIALS } from '@/data/products';

export default function Testimonials() {
  return (
    <section className="py-16 bg-white border-b border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-full mb-3">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Avis Vérifiés Soignants du Maroc</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1B2A4A] tracking-tight">
            Ils Portent Blouseti au Quotidien
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Médecins spécialistes, chirurgiens-dentistes, infirmiers et internes en médecine partagent leur avis sur la qualité de nos scrubs et blouses.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="bg-slate-50/70 rounded-2xl p-6 border border-slate-200/80 flex flex-col justify-between hover:shadow-lg hover:border-slate-300 transition-all"
            >
              <div className="space-y-4">
                {/* Stars and verified badge */}
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    Avis Vérifié
                  </span>
                </div>

                {/* Comment quote */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;{t.comment}&rdquo;
                </p>

                {/* Purchased product tag */}
                <div className="text-[11px] font-medium text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200/60 inline-block">
                  Acheté : <span className="text-[#1B2A4A] font-semibold">{t.itemBought}</span>
                </div>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 pt-5 mt-4 border-t border-slate-200/60">
                <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-xs shrink-0">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    {t.name}
                  </h4>
                  <p className="text-[11px] text-sky-700 font-medium">{t.role}</p>
                  <p className="text-[10px] text-slate-400">{t.city}</p>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Global Rating Stats Banner */}
        <div className="mt-10 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="text-4xl sm:text-5xl font-black text-amber-400">4.9/5</div>
            <div>
              <div className="flex text-amber-400 mb-1 justify-center sm:justify-start">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm font-bold text-white">Score de satisfaction globale au Maroc</p>
              <p className="text-xs text-slate-400">Basé sur plus de 1 200 retours clients soignants en 2025-2026</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
            <div className="text-center px-3 border-r border-white/10">
              <span className="block text-xl font-bold text-white">99.2%</span>
              <span>Tissus validés 60°C</span>
            </div>
            <div className="text-center px-3 border-r border-white/10">
              <span className="block text-xl font-bold text-emerald-400">&lt; 48h</span>
              <span>Livraison moyenne</span>
            </div>
            <div className="text-center px-3">
              <span className="block text-xl font-bold text-sky-400">100%</span>
              <span>Paiement à réception</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
