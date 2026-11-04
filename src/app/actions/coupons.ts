'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { DbCoupon } from '@/types';

export interface CreateCouponInput {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  max_uses?: number | null;
  expires_at?: string | null;
  is_active?: boolean;
}

export interface CouponValidationResult {
  success: boolean;
  message?: string;
  discountAmount?: number;
  coupon?: {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_order_amount: number;
  };
}

/**
 * Valide un code promo côté serveur et calcule la réduction exacte
 */
export async function validateCoupon(
  code: string,
  cartTotal: number
): Promise<CouponValidationResult> {
  try {
    const cleanCode = (code || '').trim().toUpperCase();

    if (!cleanCode) {
      return { success: false, message: 'Veuillez saisir un code promo' };
    }

    if (cartTotal <= 0) {
      return { success: false, message: 'Le montant du panier doit être supérieur à 0 DH' };
    }

    const supabase = createAdminClient();
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', cleanCode)
      .single();

    if (error || !coupon) {
      return { success: false, message: 'Code promo invalide ou inexistant' };
    }

    // 1. Vérifier si le code est actif
    if (!coupon.is_active) {
      return { success: false, message: 'Ce code promo est actuellement inactif' };
    }

    // 2. Vérifier la date d'expiration
    if (coupon.expires_at) {
      const expirationDate = new Date(coupon.expires_at);
      if (expirationDate.getTime() < Date.now()) {
        return { success: false, message: 'Ce code promo a expiré' };
      }
    }

    // 3. Vérifier le quota d'utilisations
    if (coupon.max_uses !== null && coupon.max_uses !== undefined) {
      if ((coupon.used_count || 0) >= coupon.max_uses) {
        return {
          success: false,
          message: 'Ce code promo a atteint sa limite maximale d’utilisations',
        };
      }
    }

    // 4. Vérifier le montant minimum de commande
    const minAmount = Number(coupon.min_order_amount || 0);
    if (minAmount > 0 && cartTotal < minAmount) {
      return {
        success: false,
        message: `Montant minimum requis pour ce code : ${minAmount} DH (Votre panier : ${cartTotal} DH)`,
      };
    }

    // 5. Calculer le montant exact de la remise
    const discountVal = Number(coupon.discount_value);
    let discountAmount = 0;

    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.round((cartTotal * discountVal) / 100);
      discountAmount = Math.min(discountAmount, cartTotal);
    } else {
      // Montant fixe en DH
      discountAmount = Math.min(discountVal, cartTotal);
    }

    return {
      success: true,
      discountAmount,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: discountVal,
        min_order_amount: minAmount,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Exception validateCoupon:', msg);
    return { success: false, message: 'Erreur lors de la validation du code promo' };
  }
}

/**
 * Incrémente le compteur d'utilisation d'un coupon
 */
export async function incrementCouponUsage(couponIdOrCode: string): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      couponIdOrCode
    );

    const query = supabase.from('coupons').select('id, used_count');
    const { data: coupon, error } = isUuid
      ? await query.eq('id', couponIdOrCode).single()
      : await query.eq('code', couponIdOrCode.trim().toUpperCase()).single();

    if (error || !coupon) {
      console.warn('Coupon non trouvé pour incrémentation:', couponIdOrCode);
      return false;
    }

    const { error: updateError } = await supabase
      .from('coupons')
      .update({
        used_count: (coupon.used_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', coupon.id);

    if (updateError) {
      console.error('Erreur incrément coupon:', updateError.message);
      return false;
    }

    return true;
  } catch (err: unknown) {
    console.error('Exception incrementCouponUsage:', err);
    return false;
  }
}

/**
 * Récupère tous les codes promo (Espace Admin)
 */
export async function getCouponsAction(): Promise<{
  success: boolean;
  coupons: DbCoupon[];
  error?: string;
}> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur getCouponsAction:', error.message);
      return { success: false, coupons: [], error: error.message };
    }

    return { success: true, coupons: (data || []) as DbCoupon[] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, coupons: [], error: msg };
  }
}

/**
 * Crée un nouveau code promo
 */
export async function createCouponAction(
  data: CreateCouponInput
): Promise<{ success: boolean; coupon?: DbCoupon; error?: string }> {
  try {
    const supabase = createAdminClient();

    const cleanCode = (data.code || '').trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 2) {
      return { success: false, error: 'Le code promo doit contenir au moins 2 caractères' };
    }

    if (data.discount_value <= 0) {
      return { success: false, error: 'La valeur de réduction doit être supérieure à 0' };
    }

    if (data.discount_type === 'percentage' && data.discount_value > 100) {
      return { success: false, error: 'Le pourcentage de remise ne peut pas dépasser 100%' };
    }

    // Vérifier l'unicité
    const { data: existing } = await supabase
      .from('coupons')
      .select('id')
      .eq('code', cleanCode)
      .maybeSingle();

    if (existing) {
      return { success: false, error: `Le code promo "${cleanCode}" existe déjà.` };
    }

    const payload = {
      code: cleanCode,
      discount_type: data.discount_type,
      discount_value: Number(data.discount_value),
      min_order_amount: Number(data.min_order_amount || 0),
      max_uses: data.max_uses ? Number(data.max_uses) : null,
      used_count: 0,
      expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
      is_active: data.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
      .from('coupons')
      .insert(payload)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/coupons');
    return { success: true, coupon: inserted as DbCoupon };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

/**
 * Modifie un code promo existant
 */
export async function updateCouponAction(
  id: string,
  data: Partial<CreateCouponInput>
): Promise<{ success: boolean; coupon?: DbCoupon; error?: string }> {
  try {
    const supabase = createAdminClient();

    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (data.code !== undefined) {
      payload.code = data.code.trim().toUpperCase();
    }
    if (data.discount_type !== undefined) {
      payload.discount_type = data.discount_type;
    }
    if (data.discount_value !== undefined) {
      payload.discount_value = Number(data.discount_value);
    }
    if (data.min_order_amount !== undefined) {
      payload.min_order_amount = Number(data.min_order_amount || 0);
    }
    if (data.max_uses !== undefined) {
      payload.max_uses = data.max_uses ? Number(data.max_uses) : null;
    }
    if (data.expires_at !== undefined) {
      payload.expires_at = data.expires_at ? new Date(data.expires_at).toISOString() : null;
    }
    if (data.is_active !== undefined) {
      payload.is_active = data.is_active;
    }

    const { data: updated, error } = await supabase
      .from('coupons')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/coupons');
    return { success: true, coupon: updated as DbCoupon };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

/**
 * Supprime un code promo
 */
export async function deleteCouponAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('coupons').delete().eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

/**
 * Active ou désactive rapidement un code promo
 */
export async function toggleCouponAction(
  id: string,
  currentStatus: boolean
): Promise<{ success: boolean; is_active?: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();
    const newStatus = !currentStatus;

    const { error } = await supabase
      .from('coupons')
      .update({ is_active: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/coupons');
    return { success: true, is_active: newStatus };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}
