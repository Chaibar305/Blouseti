'use client';

/**
 * Meta (Facebook) Pixel & Conversions API (CAPI) Client Helper
 * Blouseti.shop - Modèle 100% COD Maroc
 * Déduplication garantie via un `event_id` unique partagé navigateur + serveur.
 */

export interface MetaUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  gender?: string;
  fbp?: string;
  fbc?: string;
}

/**
 * Récupère la valeur d'un cookie par son nom (ex: _fbp, _fbc)
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return match ? decodeURIComponent(match[3]) : null;
  } catch {
    return null;
  }
}

/**
 * Envoie un événement au Meta Pixel dans le navigateur (fbq)
 * en lui associant le même eventID pour la déduplication avec CAPI.
 */
export function trackMetaEvent(
  eventName: string,
  params: Record<string, any> = {},
  eventID?: string
): void {
  if (typeof window === 'undefined') return;

  try {
    const fbq = (window as any).fbq;
    if (typeof fbq === 'function') {
      if (eventID) {
        fbq('track', eventName, params, { eventID });
      } else {
        fbq('track', eventName, params);
      }
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Meta Pixel] Erreur de tracking navigateur:', err);
    }
  }
}

/**
 * Envoie l'événement au serveur (Conversions API) via notre Route Handler /api/meta-events
 */
export async function trackMetaServer(
  eventName: string,
  data: {
    eventId: string;
    params?: Record<string, any>;
    userData?: MetaUserData;
    eventSourceUrl?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  if (typeof window === 'undefined') return { success: false, error: 'Environnement serveur' };

  try {
    const fbp = getCookie('_fbp') || undefined;
    const fbc = getCookie('_fbc') || undefined;

    const payload = {
      event_name: eventName,
      event_id: data.eventId,
      event_source_url: data.eventSourceUrl || window.location.href,
      custom_data: data.params || {},
      user_data: {
        ...(data.userData || {}),
        fbp,
        fbc,
      },
    };

    const res = await fetch('/api/meta-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.error || `HTTP ${res.status}` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur réseau' };
  }
}

/**
 * Génère un seul event_id unique (UUID v4) et l'envoie SIMULTANÉMENT :
 * 1. Au Meta Pixel navigateur avec fbq(..., { eventID })
 * 2. À l'API de Conversions Meta (CAPI) côté serveur avec le même event_id
 * 
 * Meta effectue la déduplication automatiquement.
 */
export async function trackBoth(
  eventName: string,
  params: Record<string, any> = {},
  userData: MetaUserData = {}
): Promise<string> {
  let eventId: string;
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    eventId = crypto.randomUUID();
  } else {
    eventId = 'ev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  }

  // 1. Envoi Pixel Navigateur
  trackMetaEvent(eventName, params, eventId);

  // 2. Envoi CAPI Serveur
  trackMetaServer(eventName, {
    eventId,
    params,
    userData,
    eventSourceUrl: typeof window !== 'undefined' ? window.location.href : undefined,
  }).catch((err) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Meta CAPI] Erreur envoi serveur:', err);
    }
  });

  return eventId;
}

