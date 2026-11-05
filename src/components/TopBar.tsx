'use client';

import React from 'react';
import { Phone, Megaphone } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { trackEvent } from '@/lib/analytics';
import { InstagramIcon, FacebookIcon } from '@/components/SocialIcons';

export default function TopBar() {
  const { settings } = useSettings();

  const instagramUrl = settings.instagram_url || 'https://www.instagram.com/blouseti.shop/';
  const facebookUrl = settings.facebook_url || 'https://web.facebook.com/profile.php?id=61596347515075';

  const handleWhatsAppClick = () => {
    trackEvent('whatsapp_click', { source: 'topbar' });
  };

  return (
    <div className="bg-[#111C32] text-white text-xs py-2 px-4 border-b border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
        {/* Dynamic Moroccan announcements banner */}
        <div className="flex items-center justify-center flex-wrap gap-x-3 gap-y-1 text-center md:text-left">
          <span className="flex items-center gap-1.5 font-medium text-emerald-300">
            <Megaphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{settings.topbar_text}</span>
          </span>
        </div>

        {/* Dynamic Support phone, WhatsApp & Social Links */}
        <div className="hidden lg:flex items-center gap-4 text-slate-300">
          <div className="flex items-center gap-2 pr-3 border-r border-white/15">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-pink-400 transition-colors p-1"
              title="Instagram @blouseti.shop"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
            </a>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-sky-400 transition-colors p-1"
              title="Facebook Blouseti"
            >
              <FacebookIcon className="w-3.5 h-3.5" />
            </a>
          </div>
          <span className="text-white/60">Commande &amp; Conseils :</span>
          <a
            href={`https://wa.me/${settings.whatsapp_number}?text=Bonjour%20Blouseti,%20je%20souhaite%20des%20informations%20sur%20vos%20tenues%20m%C3%A9dicales.`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="flex items-center gap-1.5 font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{settings.phone}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
