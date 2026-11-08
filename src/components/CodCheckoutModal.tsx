'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  X,
  ShieldCheck,
  Truck,
  Sparkles,
  Check,
  Phone,
  MapPin,
  User,
  Home,
  AlertCircle,
  Loader2,
  Tag,
  ArrowRight,
  Package,
  FileText,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { MOROCCAN_CITIES, SHIPPING_POLICY } from '@/data/morocco';
import { OrderData } from '@/types';
import { createCodOrderAction } from '@/app/actions/orders';
import { useSettings } from '@/context/SettingsContext';
import { trackCodOrderConversion } from '@/lib/pixelTracking';
import { trackBoth } from '@/lib/meta';
import { validateCoupon } from '@/app/actions/coupons';

// Validation Schema for Moroccan COD orders
const codSchema = z.object({
  gender: z.enum(['Femme', 'Homme']),
  fullName: z.string().min(3, 'Veuillez saisir votre nom et prénom (min. 3 caractères)'),
  phone: z
    .string()
    .min(8, 'Numéro de téléphone WhatsApp requis')
    .refine(
      (val) => {
        const clean = val.replace(/[\s\-\.]/g, '');
        return /^(?:(?:\+|00)212|0)[5-7]\d{8}$/.test(clean);
      },
      {
        message: 'Numéro marocain invalide (Ex: 06 60 12 34 56 ou 07 12 34 56 78)',
      }
    ),
  city: z.string().min(1, 'Veuillez choisir votre ville de livraison'),
  address: z.string().min(5, 'Adresse complète requise pour le livreur (quartier, rue, n°)'),
  notes: z.string().optional(),
});

type CodFormData = z.infer<typeof codSchema>;

