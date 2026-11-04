'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

export interface CodOrderInput {
  orderNumber: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  items: Array<{
    id: string;
    name: string;
    color: string;
    size: string;
    quantity: number;
    price: number;
    embroidery?: {
      enabled: boolean;
      fullName: string;
      speciality: string;
    };
  }>;
  customEmbroidery?: string;
  totalAmount: number;
  notes?: string;
}

export interface DbOrder {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  items: Array<{
    id: string;
    name: string;
    color: string;
    size: string;
    quantity: number;
    price: number;
    embroidery?: {
      enabled: boolean;
      fullName: string;
      speciality: string;
    };
  }>;
  custom_embroidery?: string | null;
  total_amount: number;
  status: 'nouveau' | 'confirmé' | 'expédié' | 'livré' | 'annulé';
  notes?: string | null;
  created_at: string;
}

/**
 * 1. Créer une commande Cash On Delivery (COD) dans Supabase
 */
import { appendOrderToSheet } from '@/lib/googleSheets';

export async function createCodOrderAction(data: CodOrderInput) {
  try {
    const supabase = createAdminClient();

    const orderPayload = {
      order_number: data.orderNumber,
      customer_name: data.customerName,
      phone: data.phone,
      city: data.city,
      address: data.address,
      items: data.items,
      custom_embroidery: data.customEmbroidery || null,
      total_amount: data.totalAmount,
      status: 'nouveau',
      notes: data.notes || null,
    };

    const { data: insertedOrder, error } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select()
      .single();

    if (error) {
      console.error('Erreur insertion commande Supabase:', error.message);
      return { success: false, error: error.message };
    }

    // Synchronisation automatique vers Google Sheets en arrière-plan
    try {
      appendOrderToSheet(insertedOrder).catch((e) =>
        console.warn('Sync Google Sheets non bloquante:', e)
      );
    } catch {
      // Ignorer
    }

    revalidatePath('/admin');
    revalidatePath('/admin/orders');
    return { success: true, order: insertedOrder as DbOrder };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Exception createCodOrderAction:', message);
    return { success: false, error: message };
  }
}

export interface ImportedOrderInput {
  orderNumber?: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  items?: any[];
  customEmbroidery?: string;
  totalAmount: number;
  status?: 'nouveau' | 'confirmé' | 'expédié' | 'livré' | 'annulé';
  notes?: string;
}

/**
 * Insère en masse des commandes importées depuis un fichier Excel ou CSV
 */
export async function importOrdersAction(
  rawOrders: ImportedOrderInput[]
): Promise<{ success: boolean; insertedCount: number; error?: string }> {
  try {
    const supabase = createAdminClient();

    if (!Array.isArray(rawOrders) || rawOrders.length === 0) {
      return { success: false, insertedCount: 0, error: 'Aucune commande valide à importer' };
    }

    const rowsToInsert = rawOrders.map((o, idx) => {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const year = new Date().getFullYear();
      const generatedOrderNumber = `BLS-${year}-IMP${randomSuffix}${idx}`;

      return {
        order_number: o.orderNumber?.trim() || generatedOrderNumber,
        customer_name: o.customerName.trim(),
        phone: o.phone.trim(),
        city: o.city.trim(),
        address: o.address.trim(),
        items: Array.isArray(o.items) && o.items.length > 0 ? o.items : [
          {
            name: 'Scrub Médical Pro (Import)',
            quantity: 1,
            price: Number(o.totalAmount || 0),
          },
        ],
        custom_embroidery: o.customEmbroidery?.trim() || null,
        total_amount: Number(o.totalAmount || 0),
        status: o.status || 'nouveau',
        notes: o.notes?.trim() || 'Importé via fichier Excel/CSV',
      };
    });

    const { data, error } = await supabase
      .from('orders')
      .insert(rowsToInsert)
      .select('id');

    if (error) {
      console.error('Erreur import commandes:', error.message);
      return { success: false, insertedCount: 0, error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath('/admin/orders');

    return { success: true, insertedCount: data?.length || rowsToInsert.length };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Exception importOrdersAction:', msg);
    return { success: false, insertedCount: 0, error: msg };
  }
}

/**
 * 2. Récupérer toutes les commandes avec tri décroissant en temps réel depuis Supabase
 * AUCUNE donnée fictive : si 0 commande, retourne un tableau vide []
 */
export async function getOrdersAction(): Promise<{ success: boolean; orders: DbOrder[]; error?: string }> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lecture commandes Supabase:', error.message);
      return { success: false, orders: [], error: error.message };
    }

    return { success: true, orders: (data || []) as DbOrder[] };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Exception getOrdersAction:', message);
    return { success: false, orders: [], error: message };
  }
}

/**
 * 3. Mettre à jour le statut d'une commande dans Supabase
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: 'nouveau' | 'confirmé' | 'expédié' | 'livré' | 'annulé'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.error('Erreur mise à jour statut commande:', error.message);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath('/admin/orders');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Exception updateOrderStatusAction:', message);
    return { success: false, error: message };
  }
}

/**
 * 4. Supprimer définitivement une commande de Supabase
 */
export async function deleteOrderAction(orderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error('Erreur suppression commande Supabase:', error.message);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath('/admin/orders');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Exception deleteOrderAction:', message);
    return { success: false, error: message };
  }
}

/**
 * 5. Statistiques réelles du Dashboard calculées depuis Supabase
 */
export async function getOrderStatsAction() {
  const { orders } = await getOrdersAction();

  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'annulé')
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  const pendingOrders = orders.filter((o) => o.status === 'nouveau').length;
  const toShipOrders = orders.filter((o) => o.status === 'confirmé').length;
  const deliveredOrders = orders.filter((o) => o.status === 'livré').length;
  const embroideryCount = orders.filter((o) => Boolean(o.custom_embroidery)).length;

  return {
    totalOrders,
    totalRevenue,
    pendingOrders,
    toShipOrders,
    deliveredOrders,
    embroideryCount,
  };
}
