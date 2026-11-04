'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductCategory } from '@/types';
import { PRODUCTS } from '@/data/products';
import { getDbProductsAction, DbProduct } from '@/app/actions/products';
import { mapDbProductToProduct, filterActiveProducts } from '@/lib/products-helper';
import ProductCard from './ProductCard';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface ProductListProps {
  initialDbProducts?: DbProduct[];
}

export default function ProductList({ initialDbProducts }: ProductListProps) {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');

  const [isLoading, setIsLoading] = useState(true);

  // Initial state empty until Supabase returns active products
  const [products, setProducts] = useState<Product[]>(() => {
    if (initialDbProducts && initialDbProducts.length > 0) {
      return filterActiveProducts(initialDbProducts.map(mapDbProductToProduct));
    }
    return [];
  });

  // Fetch latest products from Supabase and filter out masked (is_active: false) products
  const refreshProducts = async () => {
    try {
      const res = await getDbProductsAction();
      if (res && res.success && res.products) {
        const mapped = res.products.map(mapDbProductToProduct);
        const activeOnly = filterActiveProducts(mapped);
        setProducts(activeOnly);
      }
    } catch (err) {
      console.warn('Error refreshing products in ProductList:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProducts();

    // Auto-refresh when user switches back to this browser tab (e.g. from /admin/products)
    const handleFocus = () => {
      refreshProducts();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Handle URL hash navigation (e.g. #blouses, #scrubs)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (['scrubs', 'blouses', 'vestes', 'packs'].includes(hash)) {
        setActiveCategory(hash as ProductCategory);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const categories: { id: ProductCategory; label: string; icon: string }[] = [
    { id: 'all', label: 'Toute la Collection', icon: '✨' },
    { id: 'scrubs', label: 'Scrubs Médicaux', icon: '🩺' },
    { id: 'blouses', label: 'Blouses Blanches', icon: '🥼' },
    { id: 'vestes', label: 'Vestes & Polaires', icon: '🧥' },
    { id: 'packs', label: 'Packs Duo Soignants', icon: '🎁' },
  ];

  // Dynamic counts reflecting strictly ACTIVE products
  const categoryCounts: Record<ProductCategory, number> = {
    all: products.length,
    scrubs: products.filter((p) => p.category === 'scrubs').length,
    blouses: products.filter((p) => p.category === 'blouses').length,
    vestes: products.filter((p) => p.category === 'vestes').length,
    packs: products.filter((p) => p.category === 'packs').length,
  };

  const filteredProducts =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <section id="catalogue" className="py-16 bg-slate-50/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-sky-100/80 text-sky-800 px-3.5 py-1.5 rounded-full text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Catalogue Officiel Blouseti.shop</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1B2A4A] tracking-tight">
            Tenues & Uniformes Médicaux Premium
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Choisissez votre modèle, sélectionnez votre taille et votre couleur. Commandez en 1 clic sans payer d’avance (Paiement à la livraison partout au Maroc).
          </p>
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 mb-10 gap-2 no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count = categoryCounts[cat.id];

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer shadow-xs ${
                  isActive
                    ? 'bg-[#1B2A4A] text-white shadow-md scale-102 ring-2 ring-[#1B2A4A]/20'
                    : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 animate-pulse flex flex-col space-y-4 shadow-xs"
              >
                <div className="aspect-square w-full bg-slate-100 rounded-xl" />
                <div className="h-4 bg-slate-100 rounded-md w-3/4" />
                <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                <div className="h-10 bg-slate-100 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} id={product.category}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          /* Reassuring empty state when category has no active items */
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center text-3xl">
              🩺
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Modèles temporairement indisponibles
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Les tenues de cette catégorie sont momentanément en cours de réapprovisionnement ou personnalisation d&apos;atelier.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setActiveCategory('all')}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#1B2A4A] text-white rounded-xl text-xs font-bold hover:bg-[#111C32] transition-colors cursor-pointer"
              >
                Voir toute la collection ({products.length})
              </button>
              <a
                href="https://wa.me/212660889900?text=Bonjour%20Blouseti,%20je%20souhaite%20des%20informations%20sur%20les%20disponibilit%C3%A9s."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
              >
                Demander sur WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* Reassuring footer banner for the catalog */}
        <div className="mt-12 bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left shadow-xs">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 flex items-center justify-center md:justify-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Commande pour votre clinique, cabinet ou promotion d&apos;étudiants ?</span>
            </h4>
            <p className="text-xs text-slate-500">
              Bénéficiez de remises volume dès 5 pièces avec broderie du logo de votre établissement.
            </p>
          </div>
          <a
            href="https://wa.me/212660889900?text=Bonjour%20Blouseti,%20je%20souhaite%20un%20devis%20de%20commande%20group%C3%A9e%20pour%20notre%20clinique/cabinet."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shrink-0 shadow-sm"
          >
            Demander un devis sur WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
