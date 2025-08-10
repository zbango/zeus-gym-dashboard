import supabase from 'lib/supabaseClient';

export type ProgressEventType = 'measurement' | 'performance' | 'note' | 'photo';

export async function createProgressEvent(params: {
  gymId: string;
  customerId: string;
  staffId?: string | null;
  measuredAt?: string; // ISO
  notes?: string | null;
  metrics?: Record<string, unknown> | null; // flexible payload
  eventType?: ProgressEventType;
}) {
  const { error } = await supabase.from('progress_events').insert({
    gym_id: params.gymId,
    customer_id: params.customerId,
    staff_id: params.staffId ?? null,
    measured_at: params.measuredAt ?? new Date().toISOString(),
    notes: params.notes ?? null,
    metrics: params.metrics ?? null,
    event_type: params.eventType ?? 'measurement',
  });
  if (error) throw error;
}
