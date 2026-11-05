import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { SettingsProvider } from '@/context/SettingsContext';
import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';
import CodCheckoutModal from '@/components/CodCheckoutModal';
import SizeGuideModal from '@/components/SizeGuideModal';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import MobileBottomCta from '@/components/MobileBottomCta';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://blouseti.shop'),
  title: {
    default: 'Blouseti (بلوزتي) | Scrubs, Blouses Médicales & Tenues Soignants au Maroc',
    template: '%s | Blouseti Maroc',
  },
  description:
    'Confort & Élégance au quotidien pour les soignants du Maroc. Scrubs 4-Way Stretch respirants, blouses blanches, vestes polaires et broderie personnalisée de votre nom. Paiement Cash à la livraison (COD) 24-48h partout au Maroc.',
  keywords: [
    'scrubs maroc',
    'blouse medicale maroc',
    'tenue medicale casablanca',
    'blouseti',
    'vetement soignant rabat',
    'scrub stretch maroc',
    'broderie blouse docteur maroc',
    'uniforme medical marrakech',
    'equimed maroc',
    'beez scrubs',
    'blouseti.shop',
  ],
  alternates: {
    canonical: 'https://blouseti.shop',
  },
  openGraph: {
    title: 'Blouseti (بلوزتي) | Scrubs, Blouses Médicales & Workwear Maroc',
    description:
      'Confort & Élégance au quotidien pour les soignants du Maroc. Scrubs 4-Way Stretch, blouses blanches prestige et broderie personnalisée. Paiement Cash à la livraison 24-48h partout au Maroc.',
    url: 'https://blouseti.shop',
    siteName: 'Blouseti Maroc',
    locale: 'fr_MA',
    type: 'website',
    images: [
      {
        url: '/images/hero-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'Blouseti - Vêtements Médicaux Professionnels au Maroc',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blouseti (بلوزتي) | Scrubs & Blouses Médicales au Maroc',
    description:
      'La tenue médicale haute performance réinventée pour les médecins et soignants du Maroc. Paiement à la livraison.',
    images: ['/images/hero-banner.jpg'],
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#1B2A4A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

import { Suspense } from 'react';
import PixelScripts from '@/components/PixelScripts';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} scroll-smooth`}>
      <body className="min-h-screen flex flex-col font-sans bg-[#F8FAFC] text-slate-800 antialiased selection:bg-sky-500 selection:text-white">
        <SettingsProvider>
          {/* Dynamic Pixels & Custom Scripts */}
          <PixelScripts />
          <CartProvider>
            {children}
            {/* Global Modals & Drawers */}
            <CartDrawer />
            <CodCheckoutModal />
            <SizeGuideModal />
            <Suspense fallback={null}>
              <WhatsAppFloat />
              <MobileBottomCta />
            </Suspense>
          </CartProvider>
        </SettingsProvider>
        {/* Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  );
}
