'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { Category } from '@/types';
import { FALLBACK_CATEGORIES } from '@/data/categories';

/**
 * Récupère toutes les catégories actives triées par ordre d'affichage (display_order)
 */
export async function getCategoriesAction(): Promise<{ success: boolean; categories: Category[] }> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return { success: true, categories: FALLBACK_CATEGORIES };
    }

    return { success: true, categories: data as Category[] };
  } catch (err) {
    console.warn('Could not query Supabase categories, using fallback:', err);
    return { success: true, categories: FALLBACK_CATEGORIES };
  }
}

/**
 * Ajoute une nouvelle catégorie de produit à la volée
 */
export async function addCategoryAction(params: {
  name: string;
  slug?: string;
  icon?: string;
  description?: string;
}): Promise<{ success: boolean; category?: Category; error?: string }> {
  try {
    const supabase = createAdminClient();
    const name = params.name.trim();
    if (!name) {
      return { success: false, error: 'Le nom de la catégorie est obligatoire' };
    }

    // Auto-generate slug if not provided
    const slug = (
      params.slug?.trim() ||
      name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    );

    // Compute next display_order
    const { data: lastCat } = await supabase
      .from('categories')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = (lastCat?.[0]?.display_order ?? 5) + 1;

    const newCategoryPayload = {
      name,
      slug,
      icon: params.icon?.trim() || '👔',
      description: params.description?.trim() || `Vêtements et tenues ${name}`,
      display_order: nextOrder,
      is_active: true,
    };

    const { data, error } = await supabase
      .from('categories')
      .insert(newCategoryPayload)
      .select()
      .single();

    if (error) {
      console.warn('Supabase insert category error:', error.message);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/products');
    revalidatePath('/admin');
    revalidatePath('/');

    return { success: true, category: data as Category };
  } catch (err: any) {
    console.error('Error in addCategoryAction:', err);
    return { success: false, error: err.message || "Erreur lors de l'ajout de la catégorie" };
  }
}

// Aliases matching user request specifications: getCategories() and addCategory()
export async function getCategories() {
  return getCategoriesAction();
}

export async function addCategory(name: string, slug?: string, icon?: string) {
  return addCategoryAction({ name, slug, icon });
}

