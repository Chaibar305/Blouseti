'use client';

import React, { useEffect, useState } from 'react';
import {
  Tag,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  Check,
  X,
  AlertCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  TrendingUp,
  Percent,
  Coins,
  Copy,
  Calendar,
  Layers,
  Loader2,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import {
  getCouponsAction,
  createCouponAction,
  updateCouponAction,
  deleteCouponAction,
  toggleCouponAction,
  CreateCouponInput,
} from '@/app/actions/coupons';
import { DbCoupon } from '@/types';

interface ToastNotification {
  id: number;
  message: string;
  type: 'success' | 'error';
}

type FilterStatus = 'all' | 'active' | 'inactive' | 'expired';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<DbCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Modal State (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<string>('10');
  const [minOrderAmount, setMinOrderAmount] = useState<string>('0');
  const [maxUses, setMaxUses] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);

  // Delete Modal
  const [deletingCoupon, setDeletingCoupon] = useState<DbCoupon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch Coupons
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await getCouponsAction();
      if (res.success) {
        setCoupons(res.coupons);
      } else {
        showToast(res.error || 'Erreur lors du chargement des codes promo', 'error');
        setCoupons([]);
      }
    } catch {
      showToast('Impossible de contacter le serveur', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Open Create Modal
  const handleOpenCreate = () => {
    setModalMode('create');
    setEditingId(null);
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('10');
    setMinOrderAmount('0');
    setMaxUses('');
    setExpiresAt('');
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (coupon: DbCoupon) => {
    setModalMode('edit');
    setEditingId(coupon.id);
    setCode(coupon.code);
    setDiscountType(coupon.discount_type);
    setDiscountValue(coupon.discount_value.toString());
    setMinOrderAmount((coupon.min_order_amount || 0).toString());
    setMaxUses(coupon.max_uses ? coupon.max_uses.toString() : '');

    // Format date for datetime-local input (YYYY-MM-DDThh:mm)
    if (coupon.expires_at) {
      const date = new Date(coupon.expires_at);
      const iso = date.toISOString().slice(0, 16);
      setExpiresAt(iso);
    } else {
      setExpiresAt('');
    }

    setIsActive(coupon.is_active);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Save Coupon (Create or Edit)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 2) {
      setFormError('Le code promo doit contenir au moins 2 caractères.');
      return;
    }

    const numDiscount = parseFloat(discountValue);
    if (isNaN(numDiscount) || numDiscount <= 0) {
      setFormError('Veuillez saisir un montant de remise valide supérieur à 0.');
      return;
    }

    if (discountType === 'percentage' && numDiscount > 100) {
      setFormError('Le pourcentage ne peut pas dépasser 100%.');
      return;
    }

    const numMinAmount = parseFloat(minOrderAmount) || 0;
    const numMaxUses = maxUses.trim() ? parseInt(maxUses) : null;

    if (numMaxUses !== null && (isNaN(numMaxUses) || numMaxUses <= 0)) {
      setFormError('Le nombre maximal d’utilisations doit être un nombre positif.');
      return;
    }

    setIsSubmitting(true);

    const payload: CreateCouponInput = {
      code: cleanCode,
      discount_type: discountType,
      discount_value: numDiscount,
      min_order_amount: numMinAmount,
      max_uses: numMaxUses,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      is_active: isActive,
    };

    try {
      if (modalMode === 'create') {
        const res = await createCouponAction(payload);
        if (res.success && res.coupon) {
          setCoupons((prev) => [res.coupon!, ...prev]);
          showToast(`Code promo "${cleanCode}" créé avec succès !`);
          setIsModalOpen(false);
        } else {
          setFormError(res.error || 'Erreur lors de la création');
        }
      } else if (editingId) {
        const res = await updateCouponAction(editingId, payload);
        if (res.success && res.coupon) {
          setCoupons((prev) =>
            prev.map((c) => (c.id === editingId ? res.coupon! : c))
          );
          showToast(`Code promo "${cleanCode}" mis à jour avec succès !`);
          setIsModalOpen(false);
        } else {
          setFormError(res.error || 'Erreur lors de la modification');
        }
      }
    } catch {
      setFormError('Une erreur inattendue est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active/Inactive
  const handleToggle = async (coupon: DbCoupon) => {
    setTogglingId(coupon.id);
    try {
      const res = await toggleCouponAction(coupon.id, coupon.is_active);
      if (res.success && typeof res.is_active === 'boolean') {
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? { ...c, is_active: res.is_active! } : c))
        );
        showToast(
          `Code "${coupon.code}" ${res.is_active ? 'activé' : 'désactivé'}.`
        );
      } else {
        showToast(res.error || 'Impossible de modifier le statut', 'error');
      }
    } catch {
      showToast('Erreur serveur lors du changement de statut', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  // Delete Coupon
  const handleConfirmDelete = async () => {
    if (!deletingCoupon) return;
    setIsDeleting(true);
    try {
      const res = await deleteCouponAction(deletingCoupon.id);
      if (res.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== deletingCoupon.id));
        showToast(`Code promo "${deletingCoupon.code}" supprimé.`);
        setDeletingCoupon(null);
      } else {
        showToast(res.error || 'Erreur lors de la suppression', 'error');
      }
    } catch {
      showToast('Impossible de supprimer ce coupon', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy code to clipboard
  const handleCopyCode = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    showToast(`Code "${couponCode}" copié dans le presse-papier !`);
  };

  // Check if coupon is expired
  const isCouponExpired = (coupon: DbCoupon) => {
    if (!coupon.expires_at) return false;
    return new Date(coupon.expires_at).getTime() < Date.now();
  };

  // Check if coupon reached max uses
  const isCouponMaxed = (coupon: DbCoupon) => {
    if (coupon.max_uses === null || coupon.max_uses === undefined) return false;
    return (coupon.used_count || 0) >= coupon.max_uses;
  };

  // Filter & Search logic
  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch =
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase());

    const expired = isCouponExpired(coupon);

    if (statusFilter === 'active') {
      return matchesSearch && coupon.is_active && !expired;
    }
    if (statusFilter === 'inactive') {
      return matchesSearch && !coupon.is_active;
    }
    if (statusFilter === 'expired') {
      return matchesSearch && expired;
    }
    return matchesSearch;
  });

  // KPI Calculations
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter((c) => c.is_active && !isCouponExpired(c)).length;
  const totalUses = coupons.reduce((sum, c) => sum + (c.used_count || 0), 0);
  const expiredCoupons = coupons.filter((c) => isCouponExpired(c) || isCouponMaxed(c)).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notifications */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium transition-all animate-in slide-in-from-top-2 border ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-800'
                : 'bg-red-950/90 text-red-100 border-red-800'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Top Page Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1B2A4A] tracking-tight">
                Codes Promo & Réductions
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Créez, configurez et suivez l'efficacité de vos offres promotionnelles Blouseti.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={fetchCoupons}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shrink-0"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1B2A4A] hover:bg-[#152238] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Code Promo</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Codes */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Codes
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#1B2A4A]">{totalCoupons}</div>
          <p className="text-[11px] text-slate-500 mt-1">Codes enregistrés au total</p>
        </div>

        {/* Codes Actifs */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Actifs en Boutique
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">{activeCoupons}</div>
          <p className="text-[11px] text-emerald-700/80 mt-1">Utilisables immédiatement par les clients</p>
        </div>

        {/* Utilisations Totales */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Utilisations
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-600">{totalUses}</div>
          <p className="text-[11px] text-slate-500 mt-1">Commandes passées avec réduction</p>
        </div>

        {/* Expirés ou Épuisés */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Expirés / Limités
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">{expiredCoupons}</div>
          <p className="text-[11px] text-slate-500 mt-1">Date échue ou quota atteint</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par code (ex: MEDECIN10)..."
            className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              statusFilter === 'all'
                ? 'bg-[#1B2A4A] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous ({coupons.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Actifs ({activeCoupons})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              statusFilter === 'inactive'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Inactifs ({coupons.filter((c) => !c.is_active).length})
          </button>
          <button
            onClick={() => setStatusFilter('expired')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              statusFilter === 'expired'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Expirés ({coupons.filter(isCouponExpired).length})
          </button>
        </div>
      </div>

      {/* Main Coupons Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
            <p className="text-sm font-medium text-slate-500">Chargement des codes promotionnels...</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-3">
              <Tag className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Aucun code promo trouvé</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'Aucun code ne correspond à vos critères de recherche.'
                : 'Commencez à booster vos ventes en créant votre premier code de réduction.'}
            </p>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B2A4A] hover:bg-[#152238] text-white text-xs font-bold rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Créer un code promo</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Code Promo</th>
                  <th className="py-3.5 px-4">Type de remise</th>
                  <th className="py-3.5 px-4">Utilisations</th>
                  <th className="py-3.5 px-4">Min. Commande</th>
                  <th className="py-3.5 px-4">Expiration</th>
                  <th className="py-3.5 px-4 text-center">Statut</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCoupons.map((coupon) => {
                  const expired = isCouponExpired(coupon);
                  const maxed = isCouponMaxed(coupon);

                  return (
                    <tr
                      key={coupon.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Code with Copy */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyCode(coupon.code)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 border border-slate-200/80 font-mono font-bold text-xs tracking-wider text-slate-900 transition-colors"
                            title="Cliquer pour copier"
                          >
                            <span>{coupon.code}</span>
                            <Copy className="w-3 h-3 text-slate-400 group-hover:text-sky-600" />
                          </button>
                        </div>
                      </td>

                      {/* Discount Type */}
                      <td className="py-4 px-4">
                        {coupon.discount_type === 'percentage' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200/60">
                            <Percent className="w-3 h-3" />
                            <span>-{coupon.discount_value}%</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 font-bold text-xs border border-sky-200/60">
                            <Coins className="w-3 h-3" />
                            <span>-{coupon.discount_value} DH</span>
                          </span>
                        )}
                      </td>

                      {/* Uses / Limit */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-medium text-slate-700">
                            <span className="font-bold text-slate-900">{coupon.used_count || 0}</span>
                            <span className="text-slate-400">/</span>
                            <span>{coupon.max_uses ? `${coupon.max_uses} max` : 'Illimité'}</span>
                          </div>
                          {coupon.max_uses && (
                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  maxed ? 'bg-red-500' : 'bg-sky-500'
                                }`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    ((coupon.used_count || 0) / coupon.max_uses) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                          )}
                          {maxed && (
                            <span className="text-[10px] font-bold text-red-600">Limite atteinte</span>
                          )}
                        </div>
                      </td>

                      {/* Minimum Order Amount */}
                      <td className="py-4 px-4 text-slate-700">
                        {coupon.min_order_amount && coupon.min_order_amount > 0 ? (
                          <span className="font-semibold text-slate-900">
                            {coupon.min_order_amount} DH
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Aucun (0 DH)</span>
                        )}
                      </td>

                      {/* Expiration Date */}
                      <td className="py-4 px-4">
                        {coupon.expires_at ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-xs text-slate-700 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>
                                {new Date(coupon.expires_at).toLocaleDateString('fr-MA', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                            {expired && (
                              <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 bg-red-50 text-red-700 rounded border border-red-200">
                                Expiré
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Permanente</span>
                        )}
                      </td>

                      {/* Status Toggle Switch */}
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggle(coupon)}
                          disabled={togglingId === coupon.id}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                            coupon.is_active ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                          title={coupon.is_active ? 'Désactiver le code' : 'Activer le code'}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              coupon.is_active ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(coupon)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingCoupon(coupon)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
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
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto">
            {/* Header */}
            <div className="bg-[#1B2A4A] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold">
                  {modalMode === 'create' ? 'Nouveau Code Promo' : 'Modifier le Code Promo'}
                </h3>
              </div>
              <button
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                className="p-1 text-slate-300 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Code Promotionnel <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex: MEDECIN10, VENTEFLASH, SUMMER25"
                  required
                  className="w-full text-sm font-mono tracking-wider uppercase bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-400"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Converti automatiquement en majuscules (sans espaces).
                </p>
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Type de remise <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-400"
                  >
                    <option value="percentage">Pourcentage (%)</option>
                    <option value="fixed">Montant fixe (DH)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Valeur de remise <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="1"
                      max={discountType === 'percentage' ? 100 : undefined}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      required
                      placeholder={discountType === 'percentage' ? 'Ex: 10' : 'Ex: 50'}
                      className="w-full text-sm font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl pl-3 pr-9 py-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-400"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                      {discountType === 'percentage' ? '%' : 'DH'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Min Order Amount & Max Uses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Panier minimum requis (DH)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    placeholder="0 = aucun minimum"
                    className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-400"
                  />
                  <p className="text-[11px] text-slate-400 mt-0.5">0 si aucun minimum exigé.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Limite max. d’utilisations
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    placeholder="Vide = Illimité"
                    className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-400"
                  />
                  <p className="text-[11px] text-slate-400 mt-0.5">Laisser vide pour illimité.</p>
                </div>
              </div>

              {/* Expiration Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date d’expiration (Facultatif)
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-400"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Laisser vide si la remise n'a pas de date de fin (permanente).
                </p>
              </div>

              {/* Active Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      Rendre ce code promo immédiatement actif
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Les clients pourront l'appliquer dès validation du formulaire.
                    </p>
                  </div>
                </label>
              </div>

              {/* Actions Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#1B2A4A] hover:bg-[#152238] disabled:bg-slate-400 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <span>{modalMode === 'create' ? 'Créer le code' : 'Enregistrer'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Supprimer le code promo ?
              </h3>
              <p className="text-xs text-slate-500">
                Êtes-vous sûr de vouloir supprimer définitivement le code promo{' '}
                <strong className="text-slate-900 font-mono">{deletingCoupon.code}</strong> ? Cette
                action est irréversible.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingCoupon(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Suppression...</span>
                  </>
                ) : (
                  <span>Confirmer la suppression</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
