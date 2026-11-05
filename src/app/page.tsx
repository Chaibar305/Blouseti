import React from 'react';
import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import TrustBar from '@/components/TrustBar';
import ProductList from '@/components/ProductList';
import EmbroiderySection from '@/components/EmbroiderySection';
import Testimonials from '@/components/Testimonials';
import FaqSection from '@/components/FaqSection';
import Footer from '@/components/Footer';
import { getDbProductsAction } from '@/app/actions/products';
import { getCategoriesAction } from '@/app/actions/categories';
import { FALLBACK_CATEGORIES } from '@/data/categories';

export const instant = false;

export default async function HomePage() {
  const [productsRes, categoriesRes] = await Promise.all([
    getDbProductsAction().catch(() => ({ success: false, products: [] })),
    getCategoriesAction().catch(() => ({ success: false, categories: FALLBACK_CATEGORIES })),
  ]);

  const initialDbProducts = productsRes.success && productsRes.products ? productsRes.products : [];
  const initialCategories = categoriesRes.success && categoriesRes.categories ? categoriesRes.categories : FALLBACK_CATEGORIES;
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Blouseti',
    alternateName: 'بلوزتي',
    url: 'https://blouseti.shop',
    logo: 'https://blouseti.shop/logo.png',
    description:
      'Fabricant et distributeur de tenues médicales haut de gamme au Maroc : scrubs 4-Way Stretch, blouses blanches et vestes de bloc.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Casablanca',
      addressCountry: 'MA',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+212660123456',
      contactType: 'customer service',
      areaServed: 'MA',
      availableLanguage: ['French', 'Arabic'],
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <TopBar />
      <Header />
      <main className="flex-1">
        <Hero />
        <TrustBar />
        <ProductList
          initialDbProducts={initialDbProducts}
          initialCategories={initialCategories}
        />
        <EmbroiderySection />
        <Testimonials />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
