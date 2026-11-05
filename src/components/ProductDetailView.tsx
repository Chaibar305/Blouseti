'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  ShieldCheck,
  Truck,
  Ruler,
  Sparkles,
  Check,
  ShoppingBag,
  Zap,
  ChevronDown,
  Clock,
  ArrowRight,
  Package,
  RotateCcw,
  Scissors,
  CheckCircle2,
  Droplets,
  Wind,
  ShieldAlert,
  Share2,
} from 'lucide-react';
import { Product, ProductColor } from '@/types';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const { addToCart, openQuickCheckout, openSizeGuide } = useCart();

  // Selected State
  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    product.colors[0] || { name: 'Bleu Marine Médical', hex: '#1B2A4A', image: '/images/scrub-navy.jpg' }
  );
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[1] || product.sizes[0] || 'M');
  const [quantity, setQuantity] = useState<number>(1);
  const [isAddedAnimation, setIsAddedAnimation] = useState<boolean>(false);

  // Embroidery State
  const isPack = product.category === 'packs';
  const embroideryPrice =
    product.embroidery_price !== undefined && product.embroidery_price !== null
      ? Number(product.embroidery_price)
      : isPack
      ? 0
      : 45;
  const isFreeEmbroidery = embroideryPrice === 0;
  const [hasEmbroidery, setHasEmbroidery] = useState<boolean>(isFreeEmbroidery); // Activée par défaut si offerte
  const unitEmbroideryPrice = hasEmbroidery ? embroideryPrice : 0;
  const effectiveUnitPrice = product.price + unitEmbroideryPrice;
  const totalPrice = effectiveUnitPrice * quantity;
  const [embroideryName, setEmbroideryName] = useState<string>('Dr. ');
  const [embroiderySpeciality, setEmbroiderySpeciality] = useState<string>('');
  const [embroideryFont, setEmbroideryFont] = useState<'Moderne Classique' | 'Script Élégance' | 'Serif Prestige'>(
    'Script Élégance'
  );
  const [embroideryColor, setEmbroideryColor] = useState<'Blanc Pur' | 'Argenté Reflet' | 'Bleu Ciel' | 'Doré'>(
    'Argenté Reflet'
  );

  // Accordion open state
  const [openAccordion, setOpenAccordion] = useState<string | null>('desc');

  const toggleAccordion = (id: string) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  // Build gallery image list (stable order: primary images first, then any color images)
  const galleryImages: string[] = useMemo(() => {
    const list: string[] = [];
    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    product.colors?.forEach((c) => {
      const img = c.image_url || c.image;
      if (img && !list.includes(img)) list.push(img);
    });
    return list.length > 0 ? list : ['/images/scrub-navy.jpg'];
  }, [product]);

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Get active sizes for currently selected color
  const currentColorSizes = useMemo(() => {
    if (selectedColor?.sizes && selectedColor.sizes.length > 0) {
      return selectedColor.sizes.filter((s) => s.active !== false);
    }
    // Fallback if granular sizes are not configured
    return (product.sizes && product.sizes.length > 0 ? product.sizes : ['XS', 'S', 'M', 'L', 'XL', 'XXL']).map((s) => ({
      size: s,
      stock: product.stock_quantity ?? 10,
      active: true,
    }));
  }, [selectedColor, product.sizes, product.stock_quantity]);

  // Stock logic
  const isOutOfStock = Boolean(
    product.is_out_of_stock || (product.stock_quantity !== undefined && product.stock_quantity <= 0)
  );

  // Variant stock checking for current selected size in current selected color
  const currentVariant = currentColorSizes.find((s) => s.size === selectedSize);
  const currentVariantStock = currentVariant ? currentVariant.stock : 0;
  const isVariantOutOfStock = isOutOfStock || !currentVariant || currentVariantStock <= 0;

  // Synchronise le sélecteur de taille en fonction de la couleur activement sélectionnée
  const syncColorAndSize = (newColor: ProductColor) => {
    setSelectedColor(newColor);

    const availableSizes =
      newColor.sizes && newColor.sizes.length > 0
        ? newColor.sizes.filter((s) => s.active !== false)
        : (product.sizes || []).map((s) => ({ size: s, stock: product.stock_quantity ?? 10, active: true }));

    // Si la taille actuellement sélectionnée n'est plus disponible dans la nouvelle couleur choisie (ou stock === 0),
    // bascule automatiquement sur la première taille en stock
    const isCurrentStillInStock = availableSizes.some(
      (s) => s.size === selectedSize && s.stock > 0
    );

    if (!isCurrentStillInStock) {
      const firstInStock = availableSizes.find((s) => s.stock > 0);
      if (firstInStock) {
        setSelectedSize(firstInStock.size);
      } else if (availableSizes.length > 0) {
        setSelectedSize(availableSizes[0].size);
      }
    }
  };

  // Ensure initial size is valid on mount
  React.useEffect(() => {
    const initialSizes = selectedColor?.sizes?.filter((s) => s.active !== false);
    if (initialSizes && initialSizes.length > 0) {
      const isSelectedValid = initialSizes.some((s) => s.size === selectedSize && s.stock > 0);
      if (!isSelectedValid) {
        const firstInStock = initialSizes.find((s) => s.stock > 0);
        if (firstInStock) {
          setSelectedSize(firstInStock.size);
        }
      }
    }
  }, []);

  // When color is changed, find matching image, sync sizes, and update active image
  const handleColorChange = (color: ProductColor) => {
    syncColorAndSize(color);
    const targetImg = color.image_url || color.image;
    if (targetImg) {
      const idx = galleryImages.findIndex((img) => img === targetImg);
      if (idx !== -1) {
        setActiveImageIndex(idx);
      }
    }
  };

  // When thumbnail is clicked, switch photo AND auto-select matching color variant
  const handleThumbnailClick = (idx: number) => {
    setActiveImageIndex(idx);
    const clickedImg = galleryImages[idx];
    if (clickedImg && product.colors) {
      const matchingColor = product.colors.find(
        (c) => (c.image_url && c.image_url === clickedImg) || (c.image && c.image === clickedImg)
      );
      if (matchingColor) {
        syncColorAndSize(matchingColor);
      }
    }
  };

  const isLowStock =
    !isOutOfStock &&
    product.stock_quantity !== undefined &&
    product.stock_quantity > 0 &&
    product.stock_quantity <= 5;

  // Discount percentage calculation
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  // Handlers
  const handleQuickBuy = () => {
    if (isVariantOutOfStock) return;
    openQuickCheckout({
      id: `${product.id}-${selectedColor.name}-${selectedSize}`,
      product,
      selectedColor,
      selectedSize,
      quantity,
      embroidery: hasEmbroidery
        ? {
            enabled: true,
            fullName: embroideryName,
            speciality: embroiderySpeciality,
            font: embroideryFont,
            color: embroideryColor,
            price: embroideryPrice,
          }
        : undefined,
    });
  };

  const handleAddToCart = () => {
    if (isVariantOutOfStock) return;
    addToCart({
      id: `${product.id}-${selectedColor.name}-${selectedSize}`,
      product,
      selectedColor,
      selectedSize,
      quantity,
      embroidery: hasEmbroidery
        ? {
            enabled: true,
            fullName: embroideryName,
            speciality: embroiderySpeciality,
            font: embroideryFont,
            color: embroideryColor,
            price: embroideryPrice,
          }
        : undefined,
    });
    setIsAddedAnimation(true);
    setTimeout(() => setIsAddedAnimation(false), 1500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.subtitle,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien du produit copié dans le presse-papier !');
    }
  };

  return (
    <div className="bg-slate-50/50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 flex-wrap">
          <Link href="/" className="hover:text-sky-600 transition-colors">
            Accueil
          </Link>
          <span>/</span>
          <Link href="/#catalogue" className="hover:text-sky-600 transition-colors">
            Catalogue
          </Link>
          <span>/</span>
          <Link
            href={`/#${product.category}`}
            className="hover:text-sky-600 transition-colors capitalize"
          >
            {product.category === 'scrubs'
              ? 'Scrubs Médicaux'
              : product.category === 'blouses'
              ? 'Blouses Blanches'
              : product.category === 'vestes'
              ? 'Vestes & Polaires'
              : 'Packs Soignants'}
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold truncate max-w-xs sm:max-w-md">
            {product.name}
          </span>
        </nav>

        {/* Main Product Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ======================================================== */}
          {/* COLONNE GAUCHE (Galerie Photos Interactive)              */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 lg:sticky lg:top-24">
            
            {/* Thumbnails (Vertical on desktop, horizontal on mobile) */}
            <div className="flex sm:flex-col gap-2.5 sm:gap-3 overflow-x-auto sm:overflow-y-auto max-h-[560px] no-scrollbar shrink-0 py-1 sm:py-0">
              {galleryImages.map((img, idx) => {
                const isActive = activeImageIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleThumbnailClick(idx)}
                    className={`relative w-14 h-14 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white border-2 transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'border-[#1B2A4A] ring-2 ring-[#1B2A4A]/20 scale-102 shadow-sm'
                        : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} photo ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                    {product.colors?.find((c) => (c.image_url || c.image) === img) && (
                      <span
                        className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-white shadow-xs z-10"
                        style={{
                          backgroundColor: product.colors.find((c) => (c.image_url || c.image) === img)?.hex,
                        }}
                        title={`Couleur : ${product.colors.find((c) => (c.image_url || c.image) === img)?.name}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Main Interactive Hero Image */}
            <div className="relative flex-1 aspect-square sm:aspect-4/5 rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-md">
              <Image
                src={galleryImages[activeImageIndex] || selectedColor.image_url || selectedColor.image || product.colors[0]?.image || '/images/scrub-navy.jpg'}
                alt={`${product.name} - ${selectedColor.name}`}
                fill
                priority
                className={`object-cover object-center transition-transform duration-500 hover:scale-105 ${
                  isOutOfStock ? 'grayscale-20' : ''
                }`}
                sizes="(max-width: 1024px) 100vw, 55vw"
              />

              {/* Promo & Stock Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 items-start">
                {discountPercent && (
                  <span className="bg-red-600 text-white text-xs sm:text-sm font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                    <span>-{discountPercent}%</span>
                    <span className="text-[10px] font-medium uppercase">Remise</span>
                  </span>
                )}
                {product.badge && (
                  <span className="bg-[#1B2A4A]/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {product.badge}
                  </span>
                )}
                {isLowStock && (
                  <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    ⚡ Plus que {product.stock_quantity} pièces en stock
                  </span>
                )}
              </div>

              {/* Share button */}
              <button
                type="button"
                onClick={handleShare}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-slate-700 hover:text-sky-600 flex items-center justify-center shadow-md transition-all hover:scale-110"
                title="Partager ce produit"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Active Color Pill Overlay */}
              <div className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full border border-white"
                  style={{ backgroundColor: selectedColor.hex }}
                />
                <span>{selectedColor.name}</span>
              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* COLONNE DROITE (Détails & Achat Express Beez.ma)         */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            
            {/* Title & Subtitle */}
            <div>
              {/* Reviews Stars */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-800">{product.rating} / 5</span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-medium text-slate-500">
                  ({product.reviewCount} avis vérifiés de médecins au Maroc)
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A4A] tracking-tight leading-tight">
                {product.name}
              </h1>
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                {product.subtitle}
              </p>
            </div>

            {/* Price Box */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-baseline justify-between">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-[#1B2A4A] tracking-tight">
                    {effectiveUnitPrice}{' '}
                    <span className="text-lg sm:text-xl font-bold text-sky-700">DH</span>
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg line-through text-slate-400 font-semibold">
                      {product.originalPrice + unitEmbroideryPrice} DH
                    </span>
                  )}
                </div>
                {hasEmbroidery && (
                  <p className="text-xs font-bold mt-1">
                    {isFreeEmbroidery ? (
                      <span className="text-emerald-600">✓ Broderie prénom &amp; fonction offerte (0 DH)</span>
                    ) : (
                      <span className="text-amber-700">Inclut la broderie personnalisée (+{embroideryPrice} DH)</span>
                    )}
                  </p>
                )}
                {product.originalPrice && !hasEmbroidery && (
                  <p className="text-xs font-bold text-emerald-600 mt-1">
                    Économisez {product.originalPrice - product.price} DH immédiatement
                  </p>
                )}
              </div>

              <div className="text-right">
                <span className="inline-block text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
                  Paiement à la livraison
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Livraison sous 24h-48h</p>
              </div>
            </div>

            {/* Color Swatches Selector */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Couleur sélectionnée :{' '}
                  <strong className="text-slate-900 font-bold">{selectedColor.name}</strong>
                </span>
                <span className="text-[11px] text-slate-400">{product.colors.length} coloris</span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {product.colors.map((color) => {
                  const isSelected = selectedColor.name === color.name;
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => handleColorChange(color)}
                      className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#1B2A4A] bg-[#1B2A4A]/5 ring-2 ring-[#1B2A4A]/20 shadow-xs font-bold text-[#1B2A4A]'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-xs"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selector */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Taille : <strong className="text-slate-900 font-bold">{selectedSize}</strong>
                  {currentVariant && currentVariant.stock > 0 && (
                    <span className="text-[11px] text-emerald-600 font-medium ml-2">
                      ({currentVariant.stock} en stock)
                    </span>
                  )}
                  {isVariantOutOfStock && (
                    <span className="text-[11px] text-red-600 font-bold ml-2">
                      (Épuisé pour {selectedColor.name})
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={openSizeGuide}
                  className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 font-bold text-xs cursor-pointer transition-colors"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Guide des tailles</span>
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {currentColorSizes.map((variant) => {
                  const isSelected = selectedSize === variant.size;
                  const isSizeOutOfStock = variant.stock <= 0;
                  return (
                    <button
                      key={variant.size}
                      type="button"
                      disabled={isSizeOutOfStock}
                      onClick={() => {
                        if (!isSizeOutOfStock) setSelectedSize(variant.size);
                      }}
                      title={
                        isSizeOutOfStock
                          ? `${variant.size} - Rupture de stock (${selectedColor.name})`
                          : `${variant.size} (${variant.stock} pièces en stock)`
                      }
                      className={`relative py-2.5 text-xs sm:text-sm font-extrabold rounded-xl border transition-all ${
                        isSizeOutOfStock
                          ? 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-50 cursor-not-allowed select-none'
                          : isSelected
                          ? 'bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-md scale-102 ring-2 ring-[#1B2A4A]/20 cursor-pointer'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300 cursor-pointer'
                      }`}
                    >
                      <span>{variant.size}</span>
                      {isSizeOutOfStock ? (
                        <span className="block text-[9px] font-bold text-red-500 no-underline leading-none mt-0.5">
                          0 pcs
                        </span>
                      ) : variant.stock <= 3 ? (
                        <span className="block text-[9px] font-bold text-amber-600 leading-none mt-0.5">
                          {variant.stock} rest.
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Embroidery Customization Option */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasEmbroidery}
                    onChange={(e) => setHasEmbroidery(e.target.checked)}
                    className="w-4 h-4 text-[#1B2A4A] rounded-sm focus:ring-[#1B2A4A] cursor-pointer"
                  />
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5 text-amber-600" />
                      <span>Ajouter une broderie personnalisée</span>
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Brodé sur la poche poitrine dans nos ateliers marocains.
                    </p>
                  </div>
                </label>

                <span
                  className={`text-xs font-black px-2.5 py-1 rounded-full ${
                    isFreeEmbroidery
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isFreeEmbroidery ? 'OFFERTE (0 DH)' : `+${embroideryPrice} DH`}
                </span>
              </div>

              {/* Expanded Embroidery Form */}
              {hasEmbroidery && (
                <div className="pt-3 border-t border-slate-100 space-y-3 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Nom & Titre <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={embroideryName}
                        onChange={(e) => setEmbroideryName(e.target.value)}
                        placeholder="Ex: Dr. S. Bennani"
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Spécialité (Facultatif)
                      </label>
                      <input
                        type="text"
                        value={embroiderySpeciality}
                        onChange={(e) => setEmbroiderySpeciality(e.target.value)}
                        placeholder="Ex: Cardiologue / CHU"
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-400"
                      />
                    </div>
                  </div>

                  {/* Font and Thread Color Options */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Style d'écriture
                      </label>
                      <select
                        value={embroideryFont}
                        onChange={(e) => setEmbroideryFont(e.target.value as any)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 focus:bg-white focus:outline-hidden"
                      >
                        <option value="Script Élégance">Script Élégance (Italique)</option>
                        <option value="Moderne Classique">Moderne Classique</option>
                        <option value="Serif Prestige">Serif Prestige</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Couleur du fil
                      </label>
                      <select
                        value={embroideryColor}
                        onChange={(e) => setEmbroideryColor(e.target.value as any)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 focus:bg-white focus:outline-hidden"
                      >
                        <option value="Argenté Reflet">Argenté Reflet</option>
                        <option value="Blanc Pur">Blanc Pur</option>
                        <option value="Bleu Ciel">Bleu Ciel</option>
                        <option value="Doré">Doré Prestige</option>
                      </select>
                    </div>
                  </div>

                  {/* Preview Banner */}
                  <div className="p-2.5 rounded-lg bg-slate-900 text-white flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">Aperçu poche poitrine :</span>
                    <span className="font-serif italic font-bold tracking-wide text-amber-300">
                      {embroideryName || 'Dr. Votre Nom'}
                      {embroiderySpeciality ? ` • ${embroiderySpeciality}` : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Selector & CTAs */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-3 hover:bg-slate-100 text-slate-700 font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 py-3 text-sm font-black text-slate-900 min-w-[36px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3.5 py-3 hover:bg-slate-100 text-slate-700 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Secondary Add to Cart Button */}
                <button
                  type="button"
                  onClick={!isVariantOutOfStock ? handleAddToCart : undefined}
                  disabled={isVariantOutOfStock}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                    isVariantOutOfStock
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : isAddedAnimation
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md cursor-pointer'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-xs cursor-pointer'
                  }`}
                >
                  {isAddedAnimation ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Ajouté au panier !</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-slate-600" />
                      <span>Ajouter au panier</span>
                    </>
                  )}
                </button>
              </div>

              {/* Main Beez.ma Inspired 1-Click COD CTA */}
              <button
                type="button"
                onClick={!isVariantOutOfStock ? handleQuickBuy : undefined}
                disabled={isVariantOutOfStock}
                className={`w-full py-4 px-6 rounded-2xl text-sm sm:text-base font-black transition-all flex items-center justify-center gap-2 shadow-xl ${
                  isVariantOutOfStock
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'btn-shimmer bg-[#1B2A4A] hover:bg-[#111C32] text-white active:scale-98 shadow-[#1B2A4A]/25 cursor-pointer'
                }`}
              >
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
                <span>
                  {isOutOfStock
                    ? 'PRODUIT TEMPORAIREMENT ÉPUISÉ'
                    : isVariantOutOfStock
                    ? 'TAILLE ÉPUISÉE POUR CE COLORIS'
                    : `COMMANDER EN 1 CLIC • ${totalPrice} DH`}
                </span>
                {!isVariantOutOfStock && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>

            {/* Delivery Timeline (Beez.ma 3-step timeline) */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Déroulement de votre commande
              </h4>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                  </div>
                  <p className="text-xs font-bold text-slate-900">1. Commandé aujourd'hui</p>
                  <p className="text-[11px] text-slate-500">
                    Validation immédiate sans paiement requis à l'avance.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-sky-500 border-2 border-white shadow-xs flex items-center justify-center">
                    <Clock className="w-2.5 h-2.5 text-white" />
                  </div>
                  <p className="text-xs font-bold text-slate-900">2. Expédié sous 24h à 48h</p>
                  <p className="text-[11px] text-slate-500">
                    Préparé avec soin dans nos ateliers et remis au transporteur express.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-xs flex items-center justify-center">
                    <Truck className="w-2.5 h-2.5 text-white" />
                  </div>
                  <p className="text-xs font-bold text-slate-900">3. Livré partout au Maroc</p>
                  <p className="text-[11px] text-slate-500">
                    Paiement en espèces à la réception de votre colis.
                  </p>
                </div>
              </div>
            </div>

            {/* Accordions (Collapsible FAQ under the CTA) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
              
              {/* Accordion 1: Description détaillée */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleAccordion('desc')}
                  className="w-full px-5 py-4 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-[#1B2A4A] hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-sky-600" />
                    <span>Description détaillée & Poches</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      openAccordion === 'desc' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openAccordion === 'desc' && (
                  <div className="px-5 pb-5 text-xs text-slate-600 space-y-3 leading-relaxed animate-in fade-in duration-150">
                    <p>{product.long_description || product.description}</p>
                    {product.features && product.features.length > 0 && (
                      <ul className="space-y-1.5 pt-1">
                        {product.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Accordion 2: Comment ça taille ? */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleAccordion('sizing')}
                  className="w-full px-5 py-4 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-[#1B2A4A] hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-sky-600" />
                    <span>Comment ça taille ?</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      openAccordion === 'sizing' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openAccordion === 'sizing' && (
                  <div className="px-5 pb-5 text-xs text-slate-600 space-y-2 leading-relaxed animate-in fade-in duration-150">
                    <p>
                      <strong>Coupe :</strong> {product.fit || 'Coupe moderne semi-ajustée'}.
                    </p>
                    <p>
                      Ce modèle taille <strong>normalement</strong>. Si vous hésitez entre deux tailles ou préférez une tenue plus ample pour les gardes de 24h, nous vous recommandons de choisir la taille au-dessus.
                    </p>
                    <button
                      type="button"
                      onClick={openSizeGuide}
                      className="text-sky-600 hover:underline font-bold inline-flex items-center gap-1 pt-1"
                    >
                      Consulter le tableau complet des mensurations en cm →
                    </button>
                  </div>
                )}
              </div>

              {/* Accordion 3: Composition du tissu */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleAccordion('fabric')}
                  className="w-full px-5 py-4 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-[#1B2A4A] hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-sky-600" />
                    <span>Composition du tissu & Technologie</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      openAccordion === 'fabric' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openAccordion === 'fabric' && (
                  <div className="px-5 pb-5 text-xs text-slate-600 space-y-2 leading-relaxed animate-in fade-in duration-150">
                    <p>
                      <strong>Matière :</strong> {product.fabric || 'Microfibre technique 4-Way Stretch (72% Polyester, 21% Rayonne, 7% Élasthanne)'}.
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-sky-600" />
                        <span>Déperlant anti-taches</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-2">
                        <Wind className="w-4 h-4 text-sky-600" />
                        <span>Infroissable sans repassage</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 4: Retours & Échanges */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleAccordion('returns')}
                  className="w-full px-5 py-4 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-[#1B2A4A] hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-sky-600" />
                    <span>Retours & Échanges sous 48h</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      openAccordion === 'returns' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openAccordion === 'returns' && (
                  <div className="px-5 pb-5 text-xs text-slate-600 space-y-2 leading-relaxed animate-in fade-in duration-150">
                    <p>
                      <strong>Échange de taille facile et rapide :</strong> si après essayage la taille ne vous convient pas parfaitement, envoyez-nous simplement un message WhatsApp dans les 48h suivant la réception.
                    </p>
                    <p>
                      Notre transporteur viendra récupérer l'article et vous livrera la nouvelle taille sans tracas.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 5: Conseils d'entretien */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleAccordion('care')}
                  className="w-full px-5 py-4 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-[#1B2A4A] hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <span>Conseils d'entretien</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      openAccordion === 'care' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openAccordion === 'care' && (
                  <div className="px-5 pb-5 text-xs text-slate-600 space-y-2 leading-relaxed animate-in fade-in duration-150">
                    <ul className="space-y-1.5 list-disc pl-4">
                      <li>Lavage en machine recommandé à 40°C (tolère jusqu'à 60°C en milieu hospitalier).</li>
                      <li>Laver les couleurs similaires ensemble.</li>
                      <li>Séchage rapide sur cintre à l'air libre.</li>
                      <li>Repassage superflu grâce au tissu thermo-résilient anti-froissage.</li>
                    </ul>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* ======================================================== */}
        {/* SECTION "VA BIEN AVEC" / PRODUITS RECOMMANDÉS            */}
        {/* ======================================================== */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-3">
              <div>
                <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                  Complétez votre tenue médicale
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#1B2A4A] tracking-tight mt-1">
                  Les soignants ont aussi commandé
                </h2>
              </div>
              <Link
                href="/#catalogue"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-800 transition-colors"
              >
                <span>Voir toute la collection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
