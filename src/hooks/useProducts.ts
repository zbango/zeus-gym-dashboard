import supabase from 'lib/supabaseClient';
import useSWR from 'swr';

export type ProductRow = {
  id: string;
  gym_id: string;
  sku: string | null;
  name: string;
  description: string | null;
  price_cents: number;
  cost_cents: number | null;
  active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  on_hand?: number; // joined from view
};

export const getProductsSWRKey = () => 'store:products:list';

export function useProducts(limit = 200) {
  return useSWR<ProductRow[]>(
    getProductsSWRKey(),
    async () => {
      const [{ data: products, error: e1 }, { data: stockRows, error: e2 }] = await Promise.all([
        supabase
          .from('store_products')
          .select(
            'id,gym_id,sku,name,description,price_cents,cost_cents,active,created_at,updated_at',
          )
          .order('created_at', { ascending: false })
          .limit(limit),
        supabase.from('store_product_current_stock').select('product_id,on_hand'),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      const productIdToStock = new Map<string, number>();
      (stockRows ?? []).forEach((r: any) => productIdToStock.set(r.product_id, r.on_hand));
      return (products ?? []).map((p) => ({
        ...p,
        on_hand: productIdToStock.get(p.id) ?? 0,
      })) as ProductRow[];
    },
    { revalidateOnFocus: false },
  );
}
