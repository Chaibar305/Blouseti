'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, PhoneCall } from 'lucide-react';
import { FAQS } from '@/data/products';
import { SHIPPING_POLICY } from '@/data/morocco';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-800 bg-sky-100/70 px-3.5 py-1.5 rounded-full mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
            <span>Foire Aux Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B2A4A] tracking-tight">
            Questions Fréquentes sur Blouseti
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Tout ce que vous devez savoir avant de passer votre commande en paiement à la livraison.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 text-left font-bold text-sm sm:text-base text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180 text-sky-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in duration-150">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact Banner */}
        <div className="mt-8 text-center bg-white p-5 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600 text-center sm:text-left">
            <p className="font-bold text-slate-900">Vous avez une autre question ?</p>
            <p className="text-slate-500">Notre équipe médicale est disponible sur WhatsApp 7 jours sur 7.</p>
          </div>
          <a
            href={`https://wa.me/${SHIPPING_POLICY.whatsappNumber}?text=Bonjour%20Blouseti,%20j%27ai%20une%20question%20avant%20de%20commander.`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors shrink-0"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Discuter avec nous</span>
          </a>
        </div>

      </div>
    </section>
  );
}
