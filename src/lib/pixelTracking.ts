'use client';

export interface OrderItemTracking {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface CodOrderTrackingPayload {
  orderId: string;
  totalAmount: number;
  city: string;
  items: OrderItemTracking[];
  conversionEvent?: 'Purchase' | 'Lead';
}

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    ttq?: {
      track: (event: string, params?: Record<string, any>) => void;
      page?: () => void;
    };
    snaptr?: (action: string, event: string, params?: Record<string, any>) => void;
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Envoie l'événement de conversion COD (Purchase ou Lead)
 * vers Facebook, TikTok, Snapchat et Google Analytics.
 * Inclus une protection anti-doublon par orderId (sessionStorage).
 */
export function trackCodOrderConversion(payload: CodOrderTrackingPayload) {
  if (typeof window === 'undefined') return;

  const { orderId, totalAmount, city, items, conversionEvent = 'Purchase' } = payload;
  const storageKey = `bls_tracked_order_${orderId}`;

  // Vérifier si cette commande a déjà été trackée dans la session
  try {
    if (sessionStorage.getItem(storageKey)) {
      console.log(`[Pixel Tracking] Commande ${orderId} déjà comptabilisée, tracking ignoré.`);
      return;
    }
    sessionStorage.setItem(storageKey, 'true');
  } catch {
    // Ignore storage errors in private mode
  }

  const totalQuantity = items.reduce((acc, item) => acc + (item.quantity || 1), 0);

  // 1. Meta / Facebook Pixel
  if (typeof window.fbq === 'function') {
    try {
      if (conversionEvent === 'Purchase') {
        window.fbq('track', 'Purchase', {
          content_type: 'product',
          content_name: 'Commande Blouseti COD',
          contents: items.map((item) => ({
            id: String(item.id),
            quantity: item.quantity,
            item_price: item.price,
          })),
          content_ids: items.map((item) => String(item.id)),
          value: totalAmount,
          currency: 'MAD',
          num_items: totalQuantity,
          city: city,
          order_id: orderId,
        });
        console.log(`[Meta Pixel] ✓ fbq('track', 'Purchase') envoyé pour #${orderId} (${totalAmount} MAD)`);
      } else {
        window.fbq('track', 'Lead', {
          content_name: 'Commande Blouseti COD',
          value: totalAmount,
          currency: 'MAD',
          city: city,
          order_id: orderId,
        });
        console.log(`[Meta Pixel] ✓ fbq('track', 'Lead') envoyé pour #${orderId}`);
      }
    } catch (err) {
      console.warn('[Meta Pixel] Erreur de tracking:', err);
    }
  }

  // 2. TikTok Pixel
  if (typeof window.ttq?.track === 'function') {
    try {
      if (conversionEvent === 'Purchase') {
        window.ttq.track('CompletePayment', {
          content_type: 'product',
          quantity: totalQuantity,
          contents: items.map((item) => ({
            content_id: String(item.id),
            content_name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          value: totalAmount,
          currency: 'MAD',
        });
        console.log(`[TikTok Pixel] ✓ ttq.track('CompletePayment') envoyé pour #${orderId}`);
      } else {
        window.ttq.track('SubmitForm', {
          value: totalAmount,
          currency: 'MAD',
          order_id: orderId,
        });
        console.log(`[TikTok Pixel] ✓ ttq.track('SubmitForm') envoyé pour #${orderId}`);
      }
    } catch (err) {
      console.warn('[TikTok Pixel] Erreur de tracking:', err);
    }
  }

  // 3. Snapchat Pixel
  if (typeof window.snaptr === 'function') {
    try {
      if (conversionEvent === 'Purchase') {
        window.snaptr('track', 'PURCHASE', {
          currency: 'MAD',
          price: totalAmount,
          item_ids: items.map((item) => String(item.id)),
          number_items: totalQuantity,
          transaction_id: orderId,
        });
        console.log(`[Snapchat Pixel] ✓ snaptr('track', 'PURCHASE') envoyé pour #${orderId}`);
      } else {
        window.snaptr('track', 'SIGN_UP', {
          currency: 'MAD',
          price: totalAmount,
          transaction_id: orderId,
        });
        console.log(`[Snapchat Pixel] ✓ snaptr('track', 'SIGN_UP') envoyé pour #${orderId}`);
      }
    } catch (err) {
      console.warn('[Snapchat Pixel] Erreur de tracking:', err);
    }
  }

  // 4. Google Analytics (GA4)
  if (typeof window.gtag === 'function') {
    try {
      const gaEvent = conversionEvent === 'Purchase' ? 'purchase' : 'generate_lead';
      window.gtag('event', gaEvent, {
        transaction_id: orderId,
        value: totalAmount,
        currency: 'MAD',
        items: items.map((item) => ({
          item_id: String(item.id),
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
          item_variant: [item.color, item.size].filter(Boolean).join(' / '),
        })),
      });
      console.log(`[Google Analytics] ✓ gtag('event', '${gaEvent}') envoyé pour #${orderId}`);
    } catch (err) {
      console.warn('[Google Analytics] Erreur de tracking:', err);
    }
  }
}
