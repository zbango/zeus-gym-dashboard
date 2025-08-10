import supabase from 'lib/supabaseClient';

export type NewCustomer = {
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  identification?: string | null;
  dob?: string | null; // ISO date
  notes?: string | null;
};

export async function createCustomer(gymId: string, payload: NewCustomer) {
  const { data, error } = await supabase
    .from('customers')
    .insert({ gym_id: gymId, ...payload })
    .select('id')
    .single();
  if (error) throw error;
  return data!.id as string;
}

export async function softDeleteCustomer(id: string) {
  const { error } = await supabase
    .from('customers')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}
