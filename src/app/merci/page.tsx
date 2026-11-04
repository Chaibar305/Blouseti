'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { CheckCircle2, Truck, MessageCircle, MapPin, Phone, User, Calendar, ShieldCheck, ArrowLeft, Sparkles, Printer } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { trackCodOrderConversion } from '@/lib/pixelTracking';
import { SHIPPING_POLICY } from '@/data/morocco';
import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get('orderId');
  const { lastOrder } = useCart();
  const { settings } = useSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fire confetti effect
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log('Confetti not available:', e);
    }

    // Suivi de conversion COD sécurisé pour pixels
    if (lastOrder) {
      trackCodOrderConversion({
        orderId: lastOrder.orderId,
        totalAmount: lastOrder.total,
        city: lastOrder.customer?.city || 'Maroc',
        items: lastOrder.items.map((i) => ({
          id: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          size: i.selectedSize,
          color: i.selectedColor?.name,
        })),
        conversionEvent: settings.cod_conversion_event || 'Purchase',
      });
    }
  }, [lastOrder, settings.cod_conversion_event]);

  const order = lastOrder;
  const displayOrderId = orderIdParam || order?.orderId || 'BLS-2026-8492';

  // Build WhatsApp confirmation message URL
  const buildWhatsAppUrl = () => {
    if (!order) {
      return `https://wa.me/${SHIPPING_POLICY.whatsappNumber}?text=Bonjour%20Blouseti,%20je%20viens%20de%20passer%20la%20commande%20${displayOrderId}.`;
    }

    const itemsText = order.items
      .map(
        (i) =>
          `• ${i.quantity}x ${i.product.name} (Taille ${i.selectedSize}, Couleur ${i.selectedColor.name})${
            i.embroidery?.enabled ? ` [Broderie: ${i.embroidery.fullName}]` : ''
          }`
      )
      .join('%0A');

    const message = `*Confirmation Commande Blouseti*%0A%0A` +
      `*N° Commande:* ${order.orderId}%0A` +
      `*Client:* ${order.customer.fullName}%0A` +
      `*Téléphone:* ${order.customer.phone}%0A` +
      `*Ville:* ${order.customer.city}%0A` +
      `*Adresse:* ${order.customer.address}%0A%0A` +
      `*Articles:*%0A${itemsText}%0A%0A` +
      `*Total à régler au livreur:* ${order.total} DH (COD)%0A%0A` +
      `Merci de confirmer la préparation de mon colis !`;

    return `https://wa.me/${SHIPPING_POLICY.whatsappNumber}?text=${message}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopBar />
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        
        {/* Success Banner Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden text-center p-6 sm:p-10 mb-8">
          
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 ring-8 ring-emerald-50">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3.5 py-1.5 rounded-full mb-3">
            <span>🎉 COMMANDE ENREGISTRÉE AVEC SUCCÈS</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1B2A4A] tracking-tight">
            Merci pour votre confiance !
          </h1>

          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Votre commande <strong className="text-[#1B2A4A] font-bold">#{displayOrderId}</strong> est bien enregistrée en <strong className="text-emerald-700">Paiement à la Livraison (COD)</strong>.
          </p>

          {/* Delivery & Payment Instructions */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-sky-100 text-sky-700 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-sky-950">Livraison sous 24h à 48h</p>
                <p className="text-sky-800 mt-0.5">Le livreur vous appellera sur WhatsApp avant de vous remettre le colis.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-amber-950">Paiement en espèces (COD)</p>
                <p className="text-amber-800 mt-0.5">Réglez le montant exact à la réception après contrôle de votre commande.</p>
              </div>
            </div>
          </div>

          {/* WhatsApp Direct Action Button (Crucial for Moroccan COD) */}
          <div className="mt-8 max-w-md mx-auto">
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shimmer w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold py-4 px-6 rounded-2xl text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-3 transition-all cursor-pointer hover:scale-102"
            >
              <MessageCircle className="w-6 h-6 fill-white" />
              <span>Confirmer ma commande sur WhatsApp</span>
            </a>
            <p className="text-[11px] text-slate-500 mt-2">
              Cliquez pour envoyer votre récapitulatif directement à notre atelier et accélérer l&apos;expédition.
            </p>
          </div>

        </div>

        {/* Detailed Order Summary Card */}
        {order && (
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200/80 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-[#1B2A4A]">Récapitulatif complet de la commande</h3>
              <span className="text-xs text-slate-500">{order.date}</span>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl text-xs">
              <div className="space-y-1">
                <p className="text-slate-500 font-medium">Destinataire :</p>
                <p className="font-bold text-slate-900">{order.customer.fullName}</p>
                <p className="text-slate-600">{order.customer.phone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 font-medium">Adresse de livraison :</p>
                <p className="font-bold text-slate-900">{order.customer.city}</p>
                <p className="text-slate-600">{order.customer.address}</p>
                {order.customer.notes && (
                  <p className="text-slate-400 italic">Note : &ldquo;{order.customer.notes}&rdquo;</p>
                )}
              </div>
            </div>

            {/* Articles List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Articles commandés
              </h4>
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-white shrink-0 border border-slate-200">
                    <Image
                      src={item.selectedColor.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-bold text-slate-900 truncate">{item.product.name}</p>
                    <p className="text-slate-500">
                      Taille: <strong className="text-slate-800">{item.selectedSize}</strong> • Couleur: {item.selectedColor.name} • Qté: {item.quantity}
                    </p>
                    {item.embroidery?.enabled && (
                      <p className="text-amber-800 font-medium flex items-center gap-1 mt-0.5">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Broderie : &quot;{item.embroidery.fullName}&quot; ({item.embroidery.speciality || 'Médical'})
                      </p>
                    )}
                  </div>
                  <div className="text-right font-black text-sm text-[#1B2A4A]">
                    {item.product.price * item.quantity} DH
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Recap */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total articles :</span>
                <span className="font-semibold text-slate-900">{order.subtotal} DH</span>
              </div>
              {order.embroideryTotal > 0 && (
                <div className="flex justify-between text-amber-700 font-medium">
                  <span>Broderie personnalisée :</span>
                  <span>+{order.embroideryTotal} DH</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Livraison partout au Maroc :</span>
                <span className={order.shippingFee === 0 ? 'text-emerald-700 font-bold' : 'font-semibold'}>
                  {order.shippingFee === 0 ? 'GRATUITE (0 DH)' : `${order.shippingFee} DH`}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-base font-black text-[#1B2A4A]">
                <span>Total à payer au livreur :</span>
                <span className="text-2xl font-black text-[#1B2A4A]">{order.total} DH</span>
              </div>
            </div>

          </div>
        )}

        {/* Back to Home CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-sky-700 hover:text-sky-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retourner à l&apos;accueil et voir le catalogue</span>
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function MerciPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-slate-600">Chargement de votre commande...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
