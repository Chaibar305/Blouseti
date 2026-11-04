'use client';

import React from 'react';
import { ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';

export default function TrustBar() {
  const pillars = [
    {
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      title: 'Paiement à la Livraison',
      desc: '0 dirham d’avance. Vous ne réglez en espèces qu’à la réception de votre colis.'
    },
    {
      icon: Truck,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-100',
      title: 'Livraison 24h à 48h',
      desc: 'Expédition express partout au Maroc : Casablanca, Rabat, Marrakech, Fès, Tanger...'
    },
    {
      icon: RefreshCw,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      title: 'Échange de Taille 48h',
      desc: 'Taille trop grande ou trop ajustée ? Nous échangeons votre tenue sans stress.'
    },
    {
      icon: Award,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-100',
      title: 'Tissu Médical Oeko-Tex',
      desc: 'Tissu stretch respirant, hypoallergénique et lavable à 60°C sans rétrécissement.'
    }
  ];

  return (
    <section className="bg-white py-10 border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-md transition-all"
              >
                <div className={`p-3 rounded-xl ${item.bgColor} ${item.borderColor} border shrink-0`}>
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h2>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
