'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

export interface SiteSettings {
  id: string;
  whatsapp_number: string;
  phone: string;
  email: string;
  address: string;
  topbar_text: string;
  fb_pixel_id?: string;
  tiktok_pixel_id?: string;
  snapchat_pixel_id?: string;
  google_analytics_id?: string;
  cod_conversion_event?: 'Purchase' | 'Lead';
  custom_header_code?: string;
  custom_footer_code?: string;
  google_sheets_enabled?: boolean;
  google_sheets_id?: string;
  google_sheets_service_account?: string;
  google_sheets_range?: string;
  updated_at?: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  id: 'default',
  whatsapp_number: '212660123456',
  phone: '+212 6 60 12 34 56',
  email: 'contact@blouseti.shop',
  address: 'Boulevard Zerktouni, Casablanca, Maroc',
  topbar_text: 'Livraison Partout au Maroc en 24-48h • Paiement Cash à la Livraison • Échange de taille garanti',
  fb_pixel_id: '',
  tiktok_pixel_id: '',
  snapchat_pixel_id: '',
  google_analytics_id: '',
  cod_conversion_event: 'Purchase',
  custom_header_code: '',
  custom_footer_code: '',
  google_sheets_enabled: false,
  google_sheets_id: '',
  google_sheets_service_account: '',
  google_sheets_range: 'Sheet1!A:K',
};

/**
 * Récupère les paramètres du site depuis Supabase
 */
export async function getSiteSettingsAction(): Promise<SiteSettings> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error || !data) {
      return DEFAULT_SETTINGS;
    }

    return {
      id: data.id,
      whatsapp_number: data.whatsapp_number || DEFAULT_SETTINGS.whatsapp_number,
      phone: data.phone || DEFAULT_SETTINGS.phone,
      email: data.email || DEFAULT_SETTINGS.email,
      address: data.address || DEFAULT_SETTINGS.address,
      topbar_text: data.topbar_text || DEFAULT_SETTINGS.topbar_text,
      fb_pixel_id: data.fb_pixel_id || '',
      tiktok_pixel_id: data.tiktok_pixel_id || '',
      snapchat_pixel_id: data.snapchat_pixel_id || '',
      google_analytics_id: data.google_analytics_id || '',
      cod_conversion_event: (data.cod_conversion_event as 'Purchase' | 'Lead') || 'Purchase',
      custom_header_code: data.custom_header_code || '',
      custom_footer_code: data.custom_footer_code || '',
      google_sheets_enabled: Boolean(data.google_sheets_enabled),
      google_sheets_id: data.google_sheets_id || '',
      google_sheets_service_account: data.google_sheets_service_account || '',
      google_sheets_range: data.google_sheets_range || 'Sheet1!A:K',
      updated_at: data.updated_at,
    };
  } catch (err) {
    console.warn('Erreur lecture site_settings, utilisation des valeurs par défaut:', err);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Met à jour les coordonnées, pixels et scripts du site dans Supabase
 */
export async function updateSiteSettingsAction(
  newSettings: Partial<Omit<SiteSettings, 'id' | 'updated_at'>>
): Promise<{ success: boolean; settings?: SiteSettings; error?: string }> {
  try {
    const supabase = createAdminClient();

    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (newSettings.whatsapp_number !== undefined) {
      payload.whatsapp_number = newSettings.whatsapp_number.trim() || DEFAULT_SETTINGS.whatsapp_number;
    }
    if (newSettings.phone !== undefined) {
      payload.phone = newSettings.phone.trim() || DEFAULT_SETTINGS.phone;
    }
    if (newSettings.email !== undefined) {
      payload.email = newSettings.email.trim() || DEFAULT_SETTINGS.email;
    }
    if (newSettings.address !== undefined) {
      payload.address = newSettings.address.trim() || DEFAULT_SETTINGS.address;
    }
    if (newSettings.topbar_text !== undefined) {
      payload.topbar_text = newSettings.topbar_text.trim() || DEFAULT_SETTINGS.topbar_text;
    }
    if (newSettings.fb_pixel_id !== undefined) {
      payload.fb_pixel_id = newSettings.fb_pixel_id.trim();
    }
    if (newSettings.tiktok_pixel_id !== undefined) {
      payload.tiktok_pixel_id = newSettings.tiktok_pixel_id.trim();
    }
    if (newSettings.snapchat_pixel_id !== undefined) {
      payload.snapchat_pixel_id = newSettings.snapchat_pixel_id.trim();
    }
    if (newSettings.google_analytics_id !== undefined) {
      payload.google_analytics_id = newSettings.google_analytics_id.trim();
    }
    if (newSettings.cod_conversion_event !== undefined) {
      payload.cod_conversion_event = newSettings.cod_conversion_event;
    }
    if (newSettings.custom_header_code !== undefined) {
      payload.custom_header_code = newSettings.custom_header_code;
    }
    if (newSettings.custom_footer_code !== undefined) {
      payload.custom_footer_code = newSettings.custom_footer_code;
    }
    if (newSettings.google_sheets_enabled !== undefined) {
      payload.google_sheets_enabled = newSettings.google_sheets_enabled;
    }
    if (newSettings.google_sheets_id !== undefined) {
      payload.google_sheets_id = newSettings.google_sheets_id.trim();
    }
    if (newSettings.google_sheets_service_account !== undefined) {
      payload.google_sheets_service_account = newSettings.google_sheets_service_account.trim();
    }
    if (newSettings.google_sheets_range !== undefined) {
      payload.google_sheets_range = newSettings.google_sheets_range.trim() || 'Sheet1!A:K';
    }

    const { data, error } = await supabase
      .from('site_settings')
      .upsert({ id: 'default', ...payload })
      .select()
      .single();

    if (error) {
      console.error('Erreur mise à jour site_settings:', error.message);
      return { success: false, error: error.message };
    }

    // Revalider le site public et le dashboard
    revalidatePath('/', 'layout');
    revalidatePath('/admin/settings');

    return { success: true, settings: data as SiteSettings };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Exception updateSiteSettingsAction:', message);
    return { success: false, error: message };
  }
}
