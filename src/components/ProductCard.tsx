'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingBag, Zap, Ruler, Sparkles, Check } from 'lucide-react';
import { Product, ProductColor } from '@/types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, openQuickCheckout, openSizeGuide } = useCart();
  
  // Selected state
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[1] || product.sizes[0]);
  const [isAddedAnimation, setIsAddedAnimation] = useState(false);

  // Quick 1-Click COD checkout
  const handleQuickBuy = () => {
    openQuickCheckout({
      id: `${product.id}-${selectedColor.name}-${selectedSize}`,
      product,
      selectedColor,
      selectedSize,
      quantity: 1,
      embroidery: {
        enabled: false,
        fullName: '',
        speciality: '',
        font: 'Moderne Classique',
        color: 'Blanc Pur',
        price: 20
      }
    });
  };

  // Add to cart
  const handleAddToCart = () => {
    addToCart({
      id: `${product.id}-${selectedColor.name}-${selectedSize}`,
      product,
      selectedColor,
      selectedSize,
      quantity: 1,
      embroidery: {
        enabled: false,
        fullName: '',
        speciality: '',
        font: 'Moderne Classique',
        color: 'Blanc Pur',
        price: 20
      }
    });
    setIsAddedAnimation(true);
    setTimeout(() => setIsAddedAnimation(false), 1200);
  };

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const isOutOfStock = Boolean(
    product.is_out_of_stock || (product.stock_quantity !== undefined && product.stock_quantity <= 0)
  );
  const isLowStock =
    !isOutOfStock &&
    product.stock_quantity !== undefined &&
    product.stock_quantity > 0 &&
    product.stock_quantity <= 5;

  // Multi-image list (combining uploaded images and color images)
  const productImages: string[] = React.useMemo(() => {
    const list: string[] = [];
    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => {
        if (!list.includes(img)) list.push(img);
      });
    }
    if (selectedColor?.image && !list.includes(selectedColor.image)) {
      list.unshift(selectedColor.image);
    }
    product.colors.forEach((c) => {
      if (c.image && !list.includes(c.image)) list.push(c.image);
    });
    return list.length > 0 ? list : ['/images/scrub-navy.jpg'];
  }, [product, selectedColor]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        // swipe left -> next
        setActiveImageIndex((prev) => (prev + 1) % productImages.length);
      } else {
        // swipe right -> prev
        setActiveImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
      }
    }
    setTouchStartX(null);
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.subtitle,
    image: productImages.map((img) =>
      img.startsWith('http') ? img : `https://blouseti.shop${img}`
    ),
    brand: {
      '@type': 'Brand',
      name: 'Blouseti',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'MAD',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: isOutOfStock
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Blouseti Maroc',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: String(product.rating),
      reviewCount: String(product.reviewCount),
      bestRating: '5',
      worstRating: '1',
    },
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      
      {/* Top badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {isOutOfStock ? (
          <span className="bg-rose-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Épuisé
          </span>
        ) : (
          <>
            {product.badge && (
              <span className="bg-[#1B2A4A] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                {product.badge}
              </span>
            )}
            {isLowStock && (
              <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                ⚡ Plus que {product.stock_quantity} en stock
              </span>
            )}
            {discountPercent && (
              <span className="bg-red-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                -{discountPercent}%
              </span>
            )}
          </>
        )}
      </div>

      {/* Product Image with Hover Zoom & Touch Swipe (Mobile) */}
      <Link
        href={`/products/${product.slug || product.id}`}
        className={`block relative aspect-square w-full bg-slate-50 overflow-hidden select-none ${
          isOutOfStock ? 'cursor-default opacity-85' : 'cursor-pointer'
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={productImages[activeImageIndex] || selectedColor.image || product.colors[0].image}
          alt={`${product.name} - ${selectedColor.name}`}
          fill
          className={`object-cover object-center transition-transform duration-500 ease-out ${
            !isOutOfStock ? 'group-hover:scale-106' : 'grayscale-20'
          }`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
        
        {/* Quick color indicator pill on image */}
        <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-md z-10">
          {selectedColor.name}
        </div>

        {/* Swipe dots indicator if multiple images */}
        {productImages.length > 1 && (
          <div
            className="absolute bottom-2.5 right-2.5 flex items-center gap-1 z-10 bg-black/40 backdrop-blur-xs px-2 py-1 rounded-full"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {productImages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveImageIndex(i);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  activeImageIndex === i ? 'bg-white w-3' : 'bg-white/50'
                }`}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
        )}
      </Link>

      {/* Product Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div>
          {/* Rating stars & review count */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="font-bold text-slate-700 ml-1">{product.rating}</span>
              <span className="text-slate-400">({product.reviewCount})</span>
            </div>
            
            <button
              onClick={openSizeGuide}
              className="text-slate-500 hover:text-sky-600 flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer"
            >
              <Ruler className="w-3 h-3 text-sky-500" />
              <span>Tailles</span>
            </button>
          </div>

          {/* Product Name (Link to dedicated page) */}
          <Link href={`/products/${product.slug || product.id}`} className="block group/title">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover/title:text-[#1B2A4A] group-hover/title:underline transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {product.subtitle}
          </p>

          {/* Color Swatches */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
              <span className="font-medium">Couleur :</span>
              <span className="font-bold text-slate-800">{selectedColor.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {product.colors.map((color) => {
                const isSelected = selectedColor.name === color.name;
                return (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    aria-label={color.name}
                    className={`w-7 h-7 rounded-full transition-all relative flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-sky-500 ring-offset-2 scale-110 shadow-sm'
                        : 'hover:scale-105 border border-slate-300'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {isSelected && (
                      <span className={`w-2 h-2 rounded-full ${color.hex === '#FFFFFF' ? 'bg-slate-900' : 'bg-white'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Pills */}
          <div className="mt-3.5">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
              <span className="font-medium">Taille :</span>
              <span className="font-bold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded">{selectedSize}</span>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {product.sizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pricing & CTA Buttons */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#1B2A4A] tracking-tight">
                {product.price} <span className="text-sm font-bold">DH</span>
              </span>
              {product.originalPrice && (
                <span className="text-sm line-through text-slate-400">
                  {product.originalPrice} DH
                </span>
              )}
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Paiement à la livraison
            </span>
          </div>

          {/* Beez.ma inspired 1-Click COD checkout button */}
          <div className="grid grid-cols-5 gap-2">
            <button
              onClick={!isOutOfStock ? handleQuickBuy : undefined}
              disabled={isOutOfStock}
              className={`col-span-4 py-3 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 ${
                isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-80'
                  : 'btn-shimmer bg-[#1B2A4A] hover:bg-[#111C32] text-white shadow-md cursor-pointer active:scale-98'
              }`}
            >
              <Zap
                className={`w-4 h-4 shrink-0 ${
                  isOutOfStock ? 'text-slate-400' : 'text-amber-400 fill-amber-400'
                }`}
              />
              <span>{isOutOfStock ? 'Épuisé (Rupture temporaire)' : 'Acheter en 1 Clic (COD)'}</span>
            </button>

            <button
              onClick={!isOutOfStock ? handleAddToCart : undefined}
              disabled={isOutOfStock}
              className={`col-span-1 border-2 rounded-xl flex items-center justify-center transition-all ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                  : isAddedAnimation
                  ? 'bg-emerald-600 text-white border-emerald-600 cursor-pointer'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 cursor-pointer'
              }`}
              title={isOutOfStock ? 'Produit actuellement en rupture' : 'Ajouter au panier'}
              aria-label={isOutOfStock ? 'Produit actuellement en rupture' : 'Ajouter au panier'}
            >
              {isAddedAnimation ? <Check className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
