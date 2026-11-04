'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  Search,
  Shirt,
  Pencil,
  Trash2,
  Eye,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  PackageCheck,
  Tag,
  SlidersHorizontal,
  UploadCloud,
  Loader2,
  ImageIcon,
} from 'lucide-react';
import {
  getDbProductsAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
  toggleProductVisibilityAction,
  uploadProductImageAction,
  DbProduct,
  ColorVariant,
} from '@/app/actions/products';

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const PRESET_COLORS: { name: string; hex: string }[] = [
  { name: 'Bleu Marine Médical', hex: '#1B2A4A' },
  { name: 'Vert Sauge Apaisant', hex: '#7D9D8B' },
  { name: 'Bordeaux Chirurgical', hex: '#6D1A2B' },
  { name: 'Blanc Pur Optique', hex: '#FFFFFF' },
  { name: 'Noir Carbone', hex: '#1E293B' },
  { name: 'Bleu Royal Vif', hex: '#1D4ED8' },
  { name: 'Bleu Ciel Clinique', hex: '#0EA5E9' },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [deletingProduct, setDeletingProduct] = useState<DbProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'scrub' | 'blouse' | 'polaire' | 'pack'>('scrub');
  const [price, setPrice] = useState('349');
  const [promoPrice, setPromoPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('20');
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [colorList, setColorList] = useState<Array<{ name: string; hex: string }>>([
    { name: 'Bleu Marine Médical', hex: '#1B2A4A' },
    { name: 'Vert Sauge Apaisant', hex: '#7D9D8B' },
  ]);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#1B2A4A');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  
  // Multi-image upload state (Supabase Storage)
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getDbProductsAction();
      setProducts(res.products);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Open modal in CREATE mode
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setTitle('');
    setCategory('scrub');
    setPrice('349');
    setPromoPrice('');
    setStockQuantity('25');
    setIsOutOfStock(false);
    setSelectedSizes(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
    setColorList([
      { name: 'Bleu Marine Médical', hex: '#1B2A4A' },
      { name: 'Vert Sauge Apaisant', hex: '#7D9D8B' },
    ]);
    setDescription('Ensemble médical ergonomique 4-Way Stretch respirant et infroissable.');
    setLongDescription(
      '• Composition : 72% Polyester, 21% Rayonne, 7% Élasthanne.\n• Tissu technique 4-Way Stretch ultra-respirant, infroissable et anti-taches.\n• Résistance prouvée aux lavages fréquents en machine jusqu’à 60°C.'
    );
    setUploadedImages(['/images/scrub-navy.jpg']);
    setUploadError(null);
    setIsModalOpen(true);
  };

  // Open modal in EDIT mode with pre-filled product data
  const handleOpenEditModal = (p: DbProduct) => {
    setModalMode('edit');
    setEditingId(p.id);
    setTitle(p.title);
    setCategory((p.category as any) || 'scrub');
    setPrice(String(p.price));
    setPromoPrice(p.promo_price ? String(p.promo_price) : '');
    setStockQuantity(String(p.stock_quantity ?? 20));
    setIsOutOfStock(Boolean(p.is_out_of_stock));
    setSelectedSizes(p.sizes && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L']);

    if (p.color_variants && p.color_variants.length > 0) {
      setColorList(p.color_variants.map((c) => ({ name: c.name, hex: c.hex })));
    } else if (p.colors && p.colors.length > 0) {
      setColorList(p.colors.map((c) => ({ name: c, hex: '#1B2A4A' })));
    } else {
      setColorList([{ name: 'Bleu Marine Médical', hex: '#1B2A4A' }]);
    }

    setDescription(p.description || '');
    setLongDescription(p.long_description || p.description || '');
    setUploadedImages(p.images && p.images.length > 0 ? p.images : ['/images/scrub-navy.jpg']);
    setUploadError(null);
    setIsModalOpen(true);
  };

  // Toggle size in multi-size selector
  const handleToggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Add a color
  const handleAddColor = () => {
    if (!customColorName.trim()) return;
    setColorList((prev) => [
      ...prev,
      { name: customColorName.trim(), hex: customColorHex },
    ]);
    setCustomColorName('');
  };

  const handleAddPresetColor = (preset: { name: string; hex: string }) => {
    if (colorList.some((c) => c.name === preset.name)) return;
    setColorList((prev) => [...prev, preset]);
  };

  const handleRemoveColor = (index: number) => {
    setColorList((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Drag & Drop / File Select for Supabase Storage Upload
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingImage(true);
    setUploadError(null);
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        const res = await uploadProductImageAction(formData);
        if (res.success && res.url) {
          newUrls.push(res.url);
        } else {
          setUploadError(res.error || "Erreur lors de l'upload");
        }
      }

      if (newUrls.length > 0) {
        setUploadedImages((prev) => [...prev, ...newUrls]);
      }
    } catch (err: any) {
      setUploadError(err.message || "Erreur d'upload de fichier");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setUploadedImages((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
  };

  // Submit modal (Create or Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const parsedPrice = parseFloat(price) || 0;
      const parsedPromo = promoPrice ? parseFloat(promoPrice) : null;
      const parsedStock = parseInt(stockQuantity, 10) || 0;
      const colorNames = colorList.map((c) => c.name);
      const colorVariants: ColorVariant[] = colorList.map((c) => ({
        name: c.name,
        hex: c.hex,
        in_stock: true,
      }));
      const finalImages =
        uploadedImages.length > 0 ? uploadedImages : ['/images/scrub-navy.jpg'];

      if (modalMode === 'create') {
        const slug = title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

        await createProductAction({
          title,
          slug: `${slug}-${Date.now().toString().slice(-4)}`,
          description,
          long_description: longDescription,
          price: parsedPrice,
          promo_price: parsedPromo,
          category,
          stock_quantity: parsedStock,
          is_out_of_stock: isOutOfStock,
          colors: colorNames,
          sizes: selectedSizes,
          images: finalImages,
          color_variants: colorVariants,
          is_active: true,
        });
      } else if (modalMode === 'edit' && editingId) {
        await updateProductAction(editingId, {
          title,
          description,
          long_description: longDescription,
          price: parsedPrice,
          promo_price: parsedPromo,
          category,
          stock_quantity: parsedStock,
          is_out_of_stock: isOutOfStock,
          colors: colorNames,
          sizes: selectedSizes,
          images: finalImages,
          color_variants: colorVariants,
        });
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Visibility Switch
  const handleToggleVisibility = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_active: nextStatus } : p))
    );
    await toggleProductVisibilityAction(id, nextStatus);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      await deleteProductAction(deletingProduct.id);
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      setDeletingProduct(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' ||
      p.category === categoryFilter ||
      p.category.startsWith(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      
      {/* Top Banner: Supabase Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl px-4 py-3 text-xs text-emerald-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <span className="font-semibold">
            Base Supabase Connectée &amp; Storage Actif (<code className="font-mono text-emerald-900 font-bold">qyipotnnjhriwfnmkllb</code>)
          </span>
        </div>
        <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold text-[11px] self-start sm:self-auto">
          ✓ Admin Autorisé &amp; MCP Prêt
        </span>
      </div>

      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1B2A4A] tracking-tight">
            Gestion du Catalogue Produits &amp; Stocks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ajustez les prix en Dirhams, uploadez vos photos sur Supabase et gérez la visibilité en temps réel.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Actualiser la liste"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="btn-shimmer px-4 py-2.5 rounded-xl bg-[#1B2A4A] hover:bg-[#111C32] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-[#1B2A4A]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une tenue</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom de tenue, slug..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1B2A4A]/20 shadow-2xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {[
            { id: 'all', label: 'Toutes les tenues', count: products.length },
            { id: 'scrub', label: 'Scrubs', count: products.filter((p) => p.category.startsWith('scrub')).length },
            { id: 'blouse', label: 'Blouses', count: products.filter((p) => p.category.startsWith('blouse')).length },
            { id: 'polaire', label: 'Polaires', count: products.filter((p) => p.category.startsWith('polaire') || p.category.startsWith('veste')).length },
            { id: 'pack', label: 'Packs', count: products.filter((p) => p.category.startsWith('pack')).length },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-[#1B2A4A] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${categoryFilter === cat.id ? 'bg-white/20' : 'bg-slate-100'}`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 1. DESKTOP / TABLET VIEW: TABLE                                           */}
      {/* ========================================================================= */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1B2A4A]/5 text-[#1B2A4A] font-bold border-b border-slate-200">
              <tr>
                <th className="px-5 py-4">Tenue Médicale</th>
                <th className="px-5 py-4">Catégorie</th>
                <th className="px-5 py-4">Prix Public (DH)</th>
                <th className="px-5 py-4">Stock &amp; État</th>
                <th className="px-5 py-4">Tailles &amp; Couleurs</th>
                <th className="px-5 py-4 text-center">Visibilité Boutique</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Shirt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold">Aucune tenue médicale trouvée</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isOutOfStockFinal = p.is_out_of_stock || (p.stock_quantity ?? 0) <= 0;
                  const isLowStock = !isOutOfStockFinal && (p.stock_quantity ?? 0) < 5;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Product Thumbnail & Title */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-2xs">
                            <Image
                              src={p.images[0] || '/images/scrub-navy.jpg'}
                              alt={p.title}
                              fill
                              className="object-cover"
                            />
                            {p.images.length > 1 && (
                              <span className="absolute bottom-0 right-0 bg-[#1B2A4A]/80 text-white text-[9px] px-1 rounded-tl font-bold">
                                +{p.images.length - 1}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm leading-tight truncate max-w-[220px]">
                              {p.title}
                            </p>
                            <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                              /{p.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="px-5 py-4">
                        <span className="capitalize font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg text-[11px] border border-slate-200">
                          {p.category}
                        </span>
                      </td>

                      {/* Price in DH & Promo badge */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col items-start">
                          <span className="font-black text-[#1B2A4A] text-sm">
                            {p.price} <span className="text-xs font-semibold">DH</span>
                          </span>
                          {p.promo_price && (
                            <span className="text-[10px] text-red-600 font-bold line-through">
                              {p.promo_price} DH
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Dynamic Stock Badge */}
                      <td className="px-5 py-4">
                        {isOutOfStockFinal ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                            🔴 Épuisé ({p.stock_quantity ?? 0})
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                            🟠 Stock faible ({p.stock_quantity} restants)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            🟢 En stock ({p.stock_quantity})
                          </span>
                        )}
                      </td>

                      {/* Sizes & Colors preview */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 flex-wrap max-w-[140px]">
                            {p.sizes && p.sizes.length > 0 ? (
                              p.sizes.map((s) => (
                                <span
                                  key={s}
                                  className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1 rounded"
                                >
                                  {s}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 text-[10px]">Taille unique</span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400">
                            {p.color_variants && p.color_variants.length > 0
                              ? `${p.color_variants.length} couleurs`
                              : `${p.colors?.length || 1} couleurs`}
                          </p>
                        </div>
                      </td>

                      {/* Interactive Visibility Toggle Switch */}
                      <td className="px-5 py-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleVisibility(p.id, p.is_active)}
                            className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                              p.is_active ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                            }`}
                            title={p.is_active ? 'Cliquer pour masquer' : 'Cliquer pour publier'}
                          >
                            <span className="w-5 h-5 rounded-full bg-white shadow-md transition-transform" />
                          </button>
                          <span className={`text-[10px] font-bold ${p.is_active ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {p.is_active ? 'En ligne' : 'Masqué'}
                          </span>
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/#${p.category}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                            title="Voir en boutique"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Modifier la tenue"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Supprimer définitivement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MOBILE CARD VIEW (Optimisé smartphone, 90% trafic COD au Maroc)        */}
      {/* ========================================================================= */}
      <div className="block md:hidden space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 p-6">
            <Shirt className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">Aucune tenue médicale trouvée</p>
          </div>
        ) : (
          filteredProducts.map((p) => {
            const isOutOfStockFinal = p.is_out_of_stock || (p.stock_quantity ?? 0) <= 0;
            const isLowStock = !isOutOfStockFinal && (p.stock_quantity ?? 0) < 5;

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3"
              >
                {/* Top: Photo + Titre + Catégorie */}
                <div className="flex items-start gap-3">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-2xs">
                    <Image
                      src={p.images[0] || '/images/scrub-navy.jpg'}
                      alt={p.title}
                      fill
                      className="object-cover"
                    />
                    {p.images.length > 1 && (
                      <span className="absolute bottom-0 right-0 bg-[#1B2A4A]/80 text-white text-[9px] px-1 rounded-tl font-bold">
                        +{p.images.length - 1}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="capitalize font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px] border border-slate-200">
                        {p.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                        /{p.slug}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-1 leading-snug">
                      {p.title}
                    </h4>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-black text-[#1B2A4A] text-sm">
                        {p.price} DH
                      </span>
                      {p.promo_price && (
                        <span className="text-[10px] text-red-600 line-through font-bold">
                          {p.promo_price} DH
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stock & Variantes */}
                <div className="flex items-center justify-between text-xs pt-2.5 border-t border-slate-100">
                  <div>
                    {isOutOfStockFinal ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                        🔴 Épuisé ({p.stock_quantity ?? 0})
                      </span>
                    ) : isLowStock ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        🟠 Faible ({p.stock_quantity})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        🟢 En stock ({p.stock_quantity})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <span>{p.sizes?.length || 0} tailles</span>
                    <span>•</span>
                    <span>{p.images?.length || 1} photos</span>
                  </div>
                </div>

                {/* Bottom Bar: Switch Visibilité + Boutons d'Action */}
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(p.id, p.is_active)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                        p.is_active ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                    </button>
                    <span className="text-[11px] font-bold text-slate-700">
                      {p.is_active ? 'En ligne' : 'Masqué'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/#${p.category}`}
                      className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-slate-200"
                      title="Voir en boutique"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingProduct(p)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. MODALE PRODUIT RESPONSIVE (Plein écran sur mobile, Popup sur Desktop)   */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full h-full sm:h-auto sm:max-w-2xl sm:rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-screen sm:max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header (Sticky on mobile) */}
            <div className="sticky top-0 bg-white z-10 px-5 sm:px-8 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#1B2A4A]">
                  {modalMode === 'create' ? 'Ajouter une Nouvelle Tenue' : 'Modifier la Tenue Médicale'}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  Synchronisé en temps réel avec Supabase
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 text-xs">
              
              {/* Section 1: Informations Générales */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-sky-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>1. Informations Générales</span>
                </h4>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nom du vêtement médical <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Scrub Jogger 4-Way Stretch ou Blouse Médecin Prestige"
                    required
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 sm:py-3 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Catégorie</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 sm:py-3 font-medium"
                    >
                      <option value="scrub">🩺 Scrub Médical</option>
                      <option value="blouse">🥼 Blouse Blanche</option>
                      <option value="polaire">🧥 Veste Polaire</option>
                      <option value="pack">🎁 Pack Économique</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Prix Public (DH) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      placeholder="349"
                      className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 sm:py-3 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Prix Barré Promo (DH)
                    </label>
                    <input
                      type="number"
                      value={promoPrice}
                      onChange={(e) => setPromoPrice(e.target.value)}
                      placeholder="Ex: 420 (Optionnel)"
                      className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 sm:py-3 text-slate-600"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Gestion du Stock Centralisé */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-sky-700 flex items-center gap-1.5">
                  <PackageCheck className="w-3.5 h-3.5" />
                  <span>2. Gestion des Stocks</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Quantité totale en stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      className="w-full text-sm font-black bg-white border border-slate-300 rounded-xl px-3 py-2.5"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Un stock inférieur à 5 affichera le badge &quot;Stock faible&quot;
                    </p>
                  </div>

                  <div className="pt-2 sm:pt-0">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isOutOfStock}
                        onChange={(e) => setIsOutOfStock(e.target.checked)}
                        className="w-5 h-5 rounded text-red-600 focus:ring-red-500 border-slate-300 cursor-pointer"
                      />
                      <div>
                        <span className="font-bold text-red-700 text-xs block">
                          Marquer comme Épuisé / Rupture
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Désactive le bouton d&apos;achat direct sur la boutique
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 3: Tailles Disponibles (Style Beez.ma) */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-sky-700 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>3. Sélecteur de Tailles</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">Cliquez pour activer/désactiver</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {DEFAULT_SIZES.map((size) => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleToggleSize(size)}
                        className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1B2A4A] text-white shadow-xs ring-2 ring-sky-400'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: Gestionnaire des Couleurs */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-sky-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>4. Couleurs Actives</span>
                </h4>

                {/* Active Color Badges */}
                <div className="flex flex-wrap gap-2 min-h-8">
                  {colorList.map((col, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-2xs shrink-0"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span>{col.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(idx)}
                        className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Supprimer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Custom Color */}
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <input
                    type="color"
                    value={customColorHex}
                    onChange={(e) => setCustomColorHex(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0 bg-transparent shrink-0"
                    title="Choisir le code couleur"
                  />
                  <input
                    type="text"
                    value={customColorName}
                    onChange={(e) => setCustomColorName(e.target.value)}
                    placeholder="Nom couleur (ex: Vert Émeraude, Gris Anthracite)"
                    className="flex-1 text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 min-h-[42px]"
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-3 py-2.5 rounded-xl text-xs transition-colors shrink-0 cursor-pointer min-h-[42px]"
                  >
                    Ajouter
                  </button>
                </div>

                {/* Preset quick colors */}
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Raccourcis teintes médicales :</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_COLORS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleAddPresetColor(preset)}
                        className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-400 px-2 py-1 rounded-lg text-[10px] text-slate-700 transition-colors cursor-pointer"
                      >
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.hex }} />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ================================================================= */}
              {/* SECTION 5: PHOTOS DU PRODUIT (DROPZONE SUPABASE STORAGE)          */}
              {/* ================================================================= */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-sky-700 flex items-center gap-1.5">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>5. Photos du Produit (Supabase Storage)</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">PNG, JPG, WEBP jusqu&apos;à 5 Mo</span>
                </div>

                {/* Drag & Drop Dropzone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFileSelect(e.dataTransfer.files);
                  }}
                  onClick={() => document.getElementById('product-image-dropzone-input')?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-sky-500 bg-sky-50/70 scale-101'
                      : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <input
                    id="product-image-dropzone-input"
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files)}
                  />

                  {isUploadingImage ? (
                    <div className="flex flex-col items-center justify-center py-4 text-sky-700">
                      <Loader2 className="w-8 h-8 animate-spin mb-2" />
                      <p className="text-xs font-bold">Envoi vers Supabase Storage en cours...</p>
                      <p className="text-[10px] text-slate-400">Téléversement et génération de l&apos;URL publique</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-2">
                      <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center mb-2 shadow-2xs">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        Glissez vos photos ici ou <span className="text-sky-600 underline">parcourez vos fichiers</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Sélectionnez plusieurs photos. La première sera la photo principale en vitrine.
                      </p>
                    </div>
                  )}
                </div>

                {uploadError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Uploaded Images Gallery Preview */}
                {uploadedImages.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] font-bold text-slate-700">
                        Photos du catalogue ({uploadedImages.length}) :
                      </p>
                      <span className="text-[10px] text-slate-400">
                        Cliquez sur une photo pour la mettre en 1ère position
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {uploadedImages.map((url, idx) => (
                        <div
                          key={idx}
                          className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs"
                        >
                          <Image
                            src={url}
                            alt={`Photo ${idx + 1}`}
                            fill
                            className="object-cover"
                          />

                          {/* Primary badge */}
                          {idx === 0 ? (
                            <span className="absolute top-1.5 left-1.5 bg-[#1B2A4A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs z-10">
                              ⭐ Principale
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(idx)}
                              className="absolute top-1.5 left-1.5 bg-black/60 hover:bg-black/80 text-white text-[9px] font-medium px-1.5 py-0.5 rounded shadow-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                            >
                              Mettre 1er
                            </button>
                          )}

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-xs z-10 cursor-pointer hover:bg-red-700"
                            title="Supprimer la photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preset image selector as quick fallback */}
                <div className="pt-2">
                  <span className="text-[10px] text-slate-400 block mb-1">
                    Ou choisissez rapidement parmi les visuels prédéfinis du projet :
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'Scrub Marine', url: '/images/scrub-navy.jpg' },
                      { name: 'Scrub Sauge', url: '/images/scrub-sage.jpg' },
                      { name: 'Scrub Bordeaux', url: '/images/scrub-burgundy.jpg' },
                      { name: 'Blouse Blanche', url: '/images/blouse-blanche.jpg' },
                      { name: 'Veste Polaire', url: '/images/veste-polaire.jpg' },
                    ].map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => {
                          if (!uploadedImages.includes(preset.url)) {
                            setUploadedImages((prev) => [...prev, preset.url]);
                          }
                        }}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg border border-slate-200 transition-colors"
                      >
                        + {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 6: Descriptions */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-sky-700 flex items-center gap-1.5">
                  <Shirt className="w-3.5 h-3.5" />
                  <span>6. Descriptions &amp; Conseils d&apos;entretien</span>
                </h4>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description courte (Accroche fiche)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Tissu 4-Way Stretch extensible, déperlant et anti-froissage."
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 sm:py-3"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Description détaillée (Composition textile, conseils d’entretien)
                  </label>
                  <textarea
                    rows={4}
                    value={longDescription}
                    onChange={(e) => setLongDescription(e.target.value)}
                    placeholder="• Composition : 72% Polyester, 21% Rayonne, 7% Élasthanne..."
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl p-3 leading-relaxed"
                  />
                </div>
              </div>

              {/* Modal Actions (Sticky footer on mobile) */}
              <div className="sticky bottom-0 bg-white/95 backdrop-blur-md pt-4 pb-2 border-t border-slate-100 flex items-center justify-end gap-3 z-10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 sm:py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors min-h-[44px]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingImage}
                  className="btn-shimmer px-6 py-2.5 sm:py-3 rounded-xl bg-[#1B2A4A] text-white font-bold hover:bg-[#111C32] shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 min-h-[44px]"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>{modalMode === 'create' ? 'Créer la Tenue' : 'Enregistrer les Modifications'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CONFIRMATION MODALE: SUPPRESSION PRODUIT                                */}
      {/* ========================================================================= */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 max-w-sm w-full space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Confirmer la suppression</h3>
              <p className="text-xs text-slate-500 mt-1">
                Êtes-vous sûr de vouloir supprimer définitivement la tenue{' '}
                <strong className="text-slate-900">&quot;{deletingProduct.title}&quot;</strong> ?
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-md flex items-center gap-1.5"
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
