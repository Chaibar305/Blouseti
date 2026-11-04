'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, ShieldCheck, Truck, Sparkles, Check, Phone, MapPin, User, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { MOROCCAN_CITIES, SHIPPING_POLICY } from '@/data/morocco';
import { OrderData } from '@/types';
import { createCodOrderAction } from '@/app/actions/orders';
import { useSettings } from '@/context/SettingsContext';
import { trackCodOrderConversion } from '@/lib/pixelTracking';

// Validation Schema for Moroccan COD orders
const codSchema = z.object({
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

  // Local state for modal item customization
  const [itemSize, setItemSize] = useState(quickCheckoutItem?.selectedSize || 'M');
  const [itemColor, setItemColor] = useState(quickCheckoutItem?.selectedColor || quickCheckoutItem?.product.colors[0]);
  const [itemQty, setItemQty] = useState(quickCheckoutItem?.quantity || 1);
  const [hasEmbroidery, setHasEmbroidery] = useState(quickCheckoutItem?.embroidery?.enabled || false);
  const [embroideryName, setEmbroideryName] = useState(quickCheckoutItem?.embroidery?.fullName || 'Dr. ');
  const [embroiderySpeciality, setEmbroiderySpeciality] = useState(quickCheckoutItem?.embroidery?.speciality || '');

  // Reset or update local state when quickCheckoutItem changes
  React.useEffect(() => {
    if (quickCheckoutItem) {
      setItemSize(quickCheckoutItem.selectedSize);
      setItemColor(quickCheckoutItem.selectedColor);
      setItemQty(quickCheckoutItem.quantity || 1);
      setHasEmbroidery(quickCheckoutItem.embroidery?.enabled || false);
      setEmbroideryName(quickCheckoutItem.embroidery?.fullName || 'Dr. ');
      setEmbroiderySpeciality(quickCheckoutItem.embroidery?.speciality || '');
    }
  }, [quickCheckoutItem]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CodFormData>({
    resolver: zodResolver(codSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      city: 'Casablanca',
      address: '',
      notes: '',
    },
  });

  if (!quickCheckoutItem) return null;

  const product = quickCheckoutItem.product;
  const isPack = product.category === 'packs';
  const embroideryPricePerItem = isPack ? 0 : 20; // Offert sur les packs
  const itemPrice = product.price * itemQty;
  const embroideryCost = hasEmbroidery ? embroideryPricePerItem * itemQty : 0;
  const subtotal = itemPrice + embroideryCost;
  const shippingFee = subtotal >= SHIPPING_POLICY.freeShippingThreshold ? 0 : SHIPPING_POLICY.standardRate;
  const total = subtotal + shippingFee;

  const onSubmit = async (data: CodFormData) => {
    setIsSubmitting(true);

    try {
      // Create a unique Moroccan order number (e.g. BLS-2026-XXXX)
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
        total,
        paymentMethod: 'COD',
      };

      // Persist order in context and local storage
      setLastOrder(completeOrder);

      // Save order to Supabase database via Server Action
      await createCodOrderAction({
        orderNumber: orderId,
        customerName: data.fullName,
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
        totalAmount: total,
        notes: data.notes,
      });

      // Track COD conversion across Facebook, TikTok, Snapchat and Google Analytics
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
    } catch (err) {
      console.error('Order error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      
      {/* Modal Dialog Card */}
      <div className="relative w-full h-full sm:h-auto sm:max-w-2xl bg-white sm:rounded-3xl shadow-2xl border border-slate-100 flex flex-col sm:block my-auto animate-in fade-in zoom-in-95 duration-200 max-h-screen sm:max-h-[90vh]">
        
        {/* Top Header Banner */}
        <div className="bg-[#1B2A4A] text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Truck className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold">Commande Express en 1 Clic (COD)</h3>
              <p className="text-[11px] text-slate-300">Paiement en espèces à la livraison au Maroc</p>
            </div>
          </div>
          <button
            onClick={closeQuickCheckout}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto">
          
          {/* Article Summary Box */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <div className="flex gap-4">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                <Image
                  src={itemColor?.image || product.colors[0].image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                    {product.name}
                  </h4>
                  <span className="text-base font-black text-[#1B2A4A] shrink-0">
                    {product.price * itemQty} DH
                  </span>
                </div>
                
                <p className="text-xs text-slate-500 mt-0.5">{product.subtitle}</p>

                {/* Adjust size and color inside modal */}
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                  {/* Color selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium">Couleur:</span>
                    <div className="flex items-center gap-1">
                      {product.colors.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setItemColor(c)}
                          className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                            itemColor?.name === c.name ? 'ring-2 ring-sky-500 scale-110' : 'border-slate-300'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Size selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium">Taille:</span>
                    <select
                      value={itemSize}
                      onChange={(e) => setItemSize(e.target.value)}
                      className="bg-white border border-slate-300 rounded-md px-2 py-0.5 font-bold text-slate-800 text-xs focus:ring-1 focus:ring-sky-500"
                    >
                      {product.sizes.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span className="text-slate-500 font-medium">Quantité:</span>
                    <div className="flex items-center border border-slate-300 rounded-md bg-white">
                      <button
                        type="button"
                        onClick={() => setItemQty(Math.max(1, itemQty - 1))}
                        className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100 rounded-l"
                      >
                        -
                      </button>
                      <span className="px-2 font-bold text-xs">{itemQty}</span>
                      <button
                        type="button"
                        onClick={() => setItemQty(itemQty + 1)}
                        className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100 rounded-r"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Embroidery Add-On Toggle */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasEmbroidery}
                  onChange={(e) => setHasEmbroidery(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Ajouter une broderie personnalisée sur la poche
                    </span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${isPack ? 'bg-emerald-100 text-emerald-800 font-black' : 'bg-amber-100 text-amber-900'}`}>
                      {isPack ? 'GRATUIT (Pack)' : '+20 DH'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Faites broder votre titre, nom et spécialité au fil de qualité chirurgicale.
                  </p>
                </div>
              </label>

              {/* Embroidery inputs if checked */}
              {hasEmbroidery && (
                <div className="mt-3 pl-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nom à broder (Ex: Dr. Bennani)
                    </label>
                    <input
                      type="text"
                      value={embroideryName}
                      onChange={(e) => setEmbroideryName(e.target.value)}
                      placeholder="Dr. Votre Nom"
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Spécialité (Ex: Dentiste, Médecin)
                    </label>
                    <input
                      type="text"
                      value={embroiderySpeciality}
                      onChange={(e) => setEmbroiderySpeciality(e.target.value)}
                      placeholder="Spécialité ou Fonction"
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* COD Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
              <MapPin className="w-4 h-4 text-sky-600" />
              <span>Vos coordonnées de livraison au Maroc</span>
            </div>

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
                  className={`w-full min-h-[48px] text-base sm:text-sm bg-slate-50 border rounded-xl pl-10 pr-3 py-3 transition-all focus:bg-white focus:outline-hidden focus:ring-2 ${
                    errors.fullName ? 'border-red-500 focus:ring-red-300' : 'border-slate-300 focus:ring-sky-400'
                  }`}
                />
                <User className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
              </div>
              {errors.fullName && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Phone (WhatsApp) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Numéro Téléphone / WhatsApp <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="06 60 12 34 56 ou 07 12 34 56 78"
                  className={`w-full min-h-[48px] text-base sm:text-sm bg-slate-50 border rounded-xl pl-10 pr-3 py-3 transition-all focus:bg-white focus:outline-hidden focus:ring-2 ${
                    errors.phone ? 'border-red-500 focus:ring-red-300' : 'border-slate-300 focus:ring-sky-400'
                  }`}
                />
                <Phone className="w-5 h-5 text-emerald-600 absolute left-3 top-3.5" />
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Le livreur vous appellera sur ce numéro avant de se présenter.
              </p>
              {errors.phone && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* City Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ville de livraison au Maroc <span className="text-red-500">*</span>
              </label>
              <select
                {...register('city')}
                className="w-full min-h-[48px] text-base sm:text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-3 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-400"
              >
                {MOROCCAN_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {errors.city && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.city.message}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Adresse de livraison (Domicile, Cabinet, Clinique ou Hôpital) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('address')}
                placeholder="Ex: Clinique Yasmine, 2ème étage / Bd Zerktouni N°45..."
                className={`w-full min-h-[48px] text-base sm:text-sm bg-slate-50 border rounded-xl px-3 py-3 transition-all focus:bg-white focus:outline-hidden focus:ring-2 ${
                  errors.address ? 'border-red-500 focus:ring-red-300' : 'border-slate-300 focus:ring-sky-400'
                }`}
              />
              {errors.address && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instructions spéciales de livraison (Facultatif)
              </label>
              <input
                type="text"
                {...register('notes')}
                placeholder="Ex: Livrer de préférence le matin, appeler 15 min avant..."
                className="w-full min-h-[44px] text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-700"
              />
            </div>

            {/* Order Price Breakdown */}
            <div className="bg-slate-100/70 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Article ({itemQty}x {product.name}) :</span>
                <span className="font-semibold text-slate-900">{itemPrice} DH</span>
              </div>
              {hasEmbroidery && (
                <div className="flex justify-between text-amber-700 font-medium">
                  <span>Broderie personnalisée ({itemQty}x) :</span>
                  <span>{isPack ? 'OFFERTE (0 DH)' : `+${embroideryCost} DH`}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Frais de livraison partout au Maroc :</span>
                <span className={shippingFee === 0 ? 'text-emerald-700 font-bold' : 'font-semibold'}>
                  {shippingFee === 0 ? 'GRATUITE' : `${shippingFee} DH`}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-sm font-black text-[#1B2A4A]">
                <span>Total Net à payer à la livraison :</span>
                <span className="text-xl font-black text-[#1B2A4A]">{total} DH</span>
              </div>
            </div>

            {/* Big COD Confirmation Button (Beez.ma style) */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[52px] btn-shimmer bg-[#1B2A4A] hover:bg-[#111C32] disabled:opacity-60 text-white font-black py-4 px-6 rounded-2xl text-sm sm:text-base shadow-xl shadow-[#1B2A4A]/25 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Traitement de votre commande...</span>
                </>
              ) : (
                <>
                  <Truck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>COMMANDER MAINTENANT • PAIEMENT À LA LIVRAISON ({total} DH)</span>
                </>
              )}
            </button>

            {/* Reassuring footer note */}
            <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Paiement en espèces à la livraison. Colis vérifiable à la réception.</span>
            </div>

          </form>

        </div>

      </div>

    </div>
  );
}
