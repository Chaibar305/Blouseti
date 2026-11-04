'use client';

import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { trackEvent } from '@/lib/analytics';

export default function WhatsAppFloat() {
  const [showBubble, setShowBubble] = useState(true);
  const { settings } = useSettings();

  const handleWhatsAppClick = () => {
    trackEvent('whatsapp_click', { source: 'floating_button' });
  };

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-30 flex flex-col items-end gap-2">
      
      {/* Floating tooltip message */}
      {showBubble && (
        <div className="relative bg-white text-slate-800 text-xs py-2.5 px-3.5 rounded-2xl shadow-xl border border-slate-200/80 max-w-[230px] flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button
            onClick={() => setShowBubble(false)}
            className="absolute -top-1.5 -left-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full p-0.5 border border-slate-300"
            aria-label="Fermer la bulle"
          >
            <X className="w-3 h-3" />
          </button>
          <div>
            <p className="font-bold text-[#1B2A4A] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              Service Client Blouseti
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Une question sur la taille ou la broderie ? Écrivez-nous sur WhatsApp !
            </p>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={`https://wa.me/${settings.whatsapp_number}?text=Bonjour%20Blouseti,%20j%27aimerais%20des%20renseignements%20sur%20vos%20tenues%20m%C3%A9dicales.`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleWhatsAppClick}
        aria-label="Contacter sur WhatsApp"
        className="w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-600/30 hover:scale-110 active:scale-95 transition-all group cursor-pointer relative"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white font-bold items-center justify-center">
            1
          </span>
        </span>
        <MessageCircle className="w-7 h-7 fill-white" />
      </a>
    </div>
  );
}
