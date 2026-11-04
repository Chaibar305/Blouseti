import { google } from 'googleapis';
import { getSiteSettingsAction, SiteSettings } from '@/app/actions/settings';
import { DbOrder } from '@/app/actions/orders';
import { createAdminClient } from '@/lib/supabase/admin';

export const GOOGLE_SHEETS_HEADERS = [
  'Date',
  'N° Commande',
  'Nom Client',
  'Téléphone',
  'Ville',
  'Adresse Complète',
  'Articles & Variantes',
  'Broderie',
  'Total (DH)',
  'Statut',
  'Lien WhatsApp Direct',
];

/**
 * Normalise et extrait les informations d'authentification du Service Account
 */
export function getServiceAccountCredentials(settings?: SiteSettings) {
  // 1. Depuis les paramètres Supabase
  const rawJson = settings?.google_sheets_service_account?.trim();
  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson);
      if (parsed.client_email && parsed.private_key) {
        return {
          client_email: parsed.client_email,
          private_key: parsed.private_key.replace(/\\n/g, '\n'),
        };
      }
    } catch {
      // Peut être directement une clé ou non-JSON
    }
  }

  // 2. Depuis les variables d'environnement
  const envEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const envKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  if (envEmail && envKey) {
    return {
      client_email: envEmail,
      private_key: envKey.replace(/\\n/g, '\n'),
    };
  }

  const envJson = process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT;
  if (envJson) {
    try {
      const parsed = JSON.parse(envJson);
      if (parsed.client_email && parsed.private_key) {
        return {
          client_email: parsed.client_email,
          private_key: parsed.private_key.replace(/\\n/g, '\n'),
        };
      }
    } catch {
      // Ignorer
    }
  }

  return null;
}

/**
 * Crée le client Google Sheets authentifié
 */
export function getGoogleSheetsClient(creds: { client_email: string; private_key: string }) {
  const auth = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

/**
 * Formate un numéro de téléphone marocain en lien international WhatsApp
 */
export function formatMoroccanWhatsAppLink(phone: string, orderNumber: string, customerName: string): string {
  let clean = phone.replace(/[^\d+]/g, '');
  if (clean.startsWith('0')) {
    clean = '212' + clean.slice(1);
  } else if (clean.startsWith('+')) {
    clean = clean.slice(1);
  } else if (!clean.startsWith('212')) {
    clean = '212' + clean;
  }
  const msg = encodeURIComponent(`Bonjour ${customerName}, service client Blouseti concernant votre commande ${orderNumber}.`);
  return `https://wa.me/${clean}?text=${msg}`;
}

/**
 * Convertit un objet commande en tableau de valeurs pour la ligne de tableur
 */
export function formatOrderToSheetRow(order: any): (string | number)[] {
  const dateFormatted = order.created_at
    ? new Date(order.created_at).toLocaleString('fr-MA', {
        timeZone: 'Africa/Casablanca',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('fr-MA');

  const orderNum = order.order_number || order.orderNumber || 'BLS-CMD';
  const customerName = order.customer_name || order.customerName || 'Client';
  const phone = order.phone || '';
  const city = order.city || '';
  const address = order.address || '';

  // Détails des tenues
  let itemsDetail = '';
  if (Array.isArray(order.items)) {
    itemsDetail = order.items
      .map((item: any) => {
        const qty = item.quantity || 1;
        const name = item.name || item.product?.name || 'Scrub Médical';
        const size = item.size || item.selectedSize || '';
        const color = item.color || item.selectedColor?.name || '';
        const variant = [color, size ? `Taille ${size}` : ''].filter(Boolean).join(' - ');
        return `${qty}x ${name}${variant ? ` (${variant})` : ''}`;
      })
      .join(' | ');
  }

  const embroidery = order.custom_embroidery || 'Aucune';
  const total = Number(order.total_amount || order.totalAmount || 0);
  const status = order.status || 'nouveau';
  const waLink = formatMoroccanWhatsAppLink(phone, orderNum, customerName);

  return [
    dateFormatted,
    orderNum,
    customerName,
    phone,
    city,
    address,
    itemsDetail,
    embroidery,
    total,
    status,
    waLink,
  ];
}

/**
 * Ajoute automatiquement une commande passée sur le site dans Google Sheets
 */
export async function appendOrderToSheet(order: any): Promise<{ success: boolean; error?: string }> {
  try {
    const settings = await getSiteSettingsAction();

    if (!settings.google_sheets_enabled) {
      return { success: true }; // Désactivé, pas une erreur
    }

    const sheetId = settings.google_sheets_id?.trim();
    if (!sheetId) {
      return { success: false, error: 'Google Sheet ID non configuré' };
    }

    const creds = getServiceAccountCredentials(settings);
    if (!creds) {
      return { success: false, error: 'Identifiants Google Service Account introuvables' };
    }

    const sheets = getGoogleSheetsClient(creds);
    const range = settings.google_sheets_range || 'Sheet1!A:K';

    // 1. Vérifier si l'en-tête existe déjà
    try {
      const getHeader = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'A1:K1',
      });

      if (!getHeader.data.values || getHeader.data.values.length === 0 || !getHeader.data.values[0][0]) {
        // Écrire les en-têtes
        await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: 'A1:K1',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [GOOGLE_SHEETS_HEADERS],
          },
        });
      }
    } catch {
      // Ignorer si la lecture échoue, on tente l'append
    }

    // 2. Ajouter la ligne de commande
    const row = formatOrderToSheetRow(order);
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row],
      },
    });

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Erreur appendOrderToSheet:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Synchronise et rafraîchit l'ensemble des commandes de la base Supabase vers Google Sheets
 */
