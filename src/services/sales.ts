import supabase from 'lib/supabaseClient';

export type CartItemInput = {
  product_id: string;
  quantity: number;
  unit_price_cents: number;
};

export async function createDraftSale(params: {
  gym_id: string;
  customer_id?: string | null;
  discount_cents?: number;
  payment_method?: string | null;
}) {
  const { data, error } = await supabase
    .from('store_sales')
    .insert([
      {
        gym_id: params.gym_id,
        customer_id: params.customer_id ?? null,
        status: 'draft',
        discount_cents: params.discount_cents ?? 0,
        payment_method: params.payment_method ?? null,
      },
    ])
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function upsertSaleItems(gym_id: string, sale_id: string, items: CartItemInput[]) {
  if (!items.length) return;
  const rows = items.map((it) => ({
    gym_id,
    sale_id,
    product_id: it.product_id,
    quantity: it.quantity,
    unit_price_cents: it.unit_price_cents,
  }));
  const { error } = await supabase.from('store_sale_items').insert(rows);
  if (error) throw error;
}

export async function setSaleDiscount(sale_id: string, discount_cents: number) {
  const { error } = await supabase.from('store_sales').update({ discount_cents }).eq('id', sale_id);
  if (error) throw error;
}

export async function paySale(sale_id: string, payment_method?: string | null) {
  const { error } = await supabase
    .from('store_sales')
    .update({
      status: 'paid',
      payment_method: payment_method ?? null,
      paid_at: new Date().toISOString(),
    })
    .eq('id', sale_id);
  if (error) throw error;
}
