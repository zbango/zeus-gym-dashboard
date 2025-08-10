import supabase from 'lib/supabaseClient';
import useSWR from 'swr';

export type CustomerRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  identification: string | null;
  created_at: string;
};

export const getCustomersSWRKey = () => 'customers:list';

export function useCustomers(limit = 100) {
  return useSWR<CustomerRow[]>(
    getCustomersSWRKey(),
    async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id,first_name,last_name,email,phone,identification,created_at')
        .is('archived_at', null)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as unknown as CustomerRow[];
    },
    { revalidateOnFocus: false },
  );
}
