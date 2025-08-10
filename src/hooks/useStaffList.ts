import supabase from 'lib/supabaseClient';
import useSWR from 'swr';

export type StaffRow = {
  id: string;
  name: string | null;
  role: string | null;
  phone: string | null;
  email: string | null;
  created_at?: string | null;
};

export const getStaffSWRKey = () => 'staff:list';

export function useStaffList(limit = 100) {
  return useSWR<StaffRow[]>(
    getStaffSWRKey(),
    async () => {
      const { data, error } = await supabase
        .from('staff')
        .select('id,name,role,phone,email,created_at')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as unknown as StaffRow[];
    },
    { revalidateOnFocus: false },
  );
}

export function addStaffOptimistic(newRow: StaffRow) {
  const key = getStaffSWRKey();
  // SWR mutation helper is used from the component via useSWRConfig
  return { key, newRow };
}
