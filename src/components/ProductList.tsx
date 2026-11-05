'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Product, ProductCategory, Category } from '@/types';
import { PRODUCTS } from '@/data/products';
import { getDbProductsAction, DbProduct } from '@/app/actions/products';
import { getCategoriesAction } from '@/app/actions/categories';
import { FALLBACK_CATEGORIES } from '@/data/categories';
import { mapDbProductToProduct, filterActiveProducts, normalizeCategory } from '@/lib/products-helper';
import ProductCard from './ProductCard';
import { Sparkles, CheckCircle2, ChefHat, UtensilsCrossed, Stethoscope } from 'lucide-react';

interface ProductListProps {
  initialDbProducts?: DbProduct[];
  initialCategories?: Category[];
}

export default function ProductList({
  initialDbProducts,
  initialCategories,
}: ProductListProps) {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');
  const [dbCategories, setDbCategories] = useState<Category[]>(() => {
    if (initialCategories && initialCategories.length > 0) {
      return initialCategories;
    }
    return FALLBACK_CATEGORIES;
  });
  const [isLoading, setIsLoading] = useState(!initialDbProducts || initialDbProducts.length === 0);

  // Initial state populated from server props
  const [products, setProducts] = useState<Product[]>(() => {
    if (initialDbProducts && initialDbProducts.length > 0) {
      return filterActiveProducts(initialDbProducts.map(mapDbProductToProduct));
    }
    return [];
  });

  // Fetch latest products and categories from Supabase (client updates)
  const refreshData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        getDbProductsAction(),
        getCategoriesAction(),
      ]);

      if (prodRes && prodRes.success && prodRes.products) {
        const mapped = prodRes.products.map(mapDbProductToProduct);
        const activeOnly = filterActiveProducts(mapped);
        setProducts(activeOnly);
      }

      if (catRes && catRes.success && catRes.categories) {
        setDbCategories(catRes.categories);
      }
    } catch (err) {
      console.warn('Error refreshing data in ProductList:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch on client if initial products were not provided by SSR
    if (!initialDbProducts || initialDbProducts.length === 0) {
      refreshData();
    }

    // Auto-refresh when user switches back to this browser tab (e.g. from /admin/products)
    const handleFocus = () => {
      refreshData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // List of active categories from Supabase that are active or have products
  const displayCategories = useMemo(() => {
    const list: { id: string; label: string; icon?: string; count: number }[] = [
      { id: 'all', label: 'Toutes les Tenues', icon: '✨', count: products.length },
    ];

    dbCategories.forEach((cat) => {
      const count = products.filter(
        (p) =>
          normalizeCategory(p.category) === cat.slug ||
          p.category === cat.slug ||
          p.category.startsWith(cat.slug)
      ).length;

      // Include if active or has products
      if (cat.is_active || count > 0) {
        list.push({
          id: cat.slug,
          label: cat.name,
          icon: cat.icon,
          count,
        });
      }
    });

    return list;
  }, [dbCategories, products]);

  // Handle URL hash navigation (e.g. #cuisine, #hotellerie, #scrub, #blouse, #catalogue)
  useEffect(() => {
    const handleHash = () => {
      const rawHash = window.location.hash.replace('#', '').toLowerCase();
      // On homepage / or when navigating to #catalogue, #all, #collection: show ALL outfits
      if (!rawHash || rawHash === 'catalogue' || rawHash === 'all' || rawHash === 'collection') {
        setActiveCategory('all');
        return;
      }
      const normalized = normalizeCategory(rawHash);
      const match = displayCategories.find(
        (c) => c.id === rawHash || c.id === normalized
      );
      if (match) {
        setActiveCategory(match.id);
      } else {
        setActiveCategory('all');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [displayCategories]);

  // Render appropriate icons matching each professional category
  const renderTabIcon = (slug: string, fallbackIcon?: string) => {
    if (slug === 'cuisine') return <ChefHat className="w-4 h-4 text-amber-500" />;
    if (slug === 'hotellerie') return <UtensilsCrossed className="w-4 h-4 text-sky-500" />;
    if (slug === 'scrub' || slug === 'scrubs') return <Stethoscope className="w-4 h-4 text-sky-500" />;
    if (slug === 'all') return <Sparkles className="w-4 h-4 text-sky-400" />;
    return <span className="text-sm leading-none">{fallbackIcon || '👔'}</span>;
  };

  const { filteredProducts, otherProducts } = useMemo(() => {
    if (activeCategory === 'all') {
      return { filteredProducts: products, otherProducts: [] };
    }
    const matched: Product[] = [];
    const others: Product[] = [];
    products.forEach((p) => {
      if (
        normalizeCategory(p.category) === activeCategory ||
        p.category === activeCategory ||
        p.category.startsWith(activeCategory)
      ) {
        matched.push(p);
      } else {
        others.push(p);
      }
    });
    return { filteredProducts: matched, otherProducts: others };
  }, [products, activeCategory]);

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
            Tenues Professionnelles Médicales, Cuisine &amp; Hôtellerie
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Choisissez votre modèle, sélectionnez votre taille et votre couleur. Commandez en 1 clic sans payer d’avance (Paiement à la livraison partout au Maroc).
          </p>
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 mb-10 gap-2 no-scrollbar">
          {displayCategories.map((cat) => {
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  window.history.replaceState(null, '', cat.id === 'all' ? '#catalogue' : `#${cat.id}`);
                }}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer shadow-xs ${
                  isActive
                    ? 'bg-[#1B2A4A] text-white shadow-md scale-102 ring-2 ring-[#1B2A4A]/20'
                    : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                {renderTabIcon(cat.id, cat.icon)}
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {cat.count}
                </span>
                {(cat.id === 'cuisine' || cat.id === 'hotellerie') && (
                  <span className="text-[9px] bg-amber-500 text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                    Nouveau
                  </span>
                )}
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
          <div className="space-y-12">
            {/* Active filter banner with instant reset button */}
            {activeCategory !== 'all' && (
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 sm:px-6 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                    {renderTabIcon(activeCategory)}
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold block">
                      Rayon sélectionné
                    </span>
                    <span className="text-sm font-extrabold text-[#1B2A4A]">
                      {displayCategories.find((c) => c.id === activeCategory)?.label || activeCategory}
                      <span className="text-xs text-slate-500 font-semibold ml-1.5">
                        ({filteredProducts.length} modèle{filteredProducts.length > 1 ? 's' : ''})
                      </span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveCategory('all');
                    window.history.replaceState(null, '', '#catalogue');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#1B2A4A] hover:bg-[#111C32] text-white px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Afficher toutes les tenues ({products.length})</span>
                </button>
              </div>
            )}

            {/* Filtered Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProducts.map((product) => (
                <div key={product.id} id={product.category}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Other Outfits Section: always visible so visitors see the complete collection */}
            {otherProducts.length > 0 && (
              <div className="pt-10 border-t border-slate-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#1B2A4A] flex items-center gap-2">
                      <span>Découvrez également toutes nos autres tenues</span>
                      <span className="text-xs font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                        {otherProducts.length}
                      </span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Explorez l’ensemble de nos collections médicales, hôtelières et culinaires disponibles en stock
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveCategory('all');
                      window.history.replaceState(null, '', '#catalogue');
                    }}
                    className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <span>Voir tout le catalogue ({products.length})</span>
                    <span>→</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {otherProducts.map((product) => (
                    <div key={product.id} id={product.category}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            )}
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