export async function syncAllOrdersToSheet(): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const settings = await getSiteSettingsAction();
    const sheetId = settings.google_sheets_id?.trim();

    if (!sheetId) {
      return { success: false, error: 'Veuillez configurer le Google Sheet ID dans /admin/settings' };
    }

    const creds = getServiceAccountCredentials(settings);
    if (!creds) {
      return { success: false, error: 'Identifiants Google Service Account invalides ou manquants' };
    }

    // Récupérer toutes les commandes depuis Supabase
    const supabase = createAdminClient();
    const { data: orders, error: dbError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) {
      return { success: false, error: `Erreur Supabase: ${dbError.message}` };
    }

    const allRows = (orders || []).map(formatOrderToSheetRow);
    const sheets = getGoogleSheetsClient(creds);

    // Effacer et réécrire le tableau complet
    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: 'A1:K5000',
    });

    const valuesToInsert = [GOOGLE_SHEETS_HEADERS, ...allRows];

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: 'A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: valuesToInsert,
      },
    });

    return { success: true, count: allRows.length };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Erreur syncAllOrdersToSheet:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Teste la connexion Google Sheets (vérifie l'authentification et l'accès au classeur)
 */
export async function testGoogleSheetsConnection(
  sheetId: string,
  serviceAccountJson?: string
): Promise<{ success: boolean; title?: string; error?: string }> {
  try {
    const cleanId = sheetId.trim();
    if (!cleanId) {
      return { success: false, error: 'Veuillez saisir un Google Sheet ID valide' };
    }

    let creds = null;
    if (serviceAccountJson && serviceAccountJson.trim()) {
      try {
        const parsed = JSON.parse(serviceAccountJson.trim());
        if (parsed.client_email && parsed.private_key) {
          creds = {
            client_email: parsed.client_email,
            private_key: parsed.private_key.replace(/\\n/g, '\n'),
          };
        }
      } catch {
        return { success: false, error: 'Le JSON du Service Account est invalide. Vérifiez la syntaxe.' };
      }
    }

    if (!creds) {
      const settings = await getSiteSettingsAction();
      creds = getServiceAccountCredentials(settings);
    }

    if (!creds) {
      return {
        success: false,
        error: 'Aucune clé de Service Account fournie ou trouvée dans la configuration.',
      };
    }

    const sheets = getGoogleSheetsClient(creds);
    const res = await sheets.spreadsheets.get({
      spreadsheetId: cleanId,
    });

    const title = res.data.properties?.title || 'Classeur sans titre';
    return { success: true, title };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}
