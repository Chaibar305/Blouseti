'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Sparkles, Check, HeartPulse, ShieldAlert, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { PRODUCTS } from '@/data/products';

export default function EmbroiderySection() {
  const { openQuickCheckout } = useCart();
  
  const [drName, setDrName] = useState('Dr. S. Bennani');
  const [speciality, setSpeciality] = useState('Chirurgien Dentiste');
  const [selectedFont, setSelectedFont] = useState<'Moderne Classique' | 'Script Élégance' | 'Serif Prestige'>('Script Élégance');
  const [selectedColor, setSelectedColor] = useState<'Fil Blanc' | 'Fil Argenté' | 'Fil Doré' | 'Fil Bleu Ciel'>('Fil Argenté');

  const fontClasses = {
    'Moderne Classique': 'font-sans tracking-wide uppercase font-bold',
    'Script Élégance': 'italic font-serif tracking-normal text-lg sm:text-xl font-medium',
    'Serif Prestige': 'font-serif tracking-widest uppercase font-semibold text-sm sm:text-base'
  };

  const threadColors = {
    'Fil Blanc': { hex: '#FFFFFF', name: 'Blanc Pur', border: 'border-slate-300' },
    'Fil Argenté': { hex: '#E2E8F0', name: 'Argent Satiné', border: 'border-slate-400' },
    'Fil Doré': { hex: '#FDE047', name: 'Doré Subtil', border: 'border-amber-300' },
    'Fil Bleu Ciel': { hex: '#7DD3FC', name: 'Bleu Médical', border: 'border-sky-300' },
  };

  const handleOrderWithCustomEmbroidery = () => {
    const flagship = PRODUCTS[0];
    openQuickCheckout({
      id: `${flagship.id}-custom-embroidered`,
      product: flagship,
      selectedColor: flagship.colors[0],
      selectedSize: 'M',
      quantity: 1,
      embroidery: {
        enabled: true,
        fullName: drName || 'Dr.',
        speciality: speciality || 'Médecin',
        font: selectedFont,
        color: selectedColor === 'Fil Blanc' ? 'Blanc Pur' : selectedColor === 'Fil Argenté' ? 'Argenté Reflet' : selectedColor === 'Fil Doré' ? 'Doré' : 'Bleu Ciel',
        price: 20
      }
    });
  };

  return (
    <section id="broderie" className="py-16 bg-[#162544] text-white relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#0EA5E9_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Option Atelier de Broderie Haute Précision</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            Faites Broder Votre Nom & Spécialité (+20 DH)
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            Valorisez votre statut professionnel avec une broderie indélébile réalisée dans nos ateliers à Casablanca. Résiste à tous les cycles de lavage et de désinfection hospitalière.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Controls column */}
          <div className="lg:col-span-6 bg-white/5 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/10 space-y-5">
            <h3 className="text-base font-bold text-white flex items-center justify-between border-b border-white/10 pb-3">
              <span>Personnaliser en direct votre tenue</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
                +20 DH seulement
              </span>
            </h3>

            {/* Input Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nom complet ou Titre (Ex: Dr. Bennani, Pr. Alami, Sage-femme Fatima)
              </label>
              <input
                type="text"
                value={drName}
                onChange={(e) => setDrName(e.target.value)}
                maxLength={28}
                placeholder="Ex: Dr. S. Bennani"
                className="w-full bg-[#111C32] border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-400 transition-all placeholder:text-slate-500"
              />
            </div>

            {/* Input Speciality */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Spécialité ou Fonction (Ligne 2 facultative)
              </label>
              <input
                type="text"
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
                maxLength={32}
                placeholder="Ex: Médecin Généraliste, Dentiste, Infirmier"
                className="w-full bg-[#111C32] border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-400 transition-all placeholder:text-slate-500"
              />
            </div>

            {/* Font selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Style d’écriture de la broderie
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Script Élégance', 'Moderne Classique', 'Serif Prestige'] as const).map((font) => (
                  <button
                    key={font}
                    type="button"
                    onClick={() => setSelectedFont(font)}
                    className={`py-2 px-2 text-xs rounded-lg border text-center transition-all cursor-pointer ${
                      selectedFont === font
                        ? 'bg-sky-500/20 border-sky-400 text-sky-200 font-bold shadow-xs'
                        : 'bg-[#111C32]/60 border-white/10 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    {font}
                  </button>
                ))}
              </div>
            </div>

            {/* Thread color selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Couleur du fil de broderie
              </label>
              <div className="flex flex-wrap gap-2.5">
                {(Object.keys(threadColors) as Array<keyof typeof threadColors>).map((key) => {
                  const item = threadColors[key];
                  const isSelected = selectedColor === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedColor(key)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white/15 border-white text-white font-bold ring-2 ring-sky-400/50'
                          : 'bg-[#111C32]/60 border-white/10 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/30 shadow-xs"
                        style={{ backgroundColor: item.hex }}
                      />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CTA button */}
            <button
              onClick={handleOrderWithCustomEmbroidery}
              className="w-full btn-shimmer bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-3.5 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <span>Commander un Scrub avec cette Broderie</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Real-time Stitched Pocket Preview Column */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Live Pocket Rendering */}
            <div className="relative rounded-2xl bg-[#0F172A] border-2 border-dashed border-sky-500/30 p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-widest text-sky-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Aperçu Simulation Broderie Haute Définition
                </span>
                <span className="text-[11px] text-slate-400">Emplacement : Poche Poitrine Gauche</span>
              </div>

              {/* The Scrub Pocket Mockup */}
              <div className="relative mx-auto max-w-sm aspect-[4/3] rounded-2xl bg-[#1B2A4A] border-4 border-[#22365E] shadow-inner p-6 flex flex-col justify-center items-center text-center overflow-hidden">
                {/* Subtle textile texture */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:6px_6px]" />
                
                {/* Stitched seam effect at the top of the pocket */}
                <div className="absolute top-4 left-6 right-6 border-b-2 border-dashed border-white/20" />

                {/* Stitched emblem + Text */}
                <div className="relative z-10 space-y-1">
                  <div className="flex items-center justify-center mb-1">
                    <span className="text-red-500 font-bold text-lg drop-shadow-sm">✚</span>
                  </div>
                  <p
                    className={`transition-all duration-300 select-none ${fontClasses[selectedFont]}`}
                    style={{
                      color: threadColors[selectedColor].hex,
                      textShadow: '0 1px 2px rgba(0,0,0,0.8), 0 0 1px rgba(255,255,255,0.3)'
                    }}
                  >
                    {drName || 'Votre Nom Brodé'}
                  </p>
                  {speciality && (
                    <p
                      className="text-xs tracking-wider uppercase opacity-90 transition-all font-sans"
                      style={{
                        color: threadColors[selectedColor].hex,
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                      }}
                    >
                      {speciality}
                    </p>
                  )}
                </div>

                <div className="absolute bottom-3 text-[10px] text-sky-300/60 uppercase tracking-widest">
                  Atelier Blouseti Maroc • Fil Gütermann indélébile
                </div>
              </div>

              {/* Real macro photo reference */}
              <div className="mt-4 flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-white/20">
                  <Image
                    src="/images/embroidery-sample.jpg"
                    alt="Détail macro broderie médicale Blouseti Dr. S. Bennani"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-xs text-slate-300">
                  <p className="font-semibold text-white">Rendu réel sur tissu</p>
                  <p className="text-[11px] text-slate-400">Photo réelle de broderie réalisée pour nos clients médecins et chirurgiens.</p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
