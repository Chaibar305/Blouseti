'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Ruler, Menu, X, MessageCircle, Sparkles, ChefHat, UtensilsCrossed, Phone } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { trackEvent } from '@/lib/analytics';
import { SHIPPING_POLICY } from '@/data/morocco';
import { InstagramIcon, FacebookIcon } from '@/components/SocialIcons';

export default function Header() {
  const { totalItemsCount, openCart, openSizeGuide } = useCart();
  const { settings } = useSettings();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const instagramUrl = settings.instagram_url || 'https://www.instagram.com/blouseti.shop/';
  const facebookUrl = settings.facebook_url || 'https://web.facebook.com/profile.php?id=61596347515075';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-xs border border-slate-100 bg-white p-0.5 group-hover:scale-105 transition-transform">
              <Image
                src="/logo.png"
                alt="Blouseti - Tenues Médicales & Professionnelles Maroc"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-[#1B2A4A] font-sans">
                  Blouseti
                </span>
                <span className="text-sm font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded text-right font-sans" dir="rtl">
                  بلوزتي
                </span>
              </div>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-sky-600">
                Medical &amp; Workwear • Maroc
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs xl:text-sm font-medium text-slate-700">
            <Link href="/#catalogue" className="hover:text-sky-600 transition-colors">
              Collection
            </Link>
            <Link href="/#scrub" className="hover:text-sky-600 transition-colors flex items-center gap-1">
              <span>Scrubs</span>
              <span className="text-[9px] bg-sky-100 text-sky-700 font-bold px-1.5 py-0.2 rounded-full">Top</span>
            </Link>
            <Link href="/#blouse" className="hover:text-sky-600 transition-colors">
              Blouses
            </Link>
            <Link href="/#polaire" className="hover:text-sky-600 transition-colors">
              Polaires
            </Link>
            <Link href="/#cuisine" className="hover:text-amber-600 transition-colors flex items-center gap-1 font-semibold text-slate-800">
              <ChefHat className="w-3.5 h-3.5 text-amber-600" />
              <span>Cuisine</span>
              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">Nouveau</span>
            </Link>
            <Link href="/#hotellerie" className="hover:text-sky-600 transition-colors flex items-center gap-1 text-slate-800">
              <UtensilsCrossed className="w-3.5 h-3.5 text-sky-600" />
              <span>Hôtellerie</span>
            </Link>
            <Link href="/#broderie" className="hover:text-amber-600 transition-colors flex items-center gap-1 text-amber-700 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Broderie</span>
            </Link>
            <button
              onClick={openSizeGuide}
              className="text-slate-600 hover:text-sky-600 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Ruler className="w-4 h-4 text-sky-500" />
              <span>Guide Tailles</span>
            </button>
            <Link href="/#contact" className="hover:text-sky-600 transition-colors font-medium">
              Contact
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* WhatsApp Direct Help */}
            <a
              href={`https://wa.me/${settings.whatsapp_number}?text=Bonjour%20Blouseti,%20j%27ai%20besoin%20d%27aide%20pour%20choisir%20ma%20tenue%20m%C3%A9dicale.`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('whatsapp_click', { source: 'header_desktop' })}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-full border border-emerald-200 transition-all hover:scale-102"
              title="Conseil WhatsApp direct"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Aide WhatsApp</span>
            </a>

            {/* Instagram Button */}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex p-2 rounded-full text-slate-600 hover:text-white hover:bg-gradient-to-tr hover:from-purple-600 hover:via-pink-600 hover:to-amber-500 border border-slate-200/90 transition-all hover:scale-105 active:scale-95 shadow-2xs items-center justify-center"
              title="Instagram @blouseti.shop"
              aria-label="Instagram Blouseti"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>

            {/* Facebook Button */}
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex p-2 rounded-full text-slate-600 hover:text-white hover:bg-[#1877F2] border border-slate-200/90 transition-all hover:scale-105 active:scale-95 shadow-2xs items-center justify-center"
              title="Facebook Blouseti"
              aria-label="Facebook Blouseti"
            >
              <FacebookIcon className="w-4 h-4" />
            </a>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-full bg-[#1B2A4A] text-white hover:bg-[#111C32] transition-transform hover:scale-105 active:scale-95 shadow-md flex items-center justify-center cursor-pointer"
              aria-label="Voir le panier"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white animate-bounce">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 text-slate-700 hover:text-[#1B2A4A] bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 rounded-xl border border-slate-200/90 shadow-2xs transition-all active:scale-95 flex items-center justify-center cursor-pointer"
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu navigation'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer (Mounted in portal to prevent backdrop-filter stacking context bugs) */}
      {mounted && mobileMenuOpen && createPortal(
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 max-w-[320px] w-[85%] h-full bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-300">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-slate-200 bg-white p-0.5">
                  <Image
                    src="/logo.png"
                    alt="Blouseti Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <span className="font-black text-[#1B2A4A] text-lg block leading-tight">Blouseti</span>
                  <span className="text-[10px] text-sky-600 font-bold uppercase tracking-wider">Menu Médical</span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1.5 text-sm font-semibold text-slate-800 overscroll-contain">
              <Link
                href="/#catalogue"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <span>📦 Collection Complète</span>
              </Link>
              <Link
                href="/#scrubs"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-sky-50 text-sky-900 transition-colors"
              >
                <span>🩺 Scrubs Médicaux 4-Way Stretch</span>
                <span className="text-[10px] bg-sky-200 text-sky-800 font-bold px-2 py-0.5 rounded-full">Top</span>
              </Link>
              <Link
                href="/#blouses"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <span>🥼 Blouses Blanches Prestige</span>
              </Link>
              <Link
                href="/#vestes"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <span>🧥 Vestes &amp; Polaires Chaudes</span>
              </Link>
              <Link
                href="/#cuisine"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-amber-50 text-amber-950 transition-colors font-semibold"
              >
                <span className="flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-amber-600" />
                  👨‍🍳 Vestes Cuisine &amp; Chefs
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">Nouveau</span>
              </Link>
              <Link
                href="/#hotellerie"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-sky-50 text-sky-950 transition-colors font-semibold"
              >
                <span className="flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-sky-600" />
                  🛎️ Personnel Hôtelier &amp; Service
                </span>
                <span className="text-[10px] bg-sky-200 text-sky-900 font-bold px-2 py-0.5 rounded-full">Nouveau</span>
              </Link>
              <Link
                href="/#broderie"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-amber-50 text-amber-900 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Broderie Nom &amp; Titre (+45 DH)
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">Offert</span>
              </Link>

              <div className="pt-2 border-t border-slate-100 my-2" />

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openSizeGuide();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors text-left cursor-pointer"
              >
                <Ruler className="w-4 h-4 text-sky-600" />
                <span>Guide des Tailles Maroc</span>
              </button>

              <Link
                href="/#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors text-left"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Contact &amp; Assistance</span>
              </Link>
            </div>

            {/* Drawer Footer with COD info, Social buttons and WhatsApp CTA */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3 shrink-0">
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Paiement Cash à la livraison 24-48h</span>
              </div>

              {/* Mobile Social Buttons */}
              <div className="flex items-center gap-2">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white py-2.5 px-3 rounded-xl font-bold text-xs shadow-xs hover:opacity-95 transition-all"
                  title="Instagram Blouseti"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                </a>
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#1877F2] hover:bg-[#166fe5] text-white py-2.5 px-3 rounded-xl font-bold text-xs shadow-xs hover:opacity-95 transition-all"
                  title="Facebook Blouseti"
                >
                  <FacebookIcon className="w-3.5 h-3.5" />
                  <span>Facebook</span>
                </a>
              </div>

              <a
                href={`https://wa.me/${settings.whatsapp_number}?text=Bonjour%20Blouseti,%20j%27aimerais%20passer%20une%20commande.`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('whatsapp_click', { source: 'drawer_mobile' })}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl font-bold shadow-md text-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Commander via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
