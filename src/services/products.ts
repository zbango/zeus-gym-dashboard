import type { ProductRow } from 'hooks/useProducts';
import supabase from 'lib/supabaseClient';

export async function createProduct(params: {
  gymId: string;
  sku?: string | null;
  name: string;
  description?: string | null;
  price_cents: number;
  cost_cents?: number | null;
  active?: boolean;
  initial_stock?: number; // optional initial stock (creates stock movements or direct adjustment)
}) {
  const { gymId, initial_stock, ...rest } = params;
  const { data, error } = await supabase
    .from('store_products')
    .insert([{ gym_id: gymId, active: true, ...rest }])
    .select('id')
    .single();
  if (error) throw error;
  const productId = data?.id as string;
  if (initial_stock && initial_stock > 0) {
    // Use a purchase movement to set initial stock
    const { error: e2 } = await supabase.from('store_stock_movements').insert([
      {
        gym_id: gymId,
        product_id: productId,
        movement_type: 'in',
        quantity: initial_stock,
        reason: 'purchase',
      },
    ]);
    if (e2) throw e2;
  }
  return productId;
}

export async function updateProduct(
  id: string,
  updates: Partial<Omit<ProductRow, 'id' | 'gym_id'>>,
) {
  const { error } = await supabase.from('store_products').update(updates).eq('id', id);
  if (error) throw error;
}

export async function softDeleteProduct(id: string) {
  const { error } = await supabase.from('store_products').update({ active: false }).eq('id', id);
  if (error) throw error;
}
