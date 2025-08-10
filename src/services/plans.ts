import supabase from 'lib/supabaseClient';

export type PlanRow = {
  id: string;
  gym_id: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  interval: 'day' | 'week' | 'month' | 'year' | 'pack';
  duration_days: number | null;
  max_classes_per_period: number | null;
  active: boolean;
  created_at: string;
};

export async function createPlan(
  gymId: string,
  payload: Omit<PlanRow, 'id' | 'gym_id' | 'created_at' | 'currency'>,
) {
  const { error } = await supabase
    .from('plans')
    .insert({ ...payload, gym_id: gymId, currency: 'USD' });
  if (error) throw error;
}

export async function updatePlan(
  id: string,
  updates: Partial<Omit<PlanRow, 'id' | 'gym_id' | 'created_at'>>,
) {
  const { error } = await supabase.from('plans').update(updates).eq('id', id);
  if (error) throw error;
}

export async function softDeletePlan(id: string) {
  const { error } = await supabase.from('plans').update({ active: false }).eq('id', id);
  if (error) throw error;
}
