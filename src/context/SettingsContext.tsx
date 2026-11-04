'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { SiteSettings, getSiteSettingsAction } from '@/app/actions/settings';

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
};

interface SettingsContextType {
  settings: SiteSettings;
  refreshSettings: () => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  refreshSettings: async () => {},
  loading: false,
});

export function SettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: SiteSettings;
}) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings || DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);

  const refreshSettings = async () => {
    setLoading(true);
    try {
      const data = await getSiteSettingsAction();
      setSettings(data);
    } catch (err) {
      console.warn('Could not refresh settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialSettings) {
      refreshSettings();
    }
  }, [initialSettings]);

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
