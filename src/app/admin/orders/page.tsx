'use client';

import React, { useEffect, useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  ShoppingBag,
  MessageCircle,
  Search,
  RefreshCw,
  Sparkles,
  MapPin,
  Phone,
  Trash2,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  PackageOpen,
  AlertTriangle,
  Check,
  X,
  ExternalLink,
  Download,
  Upload,
  FileSpreadsheet,
  FileUp,
  FileCheck2,
  Loader2,
  FileText,
  HelpCircle,
} from 'lucide-react';
import {
  getOrdersAction,
  updateOrderStatusAction,
  deleteOrderAction,
  importOrdersAction,
  DbOrder,
  ImportedOrderInput,
} from '@/app/actions/orders';
import { syncAllOrdersToGoogleSheetsAction } from '@/app/actions/googleSheets';

type StatusFilter = 'all' | 'nouveau' | 'confirmé' | 'expédié' | 'livré' | 'annulé';

interface ToastNotification {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Synchronisation Google Sheets
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);

  // Modale d'importation Excel/CSV
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<ImportedOrderInput[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Delete modal state
  const [deletingOrder, setDeletingOrder] = useState<DbOrder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notification state
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch orders from Supabase (ZERO mock data)
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getOrdersAction();
      if (res.success) {
        setOrders(res.orders);
      } else {
        showToast(res.error || 'Erreur lors du chargement des commandes', 'error');
        setOrders([]);
      }
    } catch (e: any) {
      console.error(e);
      showToast('Impossible de contacter Supabase', 'error');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update order status with Server Action & Toast
  const handleStatusChange = async (
    orderId: string,
    newStatus: 'nouveau' | 'confirmé' | 'expédié' | 'livré' | 'annulé'
  ) => {
    setUpdatingId(orderId);
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      const res = await updateOrderStatusAction(orderId, newStatus);
      if (res.success) {
        showToast(`Statut mis à jour avec succès : "${newStatus.toUpperCase()}"`);
      } else {
        showToast(res.error || 'Erreur lors de la mise à jour du statut', 'error');
        fetchOrders();
      }
    } catch (e: any) {
      console.error(e);
      showToast('Erreur de connexion', 'error');
      fetchOrders();
    } finally {
      setUpdatingId(null);
    }
  };

  // Confirm delete with Server Action & Toast
  const handleConfirmDelete = async () => {
    if (!deletingOrder) return;
    setIsDeleting(true);

    try {
      const res = await deleteOrderAction(deletingOrder.id);
      if (res.success) {
        setOrders((prev) => prev.filter((o) => o.id !== deletingOrder.id));
        showToast(`Commande ${deletingOrder.order_number} supprimée avec succès`);
      } else {
        showToast(res.error || 'Erreur lors de la suppression', 'error');
      }
    } catch (e: any) {
      console.error(e);
      showToast('Erreur lors de la suppression de la commande', 'error');
    } finally {
      setIsDeleting(false);
      setDeletingOrder(null);
    }
  };

  // Synchronisation manuelle vers Google Sheets
  const handleSyncGoogleSheets = async () => {
    setIsSyncingSheets(true);
    try {
      const res = await syncAllOrdersToGoogleSheetsAction();
      if (res.success) {
        showToast(
          `✓ ${res.count ?? orders.length} commande(s) synchronisée(s) vers Google Sheets avec succès !`
        );
      } else {
        showToast(
          res.error ||
            'Vérifiez la configuration Google Sheets dans /admin/settings',
          'error'
        );
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la synchronisation', 'error');
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // Export Excel (.xlsx) prenant en compte les filtres actifs
  const handleExportExcel = () => {
    if (filteredOrders.length === 0) {
      showToast('Aucune commande à exporter pour la sélection actuelle', 'error');
      return;
    }

    try {
      const dataToExport = filteredOrders.map((o) => {
        let itemsStr = '';
        if (Array.isArray(o.items)) {
          itemsStr = o.items
            .map((item: any) => {
              const qty = item.quantity || 1;
              const name = item.name || item.product?.name || 'Scrub';
              const size = item.size || item.selectedSize || '';
              const color = item.color || item.selectedColor?.name || '';
              const variant = [color, size].filter(Boolean).join(' - ');
              return `${qty}x ${name}${variant ? ` (${variant})` : ''}`;
            })
            .join(' | ');
        }

        const dateStr = o.created_at
          ? new Date(o.created_at).toLocaleString('fr-MA', {
              timeZone: 'Africa/Casablanca',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '';

        return {
          'Date': dateStr,
          'N° Commande': o.order_number,
          'Nom Client': o.customer_name,
          'Genre / Coupe': o.gender || 'Femme',
          'Téléphone': o.phone,
          'Ville': o.city,
          'Adresse Complète': o.address,
          'Articles & Variantes': itemsStr,
          'Broderie Personnalisée': o.custom_embroidery || 'Aucune',
          'Total (MAD)': Number(o.total_amount || 0),
          'Statut': o.status,
          'Notes': o.notes || '',
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);

      // Largeurs de colonnes ajustées
      worksheet['!cols'] = [
        { wch: 18 }, // Date
        { wch: 18 }, // N° Commande
        { wch: 22 }, // Nom Client
        { wch: 14 }, // Genre / Coupe
        { wch: 16 }, // Téléphone
        { wch: 16 }, // Ville
        { wch: 32 }, // Adresse
        { wch: 38 }, // Articles
        { wch: 22 }, // Broderie
        { wch: 14 }, // Total (MAD)
        { wch: 14 }, // Statut
        { wch: 25 }, // Notes
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Commandes Blouseti');

      const today = new Date().toISOString().split('T')[0];
      const filename = `Commandes_Blouseti_${today}.xlsx`;

      XLSX.writeFile(workbook, filename);
      showToast(`✓ ${filteredOrders.length} commande(s) exportée(s) dans ${filename}`);
    } catch (err: any) {
      console.error(err);
      showToast('Erreur lors de la génération du fichier Excel', 'error');
    }
  };

  // Traitement et lecture d'un fichier importé (.xlsx, .xls, .csv)
  const handleFileProcess = (file: File) => {
    setIsParsingFile(true);
    setImportFile(file);
    setImportPreview([]);
    setImportErrors([]);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
          defval: '',
        });

        if (rawRows.length === 0) {
          setImportErrors(['Le fichier est vide ou ne contient aucune ligne de données.']);
          setIsParsingFile(false);
          return;
        }

        const parsedOrders: ImportedOrderInput[] = [];
        const errors: string[] = [];

        rawRows.forEach((row, index) => {
          const rowNum = index + 2; // +1 pour 1-indexé, +1 pour l'en-tête

          // Recherche intelligente insensible à la casse et aux accents
          const findVal = (...keys: string[]) => {
            const cleanKeys = keys.map((k) =>
              k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            );
            for (const [colName, val] of Object.entries(row)) {
              const cleanCol = colName
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .trim();
              if (cleanKeys.some((k) => cleanCol.includes(k) || cleanCol === k)) {
                return String(val).trim();
              }
            }
            return '';
          };

          const customerName = findVal('nom', 'client', 'customer', 'destinataire');
          const phone = findVal('telephone', 'tel', 'phone', 'gsm', 'mobile', 'whatsapp');
          const city = findVal('ville', 'city', 'destination');
          const address = findVal('adresse', 'address', 'rue', 'quartier');
          const totalStr = findVal('total', 'montant', 'prix', 'amount');
          const orderNumber = findVal('commande', 'order', 'numero', 'n°');
          const customEmbroidery = findVal('broderie', 'embroidery');
          const notes = findVal('notes', 'remarques', 'commentaire');
          const statusRaw = findVal('statut', 'status');

          // Validation des champs obligatoires
          const missing: string[] = [];
          if (!customerName) missing.push('Nom client');
          if (!phone) missing.push('Téléphone');
          if (!city) missing.push('Ville');
          if (!address) missing.push('Adresse');

          const totalNum = parseFloat(totalStr.replace(/[^\d.-]/g, '')) || 0;
          if (!totalStr || isNaN(totalNum) || totalNum <= 0) {
            missing.push('Total (montant valide en DH)');
          }

          if (missing.length > 0) {
            errors.push(`Ligne ${rowNum} : champs manquants (${missing.join(', ')})`);
            return;
          }

          // Validation du statut
          let status: ImportedOrderInput['status'] = 'nouveau';
          const s = statusRaw.toLowerCase();
          if (s.includes('confir')) status = 'confirmé';
          else if (s.includes('exped')) status = 'expédié';
          else if (s.includes('livr')) status = 'livré';
          else if (s.includes('annul')) status = 'annulé';

          parsedOrders.push({
            orderNumber: orderNumber || undefined,
            customerName,
            phone,
            city,
            address,
            totalAmount: totalNum,
            customEmbroidery: customEmbroidery || undefined,
            status,
            notes: notes || 'Importé via fichier tableur',
          });
        });

        setImportPreview(parsedOrders);
        setImportErrors(errors);
      } catch (err: any) {
        setImportErrors([`Erreur de lecture du fichier : ${err.message}`]);
      } finally {
        setIsParsingFile(false);
      }
    };

    reader.onerror = () => {
      setImportErrors(['Impossible de lire le fichier sélectionné.']);
      setIsParsingFile(false);
    };

    reader.readAsArrayBuffer(file);
  };

  // Exécution de l'importation vers Supabase
  const handleConfirmImport = async () => {
    if (importPreview.length === 0) return;
    setIsImporting(true);

    try {
      const res = await importOrdersAction(importPreview);
      if (res.success) {
        showToast(`✓ ${res.insertedCount} commande(s) importée(s) avec succès dans Supabase !`);
        setShowImportModal(false);
        setImportFile(null);
        setImportPreview([]);
        setImportErrors([]);
        fetchOrders();
      } else {
        showToast(res.error || 'Erreur lors de l’insertion des commandes', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur inattendue lors de l’importation', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === 'all' ? true : order.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      order.customer_name.toLowerCase().includes(q) ||
      order.phone.includes(q) ||
      order.city.toLowerCase().includes(q) ||
      order.order_number.toLowerCase().includes(q) ||
      (order.custom_embroidery && order.custom_embroidery.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: DbOrder['status']) => {
    switch (status) {
      case 'nouveau':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'confirmé':
        return 'bg-sky-100 text-sky-900 border-sky-300';
      case 'expédié':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      case 'livré':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'annulé':
        return 'bg-red-100 text-red-900 border-red-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const formatWhatsAppUrl = (order: DbOrder) => {
    let cleanPhone = order.phone.replace(/[^\d+]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '212' + cleanPhone.slice(1);
    } else if (cleanPhone.startsWith('+')) {
      cleanPhone = cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('212')) {
      cleanPhone = '212' + cleanPhone;
    }

    const message = `Bonjour ${order.customer_name},\n\nService client Blouseti Maroc concernant votre commande #${order.order_number} (${order.total_amount} DH).\n\nNous préparons l'expédition vers ${order.city}. Confirmez-vous la réception du colis sous 24-48h ?`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      
      {/* Toast Notifications */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-2xl shadow-2xl border flex items-center justify-between gap-3 text-xs font-bold pointer-events-auto animate-in slide-in-from-top-3 fade-in duration-300 ${
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
              onClick={() => removeToast(toast.id)}
              className="text-white/70 hover:text-white p-1 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Top Banner: Supabase Direct Sync Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl px-4 py-3 text-xs text-emerald-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <span className="font-semibold">
            Table Supabase <code className="font-mono text-emerald-950 font-bold bg-emerald-100/60 px-1.5 py-0.5 rounded">orders</code> connectée en temps réel
          </span>
        </div>
        <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold text-[11px] self-start sm:self-auto">
          {orders.length} commande{orders.length > 1 ? 's' : ''} au total
        </span>
      </div>

      {/* Header and Main Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1B2A4A] tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-sky-600" />
            <span>Gestion des Commandes COD</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Import/Export tableur, suivi des expéditions et confirmation WhatsApp en 1 clic
          </p>
        </div>

        {/* Action Buttons: Import, Export, Google Sheets Sync, Refresh */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Bouton Synchro Google Sheets */}
          <button
            onClick={handleSyncGoogleSheets}
            disabled={isSyncingSheets || loading}
            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs cursor-pointer transition-all disabled:opacity-60"
            title="Rafraîchit l'ensemble des commandes vers votre Google Sheet"
          >
            <FileSpreadsheet className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin' : ''}`} />
            <span>{isSyncingSheets ? 'Synchro en cours...' : '🔄 Synchro Google Sheets'}</span>
          </button>

          {/* Bouton Importer des commandes */}
          <button
            onClick={() => {
              setShowImportModal(true);
              setImportFile(null);
              setImportPreview([]);
              setImportErrors([]);
            }}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200/80 shadow-xs cursor-pointer transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-sky-600" />
            <span>Importer Excel/CSV</span>
          </button>

          {/* Bouton Exporter Excel */}
          <button
            onClick={handleExportExcel}
            disabled={filteredOrders.length === 0}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200/80 shadow-xs cursor-pointer transition-colors disabled:opacity-50"
            title="Exporter les commandes affichées au format Excel .xlsx"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exporter ({filteredOrders.length})</span>
          </button>

          {/* Bouton Actualiser */}
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200/80 shadow-xs cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par client, téléphone, ville ou N°..."
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {(
              [
                { id: 'all', label: 'Toutes', count: orders.length },
                { id: 'nouveau', label: 'Nouveau', count: orders.filter((o) => o.status === 'nouveau').length },
                { id: 'confirmé', label: 'Confirmé WhatsApp', count: orders.filter((o) => o.status === 'confirmé').length },
                { id: 'expédié', label: 'Expédié', count: orders.filter((o) => o.status === 'expédié').length },
                { id: 'livré', label: 'Livré & Encaissé', count: orders.filter((o) => o.status === 'livré').length },
                { id: 'annulé', label: 'Annulé', count: orders.filter((o) => o.status === 'annulé').length },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? 'bg-[#1B2A4A] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#1B2A4A] mx-auto" />
          <p className="text-xs text-slate-500 font-bold">Chargement des commandes depuis Supabase...</p>
        </div>
      ) : orders.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-slate-200 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <PackageOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Aucune commande enregistrée pour le moment</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Toutes les commandes passées par vos clients apparaîtront ici en temps réel dès validation. Vous pouvez également importer un fichier Excel existant.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-2 bg-[#1B2A4A] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md cursor-pointer hover:bg-[#111C32]"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Importer un fichier Excel/CSV</span>
            </button>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
          <Search className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-600 font-bold">Aucune commande ne correspond à vos filtres</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="text-xs text-sky-600 hover:underline font-bold mt-1"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <>
          {/* Table for Desktop */}
          <div className="hidden lg:block bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Commande</th>
                  <th className="py-3.5 px-4">Client &amp; Contact</th>
                  <th className="py-3.5 px-4">Ville / Adresse</th>
                  <th className="py-3.5 px-4">Articles &amp; Broderie</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.map((order) => {
                  const whatsappUrl = formatWhatsAppUrl(order);

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      
                      {/* Order Number & Date */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 block text-xs">
                          {order.order_number}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString('fr-MA', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }) : '-'}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900 text-xs">
                            {order.customer_name}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                              order.gender === 'Homme'
                                ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {order.gender === 'Homme' ? '👨‍⚕️ Homme' : '👩‍⚕️ Femme'}
                          </span>
                        </div>
                        <span className="font-mono text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{order.phone}</span>
                        </span>
                      </td>

                      {/* City & Address */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <span className="font-bold text-slate-800 flex items-center gap-1 text-xs">
                          <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                          <span>{order.city}</span>
                        </span>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5" title={order.address}>
                          {order.address}
                        </p>
                      </td>

                      {/* Items & Custom Embroidery */}
                      <td className="py-3.5 px-4 max-w-[240px]">
                        <div className="space-y-1">
                          {Array.isArray(order.items) &&
                            order.items.map((item: any, idx: number) => (
                              <div key={idx} className="text-[11px] text-slate-700 leading-tight">
                                <span className="font-bold text-slate-900">{item.quantity || 1}x</span>{' '}
                                <span>{item.name || item.product?.name || 'Scrub'}</span>{' '}
                                <span className="text-slate-500">
                                  ({item.color || item.selectedColor?.name || ''} / {item.size || item.selectedSize || ''})
                                </span>
                              </div>
                            ))}

                          {order.custom_embroidery && (
                            <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md text-[10px] font-bold">
                              <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="truncate max-w-[180px]">{order.custom_embroidery}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4">
                        <span className="font-black text-[#1B2A4A] text-sm block">
                          {order.total_amount} DH
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          COD (Espèces)
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4">
                        <div className="relative inline-block">
                          <select
                            value={order.status}
                            disabled={updatingId === order.id}
                            onChange={(e) =>
                              handleStatusChange(
                                order.id,
                                e.target.value as 'nouveau' | 'confirmé' | 'expédié' | 'livré' | 'annulé'
                              )
                            }
                            className={`text-[11px] font-bold py-1.5 pl-2.5 pr-7 rounded-xl border cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-sky-500 transition-colors ${getStatusBadge(
                              order.status
                            )}`}
                          >
                            <option value="nouveau">Nouveau</option>
                            <option value="confirmé">Confirmé WhatsApp</option>
                            <option value="expédié">Expédié</option>
                            <option value="livré">Livré &amp; Encaissé</option>
                            <option value="annulé">Annulé</option>
                          </select>
                          {updatingId === order.id && (
                            <RefreshCw className="w-3 h-3 animate-spin absolute right-2 top-2.5 text-slate-600" />
                          )}
                        </div>
                      </td>

                      {/* Quick Actions: WhatsApp & Delete */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-xl text-[11px] shadow-xs transition-colors"
                            title="Ouvrir WhatsApp avec message de confirmation pré-rempli"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>

                          <button
                            onClick={() => setDeletingOrder(order)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                            title="Supprimer la commande"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards for Mobile & Tablet */}
          <div className="lg:hidden space-y-3">
            {filteredOrders.map((order) => {
              const whatsappUrl = formatWhatsAppUrl(order);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-slate-900 block text-xs">
                        {order.order_number}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('fr-MA', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : '-'}
                      </span>
                    </div>

                    <span className="text-base font-black text-[#1B2A4A]">
                      {order.total_amount} DH
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-bold text-slate-900">{order.customer_name}</p>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                            order.gender === 'Homme'
                              ? 'bg-sky-100 text-sky-800 border border-sky-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {order.gender === 'Homme' ? '👨‍⚕️ Homme' : '👩‍⚕️ Femme'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">{order.phone}</p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-slate-800">{order.city}</p>
                      <p className="text-[10px] text-slate-400 max-w-[140px] truncate">{order.address}</p>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500 font-bold">Statut :</span>
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) =>
                        handleStatusChange(
                          order.id,
                          e.target.value as 'nouveau' | 'confirmé' | 'expédié' | 'livré' | 'annulé'
                        )
                      }
                      className={`text-[11px] font-bold py-1.5 px-3 rounded-xl border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      <option value="nouveau">Nouveau</option>
                      <option value="confirmé">Confirmé WhatsApp</option>
                      <option value="expédié">Expédié</option>
                      <option value="livré">Livré &amp; Encaissé</option>
                      <option value="annulé">Annulé</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Confirmer WhatsApp</span>
                    </a>

                    <button
                      onClick={() => setDeletingOrder(order)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-200 transition-colors"
                      title="Supprimer la commande"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* MODALE D'IMPORTATION EXCEL / CSV (SheetJS)                                 */}
      {/* ========================================================================= */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200 my-auto">
            
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Importer des commandes (Excel / CSV)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Glissez votre fichier <code>.xlsx</code> ou <code>.csv</code> pour ajouter des commandes en masse.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileProcess(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-sky-500 bg-slate-50 hover:bg-sky-50/40 rounded-3xl p-8 text-center cursor-pointer transition-all space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
              />
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center mx-auto text-sky-600">
                <FileUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {importFile ? (
                    <span className="text-sky-700">{importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)</span>
                  ) : (
                    <span>Glissez-déposez votre fichier ici, ou <strong className="text-sky-600 underline">parcourez</strong></span>
                  )}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Formats acceptés : <strong>.XLSX</strong>, <strong>.XLS</strong> ou <strong>.CSV</strong>
                </p>
              </div>
            </div>

            {/* Format Instructions */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">Colonnes reconnues automatiquement :</span>
              <p>
                • <strong>Obligatoires :</strong> <code>Nom / Client</code>, <code>Téléphone</code>, <code>Ville</code>, <code>Adresse</code>, <code>Total / Montant</code>
              </p>
              <p>
                • <strong>Optionnelles :</strong> <code>N° Commande</code>, <code>Broderie</code>, <code>Statut</code>, <code>Notes</code>
              </p>
            </div>

            {/* Processing Loader */}
            {isParsingFile && (
              <div className="py-6 text-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-sky-600 mx-auto" />
                <p className="text-xs text-slate-500 font-bold">Analyse du fichier tableur...</p>
              </div>
            )}

            {/* Errors List */}
            {importErrors.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5 max-h-36 overflow-y-auto">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Avertissements de validation ({importErrors.length}) :</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  {importErrors.slice(0, 5).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {importErrors.length > 5 && (
                    <li className="font-bold">... et {importErrors.length - 5} autres lignes ignorées.</li>
                  )}
                </ul>
              </div>
            )}

            {/* Valid Preview Report */}
            {importPreview.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <FileCheck2 className="w-4 h-4" />
                    <span>{importPreview.length} commande(s) prête(s) à être importée(s)</span>
                  </span>
                  <span className="text-[11px] text-slate-400">Aperçu des 3 premières lignes :</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden text-[11px]">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Client</th>
                        <th className="py-2 px-3">Téléphone</th>
                        <th className="py-2 px-3">Ville</th>
                        <th className="py-2 px-3">Total (DH)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {importPreview.slice(0, 3).map((row, idx) => (
                        <tr key={idx} className="bg-white">
                          <td className="py-1.5 px-3 font-semibold">{row.customerName}</td>
                          <td className="py-1.5 px-3 font-mono">{row.phone}</td>
                          <td className="py-1.5 px-3">{row.city}</td>
                          <td className="py-1.5 px-3 font-black text-slate-900">{row.totalAmount} DH</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isImporting || importPreview.length === 0}
                className="btn-shimmer bg-[#1B2A4A] hover:bg-[#111C32] text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Importation dans Supabase...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 text-sky-400" />
                    <span>Importer {importPreview.length} commande(s)</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE DE CONFIRMATION DE SUPPRESSION                                      */}
      {/* ========================================================================= */}
      {deletingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 max-w-sm w-full space-y-4 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Confirmer la suppression</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer définitivement la commande{' '}
                <strong className="text-slate-900 font-mono">{deletingOrder.order_number}</strong> de{' '}
                <strong className="text-slate-900">{deletingOrder.customer_name}</strong> ?
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => setDeletingOrder(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Supprimer</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
