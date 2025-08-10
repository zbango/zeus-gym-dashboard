import supabase from 'lib/supabaseClient';
import useSWR from 'swr';

export type PlanListRow = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  interval: 'day' | 'week' | 'month' | 'year' | 'pack';
  duration_days: number | null;
  max_classes_per_period: number | null;
  active: boolean;
  created_at: string;
};

export const getPlansSWRKey = () => 'plans:list';

export function usePlans(limit = 100) {
  return useSWR<PlanListRow[]>(
    getPlansSWRKey(),
    async () => {
      const { data, error } = await supabase
        .from('plans')
        .select(
          'id,name,description,price_cents,interval,duration_days,max_classes_per_period,active,created_at',
        )
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as unknown as PlanListRow[];
    },
    { revalidateOnFocus: false },
  );
}
