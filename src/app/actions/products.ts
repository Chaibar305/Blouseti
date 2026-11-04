'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { PRODUCTS } from '@/data/products';

export interface ColorVariant {
  name: string;
  hex: string;
  in_stock: boolean;
}

export interface SizeVariant {
  size: string;
  stock: number;
}

export interface DbProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  long_description?: string;
  price: number;
  promo_price?: number | null;
  category: string;
  stock_quantity: number;
  is_out_of_stock: boolean;
  colors: string[];
  sizes: string[];
  images: string[];
  color_variants?: ColorVariant[];
  size_variants?: SizeVariant[];
  is_active: boolean;
  created_at: string;
}

// Fallback products populated with sensible default stock
let fallbackProducts: DbProduct[] = PRODUCTS.map((p, idx) => ({
  id: p.id,
  title: p.name,
  slug: p.id,
  description: p.description,
  long_description: `${p.description}\n\n• Composition : 72% Polyester, 21% Rayonne, 7% Élasthanne.\n• Tissu technique 4-Way Stretch respirant, ultra-souple et infroissable.\n• Conseils d'entretien : Lavage en machine recommandé à 40°C-60°C. Séchage rapide, repassage superflu.`,
  price: p.price,
  promo_price: p.originalPrice || null,
  category: p.category,
  stock_quantity: idx === 1 ? 4 : 25, // Mock low stock on one item
  is_out_of_stock: false,
  colors: p.colors.map((c) => c.name),
  sizes: p.sizes,
  images: p.colors.map((c) => c.image),
  color_variants: p.colors.map((c) => ({
    name: c.name,
    hex: c.hex,
    in_stock: true,
  })),
  size_variants: p.sizes.map((s) => ({
    size: s,
    stock: 5,
  })),
  is_active: true,
  created_at: new Date().toISOString(),
}));

/**
 * Récupère tous les produits avec valeurs par défaut pour les nouvelles colonnes
 */
export async function getDbProductsAction(): Promise<{ success: boolean; products: DbProduct[] }> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return { success: true, products: fallbackProducts };
    }

    // Map rows to guarantee all properties exist even if table hasn't been altered yet
    const normalized = data.map((item: any) => ({
      ...item,
      stock_quantity: item.stock_quantity ?? 20,
      is_out_of_stock: item.is_out_of_stock ?? false,
      promo_price: item.promo_price ?? null,
      long_description: item.long_description || item.description || '',
      color_variants: item.color_variants || [],
      size_variants: item.size_variants || [],
      colors: item.colors || [],
      sizes: item.sizes || [],
      images: item.images || [],
    }));

    return { success: true, products: normalized as DbProduct[] };
  } catch (err) {
    console.warn('Could not query Supabase products:', err);
    return { success: true, products: fallbackProducts };
  }
}

/**
 * Créer un nouveau produit
 */
export async function createProductAction(product: Omit<DbProduct, 'id' | 'created_at'>) {
  try {
    const supabase = createAdminClient();

    const payload = {
      title: product.title,
      slug: product.slug,
      description: product.description,
      long_description: product.long_description || product.description,
      price: product.price,
      promo_price: product.promo_price || null,
      category: product.category,
      stock_quantity: product.stock_quantity ?? 20,
      is_out_of_stock: product.is_out_of_stock ?? false,
      colors: product.colors,
      sizes: product.sizes,
      images: product.images,
      color_variants: product.color_variants || [],
      size_variants: product.size_variants || [],
      is_active: product.is_active ?? true,
    };

    const { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.warn('Supabase insert warning, saving locally:', error.message);
      const mockItem: DbProduct = {
        ...payload,
        id: `prod-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      fallbackProducts.unshift(mockItem);
      revalidatePath('/admin/products');
      revalidatePath('/admin');
      revalidatePath('/');
      return { success: true, product: mockItem };
    }

    revalidatePath('/admin/products');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, product: data };
  } catch (err) {
    console.error('Error creating product:', err);
    const mockItem: DbProduct = {
      ...product,
      id: `prod-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    fallbackProducts.unshift(mockItem);
    revalidatePath('/admin/products');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, product: mockItem };
  }
}

/**
 * Mettre à jour un produit existant (Édition)
 */
export async function updateProductAction(id: string, product: Partial<Omit<DbProduct, 'id' | 'created_at'>>) {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();

    // Mettre à jour fallback
    fallbackProducts = fallbackProducts.map((p) =>
      p.id === id ? { ...p, ...product } : p
    );

    if (error) {
      console.warn('Supabase update warning, updating local fallback:', error.message);
    }

    revalidatePath('/admin/products');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, product: data || fallbackProducts.find((p) => p.id === id) };
  } catch (err) {
    console.error('Error updating product:', err);
    fallbackProducts = fallbackProducts.map((p) =>
      p.id === id ? { ...p, ...product } : p
    );
    revalidatePath('/admin/products');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, product: fallbackProducts.find((p) => p.id === id) };
  }
}

/**
 * Supprimer définitivement un produit
 */
export async function deleteProductAction(id: string) {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('products').delete().eq('id', id);

    fallbackProducts = fallbackProducts.filter((p) => p.id !== id);

    if (error) {
      console.warn('Supabase delete warning:', error.message);
    }

    revalidatePath('/admin/products');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error('Error deleting product:', err);
    fallbackProducts = fallbackProducts.filter((p) => p.id !== id);
    revalidatePath('/admin/products');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  }
}

/**
 * Switch Visibilité (Actif / Inactif)
 */
export async function toggleProductVisibilityAction(id: string, is_active: boolean) {
  return updateProductAction(id, { is_active });
}

// Alias de compatibilité
export async function toggleProductActiveAction(id: string, is_active: boolean) {
  return toggleProductVisibilityAction(id, is_active);
}

/**
 * Mise à jour rapide du stock
 */
export async function updateStockAction(id: string, stock_quantity: number, is_out_of_stock?: boolean) {
  const updateData: Partial<DbProduct> = {
    stock_quantity,
    is_out_of_stock: is_out_of_stock !== undefined ? is_out_of_stock : stock_quantity <= 0,
  };
  return updateProductAction(id, updateData);
}

/**
 * Upload d'une image de produit vers Supabase Storage (bucket 'products')
 */
export async function uploadProductImageAction(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'Aucun fichier sélectionné' };
    }

    // Valider le type MIME
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Format invalide. Formats acceptés : PNG, JPG, JPEG, WEBP.' };
    }

    const supabase = createAdminClient();
    const ext = file.name.split('.').pop() || 'jpg';
    const cleanFileName = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const filePath = `catalog/${cleanFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      return { success: false, error: uploadError.message };
    }

    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return { success: true, url: urlData.publicUrl };
  } catch (err: any) {
    console.error('Upload action exception:', err);
    return { success: false, error: err.message || 'Erreur lors de l\'upload de l\'image' };
  }
}

