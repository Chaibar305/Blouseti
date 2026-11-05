'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Truck, ShieldCheck, RefreshCw, Phone, Mail, MapPin, MessageCircle, Heart } from 'lucide-react';
import { SHIPPING_POLICY } from '@/data/morocco';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { trackEvent } from '@/lib/analytics';
import { InstagramIcon, FacebookIcon } from '@/components/SocialIcons';

export default function Footer() {
  const { openSizeGuide } = useCart();
  const { settings } = useSettings();

  const instagramUrl = settings.instagram_url || 'https://www.instagram.com/blouseti.shop/';
  const facebookUrl = settings.facebook_url || 'https://web.facebook.com/profile.php?id=61596347515075';

  return (
    <footer id="contact" className="bg-[#111C32] text-slate-300 pt-16 pb-12 border-t border-white/10 scroll-mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white p-0.5">
                <Image
                  src="/logo.png"
                  alt="Blouseti Medical"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white tracking-tight">Blouseti</span>
                  <span className="text-sm font-bold text-red-500 bg-red-950/60 px-1.5 py-0.5 rounded" dir="rtl">
                    بلوزتي
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-sky-400">
                  Medical & Workwear • blouseti.shop
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Confort & Élégance au quotidien pour les médecins, infirmiers, dentistes et soignants du Maroc. Scrubs 4-Way Stretch, blouses blanches cintrées et broderie personnalisée.
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-2 rounded-xl w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Cash On Delivery (Paiement à la livraison)</span>
            </div>

            {/* Social Media Buttons */}
            <div className="flex items-center gap-2.5 pt-1">
              <span className="text-xs text-slate-400 font-semibold">Suivez-nous :</span>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white text-xs font-bold shadow-md hover:scale-105 transition-all"
                title="Suivre Blouseti sur Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>Instagram</span>
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold shadow-md hover:scale-105 transition-all"
                title="Suivre Blouseti sur Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
                <span>Facebook</span>
              </a>
            </div>
          </div>

          {/* Quick Links Categories */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#scrubs" className="hover:text-white transition-colors">Scrubs Médicaux Extensibles</a>
              </li>
              <li>
                <a href="#blouses" className="hover:text-white transition-colors">Blouses Blanches Médecins</a>
              </li>
              <li>
                <a href="#vestes" className="hover:text-white transition-colors">Vestes Polaires Bloc</a>
              </li>
              <li>
                <a href="#catalogue" className="hover:text-white transition-colors">Packs Duo & Étudiants</a>
              </li>
              <li>
                <a href="#broderie" className="hover:text-white transition-colors text-amber-400">Atelier Broderie (+45 DH)</a>
              </li>
            </ul>
          </div>

          {/* Service & Assistance */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
              Assistance & Tailles
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={openSizeGuide}
                  className="hover:text-white text-sky-400 transition-colors text-left cursor-pointer"
                >
                  Guide des Tailles Maroc (cm)
                </button>
              </li>
              <li>
                <span className="text-slate-400">Échange facile sous 48h</span>
              </li>
              <li>
                <span className="text-slate-400">Livraison 24h à 48h partout au Maroc</span>
              </li>
              <li>
                <span className="text-slate-400">Entretien & Lavage à 60°C</span>
              </li>
              <li>
                <span className="text-slate-400">Commandes Cliniques & Cabinets</span>
              </li>
            </ul>
          </div>

          {/* Contact Direct */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
              Service Client Maroc
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={`https://wa.me/${settings.whatsapp_number}?text=Bonjour%20Blouseti,%20j%27ai%20une%20question.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('whatsapp_click', { source: 'footer' })}
                  className="hover:text-emerald-400 font-semibold"
                >
                  WhatsApp: +{settings.whatsapp_number}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-white transition-colors">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">
                  {settings.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>Atelier &amp; Expéditions : {settings.address} 🇲🇦</span>
              </li>
              <li className="pt-1.5 flex items-center gap-2">
                <InstagramIcon className="w-4 h-4 text-pink-400 shrink-0" />
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-400 transition-colors font-medium"
                >
                  Instagram : <strong className="text-white hover:text-pink-400">@blouseti.shop</strong>
                </a>
              </li>
              <li className="flex items-center gap-2">
                <FacebookIcon className="w-4 h-4 text-[#1877F2] shrink-0" />
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#1877F2] transition-colors font-medium"
                >
                  Facebook : <strong className="text-white hover:text-[#1877F2]">Blouseti Maroc</strong>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright and legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 text-center sm:text-left">
          <p>
            © 2026 Blouseti (بلوزتي) • blouseti.shop • Tous droits réservés.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span>Paiement à la réception</span>
            <span>•</span>
            <span>Échange garanti</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-300">
              Fait avec <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> pour les soignants marocains
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
