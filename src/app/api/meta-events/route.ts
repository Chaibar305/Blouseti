import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Route Handler pour Meta Conversions API (CAPI) v21.0
 * Reçoit les événements du site et les transmet à Meta Graph API avec hachage SHA-256.
 */

function sha256(value?: string | null): string | undefined {
  if (!value) return undefined;
  const clean = value.trim().toLowerCase();
  if (!clean) return undefined;
  return crypto.createHash('sha256').update(clean).digest('hex');
}

/**
 * Normalise et hache un numéro de téléphone marocain selon les standards Meta
 * Ex: 0660123456 -> 212660123456 -> SHA-256
 */
function normalizeAndHashPhone(phone?: string | null): string | undefined {
  if (!phone) return undefined;
  let digits = phone.replace(/[^0-9]/g, '');
  if (!digits) return undefined;

  if (digits.startsWith('0') && digits.length === 10) {
    digits = '212' + digits.substring(1);
  } else if (digits.startsWith('00212')) {
    digits = digits.substring(2);
  } else if (!digits.startsWith('212') && digits.length === 9) {
    digits = '212' + digits;
  }

  return crypto.createHash('sha256').update(digits).digest('hex');
}

/**
 * Normalise et hache le nom de la ville selon les recommandations Meta
 * Minuscules, sans ponctuation ni espaces
 */
function normalizeAndHashCity(city?: string | null): string | undefined {
  if (!city) return undefined;
  const clean = city.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!clean) return undefined;
  return crypto.createHash('sha256').update(clean).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_name, event_id, event_source_url, custom_data, user_data, test_event_code } = body || {};

    if (!event_name || !event_id) {
      return NextResponse.json(
        { error: 'event_name et event_id sont requis' },
        { status: 400 }
      );
    }

    const pixelId =
      process.env.META_PIXEL_ID ||
      process.env.NEXT_PUBLIC_META_PIXEL_ID ||
      '1150720077648867';
    const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

    // Récupérer l'adresse IP et le User-Agent de la requête
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : req.headers.get('x-real-ip') || undefined;
    const clientUserAgent = req.headers.get('user-agent') || undefined;

    // Hachage SHA-256 des données utilisateur (PII)
    const hashedEmail = sha256(user_data?.email);
    const hashedPhone = normalizeAndHashPhone(user_data?.phone);
    const hashedFirstName = sha256(user_data?.firstName);
    const hashedLastName = sha256(user_data?.lastName);
    const hashedCity = normalizeAndHashCity(user_data?.city);
    const hashedCountry = sha256('ma'); // Maroc par défaut

    const eventPayload: Record<string, any> = {
      event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_id,
      event_source_url: event_source_url || 'https://blouseti.shop',
      action_source: 'website',
      user_data: {
        client_ip_address: clientIp,
        client_user_agent: clientUserAgent,
        em: hashedEmail ? [hashedEmail] : undefined,
        ph: hashedPhone ? [hashedPhone] : undefined,
        fn: hashedFirstName ? [hashedFirstName] : undefined,
        ln: hashedLastName ? [hashedLastName] : undefined,
        ct: hashedCity ? [hashedCity] : undefined,
        country: [hashedCountry],
        fbp: user_data?.fbp || undefined,
        fbc: user_data?.fbc || undefined,
      },
      custom_data: {
        currency: custom_data?.currency || 'MAD',
        value: typeof custom_data?.value === 'number' ? custom_data.value : Number(custom_data?.value) || 0,
        content_ids: Array.isArray(custom_data?.content_ids)
          ? custom_data.content_ids.map(String)
          : custom_data?.content_ids
          ? [String(custom_data.content_ids)]
          : undefined,
        content_type: custom_data?.content_type || 'product',
        contents: custom_data?.contents,
        num_items: custom_data?.num_items,
      },
    };

    // Si le token CAPI n'est pas encore configuré dans .env, enregistrer l'avertissement sans faire échouer la requête
    if (!accessToken) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[Meta CAPI] META_CAPI_ACCESS_TOKEN non défini dans l\'environnement.');
      }
      return NextResponse.json({
        success: true,
        warning: 'META_CAPI_ACCESS_TOKEN not configured',
        event_id,
      });
    }

    const graphPayload: Record<string, any> = {
      data: [eventPayload],
    };

    const activeTestCode = test_event_code || process.env.META_TEST_EVENT_CODE;
    if (activeTestCode && activeTestCode.trim()) {
      graphPayload.test_event_code = activeTestCode.trim();
    }

    const metaResponse = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(graphPayload),
      }
    );

    const result = await metaResponse.json();

    if (!metaResponse.ok) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[Meta CAPI] Erreur réponse Graph API:', result);
      }
      return NextResponse.json(
        { error: result.error?.message || 'Meta CAPI request failed', details: result },
        { status: metaResponse.status }
      );
    }

    return NextResponse.json({ success: true, result, event_id });
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Meta CAPI] Exception route handler:', error);
    }
    return NextResponse.json(
      { error: error.message || 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

