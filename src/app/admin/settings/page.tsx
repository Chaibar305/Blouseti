'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Megaphone,
  Save,
  CheckCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Eye,
  X,
  Code2,
  Target,
  Sparkles,
  Check,
  ShoppingBag,
  ExternalLink,
  Layers,
  Terminal,
  FileCode,
  Info,
  FileSpreadsheet,
  ToggleLeft,
  ToggleRight,
  Send,
  HelpCircle,
  Truck,
} from 'lucide-react';
import {
  SiteSettings,
  getSiteSettingsAction,
  updateSiteSettingsAction,
} from '@/app/actions/settings';
import { testGoogleSheetsAction } from '@/app/actions/googleSheets';
import { InstagramIcon, FacebookIcon } from '@/components/SocialIcons';

type SettingsTab = 'livraison' | 'sheets' | 'pixels' | 'scripts' | 'contact';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('livraison');

  // 0. Tarification de Livraison
  const [shippingFee, setShippingFee] = useState<number>(35);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(450);

  // 1. Coordonnées de contact
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [topbarText, setTopbarText] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');

  // 2. Paramètres des Pixels
  const [fbPixelId, setFbPixelId] = useState('');
  const [tiktokPixelId, setTiktokPixelId] = useState('');
  const [snapchatPixelId, setSnapchatPixelId] = useState('');
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
  const [codConversionEvent, setCodConversionEvent] = useState<'Purchase' | 'Lead'>('Purchase');

  // 3. JavaScript pour pixels et analytiques
  const [customHeaderCode, setCustomHeaderCode] = useState('');
  const [customFooterCode, setCustomFooterCode] = useState('');

  // 4. Intégration Google Sheets
  const [googleSheetsEnabled, setGoogleSheetsEnabled] = useState(false);
  const [googleSheetsId, setGoogleSheetsId] = useState('');
  const [googleSheetsServiceAccount, setGoogleSheetsServiceAccount] = useState('');
  const [googleSheetsRange, setGoogleSheetsRange] = useState('Sheet1!A:K');

  // État du test de connexion Google Sheets
  const [isTestingSheet, setIsTestingSheet] = useState(false);
  const [sheetTestResult, setSheetTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getSiteSettingsAction();
      setShippingFee(data.shipping_fee !== undefined && data.shipping_fee !== null ? Number(data.shipping_fee) : 35);
      setFreeShippingThreshold(
        data.free_shipping_threshold !== undefined && data.free_shipping_threshold !== null
          ? Number(data.free_shipping_threshold)
          : 450
      );
      setWhatsappNumber(data.whatsapp_number || '');
      setPhone(data.phone || '');
      setEmail(data.email || '');
      setAddress(data.address || '');
      setTopbarText(data.topbar_text || '');
      setInstagramUrl(data.instagram_url || 'https://www.instagram.com/blouseti.shop/');
      setFacebookUrl(data.facebook_url || 'https://web.facebook.com/profile.php?id=61596347515075');

      setFbPixelId(data.fb_pixel_id || '');
      setTiktokPixelId(data.tiktok_pixel_id || '');
      setSnapchatPixelId(data.snapchat_pixel_id || '');
      setGoogleAnalyticsId(data.google_analytics_id || '');
      setCodConversionEvent(data.cod_conversion_event || 'Purchase');

      setCustomHeaderCode(data.custom_header_code || '');
      setCustomFooterCode(data.custom_footer_code || '');

      setGoogleSheetsEnabled(Boolean(data.google_sheets_enabled));
      setGoogleSheetsId(data.google_sheets_id || '');
      setGoogleSheetsServiceAccount(data.google_sheets_service_account || '');
      setGoogleSheetsRange(data.google_sheets_range || 'Sheet1!A:K');
    } catch {
      showToast('Impossible de charger les paramètres depuis Supabase', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      const res = await updateSiteSettingsAction({
        shipping_fee: Number(shippingFee),
        free_shipping_threshold: Number(freeShippingThreshold),
        whatsapp_number: whatsappNumber,
        phone,
        email,
        address,
        topbar_text: topbarText,
        instagram_url: instagramUrl,
        facebook_url: facebookUrl,
        fb_pixel_id: fbPixelId,
        tiktok_pixel_id: tiktokPixelId,
        snapchat_pixel_id: snapchatPixelId,
        google_analytics_id: googleAnalyticsId,
        cod_conversion_event: codConversionEvent,
        custom_header_code: customHeaderCode,
        custom_footer_code: customFooterCode,
        google_sheets_enabled: googleSheetsEnabled,
        google_sheets_id: googleSheetsId,
        google_sheets_service_account: googleSheetsServiceAccount,
        google_sheets_range: googleSheetsRange,
      });

      if (res.success) {
        showToast('✓ Paramètres de livraison, pixels et boutique enregistrés avec succès');
      } else {
        showToast(res.error || 'Erreur lors de l’enregistrement', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur inattendue lors de la sauvegarde', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Test de connexion Google Sheets
  const handleTestConnection = async () => {
    if (!googleSheetsId.trim()) {
      showToast('Veuillez renseigner le Google Sheet ID avant de tester', 'error');
      return;
    }

    setIsTestingSheet(true);
    setSheetTestResult(null);

    try {
      const res = await testGoogleSheetsAction(googleSheetsId, googleSheetsServiceAccount);
      if (res.success) {
        setSheetTestResult({
          success: true,
          message: `Connexion réussie ! Classeur trouvé : "${res.title || 'OK'}"`,
        });
        showToast('✓ Connexion au classeur Google Sheets validée avec succès');
      } else {
        setSheetTestResult({
          success: false,
          message: res.error || 'Impossible d’accéder au classeur Google Sheets',
        });
        showToast(res.error || 'Échec de connexion Google Sheets', 'error');
      }
    } catch (err: any) {
      setSheetTestResult({
        success: false,
        message: err.message || 'Erreur lors du test de connexion',
      });
    } finally {
      setIsTestingSheet(false);
    }
  };

  // Compteur de pixels configurés
  const activePixelsCount = [
    Boolean(fbPixelId.trim()),
    Boolean(tiktokPixelId.trim()),
    Boolean(snapchatPixelId.trim()),
    Boolean(googleAnalyticsId.trim()),
  ].filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 max-w-md w-full animate-in slide-in-from-top-3 fade-in duration-300">
          <div
            className={`p-4 rounded-2xl shadow-2xl border flex items-center justify-between gap-3 text-xs font-bold ${
              toast.type === 'success'
                ? 'bg-emerald-950 text-white border-emerald-700 shadow-emerald-950/30'
                : 'bg-red-950 text-white border-red-700 shadow-red-950/30'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-white/70 hover:text-white p-1 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Banner Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-sky-50/80 border border-sky-200/80 rounded-2xl px-4 py-3 text-xs text-sky-900">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold">
            Table Supabase <code className="font-mono text-sky-950 font-bold bg-sky-100 px-1.5 py-0.5 rounded">site_settings</code> connectée
          </span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span className="text-[11px] text-sky-800">
            {googleSheetsEnabled ? '🟢 Google Sheets synchro active' : '⚪ Synchro Sheets en attente'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-sky-700">
          <span>Modifications répercutées en temps réel</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1B2A4A] tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-sky-600" />
            <span>Paramètres, Intégrations &amp; Pixels</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gérez vos intégrations Google Sheets, vos pixels publicitaires, vos scripts d&apos;en-tête et vos coordonnées publiques.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadSettings}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>

          <button
            onClick={() => handleSubmit()}
            disabled={isSaving || loading}
            className="btn-shimmer bg-[#1B2A4A] hover:bg-[#111C32] text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-lg shadow-[#1B2A4A]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enregistrer</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 space-x-1 sm:space-x-3 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('livraison')}
          className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'livraison'
              ? 'border-sky-600 text-sky-900 bg-sky-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Truck className="w-4 h-4 text-sky-600" />
          <span>Frais de Livraison</span>
          <span className="bg-sky-100 text-sky-800 text-[10px] px-2 py-0.5 rounded-full font-black">
            {shippingFee} DH
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sheets')}
          className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'sheets'
              ? 'border-emerald-600 text-emerald-950 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Intégration Google Sheets</span>
          {googleSheetsEnabled && (
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-black">
              Actif
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('pixels')}
          className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'pixels'
              ? 'border-sky-600 text-sky-900 bg-sky-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Target className="w-4 h-4 text-sky-600" />
          <span>Paramètres des pixels</span>
          {activePixelsCount > 0 && (
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-black">
              {activePixelsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('scripts')}
          className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'scripts'
              ? 'border-sky-600 text-sky-900 bg-sky-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Code2 className="w-4 h-4 text-indigo-600" />
          <span>JavaScript pour pixels et analytiques</span>
          {(customHeaderCode.trim() || customFooterCode.trim()) && (
            <span className="bg-indigo-100 text-indigo-800 text-[10px] px-1.5 py-0.5 rounded-full font-black">
              Actif
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'contact'
              ? 'border-sky-600 text-sky-900 bg-sky-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Phone className="w-4 h-4 text-emerald-600" />
          <span>Coordonnées &amp; Annonce</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#1B2A4A] mx-auto" />
          <p className="text-xs text-slate-500 font-bold">Chargement des paramètres depuis Supabase...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ============================================================== */}
          {/* TAB: FRAIS DE LIVRAISON AU MAROC                               */}
          {/* ============================================================== */}
          {activeTab === 'livraison' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Introduction Banner */}
              <div className="bg-gradient-to-r from-sky-900 to-[#1B2A4A] text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                  <span className="inline-flex items-center gap-1.5 bg-white/10 text-sky-200 text-[11px] font-bold px-3 py-1 rounded-full mb-3 backdrop-blur-xs">
                    <Truck className="w-3.5 h-3.5 text-sky-400" />
                    Politique Tarifaire de Livraison au Maroc
                  </span>
                  <h2 className="text-lg sm:text-xl font-black">
                    Gestion des Frais de Livraison &amp; Seuil Gratuit
                  </h2>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                    Définissez ici le montant des frais de livraison standard facturés au client partout au Maroc (Casablanca, Rabat, Marrakech, Tanger, Fès, etc.) ainsi que le seuil à partir duquel vous offrez la livraison gratuite.
                  </p>
                </div>
              </div>

              {/* Delivery Settings Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Frais de livraison standard */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900">
                          Frais de Livraison Standard
                        </h3>
                        <p className="text-xs text-slate-500">Tarif par défaut pour toute commande</p>
                      </div>
                    </div>
                    <span className="bg-sky-100 text-sky-900 font-black text-sm px-3 py-1 rounded-xl">
                      {shippingFee} DH
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Tarif de livraison partout au Maroc (en Dirhams DH) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="200"
                        step="1"
                        value={shippingFee}
                        onChange={(e) => setShippingFee(Number(e.target.value))}
                        required
                        className="w-full text-lg font-black text-[#1B2A4A] bg-slate-50 border border-slate-300 rounded-2xl pl-4 pr-14 py-3 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-mono"
                      />
                      <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">
                        DH
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      Ce montant s&apos;affiche sur la modale de commande COD (Paiement à la livraison) et dans le panier.
                    </p>
                  </div>

                  {/* Boutons rapides */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Sélection rapide en 1 clic :
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[0, 25, 29, 35, 40, 45].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setShippingFee(val)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                            shippingFee === val
                              ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {val === 0 ? 'Gratuit (0 DH)' : `${val} DH`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Seuil de livraison gratuite */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900">
                          Seuil de Livraison Gratuite
                        </h3>
                        <p className="text-xs text-slate-500">Offrez la livraison au-delà d&apos;un montant</p>
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-900 font-black text-sm px-3 py-1 rounded-xl">
                      {freeShippingThreshold === 0 ? 'Désactivé' : `${freeShippingThreshold} DH`}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Montant minimum du panier pour livraison offerte (en DH)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="2000"
                        step="10"
                        value={freeShippingThreshold}
                        onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                        className="w-full text-lg font-black text-[#1B2A4A] bg-slate-50 border border-slate-300 rounded-2xl pl-4 pr-14 py-3 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-mono"
                      />
                      <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">
                        DH
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      Réglez à <strong className="text-slate-600">0</strong> pour désactiver la livraison gratuite et toujours faire payer la livraison standard.
                    </p>
                  </div>

                  {/* Boutons rapides */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Sélection rapide de seuil :
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[0, 300, 400, 450, 500, 600].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setFreeShippingThreshold(val)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                            freeShippingThreshold === val
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {val === 0 ? 'Désactiver (Toujours payant)' : `${val} DH`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Simulation en direct */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-md">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sky-400">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Simulateur en Temps Réel pour le Client</h4>
                    <p className="text-[11px] text-slate-400">Voici exactement ce que le client verra lors de sa commande :</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Cas 1: Commande inférieure au seuil */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-slate-300 font-bold border-b border-white/10 pb-2">
                      <span>Exemple : 1 Blouse Médicale</span>
                      <span className="text-amber-400">299 DH</span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-400">
                      <div className="flex justify-between">
                        <span>Articles :</span>
                        <span className="text-slate-200">299 DH</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Frais de livraison :</span>
                        <span className={shippingFee === 0 || (freeShippingThreshold > 0 && 299 >= freeShippingThreshold) ? 'text-emerald-400 font-bold' : 'text-sky-300 font-bold'}>
                          {shippingFee === 0 || (freeShippingThreshold > 0 && 299 >= freeShippingThreshold) ? '0 DH (GRATUIT)' : `+ ${shippingFee} DH`}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-white/10 pt-1.5 font-bold text-xs text-white">
                        <span>Total Net à payer :</span>
                        <span className="text-emerald-400 text-sm">
                          {299 + (shippingFee === 0 || (freeShippingThreshold > 0 && 299 >= freeShippingThreshold) ? 0 : shippingFee)} DH
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cas 2: Commande supérieure ou égale au seuil */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-slate-300 font-bold border-b border-white/10 pb-2">
                      <span>Exemple : Pack 2 Ensembles</span>
                      <span className="text-emerald-400">598 DH</span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-400">
                      <div className="flex justify-between">
                        <span>Articles :</span>
                        <span className="text-slate-200">598 DH</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Frais de livraison :</span>
                        <span className={freeShippingThreshold > 0 && 598 >= freeShippingThreshold ? 'text-emerald-400 font-bold' : shippingFee === 0 ? 'text-emerald-400 font-bold' : 'text-sky-300 font-bold'}>
                          {freeShippingThreshold > 0 && 598 >= freeShippingThreshold ? '🎉 GRATUIT (0 DH)' : shippingFee === 0 ? 'GRATUIT (0 DH)' : `+ ${shippingFee} DH`}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-white/10 pt-1.5 font-bold text-xs text-white">
                        <span>Total Net à payer :</span>
                        <span className="text-emerald-400 text-sm">
                          {598 + (freeShippingThreshold > 0 && 598 >= freeShippingThreshold ? 0 : shippingFee)} DH
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: INTÉGRATION GOOGLE SHEETS                                */}
          {/* ============================================================== */}
          {activeTab === 'sheets' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Introduction Banner */}
              <div className="bg-gradient-to-r from-emerald-900 to-[#1B2A4A] text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                  <span className="inline-flex items-center gap-1.5 bg-white/10 text-emerald-200 text-[11px] font-bold px-3 py-1 rounded-full mb-3 backdrop-blur-xs">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    Synchronisation Cloud Google Sheets v4
                  </span>
                  <h2 className="text-lg sm:text-xl font-black">
                    Synchronisation Automatique des Commandes COD
                  </h2>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                    Connectez votre tableau de bord Blouseti à Google Sheets. Chaque nouvelle commande COD passée sur votre boutique sera automatiquement insérée sous forme de nouvelle ligne avec date, articles, total et lien WhatsApp direct.
                  </p>
                </div>
              </div>

              {/* Activation Switch Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900">
                        Synchronisation automatique des commandes en direct
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Ajoute instantanément chaque nouvelle commande client dans votre feuille Google Sheets.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setGoogleSheetsEnabled(!googleSheetsEnabled)}
                    className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      googleSheetsEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        googleSheetsEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Configuration Inputs */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span>Paramètres du Classeur Google</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Renseignez l&apos;ID de votre classeur et la clé de compte de service Google Cloud.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  
                  {/* Google Sheet ID */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Google Sheet ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={googleSheetsId}
                      onChange={(e) => setGoogleSheetsId(e.target.value)}
                      placeholder="Ex: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                      className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Visible dans l&apos;URL de votre feuille : <code className="text-emerald-800 font-bold">/spreadsheets/d/<strong>[ID]</strong>/edit</code>
                    </p>
                  </div>

                  {/* Sheet Name / Range */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Nom de l&apos;onglet / Plage
                    </label>
                    <input
                      type="text"
                      value={googleSheetsRange}
                      onChange={(e) => setGoogleSheetsRange(e.target.value)}
                      placeholder="Sheet1!A:K ou Commandes!A:K"
                      className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Par défaut : <code className="font-bold">Sheet1!A:K</code> (ou le nom exact de votre premier onglet).
                    </p>
                  </div>
                </div>

                {/* Service Account JSON */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Clé Privée JSON du Service Account Google
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Générée depuis Google Cloud Console (IAM &gt; Service Accounts)
                    </span>
                  </div>

                  <textarea
                    rows={6}
                    value={googleSheetsServiceAccount}
                    onChange={(e) => setGoogleSheetsServiceAccount(e.target.value)}
                    placeholder={`{\n  "type": "service_account",\n  "project_id": "blouseti-project",\n  "client_email": "blouseti-sheets@blouseti-project.iam.gserviceaccount.com",\n  "private_key": "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"\n}`}
                    className="w-full text-xs font-mono bg-slate-950 text-emerald-400 p-4 rounded-2xl border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 leading-relaxed shadow-inner"
                    spellCheck={false}
                  />
                  <p className="text-[10px] text-slate-500 mt-1.5">
                    💡 Vous pouvez aussi utiliser les variables d&apos;environnement <code className="font-bold text-slate-700">GOOGLE_SHEETS_CLIENT_EMAIL</code> et <code className="font-bold text-slate-700">GOOGLE_SHEETS_PRIVATE_KEY</code>.
                  </p>
                </div>

                {/* Connection Test Action */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTestingSheet || !googleSheetsId.trim()}
                      className="btn-shimmer bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isTestingSheet ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Test en cours...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Tester la connexion Google Sheets</span>
                        </>
                      )}
                    </button>
                  </div>

                  {sheetTestResult && (
                    <div
                      className={`text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2 ${
                        sheetTestResult.success
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {sheetTestResult.success ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      )}
                      <span>{sheetTestResult.message}</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Step-by-Step Guide Box */}
              <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 space-y-3 text-xs">
                <h4 className="font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider text-[11px]">
                  <HelpCircle className="w-4 h-4 text-sky-600" />
                  <span>Guide : Activer Google Sheets en 3 étapes</span>
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-slate-600 leading-relaxed text-[11px]">
                  <li>
                    <strong>Activez l&apos;API :</strong> Sur la console Google Cloud, activez l&apos;API <strong>Google Sheets API</strong> et créez un <strong>Service Account</strong>.
                  </li>
                  <li>
                    <strong>Générez une clé JSON :</strong> Dans votre compte de service, cliquez sur l&apos;onglet <em>Clés</em> &gt; <em>Ajouter une clé</em> &gt; <em>Créer une clé (JSON)</em>.
                  </li>
                  <li>
                    <strong>Partagez le classeur :</strong> Ouvrez votre feuille Google Sheets, cliquez sur <strong>Partager</strong> en haut à droite, et invitez l&apos;adresse <code>client_email</code> du compte de service avec le rôle <strong>Éditeur</strong>.
                  </li>
                </ol>
              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: PARAMÈTRES DES PIXELS                                    */}
          {/* ============================================================== */}
          {activeTab === 'pixels' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Introduction Card */}
              <div className="bg-gradient-to-r from-sky-900 to-[#1B2A4A] text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                  <span className="inline-flex items-center gap-1.5 bg-white/10 text-sky-200 text-[11px] font-bold px-3 py-1 rounded-full mb-3 backdrop-blur-xs">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    Tracking E-Commerce &amp; COD Maroc
                  </span>
                  <h2 className="text-lg sm:text-xl font-black">
                    Configuration des Pixels Publicitaires
                  </h2>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                    Saisissez vos identifiants de pixels. Blouseti injecte automatiquement les scripts officiels, déclenche l&apos;événement <strong>PageView</strong> sur toute la boutique et transmet la valeur de commande lors de la confirmation COD.
                  </p>
                </div>
              </div>

              {/* Grid des Pixels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Meta / Facebook Pixel */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-blue-300 transition-all space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1877F2] font-black text-lg">
                        f
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900">Facebook Pixel (Meta)</h3>
                        <p className="text-[11px] text-slate-400">Instagram &amp; Facebook Ads</p>
                      </div>
                    </div>
                    {fbPixelId.trim() ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Actif
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        Non configuré
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Facebook Pixel ID
                    </label>
                    <input
                      type="text"
                      value={fbPixelId}
                      onChange={(e) => setFbPixelId(e.target.value)}
                      placeholder="Ex: 1234567890123456"
                      className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Identifiant numérique (15 à 16 chiffres) fourni par Meta Events Manager.
                    </p>
                  </div>
                </div>

                {/* TikTok Pixel */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-black/30 transition-all space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-black text-xs shadow-xs">
                        TT
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900">TikTok Pixel</h3>
                        <p className="text-[11px] text-slate-400">TikTok Ads Manager</p>
                      </div>
                    </div>
                    {tiktokPixelId.trim() ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Actif
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        Non configuré
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      TikTok Pixel ID
                    </label>
                    <input
                      type="text"
                      value={tiktokPixelId}
                      onChange={(e) => setTiktokPixelId(e.target.value)}
                      placeholder="Ex: C1234567890ABCDEF"
                      className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Identifiant fourni dans TikTok Ads Assets &gt; Events.
                    </p>
                  </div>
                </div>

                {/* Snapchat Pixel */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-amber-300 transition-all space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#FFFC00] border border-amber-300 text-slate-950 flex items-center justify-center font-black text-xs shadow-xs">
                        👻
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900">Snapchat Pixel</h3>
                        <p className="text-[11px] text-slate-400">Snap Ads Manager</p>
                      </div>
                    </div>
                    {snapchatPixelId.trim() ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Actif
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        Non configuré
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Snapchat Pixel ID
                    </label>
                    <input
                      type="text"
                      value={snapchatPixelId}
                      onChange={(e) => setSnapchatPixelId(e.target.value)}
                      placeholder="Ex: a1b2c3d4-e5f6-7890-abcd-1234567890ab"
                      className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Identifiant Snap Pixel (format UUID) depuis Snap Ads.
                    </p>
                  </div>
                </div>

                {/* Google Analytics 4 */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-amber-300 transition-all space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-black text-xs shadow-xs">
                        GA4
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900">Google Analytics 4</h3>
                        <p className="text-[11px] text-slate-400">Mesure d&apos;audience Google Tag</p>
                      </div>
                    </div>
                    {googleAnalyticsId.trim() ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Actif
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        Non configuré
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Google Analytics ID (ID de mesure)
                    </label>
                    <input
                      type="text"
                      value={googleAnalyticsId}
                      onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                      placeholder="Ex: G-XXXXXXXXXX"
                      className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Flux de données GA4 au format G-XXXXXXXXXX.
                    </p>
                  </div>
                </div>

              </div>

              {/* Événement de Conversion COD */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">
                        Événement de Conversion COD (Cash On Delivery)
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Choisissez comment les commandes passées sans paiement en ligne doivent être comptabilisées.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="max-w-xl">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Type d&apos;événement envoyé aux plateformes
                  </label>
                  <select
                    value={codConversionEvent}
                    onChange={(e) => setCodConversionEvent(e.target.value as 'Purchase' | 'Lead')}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="Purchase">Purchase (Achat avec montant MAD et articles - Recommandé E-Commerce)</option>
                    <option value="Lead">Lead (Prospect qualifié - Recommandé pour validation téléphonique)</option>
                  </select>

                  <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
                    <div className="flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                      <div>
                        {codConversionEvent === 'Purchase' ? (
                          <p>
                            <strong>Mode &apos;Purchase&apos; :</strong> Envoie l&apos;événement d&apos;achat complet avec le montant total en <strong>MAD</strong>, la ville de livraison et la liste des articles. Permet à Meta et TikTok d&apos;optimiser directement vos campagnes sur le <strong>ROAS (Retour sur dépenses publicitaires)</strong>.
                          </p>
                        ) : (
                          <p>
                            <strong>Mode &apos;Lead&apos; :</strong> Envoie l&apos;événement comme un prospect qualifié. Idéal si un pourcentage élevé de commandes COD n&apos;est pas confirmé lors de l&apos;appel téléphonique.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: JAVASCRIPT POUR PIXELS ET ANALYTIQUES                    */}
          {/* ============================================================== */}
          {activeTab === 'scripts' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                  <span className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 text-[11px] font-bold px-3 py-1 rounded-full mb-3 border border-indigo-500/30">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    Personnalisation Avancée (YouCan Style)
                  </span>
                  <h2 className="text-lg sm:text-xl font-black">
                    JavaScript pour Pixels et Analytiques
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Insérez vos scripts personnalisés (Google Tag Manager, Microsoft Clarity, Hotjar, Crisp, Tidio, balises de vérification de domaine Meta). Les balises <code>&lt;script&gt;</code>, <code>&lt;meta&gt;</code> et <code>&lt;style&gt;</code> sont supportées.
                  </p>
                </div>
              </div>

              {/* 1. Code d'en-tête (<head>) */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-black text-slate-900">
                      Code d&apos;en-tête supplémentaire (&lt;head&gt;)
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full w-fit">
                    Injecté dans &lt;head&gt;
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Supporte les balises <code>&lt;meta&gt;</code>, <code>&lt;style&gt;</code>, et <code>&lt;script&gt;</code>. Idéal pour Google Tag Manager (GTM), balises de vérification Meta / Pinterest ou polices CSS personnalisées.
                </p>

                <div className="relative">
                  <textarea
                    rows={8}
                    value={customHeaderCode}
                    onChange={(e) => setCustomHeaderCode(e.target.value)}
                    placeholder={`<!-- Exemple: Google Tag Manager ou Meta Domain Verification -->\n<meta name="facebook-domain-verification" content="abcdef0123456789" />\n<script>\n  // Mon code analytics supplémentaire\n</script>`}
                    className="w-full text-xs font-mono bg-slate-950 text-emerald-400 p-4 rounded-2xl border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 leading-relaxed shadow-inner"
                    spellCheck={false}
                  />
                </div>
              </div>

              {/* 2. Code de pied de page (<body>) */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-sky-600" />
                    <h3 className="text-sm font-black text-slate-900">
                      Code de pied de page supplémentaire (&lt;body&gt;)
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full w-fit">
                    Injecté avant la fermeture de &lt;/body&gt;
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Ce code sera exécuté juste avant la fermeture de <code>&lt;/body&gt;</code>. Idéal pour les widgets de chat (Tidio, Crisp, WhatsApp widget personnalisé) ou les traceurs externes asynchrones.
                </p>

                <div className="relative">
                  <textarea
                    rows={8}
                    value={customFooterCode}
                    onChange={(e) => setCustomFooterCode(e.target.value)}
                    placeholder={`<!-- Exemple: Widget de chat ou script de retargeting -->\n<script>\n  // Code exécuté en bas de page\n</script>`}
                    className="w-full text-xs font-mono bg-slate-950 text-sky-300 p-4 rounded-2xl border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500 leading-relaxed shadow-inner"
                    spellCheck={false}
                  />
                </div>
              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: COORDONNÉES & ANNONCES DU SITE                            */}
          {/* ============================================================== */}
          {activeTab === 'contact' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Coordonnées directes */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h2 className="text-base font-black text-[#1B2A4A] flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-emerald-600" />
                    <span>Canaux de Contact Direct (WhatsApp &amp; Téléphone)</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Ces coordonnées alimentent tous les boutons WhatsApp flottants, l&apos;en-tête et le pied de page du site.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Numéro WhatsApp Commercial (Format international sans +) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="212660123456"
                        required
                        className="w-full text-sm font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      />
                      <MessageCircle className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Ex: <code className="font-bold text-slate-600">212660123456</code> (génère le lien <code className="text-emerald-700">wa.me/212660123456</code>)
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Téléphone d&apos;appel affiché (Format lisible) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+212 6 60 12 34 56 ou 05 22 12 34 56"
                        required
                        className="w-full text-sm font-semibold bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      />
                      <Phone className="w-4 h-4 text-sky-600 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Adresse Email Service Client <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contact@blouseti.shop"
                        required
                        className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Adresse de l&apos;Atelier / Siège Maroc <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Boulevard Zerktouni, Casablanca, Maroc"
                        required
                        className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      />
                      <MapPin className="w-4 h-4 text-red-500 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Page Instagram Officielle
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        placeholder="https://www.instagram.com/blouseti.shop/"
                        className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      />
                      <div className="absolute left-3.5 top-3.5 text-pink-500">
                        <InstagramIcon className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Page Facebook Officielle
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={facebookUrl}
                        onChange={(e) => setFacebookUrl(e.target.value)}
                        placeholder="https://web.facebook.com/profile.php?id=61596347515075"
                        className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      />
                      <div className="absolute left-3.5 top-3.5 text-[#1877F2]">
                        <FacebookIcon className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bandeau d'annonce (TopBar) */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
                <div>
                  <h2 className="text-base font-black text-[#1B2A4A] flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-amber-500" />
                    <span>Message d&apos;Annonce du Bandeau Supérieur (TopBar)</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Bandeau défilant ou statique visible tout en haut de la boutique.
                  </p>
                </div>

                <div>
                  <textarea
                    rows={2}
                    value={topbarText}
                    onChange={(e) => setTopbarText(e.target.value)}
                    placeholder="Livraison Partout au Maroc en 24-48h • Paiement Cash à la Livraison • Échange de taille garanti"
                    required
                    className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl p-3 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">
                    Aperçu visuel du bandeau :
                  </span>
                  <div className="bg-[#111C32] text-white text-[11px] py-2 px-4 rounded-xl flex items-center justify-center text-center font-medium shadow-xs">
                    <span>{topbarText || 'Votre annonce apparaîtra ici...'}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Sticky Bottom Bar */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-4 shadow-lg flex items-center justify-between gap-4 sticky bottom-4 z-40">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="hidden sm:inline">Modifications sauvegardées directement dans Supabase</span>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="btn-shimmer bg-[#1B2A4A] hover:bg-[#111C32] text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm shadow-xl shadow-[#1B2A4A]/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 shrink-0"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enregistrement en cours...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-emerald-400" />
                  <span>Enregistrer les modifications</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