export default function CodCheckoutModal() {
  const router = useRouter();
  const { quickCheckoutItem, closeQuickCheckout, setLastOrder } = useCart();
  const { settings } = useSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_order_amount: number;
  } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Local state for modal item customization
  const [itemSize, setItemSize] = useState(quickCheckoutItem?.selectedSize || 'M');
  const [itemColor, setItemColor] = useState(
    quickCheckoutItem?.selectedColor || quickCheckoutItem?.product.colors[0]
  );
  const [itemQty, setItemQty] = useState(quickCheckoutItem?.quantity || 1);
  const [hasEmbroidery, setHasEmbroidery] = useState(
    quickCheckoutItem?.embroidery?.enabled || false
  );
  const [embroideryName, setEmbroideryName] = useState(
    quickCheckoutItem?.embroidery?.fullName || 'Dr. '
  );
  const [embroiderySpeciality, setEmbroiderySpeciality] = useState(
    quickCheckoutItem?.embroidery?.speciality || ''
  );
  const hasTrackedInitiateCheckout = React.useRef(false);

  // Reset or update local state when quickCheckoutItem changes
  useEffect(() => {
    if (quickCheckoutItem) {
      setItemSize(quickCheckoutItem.selectedSize || 'M');
      setItemColor(quickCheckoutItem.selectedColor || quickCheckoutItem.product.colors[0]);
      setItemQty(quickCheckoutItem.quantity || 1);
      setHasEmbroidery(quickCheckoutItem.embroidery?.enabled || false);
      setEmbroideryName(quickCheckoutItem.embroidery?.fullName || 'Dr. ');
      setEmbroiderySpeciality(quickCheckoutItem.embroidery?.speciality || '');
      setAppliedCoupon(null);
      setCouponInput('');
      setCouponError(null);

      // Déclencher InitiateCheckout avec déduplication CAPI
      if (!hasTrackedInitiateCheckout.current) {
        hasTrackedInitiateCheckout.current = true;
        const initialValue =
          (quickCheckoutItem.product.price + (quickCheckoutItem.embroidery?.price || 0)) *
          (quickCheckoutItem.quantity || 1);

        trackBoth('InitiateCheckout', {
          content_ids: [quickCheckoutItem.product.id],
          content_name: quickCheckoutItem.product.name,
          content_type: 'product',
          value: initialValue,
          currency: 'MAD',
          num_items: quickCheckoutItem.quantity || 1,
        });
      }
    } else {
      hasTrackedInitiateCheckout.current = false;
    }
  }, [quickCheckoutItem]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CodFormData>({
    resolver: zodResolver(codSchema),
    defaultValues: {
      gender: 'Femme',
      fullName: '',
      phone: '',
      city: 'Casablanca',
      address: '',
      notes: '',
    },
  });

  const selectedGender = watch('gender');

  if (!quickCheckoutItem) return null;

  const product = quickCheckoutItem.product;
  const isPack = product.category === 'packs';
  const embroideryPricePerItem =
    quickCheckoutItem.embroidery?.price !== undefined
      ? quickCheckoutItem.embroidery.price
      : product.embroidery_price !== undefined
      ? Number(product.embroidery_price)
      : isPack
      ? 0
      : 45;
  const isFreeEmbroidery = embroideryPricePerItem === 0;
  const itemPrice = product.price * itemQty;
  const embroideryCost = hasEmbroidery ? embroideryPricePerItem * itemQty : 0;
  const subtotal = itemPrice + embroideryCost;

  // Calcul du montant de la réduction
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      discountAmount = Math.round((subtotal * appliedCoupon.discount_value) / 100);
      discountAmount = Math.min(discountAmount, subtotal);
    } else {
      discountAmount = Math.min(appliedCoupon.discount_value, subtotal);
    }
  }

  const standardShippingFee = settings.shipping_fee !== undefined ? Number(settings.shipping_fee) : SHIPPING_POLICY.standardRate;
  const freeShippingThreshold = settings.free_shipping_threshold !== undefined ? Number(settings.free_shipping_threshold) : SHIPPING_POLICY.freeShippingThreshold;

  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const shippingFee =
    subtotalAfterDiscount >= freeShippingThreshold
      ? 0
      : standardShippingFee;
  const total = subtotalAfterDiscount + shippingFee;

  const currentSelectedVariant = itemColor?.sizes?.find((s) => s.size === itemSize);
  const isCurrentVariantOutOfStock = currentSelectedVariant ? currentSelectedVariant.stock <= 0 : false;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      setCouponError('Veuillez saisir un code promo');
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError(null);

    try {
      const res = await validateCoupon(couponInput, subtotal);
      if (res.success && res.coupon) {
        setAppliedCoupon(res.coupon);
        setCouponError(null);
      } else {
        setCouponError(res.message || 'Code promo invalide');
      }
    } catch {
      setCouponError('Erreur lors de la validation du code');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
  };

  const onSubmit = async (data: CodFormData) => {
    setIsSubmitting(true);

    try {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const orderId = `BLS-${new Date().getFullYear()}-${randomId}`;

      const orderItem = {
        ...quickCheckoutItem,
        selectedSize: itemSize,
        selectedColor: itemColor || quickCheckoutItem.selectedColor,
        quantity: itemQty,
        embroidery: hasEmbroidery
          ? {
              enabled: true,
              fullName: embroideryName,
              speciality: embroiderySpeciality,
              font: quickCheckoutItem.embroidery?.font || 'Script Élégance',
              color: quickCheckoutItem.embroidery?.color || 'Argenté Reflet',
              price: embroideryPricePerItem,
            }
          : undefined,
      };

      const completeOrder: OrderData = {
        orderId,
        date: new Date().toLocaleDateString('fr-MA', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        customer: data,
        items: [orderItem],
        subtotal: itemPrice,
        embroideryTotal: embroideryCost,
        shippingFee,
        discountAmount,
        couponCode: appliedCoupon?.code,
        total,
        paymentMethod: 'COD',
      };

      setLastOrder(completeOrder);

      const orderRes = await createCodOrderAction({
        orderNumber: orderId,
        customerName: data.fullName,
        gender: data.gender,
        phone: data.phone,
        city: data.city,
        address: data.address,
        items: [
          {
            id: orderItem.product.id,
            name: orderItem.product.name,
            color: orderItem.selectedColor.name,
            size: orderItem.selectedSize,
            quantity: orderItem.quantity,
            price: orderItem.product.price,
            embroidery: orderItem.embroidery,
          },
        ],
        customEmbroidery: hasEmbroidery
          ? `${embroideryName}${embroiderySpeciality ? ` (${embroiderySpeciality})` : ''}`
          : undefined,
        couponCode: appliedCoupon?.code,
        discountAmount,
        totalAmount: total,
        notes: data.notes,
      });

      if (!orderRes || !orderRes.success) {
        throw new Error(orderRes?.error || 'Erreur lors de l\'enregistrement de votre commande. Veuillez réessayer.');
      }

      // Hachage et préparation des données utilisateur pour Meta CAPI & Pixel
      const nameParts = data.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || data.fullName;
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

      const metaUserData = {
        phone: data.phone,
        firstName,
        lastName,
        city: data.city,
        gender: data.gender,
      };

      // 1. Envoyer Purchase UNE SEULE FOIS (dédupliqué Pixel navigateur + CAPI serveur par event_id)
      await trackBoth(
        'Purchase',
        {
          value: total,
          currency: 'MAD',
          content_ids: [orderItem.product.id],
          content_type: 'product',
          contents: [
            {
              id: orderItem.product.id,
              quantity: orderItem.quantity,
              item_price: orderItem.product.price,
            },
          ],
          num_items: orderItem.quantity,
          order_id: orderId,
        },
        metaUserData
      );

      // 2. Envoyer aussi Lead avec les mêmes données
      await trackBoth(
        'Lead',
        {
          value: total,
          currency: 'MAD',
          content_name: 'Commande Blouseti COD',
          order_id: orderId,
        },
        metaUserData
      );

      // 3. Suivi pour TikTok, Snapchat et Google Analytics
      trackCodOrderConversion({
        orderId,
        totalAmount: total,
        city: data.city,
        items: [
          {
            id: orderItem.product.id,
            name: orderItem.product.name,
            price: orderItem.product.price,
            quantity: orderItem.quantity,
            size: orderItem.selectedSize,
            color: orderItem.selectedColor.name,
          },
        ],
        conversionEvent: settings.cod_conversion_event || 'Purchase',
      });

      closeQuickCheckout();
      router.push(`/merci?orderId=${orderId}`);
    } catch (err: any) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Order error:', err);
      }
      alert(err.message || 'Une erreur est survenue lors de la commande.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs overflow-hidden animate-in fade-in duration-200">
      
      {/* Modal Dialog Card (Unified Full/Bottom-sheet on mobile, centered modal on desktop) */}
      <div className="relative w-full sm:max-w-xl md:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
        
        {/* Top Header Banner (Fixed) */}
        <div className="bg-[#1B2A4A] text-white px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold leading-tight">
                Commande Express en 1 Clic (COD)
              </h3>
              <p className="text-[11px] text-slate-300">
                Paiement en espèces à la livraison partout au Maroc
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeQuickCheckout}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form wrapping both Scrollable Content and Sticky Footer */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
            
            {/* 1. Article Summary Card */}
            <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex gap-3 sm:gap-4 items-center">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <Image
                    src={itemColor?.image_url || itemColor?.image || product.colors[0]?.image_url || product.colors[0]?.image || '/images/scrub-navy.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {product.name}
                    </h4>
                    <span className="text-sm sm:text-base font-black text-[#1B2A4A] shrink-0">
                      {product.price * itemQty} DH
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{product.subtitle}</p>

                  {/* Adjust size, color and quantity inside modal */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-xs">
                    {/* Color dots */}
                    <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/80">
                      <span className="text-[11px] text-slate-500">Couleur:</span>
                      <div className="flex items-center gap-1">
                        {product.colors.map((c) => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => {
                              setItemColor(c);
                              const avail = c.sizes && c.sizes.length > 0 ? c.sizes.filter((s) => s.active !== false) : null;
                              if (avail && !avail.some((s) => s.size === itemSize && s.stock > 0)) {
                                const firstInStock = avail.find((s) => s.stock > 0);
                                if (firstInStock) setItemSize(firstInStock.size);
                              }
                            }}
                            className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                              itemColor?.name === c.name
                                ? 'ring-2 ring-sky-500 scale-110 shadow-xs'
                                : 'border-slate-300 opacity-70 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Size dropdown */}
                    <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/80">
                      <span className="text-[11px] text-slate-500">Taille:</span>
                      <select
                        value={itemSize}
                        onChange={(e) => setItemSize(e.target.value)}
                        className="bg-transparent font-bold text-slate-900 text-xs focus:outline-hidden cursor-pointer"
                      >
                        {itemColor?.sizes && itemColor.sizes.length > 0
                          ? itemColor.sizes
                              .filter((s) => s.active !== false)
                              .map((s) => (
                                <option key={s.size} value={s.size} disabled={s.stock <= 0}>
                                  {s.size} {s.stock <= 0 ? '(Épuisé)' : `(${s.stock} pcs)`}
                                </option>
                              ))
                          : product.sizes.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                      </select>
                    </div>

                    {/* Quantity selector */}
                    <div className="flex items-center gap-1 bg-slate-50 px-1 py-0.5 rounded-lg border border-slate-200/80 ml-auto">
                      <button
                        type="button"
                        onClick={() => setItemQty(Math.max(1, itemQty - 1))}
                        className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded font-bold"
                      >
                        -
                      </button>
                      <span className="px-1.5 font-bold text-xs text-slate-900">{itemQty}</span>
                      <button
                        type="button"
                        onClick={() => setItemQty(itemQty + 1)}
                        className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Embroidery Add-On Toggle */}
              <div className="pt-2.5 border-t border-slate-100">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasEmbroidery}
                    onChange={(e) => setHasEmbroidery(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span className="flex items-center gap-1.5 truncate">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Ajouter une broderie personnalisée sur la poche</span>
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                          isFreeEmbroidery
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {isFreeEmbroidery ? 'OFFERTE (0 DH)' : `+${embroideryPricePerItem} DH`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Faites broder votre titre, nom et spécialité au fil chirurgical de haute précision.
                    </p>
                  </div>
                </label>

                {/* Embroidery inputs if checked */}
                {hasEmbroidery && (
                  <div className="mt-2.5 pl-6 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in duration-150">
                    <div>
                      <input
                        type="text"
                        value={embroideryName}
                        onChange={(e) => setEmbroideryName(e.target.value)}
                        placeholder="Nom (Ex: Dr. S. Bennani)"
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-400"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={embroiderySpeciality}
                        onChange={(e) => setEmbroiderySpeciality(e.target.value)}
                        placeholder="Spécialité (Ex: Cardiologue)"
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Customer Delivery Information Card */}
            <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <MapPin className="w-4 h-4 text-sky-600" />
                  <span>Coordonnées de livraison au Maroc</span>
                </div>
                <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  100% Cash à la livraison
                </span>
              </div>

              {/* Gender / Coupe Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>Genre du client &amp; Coupe</span>
                    <span className="text-red-500">*</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">Pour ajuster la coupe de votre tenue</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setValue('gender', 'Femme', { shouldValidate: true })}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      selectedGender === 'Femme'
                        ? 'bg-rose-50/90 border-rose-500 text-rose-900 ring-2 ring-rose-200 shadow-xs scale-[1.01]'
                        : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="text-base">👩‍⚕️</span>
                    <span>Femme (Coupe Cintrée)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('gender', 'Homme', { shouldValidate: true })}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      selectedGender === 'Homme'
                        ? 'bg-sky-50/90 border-sky-600 text-sky-950 ring-2 ring-sky-200 shadow-xs scale-[1.01]'
                        : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="text-base">👨‍⚕️</span>
                    <span>Homme (Coupe Droite)</span>
                  </button>
                </div>
                <input type="hidden" {...register('gender')} />
                {errors.gender && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.gender.message}
                  </p>
                )}
              </div>

              {/* Full Name & Phone in 2 cols on tablet+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom & Prénom <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      {...register('fullName')}
                      placeholder="Ex: Dr. Mehdi Bennani ou Sara Alami"
                      className={`w-full min-h-[42px] text-xs sm:text-sm bg-slate-50 border rounded-xl pl-9 pr-3 py-2.5 transition-all focus:bg-white focus:outline-hidden focus:ring-2 ${
                        errors.fullName
                          ? 'border-red-500 focus:ring-red-300'
                          : 'border-slate-300 focus:ring-sky-400'
                      }`}
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                  {errors.fullName && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Phone (WhatsApp) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Téléphone / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      {...register('phone')}
                      placeholder="06 60 12 34 56 ou 07 12 34 56 78"
                      className={`w-full min-h-[42px] text-xs sm:text-sm bg-slate-50 border rounded-xl pl-9 pr-3 py-2.5 transition-all focus:bg-white focus:outline-hidden focus:ring-2 ${
                        errors.phone
                          ? 'border-red-500 focus:ring-red-300'
                          : 'border-slate-300 focus:ring-sky-400'
                      }`}
                    />
                    <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                  </div>
                  {errors.phone && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              {/* City Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ville de livraison au Maroc <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    {...register('city')}
                    className="w-full min-h-[42px] text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-400 cursor-pointer"
                  >
                    {MOROCCAN_CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  <MapPin className="w-4 h-4 text-sky-600 absolute left-3 top-3 pointer-events-none" />
                </div>
                {errors.city && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.city.message}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adresse exacte (Cabinet, Clinique, Hôpital ou Domicile) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register('address')}
                    placeholder="Ex: Clinique Yasmine, 2ème étage / Bd Zerktouni N°45..."
                    className={`w-full min-h-[42px] text-xs sm:text-sm bg-slate-50 border rounded-xl pl-9 pr-3 py-2.5 transition-all focus:bg-white focus:outline-hidden focus:ring-2 ${
                      errors.address
                        ? 'border-red-500 focus:ring-red-300'
                        : 'border-slate-300 focus:ring-sky-400'
                    }`}
                  />
                  <Home className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                {errors.address && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.address.message}
                  </p>
                )}
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instructions de livraison (Facultatif)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register('notes')}
                    placeholder="Ex: Livrer de préférence le matin, appeler 15 min avant..."
                    className="w-full min-h-[38px] text-xs bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-400"
                  />
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>

            {/* 3. Promo Code Section */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-3.5 h-3.5 text-sky-600" />
                <span className="text-xs font-semibold text-slate-700">Vous avez un code promo ?</span>
              </div>

              {!appliedCoupon ? (
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        if (couponError) setCouponError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                      placeholder="Ex: MEDECIN10"
                      disabled={isValidatingCoupon}
                      className="flex-1 min-h-[38px] text-xs sm:text-sm uppercase font-mono tracking-wider bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-400"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isValidatingCoupon || !couponInput.trim()}
                      className="min-h-[38px] px-4 py-2 bg-[#1B2A4A] hover:bg-[#152238] disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      {isValidatingCoupon ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Vérification...</span>
                        </>
                      ) : (
                        <span>Appliquer</span>
                      )}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{couponError}</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs text-emerald-900 tracking-wider">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-[10px] font-semibold bg-emerald-200/70 text-emerald-800 px-1.5 py-0.5 rounded">
                          {appliedCoupon.discount_type === 'percentage'
                            ? `-${appliedCoupon.discount_value}%`
                            : `-${appliedCoupon.discount_value} DH`}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-700 font-medium">
                        Remise de {discountAmount} DH appliquée !
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="p-1 hover:bg-emerald-100 rounded-md text-emerald-700 hover:text-emerald-900 transition-colors"
                    title="Retirer le code promo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* 4. Price Breakdown & Total */}
            <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Articles ({itemQty}x {product.name}) :</span>
                <span className="font-semibold text-slate-900">{itemPrice} DH</span>
              </div>
              {hasEmbroidery && (
                <div className="flex justify-between text-amber-700 font-medium">
                  <span>Broderie personnalisée ({itemQty}x) :</span>
                  <span>{isPack ? 'OFFERTE (0 DH)' : `+${embroideryCost} DH`}</span>
                </div>
              )}
              {appliedCoupon && discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50/70 -mx-1 px-2 py-1 rounded-lg">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Réduction (Code {appliedCoupon.code}) :
                  </span>
                  <span>-{discountAmount} DH</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Frais de livraison au Maroc :</span>
                <span className={shippingFee === 0 ? 'text-emerald-700 font-bold' : 'font-semibold'}>
                  {shippingFee === 0 ? 'GRATUITE' : `${shippingFee} DH`}
                </span>
              </div>
            </div>

          </div>

          {/* Sticky Bottom Action Footer (Fixed at bottom on both mobile & desktop) */}
          <div className="shrink-0 bg-white border-t border-slate-200/90 p-3.5 sm:p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] space-y-2">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium block">Total Net à payer :</span>
                <span className="text-[11px] text-emerald-600 font-bold">
                  {shippingFee === 0 ? 'Livraison 100% offerte' : `+ Livraison ${shippingFee} DH`}
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-[#1B2A4A] tracking-tight">
                {total} <span className="text-sm font-bold">DH</span>
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isCurrentVariantOutOfStock}
              className={`w-full min-h-[48px] sm:min-h-[52px] font-black py-3 px-5 rounded-2xl text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2 ${
                isCurrentVariantOutOfStock
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : 'btn-shimmer bg-[#1B2A4A] hover:bg-[#111C32] disabled:opacity-60 text-white shadow-[#1B2A4A]/25 cursor-pointer active:scale-[0.98]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Traitement de votre commande...</span>
                </>
              ) : isCurrentVariantOutOfStock ? (
                <span>TAILLE ÉPUISÉE POUR CE COLORIS</span>
              ) : (
                <>
                  <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">
                    COMMANDER MAINTENANT • PAIEMENT À LA LIVRAISON
                  </span>
                  <ArrowRight className="w-4 h-4 text-sky-400 shrink-0" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-center text-[10px] sm:text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Paiement en espèces à la livraison • Colis vérifiable à la réception</span>
            </div>
          </div>

        </form>

      </div>

    </div>
  );
}
