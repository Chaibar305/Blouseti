'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Ruler,
  Menu,
  X,
  MessageCircle,
  Sparkles,
  ChefHat,
  UtensilsCrossed,
  Phone,
  Globe,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import { trackEvent } from '@/lib/analytics';
import { InstagramIcon, FacebookIcon } from '@/components/SocialIcons';

export default function Header() {
  const { totalItemsCount, openCart, openSizeGuide } = useCart();
  const { settings } = useSettings();
  const { lang, setLang, t } = useLanguage();
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
  const whatsappNumber = settings.whatsapp_number || '212603660658';

  const navLinks =
    lang === 'AR'
      ? [
          { href: '/#catalogue', label: 'التشكيلة' },
          { href: '/#scrub', label: 'سكراب طبي' },
          { href: '/#blouse', label: 'وزرات طبية' },
          { href: '/#polaire', label: 'جاكيت بولير' },
          { href: '/#cuisine', label: 'الفندقة والمطبخ' },
          { href: '/#broderie', label: 'تطريز الاسم', highlight: true },
        ]
      : [
          { href: '/#catalogue', label: 'Collection' },
          { href: '/#scrub', label: 'Scrubs' },
          { href: '/#blouse', label: 'Blouses' },
          { href: '/#polaire', label: 'Polaires' },
          { href: '/#cuisine', label: 'Hôtellerie & Cuisine' },
          { href: '/#broderie', label: 'Broderie', highlight: true },
        ];

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/70 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Left: Logo Blouseti ("MEDICAL & WORKWEAR MAROC") */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 bg-white p-1 group-hover:scale-105 transition-transform">
              <Image
                src="/logo.png"
                alt="Blouseti - Medical & Workwear Maroc"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-[#0B132B] leading-none">
                  Blouseti
                </span>
                <span
                  className="text-xs font-bold text-[#0284C7] bg-sky-50 border border-sky-100 px-1.5 py-0.5 rounded-md leading-none"
                  dir="rtl"
                >
                  بلوزتي
                </span>
              </div>
              <span className="text-[10px] tracking-[0.14em] uppercase font-bold text-slate-500 mt-1">
                MEDICAL &amp; WORKWEAR MAROC
              </span>
            </div>
          </Link>

          {/* Center: Clean Navigation Links */}
          <nav
            aria-label="Navigation principale"
            className="hidden lg:flex items-center gap-5 xl:gap-7 text-sm font-medium text-[#0B132B]/80"
          >
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  item.highlight
                    ? 'inline-flex items-center gap-1.5 text-[#0284C7] hover:text-[#0B132B] font-semibold transition-colors whitespace-nowrap'
                    : 'hover:text-[#0284C7] transition-colors whitespace-nowrap'
                }
              >
                {item.highlight && <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right: Language Switcher (FR / AR), WhatsApp Help (06 03 66 06 58), Cart */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Language Switcher FR / AR */}
            <div
              className="hidden sm:inline-flex items-center bg-[#F8FAFC] border border-slate-200/90 rounded-full p-0.5 shadow-2xs"
              role="group"
              aria-label="Sélecteur de langue"
            >
              <button
                type="button"
                onClick={() => setLang('FR')}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  lang === 'FR'
                    ? 'bg-[#0B132B] text-white shadow-xs'
                    : 'text-slate-500 hover:text-[#0B132B]'
                }`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setLang('AR')}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  lang === 'AR'
                    ? 'bg-[#0B132B] text-white shadow-xs'
                    : 'text-slate-500 hover:text-[#0B132B]'
                }`}
              >
                AR
              </button>
            </div>

            {/* WhatsApp Help Button (06 03 66 06 58) */}
            <a
              href={`https://wa.me/${whatsappNumber}?text=Bonjour%20Blouseti,%20j%27ai%20besoin%20d%27aide%20pour%20choisir%20ma%20tenue%20m%C3%A9dicale.`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('whatsapp_click', { source: 'header_desktop' })}
              className="hidden md:inline-flex items-center gap-2 text-xs font-semibold text-[#0B132B] bg-[#F8FAFC] hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 px-3.5 py-2 rounded-full border border-slate-200/90 transition-all shadow-2xs"
              title="Aide WhatsApp directe : 06 03 66 06 58"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="tabular-nums font-bold">06 03 66 06 58</span>
            </a>

            {/* Cart Button with Dynamic Counter */}
            <button
              type="button"
              onClick={openCart}
              className="relative p-2.5 rounded-full bg-[#0B132B] text-white hover:bg-[#0284C7] transition-all hover:scale-105 active:scale-95 shadow-md flex items-center justify-center cursor-pointer"
              aria-label="Voir le panier"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#0284C7] text-white text-[11px] font-black min-w-5 h-5 px-1 rounded-full flex items-center justify-center ring-2 ring-white">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 text-[#0B132B] bg-[#F8FAFC] hover:bg-slate-100 rounded-xl border border-slate-200/90 shadow-2xs transition-all active:scale-95 flex items-center justify-center cursor-pointer"
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu navigation'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mounted &&
        mobileMenuOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
            <div
              className="fixed inset-0 bg-[#0B132B]/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            <div className="fixed inset-y-0 left-0 max-w-[320px] w-[85%] h-full bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-300">
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFC] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-slate-200 bg-white p-0.5">
                    <Image src="/logo.png" alt="Blouseti Logo" fill className="object-contain" />
                  </div>
                  <div>
                    <span className="font-black text-[#0B132B] text-lg block leading-tight">
                      Blouseti
                    </span>
                    <span className="text-[10px] text-[#0284C7] font-bold uppercase tracking-wider">
                      Medical &amp; Workwear
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-[#0B132B] hover:bg-slate-200/60 transition-colors cursor-pointer"
                  aria-label="Fermer le menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Language Selector */}
              <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#0284C7]" />
                  {t('nav_language')}
                </span>
                <div className="inline-flex items-center bg-[#F8FAFC] border border-slate-200 rounded-full p-0.5">
                  <button
                    type="button"
                    onClick={() => setLang('FR')}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer ${
                      lang === 'FR' ? 'bg-[#0B132B] text-white' : 'text-slate-500'
                    }`}
                  >
                    FR
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang('AR')}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer ${
                      lang === 'AR' ? 'bg-[#0B132B] text-white' : 'text-slate-500'
                    }`}
                  >
                    AR
                  </button>
                </div>
              </div>

              {/* Drawer Navigation Links */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1.5 text-sm font-semibold text-[#0B132B] overscroll-contain">
                <Link
                  href="/#catalogue"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-[#F8FAFC] transition-colors"
                >
                  <span>{t('nav_all')}</span>
                </Link>
                <Link
                  href="/#scrub"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-sky-50 text-[#0B132B] transition-colors"
                >
                  <span>{t('nav_scrubs')}</span>
                  <span className="text-[10px] bg-sky-100 text-[#0284C7] font-bold px-2 py-0.5 rounded-full">
                    {t('nav_top')}
                  </span>
                </Link>
                <Link
                  href="/#blouse"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-[#F8FAFC] transition-colors"
                >
                  <span>{t('nav_blouses')}</span>
                </Link>
                <Link
                  href="/#polaire"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-[#F8FAFC] transition-colors"
                >
                  <span>{t('nav_polaires')}</span>
                </Link>
                <Link
                  href="/#cuisine"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-[#F8FAFC] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-[#0284C7]" />
                    {t('nav_hospitality')}
                  </span>
                  <UtensilsCrossed className="w-3.5 h-3.5 text-slate-400" />
                </Link>
                <Link
                  href="/#broderie"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-sky-50 text-[#0284C7] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#0284C7]" />
                    {t('nav_embroidery')}
                  </span>
                </Link>

                <div className="pt-2 border-t border-slate-100 my-2" />

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openSizeGuide();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl hover:bg-[#F8FAFC] text-slate-700 transition-colors text-start cursor-pointer"
                >
                  <Ruler className="w-4 h-4 text-[#0284C7]" />
                  <span>{t('nav_size_guide')}</span>
                </button>

                <Link
                  href="/#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl hover:bg-[#F8FAFC] text-slate-700 transition-colors text-start"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>{t('nav_contact')}</span>
                </Link>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-100 bg-[#F8FAFC] space-y-3 shrink-0">
                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{t('nav_cod_short')}</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white py-2.5 px-3 rounded-xl font-bold text-xs shadow-xs hover:opacity-95 transition-all"
                  >
                    <InstagramIcon className="w-3.5 h-3.5" />
                    <span>Instagram</span>
                  </a>
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#1877F2] hover:bg-[#166fe5] text-white py-2.5 px-3 rounded-xl font-bold text-xs shadow-xs hover:opacity-95 transition-all"
                  >
                    <FacebookIcon className="w-3.5 h-3.5" />
                    <span>Facebook</span>
                  </a>
                </div>

                <a
                  href={`https://wa.me/${whatsappNumber}?text=Bonjour%20Blouseti,%20j%27aimerais%20passer%20une%20commande.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('whatsapp_click', { source: 'drawer_mobile' })}
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl font-bold shadow-md text-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Aide WhatsApp (06 03 66 06 58)</span>
                </a>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}
