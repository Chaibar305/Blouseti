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
      return;
    }
    sessionStorage.setItem(storageKey, 'true');
  } catch {
    // Ignore storage errors in private mode
  }

  const totalQuantity = items.reduce((acc, item) => acc + (item.quantity || 1), 0);

  // Note: Meta / Facebook Pixel & CAPI sont gérés directement avec déduplication event_id via @/lib/meta

  // 1. TikTok Pixel
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
      } else {
        window.ttq.track('SubmitForm', {
          value: totalAmount,
          currency: 'MAD',
          order_id: orderId,
        });
      }
    } catch {
      // Ignorer en silence
    }
  }

  // 2. Snapchat Pixel
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
      } else {
        window.snaptr('track', 'SIGN_UP', {
          currency: 'MAD',
          price: totalAmount,
          transaction_id: orderId,
        });
      }
    } catch {
      // Ignorer en silence
    }
  }

  // 3. Google Analytics (GA4)
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
    } catch {
      // Ignorer en silence
    }
  }
}
