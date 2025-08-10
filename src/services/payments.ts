import supabase from 'lib/supabaseClient';

export type PaymentMethod = 'cash' | 'card' | 'stripe' | 'paypal';

export async function createPayment(params: {
  gymId: string;
  customerId: string;
  membershipId?: string | null;
  amountDollars: number; // UI dollars, convert to cents
  method?: PaymentMethod;
  status?: 'pending' | 'paid' | 'failed' | 'refunded';
  paidAt?: string | null; // ISO
}) {
  const { error } = await supabase.from('payments').insert({
    gym_id: params.gymId,
    customer_id: params.customerId,
    membership_id: params.membershipId ?? null,
    amount_cents: Math.round(params.amountDollars * 100),
    currency: 'USD',
    method: params.method ?? 'cash',
    status: params.status ?? 'paid',
    paid_at: params.paidAt ?? new Date().toISOString(),
  });
  if (error) throw error;
}
