import supabase from 'lib/supabaseClient';

export async function createMembership(params: {
  gymId: string;
  customerId: string;
  planId: string;
  startDate?: string; // ISO date
  endDate?: string | null; // ISO date or null for auto based on plan
  autoRenew?: boolean;
}) {
  const { error, data } = await supabase
    .from('memberships')
    .insert({
      gym_id: params.gymId,
      customer_id: params.customerId,
      plan_id: params.planId,
      start_date: params.startDate ?? new Date().toISOString().slice(0, 10),
      end_date: params.endDate ?? null,
      auto_renew: params.autoRenew ?? true,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data!.id as string;
}
