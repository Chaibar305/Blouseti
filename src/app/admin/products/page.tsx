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
  ChevronDown,
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
import {
  getCategoriesAction,
  addCategoryAction,
} from '@/app/actions/categories';
import { FALLBACK_CATEGORIES } from '@/data/categories';
import { ColorSizeVariant, Category } from '@/types';

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export interface AdminColorItem {
  name: string;
  hex: string;
  image_url?: string;
  sizes: ColorSizeVariant[];
}

const buildDefaultColorSizes = (
  existingSizes?: ColorSizeVariant[],
  fallbackActiveSizes?: string[],
  defaultStock: number = 5
): ColorSizeVariant[] => {
  return DEFAULT_SIZES.map((sizeName) => {
    const existing = existingSizes?.find((s) => s.size === sizeName);
    if (existing) {
      return {
        size: sizeName,
        stock: typeof existing.stock === 'number' ? Math.max(0, existing.stock) : 0,
        active: existing.active !== false,
      };
    }
    const isActive =
      fallbackActiveSizes && fallbackActiveSizes.length > 0
        ? fallbackActiveSizes.includes(sizeName)
        : true;
    return {
      size: sizeName,
      stock: isActive ? defaultStock : 0,
      active: isActive,
    };
  });
};

const calculateTotalStock = (colors: AdminColorItem[]): number => {
  return colors.reduce((acc, col) => {
    const colorTotal = (col.sizes || []).reduce((sum, s) => {
      return s.active ? sum + (Number(s.stock) || 0) : sum;
    }, 0);
    return acc + colorTotal;
  }, 0);
};

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

  // Dynamic Categories from Supabase
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('👨🍳');
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [deletingProduct, setDeletingProduct] = useState<DbProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('scrub');
  const [price, setPrice] = useState('349');
  const [promoPrice, setPromoPrice] = useState('');
  const [embroideryPrice, setEmbroideryPrice] = useState('20');
  const [stockQuantity, setStockQuantity] = useState('20');
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [colorList, setColorList] = useState<AdminColorItem[]>([
    {
      name: 'Bleu Marine Médical',
      hex: '#1B2A4A',
      image_url: '/images/scrub-navy.jpg',
      sizes: DEFAULT_SIZES.map((size) => ({ size, stock: 5, active: true })),
    },
    {
      name: 'Vert Sauge Apaisant',
      hex: '#7D9D8B',
      image_url: '/images/scrub-sage.jpg',
      sizes: DEFAULT_SIZES.map((size) => ({ size, stock: 5, active: true })),
    },
  ]);
  const [expandedColorIndex, setExpandedColorIndex] = useState<number | null>(null);
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

  const fetchCategories = async () => {
    try {
      const res = await getCategoriesAction();
      if (res && res.success && res.categories) {
        setCategories(res.categories);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCategoryName.trim()) return;
    setIsSavingCategory(true);
    setCategoryError(null);
    try {
      const res = await addCategoryAction({
        name: newCategoryName.trim(),
        icon: newCategoryIcon.trim() || '👔',
      });
      if (res.success && res.category) {
        setCategories((prev) => {
          const exists = prev.some((c) => c.slug === res.category!.slug);
          return exists ? prev : [...prev, res.category!];
        });
        setCategory(res.category.slug);
        setNewCategoryName('');
        setIsCreatingCategory(false);
      } else {
        setCategoryError(res.error || "Erreur lors de la création");
      }
    } catch (err: any) {
      setCategoryError(err.message || "Erreur lors de la création");
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Open modal in CREATE mode
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setTitle('');
    setCategory(categories[0]?.slug || 'scrub');
    setIsCreatingCategory(false);
    setCategoryError(null);
    setPrice('349');
    setPromoPrice('');
    setEmbroideryPrice('45');
    setIsOutOfStock(false);
    setSelectedSizes(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
    const initialColors: AdminColorItem[] = [
      {
        name: 'Bleu Marine Médical',
        hex: '#1B2A4A',
        image_url: '/images/scrub-navy.jpg',
        sizes: DEFAULT_SIZES.map((size) => ({ size, stock: 5, active: true })),
      },
      {
        name: 'Vert Sauge Apaisant',
        hex: '#7D9D8B',
        image_url: '/images/scrub-sage.jpg',
        sizes: DEFAULT_SIZES.map((size) => ({ size, stock: 5, active: true })),
      },
    ];
    setColorList(initialColors);
    setStockQuantity(String(calculateTotalStock(initialColors)));
    setExpandedColorIndex(null);
    setDescription('Ensemble ergonomique respirant et infroissable.');
    setLongDescription(
      '• Composition haute résistance conçue pour un usage professionnel intensif.\n• Tissu respirant, infroissable et anti-taches.\n• Résistance prouvée aux lavages fréquents en machine jusqu’à 60°C.'
    );
    setUploadedImages(['/images/scrub-navy.jpg', '/images/scrub-sage.jpg']);
    setUploadError(null);
    setIsModalOpen(true);
  };

  // Open modal in EDIT mode with pre-filled product data
  const handleOpenEditModal = (p: DbProduct) => {
    setModalMode('edit');
    setEditingId(p.id);
    setTitle(p.title);
    setCategory(p.category || 'scrub');
    setIsCreatingCategory(false);
    setCategoryError(null);
    setPrice(String(p.price));
    setPromoPrice(p.promo_price ? String(p.promo_price) : '');
    setEmbroideryPrice(
      p.embroidery_price !== undefined && p.embroidery_price !== null
        ? String(p.embroidery_price)
        : '45'
    );
    setIsOutOfStock(Boolean(p.is_out_of_stock));
    setSelectedSizes(p.sizes && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L']);

    const productImages = p.images && p.images.length > 0 ? p.images : ['/images/scrub-navy.jpg'];
    setUploadedImages(productImages);

    let initialColors: AdminColorItem[] = [];

    if (p.color_variants && p.color_variants.length > 0) {
      initialColors = p.color_variants.map((c, idx) => ({
        name: c.name,
        hex: c.hex,
        image_url: c.image_url || productImages[idx] || productImages[0] || '/images/scrub-navy.jpg',
        sizes: buildDefaultColorSizes(
          c.sizes,
          p.sizes,
          Math.max(1, Math.round((p.stock_quantity ?? 20) / ((p.sizes?.length || 4) * (p.color_variants?.length || 1))))
        ),
      }));
    } else if (p.colors && p.colors.length > 0) {
      initialColors = p.colors.map((c, idx) => ({
        name: c,
        hex: idx === 0 ? '#1B2A4A' : '#7D9D8B',
        image_url: productImages[idx] || productImages[0] || '/images/scrub-navy.jpg',
        sizes: buildDefaultColorSizes(undefined, p.sizes, 5),
      }));
    } else {
      initialColors = [
        {
          name: 'Bleu Marine Médical',
          hex: '#1B2A4A',
          image_url: productImages[0] || '/images/scrub-navy.jpg',
          sizes: buildDefaultColorSizes(undefined, p.sizes, 5),
        },
      ];
    }

    setColorList(initialColors);
    const computedTotal = calculateTotalStock(initialColors);
    setStockQuantity(String(computedTotal > 0 ? computedTotal : (p.stock_quantity ?? 0)));
    setExpandedColorIndex(null);

    setDescription(p.description || '');
    setLongDescription(p.long_description || p.description || '');
    setUploadError(null);
    setIsModalOpen(true);
  };

  // Toggle size in multi-size selector
  const handleToggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Toggle active status of a size within a specific color
  const handleToggleColorSize = (colorIndex: number, sizeName: string) => {
    setColorList((prev) => {
      const next = prev.map((col, idx) => {
        if (idx !== colorIndex) return col;
        const nextSizes = col.sizes.map((s) => {
          if (s.size !== sizeName) return s;
          const willBeActive = !s.active;
          return {
            ...s,
            active: willBeActive,
            stock: willBeActive && s.stock === 0 ? 5 : s.stock,
          };
        });
        return { ...col, sizes: nextSizes };
      });
      setStockQuantity(String(calculateTotalStock(next)));
      return next;
    });
  };

  // Update stock number for a specific size within a color
  const handleUpdateColorSizeStock = (colorIndex: number, sizeName: string, newStock: number) => {
    const safeStock = Math.max(0, isNaN(newStock) ? 0 : newStock);
    setColorList((prev) => {
      const next = prev.map((col, idx) => {
        if (idx !== colorIndex) return col;
        const nextSizes = col.sizes.map((s) => {
          if (s.size !== sizeName) return s;
          return { ...s, stock: safeStock };
        });
        return { ...col, sizes: nextSizes };
      });
      setStockQuantity(String(calculateTotalStock(next)));
      return next;
    });
  };

  // Add a color
  const handleAddColor = () => {
    if (!customColorName.trim()) return;
    const defaultImg =
      uploadedImages[colorList.length % Math.max(uploadedImages.length, 1)] ||
      uploadedImages[0] ||
      '/images/scrub-navy.jpg';
    const newColor: AdminColorItem = {
      name: customColorName.trim(),
      hex: customColorHex,
      image_url: defaultImg,
      sizes: buildDefaultColorSizes(undefined, selectedSizes, 5),
    };
    setColorList((prev) => {
      const next = [...prev, newColor];
      setStockQuantity(String(calculateTotalStock(next)));
      return next;
    });
    setCustomColorName('');
  };

  const handleAddPresetColor = (preset: { name: string; hex: string }) => {
    if (colorList.some((c) => c.name === preset.name)) return;
    const defaultImg =
      uploadedImages[colorList.length % Math.max(uploadedImages.length, 1)] ||
      uploadedImages[0] ||
      '/images/scrub-navy.jpg';
    const newColor: AdminColorItem = {
      ...preset,
      image_url: defaultImg,
      sizes: buildDefaultColorSizes(undefined, selectedSizes, 5),
    };
    setColorList((prev) => {
      const next = [...prev, newColor];
      setStockQuantity(String(calculateTotalStock(next)));
      return next;
    });
  };

  const handleRemoveColor = (index: number) => {
    setColorList((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setStockQuantity(String(calculateTotalStock(next)));
      return next;
    });
    if (expandedColorIndex === index) {
      setExpandedColorIndex(null);
    }
  };

  const handleUpdateColorImage = (colorIndex: number, imageUrl: string) => {
    setColorList((prev) =>
      prev.map((col, idx) => (idx === colorIndex ? { ...col, image_url: imageUrl } : col))
    );
    if (imageUrl && !uploadedImages.includes(imageUrl)) {
      setUploadedImages((prev) => [...prev, imageUrl]);
    }
  };

  const handleAssignImageToColor = (imageUrl: string, colorName: string) => {
    if (!colorName) return;
    setColorList((prev) =>
      prev.map((col) => (col.name === colorName ? { ...col, image_url: imageUrl } : col))
    );
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
      const parsedEmbroideryPrice = parseFloat(embroideryPrice) >= 0 ? parseFloat(embroideryPrice) : 20;
      const computedStock = calculateTotalStock(colorList);
      const parsedStock = parseInt(stockQuantity, 10) || computedStock;
      const colorNames = colorList.map((c) => c.name);
      // Enregistre dans Supabase le tableau color_variants sous la forme : [{ name, hex, image_url, sizes }]
      const colorVariants: ColorVariant[] = colorList.map((c) => ({
        name: c.name,
        hex: c.hex,
        image_url: c.image_url || uploadedImages[0] || '/images/scrub-navy.jpg',
        sizes: c.sizes,
        in_stock: c.sizes.some((s) => s.active && s.stock > 0),
      }));

      // Tailles actives synchronisées
      const activeSizesAcrossColors = Array.from(
        new Set(colorList.flatMap((c) => c.sizes.filter((s) => s.active).map((s) => s.size)))
      );
      const finalSizes =
        activeSizesAcrossColors.length > 0 ? activeSizesAcrossColors : selectedSizes;

      // La liste images du produit doit contenir l'ensemble de ces URLs, avec en premier l'image de la couleur par défaut
      const orderedImages: string[] = [];
      if (colorVariants[0]?.image_url) {
        orderedImages.push(colorVariants[0].image_url);
      }
      colorVariants.slice(1).forEach((cv) => {
        if (cv.image_url && !orderedImages.includes(cv.image_url)) {
          orderedImages.push(cv.image_url);
        }
      });
      uploadedImages.forEach((img) => {
        if (img && !orderedImages.includes(img)) {
          orderedImages.push(img);
        }
      });
      const finalImages =
        orderedImages.length > 0 ? orderedImages : ['/images/scrub-navy.jpg'];

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
          embroidery_price: parsedEmbroideryPrice,
          category,
          stock_quantity: parsedStock,
          is_out_of_stock: isOutOfStock,
          colors: colorNames,
          sizes: finalSizes,
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
          embroidery_price: parsedEmbroideryPrice,
          category,
          stock_quantity: parsedStock,
          is_out_of_stock: isOutOfStock,
          colors: colorNames,
          sizes: finalSizes,
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
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-[#1B2A4A] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>Toutes les tenues</span>
            <span
              className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                categoryFilter === 'all' ? 'bg-white/20' : 'bg-slate-100'
              }`}
            >
              {products.length}
            </span>
          </button>
          {categories.map((cat) => {
            const count = products.filter(
              (p) => p.category === cat.slug || p.category.startsWith(cat.slug)
            ).length;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setCategoryFilter(cat.slug)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                  categoryFilter === cat.slug
                    ? 'bg-[#1B2A4A] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{cat.icon || '📁'}</span>
                <span>{cat.name}</span>
                <span
                  className={`ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                    categoryFilter === cat.slug ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700">
                        Catégorie <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                        className="text-[11px] font-bold text-sky-600 hover:text-sky-800 transition-colors cursor-pointer"
                      >
                        {isCreatingCategory ? '✕ Annuler' : '+ Créer'}
                      </button>
                    </div>

                    {!isCreatingCategory ? (
                      <select
                        value={category}
                        onChange={(e) => {
                          if (e.target.value === '__NEW__') {
                            setIsCreatingCategory(true);
                          } else {
                            setCategory(e.target.value);
                          }
                        }}
                        className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 sm:py-3 font-medium cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      >
                        {categories.map((cat) => (
                          <option key={cat.slug} value={cat.slug}>
                            {cat.icon || '📁'} {cat.name}
                          </option>
                        ))}
                        <option value="__NEW__" className="font-bold text-sky-600">
                          + Créer une nouvelle catégorie...
                        </option>
                      </select>
                    ) : (
                      <div className="bg-sky-50 border border-sky-200 rounded-xl p-2.5 space-y-2 animate-in fade-in duration-150">
                        <span className="text-[10px] font-bold text-sky-900 block leading-tight">
                          Nouveau rayon / catégorie :
                        </span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={newCategoryIcon}
                            onChange={(e) => setNewCategoryIcon(e.target.value)}
                            placeholder="Emoji"
                            className="w-10 text-center text-sm bg-white border border-slate-300 rounded-lg py-1.5"
                            title="Icône ou émoticône"
                          />
                          <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Ex: Cuisine, Hôtellerie..."
                            className="flex-1 text-xs bg-white border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCreateCategory();
                              }
                            }}
                          />
                          <button
                            type="button"
                            disabled={isSavingCategory || !newCategoryName.trim()}
                            onClick={handleCreateCategory}
                            className="bg-[#1B2A4A] hover:bg-[#111C32] disabled:opacity-50 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                          >
                            {isSavingCategory ? '...' : 'Ajouter'}
                          </button>
                        </div>
                        {categoryError && (
                          <p className="text-[10px] text-red-600 font-bold">{categoryError}</p>
                        )}
                      </div>
                    )}
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

                {/* Configuration Prix de la Broderie Personnalisée */}
                <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-3.5 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <label className="block font-bold text-[#1B2A4A] text-xs">
                        Prix de la broderie personnalisée (DH) <span className="text-red-500">*</span>
                      </label>
                      <p className="text-[10px] text-slate-500">
                        Tarif appliqué au prénom / fonction brodés sur la tenue
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative w-28">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={embroideryPrice}
                          onChange={(e) => setEmbroideryPrice(e.target.value)}
                          placeholder="20"
                          className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-[#1B2A4A] focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-right pr-9"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                          DH
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setEmbroideryPrice(embroideryPrice === '0' ? '45' : '0')}
                        className={`text-[11px] font-bold px-3 py-2 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                          embroideryPrice === '0'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                        title="Cliquer pour basculer entre 0 DH (Offerte) et 45 DH"
                      >
                        {embroideryPrice === '0' ? '✓ Broderie Offerte' : 'Offrir (0 DH)'}
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <span>💡</span>
                    <span>
                      <strong className="text-slate-700">Conseil :</strong> Mettre à <strong>0</strong> pour afficher le badge vert <span className="text-emerald-700 font-bold bg-emerald-100 px-1 py-0.2 rounded">OFFERTE (0 DH)</span> sur la fiche produit et ne rien facturer.
                    </span>
                  </p>
                </div>
              </div>

              {/* Section 2: Gestion du Stock Centralisé */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-sky-700 flex items-center gap-1.5">
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>2. Gestion des Stocks</span>
                  </h4>
                  <span className="text-[10px] font-bold text-sky-800 bg-sky-100 border border-sky-200 px-2 py-0.5 rounded-full">
                    Somme des variantes : {calculateTotalStock(colorList)} pcs
                  </span>
                </div>

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
                      Calculée automatiquement par la somme des tailles actives par couleur.
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
                    <span>3. Sélecteur de Tailles Général</span>
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

              {/* Section 4: Gestionnaire des Couleurs & Association Photos */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-sky-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>4. Couleurs Actives, Photos &amp; Stocks par Taille</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">Chaque couleur gère ses photos et ses tailles</span>
                </div>

                {/* Active Color Cards with Image Selector & Size/Stock Dropdown */}
                <div className="space-y-3">
                  {colorList.map((col, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-3 transition-colors hover:border-slate-300"
                    >
                      {/* Top Row: Color info + Linked Photo + Dropdown Trigger + Delete */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        {/* Left: Swatch + Name + Hex */}
                        <div className="flex items-center gap-2.5 min-w-[170px]">
                          <span
                            className="w-5 h-5 rounded-full border border-black/20 shadow-2xs shrink-0"
                            style={{ backgroundColor: col.hex }}
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 text-xs block leading-tight truncate">
                              {col.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {col.hex} {idx === 0 ? '• Défaut' : ''}
                            </span>
                          </div>
                        </div>

                        {/* Center: Linked Photo Selector */}
                        <div className="flex items-center gap-2 flex-1">
                          {col.image_url && (
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-300 shrink-0 bg-white shadow-2xs">
                              <Image
                                src={col.image_url}
                                alt={col.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <select
                            value={col.image_url || ''}
                            onChange={(e) => handleUpdateColorImage(idx, e.target.value)}
                            className="flex-1 text-xs bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                          >
                            <option value="">Attribuer une photo...</option>
                            {uploadedImages.map((imgUrl, imgIdx) => (
                              <option key={imgUrl} value={imgUrl}>
                                Photo {imgIdx + 1} {imgIdx === 0 ? '(Principale)' : ''} : {imgUrl.split('/').pop()}
                              </option>
                            ))}
                            {[
                              { name: 'Scrub Marine', url: '/images/scrub-navy.jpg' },
                              { name: 'Scrub Sauge', url: '/images/scrub-sage.jpg' },
                              { name: 'Scrub Bordeaux', url: '/images/scrub-burgundy.jpg' },
                              { name: 'Blouse Blanche', url: '/images/blouse-blanche.jpg' },
                              { name: 'Veste Polaire', url: '/images/veste-polaire.jpg' },
                            ]
                              .filter((p) => !uploadedImages.includes(p.url))
                              .map((p) => (
                                <option key={p.url} value={p.url}>
                                  + {p.name} ({p.url.split('/').pop()})
                                </option>
                              ))}
                          </select>
                        </div>

                        {/* Dropdown Toggle: Gérer tailles & stocks */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setExpandedColorIndex(expandedColorIndex === idx ? null : idx)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              expandedColorIndex === idx
                                ? 'bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-xs'
                                : 'bg-white hover:bg-sky-50 text-sky-800 border-sky-200 shadow-2xs'
                            }`}
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            <span>Gérer tailles &amp; stocks</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                                expandedColorIndex === idx
                                  ? 'bg-white/20 text-white'
                                  : 'bg-sky-100 text-sky-900'
                              }`}
                            >
                              {col.sizes.reduce((sum, s) => (s.active ? sum + (s.stock || 0) : sum), 0)} pcs
                            </span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                expandedColorIndex === idx ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          {/* Remove Color Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveColor(idx)}
                            className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            title="Supprimer cette couleur"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Collapsible Panel: Tailles et Stocks pour cette couleur */}
                      {expandedColorIndex === idx && (
                        <div className="pt-3 border-t border-slate-200 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                            <span className="font-bold text-slate-800 flex items-center gap-1">
                              <PackageCheck className="w-3.5 h-3.5 text-sky-600" />
                              <span>Tailles disponibles et stocks pour &laquo; {col.name} &raquo; :</span>
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Cochez pour activer • Renseignez le stock exact par taille
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                            {col.sizes.map((s) => {
                              const isOutOfStock = s.active && (s.stock === 0 || !s.stock);
                              return (
                                <div
                                  key={s.size}
                                  className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                                    !s.active
                                      ? 'bg-slate-100/80 border-slate-200 opacity-50'
                                      : isOutOfStock
                                      ? 'bg-red-50/70 border-red-200'
                                      : 'bg-white border-slate-200 shadow-2xs'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                      <input
                                        type="checkbox"
                                        checked={s.active}
                                        onChange={() => handleToggleColorSize(idx, s.size)}
                                        className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 cursor-pointer"
                                      />
                                      <span className="font-black text-xs text-slate-900">{s.size}</span>
                                    </label>
                                    <span
                                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                        !s.active
                                          ? 'bg-slate-200 text-slate-600'
                                          : isOutOfStock
                                          ? 'bg-red-100 text-red-700'
                                          : 'bg-emerald-100 text-emerald-800'
                                      }`}
                                    >
                                      {!s.active ? 'Inactive' : isOutOfStock ? 'Épuisé' : 'En stock'}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      min="0"
                                      disabled={!s.active}
                                      value={s.stock}
                                      onChange={(e) =>
                                        handleUpdateColorSizeStock(idx, s.size, parseInt(e.target.value, 10))
                                      }
                                      className={`w-full text-center py-1.5 text-xs font-bold rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-sky-500 ${
                                        !s.active
                                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                          : isOutOfStock
                                          ? 'bg-white text-red-700 border-red-300 font-black'
                                          : 'bg-slate-50 text-slate-900 border-slate-300'
                                      }`}
                                    />
                                    <span className="text-[10px] text-slate-400 shrink-0">pcs</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
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
                    placeholder="Nom couleur (ex: Vert Sauge, Gris Anthracite)"
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
                    <span>5. Photos du Produit &amp; Attribution aux Couleurs</span>
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

                {/* Uploaded Images Gallery Preview with Color Attribution Dropdown */}
                {uploadedImages.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] font-bold text-slate-700">
                        Photos du catalogue ({uploadedImages.length}) :
                      </p>
                      <span className="text-[10px] text-slate-400">
                        La 1ère photo correspond à la couleur par défaut
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {uploadedImages.map((url, idx) => {
                        const assignedColors = colorList.filter((c) => c.image_url === url);

                        return (
                          <div
                            key={idx}
                            className="group flex flex-col rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xs transition-all hover:border-slate-300"
                          >
                            <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
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

                            {/* Attribuer à la couleur Dropdown */}
                            <div className="p-2 bg-slate-50/90 border-t border-slate-100 space-y-1">
                              <label className="text-[10px] font-bold text-slate-600 block leading-tight">
                                Attribuer à la couleur :
                              </label>
                              <select
                                value={assignedColors[0]?.name || ''}
                                onChange={(e) => handleAssignImageToColor(url, e.target.value)}
                                className="w-full text-[11px] bg-white border border-slate-300 rounded-lg px-2 py-1 font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                              >
                                <option value="">[Sélectionner...]</option>
                                {colorList.map((c) => (
                                  <option key={c.name} value={c.name}>
                                    🎨 {c.name}
                                  </option>
                                ))}
                              </select>

                              {assignedColors.length > 0 && (
                                <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                                  {assignedColors.map((ac) => (
                                    <span
                                      key={ac.name}
                                      className="inline-flex items-center gap-1 text-[9px] font-semibold bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded"
                                    >
                                      <span
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: ac.hex }}
                                      />
                                      <span className="truncate max-w-[90px]">{ac.name}</span>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
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
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
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
