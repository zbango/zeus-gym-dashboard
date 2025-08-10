import type { StaffRow } from 'hooks/useStaffList';
import supabase from 'lib/supabaseClient';

export async function createStaffViaEdge(params: {
  email: string;
  name: string;
  phone?: string | null;
  password?: string | null;
  role: string;
  gymId: string;
}) {
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-create-user-and-provision`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        email: params.email,
        name: params.name,
        phone: params.phone ?? null,
        password: params.password ?? null,
        role: params.role,
        gym: params.gymId,
      }),
    },
  );
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as { staff?: StaffRow };
}

export async function updateStaff(
  id: string,
  updates: Partial<Pick<StaffRow, 'name' | 'phone' | 'role'>>,
) {
  const { error } = await supabase.from('staff').update(updates).eq('id', id);
  if (error) throw error;
}

export async function softDeleteStaff(id: string) {
  const { error } = await supabase.from('staff').update({ active: false }).eq('id', id);
  if (error) throw error;
}
